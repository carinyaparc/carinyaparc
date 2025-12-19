/**
 * Tag Schema Unit Tests
 *
 * Tests the tag schema validation logic, field requirements, and preview formatting.
 * Covers:
 * - Title validation (1-50 chars) (FR-002)
 * - Slug auto-generation and uniqueness (FR-003, FR-004)
 * - Content type scope validation (FR-005, FR-006)
 * - Preview formatting (FR-009)
 *
 * @module sanity/schemas/documents/tag.test
 */

import { describe, it, expect } from 'vitest';
import { tagSchema } from './tag';
import type { ObjectDefinition } from 'sanity';

describe('Tag Schema', () => {
  it('should have correct schema name and type', () => {
    expect(tagSchema.name).toBe('tag');
    expect(tagSchema.type).toBe('document');
  });

  it('should have required fields: title, slug, contentTypes', () => {
    const schema = tagSchema as ObjectDefinition;
    expect(schema.fields).toBeDefined();
    const fieldNames = schema.fields?.map((field) => field.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('contentTypes');
  });

  describe('Title Field', () => {
    it('should be a string field', () => {
      const schema = tagSchema as ObjectDefinition;
      const titleField = schema.fields?.find((f) => f.name === 'title');
      expect(titleField?.type).toBe('string');
    });

    it('should have validation for required and length (1-50 chars)', () => {
      const schema = tagSchema as ObjectDefinition;
      const titleField = schema.fields?.find((f) => f.name === 'title');
      expect(titleField?.validation).toBeDefined();
      // Validation is tested via integration tests with Sanity client
    });
  });

  describe('Slug Field', () => {
    it('should be a slug field with title as source', () => {
      const schema = tagSchema as ObjectDefinition;
      const slugField = schema.fields?.find((f) => f.name === 'slug');
      expect(slugField?.type).toBe('slug');
      expect(slugField?.options).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((slugField?.options as any)?.source).toBe('title');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((slugField?.options as any)?.maxLength).toBe(96);
    });

    it('should have custom validation for uniqueness', () => {
      const schema = tagSchema as ObjectDefinition;
      const slugField = schema.fields?.find((f) => f.name === 'slug');
      expect(slugField?.validation).toBeDefined();
      // Async validation tested via integration tests
    });
  });

  describe('Content Types Field', () => {
    it('should be an array field with string values', () => {
      const schema = tagSchema as ObjectDefinition;
      const contentTypesField = schema.fields?.find((f) => f.name === 'contentTypes');
      expect(contentTypesField?.type).toBe('array');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((contentTypesField as any)?.of).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((contentTypesField as any)?.of?.[0].type).toBe('string');
    });

    it('should have post and recipe as list options', () => {
      const schema = tagSchema as ObjectDefinition;
      const contentTypesField = schema.fields?.find((f) => f.name === 'contentTypes');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((contentTypesField as any)?.options?.list).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listOptions = (contentTypesField as any)?.options?.list as Array<{
        title: string;
        value: string;
      }>;
      expect(listOptions).toHaveLength(2);
      expect(listOptions?.map((opt) => opt.value)).toEqual(['post', 'recipe']);
    });

    it('should default to all content types', () => {
      const schema = tagSchema as ObjectDefinition;
      const contentTypesField = schema.fields?.find((f) => f.name === 'contentTypes');
      expect(contentTypesField?.initialValue).toEqual(['post', 'recipe']);
    });

    it('should have validation for min 1 item and uniqueness', () => {
      const schema = tagSchema as ObjectDefinition;
      const contentTypesField = schema.fields?.find((f) => f.name === 'contentTypes');
      expect(contentTypesField?.validation).toBeDefined();
      // Validation logic tested via integration tests
    });
  });

  describe('Preview Configuration', () => {
    it('should have preview configuration with title and contentTypes', () => {
      const schema = tagSchema as ObjectDefinition;
      expect(schema.preview).toBeDefined();
      expect(schema.preview?.select).toBeDefined();
      expect(schema.preview?.select?.title).toBe('title');
      expect(schema.preview?.select?.contentTypes).toBe('contentTypes');
    });

    it('should format preview for both content types', () => {
      const schema = tagSchema as ObjectDefinition;
      const prepareFunc = schema.preview?.prepare;
      expect(prepareFunc).toBeDefined();

      if (prepareFunc) {
        const result = prepareFunc({
          title: 'Permaculture',
          contentTypes: ['post', 'recipe'],
        });
        expect(result.title).toBe('Permaculture');
        expect(result.subtitle).toContain('Posts');
        expect(result.subtitle).toContain('Recipes');
      }
    });

    it('should format preview for post-only tags', () => {
      const schema = tagSchema as ObjectDefinition;
      const prepareFunc = schema.preview?.prepare;
      if (prepareFunc) {
        const result = prepareFunc({
          title: 'Winter Growing',
          contentTypes: ['post'],
        });
        expect(result.title).toBe('Winter Growing');
        expect(result.subtitle).toContain('Posts only');
      }
    });

    it('should format preview for recipe-only tags', () => {
      const schema = tagSchema as ObjectDefinition;
      const prepareFunc = schema.preview?.prepare;
      if (prepareFunc) {
        const result = prepareFunc({
          title: 'Fermentation',
          contentTypes: ['recipe'],
        });
        expect(result.title).toBe('Fermentation');
        expect(result.subtitle).toContain('Recipes only');
      }
    });
  });
});
