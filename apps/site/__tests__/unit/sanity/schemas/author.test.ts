/**
 * Author Schema Unit Tests
 *
 * Tests the Author schema definition structure, field configuration,
 * and validation rules.
 *
 * Test Coverage:
 * - AC-001: Field structure validation
 * - AC-002: Slug auto-generation configuration
 * - AC-004: Image alt text requirement
 * - AC-005: Preview configuration
 * - AC-006: Required field validation
 * - AC-007: Optional bio field
 *
 * @module __tests__/unit/sanity/schemas/author
 */

import { describe, expect, it } from 'vitest';

import { authorSchema } from '@/sanity/schemas/documents/author';

import type { DocumentDefinition } from 'sanity';

// Type assertion for testing - we know authorSchema is a DocumentDefinition
const schema = authorSchema as DocumentDefinition;

describe('Author Schema', () => {
  it('should have correct schema structure', () => {
    // AC-001: Verify schema defines all required fields
    expect(schema.name).toBe('author');
    expect(schema.type).toBe('document');
    expect(schema.title).toBe('Author');
    expect(schema.fields).toHaveLength(4);
  });

  it('should have required name field with correct configuration', () => {
    // AC-001, AC-006: Name field is required with validation
    const nameField = schema.fields?.find((f: any) => f.name === 'name');

    expect(nameField).toBeDefined();
    expect(nameField?.type).toBe('string');
    expect(nameField?.title).toBe('Name');
    expect(nameField?.description).toContain('Full name of the author');
    expect(nameField?.validation).toBeDefined();
  });

  it('should have slug field with source set to name', () => {
    // AC-002: Slug auto-generation configured with source field set to name
    const slugField = schema.fields?.find((f: any) => f.name === 'slug') as any;

    expect(slugField).toBeDefined();
    expect(slugField?.type).toBe('slug');
    expect(slugField?.title).toBe('Slug');
    expect(slugField?.options).toBeDefined();
    expect(slugField?.options?.source).toBe('name');
    expect(slugField?.options?.maxLength).toBe(96);
    expect(slugField?.validation).toBeDefined();
  });

  it('should have optional bio field', () => {
    // AC-007: Bio field is optional
    const bioField = schema.fields?.find((f: any) => f.name === 'bio') as any;

    expect(bioField).toBeDefined();
    expect(bioField?.type).toBe('text');
    expect(bioField?.title).toBe('Biography');
    expect(bioField?.description).toContain('optional');
    expect(bioField?.rows).toBe(4);
    // Bio should not have required validation
  });

  it('should have required image field with alt text', () => {
    // AC-001, AC-004, AC-006: Image field is required with alt text for accessibility
    const imageField = schema.fields?.find((f: any) => f.name === 'image') as any;

    expect(imageField).toBeDefined();
    expect(imageField?.type).toBe('image');
    expect(imageField?.title).toBe('Profile Image');
    expect(imageField?.description).toContain('required');
    expect(imageField?.validation).toBeDefined();

    // Check hotspot option is enabled for smart cropping
    expect(imageField?.options).toBeDefined();
    expect(imageField?.options?.hotspot).toBe(true);

    // AC-004: Alt text field is required for accessibility
    expect(imageField?.fields).toBeDefined();
    const altField = imageField?.fields?.find((f: any) => f.name === 'alt');
    expect(altField).toBeDefined();
    expect(altField?.type).toBe('string');
    expect(altField?.title).toBe('Alternative Text');
    expect(altField?.validation).toBeDefined();
  });

  it('should configure preview with name and image', () => {
    // AC-005: Preview configuration shows author name and image
    expect(schema.preview).toBeDefined();
    expect(schema.preview?.select).toBeDefined();
    expect(schema.preview?.select?.title).toBe('name');
    expect(schema.preview?.select?.media).toBe('image');
  });

  it('should have all fields properly typed', () => {
    // Verify TypeScript schema type definition is correct
    expect(schema.fields).toBeDefined();

    const fieldNames = schema.fields?.map((f: any) => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('bio');
    expect(fieldNames).toContain('image');
  });

  it('should have appropriate field descriptions for editors', () => {
    // NFR-002: Fields have clear, descriptive labels and help text
    const fields = schema.fields ?? [];

    fields.forEach((field: any) => {
      // Each field should have a description for content editors
      if (field.name !== 'bio') {
        // Bio description checked separately
        expect(field.description).toBeDefined();
        expect(field.description).not.toBe('');
      }
    });
  });
});
