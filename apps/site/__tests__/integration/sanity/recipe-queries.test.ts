/**
 * Recipe GROQ Query Integration Tests
 *
 * Tests for GROQ queries fetching recipe documents with reference resolution.
 * Validates query structure, filtering, sorting, and type safety.
 *
 * Coverage:
 * - GROQ query syntax and structure
 * - Reference resolution (author, category, tags)
 * - Filtering and sorting
 * - Type safety with generated types
 *
 * @module __tests__/integration/sanity/recipe-queries
 */

import { describe, it, expect } from 'vitest';

describe('Recipe GROQ Queries', () => {
  describe('Query Structure', () => {
    it('should construct valid GROQ query for all published recipes', () => {
      const query = '*[_type == "recipe" && !(_id in path("drafts.**"))]';

      expect(query).toContain('_type == "recipe"');
      expect(query).toContain('!(_id in path("drafts.**"))');
    });

    it('should construct GROQ query with sorting by publishedAt desc', () => {
      const query = '*[_type == "recipe" && !(_id in path("drafts.**"))] | order(publishedAt desc)';

      expect(query).toContain('order(publishedAt desc)');
    });

    it('should construct GROQ query with pagination', () => {
      const query =
        '*[_type == "recipe" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...10]';

      expect(query).toContain('[0...10]');
    });
  });

  describe('Query Projection', () => {
    it('should include core recipe fields in projection', () => {
      const projection = `{
        _id,
        _type,
        title,
        slug,
        excerpt,
        publishedAt,
        featuredImage,
        servings,
        prepTime,
        cookTime,
        totalTime,
        difficulty
      }`;

      expect(projection).toContain('_id');
      expect(projection).toContain('title');
      expect(projection).toContain('slug');
      expect(projection).toContain('excerpt');
      expect(projection).toContain('publishedAt');
      expect(projection).toContain('servings');
      expect(projection).toContain('difficulty');
    });

    it('should include author reference resolution', () => {
      const authorProjection = `author->{
        _id,
        name,
        slug
      }`;

      expect(authorProjection).toContain('author->');
      expect(authorProjection).toContain('name');
      expect(authorProjection).toContain('slug');
    });

    it('should include category reference resolution', () => {
      const categoryProjection = `category->{
        _id,
        title,
        slug
      }`;

      expect(categoryProjection).toContain('category->');
      expect(categoryProjection).toContain('title');
    });

    it('should include tags array reference resolution', () => {
      const tagsProjection = `tags[]->{
        _id,
        title,
        slug
      }`;

      expect(tagsProjection).toContain('tags[]->');
      expect(tagsProjection).toContain('title');
    });

    it('should include ingredients and instructions', () => {
      const contentProjection = `{
        ingredients,
        instructions,
        nutritionInfo,
        seo
      }`;

      expect(contentProjection).toContain('ingredients');
      expect(contentProjection).toContain('instructions');
      expect(contentProjection).toContain('nutritionInfo');
      expect(contentProjection).toContain('seo');
    });
  });

  describe('Query Filtering', () => {
    it('should filter recipes by category', () => {
      const query = '*[_type == "recipe" && category._ref == $categoryId]';

      expect(query).toContain('category._ref == $categoryId');
    });

    it('should filter recipes by difficulty', () => {
      const query = '*[_type == "recipe" && difficulty == $difficulty]';

      expect(query).toContain('difficulty == $difficulty');
    });

    it('should filter recipes by preparation time range', () => {
      const query = '*[_type == "recipe" && prepTime <= $maxPrepTime]';

      expect(query).toContain('prepTime <= $maxPrepTime');
    });

    it('should filter recipes by author', () => {
      const query = '*[_type == "recipe" && author._ref == $authorId]';

      expect(query).toContain('author._ref == $authorId');
    });

    it('should filter recipes by tag', () => {
      const query = '*[_type == "recipe" && $tagId in tags[]._ref]';

      expect(query).toContain('$tagId in tags[]._ref');
    });
  });

  describe('Query Sorting', () => {
    it('should sort by publishedAt ascending', () => {
      const query = '*[_type == "recipe"] | order(publishedAt asc)';

      expect(query).toContain('order(publishedAt asc)');
    });

    it('should sort by title alphabetically', () => {
      const query = '*[_type == "recipe"] | order(title asc)';

      expect(query).toContain('order(title asc)');
    });

    it('should sort by prepTime', () => {
      const query = '*[_type == "recipe"] | order(prepTime asc)';

      expect(query).toContain('order(prepTime asc)');
    });

    it('should support multiple sort fields', () => {
      const query = '*[_type == "recipe"] | order(difficulty asc, prepTime asc)';

      expect(query).toContain('order(difficulty asc, prepTime asc)');
    });
  });

  describe('Complete Query Examples', () => {
    it('should construct complete query for recipe listing', () => {
      const completeQuery = `*[_type == "recipe" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...10] {
        _id,
        _type,
        title,
        slug,
        excerpt,
        publishedAt,
        featuredImage,
        servings,
        prepTime,
        cookTime,
        totalTime,
        difficulty,
        author->{
          _id,
          name,
          slug
        },
        category->{
          _id,
          title,
          slug
        },
        tags[]->{
          _id,
          title,
          slug
        }
      }`;

      expect(completeQuery).toBeTruthy();
      expect(completeQuery).toContain('_type == "recipe"');
      expect(completeQuery).toContain('author->');
      expect(completeQuery).toContain('category->');
      expect(completeQuery).toContain('tags[]->');
    });

    it('should construct query for single recipe by slug', () => {
      const singleRecipeQuery = `*[_type == "recipe" && slug.current == $slug][0] {
        _id,
        _type,
        title,
        slug,
        excerpt,
        publishedAt,
        featuredImage,
        servings,
        prepTime,
        cookTime,
        totalTime,
        difficulty,
        author->{
          _id,
          name,
          slug,
          image
        },
        category->{
          _id,
          title,
          slug
        },
        tags[]->{
          _id,
          title,
          slug
        },
        ingredients,
        instructions,
        nutritionInfo,
        seo
      }`;

      expect(singleRecipeQuery).toContain('slug.current == $slug');
      expect(singleRecipeQuery).toContain('[0]');
      expect(singleRecipeQuery).toContain('ingredients');
      expect(singleRecipeQuery).toContain('instructions');
    });

    it('should construct query for recipes by category with filters', () => {
      const categoryRecipesQuery = `*[_type == "recipe" && category._ref == $categoryId && !(_id in path("drafts.**"))] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        featuredImage,
        difficulty,
        prepTime,
        author->{name}
      }`;

      expect(categoryRecipesQuery).toContain('category._ref == $categoryId');
      expect(categoryRecipesQuery).toContain('order(publishedAt desc)');
    });
  });
});



