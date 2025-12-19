/**
 * Unit tests for Sanity Studio route
 * Tests route configuration, metadata, viewport, and component rendering
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

  describe('Component Rendering (AC-001)', () => {
    it('renders NextStudio component', async () => {
      const StudioPage = (await import('./page')).default;
      render(<StudioPage />);

      expect(screen.getByTestId('next-studio')).toBeInTheDocument();
    });

    it('passes studio configuration to NextStudio (AC-002)', async () => {
      const StudioPage = (await import('./page')).default;
      render(<StudioPage />);

      const studio = screen.getByTestId('next-studio');
      expect(studio).toHaveTextContent(/projectId: test-project-id/);
      expect(studio).toHaveTextContent(/dataset: test-dataset/);
    });
  });

  describe('Route Configuration (AC-004)', () => {
    it('exports dynamic = "force-dynamic"', async () => {
      const module = await import('./page');
      expect(module.dynamic).toBe('force-dynamic');
    });
  });

  describe('Metadata Export (AC-005)', () => {
    it('exports metadata with correct title', async () => {
      const module = await import('./page');
      expect(module.metadata).toBeDefined();
      expect(module.metadata.title).toContain('Sanity Studio');
      expect(module.metadata.title).toContain('Carinya Parc CMS');
    });

    it('exports metadata with description', async () => {
      const module = await import('./page');
      expect(module.metadata.description).toBe(
        'Content management system for Carinya Parc website',
      );
    });

    it('configures robots to prevent indexing', async () => {
      const module = await import('./page');
      expect(module.metadata.robots).toEqual({
        index: false,
        follow: false,
      });
    });
  });

  describe('Viewport Export (AC-006)', () => {
    it('exports viewport configuration', async () => {
      const module = await import('./page');
      expect(module.viewport).toBeDefined();
    });

    it('configures viewport for device width', async () => {
      const module = await import('./page');
      expect(module.viewport.width).toBe('device-width');
    });

    it('configures initial scale', async () => {
      const module = await import('./page');
      expect(module.viewport.initialScale).toBe(1);
    });

    it('configures maximum scale', async () => {
      const module = await import('./page');
      expect(module.viewport.maximumScale).toBe(1);
    });

    it('disables user scaling for stable editing', async () => {
      const module = await import('./page');
      expect(module.viewport.userScalable).toBe(false);
    });
  });

  describe('Type Safety (NFR-005)', () => {
    it('exports have correct TypeScript types', async () => {
      const module = await import('./page');

      // Verify exports are defined and have expected types
      expect(module.dynamic).toBeDefined();
      expect(module.metadata).toBeDefined();
      expect(module.viewport).toBeDefined();

      // Type check that they match Next.js type definitions
      expect(typeof module.dynamic).toBe('string');
      expect(typeof module.metadata).toBe('object');
      expect(typeof module.viewport).toBe('object');
    });
  });
});
