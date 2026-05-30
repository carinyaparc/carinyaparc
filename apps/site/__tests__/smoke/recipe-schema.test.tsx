/**
 * Recipe Schema Smoke Tests
 *
 * High-level smoke tests to ensure recipe schema is properly registered
 * and integrated with the Sanity configuration.
 *
 * Coverage:
 * - Schema registration in schemaTypes array
 * - Schema structure and basic properties
 * - Critical field presence
 *
 * @module __tests__/smoke/recipe-schema
 */

import { describe, it, expect } from 'vitest';
import { schemaTypes } from '@/sanity/schemas';
import type { ObjectDefinition, DocumentDefinition } from 'sanity';

describe('Recipe Schema Smoke Tests', () => {
  describe('Schema Registration', () => {
    it('should include recipe schema in schemaTypes array', () => {
      const schemaNames = schemaTypes.map((schema) => schema.name);

      expect(schemaNames).toContain('recipe');
    });

    it('should include recipeIngredient schema in schemaTypes array', () => {
      const schemaNames = schemaTypes.map((schema) => schema.name);

      expect(schemaNames).toContain('recipeIngredient');
    });

    it('should register recipe schema as document type', () => {
      const recipeSchema = schemaTypes.find((schema) => schema.name === 'recipe');

      expect(recipeSchema).toBeDefined();
      expect(recipeSchema?.type).toBe('document');
    });

    it('should register recipeIngredient schema as object type', () => {
      const ingredientSchema = schemaTypes.find((schema) => schema.name === 'recipeIngredient');

      expect(ingredientSchema).toBeDefined();
      expect(ingredientSchema?.type).toBe('object');
    });
  });

  describe('Recipe Schema Structure', () => {
    const recipeSchema = schemaTypes.find((schema) => schema.name === 'recipe') as
      | DocumentDefinition
      | undefined;

    it('should have fields array', () => {
      expect(recipeSchema?.fields).toBeDefined();
      expect(Array.isArray(recipeSchema?.fields)).toBe(true);
      expect(recipeSchema?.fields.length).toBeGreaterThan(0);
    });

    it('should have preview configuration', () => {
      expect(recipeSchema?.preview).toBeDefined();
      expect(recipeSchema?.preview?.select).toBeDefined();
      expect(recipeSchema?.preview?.prepare).toBeDefined();
    });

    it('should have field groups', () => {
      expect(recipeSchema?.groups).toBeDefined();
      expect(recipeSchema?.groups?.length).toBe(3);
    });
  });

  describe('Critical Recipe Fields', () => {
    const recipeSchema = schemaTypes.find((schema) => schema.name === 'recipe') as
      | DocumentDefinition
      | undefined;
    const fieldNames = recipeSchema?.fields.map((f: any) => f.name) || [];

    it('should have title field', () => {
      expect(fieldNames).toContain('title');
    });

    it('should have slug field', () => {
      expect(fieldNames).toContain('slug');
    });

    it('should have author field', () => {
      expect(fieldNames).toContain('author');
    });

    it('should have ingredients field', () => {
      expect(fieldNames).toContain('ingredients');
    });

    it('should have instructions field', () => {
      expect(fieldNames).toContain('instructions');
    });

    it('should have featuredImage field', () => {
      expect(fieldNames).toContain('featuredImage');
    });

    it('should have publishedAt field', () => {
      expect(fieldNames).toContain('publishedAt');
    });
  });

  describe('Critical Recipe Ingredient Fields', () => {
    const ingredientSchema = schemaTypes.find((schema) => schema.name === 'recipeIngredient') as
      | ObjectDefinition
      | undefined;
    const fieldNames = ingredientSchema?.fields.map((f: any) => f.name) || [];

    it('should have ingredient field', () => {
      expect(fieldNames).toContain('ingredient');
    });

    it('should have quantity field', () => {
      expect(fieldNames).toContain('quantity');
    });

    it('should have unit field', () => {
      expect(fieldNames).toContain('unit');
    });

    it('should have notes field', () => {
      expect(fieldNames).toContain('notes');
    });
  });

  describe('Schema Dependencies', () => {
    it('should have all dependent schemas registered', () => {
      const schemaNames = schemaTypes.map((schema) => schema.name);

      // Recipe depends on these schemas
      expect(schemaNames).toContain('author');
      expect(schemaNames).toContain('category');
      expect(schemaNames).toContain('tag');
    });
  });
});
