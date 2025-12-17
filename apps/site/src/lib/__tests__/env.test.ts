/**
 * Unit tests for Sanity environment variable validation
 *
 * Tests coverage for FR-001, FR-002, FR-003, FR-004, FR-005
 * Design reference: Testing Strategy section in design.md
 *
 * @module env.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSanityEnv, sanityEnvSchema } from '../env';

describe('Sanity Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of process.env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  describe('getSanityEnv - valid configurations', () => {
    it('should validate correct environment variables', () => {
      // AC-003: Application starts with configured environment variables
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123xyz';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'skTestToken1234567890abcdefghijklmnopqrstuvwxyz';
      process.env.SANITY_API_WRITE_TOKEN = 'skTestToken9876543210zyxwvutsrqponmlkjihgfedcba';

      const config = getSanityEnv();

      expect(config.NEXT_PUBLIC_SANITY_PROJECT_ID).toBe('abc123xyz');
      expect(config.NEXT_PUBLIC_SANITY_DATASET).toBe('production');
      expect(config.SANITY_API_READ_TOKEN).toBe('skTestToken1234567890abcdefghijklmnopqrstuvwxyz');
      expect(config.SANITY_API_WRITE_TOKEN).toBe('skTestToken9876543210zyxwvutsrqponmlkjihgfedcba');
    });

    it('should allow SANITY_API_WRITE_TOKEN to be optional', () => {
      // FR-004: Write token is optional
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'skValidToken123';
      delete process.env.SANITY_API_WRITE_TOKEN;

      expect(() => getSanityEnv()).not.toThrow();

      const config = getSanityEnv();
      expect(config.SANITY_API_WRITE_TOKEN).toBeUndefined();
    });

    it('should accept "development" as valid dataset', () => {
      // FR-002: Dataset can be "development" or "production"
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';
      process.env.SANITY_API_READ_TOKEN = 'skValidToken456';

      const config = getSanityEnv();
      expect(config.NEXT_PUBLIC_SANITY_DATASET).toBe('development');
    });
  });

  describe('getSanityEnv - missing required variables', () => {
    it('should throw error when NEXT_PUBLIC_SANITY_PROJECT_ID is missing', () => {
      // FR-001: Project ID is required
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'skValidToken123';

      expect(() => getSanityEnv()).toThrow(/NEXT_PUBLIC_SANITY_PROJECT_ID/);
      expect(() => getSanityEnv()).toThrow(/Environment variable validation failed/);
    });

    it('should throw error when NEXT_PUBLIC_SANITY_DATASET is missing', () => {
      // FR-002: Dataset is required
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123';
      delete process.env.NEXT_PUBLIC_SANITY_DATASET;
      process.env.SANITY_API_READ_TOKEN = 'skValidToken123';

      expect(() => getSanityEnv()).toThrow(/NEXT_PUBLIC_SANITY_DATASET/);
      expect(() => getSanityEnv()).toThrow(/Environment variable validation failed/);
    });

    it('should throw error when SANITY_API_READ_TOKEN is missing', () => {
      // FR-003: Read token is required
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      delete process.env.SANITY_API_READ_TOKEN;

      expect(() => getSanityEnv()).toThrow(/SANITY_API_READ_TOKEN/);
      expect(() => getSanityEnv()).toThrow(/Environment variable validation failed/);
    });
  });

  describe('getSanityEnv - invalid formats', () => {
    it('should throw error when NEXT_PUBLIC_SANITY_PROJECT_ID has invalid format', () => {
      // FR-001: Project ID must be alphanumeric
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'Invalid-Project_ID!';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'skValidToken123';

      expect(() => getSanityEnv()).toThrow(/Invalid Sanity project ID format/);
    });

    it('should throw error when SANITY_API_READ_TOKEN has invalid format', () => {
      // FR-003, AC-004: Read token must start with "sk"
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'invalidtoken';

      expect(() => getSanityEnv()).toThrow(/Invalid Sanity token format/);
    });

    it('should throw error when SANITY_API_WRITE_TOKEN has invalid format', () => {
      // FR-004, AC-005: Write token must start with "sk"
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'skValidToken123';
      process.env.SANITY_API_WRITE_TOKEN = 'invalidwritetoken';

      expect(() => getSanityEnv()).toThrow(/Invalid Sanity token format/);
    });

    it('should accept valid dataset values only', () => {
      // FR-002: Dataset must be "production" or "development"
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'abc123';
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'invalid-dataset';
      process.env.SANITY_API_READ_TOKEN = 'skValidToken123';

      expect(() => getSanityEnv()).toThrow(/Dataset must be "production" or "development"/);
    });
  });

  describe('sanityEnvSchema - direct schema validation', () => {
    it('should validate schema with all fields present', () => {
      const result = sanityEnvSchema.safeParse({
        NEXT_PUBLIC_SANITY_PROJECT_ID: 'validproject123',
        NEXT_PUBLIC_SANITY_DATASET: 'production',
        SANITY_API_READ_TOKEN: 'skReadToken123',
        SANITY_API_WRITE_TOKEN: 'skWriteToken456',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SANITY_PROJECT_ID).toBe('validproject123');
        expect(result.data.NEXT_PUBLIC_SANITY_DATASET).toBe('production');
      }
    });

    it('should fail validation for empty strings', () => {
      const result = sanityEnvSchema.safeParse({
        NEXT_PUBLIC_SANITY_PROJECT_ID: '',
        NEXT_PUBLIC_SANITY_DATASET: 'production',
        SANITY_API_READ_TOKEN: 'skToken123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('error messages', () => {
    it('should provide helpful error message with documentation link', () => {
      // NFR-002: Clear error messages for misconfiguration
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
      process.env.SANITY_API_READ_TOKEN = 'skToken123';

      expect(() => getSanityEnv()).toThrow(/docs\/CONTRIBUTING.md/);
      expect(() => getSanityEnv()).toThrow(/\.env\.local/);
    });

    it('should list all validation errors when multiple fields are invalid', () => {
      // NFR-002: Comprehensive error reporting
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      process.env.NEXT_PUBLIC_SANITY_DATASET = 'invalid';
      process.env.SANITY_API_READ_TOKEN = 'notavalidtoken';

      let errorMessage = '';
      try {
        getSanityEnv();
      } catch (error) {
        errorMessage = (error as Error).message;
      }

      expect(errorMessage).toContain('NEXT_PUBLIC_SANITY_PROJECT_ID');
      expect(errorMessage).toContain('NEXT_PUBLIC_SANITY_DATASET');
      expect(errorMessage).toContain('SANITY_API_READ_TOKEN');
    });
  });
});
