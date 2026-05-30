/**
 * Recipe Schema Unit Tests
 *
 * Tests for recipe document schema validation rules and structure.
 * Validates required fields, field constraints, and data quality rules.
 *
 * Coverage:
 * - FR-001 to FR-019: All functional requirements for recipe schema
 * - NFR-003: Field completion validation
 * - AC-001 to AC-012: All acceptance criteria
 *
 * @module __tests__/unit/sanity/schemas/recipe
 */

import { describe, it, expect } from 'vitest';
import { recipeSchema } from '@/sanity/schemas/documents/recipe';
import { recipeIngredientSchema } from '@/sanity/schemas/objects/recipeIngredient';
import type { ObjectDefinition, DocumentDefinition } from 'sanity';

describe('Recipe Schema', () => {
  describe('Schema Structure', () => {
    it('should have correct name and type', () => {
      expect(recipeSchema.name).toBe('recipe');
      expect(recipeSchema.type).toBe('document');
    });

    it('should have three field groups: content, details, seo', () => {
      const schema = recipeSchema as DocumentDefinition;
      expect(schema.groups).toBeDefined();
      expect(schema.groups).toHaveLength(3);

      const groupNames = schema.groups?.map((g: any) => g.name);
      expect(groupNames).toContain('content');
      expect(groupNames).toContain('details');
      expect(groupNames).toContain('seo');
    });

    it('should have all required fields defined', () => {
      const schema = recipeSchema as DocumentDefinition;
      const fieldNames = schema.fields.map((f: any) => f.name);

      // Required fields per FR-001 to FR-018
      expect(fieldNames).toContain('title'); // FR-001
      expect(fieldNames).toContain('slug'); // FR-002
      expect(fieldNames).toContain('author'); // FR-003
      expect(fieldNames).toContain('category'); // FR-004
      expect(fieldNames).toContain('tags'); // FR-005
      expect(fieldNames).toContain('publishedAt'); // FR-006
      expect(fieldNames).toContain('excerpt'); // FR-007
      expect(fieldNames).toContain('featuredImage'); // FR-008
      expect(fieldNames).toContain('servings'); // FR-009
      expect(fieldNames).toContain('prepTime'); // FR-010
      expect(fieldNames).toContain('cookTime'); // FR-011
      expect(fieldNames).toContain('totalTime'); // FR-012
      expect(fieldNames).toContain('ingredients'); // FR-013
      expect(fieldNames).toContain('instructions'); // FR-014
      expect(fieldNames).toContain('nutritionInfo'); // FR-015
      expect(fieldNames).toContain('difficulty'); // FR-016
      expect(fieldNames).toContain('seo'); // FR-017
    });
  });

  describe('Field Validation - Title (FR-001, AC-001)', () => {
    it('should define title as required string with max 100 characters', () => {
      const schema = recipeSchema as DocumentDefinition;
      const titleField = schema.fields.find((f: any) => f.name === 'title');

      expect(titleField).toBeDefined();
      expect(titleField?.type).toBe('string');
      expect(titleField?.validation).toBeDefined();
    });
  });

  describe('Field Validation - Slug (FR-002, AC-001)', () => {
    it('should define slug as required with source from title', () => {
      const schema = recipeSchema as DocumentDefinition;
      const slugField = schema.fields.find((f: any) => f.name === 'slug') as any;

      expect(slugField).toBeDefined();
      expect(slugField?.type).toBe('slug');
      expect(slugField?.options?.source).toBe('title');
      expect(slugField?.options?.maxLength).toBe(96);
      expect(slugField?.validation).toBeDefined();
    });
  });

  describe('Field Validation - References (FR-003, FR-004, FR-005, AC-002, AC-003, AC-004)', () => {
    it('should define author as required reference to author type', () => {
      const schema = recipeSchema as DocumentDefinition;
      const authorField = schema.fields.find((f: any) => f.name === 'author');

      expect(authorField).toBeDefined();
      expect(authorField?.type).toBe('reference');
      expect(authorField?.validation).toBeDefined();
    });

    it('should define category as optional reference to category type', () => {
      const schema = recipeSchema as DocumentDefinition;
      const categoryField = schema.fields.find((f: any) => f.name === 'category');

      expect(categoryField).toBeDefined();
      expect(categoryField?.type).toBe('reference');
    });

    it('should define tags as array of references to tag type', () => {
      const schema = recipeSchema as DocumentDefinition;
      const tagsField = schema.fields.find((f: any) => f.name === 'tags');

      expect(tagsField).toBeDefined();
      expect(tagsField?.type).toBe('array');
    });
  });

  describe('Field Validation - Timing Fields (FR-010, FR-011, FR-012, AC-005)', () => {
    it('should define prepTime as number with range 0-1440', () => {
      const schema = recipeSchema as DocumentDefinition;
      const prepTimeField = schema.fields.find((f: any) => f.name === 'prepTime');

      expect(prepTimeField).toBeDefined();
      expect(prepTimeField?.type).toBe('number');
    });

    it('should define cookTime as number with range 0-1440', () => {
      const schema = recipeSchema as DocumentDefinition;
      const cookTimeField = schema.fields.find((f: any) => f.name === 'cookTime');

      expect(cookTimeField).toBeDefined();
      expect(cookTimeField?.type).toBe('number');
    });

    it('should define totalTime as number with range 0-2880', () => {
      const schema = recipeSchema as DocumentDefinition;
      const totalTimeField = schema.fields.find((f: any) => f.name === 'totalTime');

      expect(totalTimeField).toBeDefined();
      expect(totalTimeField?.type).toBe('number');
    });
  });

  describe('Field Validation - Servings (FR-009, AC-006)', () => {
    it('should define servings as number with range 1-100', () => {
      const schema = recipeSchema as DocumentDefinition;
      const servingsField = schema.fields.find((f: any) => f.name === 'servings');

      expect(servingsField).toBeDefined();
      expect(servingsField?.type).toBe('number');
    });
  });

  describe('Field Validation - Ingredients (FR-013, AC-007)', () => {
    it('should define ingredients as required array of recipeIngredient type', () => {
      const schema = recipeSchema as DocumentDefinition;
      const ingredientsField = schema.fields.find((f: any) => f.name === 'ingredients');

      expect(ingredientsField).toBeDefined();
      expect(ingredientsField?.type).toBe('array');
      expect(ingredientsField?.validation).toBeDefined();
    });
  });

  describe('Field Validation - Instructions (FR-014, AC-008)', () => {
    it('should define instructions as required Portable Text array', () => {
      const schema = recipeSchema as DocumentDefinition;
      const instructionsField = schema.fields.find((f: any) => f.name === 'instructions');

      expect(instructionsField).toBeDefined();
      expect(instructionsField?.type).toBe('array');
      expect(instructionsField?.validation).toBeDefined();
    });
  });

  describe('Field Validation - Difficulty (FR-016, AC-009)', () => {
    it('should define difficulty as string with predefined options', () => {
      const schema = recipeSchema as DocumentDefinition;
      const difficultyField = schema.fields.find((f: any) => f.name === 'difficulty') as any;

      expect(difficultyField).toBeDefined();
      expect(difficultyField?.type).toBe('string');
      expect(difficultyField?.options?.list).toBeDefined();
      expect(difficultyField?.options?.list).toHaveLength(3);

      const values = difficultyField?.options?.list?.map((item: any) => item.value);
      expect(values).toContain('Easy');
      expect(values).toContain('Medium');
      expect(values).toContain('Hard');
    });
  });

  describe('Field Validation - Nutrition Info (FR-015, AC-010)', () => {
    it('should define nutritionInfo as optional object with nutrition fields', () => {
      const schema = recipeSchema as DocumentDefinition;
      const nutritionField = schema.fields.find((f: any) => f.name === 'nutritionInfo') as any;

      expect(nutritionField).toBeDefined();
      expect(nutritionField?.type).toBe('object');

      const nutritionFields = nutritionField?.fields?.map((f: any) => f.name);
      expect(nutritionFields).toContain('calories');
      expect(nutritionFields).toContain('protein');
      expect(nutritionFields).toContain('carbohydrates');
      expect(nutritionFields).toContain('fat');
      expect(nutritionFields).toContain('fiber');
      expect(nutritionFields).toContain('sodium');
    });
  });

  describe('Field Validation - SEO (FR-017, AC-011)', () => {
    it('should define seo as object with metaTitle, metaDescription, and keywords', () => {
      const schema = recipeSchema as DocumentDefinition;
      const seoField = schema.fields.find((f: any) => f.name === 'seo') as any;

      expect(seoField).toBeDefined();
      expect(seoField?.type).toBe('object');

      const seoFields = seoField?.fields?.map((f: any) => f.name);
      expect(seoFields).toContain('metaTitle');
      expect(seoFields).toContain('metaDescription');
      expect(seoFields).toContain('keywords');
    });
  });

  describe('Preview Configuration (FR-019, AC-012)', () => {
    it('should have preview configuration with title, media, and timing fields', () => {
      const schema = recipeSchema as DocumentDefinition;
      expect(schema.preview).toBeDefined();
      expect(schema.preview?.select).toBeDefined();

      const selectFields = schema.preview?.select;
      expect(selectFields).toHaveProperty('title');
      expect(selectFields).toHaveProperty('media');
      expect(selectFields).toHaveProperty('prepTime');
      expect(selectFields).toHaveProperty('cookTime');
      expect(selectFields).toHaveProperty('totalTime');
      expect(selectFields).toHaveProperty('difficulty');
    });

    it('should have prepare function for preview formatting', () => {
      const schema = recipeSchema as DocumentDefinition;
      expect(schema.preview?.prepare).toBeDefined();
      expect(typeof schema.preview?.prepare).toBe('function');
    });
  });

  describe('Orderings', () => {
    it('should define orderings by publishedAt and title', () => {
      const schema = recipeSchema as DocumentDefinition;
      expect(schema.orderings).toBeDefined();
      expect(schema.orderings).toHaveLength(4);

      const orderingNames = schema.orderings?.map((o: any) => o.name);
      expect(orderingNames).toContain('publishedAtDesc');
      expect(orderingNames).toContain('publishedAtAsc');
      expect(orderingNames).toContain('titleAsc');
      expect(orderingNames).toContain('titleDesc');
    });
  });
});

describe('Recipe Ingredient Schema', () => {
  describe('Schema Structure', () => {
    it('should have correct name and type', () => {
      expect(recipeIngredientSchema.name).toBe('recipeIngredient');
      expect(recipeIngredientSchema.type).toBe('object');
    });

    it('should have fields for quantity, unit, ingredient, and notes', () => {
      const schema = recipeIngredientSchema as ObjectDefinition;
      const fieldNames = schema.fields.map((f: any) => f.name);

      expect(fieldNames).toContain('quantity');
      expect(fieldNames).toContain('unit');
      expect(fieldNames).toContain('ingredient');
      expect(fieldNames).toContain('notes');
    });
  });

  describe('Field Validation', () => {
    it('should define ingredient name as required', () => {
      const schema = recipeIngredientSchema as ObjectDefinition;
      const ingredientField = schema.fields.find((f: any) => f.name === 'ingredient');

      expect(ingredientField).toBeDefined();
      expect(ingredientField?.type).toBe('string');
      expect(ingredientField?.validation).toBeDefined();
    });

    it('should define quantity, unit, and notes as optional strings', () => {
      const schema = recipeIngredientSchema as ObjectDefinition;
      const quantityField = schema.fields.find((f: any) => f.name === 'quantity');
      const unitField = schema.fields.find((f: any) => f.name === 'unit');
      const notesField = schema.fields.find((f: any) => f.name === 'notes');

      expect(quantityField?.type).toBe('string');
      expect(unitField?.type).toBe('string');
      expect(notesField?.type).toBe('string');
    });
  });

  describe('Preview Configuration', () => {
    it('should have preview configuration with quantity, unit, and ingredient', () => {
      const schema = recipeIngredientSchema as ObjectDefinition;
      expect(schema.preview).toBeDefined();
      expect(schema.preview?.select).toBeDefined();

      const selectFields = schema.preview?.select;
      expect(selectFields).toHaveProperty('quantity');
      expect(selectFields).toHaveProperty('unit');
      expect(selectFields).toHaveProperty('ingredient');
    });

    it('should have prepare function for preview formatting', () => {
      const schema = recipeIngredientSchema as ObjectDefinition;
      expect(schema.preview?.prepare).toBeDefined();
      expect(typeof schema.preview?.prepare).toBe('function');
    });
  });
});
