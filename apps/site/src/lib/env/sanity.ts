/**
 * Sanity environment variable validation (server-only)
 *
 * This module provides runtime validation of Sanity CMS environment variables.
 * It should only be imported in server components and API routes.
 *
 * @module env/sanity
 */

import { sanityEnvSchema } from './types';
import type { SanityEnv } from './types';

/**
 * Validates and returns typed Sanity environment configuration
 *
 * This function should be called at application startup or when initializing
 * Sanity clients to ensure all required environment variables are properly configured.
 *
 * Requirements covered: NFR-002 (clear error messages)
 *
 * @throws {Error} if validation fails with detailed error messages
 * @returns {SanityEnv} Validated environment configuration
 *
 * @example
 * ```typescript
 * // In a server component or API route
 * import { getSanityEnv } from '@/lib/env';
 *
 * const sanityConfig = getSanityEnv();
 * const client = createClient({
 *   projectId: sanityConfig.NEXT_PUBLIC_SANITY_PROJECT_ID,
 *   dataset: sanityConfig.NEXT_PUBLIC_SANITY_DATASET,
 *   token: sanityConfig.SANITY_API_READ_TOKEN,
 * });
 * ```
 */
export function getSanityEnv(): SanityEnv {
  const result = sanityEnvSchema.safeParse({
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `${key}: ${messages?.join(', ')}`)
      .join('\n');

    throw new Error(
      `Environment variable validation failed:\n${errorMessages}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `See: docs/CONTRIBUTING.md#environment-setup`,
    );
  }

  return result.data;
}
