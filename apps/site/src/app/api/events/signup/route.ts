/**
 * POST /api/events/signup — record a registration against a published event.
 * Security mirrors contact/subscribe: Zod, honeypot, timing, rate limit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@sentry/nextjs';

import { sendEventSignupConfirmation } from '@/features/events/email/send-event-signup-confirmation';
import { getPayloadClient } from '@/lib/payload/client';
import {
  countEventRegistrations,
  findEventRegistrationByEmail,
  getEventById,
  isEventAtCapacity,
} from '@/features/events/queries/events';
import { sanitizePlainText } from '@/lib/validation/sanitize';
import { eventSignupSchema } from '@/features/events/validation/event-signup-schema';
import { isSpamEmail } from '@/lib/validation/spam-email';

const RATE_LIMIT_MAX = parseInt(process.env.EVENT_SIGNUP_RATE_LIMIT_MAX || '5', 10);
const RATE_LIMIT_WINDOW_HOURS = parseInt(
  process.env.EVENT_SIGNUP_RATE_LIMIT_WINDOW_HOURS || '24',
  10,
);
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000;
const MIN_SUBMISSION_TIME_MS = 2000;

const EVENT_SIGNUP_RATE_LIMITING = process.env.EVENT_SIGNUP_RATE_LIMITING !== 'false';

interface RateLimitRecord {
  count: number;
  lastAttempt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

if (typeof globalThis.eventSignupRateLimitCleanup === 'undefined') {
  globalThis.eventSignupRateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.lastAttempt > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }, RATE_LIMIT_WINDOW_MS);
}

function checkEmailRateLimit(email: string): boolean {
  if (!EVENT_SIGNUP_RATE_LIMITING) {
    return false;
  }

  const now = Date.now();
  const key = email.toLowerCase();
  const existing = rateLimitMap.get(key);

  if (!existing || now - existing.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, lastAttempt: now });
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return true;
  }

  existing.count += 1;
  existing.lastAttempt = now;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const validation = eventSignupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Honeypot — silent success so bots do not learn
    if (data.website && data.website.length > 0) {
      return NextResponse.json(
        { success: true, message: "You're signed up — see you on the day." },
        { status: 200 },
      );
    }

    if (typeof data.submissionTime === 'number' && data.submissionTime < MIN_SUBMISSION_TIME_MS) {
      return NextResponse.json(
        { success: true, message: "You're signed up — see you on the day." },
        { status: 200 },
      );
    }

    // Schema refine also catches spam emails; belt-and-braces silent path
    if (isSpamEmail(data.email)) {
      return NextResponse.json(
        { success: true, message: "You're signed up — see you on the day." },
        { status: 200 },
      );
    }

    if (checkEmailRateLimit(data.email)) {
      return NextResponse.json(
        {
          error:
            'Rate limit exceeded. This email has already signed up for events recently. Please try again later.',
        },
        { status: 429 },
      );
    }

    const event = await getEventById(data.eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Past events should not accept new signups
    if (new Date(event.startsAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This event has already started' }, { status: 400 });
    }

    const name = sanitizePlainText(data.name);
    const email = sanitizePlainText(data.email).toLowerCase();

    const existing = await findEventRegistrationByEmail(event.id, email);
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          status: existing.status,
          message:
            existing.status === 'waitlisted'
              ? "You're on the waitlist for this event."
              : "You're already signed up for this event.",
        },
        { status: 200 },
      );
    }

    const registeredCount = await countEventRegistrations(event.id);
    const atCapacity = isEventAtCapacity(event, registeredCount);

    if (atCapacity) {
      return NextResponse.json(
        {
          error: 'This event is full',
          full: true,
          message: 'This event is full — join the waitlist via subscribe.',
        },
        { status: 409 },
      );
    }

    const payload = await getPayloadClient();

    try {
      await payload.create({
        collection: 'event-registrations',
        // Trusted server-side create; collection create access is admin-only.
        overrideAccess: true,
        data: {
          event: event.id,
          name,
          email,
          status: 'registered',
        },
      });
    } catch (error) {
      console.error('Failed to create event registration:', error);
      captureException(error, {
        tags: { feature: 'event_signup', error_type: 'persist' },
        extra: { event_id: event.id },
      });
      return NextResponse.json(
        { error: 'Failed to record your signup. Please try again.' },
        { status: 500 },
      );
    }

    // Confirmation email is best-effort — UI confirmation is the primary AC.
    const emailResult = await sendEventSignupConfirmation({
      name,
      email,
      eventTitle: event.title,
      eventStartsAt: event.startsAt,
      eventLocation: event.location,
    });

    if (!emailResult.success) {
      console.warn(
        `Event signup recorded but confirmation email failed for event ${event.id}: ${emailResult.error}`,
      );
    }

    console.log(`Event signup recorded for event ${event.id} (${email.split('@')[1]})`);

    return NextResponse.json(
      {
        success: true,
        status: 'registered',
        message: "You're signed up — see you on the day.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Unexpected error in event signup API:', error);
    captureException(error, {
      tags: { feature: 'event_signup', error_type: 'unexpected' },
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

declare global {
  var eventSignupRateLimitCleanup: NodeJS.Timeout | undefined;
}
