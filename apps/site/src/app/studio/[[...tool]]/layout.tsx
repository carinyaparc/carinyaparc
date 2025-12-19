/**
 * Sanity Studio Layout
 *
 * This layout provides metadata and viewport configuration for the studio route.
 * Metadata/viewport must be exported from server components (layout), not client
 * components (page).
 *
 * @module app/studio/layout
 * @implements FR-007, FR-008
 */

import type { Metadata, Viewport } from 'next';

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
 * Studio Layout Component
 *
 * Simple passthrough layout that provides metadata/viewport config
 * for the studio route.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
