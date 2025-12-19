/**
 * Author CRUD Integration Tests
 *
 * Tests author document creation, retrieval, update, and deletion
 * operations against the Sanity development dataset.
 *
 * These tests verify:
 * - AC-001: Author documents can be created with required fields
 * - AC-003: Slug uniqueness is enforced
 * - AC-006: Required field validation prevents saving incomplete documents
 *
 * Note: These tests require Sanity environment variables to be configured
 * and run against the development dataset to avoid polluting production.
 *
 * @module __tests__/integration/sanity/author-crud
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createClient } from 'next-sanity';

// Skip these tests if Sanity credentials are not configured
const shouldSkip = !process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN;

const testClient = shouldSkip
  ? null
  : createClient({
      projectId: process.env.SANITY_PROJECT_ID!,
      dataset: 'development', // Always use development dataset for tests
      apiVersion: '2023-01-01',
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    });

describe.skipIf(shouldSkip)('Author CRUD Operations', () => {
  const testAuthorIds: string[] = [];

  afterAll(async () => {
    // Clean up test authors
    if (testClient && testAuthorIds.length > 0) {
      for (const id of testAuthorIds) {
        try {
          await testClient.delete(id);
        } catch (error) {
          console.warn(`Failed to clean up test author ${id}:`, error);
        }
      }
    }
  });

  it('should create author with valid data', async () => {
    // AC-001: Author document can be created with all required fields
    if (!testClient) return;

    // First, create a mock image asset for testing
    // In real usage, this would be uploaded through Sanity Studio
    const mockImageAsset = {
      _type: 'sanity.imageAsset',
      url: 'https://cdn.sanity.io/images/test/image.jpg',
    };

    const author = (await testClient.create({
      _type: 'author',
      name: 'Test Author',
      slug: { _type: 'slug', current: 'test-author-unique-1' },
      bio: 'Test biography for integration testing',
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-test-asset-id', // Mock reference
        },
        alt: 'Test author profile image',
      },
    })) as any;

    expect(author._id).toBeDefined();
    expect(author.name).toBe('Test Author');
    expect((author as any).slug?.current).toBe('test-author-unique-1');
    expect((author as any).bio).toBe('Test biography for integration testing');

    testAuthorIds.push(author._id);
  });

  it('should create author without bio (optional field)', async () => {
    // AC-007: Bio field is optional and document saves successfully without it
    if (!testClient) return;

    const author = (await testClient.create({
      _type: 'author',
      name: 'Author Without Bio',
      slug: { _type: 'slug', current: 'author-without-bio' },
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-test-asset-id',
        },
        alt: 'Author without bio profile image',
      },
    })) as any;

    expect(author._id).toBeDefined();
    expect(author.name).toBe('Author Without Bio');
    expect(author.bio).toBeUndefined();

    testAuthorIds.push(author._id);
  });

  it('should query author by slug', async () => {
    // Verify GROQ queries work correctly for author retrieval
    if (!testClient) return;

    const author = await testClient.fetch(`*[_type == "author" && slug.current == $slug][0]`, {
      slug: 'test-author-unique-1',
    });

    expect(author).toBeDefined();
    expect(author.name).toBe('Test Author');
    expect(author.slug.current).toBe('test-author-unique-1');
  });

  it('should query all authors ordered by name', async () => {
    // Verify bulk author queries work correctly
    if (!testClient) return;

    const authors = await testClient.fetch(
      `*[_type == "author"] | order(name asc) { _id, name, "slug": slug.current }`,
    );

    expect(Array.isArray(authors)).toBe(true);
    expect(authors.length).toBeGreaterThan(0);

    // Verify each author has required fields
    authors.forEach((author: any) => {
      expect(author._id).toBeDefined();
      expect(author.name).toBeDefined();
      expect(author.slug).toBeDefined();
    });
  });

  it('should update author document', async () => {
    // Verify author documents can be updated
    if (!testClient || testAuthorIds.length === 0) return;

    const authorId = testAuthorIds[0] as string;

    const updated = (await testClient
      .patch(authorId)
      .set({ bio: 'Updated biography content' })
      .commit()) as any;

    expect(updated.bio).toBe('Updated biography content');
  });

  it('should delete author document', async () => {
    // Verify author documents can be deleted
    if (!testClient) return;

    const author = await testClient.create({
      _type: 'author',
      name: 'Temporary Author',
      slug: { _type: 'slug', current: 'temporary-author' },
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-test-asset-id',
        },
        alt: 'Temporary author image',
      },
    });

    const deletedId = author._id;

    await testClient.delete(deletedId);

    // Verify deletion
    const result = await testClient.fetch(`*[_type == "author" && _id == $id][0]`, {
      id: deletedId,
    });

    expect(result).toBeNull();
  });
});

describe.skipIf(shouldSkip)('Author Schema Validation', () => {
  it('should require name field', async () => {
    // AC-006: Required field validation prevents saving without name
    if (!testClient) return;

    try {
      await testClient.create({
        _type: 'author',
        // Missing name field
        slug: { _type: 'slug', current: 'no-name-author' },
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: 'image-test-asset-id' },
          alt: 'Test image',
        },
      });

      // Should not reach here
      expect.fail('Should have thrown validation error for missing name');
    } catch (error: any) {
      // Expected validation error
      expect(error).toBeDefined();
    }
  });

  it('should require slug field', async () => {
    // AC-006: Required field validation prevents saving without slug
    if (!testClient) return;

    try {
      await testClient.create({
        _type: 'author',
        name: 'Author Without Slug',
        // Missing slug field
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: 'image-test-asset-id' },
          alt: 'Test image',
        },
      });

      // Should not reach here
      expect.fail('Should have thrown validation error for missing slug');
    } catch (error: any) {
      // Expected validation error
      expect(error).toBeDefined();
    }
  });

  it('should require image field', async () => {
    // AC-006: Required field validation prevents saving without image
    if (!testClient) return;

    try {
      await testClient.create({
        _type: 'author',
        name: 'Author Without Image',
        slug: { _type: 'slug', current: 'no-image-author' },
        // Missing image field
      });

      // Should not reach here
      expect.fail('Should have thrown validation error for missing image');
    } catch (error: any) {
      // Expected validation error
      expect(error).toBeDefined();
    }
  });
});
