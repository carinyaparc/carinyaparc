/**
 * Unit tests for Sanity client configuration
 *
 * Tests client instantiation, environment-based configuration,
 * and type safety as specified in the design document.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Sanity Client Configuration', () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset modules to ensure fresh client instantiation
    vi.resetModules();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore NODE_ENV
    vi.stubEnv('NODE_ENV', originalNodeEnv || 'test');
  });

  describe('Environment-based CDN configuration ', () => {
    it('should enable CDN in production environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.useCdn).toBe(true);
    });

    it('should disable CDN in development environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'development');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.useCdn).toBe(false);
    });

    it('should disable CDN in test environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.useCdn).toBe(false);
    });
  });

  describe('Environment-based Stega encoding ', () => {
    it('should disable Stega in production environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.stega?.enabled).toBe(false);
    });

    it('should enable Stega in development environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'development');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.stega?.enabled).toBe(true);
    });

    it('should enable Stega in test environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.stega?.enabled).toBe(true);
    });
  });

  describe('Client configuration ', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token_abc';
    });

    it('should export a configured client instance', async () => {
      // Act
      const { client } = await import('@/sanity/lib/client');

      // Assert
      expect(client).toBeDefined();
      expect(typeof client.fetch).toBe('function');
      expect(typeof client.config).toBe('function');
    });

    it('should configure client with project ID from environment ', async () => {
      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.projectId).toBe('test-project-123');
    });

    it('should configure client with dataset from environment ', async () => {
      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.dataset).toBe('development');
    });

    it('should configure client with API version ', async () => {
      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.apiVersion).toBeDefined();
      expect(config.apiVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });

    it('should configure published perspective', async () => {
      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.perspective).toBe('published');
    });
  });

  describe('Type safety ', () => {
    it('should export SanityClient type', async () => {
      // Act
      const module = await import('@/sanity/lib/client');

      // Assert
      expect(module).toHaveProperty('client');
      // Type exports can't be tested at runtime, but TypeScript compilation validates this
    });
  });

  describe('Performance', () => {
    it('should instantiate client quickly', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_token';

      // Act
      const startTime = performance.now();
      await import('@/sanity/lib/client');
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert - should be well under 10ms target
      expect(duration).toBeLessThan(50); // Generous threshold for test environment
    });
  });
});
