/**
 * Sanity Live Query Configuration
 *
 * Note: defineLive is available in next-sanity v9+. This project uses v12.
 * For now, we export a basic sanityFetch wrapper. Upgrade to next-sanity v9+
 * to enable live preview features.
 *
 * Learn more: https://github.com/sanity-io/next-sanity
 */

import { client } from './client';

/**
 * Basic fetch wrapper for Sanity queries
 * This is a placeholder until next-sanity is upgraded to support defineLive
 */
export async function sanityFetch<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return client.fetch<T>(query, params || {});
}

/**
 * Placeholder for SanityLive component
 * Will be available after upgrading next-sanity to v9+
 */
export function SanityLive() {
  return null;
}
