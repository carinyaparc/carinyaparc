/**
 * Sanity API Configuration
 *
 * Core Sanity project configuration constants exported for use across the application.
 * This file is kept lean to avoid unnecessarily increasing bundle size.
 *
 * Note: This file uses direct process.env access for public variables to maintain
 * bundle size efficiency. Server-only validation happens via @/lib/env in server contexts.
 *
 * @module sanity/lib/api
 */

/**
 * Helper function to assert required environment variables
 * Provides clear error messages when configuration is missing (FR-009)
 */
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}

/**
 * Sanity dataset name (development or production)
 * FR-003: Dataset from NEXT_PUBLIC_SANITY_DATASET
 *
 * @throws {Error} if NEXT_PUBLIC_SANITY_DATASET is not set
 */
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
);

/**
 * Sanity project ID
 * FR-002: Project ID from NEXT_PUBLIC_SANITY_PROJECT_ID
 *
 * @throws {Error} if NEXT_PUBLIC_SANITY_PROJECT_ID is not set
 */
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
);

/**
 * Sanity API version in YYYY-MM-DD format
 * FR-004: API version string
 *
 * Defaults to '2025-09-25' if not explicitly set.
 * See https://www.sanity.io/docs/api-versioning for versioning details.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25';

/**
 * Sanity Studio URL for visual editing and presentation mode
 *
 * Used to configure edit intent links and Presentation Tool integration.
 * Defaults to localhost for local development.
 */
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333';
