/**
 * Unit tests for Contact API Route
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencies
vi.mock('@/src/lib/email/send-contact-notification', () => ({
  sendContactNotification: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
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

describe('Contact API Route', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.CONTACT_FORM_ENABLE = 'true';
    process.env.CONTACT_FORM_RATE_LIMITING = 'true';
    process.env.CONTACT_RATE_LIMIT_MAX = '3';
    process.env.CONTACT_RATE_LIMIT_WINDOW_HOURS = '24';
  });

  afterEach(() => {
    // Clear rate limit map between tests
    const rateLimitMap = (globalThis as { rateLimitMap?: Map<string, number[]> }).rateLimitMap;
    if (rateLimitMap) {
      rateLimitMap.clear();
    }
  });

  describe('successful submission', () => {
    it('should accept valid submission and return 200', async () => {
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
      expect(data.message).toContain('48 business hours');
      expect(sendContactNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          inquiryType: 'tours',
        }),
      );
    });
  });

  describe('validation errors', () => {
    it('should reject missing required fields with 400', async () => {
      const invalidData = {
        email: 'jane@example.com',
        message: 'Too short',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
      expect(sendContactNotification).not.toHaveBeenCalled();
    });

    it('should reject invalid email format with 400', async () => {
      const invalidData = {
        ...validFormData,
        email: 'not-an-email',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details.email).toBeDefined();
    });

    it('should reject message too short with 400', async () => {
      const invalidData = {
        ...validFormData,
        message: 'Too short',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details.message).toBeDefined();
    });

    it('should reject invalid phone format with 400', async () => {
      const invalidData = {
        ...validFormData,
        phone: '123-invalid',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.details.phone).toBeDefined();
    });
  });

  describe('spam detection', () => {
    it('should silently reject honeypot field filled (return 200)', async () => {
      vi.mocked(sendContactNotification).mockResolvedValue({
        success: true,
        messageId: 'msg_123',
      });

      const spamData = {
        ...validFormData,
        website: 'https://spamsite.com',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(spamData),
      });

      const response = await POST(request);
      const data = await response.json();

      // Silent rejection - returns success to avoid bot learning
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // But email should NOT be sent
      expect(sendContactNotification).not.toHaveBeenCalled();
    });

    it('should silently reject submission too fast (return 200)', async () => {
      vi.mocked(sendContactNotification).mockResolvedValue({
        success: true,
        messageId: 'msg_123',
      });

      const fastData = {
        ...validFormData,
        submissionTime: 1000, // Less than 2 seconds
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(fastData),
      });

      const response = await POST(request);
      const data = await response.json();

      // Silent rejection
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // But email should NOT be sent
      expect(sendContactNotification).not.toHaveBeenCalled();
    });

    it('should reject spam email patterns via Zod validation', async () => {
      const spamData = {
        ...validFormData,
        email: 'test@test.com', // Known spam pattern
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(spamData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details.email).toBeDefined();
    });
  });

  describe('rate limiting', () => {
    it('should allow up to 3 submissions per email per 24 hours', async () => {
      vi.mocked(sendContactNotification).mockResolvedValue({
        success: true,
        messageId: 'msg_123',
      });

      // First submission
      let request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });
      let response = await POST(request);
      expect(response.status).toBe(200);

      // Second submission
      request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });
      response = await POST(request);
      expect(response.status).toBe(200);

      // Third submission
      request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });
      response = await POST(request);
      expect(response.status).toBe(200);

      // Fourth submission - should be rate limited
      request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });
      response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit exceeded');
    });

    it('should skip rate limiting when disabled', async () => {
      process.env.CONTACT_FORM_RATE_LIMITING = 'false';

      vi.mocked(sendContactNotification).mockResolvedValue({
        success: true,
        messageId: 'msg_123',
      });

      // Make 5 submissions - all should succeed
      for (let i = 0; i < 5; i++) {
        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify(validFormData),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      expect(sendContactNotification).toHaveBeenCalledTimes(5);
    });
  });

  describe('email service errors', () => {
    it('should return 500 when email service fails', async () => {
      vi.mocked(sendContactNotification).mockResolvedValue({
        success: false,
        error: 'Email service timeout',
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to process your inquiry');
      expect(data.error).toContain('contact@carinyaparc.com.au');
    });

    it('should handle email service exceptions', async () => {
      vi.mocked(sendContactNotification).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('unexpected error occurred');
    });
  });

  describe('feature flags', () => {
    it('should return 503 when contact form is disabled', async () => {
      process.env.CONTACT_FORM_ENABLE = 'false';

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toContain('temporarily disabled');
      expect(sendContactNotification).not.toHaveBeenCalled();
    });
  });

  describe('invalid requests', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: 'not json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request format');
    });
  });
});
