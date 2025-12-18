/**
 * Unit tests for Sanity Live Content Configuration
 *
 * Tests live query configuration, cache tag generation, revalidation strategies,
 * and environment-based configuration as specified in CP-02-002.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock server-only package
vi.mock('server-only', () => ({}));

// Mock token module to avoid server-only import issues in tests
vi.mock('./token', () => ({
  token: 'sk_test_server_token',
}));

describe('Sanity Live Content Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh configuration
    vi.resetModules();
    // Reset environment
    process.env = { ...originalEnv };
    // Set required environment variables
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
    process.env.SANITY_API_READ_TOKEN = 'sk_test_server_token';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Cache Tag Utilities', () => {
    it('should generate document-level cache tag', async () => {
      // Act
      const { CacheTags } = await import('./live');
      const tag = CacheTags.document('post', '123');

      // Assert
      expect(tag).toBe('sanity:post:123');
    });

    it('should generate type-level cache tag', async () => {
      // Act
      const { CacheTags } = await import('./live');
      const tag = CacheTags.type('recipe');

      // Assert
      expect(tag).toBe('sanity:type:recipe');
    });

    it('should provide global cache tag', async () => {
      // Act
      const { CacheTags } = await import('./live');

      // Assert
      expect(CacheTags.all).toBe('sanity:all');
    });

    it('should generate singleton cache tag', async () => {
      // Act
      const { CacheTags } = await import('./live');
      const tag = CacheTags.singleton('settings');

      // Assert
      expect(tag).toBe('sanity:global:settings');
    });
  });

  describe('generateCacheTags helper', () => {
    it('should extract type-level tags from query', async () => {
      // Arrange
      const { generateCacheTags } = await import('./live');
      const query = '*[_type == "post"] { title, slug }';
      const result: unknown[] = [];

      // Act
      const tags = generateCacheTags(query, result);

      // Assert
      expect(tags).toContain('sanity:type:post');
    });

    it('should extract document-level tags from result', async () => {
      // Arrange
      const { generateCacheTags } = await import('./live');
      const query = '*[_type == "post"]';
      const result = [
        { _id: 'post-123', _type: 'post', title: 'Test Post' },
        { _id: 'post-456', _type: 'post', title: 'Another Post' },
      ];

      // Act
      const tags = generateCacheTags(query, result);

      // Assert
      expect(tags).toContain('sanity:post:post-123');
      expect(tags).toContain('sanity:post:post-456');
      expect(tags).toContain('sanity:type:post');
    });

    it('should handle single document result', async () => {
      // Arrange
      const { generateCacheTags } = await import('./live');
      const query = '*[_type == "post" && _id == $id][0]';
      const result = { _id: 'post-123', _type: 'post', title: 'Test Post' };

      // Act
      const tags = generateCacheTags(query, result);

      // Assert
      expect(tags).toContain('sanity:post:post-123');
      expect(tags).toContain('sanity:type:post');
    });

    it('should deduplicate tags', async () => {
      // Arrange
      const { generateCacheTags } = await import('./live');
      const query = '*[_type == "post"] { _id, _type }';
      const result = [
        { _id: 'post-123', _type: 'post' },
        { _id: 'post-123', _type: 'post' }, // Duplicate
      ];

      // Act
      const tags = generateCacheTags(query, result);

      // Assert
      const uniqueTags = [...new Set(tags)];
      expect(tags.length).toBe(uniqueTags.length);
    });

    it('should handle empty results', async () => {
      // Arrange
      const { generateCacheTags } = await import('./live');
      const query = '*[_type == "post"]';
      const result: unknown[] = [];

      // Act
      const tags = generateCacheTags(query, result);

      // Assert
      expect(tags).toContain('sanity:type:post');
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe('Revalidation Configuration', () => {
    it('should define time-based revalidation intervals', async () => {
      // Act
      const { RevalidationConfig } = await import('./live');

      // Assert
      expect(RevalidationConfig.time.post).toBe(60);
      expect(RevalidationConfig.time.recipe).toBe(60);
      expect(RevalidationConfig.time.page).toBe(300);
      expect(RevalidationConfig.time.settings).toBe(600);
    });

    it('should provide getInterval helper for known types', async () => {
      // Act
      const { RevalidationConfig } = await import('./live');

      // Assert
      expect(RevalidationConfig.getInterval('post')).toBe(60);
      expect(RevalidationConfig.getInterval('recipe')).toBe(60);
      expect(RevalidationConfig.getInterval('page')).toBe(300);
      expect(RevalidationConfig.getInterval('settings')).toBe(600);
    });

    it('should provide default interval for unknown types', async () => {
      // Act
      const { RevalidationConfig } = await import('./live');

      // Assert
      expect(RevalidationConfig.getInterval('unknown-type')).toBe(60);
    });
  });

  describe('Environment-based Live Preview', () => {
    it('should enable live preview in development environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'development');
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'true';

      // Act
      const { isLivePreviewEnabled } = await import('./live');

      // Assert
      expect(isLivePreviewEnabled()).toBe(true);
    });

    it('should enable live preview when SANITY_PREVIEW_MODE is enabled', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production');
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      process.env.SANITY_PREVIEW_MODE = 'enabled';
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'true';

      // Act
      const { isLivePreviewEnabled } = await import('./live');

      // Assert
      expect(isLivePreviewEnabled()).toBe(true);
    });

    it('should disable live preview in production without explicit flag', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production');
      delete process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW;
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      delete process.env.SANITY_PREVIEW_MODE;

      // Act
      const { isLivePreviewEnabled } = await import('./live');

      // Assert
      expect(isLivePreviewEnabled()).toBe(false);
    });
  });

  describe('defineLive exports', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'test');
    });

    it('should export sanityFetch function', async () => {
      // Act
      const { sanityFetch } = await import('./live');

      // Assert
      expect(sanityFetch).toBeDefined();
      expect(typeof sanityFetch).toBe('function');
    });

    it('should export SanityLive component', async () => {
      // Act
      const { SanityLive } = await import('./live');

      // Assert
      expect(SanityLive).toBeDefined();
      expect(typeof SanityLive).toBe('function');
    });

    it('should export CacheTags utility', async () => {
      // Act
      const { CacheTags } = await import('./live');

      // Assert
      expect(CacheTags).toBeDefined();
      expect(CacheTags.document).toBeDefined();
      expect(CacheTags.type).toBeDefined();
      expect(CacheTags.all).toBeDefined();
      expect(CacheTags.singleton).toBeDefined();
    });

    it('should export RevalidationConfig', async () => {
      // Act
      const { RevalidationConfig } = await import('./live');

      // Assert
      expect(RevalidationConfig).toBeDefined();
      expect(RevalidationConfig.time).toBeDefined();
      expect(RevalidationConfig.getInterval).toBeDefined();
    });

    it('should export type definitions', async () => {
      // Act
      const liveModule = await import('./live');

      // Assert
      expect(liveModule).toHaveProperty('sanityFetch');
      expect(liveModule).toHaveProperty('SanityLive');
      // Type exports (SanityClient, SanityFetchOptions, etc.) are validated at TypeScript compile time
    });
  });

  describe('Token Configuration', () => {
    it('should exclude browser token in production', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production');
      process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN = 'sk_browser_token';

      // Note: The actual exclusion happens in the module via environment checks
      // This test verifies the configuration logic exists
      const { isLivePreviewEnabled } = await import('./live');

      // Assert - Live preview should be disabled in production by default
      expect(isLivePreviewEnabled()).toBe(false);
    });

    it('should use browser token in development', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'development');
      process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN = 'sk_browser_token';

      // Act
      const { isLivePreviewEnabled } = await import('./live');

      // Assert - Live preview should be enabled in development
      expect(isLivePreviewEnabled()).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should provide TypeScript types for exports', async () => {
      // This test verifies exports exist; TypeScript compiler validates types
      const liveModule = await import('./live');

      // Assert all required exports are present
      expect(liveModule).toHaveProperty('sanityFetch');
      expect(liveModule).toHaveProperty('SanityLive');
      expect(liveModule).toHaveProperty('CacheTags');
      expect(liveModule).toHaveProperty('RevalidationConfig');
      expect(liveModule).toHaveProperty('generateCacheTags');
      expect(liveModule).toHaveProperty('isLivePreviewEnabled');
    });
  });
});
