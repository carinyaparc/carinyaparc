/**
 * Environment variable type definitions and schemas
 *
 * This module defines Zod validation schemas and TypeScript types
 * for Sanity CMS environment configuration.
 *
 * @module env/types
 */

import { z } from 'zod';

/**
 * Environment variable schema for Sanity configuration
 * Validates presence and format of required variables
 */
export const sanityEnvSchema = z.object({
  // Public variables (embedded in client bundle)
  NEXT_PUBLIC_SANITY_PROJECT_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_SANITY_PROJECT_ID is required')
    .regex(/^[a-z0-9]+$/, 'Invalid Sanity project ID format'),

  // Dataset validation
  NEXT_PUBLIC_SANITY_DATASET: z
    .string()
    .min(1, 'NEXT_PUBLIC_SANITY_DATASET is required')
    .refine(
      (val) => ['production', 'development'].includes(val),
      'Dataset must be "production" or "development"',
    ),

  // Server-only variables (never exposed to client)
  // Read token validation (viewer role)
  SANITY_API_READ_TOKEN: z
    .string()
    .min(1, 'SANITY_API_READ_TOKEN is required')
    .startsWith('sk', 'Invalid Sanity token format'),

  // Write token validation (editor role, optional)
  SANITY_API_WRITE_TOKEN: z
    .string()
    .optional() // Optional: only needed for migrations/Studio
    .refine((val) => !val || val.startsWith('sk'), 'Invalid Sanity token format'),
});

/**
 * Validated Sanity environment configuration
 * Inferred from sanityEnvSchema
 */
export type SanityEnv = z.infer<typeof sanityEnvSchema>;
