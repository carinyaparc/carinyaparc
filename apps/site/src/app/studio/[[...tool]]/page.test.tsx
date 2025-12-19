/**
 * Unit tests for Sanity Studio route
 * Tests route configuration, metadata, viewport, and component rendering
 *
 * Note: Metadata and viewport are tested from layout.tsx (Next.js requirement)
 *
 * @module app/studio
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock NextStudio component to avoid Sanity Cloud dependency
vi.mock('next-sanity/studio', () => ({
  NextStudio: ({ config }: { config: { projectId: string; dataset: string } }) => (
    <div data-testid="next-studio">
      Studio Mock (projectId: {config.projectId}, dataset: {config.dataset})
    </div>
  ),
}));

// Mock sanity.config to provide test configuration
vi.mock('../../../../../sanity.config', () => ({
  default: {
    projectId: 'test-project-id',
    dataset: 'test-dataset',
    basePath: '/studio',
    apiVersion: '2025-01-01',
    plugins: [],
    schema: { types: [] },
  },
}));

describe('/studio/[[...tool]] route', () => {
  beforeAll(() => {
    // Set required environment variables for test environment
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id';
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'test-dataset';
  });

  describe('Component Rendering', () => {
    it('renders NextStudio component', async () => {
      const StudioPage = (await import('./page')).default;
      render(<StudioPage />);

      expect(screen.getByTestId('next-studio')).toBeInTheDocument();
    });

    it('passes studio configuration to NextStudio', async () => {
      const StudioPage = (await import('./page')).default;
      render(<StudioPage />);

      const studio = screen.getByTestId('next-studio');
      expect(studio).toHaveTextContent(/projectId: test-project-id/);
      expect(studio).toHaveTextContent(/dataset: test-dataset/);
    });
  });

  describe('Route Configuration', () => {
    it('exports dynamic = "force-dynamic"', async () => {
      const pageModule = await import('./page');
      expect(pageModule.dynamic).toBe('force-dynamic');
    });
  });

  describe('Metadata Export', () => {
    it('exports metadata with correct title', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.metadata).toBeDefined();
      expect(layoutModule.metadata.title).toContain('Sanity Studio');
      expect(layoutModule.metadata.title).toContain('Carinya Parc CMS');
    });

    it('exports metadata with description', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.metadata.description).toBe(
        'Content management system for Carinya Parc website',
      );
    });

    it('configures robots to prevent indexing', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.metadata.robots).toEqual({
        index: false,
        follow: false,
      });
    });
  });

  describe('Viewport Export', () => {
    it('exports viewport configuration', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.viewport).toBeDefined();
    });

    it('configures viewport for device width', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.viewport.width).toBe('device-width');
    });

    it('configures initial scale', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.viewport.initialScale).toBe(1);
    });

    it('configures maximum scale', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.viewport.maximumScale).toBe(1);
    });

    it('disables user scaling for stable editing', async () => {
      const layoutModule = await import('./layout');
      expect(layoutModule.viewport.userScalable).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('page exports have correct TypeScript types', async () => {
      const pageModule = await import('./page');

      // Verify page exports
      expect(pageModule.dynamic).toBeDefined();
      expect(typeof pageModule.dynamic).toBe('string');
    });

    it('layout exports have correct TypeScript types', async () => {
      const layoutModule = await import('./layout');

      // Verify layout exports
      expect(layoutModule.metadata).toBeDefined();
      expect(layoutModule.viewport).toBeDefined();

      // Type check that they match Next.js type definitions
      expect(typeof layoutModule.metadata).toBe('object');
      expect(typeof layoutModule.viewport).toBe('object');
    });
  });
});
