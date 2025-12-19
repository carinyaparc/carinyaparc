/**
 * Tag Schema Smoke Tests
 *
 * High-level smoke tests to verify tag schema is registered and basic functionality works.
 * Run these after deployment to ensure the tag system is operational.
 *
 * @module __tests__/smoke/tag-schema
 */

import { describe, it, expect } from 'vitest';
import { tagSchema } from '@/sanity/schemas/documents/tag';
import { schemaTypes } from '@/sanity/schemas';
import { mockTags, getTagsByContentType, getTagById, getTagBySlug } from '../fixtures/tags';
import type { ObjectDefinition } from 'sanity';

describe('Tag Schema Smoke Tests', () => {
  it('should be registered in schema types', () => {
    const tagSchemaRegistered = schemaTypes.find((schema) => schema.name === 'tag');
    expect(tagSchemaRegistered).toBeDefined();
    expect(tagSchemaRegistered?.name).toBe('tag');
  });

  it('should have all required fields defined', () => {
    const schema = tagSchema as ObjectDefinition;
    const requiredFields = ['title', 'slug', 'contentTypes'];
    const schemaFieldNames = schema.fields?.map((field) => field.name) || [];

    requiredFields.forEach((fieldName) => {
      expect(schemaFieldNames).toContain(fieldName);
    });
  });

  it('should have preview configuration', () => {
    const schema = tagSchema as ObjectDefinition;
    expect(schema.preview).toBeDefined();
    expect(schema.preview?.select).toBeDefined();
    expect(schema.preview?.prepare).toBeDefined();
  });

  describe('Test Fixtures', () => {
    it('should have mock tags with various scopes', () => {
      expect(mockTags.length).toBeGreaterThan(0);

      const bothTypes = mockTags.filter(
        (tag) => tag.contentTypes.includes('post') && tag.contentTypes.includes('recipe'),
      );
      const postOnly = mockTags.filter(
        (tag) => tag.contentTypes.includes('post') && !tag.contentTypes.includes('recipe'),
      );
      const recipeOnly = mockTags.filter(
        (tag) => !tag.contentTypes.includes('post') && tag.contentTypes.includes('recipe'),
      );

      expect(bothTypes.length).toBeGreaterThan(0);
      expect(postOnly.length).toBeGreaterThan(0);
      expect(recipeOnly.length).toBeGreaterThan(0);
    });

    it('should filter tags by content type', () => {
      const postTags = getTagsByContentType('post');
      const recipeTags = getTagsByContentType('recipe');

      expect(postTags.length).toBeGreaterThan(0);
      expect(recipeTags.length).toBeGreaterThan(0);

      postTags.forEach((tag) => {
        expect(tag.contentTypes).toContain('post');
      });

      recipeTags.forEach((tag) => {
        expect(tag.contentTypes).toContain('recipe');
      });
    });

    it('should retrieve tag by ID', () => {
      const tag = getTagById('tag-permaculture');
      expect(tag).toBeDefined();
      expect(tag?.title).toBe('Permaculture');
    });

    it('should retrieve tag by slug', () => {
      const tag = getTagBySlug('winter-growing');
      expect(tag).toBeDefined();
      expect(tag?.title).toBe('Winter Growing');
      expect(tag?.contentTypes).toEqual(['post']);
    });
  });

  describe('Schema Validation Rules', () => {
    it('should enforce title length constraints', () => {
      const schema = tagSchema as ObjectDefinition;
      const titleField = schema.fields?.find((f) => f.name === 'title');
      expect(titleField?.validation).toBeDefined();
      // Validation rules are applied in Sanity Studio
      // This test confirms they exist
    });

    it('should enforce slug uniqueness', () => {
      const schema = tagSchema as ObjectDefinition;
      const slugField = schema.fields?.find((f) => f.name === 'slug');
      expect(slugField?.validation).toBeDefined();
      // Async validation tested in integration tests
    });

    it('should require at least one content type', () => {
      const schema = tagSchema as ObjectDefinition;
      const contentTypesField = schema.fields?.find((f) => f.name === 'contentTypes');
      expect(contentTypesField?.validation).toBeDefined();
      expect(contentTypesField?.initialValue).toEqual(['post', 'recipe']);
    });
  });

  describe('Preview Formatting', () => {
    it('should format preview correctly for different scopes', () => {
      const schema = tagSchema as ObjectDefinition;
      const prepareFunc = schema.preview?.prepare;
      expect(prepareFunc).toBeDefined();

      if (prepareFunc) {
        // Both types
        const both = prepareFunc({ title: 'Test Tag', contentTypes: ['post', 'recipe'] });
        expect(both.title).toBe('Test Tag');
        expect(both.subtitle).toContain('Posts');
        expect(both.subtitle).toContain('Recipes');

        // Post only
        const postOnly = prepareFunc({ title: 'Post Tag', contentTypes: ['post'] });
        expect(postOnly.subtitle).toContain('Posts only');

        // Recipe only
        const recipeOnly = prepareFunc({ title: 'Recipe Tag', contentTypes: ['recipe'] });
        expect(recipeOnly.subtitle).toContain('Recipes only');
      }
    });
  });
});
