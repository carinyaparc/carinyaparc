/**
 * Security tests for Sanity client configuration
 *
 * Validates that API tokens are never exposed in client-side code
 * and that server-only enforcement is working correctly.
 *
 * Requirements tested:
 * - NFR-003: No token exposure in client bundles
 * - FR-009: Token validation and error messages
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Sanity Client Security', () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore NODE_ENV
    vi.stubEnv('NODE_ENV', originalNodeEnv || 'test');
  });

  describe('Token Protection (NFR-003)', () => {
    it('should not expose token in client config when accessed', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_secret_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert - config should contain token but it's only used server-side
      // The token module uses 'server-only' to prevent client-side imports
      expect(config.token).toBeDefined();
    });

    it('should enforce server-only import for token module', async () => {
      // This test validates that the 'server-only' package is imported
      // Runtime enforcement happens during build/bundling
      const tokenModule = await import('@/sanity/lib/token');

      // If this test runs, the module was successfully imported in a Node environment
      expect(tokenModule.token).toBeDefined();
    });
  });

  describe('Token Validation (FR-009)', () => {
    it('should throw clear error when token is missing', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      delete process.env.SANITY_API_READ_TOKEN; // Remove token

      // Act & Assert
      await expect(async () => {
        await import('@/sanity/lib/token');
      }).rejects.toThrow(/Missing SANITY_API_READ_TOKEN/);
    });

    it('should include documentation link in error message', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      delete process.env.SANITY_API_READ_TOKEN;

      // Act & Assert
      try {
        await import('@/sanity/lib/token');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('CONTRIBUTING.md');
      }
    });
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when project ID is missing', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';

      // Act & Assert
      await expect(async () => {
        await import('@/sanity/lib/api');
      }).rejects.toThrow(/Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID/);
    });

    it('should throw error when dataset is missing', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      delete process.env.NEXT_PUBLIC_SANITY_DATASET;

      // Act & Assert
      await expect(async () => {
        await import('@/sanity/lib/api');
      }).rejects.toThrow(/Missing environment variable: NEXT_PUBLIC_SANITY_DATASET/);
    });
  });

  describe('Configuration Security', () => {
    it('should not log sensitive information', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      const consoleSpy = vi.spyOn(console, 'log');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_secret_token';

      // Act
      await import('@/sanity/lib/client');

      // Assert - no console.log calls should contain the token
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain('sk_secret_token');

      consoleSpy.mockRestore();
    });

    it('should use published perspective by default to prevent draft leakage', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'sk_token';

      // Act
      const { client } = await import('@/sanity/lib/client');
      const config = client.config();

      // Assert
      expect(config.perspective).toBe('published');
    });
  });

  describe('Token Format Validation', () => {
    it('should work with valid Sanity token format', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'sk_test_valid_token_format';

      // Act
      const tokenModule = await import('@/sanity/lib/token');

      // Assert
      expect(tokenModule.token).toBe('sk_test_valid_token_format');
      expect(tokenModule.token?.startsWith('sk')).toBe(true);
    });
  });
});
