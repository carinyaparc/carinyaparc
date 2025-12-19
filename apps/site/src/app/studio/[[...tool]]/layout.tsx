/**
 * Sanity Studio Layout
 *
 * This layout provides an isolated rendering environment for the Sanity Studio
 * at /studio, preventing the site's header, footer, and global styles from
 * interfering with the studio interface.
 *
 * Key Features:
 * - Full viewport height for maximum editing space
 * - No site header or footer components
 * - No inherited site-specific CSS
 * - Minimal DOM structure for optimal studio performance
 *
 * Architecture:
 * This layout creates a nested layout boundary in the Next.js App Router.
 * By defining layout.tsx in the studio route directory, we prevent the root
 * layout's header, footer, and styling from being inherited by studio routes.
 *
 * Related:
 * - Studio configuration: apps/site/sanity.config.ts
 * - Studio route: apps/site/src/app/studio/[[...tool]]/page.tsx
 *
 * @module app/studio/layout
 * @see https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
 */

import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';

/**
 * Studio page metadata
 * Configured to prevent search engine indexing
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
 * Creates an isolated full-height container for the Sanity Studio interface.
 * This layout prevents the root layout's site header, footer, and styling from
 * affecting the studio, ensuring content editors have a clean, distraction-free
 * workspace that occupies the full browser viewport.
 *
 * Implementation Details:
 * - Uses inline styles to avoid CSS cascade issues
 * - height: 100vh provides full viewport height
 * - overflow: hidden prevents double scrollbars
 * - No imports of site components or styles
 *
 * @param props - Layout props
 * @param props.children - NextStudio component from page.tsx
 * @returns Full-height container wrapping studio interface
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  // Render children (NextStudio) with no additional wrapper constraints
  // Full viewport height container with minimal DOM structure (single div wrapper)
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden', // Prevent layout shift and double scrollbars
      }}
    >
      {children}
    </div>
  );
}
