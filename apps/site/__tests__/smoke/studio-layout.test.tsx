/**
 * Smoke Test: Studio Layout Isolation
 *
 * Verifies that the studio route renders with a dedicated layout,
 * preventing site header/footer from appearing and ensuring full
 * viewport utilization for content editing.
 *
 * @module __tests__/smoke/studio-layout
 */

import { describe, it, expect } from 'vitest';

describe('Studio Layout Smoke Test', () => {
  /**
   * Test: Layout module exports
   * Verifies that the studio layout exists and exports a valid component
   */
  it('exports a valid layout component', async () => {
    const layoutModule = await import('@/app/studio/[[...tool]]/layout');

    expect(layoutModule.default).toBeDefined();
    expect(typeof layoutModule.default).toBe('function');
  });

  /**
   * Test: Metadata export
   * Verifies that the layout exports proper metadata for the studio route
   */
  it('exports metadata with correct studio configuration', async () => {
    const layoutModule = await import('@/app/studio/[[...tool]]/layout');

    expect(layoutModule.metadata).toBeDefined();
    expect(layoutModule.metadata.title).toContain('Sanity Studio');
    expect(layoutModule.metadata.robots).toBeDefined();

    // Handle robots being either string or Robots object
    if (layoutModule.metadata.robots && typeof layoutModule.metadata.robots === 'object') {
      expect(layoutModule.metadata.robots.index).toBe(false);
    }
  });

  /**
   * Test: Viewport export
   * Verifies that the layout exports viewport configuration for desktop editing
   */
  it('exports viewport configuration for desktop editing', async () => {
    const layoutModule = await import('@/app/studio/[[...tool]]/layout');

    expect(layoutModule.viewport).toBeDefined();
    expect(layoutModule.viewport.width).toBe('device-width');
    expect(layoutModule.viewport.initialScale).toBe(1);
  });
});
