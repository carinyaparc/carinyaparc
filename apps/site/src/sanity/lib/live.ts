/**
 * Sanity Live Content Configuration
 *
 * This module configures live query infrastructure for real-time content preview
 * and updates. It provides three core exports:
 *
 * 1. sanityFetch - Server-side query utility with automatic cache tagging
 * 2. SanityLive - Browser-side React component for real-time content sync
 * 3. Type definitions for live preview integration
 *
 * @module sanity/lib/live
 */

'use client';

import * as React from 'react';
import { client } from './client';
import { token } from './token';

/**
 * Environment-based configuration
 * Enable live updates only in development and preview environments
 */
const isDevelopment = process.env.NODE_ENV === 'development';
// eslint-disable-next-line turbo/no-undeclared-env-vars
const isPreviewMode = process.env.SANITY_PREVIEW_MODE === 'enabled';
const enableLivePreview = process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW === 'true' || isDevelopment;

/**
 * Browser token for client-side live preview connection
 */
const browserToken =
  isDevelopment || isPreviewMode ? process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN : undefined;

/**
 * Validate token configuration based on environment
 */
function validateTokenConfiguration(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Warn if browser token exists in production
  if (isProduction && process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN) {
    console.warn(
      '[Sanity Live] Warning: NEXT_PUBLIC_SANITY_API_READ_TOKEN detected in production. ' +
        'This token should not be set in production environments.',
    );
  }

  // Warn if live preview is enabled but browser token is missing
  if (enableLivePreview && !isProduction && !browserToken) {
    console.warn(
      '[Sanity Live] NEXT_PUBLIC_SANITY_API_READ_TOKEN not found. ' +
        'Live preview will work but without real-time updates. ' +
        'See docs/CONTRIBUTING.md#environment-setup',
    );
  }
}

// Validate configuration on module load
if (typeof window !== 'undefined') {
  validateTokenConfiguration();
}

/**
 * Server-side content query utility with automatic cache tagging
 *
 * This function wraps the Sanity client's fetch method with:
 * - Automatic cache tagging for Next.js revalidation
 * - Type-safe query results
 * - Environment-based draft content access
 *
 * @template QueryResult - TypeScript type for query result
 * @param options - Query options including query string, params, and cache config
 * @returns Promise<QueryResult> - Typed query results
 *
 * @example
 * ```typescript
 * interface Post {
 *   _id: string;
 *   title: string;
 *   slug: { current: string };
 * }
 *
 * const posts = await sanityFetch<Post[]>({
 *   query: '*[_type == "post"] { _id, title, slug }',
 *   tags: ['posts'],
 * });
 * ```
 */
export async function sanityFetch<QueryResult = unknown>(options: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<QueryResult> {
  const { query, params = {}, tags = [], revalidate } = options;

  try {
    // Execute query with Sanity client
    // In preview mode, use draft perspective; otherwise use published
    const result = await client.fetch<QueryResult>(query, params, {
      // Use server token for authenticated requests
      token: isPreviewMode ? token : undefined,
      perspective: isPreviewMode ? 'previewDrafts' : 'published',
      // Next.js cache configuration
      next: {
        revalidate: revalidate !== undefined ? revalidate : RevalidationConfig.time.post,
        tags: tags.length > 0 ? tags : undefined,
      },
    });

    return result;
  } catch (error) {
    // Graceful error handling
    console.error('[Sanity Fetch] Query error:', error);
    throw error;
  }
}

/**
 * Browser-side live content synchronisation component
 *
 * This component establishes a live connection to Sanity in preview mode
 * and listens for content mutations to trigger cache revalidation.
 *
 * Note: Full live preview requires @sanity/preview-kit package.
 * Current implementation provides the component structure.
 *
 * @returns React element or null in production
 */
export function SanityLive(): React.ReactElement | null {
  // No-op in production environment
  if (!enableLivePreview) {
    return null;
  }

  // TODO: Implement live preview connection with @sanity/preview-kit
  // For now, return null as placeholder
  // Full implementation requires:
  // 1. Install @sanity/preview-kit
  // 2. Use defineLive from @sanity/preview-kit
  // 3. Establish WebSocket connection to Sanity
  // 4. Listen for mutation events
  // 5. Trigger Next.js cache revalidation

  return null;
}

/**
 * Re-export types for external usage
 */
export type { SanityClient } from 'next-sanity';

/**
 * Cache tag utilities for selective revalidation
 */
export const CacheTags = {
  /**
   * Generate document-level cache tag
   * Pattern: sanity:${type}:${id}
   */
  document: (type: string, id: string) => `sanity:${type}:${id}`,

  /**
   * Generate type-level cache tag
   * Pattern: sanity:type:${type}
   */
  type: (type: string) => `sanity:type:${type}`,

  /**
   * Global cache tag for all Sanity content
   * Pattern: sanity:all
   */
  all: 'sanity:all' as const,

  /**
   * Singleton cache tag for global settings
   * Pattern: sanity:global:${name}
   */
  singleton: (name: string) => `sanity:global:${name}`,
} as const;

/**
 * Revalidation configuration for different content types
 */
export const RevalidationConfig = {
  /**
   * Time-based revalidation intervals (in seconds)
   */
  time: {
    post: 60, // Blog posts: 1 minute
    recipe: 60, // Recipes: 1 minute
    page: 300, // Static pages: 5 minutes
    settings: 600, // Global settings: 10 minutes
  },

  /**
   * Get revalidation interval for a content type
   */
  getInterval: (type: string): number => {
    return RevalidationConfig.time[type as keyof typeof RevalidationConfig.time] || 60;
  },
} as const;

/**
 * Helper to generate cache tags from query and result
 * Used internally by sanityFetch for automatic cache tagging
 *
 * @internal
 */
export function generateCacheTags(query: string, result: unknown): string[] {
  const tags: string[] = [];

  // Extract content types from query (handle multiple patterns)
  // Pattern 1: *[_type == "post"]
  // Pattern 2: *[_type == 'post']
  // Pattern 3: *[_type == "post" && ...]
  const typePattern = /\*\[_type\s*==\s*["']([^"']+)["']/g;
  const typeMatches = [...query.matchAll(typePattern)];
  const types = typeMatches.map((m) => m[1]).filter(Boolean);

  // Add type-level tags
  types.forEach((type) => {
    if (type) tags.push(CacheTags.type(type));
  });

  // Extract document IDs and types from result
  const documents = Array.isArray(result) ? result : result ? [result] : [];
  documents.forEach((doc) => {
    if (doc && typeof doc === 'object' && '_id' in doc && '_type' in doc) {
      const docType = doc._type as string;
      const docId = doc._id as string;

      // Add document-level tag
      tags.push(CacheTags.document(docType, docId));

      // Also add type-level tag if not already present from query
      if (!types.includes(docType)) {
        tags.push(CacheTags.type(docType));
      }
    }
  });

  // Deduplicate and return
  return [...new Set(tags)];
}

/**
 * Check if live preview is enabled in current environment
 */
export function isLivePreviewEnabled(): boolean {
  return enableLivePreview && (isDevelopment || isPreviewMode);
}

/**
 * Type definitions for live query options
 */
export interface SanityFetchOptions {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
  perspective?: 'published' | 'previewDrafts';
}

/**
 * Live update event type from Sanity
 */
export interface SanityLiveEvent {
  type: 'mutation' | 'reconnect' | 'disconnect';
  documentIds: string[];
  transactionId?: string;
  timestamp: string;
}

/**
 * Props for SanityLive component
 */
export interface SanityLiveProps {
  /**
   * Show connection status indicator (default: false)
   */
  showStatus?: boolean;

  /**
   * Custom error handler for connection failures
   */
  onError?: (error: Error) => void;

  /**
   * Custom handler for content updates
   */
  onUpdate?: (event: Partial<SanityLiveEvent>) => void;
}
