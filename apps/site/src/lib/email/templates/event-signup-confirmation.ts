/**
 * Confirmation email copy for event signups (HTML + plain text).
 */

export type EventSignupConfirmationInput = {
  name: string;
  email: string;
  eventTitle: string;
  eventStartsAt: string;
  eventLocation: string;
};

function formatEventWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Australia/Sydney',
  }).format(new Date(iso));
}

export function generateEventSignupConfirmationEmail(data: EventSignupConfirmationInput): string {
  const when = formatEventWhen(data.eventStartsAt);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>You're signed up</title></head>
<body style="font-family: Georgia, serif; color: #2c2416; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>Hi ${data.name},</p>
  <p>You're signed up for <strong>${data.eventTitle}</strong>.</p>
  <p>
    <strong>When:</strong> ${when}<br>
    <strong>Where:</strong> ${data.eventLocation}
  </p>
  <p>We'll be in touch closer to the day with any details you need. Looking forward to seeing you on the land.</p>
  <p>— Carinya Parc</p>
</body>
</html>`;
}

export function generateEventSignupConfirmationText(data: EventSignupConfirmationInput): string {
  const when = formatEventWhen(data.eventStartsAt);

  return [
    `Hi ${data.name},`,
    '',
    `You're signed up for ${data.eventTitle}.`,
    '',
    `When: ${when}`,
    `Where: ${data.eventLocation}`,
    '',
    "We'll be in touch closer to the day with any details you need. Looking forward to seeing you on the land.",
    '',
    '— Carinya Parc',
  ].join('\n');
}
