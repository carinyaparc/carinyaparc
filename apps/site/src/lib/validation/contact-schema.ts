/**
 * Contact form Zod validation schema
 */

import { z } from 'zod';

const SPAM_EMAIL_PATTERNS = [
  /test@test/i,
  /example@/i,
  /\d{8,}@/i,
  /@(example|test|temp|fake|invalid|localhost)/i,
  /[a-z0-9]{20,}@/i,
];

function isSpamEmail(email: string): boolean {
  return SPAM_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}

/**
 * Inquiry type options
 */
export const inquiryTypes = ['general', 'tours', 'volunteer', 'partnership'] as const;

/**
 * Contact form Zod schema
 * Single source of truth for client and server validation
 */
export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => !isSpamEmail(email), {
      message: 'This email address appears to be invalid',
    }),

  phone: z
    .string()
    .regex(/^(\+61|0)[0-9]{9}$/, 'Please enter a valid Australian phone number')
    .optional()
    .or(z.literal('')),

  inquiryType: z.enum(inquiryTypes),

  message: z
    .string()
    .min(50, 'Message must be at least 50 characters')
    .max(500, 'Message must be 500 characters or less'),

  // Honeypot field - should be empty to pass validation
  website: z.string().max(0, 'Invalid submission').optional().or(z.literal('')),

  // Submission timing check - minimum 2 seconds
  submissionTime: z.number().min(2000, 'Submission too fast').optional(),
});

/**
 * Infer TypeScript type from Zod schema
 * Provides type-safe form data throughout application
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Inquiry type extracted from schema
 */
export type InquiryType = (typeof inquiryTypes)[number];

/**
 * Client-safe schema (excludes anti-bot fields from client validation display)
 * Used for React Hook Form zodResolver
 */
export const contactFormClientSchema = contactFormSchema.omit({
  website: true,
  submissionTime: true,
});

export type ContactFormClientData = z.infer<typeof contactFormClientSchema>;
