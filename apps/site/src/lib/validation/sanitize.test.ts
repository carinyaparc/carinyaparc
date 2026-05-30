import { describe, it, expect } from 'vitest';
import { sanitizePlainText, sanitizeContactFormData } from './sanitize';

describe('sanitizePlainText', () => {
  it('strips script tags', () => {
    expect(sanitizePlainText('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('preserves plain text', () => {
    expect(sanitizePlainText('Hello from Carinya Parc')).toBe('Hello from Carinya Parc');
  });

  it('handles empty input', () => {
    expect(sanitizePlainText('')).toBe('');
  });
});

describe('sanitizeContactFormData', () => {
  it('sanitises user-supplied form fields', () => {
    const result = sanitizeContactFormData({
      firstName: 'Jane<script>',
      lastName: 'Smith',
      email: 'jane@example.com',
      message: 'Hello\nWorld',
      inquiryType: 'tours',
    });

    expect(result.firstName).toBe('Jane');
    expect(result.message).toContain('Hello');
  });
});
