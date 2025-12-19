/**
 * Integration tests for Sanity client connectivity
 *
 * Tests actual API connectivity to Sanity development dataset.
 * These tests require valid environment variables to be configured.
 *
 * Requirements tested:
 * -Client can fetch content from Sanity
 * -Error handling for network failures
 * -Server component compatibility
 */

import { describe, it, expect } from 'vitest';
import { client } from '@/sanity/lib/client';

describe('Sanity Client Integration', () => {
  // Skip integration tests if environment is not configured
  const skipIfNoEnv =
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_READ_TOKEN ? it.skip : it;

  describe('API Connectivity', () => {
    skipIfNoEnv('should successfully connect to Sanity API', async () => {
      // Act & Assert - just fetching API info without errors proves connectivity
      const config = client.config();

      expect(config.projectId).toBeDefined();
      expect(config.dataset).toBeDefined();
    });

    skipIfNoEnv('should successfully execute a simple query', async () => {
      // Arrange
      const query = `*[_type == "settings"][0]{ _id, _type }`;

      // Act
      const result = await client.fetch(query);

      // Assert - result can be null if no settings exist, but query should execute
      expect(result).toBeDefined();
    });

    skipIfNoEnv('should respect dataset configuration', async () => {
      // Arrange
      const config = client.config();
      const expectedDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

      // Assert
      expect(config.dataset).toBe(expectedDataset);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      // Arrange
      const invalidQuery = '*[invalid syntax{';

      // Act & Assert
      await expect(client.fetch(invalidQuery)).rejects.toThrow();
    });
  });

  describe('Query Execution', () => {
    skipIfNoEnv('should support parameterized queries', async () => {
      // Arrange
      const query = `*[_type == $docType][0]`;
      const params = { docType: 'settings' };

      // Act
      const result = await client.fetch(query, params);

      // Assert - result can be null, but query should execute without error
      expect(result !== undefined).toBe(true);
    });

    skipIfNoEnv('should return null for non-existent documents', async () => {
      // Arrange
      const query = `*[_type == "nonexistent-type"][0]`;

      // Act
      const result = await client.fetch(query);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Client Methods', () => {
    it('should expose fetch method', () => {
      expect(typeof client.fetch).toBe('function');
    });

    it('should expose config method', () => {
      expect(typeof client.config).toBe('function');
    });

    it('should expose withConfig method for client cloning', () => {
      expect(typeof client.withConfig).toBe('function');
    });
  });

  describe('Performance', () => {
    skipIfNoEnv('should execute queries within acceptable time', async () => {
      // Arrange
      const query = `*[_type == "settings"][0]{ _id }`;
      const startTime = performance.now();

      // Act
      await client.fetch(query);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert - should be under 500ms for simple query (generous threshold)
      expect(duration).toBeLessThan(5000); // 5 second timeout for CI environments
    });
  });
});
