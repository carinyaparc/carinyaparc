/**
 * Sanity API Token (Server-Only)
 *
 * This module exports the Sanity API read token for server-side authentication.
 * The 'server-only' import ensures this module cannot be imported in client-side code.
 *
 * Requirements:
 * -No token exposure in client bundles
 * -Clear error messages for missing configuration
 *
 * @module sanity/lib/token
 */

import 'server-only';

/**
 * Sanity API read token for server-side queries
 *
 * This token provides read-only access to content and should never be
 * exposed to client-side bundles. The 'server-only' import guard ensures
 * build-time protection against client-side usage.
 *
 * @throws {Error} if SANITY_API_READ_TOKEN is not configured
 */
export const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error(
    'Missing SANITY_API_READ_TOKEN environment variable.\n' +
      'Please check your .env.local file and ensure SANITY_API_READ_TOKEN is set.\n' +
      'See: docs/CONTRIBUTING.md#environment-setup',
  );
}
