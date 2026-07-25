import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import {
  resolveSubscribeInterest,
  subscribeFormSchema,
  type SubscribeInterest,
} from '@/src/lib/validation/subscribe-schema';
import { isSpamEmail } from '@/src/lib/validation/spam-email';

// Simple in-memory rate limiting
// In production, you should use a Redis or other persistent store
interface RateLimitRecord {
  count: number;
  lastAttempt: number;
}

// Cache for rate limiting by email
const emailRateLimits = new Map<string, RateLimitRecord>();

// Rate limit configuration
const RATE_LIMIT = {
  EMAIL_MAX_REQUESTS: 1, // 1 request per email
  EMAIL_WINDOW_MS: 86400000, // 24 hours in milliseconds
  MIN_SUBMISSION_TIME_MS: 2000, // Minimum time to fill the form (2 seconds)
};

// Clean up rate limit caches periodically to prevent memory leaks
const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
setInterval(() => {
  const now = Date.now();

  // Clean up email rate limits older than 24 hours
  emailRateLimits.forEach((record, email) => {
    if (now - record.lastAttempt > cleanupInterval) {
      emailRateLimits.delete(email);
    }
  });
}, cleanupInterval);

// Check rate limit for a key against a cache
function checkRateLimit(
  cache: Map<string, RateLimitRecord>,
  key: string,
  maxRequests: number,
  windowMs: number,
): { limited: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now();
  const record = cache.get(key);

  // If no record exists or window has expired, create new record
  if (!record || now - record.lastAttempt > windowMs) {
    cache.set(key, { count: 1, lastAttempt: now });
    return {
      limited: false,
      remainingRequests: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Increment count
  record.count += 1;
  record.lastAttempt = now;

  // Check if over limit
  const limited = record.count > maxRequests;
  const remainingRequests = Math.max(0, maxRequests - record.count);
  const resetTime = record.lastAttempt + windowMs;

  // Update record
  cache.set(key, record);

  return { limited, remainingRequests, resetTime };
}

type MailerLiteFields = {
  name?: string;
  interest?: string;
  interests?: string;
  source?: string;
  [key: string]: string | undefined;
};

type MailerLiteSubscriberPayload = {
  email: string;
  fields?: MailerLiteFields;
};

/**
 * Build the MailerLite upsert body from validated subscribe input.
 * Persists canonical `interest` + `source` as custom fields; keeps `interests`
 * populated for existing MailerLite automations that still read that field.
 */
export function buildMailerLiteSubscriberPayload(input: {
  email: string;
  name?: string;
  interest?: SubscribeInterest;
  interests?: string;
  source?: string;
}): MailerLiteSubscriberPayload {
  const resolvedInterest = resolveSubscribeInterest(input.interest, input.interests);

  const fields: MailerLiteFields = {};

  if (input.name && input.name.trim() !== '') {
    fields.name = input.name;
  }

  if (resolvedInterest) {
    fields.interest = resolvedInterest;
    fields.interests = resolvedInterest;
  } else if (input.interests && input.interests !== '') {
    // Unknown legacy value — still forward so existing data is not dropped
    fields.interests = input.interests;
  }

  if (input.source && input.source.trim() !== '') {
    fields.source = input.source.trim();
  }

  const payload: MailerLiteSubscriberPayload = { email: input.email };
  if (Object.keys(fields).length > 0) {
    payload.fields = fields;
  }
  return payload;
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
    }

    const validation = subscribeFormSchema.safeParse(body);
    if (!validation.success) {
      const nameError = validation.error.issues.find((issue) => issue.path[0] === 'name');
      if (nameError) {
        return NextResponse.json({ error: nameError.message }, { status: 400 });
      }

      const sourceError = validation.error.issues.find((issue) => issue.path[0] === 'source');
      if (sourceError) {
        return NextResponse.json({ error: sourceError.message }, { status: 400 });
      }

      const interestError = validation.error.issues.find((issue) => issue.path[0] === 'interest');
      if (interestError) {
        return NextResponse.json({ error: interestError.message }, { status: 400 });
      }

      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    const { email, name, interest, interests, source, website, submissionTime } = validation.data;

    // 1. Check for honeypot field (should be empty)
    if (website) {
      // Return success to prevent the bot from knowing it was detected
      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'spam' },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 2. Check submission time when the client reports it (too fast means bot)
    if (typeof submissionTime === 'number' && submissionTime < RATE_LIMIT.MIN_SUBMISSION_TIME_MS) {
      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'spam' },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 3. Check for spam email patterns
    if (isSpamEmail(email)) {
      // Silently reject but report success
      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'spam' },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 4. Check email rate limit
    const emailLimitResult = checkRateLimit(
      emailRateLimits,
      email,
      RATE_LIMIT.EMAIL_MAX_REQUESTS,
      RATE_LIMIT.EMAIL_WINDOW_MS,
    );

    if (emailLimitResult.limited) {
      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'rate_limited' },
      });
      return NextResponse.json(
        { error: 'This email address has already been submitted recently.' },
        { status: 429 },
      );
    }

    // Check for API key
    if (!process.env.MAILERLITE_API_KEY) {
      console.error('MAILERLITE_API_KEY is not defined in environment variables');
      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'failed' },
      });
      return NextResponse.json(
        { error: 'Newsletter service not configured. Please add MAILERLITE_API_KEY to .env.local' },
        { status: 500 },
      );
    }

    // Per MailerLite docs: https://developers.mailerlite.com/docs/#authentication
    // Base URL is https://connect.mailerlite.com/api
    // We need to use Authorization: Bearer XXX header format
    try {
      const subscriberData = buildMailerLiteSubscriberPayload({
        email,
        name,
        interest,
        interests,
        source,
      });

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify(subscriberData),
      });

      // Get response data
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        data = { message: 'Failed to parse response' };
      }

      // Handle different response codes
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        if (data && data.message) {
          errorMessage = data.message;
        } else if (response.status === 401) {
          errorMessage = 'Invalid API key';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded';
        } else if (response.status === 422) {
          errorMessage = data.errors ? JSON.stringify(data.errors) : 'Validation error';
        }
        console.error('MailerLite API error:', errorMessage);
        Sentry.metrics.count('subscribe.submissions', 1, {
          attributes: { status: 'failed' },
        });
        return NextResponse.json(
          { error: `Subscription failed: ${errorMessage}` },
          { status: response.status },
        );
      }

      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'success' },
      });
      return NextResponse.json({ success: true });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      Sentry.metrics.count('subscribe.submissions', 1, {
        attributes: { status: 'failed' },
      });
      return NextResponse.json(
        { error: 'Network error. Please try again later.' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}
