/**
 * Category Schema Smoke Tests
 *
 * High-level smoke tests to verify category schema is properly integrated
 * into Sanity Studio and can be queried via the client.
 *
 * Task: CP-04-002 (Category Taxonomy System)
 *
 * @module __tests__/smoke/category-schema
 */

import { describe, it, expect } from 'vitest';
import { schemaTypes } from '@/sanity/schemas';
import { categorySchema } from '@/sanity/schemas/documents/category';
import type { ObjectDefinition, FieldDefinition } from 'sanity';

describe('Category Schema Integration (Smoke)', () => {
  it('should export category schema from documents', () => {
    expect(categorySchema).toBeDefined();
    expect(categorySchema.name).toBe('category');
    expect(categorySchema.type).toBe('document');
  });

  it('should be registered in schemaTypes array', () => {
    const categoryType = schemaTypes.find((type) => type.name === 'category');
    expect(categoryType).toBeDefined();
    expect(categoryType?.type).toBe('document');
  });

  it('should have all required fields configured', () => {
    const schema = categorySchema as ObjectDefinition;
    const fields = schema.fields;
    expect(fields).toBeDefined();
    expect(fields?.length).toBeGreaterThan(0);

    const fieldNames = fields?.map((f: FieldDefinition) => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('parent');
    expect(fieldNames).toContain('contentTypes');
  });

  it('should have preview configuration', () => {
    const schema = categorySchema as ObjectDefinition;
    expect(schema.preview).toBeDefined();
    expect(schema.preview?.select).toBeDefined();
    expect(schema.preview?.prepare).toBeDefined();
  });

  it('should support hierarchical references to itself', () => {
    const schema = categorySchema as ObjectDefinition;
    const parentField = schema.fields?.find((f: FieldDefinition) => f.name === 'parent') as any;
    expect(parentField).toBeDefined();
    expect(parentField?.type).toBe('reference');
    expect(parentField?.to).toEqual([{ type: 'category' }]);
  });

  it('should have content type scoping configured', () => {
    const schema = categorySchema as ObjectDefinition;
    const contentTypesField = schema.fields?.find(
      (f: FieldDefinition) => f.name === 'contentTypes',
    ) as any;
    expect(contentTypesField).toBeDefined();
    expect(contentTypesField?.type).toBe('array');

    const options = contentTypesField?.options?.list;
    expect(options).toHaveLength(2);
    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'post' }),
        expect.objectContaining({ value: 'recipe' }),
      ]),
    );
  });
});
