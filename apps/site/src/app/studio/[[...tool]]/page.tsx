/**
 * Sanity Studio Route
 *
 * This route embeds the Sanity Studio CMS at /studio using Next.js App Router
 * catch-all dynamic segments to handle all studio tool navigation (structure,
 * vision, presentation).
 *
 * @module app/studio
 * @implements FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008
 */

'use client';

import type { Metadata, Viewport } from 'next';
import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

/**
 * Force dynamic rendering for studio route
 * Studio is fully interactive and cannot be statically generated
 * @implements FR-006
 */
export const dynamic = 'force-dynamic';

/**
 * Studio page metadata
 * Configured to prevent search engine indexing
 * @implements FR-007
 */
export const metadata: Metadata = {
  title: 'Sanity Studio | Carinya Parc CMS',
  description: 'Content management system for Carinya Parc website',
  robots: {
    index: false, // Don't index studio pages in search engines
    follow: false, // Don't follow links from studio
  },
};

/**
 * Studio viewport configuration
 * Optimized for desktop editing experience (≥ 1024px)
 * @implements FR-008
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent pinch-zoom for stable editing UI
};

/**
 * Studio Page Component
 *
 * Renders the Sanity Studio interface using NextStudio component.
 * Handles all studio tool routes through catch-all segments:
 * - /studio → default (structure tool)
 * - /studio/structure → structure tool
 * - /studio/vision → vision tool
 * - /studio/presentation → presentation tool
 *
 * @implements FR-001, FR-002, FR-003, FR-004, FR-005, FR-009
 * @returns NextStudio component with studio configuration
 */
export default function StudioPage() {
  // NextStudio handles all functionality internally:
  // - Configuration validation (FR-005)
  // - Sanity Cloud authentication (FR-009)
  // - Tool navigation and routing (FR-002)
  // - Error boundaries and retry logic (FR-010)
  return <NextStudio config={config} />;
}
