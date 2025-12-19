/**
 * Tag Test Fixtures
 *
 * Mock tag documents for testing tag-related functionality.
 * Used in unit tests, integration tests, and smoke tests.
 *
 * @module __tests__/fixtures/tags
 */

/**
 * Mock tag type matching the Tag schema structure
 */
export interface MockTag {
  _id: string;
  _type: 'tag';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  contentTypes: ('post' | 'recipe')[];
}

/**
 * Mock tags with various scoping scenarios
 */
export const mockTags: MockTag[] = [
  {
    _id: 'tag-permaculture',
    _type: 'tag',
    _createdAt: '2025-01-01T00:00:00Z',
    _updatedAt: '2025-01-01T00:00:00Z',
    title: 'Permaculture',
    slug: {
      _type: 'slug',
      current: 'permaculture',
    },
    contentTypes: ['post', 'recipe'],
  },
  {
    _id: 'tag-winter-growing',
    _type: 'tag',
    _createdAt: '2025-01-02T00:00:00Z',
    _updatedAt: '2025-01-02T00:00:00Z',
    title: 'Winter Growing',
    slug: {
      _type: 'slug',
      current: 'winter-growing',
    },
    contentTypes: ['post'], // Post-only tag
  },
  {
    _id: 'tag-fermentation',
    _type: 'tag',
    _createdAt: '2025-01-03T00:00:00Z',
    _updatedAt: '2025-01-03T00:00:00Z',
    title: 'Fermentation',
    slug: {
      _type: 'slug',
      current: 'fermentation',
    },
    contentTypes: ['recipe'], // Recipe-only tag
  },
  {
    _id: 'tag-soil-health',
    _type: 'tag',
    _createdAt: '2025-01-04T00:00:00Z',
    _updatedAt: '2025-01-04T00:00:00Z',
    title: 'Soil Health',
    slug: {
      _type: 'slug',
      current: 'soil-health',
    },
    contentTypes: ['post', 'recipe'],
  },
  {
    _id: 'tag-composting',
    _type: 'tag',
    _createdAt: '2025-01-05T00:00:00Z',
    _updatedAt: '2025-01-05T00:00:00Z',
    title: 'Composting',
    slug: {
      _type: 'slug',
      current: 'composting',
    },
    contentTypes: ['post', 'recipe'],
  },
  {
    _id: 'tag-seasonal-cooking',
    _type: 'tag',
    _createdAt: '2025-01-06T00:00:00Z',
    _updatedAt: '2025-01-06T00:00:00Z',
    title: 'Seasonal Cooking',
    slug: {
      _type: 'slug',
      current: 'seasonal-cooking',
    },
    contentTypes: ['recipe'],
  },
  {
    _id: 'tag-regenerative-agriculture',
    _type: 'tag',
    _createdAt: '2025-01-07T00:00:00Z',
    _updatedAt: '2025-01-07T00:00:00Z',
    title: 'Regenerative Agriculture',
    slug: {
      _type: 'slug',
      current: 'regenerative-agriculture',
    },
    contentTypes: ['post'],
  },
  {
    _id: 'tag-food-forest',
    _type: 'tag',
    _createdAt: '2025-01-08T00:00:00Z',
    _updatedAt: '2025-01-08T00:00:00Z',
    title: 'Food Forest',
    slug: {
      _type: 'slug',
      current: 'food-forest',
    },
    contentTypes: ['post', 'recipe'],
  },
];

/**
 * Get tags by content type scope
 */
export function getTagsByContentType(contentType: 'post' | 'recipe'): MockTag[] {
  return mockTags.filter((tag) => tag.contentTypes.includes(contentType));
}

/**
 * Get tag by ID
 */
export function getTagById(id: string): MockTag | undefined {
  return mockTags.find((tag) => tag._id === id);
}

/**
 * Get tag by slug
 */
export function getTagBySlug(slug: string): MockTag | undefined {
  return mockTags.find((tag) => tag.slug.current === slug);
}
