import { z } from 'zod';

export const subscribeFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Please provide a valid email address')
    .max(254, 'Please provide a valid email address')
    .email('Please provide a valid email address'),
  name: z
    .string()
    .max(50, 'Please provide a valid name (letters, spaces, hyphens, and apostrophes only)')
    .regex(
      /^[a-zA-Z\s'-]*$/,
      'Please provide a valid name (letters, spaces, hyphens, and apostrophes only)',
    )
    .optional(),
  interests: z.string().optional(),
  website: z.string().optional(),
  submissionTime: z.number(),
});

export type SubscribeFormData = z.infer<typeof subscribeFormSchema>;
