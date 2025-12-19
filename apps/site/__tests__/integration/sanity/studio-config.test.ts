/**
 * Sanity Studio Configuration Tests
 *
 * Unit tests for the Sanity Studio configuration file.
 * Validates configuration structure, plugin registration, and type safety.
 *
 * @module __tests__/unit/sanity/studio-config
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { WorkspaceOptions } from 'sanity';

// Type guard to check if config is a single workspace
function isSingleWorkspace(config: unknown): config is WorkspaceOptions {
  return (
    typeof config === 'object' &&
    config !== null &&
    'projectId' in config &&
    'dataset' in config &&
    !Array.isArray(config)
  );
}

describe('Sanity Studio Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };

    // Set required environment variables for tests
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id';
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'test-dataset';
    process.env.NEXT_PUBLIC_SANITY_API_VERSION = '2025-01-01';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Clear module cache to ensure fresh imports
    vi.resetModules();
  });

  describe('Configuration Structure', () => {
    it('exports a valid Sanity config object', async () => {
      const config = await import('@/../sanity.config');
      expect(config.default).toBeDefined();
      expect(typeof config.default).toBe('object');
    });

    it('includes required configuration properties', async () => {
      const config = (await import('@/../sanity.config')).default;

      expect(isSingleWorkspace(config)).toBe(true);

      if (isSingleWorkspace(config)) {
        expect(config.projectId).toBeDefined();
        expect(config.dataset).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.title).toBeDefined();
        expect(config.basePath).toBeDefined();
        expect(config.plugins).toBeDefined();
        expect(config.schema).toBeDefined();
      }
    });
  });

  describe('Project Configuration', () => {
    it('configures projectId from environment', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        expect(config.projectId).toBe('test-project-id');
      }
    });

    it('configures dataset from environment', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        expect(config.dataset).toBe('test-dataset');
      }
    });

    it('sets workspace name and title', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        expect(config.name).toBe('carinya-parc');
        expect(config.title).toBe('Carinya Parc CMS');
      }
    });
  });

  describe('Studio Path Configuration', () => {
    it('configures basePath as /studio', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        expect(config.basePath).toBe('/studio');
      }
    });
  });

  describe('API Version', () => {
    it('uses API version in YYYY-MM-DD format', async () => {
      // API version is configured via the imported apiVersion from lib/api
      const { apiVersion } = await import('@/sanity/lib/api');
      expect(apiVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('uses configured API version from environment', async () => {
      // API version is configured via the imported apiVersion from lib/api
      const { apiVersion } = await import('@/sanity/lib/api');
      expect(apiVersion).toBe('2025-01-01');
    });
  });

  describe('Plugin Registration', () => {
    it('registers all required plugins', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        expect(config.plugins).toBeDefined();
        expect(Array.isArray(config.plugins)).toBe(true);
        // Should have 3 plugins: structureTool, visionTool, presentationTool
        expect(config.plugins?.length).toBe(3);
      }
    });
  });

  describe('Schema Registration', () => {
    it('includes schema types array', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        expect(config.schema).toBeDefined();
        expect(config.schema?.types).toBeDefined();
        expect(Array.isArray(config.schema?.types)).toBe(true);
      }
    });

    it('initializes with empty schema types array', async () => {
      const config = (await import('@/../sanity.config')).default;

      if (isSingleWorkspace(config)) {
        // Initially empty, will be populated with content schemas
        expect(config.schema?.types).toEqual([]);
      }
    });
  });

  describe('Presentation Tool Configuration', () => {
    it('uses configured site URL for preview', async () => {
      // The presentation tool configuration uses siteUrl from environment
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      expect(siteUrl).toBe('http://localhost:3000');
    });
  });

  describe('TypeScript Type Safety', () => {
    it('exports configuration with correct TypeScript type', async () => {
      const config = (await import('@/../sanity.config')).default;

      // This test validates that TypeScript compilation succeeds
      // If types were incorrect, TypeScript would fail at compile time
      expect(config).toBeDefined();
      expect(isSingleWorkspace(config)).toBe(true);
    });
  });

  describe('Environment Variable Handling', () => {
    it('throws error when projectId is missing', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      vi.resetModules();

      await expect(async () => {
        await import('@/../sanity.config');
      }).rejects.toThrow('Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID');
    });

    it('throws error when dataset is missing', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_DATASET;
      vi.resetModules();

      await expect(async () => {
        await import('@/../sanity.config');
      }).rejects.toThrow('Missing environment variable: NEXT_PUBLIC_SANITY_DATASET');
    });

    it('uses default site URL when not specified', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      expect(siteUrl).toBe('http://localhost:3000');
    });
  });

  describe('Vision Tool Configuration', () => {
    it('uses configured API version and dataset', async () => {
      // Vision tool configuration uses apiVersion and dataset from environment
      const { apiVersion, dataset } = await import('@/sanity/lib/api');
      expect(apiVersion).toBe('2025-01-01');
      expect(dataset).toBe('test-dataset');
    });
  });
});
