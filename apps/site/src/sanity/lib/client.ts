/**
 * Sanity Client Configuration
 *
 * This module provides a pre-configured Sanity client for content queries.
 * Configuration is environment-aware for CDN usage and Stega encoding.

 *
 * @module sanity/lib/client
 */

import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId, studioUrl } from '@/sanity/lib/api';
import { token } from './token';

/**
 * Determine CDN usage based on environment
 * CDN enabled in production for performance
 * CDN disabled in development for fresh content
 */
const useCdn = process.env.NODE_ENV === 'production';

/**
 * Determine Stega encoding based on environment
 * Stega enabled in development/preview for visual editing
 * Stega disabled in production to reduce payload size
 */
const stegaEnabled = process.env.NODE_ENV !== 'production';

/**
 * Pre-configured Sanity client for content queries
 *
 * Configuration:
 * - Uses validated environment variables from @/sanity/lib/api
 * - CDN optimized based on environment
 * - Stega encoding for visual editing in non-production
 * - Server-only token authentication
 *
 * @example
 * ```typescript
 * import { client } from '@/sanity/lib/client';
 *
 * const posts = await client.fetch(
 *   `*[_type == "post"]{ title, slug, content }`
 * );
 * ```
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn, // Environment-based CDN configuration
  perspective: 'published',
  token, // Required for private datasets
  stega: {
    enabled: stegaEnabled, // Environment-based Stega encoding
    studioUrl,
    // Uncomment for verbose logging during development:
    // logger: console,
    filter: (props) => {
      // Always encode title fields for easy editing
      if (props.sourcePath.at(-1) === 'title') {
        return true;
      }

      return props.filterDefault(props);
    },
  },
});

/**
 * Re-export SanityClient type for use in application code
 */
export type { SanityClient } from 'next-sanity';
