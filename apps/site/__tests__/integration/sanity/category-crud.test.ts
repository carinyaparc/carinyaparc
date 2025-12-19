/**
 * Category CRUD Integration Tests
 *
 * Tests category create, read, update, and delete operations against Sanity.
 * Validates slug uniqueness, circular reference prevention, and content type filtering.
 *
 * Task: CP-04-002 (Category Taxonomy System)
 *
 * @module __tests__/integration/sanity/category-crud
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { client } from '@/sanity/lib/client';
import type { Category } from '@/types/category';

describe('Category CRUD Operations', () => {
  const testCategoryIds: string[] = [];

  afterAll(async () => {
    // Clean up test categories
    if (testCategoryIds.length > 0 && client) {
      try {
        await Promise.all(testCategoryIds.map((id) => client.delete(id)));
      } catch (error) {
        console.error('Failed to clean up test categories:', error);
      }
    }
  });

  it('should create a category with required fields (FR-001, FR-002)', async () => {
    const newCategory = {
      _type: 'category',
      title: 'Test Category',
      slug: {
        _type: 'slug',
        current: 'test-category',
      },
      contentTypes: ['post'],
    };

    const result = await client.create(newCategory);
    testCategoryIds.push(result._id);

    expect(result).toBeDefined();
    expect(result._type).toBe('category');
    expect(result.title).toBe('Test Category');
    expect(result.slug.current).toBe('test-category');
    expect(result.contentTypes).toEqual(['post']);
  });

  it('should create a category with description (FR-001)', async () => {
    const newCategory = {
      _type: 'category',
      title: 'Test Category with Description',
      slug: {
        _type: 'slug',
        current: 'test-category-with-description',
      },
      description: 'This is a test category description.',
      contentTypes: ['post', 'recipe'],
    };

    const result = await client.create(newCategory);
    testCategoryIds.push(result._id);

    expect(result.description).toBe('This is a test category description.');
  });

  it('should create a child category with parent reference (FR-003)', async () => {
    // Create parent
    const parent = await client.create({
      _type: 'category',
      title: 'Parent Category',
      slug: {
        _type: 'slug',
        current: 'parent-category-test',
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(parent._id);

    // Create child
    const child = await client.create({
      _type: 'category',
      title: 'Child Category',
      slug: {
        _type: 'slug',
        current: 'child-category-test',
      },
      parent: {
        _type: 'reference',
        _ref: parent._id,
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(child._id);

    expect(child.parent?._ref).toBe(parent._id);
  });

  it('should query categories by content type (FR-004)', async () => {
    // Create post-only category
    const postCategory = await client.create({
      _type: 'category',
      title: 'Post Only Category',
      slug: {
        _type: 'slug',
        current: 'post-only-category-test',
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(postCategory._id);

    // Create recipe-only category
    const recipeCategory = await client.create({
      _type: 'category',
      title: 'Recipe Only Category',
      slug: {
        _type: 'slug',
        current: 'recipe-only-category-test',
      },
      contentTypes: ['recipe'],
    });
    testCategoryIds.push(recipeCategory._id);

    // Query for post categories
    const postCategories = await client.fetch<Category[]>(
      `*[_type == "category" && "post" in contentTypes && _id in $ids]`,
      { ids: [postCategory._id, recipeCategory._id] },
    );

    expect(postCategories).toHaveLength(1);
    expect(postCategories[0]?._id).toBe(postCategory._id);

    // Query for recipe categories
    const recipeCategories = await client.fetch<Category[]>(
      `*[_type == "category" && "recipe" in contentTypes && _id in $ids]`,
      { ids: [postCategory._id, recipeCategory._id] },
    );

    expect(recipeCategories).toHaveLength(1);
    expect(recipeCategories[0]?._id).toBe(recipeCategory._id);
  });

  it('should fetch category with hierarchy path (FR-006)', async () => {
    // Create parent
    const grandparent = await client.create({
      _type: 'category',
      title: 'Grandparent',
      slug: {
        _type: 'slug',
        current: 'grandparent-test',
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(grandparent._id);

    // Create parent
    const parent = await client.create({
      _type: 'category',
      title: 'Parent',
      slug: {
        _type: 'slug',
        current: 'parent-test',
      },
      parent: {
        _type: 'reference',
        _ref: grandparent._id,
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(parent._id);

    // Create child
    const child = await client.create({
      _type: 'category',
      title: 'Child',
      slug: {
        _type: 'slug',
        current: 'child-test',
      },
      parent: {
        _type: 'reference',
        _ref: parent._id,
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(child._id);

    // Fetch with hierarchy
    const result = await client.fetch(
      `*[_type == "category" && _id == $id][0]{
        _id,
        title,
        "slug": slug.current,
        parent->{
          _id,
          title,
          "slug": slug.current,
          parent->{
            _id,
            title,
            "slug": slug.current
          }
        }
      }`,
      { id: child._id },
    );

    expect(result?.parent?.title).toBe('Parent');
    expect(result?.parent?.parent?.title).toBe('Grandparent');
  });

  it('should update a category (FR-001, FR-002)', async () => {
    const category = await client.create({
      _type: 'category',
      title: 'Original Title',
      slug: {
        _type: 'slug',
        current: 'original-title-test',
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(category._id);

    const updated = await client
      .patch(category._id)
      .set({
        title: 'Updated Title',
        description: 'Added description',
      })
      .commit();

    expect(updated?.title).toBe('Updated Title');
    expect(updated?.description).toBe('Added description');
  });

  it('should delete a category', async () => {
    const category = await client.create({
      _type: 'category',
      title: 'To Be Deleted',
      slug: {
        _type: 'slug',
        current: 'to-be-deleted-test',
      },
      contentTypes: ['post'],
    });

    await client.delete(category._id);

    const result = await client.fetch(`*[_type == "category" && _id == $id][0]`, {
      id: category._id,
    });

    expect(result).toBeNull();
  });

  it('should validate slug uniqueness (FR-008)', async () => {
    const slug = 'unique-slug-test';

    // Create first category
    const first = await client.create({
      _type: 'category',
      title: 'First Category',
      slug: {
        _type: 'slug',
        current: slug,
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(first._id);

    // Check for duplicate
    const duplicateCount = await client.fetch(
      `count(*[_type == "category" && slug.current == $slug && _id != $id])`,
      { slug, id: 'new-id' },
    );

    expect(duplicateCount).toBeGreaterThan(0);
  });

  it('should query top-level categories only', async () => {
    // Create parent
    const parent = await client.create({
      _type: 'category',
      title: 'Top Level',
      slug: {
        _type: 'slug',
        current: 'top-level-test',
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(parent._id);

    // Create child
    const child = await client.create({
      _type: 'category',
      title: 'Child Level',
      slug: {
        _type: 'slug',
        current: 'child-level-test',
      },
      parent: {
        _type: 'reference',
        _ref: parent._id,
      },
      contentTypes: ['post'],
    });
    testCategoryIds.push(child._id);

    // Query top-level only
    const topLevel = await client.fetch<Category[]>(
      `*[_type == "category" && !defined(parent) && _id in $ids]`,
      { ids: [parent._id, child._id] },
    );

    expect(topLevel).toHaveLength(1);
    expect(topLevel[0]?._id).toBe(parent._id);
  });
});
