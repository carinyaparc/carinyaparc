import { describe, it, expect } from 'vitest';
import { contactFormSchema } from './contact-schema';

const validFormData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+61412345678',
  inquiryType: 'tours' as const,
  message: 'I am interested in booking a farm tour for two people in December.',
  website: '',
  submissionTime: 5000,
};

describe('contactFormSchema', () => {
  it('accepts valid form data', () => {
    expect(contactFormSchema.safeParse(validFormData).success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = contactFormSchema.safeParse({
      email: 'jane@example.com',
      message: 'Too short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = contactFormSchema.safeParse({
      ...validFormData,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects messages under 50 characters', () => {
    const result = contactFormSchema.safeParse({
      ...validFormData,
      message: 'Too short',
    });
    expect(result.success).toBe(false);
  });
});
