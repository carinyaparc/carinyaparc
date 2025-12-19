/**
 * Category Schema Unit Tests
 *
 * Tests for category schema validation and structure.
 * Covers FR-001 through FR-008 from requirements.
 *
 * Task: CP-04-002 (Category Taxonomy System)
 *
 * @module __tests__/unit/sanity/schemas/category
 */

import { describe, it, expect } from 'vitest';
import { categorySchema } from '@/sanity/schemas/documents/category';
import type { ObjectDefinition, FieldDefinition } from 'sanity';

describe('Category Schema', () => {
  it('should have correct schema name and type', () => {
    expect(categorySchema.name).toBe('category');
    expect(categorySchema.type).toBe('document');
  });

  it('should have required fields defined', () => {
    const schema = categorySchema as ObjectDefinition;
    const fields = schema.fields;
    expect(fields).toBeDefined();
    expect(Array.isArray(fields)).toBe(true);

    const fieldNames = fields?.map((f: FieldDefinition) => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('parent');
    expect(fieldNames).toContain('contentTypes');
  });

  it('should configure title field correctly (FR-001)', () => {
    const schema = categorySchema as ObjectDefinition;
    const titleField = schema.fields?.find((f: FieldDefinition) => f.name === 'title');
    expect(titleField).toBeDefined();
    expect(titleField?.type).toBe('string');
    expect(titleField?.validation).toBeDefined();
  });

  it('should configure slug field correctly (FR-002, FR-008)', () => {
    const schema = categorySchema as ObjectDefinition;
    const slugField = schema.fields?.find((f: FieldDefinition) => f.name === 'slug') as any;
    expect(slugField).toBeDefined();
    expect(slugField?.type).toBe('slug');
    expect(slugField?.options?.source).toBe('title');
    expect(slugField?.options?.maxLength).toBe(96);
    expect(slugField?.validation).toBeDefined();
  });

  it('should configure description field as optional (FR-001)', () => {
    const schema = categorySchema as ObjectDefinition;
    const descriptionField = schema.fields?.find((f: FieldDefinition) => f.name === 'description');
    expect(descriptionField).toBeDefined();
    expect(descriptionField?.type).toBe('text');
    // Optional fields don't have .required() in validation
  });

  it('should configure parent field for hierarchy (FR-003)', () => {
    const schema = categorySchema as ObjectDefinition;
    const parentField = schema.fields?.find((f: FieldDefinition) => f.name === 'parent') as any;
    expect(parentField).toBeDefined();
    expect(parentField?.type).toBe('reference');
    expect(parentField?.to).toEqual([{ type: 'category' }]);
    expect(parentField?.options?.disableNew).toBe(true);
    expect(parentField?.validation).toBeDefined();
  });

  it('should configure contentTypes field for scoping (FR-004)', () => {
    const schema = categorySchema as ObjectDefinition;
    const contentTypesField = schema.fields?.find(
      (f: FieldDefinition) => f.name === 'contentTypes',
    ) as any;
    expect(contentTypesField).toBeDefined();
    expect(contentTypesField?.type).toBe('array');
    expect(contentTypesField?.validation).toBeDefined();
    expect(contentTypesField?.initialValue).toEqual(['post', 'recipe']);

    // Check content type options
    const options = contentTypesField?.options?.list;
    expect(options).toBeDefined();
    expect(Array.isArray(options)).toBe(true);
    expect(options).toHaveLength(2);
    expect(options).toEqual([
      { title: 'Posts', value: 'post' },
      { title: 'Recipes', value: 'recipe' },
    ]);
  });

  it('should configure preview with hierarchy and content types (FR-006, FR-007)', () => {
    const schema = categorySchema as ObjectDefinition;
    expect(schema.preview).toBeDefined();
    expect(schema.preview?.select).toBeDefined();
    expect(schema.preview?.prepare).toBeDefined();

    // Check preview select fields
    const select = schema.preview?.select;
    expect(select?.title).toBe('title');
    expect(select?.parentTitle).toBe('parent.title');
    expect(select?.parentParentTitle).toBe('parent.parent.title');
    expect(select?.contentTypes).toBe('contentTypes');
  });

  describe('Preview Prepare Function', () => {
    const schema = categorySchema as ObjectDefinition;
    const prepare = schema.preview?.prepare;

    it('should format title without parent (top-level category)', () => {
      const result = prepare?.({
        title: 'Sustainability',
        contentTypes: ['post', 'recipe'],
      });
      expect(result?.title).toBe('Sustainability');
      expect(result?.subtitle).toBe('Applies to: Posts, Recipes');
    });

    it('should format title with one parent level', () => {
      const result = prepare?.({
        title: 'Soil Health',
        parentTitle: 'Regenerative Agriculture',
        contentTypes: ['post'],
      });
      expect(result?.title).toBe('Regenerative Agriculture > Soil Health');
      expect(result?.subtitle).toBe('Applies to: Posts');
    });

    it('should format title with two parent levels', () => {
      const result = prepare?.({
        title: 'Composting',
        parentTitle: 'Soil Health',
        parentParentTitle: 'Regenerative Agriculture',
        contentTypes: ['post', 'recipe'],
      });
      expect(result?.title).toBe('Regenerative Agriculture > Soil Health > Composting');
      expect(result?.subtitle).toBe('Applies to: Posts, Recipes');
    });

    it('should handle recipe-only content type', () => {
      const result = prepare?.({
        title: 'Seasonal Cooking',
        contentTypes: ['recipe'],
      });
      expect(result?.subtitle).toBe('Applies to: Recipes');
    });

    it('should handle missing content types', () => {
      const result = prepare?.({
        title: 'Test Category',
        contentTypes: [],
      });
      expect(result?.subtitle).toBe('No content types selected');
    });
  });
});
