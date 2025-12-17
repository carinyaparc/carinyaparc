/**
 * Contact Form API Route Handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { contactFormSchema } from '@/src/lib/validation/contact-schema';
import { sanitizeContactFormData } from '@/src/lib/validation/sanitize';
import { sendContactNotification } from '@/src/lib/email/send-contact-notification';
import { captureException } from '@sentry/nextjs';

// Rate limiting configuration
const RATE_LIMIT_MAX = parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '3', 10);
const RATE_LIMIT_WINDOW_HOURS = parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_HOURS || '24', 10);
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000;

// Feature flags
const CONTACT_FORM_ENABLE = process.env.CONTACT_FORM_ENABLE !== 'false';
const CONTACT_FORM_RATE_LIMITING = process.env.CONTACT_FORM_RATE_LIMITING !== 'false';

// In-memory rate limit store (following subscribe route pattern)
interface RateLimitRecord {
  count: number;
  lastAttempt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 24 hours to prevent memory leaks
if (typeof globalThis.contactRateLimitCleanup === 'undefined') {
  globalThis.contactRateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [email, record] of rateLimitMap.entries()) {
      if (now - record.lastAttempt > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(email);
      }
    }
  }, RATE_LIMIT_WINDOW_MS);
}

/**
 * POST /api/contact
 */
export async function POST(request: NextRequest) {
  try {
    // Check if contact form is enabled
    if (!CONTACT_FORM_ENABLE) {
      return NextResponse.json({ error: 'Contact form is temporarily disabled' }, { status: 503 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Server-side validation using Zod schema
    const validation = contactFormSchema.safeParse(body);

    if (!validation.success) {
      // Return structured Zod errors
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Spam detection checks
    if (data.website && data.website.length > 0) {
      // Silent rejection to avoid bot learning
      console.log('Contact form submission rejected: honeypot triggered');
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for your inquiry. We'll respond within 48 business hours.",
        },
        { status: 200 },
      );
    }

    if (data.submissionTime && data.submissionTime < 2000) {
      // Silent rejection to avoid bot learning
      console.log('Contact form submission rejected: too fast');
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for your inquiry. We'll respond within 48 business hours.",
        },
        { status: 200 },
      );
    }

    // Rate limiting
    if (CONTACT_FORM_RATE_LIMITING) {
      const now = Date.now();
      const rateLimitKey = data.email.toLowerCase();
      const existingRecord = rateLimitMap.get(rateLimitKey);

      if (existingRecord) {
        const timeSinceLastAttempt = now - existingRecord.lastAttempt;

        if (timeSinceLastAttempt < RATE_LIMIT_WINDOW_MS) {
          // Within rate limit window
          if (existingRecord.count >= RATE_LIMIT_MAX) {
            // Rate limit exceeded
            console.log(`Contact form rate limit exceeded for: ${data.email.split('@')[1]}`);
            return NextResponse.json(
              {
                error:
                  'Rate limit exceeded. This email address has already submitted an inquiry recently. Please try again in 24 hours.',
              },
              { status: 429 },
            );
          }

          // Increment count
          existingRecord.count++;
          existingRecord.lastAttempt = now;
        } else {
          // Window expired, reset count
          existingRecord.count = 1;
          existingRecord.lastAttempt = now;
        }
      } else {
        // First submission from this email
        rateLimitMap.set(rateLimitKey, {
          count: 1,
          lastAttempt: now,
        });
      }
    }

    // Get request metadata for email notification
    const headersList = await headers();
    const sourceIP = headersList.get('x-forwarded-for') || 'Unknown';
    const userAgent = headersList.get('user-agent') || 'Unknown';

    // Sanitize form data before sending email
    const sanitizedData = sanitizeContactFormData(data);

    // Send email notification
    const emailResult = await sendContactNotification({
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      inquiryType: data.inquiryType, // Use unsanitized for exact type match
      message: sanitizedData.message,
      website: data.website,
      submissionTime: data.submissionTime,
      sourceIP,
      userAgent,
    });

    if (!emailResult.success) {
      console.error('Failed to send contact notification email:', emailResult.error);

      // Capture to Sentry with context (but no PII)
      captureException(new Error(emailResult.error || 'Email send failed'), {
        tags: {
          feature: 'contact_form',
          inquiry_type: data.inquiryType,
        },
        extra: {
          email_domain: data.email.split('@')[1],
          error_message: emailResult.error,
        },
      });

      return NextResponse.json(
        {
          error:
            'Failed to process your inquiry. Please try again or contact us directly at contact@carinyaparc.com.au',
        },
        { status: 500 },
      );
    }

    console.log(
      `Contact form submitted successfully: ${data.inquiryType} inquiry from ${data.email.split('@')[1]}`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your inquiry. We'll respond within 48 business hours.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Unexpected error in contact API route:', error);

    captureException(error, {
      tags: {
        feature: 'contact_form',
        error_type: 'unexpected',
      },
    });

    return NextResponse.json(
      {
        error:
          'An unexpected error occurred. Please try again or contact us directly at contact@carinyaparc.com.au',
      },
      { status: 500 },
    );
  }
}

// Only accept POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// Export global type for cleanup interval
declare global {
  var contactRateLimitCleanup: NodeJS.Timeout | undefined;
}
