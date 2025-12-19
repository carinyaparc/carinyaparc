/**
 * Category Test Fixtures
 *
 * Mock category data for unit and integration tests.
 * Used to provide consistent test data across the test suite.
 *
 * Task: CP-04-002 (Category Taxonomy System)
 *
 * @module __tests__/fixtures/categories
 */

import type { Category, CategoryData, CategoryWithPath, ContentType } from '@/types/category';

/**
 * Mock category documents (raw Sanity document format)
 */
export const mockCategories: Category[] = [
  // Top-level category
  {
    _id: 'category-1',
    _type: 'category',
    _createdAt: '2025-01-01T00:00:00Z',
    _updatedAt: '2025-01-01T00:00:00Z',
    title: 'Sustainability',
    slug: {
      _type: 'slug',
      current: 'sustainability',
    },
    description:
      'Articles and recipes focused on sustainable farming practices and environmental stewardship.',
    contentTypes: ['post', 'recipe'],
  },
  // Child category
  {
    _id: 'category-2',
    _type: 'category',
    _createdAt: '2025-01-02T00:00:00Z',
    _updatedAt: '2025-01-02T00:00:00Z',
    title: 'Regenerative Agriculture',
    slug: {
      _type: 'slug',
      current: 'regenerative-agriculture',
    },
    description:
      'Practices that restore and improve soil health, biodiversity, and ecosystem function.',
    parent: {
      _type: 'reference',
      _ref: 'category-1',
    },
    contentTypes: ['post', 'recipe'],
  },
  // Grandchild category
  {
    _id: 'category-3',
    _type: 'category',
    _createdAt: '2025-01-03T00:00:00Z',
    _updatedAt: '2025-01-03T00:00:00Z',
    title: 'Soil Health',
    slug: {
      _type: 'slug',
      current: 'soil-health',
    },
    description:
      'Building and maintaining healthy, living soil through composting, cover crops, and no-till practices.',
    parent: {
      _type: 'reference',
      _ref: 'category-2',
    },
    contentTypes: ['post'],
  },
  // Post-only category
  {
    _id: 'category-4',
    _type: 'category',
    _createdAt: '2025-01-04T00:00:00Z',
    _updatedAt: '2025-01-04T00:00:00Z',
    title: 'Farm Journal',
    slug: {
      _type: 'slug',
      current: 'farm-journal',
    },
    description: 'Daily observations and reflections from life on the farm.',
    contentTypes: ['post'],
  },
  // Recipe-only category
  {
    _id: 'category-5',
    _type: 'category',
    _createdAt: '2025-01-05T00:00:00Z',
    _updatedAt: '2025-01-05T00:00:00Z',
    title: 'Seasonal Cooking',
    slug: {
      _type: 'slug',
      current: 'seasonal-cooking',
    },
    description:
      'Recipes that celebrate the flavours of each season using fresh, local ingredients.',
    contentTypes: ['recipe'],
  },
  // Category without description
  {
    _id: 'category-6',
    _type: 'category',
    _createdAt: '2025-01-06T00:00:00Z',
    _updatedAt: '2025-01-06T00:00:00Z',
    title: 'Getting Started',
    slug: {
      _type: 'slug',
      current: 'getting-started',
    },
    contentTypes: ['post', 'recipe'],
    // No description - testing optional field
  },
];

/**
 * Mock category query results (denormalized format)
 * This is the typical structure returned from GROQ queries
 */
export const mockCategoryData: CategoryData[] = [
  {
    _id: 'category-1',
    title: 'Sustainability',
    slug: 'sustainability',
    description:
      'Articles and recipes focused on sustainable farming practices and environmental stewardship.',
    contentTypes: ['post', 'recipe'],
  },
  {
    _id: 'category-2',
    title: 'Regenerative Agriculture',
    slug: 'regenerative-agriculture',
    description:
      'Practices that restore and improve soil health, biodiversity, and ecosystem function.',
    parent: {
      _id: 'category-1',
      title: 'Sustainability',
      slug: 'sustainability',
    },
    contentTypes: ['post', 'recipe'],
  },
  {
    _id: 'category-3',
    title: 'Soil Health',
    slug: 'soil-health',
    description:
      'Building and maintaining healthy, living soil through composting, cover crops, and no-till practices.',
    parent: {
      _id: 'category-2',
      title: 'Regenerative Agriculture',
      slug: 'regenerative-agriculture',
    },
    contentTypes: ['post'],
  },
  {
    _id: 'category-4',
    title: 'Farm Journal',
    slug: 'farm-journal',
    description: 'Daily observations and reflections from life on the farm.',
    contentTypes: ['post'],
  },
  {
    _id: 'category-5',
    title: 'Seasonal Cooking',
    slug: 'seasonal-cooking',
    description:
      'Recipes that celebrate the flavours of each season using fresh, local ingredients.',
    contentTypes: ['recipe'],
  },
  {
    _id: 'category-6',
    title: 'Getting Started',
    slug: 'getting-started',
    contentTypes: ['post', 'recipe'],
    // No description - testing optional field
  },
];

/**
 * Mock category with hierarchy path
 * Used for testing breadcrumb and navigation rendering
 */
export const mockCategoryWithPath: CategoryWithPath[] = [
  {
    _id: 'category-1',
    title: 'Sustainability',
    slug: 'sustainability',
    description:
      'Articles and recipes focused on sustainable farming practices and environmental stewardship.',
    contentTypes: ['post', 'recipe'],
    path: [
      {
        title: 'Sustainability',
        slug: 'sustainability',
      },
    ],
  },
  {
    _id: 'category-2',
    title: 'Regenerative Agriculture',
    slug: 'regenerative-agriculture',
    description:
      'Practices that restore and improve soil health, biodiversity, and ecosystem function.',
    parent: {
      _id: 'category-1',
      title: 'Sustainability',
      slug: 'sustainability',
    },
    contentTypes: ['post', 'recipe'],
    path: [
      {
        title: 'Sustainability',
        slug: 'sustainability',
      },
      {
        title: 'Regenerative Agriculture',
        slug: 'regenerative-agriculture',
      },
    ],
  },
  {
    _id: 'category-3',
    title: 'Soil Health',
    slug: 'soil-health',
    description:
      'Building and maintaining healthy, living soil through composting, cover crops, and no-till practices.',
    parent: {
      _id: 'category-2',
      title: 'Regenerative Agriculture',
      slug: 'regenerative-agriculture',
    },
    contentTypes: ['post'],
    path: [
      {
        title: 'Sustainability',
        slug: 'sustainability',
      },
      {
        title: 'Regenerative Agriculture',
        slug: 'regenerative-agriculture',
      },
      {
        title: 'Soil Health',
        slug: 'soil-health',
      },
    ],
  },
];

/**
 * Helper function to get categories by content type
 * Useful for testing content type filtering
 */
export function getCategoriesByType(contentType: ContentType): CategoryData[] {
  return mockCategoryData.filter((cat) => cat.contentTypes.includes(contentType));
}

/**
 * Helper function to get top-level categories (no parent)
 * Useful for testing category hierarchy navigation
 */
export function getTopLevelCategories(): CategoryData[] {
  return mockCategoryData.filter((cat) => !cat.parent);
}

/**
 * Helper function to get child categories of a given parent
 * Useful for testing hierarchy traversal
 */
export function getChildCategories(parentId: string): CategoryData[] {
  return mockCategoryData.filter((cat) => cat.parent?._id === parentId);
}
