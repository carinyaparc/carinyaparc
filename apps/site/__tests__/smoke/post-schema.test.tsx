/**
 * Post Schema Smoke Tests
 *
 * High-level smoke tests to verify post schema is registered and basic functionality works.
 * Run these after deployment to ensure the post system is operational.
 *
 * @module __tests__/smoke/post-schema
 */

import { describe, it, expect } from 'vitest';
import { postSchema } from '@/sanity/schemas/documents/post';
import { schemaTypes } from '@/sanity/schemas';
import {
  mockPosts,
  getPostsByCategory,
  getPostsByTag,
  getFeaturedPosts,
  getPostById,
  getPostBySlug,
  getPostsByAuthor,
  getPostsByPublishDate,
} from '../fixtures/posts';
import type { ObjectDefinition } from 'sanity';

describe('Post Schema Smoke Tests', () => {
  it('should be registered in schema types', () => {
    const postSchemaRegistered = schemaTypes.find((schema) => schema.name === 'post');
    expect(postSchemaRegistered).toBeDefined();
    expect(postSchemaRegistered?.name).toBe('post');
  });

  it('should have all required fields defined', () => {
    const schema = postSchema as ObjectDefinition;
    const requiredFields = [
      'title',
      'slug',
      'publishedAt',
      'author',
      'body',
      'excerpt',
      'category',
      'tags',
      'featuredImage',
      'featured',
      'seo',
    ];
    const schemaFieldNames = schema.fields?.map((field) => field.name) || [];

    requiredFields.forEach((fieldName) => {
      expect(schemaFieldNames).toContain(fieldName);
    });
  });

  it('should have preview configuration', () => {
    const schema = postSchema as ObjectDefinition;
    expect(schema.preview).toBeDefined();
    expect(schema.preview?.select).toBeDefined();
    expect(schema.preview?.prepare).toBeDefined();
  });

  it('should have orderings configuration', () => {
    const schema = postSchema as any;
    expect(schema.orderings).toBeDefined();
    expect(Array.isArray(schema.orderings)).toBe(true);
    expect(schema.orderings?.length).toBe(4);
  });

  describe('Test Fixtures', () => {
    it('should have mock posts', () => {
      expect(mockPosts.length).toBeGreaterThan(0);
      expect(mockPosts.every((post) => post._type === 'post')).toBe(true);
    });

    it('should filter posts by category', () => {
      const posts = getPostsByCategory('category-regenerative-agriculture');
      expect(posts.length).toBeGreaterThan(0);
      posts.forEach((post) => {
        expect(post.category?._ref).toBe('category-regenerative-agriculture');
      });
    });

    it('should filter posts by tag', () => {
      const posts = getPostsByTag('tag-permaculture');
      expect(posts.length).toBeGreaterThan(0);
      posts.forEach((post) => {
        expect(post.tags?.some((tag) => tag._ref === 'tag-permaculture')).toBe(true);
      });
    });

    it('should filter featured posts', () => {
      const featuredPosts = getFeaturedPosts();
      expect(featuredPosts.length).toBeGreaterThan(0);
      featuredPosts.forEach((post) => {
        expect(post.featured).toBe(true);
      });
    });

    it('should retrieve post by ID', () => {
      const post = getPostById('post-masterchef-to-mud-boots');
      expect(post).toBeDefined();
      expect(post?.title).toBe('From MasterChef to Mud Boots');
    });

    it('should retrieve post by slug', () => {
      const post = getPostBySlug('restoring-42-ha-land');
      expect(post).toBeDefined();
      expect(post?.title).toBe('Restoring 42 Hectares of Degraded Land');
    });

    it('should filter posts by author', () => {
      const posts = getPostsByAuthor('author-jonno-daddia');
      expect(posts.length).toBe(mockPosts.length); // All test posts are by this author
      posts.forEach((post) => {
        expect(post.author._ref).toBe('author-jonno-daddia');
      });
    });

    it('should order posts by publish date', () => {
      const posts = getPostsByPublishDate();
      expect(posts.length).toBe(mockPosts.length);

      // Verify ordering (newest first)
      for (let i = 1; i < posts.length; i++) {
        const prevPost = posts[i - 1];
        const currPost = posts[i];
        if (prevPost && currPost) {
          const prev = new Date(prevPost.publishedAt).getTime();
          const curr = new Date(currPost.publishedAt).getTime();
          expect(prev).toBeGreaterThanOrEqual(curr);
        }
      }
    });
  });

  describe('Schema Validation Rules', () => {
    const schema = postSchema as ObjectDefinition;

    it('should enforce title validation', () => {
      const titleField = schema.fields?.find((f) => f.name === 'title');
      expect(titleField?.validation).toBeDefined();
    });

    it('should enforce slug validation and uniqueness', () => {
      const slugField = schema.fields?.find((f) => f.name === 'slug');
      expect(slugField?.validation).toBeDefined();
    });

    it('should enforce publishedAt validation', () => {
      const publishedAtField = schema.fields?.find((f) => f.name === 'publishedAt');
      expect(publishedAtField?.validation).toBeDefined();
    });

    it('should enforce author validation', () => {
      const authorField = schema.fields?.find((f) => f.name === 'author');
      expect(authorField?.validation).toBeDefined();
    });

    it('should validate excerpt length', () => {
      const excerptField = schema.fields?.find((f) => f.name === 'excerpt');
      expect(excerptField?.validation).toBeDefined();
    });

    it('should validate tags array length', () => {
      const tagsField = schema.fields?.find((f) => f.name === 'tags');
      expect(tagsField?.validation).toBeDefined();
    });
  });

  describe('Preview Formatting', () => {
    const schema = postSchema as ObjectDefinition;
    const prepareFunc = schema.preview?.prepare;

    it('should format preview correctly with all fields', () => {
      expect(prepareFunc).toBeDefined();

      if (prepareFunc) {
        const result = prepareFunc({
          title: 'Test Post',
          publishedAt: '2025-01-20T10:00:00Z',
          authorName: 'Jonno Daddia',
        });

        expect(result.title).toBe('Test Post');
        expect(result.subtitle).toContain('Jan');
        expect(result.subtitle).toContain('2025');
        expect(result.subtitle).toContain('Jonno Daddia');
      }
    });

    it('should handle missing title', () => {
      if (prepareFunc) {
        const result = prepareFunc({
          publishedAt: '2025-01-20T10:00:00Z',
          authorName: 'Jonno Daddia',
        });

        expect(result.title).toBe('Untitled Post');
      }
    });

    it('should handle missing publishedAt', () => {
      if (prepareFunc) {
        const result = prepareFunc({
          title: 'Test Post',
          authorName: 'Jonno Daddia',
        });

        expect(result.subtitle).toContain('No date');
      }
    });

    it('should handle missing author', () => {
      if (prepareFunc) {
        const result = prepareFunc({
          title: 'Test Post',
          publishedAt: '2025-01-20T10:00:00Z',
        });

        expect(result.subtitle).toBeDefined();
        expect(result.subtitle).not.toContain('undefined');
      }
    });
  });

  describe('SEO Configuration', () => {
    const schema = postSchema as ObjectDefinition;
    const seoField = schema.fields?.find((f) => f.name === 'seo') as any;

    it('should have SEO object field', () => {
      expect(seoField).toBeDefined();
      expect(seoField?.type).toBe('object');
    });

    it('should have all SEO subfields', () => {
      const seoSubfields = seoField?.fields?.map((f: any) => f.name) || [];
      expect(seoSubfields).toContain('title');
      expect(seoSubfields).toContain('description');
      expect(seoSubfields).toContain('image');
      expect(seoSubfields).toContain('canonicalUrl');
    });

    it('should validate SEO title length', () => {
      if (seoField?.fields) {
        const titleField = seoField.fields.find((f: any) => f.name === 'title');
        expect(titleField?.validation).toBeDefined();
      }
    });

    it('should validate SEO description length', () => {
      if (seoField?.fields) {
        const descriptionField = seoField.fields.find((f: any) => f.name === 'description');
        expect(descriptionField?.validation).toBeDefined();
      }
    });
  });

  describe('Portable Text Configuration', () => {
    const schema = postSchema as ObjectDefinition;
    const bodyField = schema.fields?.find((f) => f.name === 'body') as any;

    it('should configure body as Portable Text array', () => {
      expect(bodyField).toBeDefined();
      expect(bodyField?.type).toBe('array');
      expect(bodyField?.of).toBeDefined();
    });

    it('should include block type with styles', () => {
      const blockType = bodyField?.of?.find((type: any) => type.type === 'block');
      expect(blockType).toBeDefined();
      expect(blockType?.styles).toBeDefined();
      expect(Array.isArray(blockType?.styles)).toBe(true);

      const styleValues = blockType?.styles?.map((s: any) => s.value);
      expect(styleValues).toContain('normal');
      expect(styleValues).toContain('h2');
      expect(styleValues).toContain('h3');
      expect(styleValues).toContain('h4');
      expect(styleValues).toContain('blockquote');
    });

    it('should include marks decorators', () => {
      const blockType = bodyField?.of?.find((type: any) => type.type === 'block');
      expect(blockType?.marks?.decorators).toBeDefined();

      const decoratorValues = blockType?.marks?.decorators?.map((d: any) => d.value);
      expect(decoratorValues).toContain('strong');
      expect(decoratorValues).toContain('em');
      expect(decoratorValues).toContain('code');
    });

    it('should include link annotation', () => {
      const blockType = bodyField?.of?.find((type: any) => type.type === 'block');
      expect(blockType?.marks?.annotations).toBeDefined();

      const linkAnnotation = blockType?.marks?.annotations?.find((a: any) => a.name === 'link');
      expect(linkAnnotation).toBeDefined();
    });

    it('should include image type in body', () => {
      const imageType = bodyField?.of?.find((type: any) => type.type === 'image');
      expect(imageType).toBeDefined();
      expect(imageType?.options?.hotspot).toBe(true);

      const altField = imageType?.fields?.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
      expect(altField?.validation).toBeDefined();
    });
  });

  describe('Reference Field Filtering', () => {
    const schema = postSchema as ObjectDefinition;

    it('should filter category references to post-applicable categories', () => {
      const categoryField = schema.fields?.find((f) => f.name === 'category') as any;
      expect(categoryField?.options?.filter).toBeDefined();
      expect(categoryField?.options?.disableNew).toBe(true);
    });

    it('should filter tag references to post-applicable tags', () => {
      const tagsField = schema.fields?.find((f) => f.name === 'tags') as any;
      expect(tagsField?.of).toBeDefined();
      const tagRef = tagsField?.of?.[0];
      expect(tagRef?.options?.filter).toBeDefined();
      expect(tagRef?.options?.disableNew).toBe(true);
    });
  });
});
