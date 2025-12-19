/**
 * Sanity Studio Route
 *
 * This route embeds the Sanity Studio CMS at /studio using Next.js App Router
 * catch-all dynamic segments to handle all studio tool navigation (structure,
 * vision, presentation).
 *
 * Metadata and viewport configuration are in layout.tsx (Next.js requirement:
 * metadata/viewport must be exported from server components, not client components).
 *
 * @module app/studio
 * @implements FR-001, FR-002, FR-003, FR-004, FR-005, FR-006
 */

'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

/**
 * Force dynamic rendering for studio route
 * Studio is fully interactive and cannot be statically generated
 * @implements FR-006
 */
export const dynamic = 'force-dynamic';

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
