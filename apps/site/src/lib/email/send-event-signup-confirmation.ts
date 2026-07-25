/**
 * Optional confirmation email for event signups.
 * Recording the registration is the source of truth; email failure must not
 * roll back a successful signup (confirmation is shown and/or emailed).
 */

import { Resend } from 'resend';

import {
  generateEventSignupConfirmationEmail,
  generateEventSignupConfirmationText,
  type EventSignupConfirmationInput,
} from './templates/event-signup-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key_for_build');

export type EmailSendResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendEventSignupConfirmation(
  data: EventSignupConfirmationInput,
): Promise<EmailSendResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service is not configured' };
  }

  const fromEmail = process.env.CONTACT_EMAIL_FROM || 'noreply@carinyaparc.com.au';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const result = await resend.emails.send({
        from: `Carinya Parc <${fromEmail}>`,
        to: data.email,
        subject: `You're signed up: ${data.eventTitle}`,
        html: generateEventSignupConfirmationEmail(data),
        text: generateEventSignupConfirmationText(data),
        tags: [{ name: 'source', value: 'event_signup' }],
      });

      clearTimeout(timeoutId);

      if (result.error) {
        console.error('Resend API error (event signup):', result.error);
        return { success: false, error: 'Failed to send confirmation email' };
      }

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Email service timeout' };
      }

      throw error;
    }
  } catch (error) {
    console.error('Failed to send event signup confirmation:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}
