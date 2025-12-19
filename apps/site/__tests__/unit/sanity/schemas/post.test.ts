/**
 * Post Schema Unit Tests
 *
 * Tests for post schema validation and structure.
 * Covers FR-001 through FR-008 from requirements.
 *
 * Task: CP-04-004 (Post Schema & Content Management)
 *
 * @module __tests__/unit/sanity/schemas/post
 */

import { describe, it, expect } from 'vitest';
import { postSchema } from '@/sanity/schemas/documents/post';
import type { ObjectDefinition, FieldDefinition } from 'sanity';

describe('Post Schema', () => {
  it('should have correct schema name and type', () => {
    expect(postSchema.name).toBe('post');
    expect(postSchema.type).toBe('document');
    expect(postSchema.title).toBe('Post');
  });

  it('should have all required fields defined (FR-001)', () => {
    const schema = postSchema as ObjectDefinition;
    const fields = schema.fields;
    expect(fields).toBeDefined();
    expect(Array.isArray(fields)).toBe(true);

    const fieldNames = fields?.map((f: FieldDefinition) => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('publishedAt');
    expect(fieldNames).toContain('author');
    expect(fieldNames).toContain('body');
    expect(fieldNames).toContain('excerpt');
    expect(fieldNames).toContain('category');
    expect(fieldNames).toContain('tags');
    expect(fieldNames).toContain('featuredImage');
    expect(fieldNames).toContain('featured');
    expect(fieldNames).toContain('seo');
  });

  describe('Core Content Fields', () => {
    const schema = postSchema as ObjectDefinition;

    it('should configure title field correctly (FR-001, FR-005)', () => {
      const titleField = schema.fields?.find((f: FieldDefinition) => f.name === 'title');
      expect(titleField).toBeDefined();
      expect(titleField?.type).toBe('string');
      expect(titleField?.validation).toBeDefined();
      expect(titleField?.description).toContain('Post title');
    });

    it('should configure slug field correctly (FR-001, FR-005)', () => {
      const slugField = schema.fields?.find((f: FieldDefinition) => f.name === 'slug') as any;
      expect(slugField).toBeDefined();
      expect(slugField?.type).toBe('slug');
      expect(slugField?.options?.source).toBe('title');
      expect(slugField?.options?.maxLength).toBe(96);
      expect(slugField?.validation).toBeDefined();
    });

    it('should configure publishedAt field correctly (FR-001, FR-005)', () => {
      const publishedAtField = schema.fields?.find(
        (f: FieldDefinition) => f.name === 'publishedAt',
      ) as any;
      expect(publishedAtField).toBeDefined();
      expect(publishedAtField?.type).toBe('datetime');
      expect(publishedAtField?.validation).toBeDefined();
      expect(publishedAtField?.initialValue).toBeDefined();
    });

    it('should configure author field correctly (FR-003, FR-005)', () => {
      const authorField = schema.fields?.find((f: FieldDefinition) => f.name === 'author') as any;
      expect(authorField).toBeDefined();
      expect(authorField?.type).toBe('reference');
      expect(authorField?.to).toEqual([{ type: 'author' }]);
      expect(authorField?.validation).toBeDefined();
    });

    it('should configure body field with Portable Text (FR-002)', () => {
      const bodyField = schema.fields?.find((f: FieldDefinition) => f.name === 'body') as any;
      expect(bodyField).toBeDefined();
      expect(bodyField?.type).toBe('array');
      expect(bodyField?.of).toBeDefined();
      expect(Array.isArray(bodyField?.of)).toBe(true);

      // Check for block type
      const blockType = bodyField?.of?.find((type: any) => type.type === 'block');
      expect(blockType).toBeDefined();
      expect(blockType?.styles).toBeDefined();
      expect(blockType?.marks).toBeDefined();

      // Check for image type
      const imageType = bodyField?.of?.find((type: any) => type.type === 'image');
      expect(imageType).toBeDefined();
      expect(imageType?.options?.hotspot).toBe(true);
    });

    it('should configure excerpt field as optional (FR-001)', () => {
      const excerptField = schema.fields?.find((f: FieldDefinition) => f.name === 'excerpt');
      expect(excerptField).toBeDefined();
      expect(excerptField?.type).toBe('text');
      // Optional fields don't have .required() in validation
    });
  });

  describe('Categorisation Fields', () => {
    const schema = postSchema as ObjectDefinition;

    it('should configure category field correctly (FR-003)', () => {
      const categoryField = schema.fields?.find(
        (f: FieldDefinition) => f.name === 'category',
      ) as any;
      expect(categoryField).toBeDefined();
      expect(categoryField?.type).toBe('reference');
      expect(categoryField?.to).toEqual([{ type: 'category' }]);
      expect(categoryField?.options?.disableNew).toBe(true);
      expect(categoryField?.options?.filter).toBeDefined();
    });

    it('should configure tags field correctly (FR-003)', () => {
      const tagsField = schema.fields?.find((f: FieldDefinition) => f.name === 'tags') as any;
      expect(tagsField).toBeDefined();
      expect(tagsField?.type).toBe('array');
      expect(tagsField?.of).toBeDefined();
      expect(tagsField?.of[0]?.type).toBe('reference');
      expect(tagsField?.of[0]?.to).toEqual([{ type: 'tag' }]);
      expect(tagsField?.options?.disableNew).toBe(true);
      expect(tagsField?.options?.filter).toBeDefined();
      expect(tagsField?.validation).toBeDefined();
    });
  });

  describe('Media Fields', () => {
    const schema = postSchema as ObjectDefinition;

    it('should configure featuredImage field with alt text (FR-006)', () => {
      const featuredImageField = schema.fields?.find(
        (f: FieldDefinition) => f.name === 'featuredImage',
      ) as any;
      expect(featuredImageField).toBeDefined();
      expect(featuredImageField?.type).toBe('image');
      expect(featuredImageField?.options?.hotspot).toBe(true);

      // Check for alt text field
      const altField = featuredImageField?.fields?.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
      expect(altField?.type).toBe('string');
      expect(altField?.validation).toBeDefined();
    });

    it('should configure featured flag correctly (FR-006)', () => {
      const featuredField = schema.fields?.find(
        (f: FieldDefinition) => f.name === 'featured',
      ) as any;
      expect(featuredField).toBeDefined();
      expect(featuredField?.type).toBe('boolean');
      expect(featuredField?.initialValue).toBe(false);
    });
  });

  describe('SEO Fields', () => {
    const schema = postSchema as ObjectDefinition;

    it('should configure seo object field (FR-004)', () => {
      const seoField = schema.fields?.find((f: FieldDefinition) => f.name === 'seo') as any;
      expect(seoField).toBeDefined();
      expect(seoField?.type).toBe('object');
      expect(seoField?.options?.collapsible).toBe(true);
      expect(seoField?.fields).toBeDefined();
    });

    it('should have seo.title field (FR-004)', () => {
      const schema = postSchema as ObjectDefinition;
      const seoField = schema.fields?.find((f: FieldDefinition) => f.name === 'seo') as any;
      const titleField = seoField?.fields?.find((f: any) => f.name === 'title');
      expect(titleField).toBeDefined();
      expect(titleField?.type).toBe('string');
      expect(titleField?.validation).toBeDefined();
    });

    it('should have seo.description field (FR-004)', () => {
      const schema = postSchema as ObjectDefinition;
      const seoField = schema.fields?.find((f: FieldDefinition) => f.name === 'seo') as any;
      const descriptionField = seoField?.fields?.find((f: any) => f.name === 'description');
      expect(descriptionField).toBeDefined();
      expect(descriptionField?.type).toBe('text');
      expect(descriptionField?.validation).toBeDefined();
    });

    it('should have seo.image field (FR-004)', () => {
      const schema = postSchema as ObjectDefinition;
      const seoField = schema.fields?.find((f: FieldDefinition) => f.name === 'seo') as any;
      const imageField = seoField?.fields?.find((f: any) => f.name === 'image');
      expect(imageField).toBeDefined();
      expect(imageField?.type).toBe('image');
    });

    it('should have seo.canonicalUrl field (FR-004)', () => {
      const schema = postSchema as ObjectDefinition;
      const seoField = schema.fields?.find((f: FieldDefinition) => f.name === 'seo') as any;
      const canonicalUrlField = seoField?.fields?.find((f: any) => f.name === 'canonicalUrl');
      expect(canonicalUrlField).toBeDefined();
      expect(canonicalUrlField?.type).toBe('url');
    });
  });

  describe('Preview Configuration', () => {
    const schema = postSchema as ObjectDefinition;

    it('should configure preview with title, date, author, and image (FR-007)', () => {
      expect(schema.preview).toBeDefined();
      expect(schema.preview?.select).toBeDefined();
      expect(schema.preview?.prepare).toBeDefined();

      // Check preview select fields
      const select = schema.preview?.select;
      expect(select?.title).toBe('title');
      expect(select?.publishedAt).toBe('publishedAt');
      expect(select?.media).toBe('featuredImage');
      expect(select?.authorName).toBe('author.name');
    });

    it('should format preview correctly', () => {
      const schema = postSchema as ObjectDefinition;
      const prepare = schema.preview?.prepare;

      const result = prepare?.({
        title: 'Test Post',
        publishedAt: '2025-01-20T10:00:00Z',
        authorName: 'Jonno Daddia',
      });

      expect(result?.title).toBe('Test Post');
      expect(result?.subtitle).toContain('Jan');
      expect(result?.subtitle).toContain('Jonno Daddia');
    });

    it('should handle missing title', () => {
      const schema = postSchema as ObjectDefinition;
      const prepare = schema.preview?.prepare;

      const result = prepare?.({
        publishedAt: '2025-01-20T10:00:00Z',
        authorName: 'Jonno Daddia',
      });

      expect(result?.title).toBe('Untitled Post');
    });

    it('should handle missing publishedAt', () => {
      const schema = postSchema as ObjectDefinition;
      const prepare = schema.preview?.prepare;

      const result = prepare?.({
        title: 'Test Post',
        authorName: 'Jonno Daddia',
      });

      expect(result?.subtitle).toContain('No date');
    });

    it('should handle missing author', () => {
      const schema = postSchema as ObjectDefinition;
      const prepare = schema.preview?.prepare;

      const result = prepare?.({
        title: 'Test Post',
        publishedAt: '2025-01-20T10:00:00Z',
      });

      expect(result?.subtitle).not.toContain('undefined');
    });
  });

  describe('Orderings Configuration', () => {
    const schema = postSchema as any;

    it('should define orderings (FR-008)', () => {
      expect(schema.orderings).toBeDefined();
      expect(Array.isArray(schema.orderings)).toBe(true);
      expect(schema.orderings).toHaveLength(4);
    });

    it('should have publishedAt descending ordering', () => {
      const schema = postSchema as any;
      const ordering = schema.orderings?.find((o: any) => o.name === 'publishedAtDesc');
      expect(ordering).toBeDefined();
      expect(ordering?.title).toContain('Newest');
      expect(ordering?.by).toEqual([{ field: 'publishedAt', direction: 'desc' }]);
    });

    it('should have publishedAt ascending ordering', () => {
      const schema = postSchema as any;
      const ordering = schema.orderings?.find((o: any) => o.name === 'publishedAtAsc');
      expect(ordering).toBeDefined();
      expect(ordering?.title).toContain('Oldest');
      expect(ordering?.by).toEqual([{ field: 'publishedAt', direction: 'asc' }]);
    });

    it('should have title ascending ordering', () => {
      const schema = postSchema as any;
      const ordering = schema.orderings?.find((o: any) => o.name === 'titleAsc');
      expect(ordering).toBeDefined();
      expect(ordering?.title).toContain('A-Z');
      expect(ordering?.by).toEqual([{ field: 'title', direction: 'asc' }]);
    });

    it('should have title descending ordering', () => {
      const schema = postSchema as any;
      const ordering = schema.orderings?.find((o: any) => o.name === 'titleDesc');
      expect(ordering).toBeDefined();
      expect(ordering?.title).toContain('Z-A');
      expect(ordering?.by).toEqual([{ field: 'title', direction: 'desc' }]);
    });
  });

  describe('Field Descriptions', () => {
    const schema = postSchema as ObjectDefinition;

    it('should have descriptive help text for editors (NFR-002)', () => {
      const fields = schema.fields ?? [];

      fields.forEach((field: FieldDefinition) => {
        // Each field should have a description for content editors
        expect(field.description).toBeDefined();
        expect(field.description).not.toBe('');
      });
    });
  });
});
