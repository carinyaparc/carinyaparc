import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/src/lib/email/send-contact-notification', () => ({
  sendContactNotification: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'x-forwarded-for') return '192.168.1.1';
      if (key === 'user-agent') return 'Mozilla/5.0';
      return null;
    }),
  })),
}));

import { sendContactNotification } from '@/src/lib/email/send-contact-notification';

const validFormData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+61412345678',
  inquiryType: 'tours',
  message: 'I am interested in booking a farm tour for two people in December.',
  website: '',
  submissionTime: 5000,
};

describe('Contact API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CONTACT_FORM_ENABLE = 'true';
    process.env.CONTACT_FORM_RATE_LIMITING = 'false';
    process.env.RESEND_API_KEY = 'test-key';
  });

  it('accepts a valid submission', async () => {
    vi.mocked(sendContactNotification).mockResolvedValue({
      success: true,
      messageId: 'msg_123',
    });

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(validFormData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sendContactNotification).toHaveBeenCalledOnce();
  });

  it('rejects missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ email: 'jane@example.com', message: 'Too short' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it('rejects invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ ...validFormData, email: 'not-an-email' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it('returns 500 when email delivery fails', async () => {
    vi.mocked(sendContactNotification).mockResolvedValue({
      success: false,
      error: 'Resend error',
    });

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(validFormData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to process your inquiry');
  });
});
