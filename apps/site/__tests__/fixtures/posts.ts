/**
 * Post Test Fixtures
 *
 * Mock post documents for testing post-related functionality.
 * Used in unit tests, integration tests, and smoke tests.
 *
 * @module __tests__/fixtures/posts
 */

/**
 * Mock post type matching the Post schema structure
 */
export interface MockPost {
  _id: string;
  _type: 'post';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  publishedAt: string;
  author: {
    _type: 'reference';
    _ref: string;
  };
  body?: any[];
  excerpt?: string;
  category?: {
    _type: 'reference';
    _ref: string;
  };
  tags?: Array<{
    _type: 'reference';
    _ref: string;
    _key: string;
  }>;
  featuredImage?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
    alt: string;
    caption?: string;
  };
  featured: boolean;
  seo?: {
    title?: string;
    description?: string;
    image?: {
      _type: 'image';
      asset: {
        _type: 'reference';
        _ref: string;
      };
    };
    canonicalUrl?: string;
  };
}

/**
 * Mock posts with various configurations
 */
export const mockPosts: MockPost[] = [
  {
    _id: 'post-masterchef-to-mud-boots',
    _type: 'post',
    _createdAt: '2025-01-20T00:00:00Z',
    _updatedAt: '2025-01-20T00:00:00Z',
    title: 'From MasterChef to Mud Boots',
    slug: {
      _type: 'slug',
      current: 'masterchef-to-mud-boots',
    },
    publishedAt: '2025-01-20T10:00:00Z',
    author: {
      _type: 'reference',
      _ref: 'author-jonno-daddia',
    },
    excerpt:
      "How I went from competitive cooking to regenerative farming, and why it's the best decision I ever made.",
    category: {
      _type: 'reference',
      _ref: 'category-regenerative-agriculture',
    },
    tags: [
      {
        _type: 'reference',
        _ref: 'tag-permaculture',
        _key: 'tag1',
      },
      {
        _type: 'reference',
        _ref: 'tag-regenerative-agriculture',
        _key: 'tag2',
      },
    ],
    featuredImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-asset-1',
      },
      alt: 'Jonno Daddia standing in a muddy field at Carinya Parc',
    },
    featured: true,
    seo: {
      title: 'From MasterChef to Regenerative Farming | Carinya Parc',
      description:
        "Follow Jonno's journey from competitive cooking to regenerative farming at Carinya Parc.",
    },
  },
  {
    _id: 'post-restoring-42-ha-land',
    _type: 'post',
    _createdAt: '2025-02-20T00:00:00Z',
    _updatedAt: '2025-02-20T00:00:00Z',
    title: 'Restoring 42 Hectares of Degraded Land',
    slug: {
      _type: 'slug',
      current: 'restoring-42-ha-land',
    },
    publishedAt: '2025-02-20T10:00:00Z',
    author: {
      _type: 'reference',
      _ref: 'author-jonno-daddia',
    },
    excerpt:
      'Our plan to restore soil health, biodiversity, and ecosystem function at Carinya Parc.',
    category: {
      _type: 'reference',
      _ref: 'category-regenerative-agriculture',
    },
    tags: [
      {
        _type: 'reference',
        _ref: 'tag-soil-health',
        _key: 'tag1',
      },
      {
        _type: 'reference',
        _ref: 'tag-regenerative-agriculture',
        _key: 'tag2',
      },
    ],
    featuredImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-asset-2',
      },
      alt: 'Aerial view of Carinya Parc property showing degraded land',
      caption: 'Carinya Parc before restoration - February 2025',
    },
    featured: true,
  },
  {
    _id: 'post-lessons-from-failure',
    _type: 'post',
    _createdAt: '2025-03-20T00:00:00Z',
    _updatedAt: '2025-03-20T00:00:00Z',
    title: 'Lessons from Our First Year of Failures',
    slug: {
      _type: 'slug',
      current: 'lessons-from-failure',
    },
    publishedAt: '2025-03-20T10:00:00Z',
    author: {
      _type: 'reference',
      _ref: 'author-jonno-daddia',
    },
    excerpt: 'What went wrong in our first year, and what we learned from it.',
    category: {
      _type: 'reference',
      _ref: 'category-regenerative-agriculture',
    },
    tags: [
      {
        _type: 'reference',
        _ref: 'tag-permaculture',
        _key: 'tag1',
      },
    ],
    featured: false,
  },
  {
    _id: 'post-designing-polyculture-systems',
    _type: 'post',
    _createdAt: '2025-04-20T00:00:00Z',
    _updatedAt: '2025-04-20T00:00:00Z',
    title: 'Designing Polyculture Systems for Small Farms',
    slug: {
      _type: 'slug',
      current: 'designing-polyculture-systems',
    },
    publishedAt: '2025-04-20T10:00:00Z',
    author: {
      _type: 'reference',
      _ref: 'author-jonno-daddia',
    },
    excerpt: 'How to design productive polyculture systems for small-scale regenerative farms.',
    category: {
      _type: 'reference',
      _ref: 'category-regenerative-agriculture',
    },
    tags: [
      {
        _type: 'reference',
        _ref: 'tag-permaculture',
        _key: 'tag1',
      },
      {
        _type: 'reference',
        _ref: 'tag-food-forest',
        _key: 'tag2',
      },
    ],
    featuredImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-asset-3',
      },
      alt: 'Diagram showing polyculture design with multiple plant species',
    },
    featured: false,
  },
  {
    _id: 'post-seasonal-soil-care',
    _type: 'post',
    _createdAt: '2025-05-20T00:00:00Z',
    _updatedAt: '2025-05-20T00:00:00Z',
    title: 'Seasonal Soil Care: Winter Composting and Cover Crops',
    slug: {
      _type: 'slug',
      current: 'seasonal-soil-care-winter-composting-cover-crops',
    },
    publishedAt: '2025-05-20T10:00:00Z',
    author: {
      _type: 'reference',
      _ref: 'author-jonno-daddia',
    },
    excerpt: 'Winter strategies for building soil health through composting and cover cropping.',
    category: {
      _type: 'reference',
      _ref: 'category-sustainability',
    },
    tags: [
      {
        _type: 'reference',
        _ref: 'tag-soil-health',
        _key: 'tag1',
      },
      {
        _type: 'reference',
        _ref: 'tag-composting',
        _key: 'tag2',
      },
    ],
    featured: false,
  },
  {
    _id: 'post-food-forest-guide',
    _type: 'post',
    _createdAt: '2025-06-20T00:00:00Z',
    _updatedAt: '2025-06-20T00:00:00Z',
    title: 'Creating a Food Forest: A Complete Guide',
    slug: {
      _type: 'slug',
      current: 'creating-food-forest-complete-guide',
    },
    publishedAt: '2025-06-20T10:00:00Z',
    author: {
      _type: 'reference',
      _ref: 'author-jonno-daddia',
    },
    excerpt: 'Step-by-step guide to planning and planting a productive food forest.',
    category: {
      _type: 'reference',
      _ref: 'category-regenerative-agriculture',
    },
    tags: [
      {
        _type: 'reference',
        _ref: 'tag-food-forest',
        _key: 'tag1',
      },
      {
        _type: 'reference',
        _ref: 'tag-permaculture',
        _key: 'tag2',
      },
    ],
    featuredImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-asset-4',
      },
      alt: 'Mature food forest with multiple layers of vegetation',
    },
    featured: true,
  },
];

/**
 * Get posts by category
 */
export function getPostsByCategory(categoryRef: string): MockPost[] {
  return mockPosts.filter((post) => post.category?._ref === categoryRef);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tagRef: string): MockPost[] {
  return mockPosts.filter((post) => post.tags?.some((tag) => tag._ref === tagRef));
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): MockPost[] {
  return mockPosts.filter((post) => post.featured === true);
}

/**
 * Get post by ID
 */
export function getPostById(id: string): MockPost | undefined {
  return mockPosts.find((post) => post._id === id);
}

/**
 * Get post by slug
 */
export function getPostBySlug(slug: string): MockPost | undefined {
  return mockPosts.find((post) => post.slug.current === slug);
}

/**
 * Get posts by author
 */
export function getPostsByAuthor(authorRef: string): MockPost[] {
  return mockPosts.filter((post) => post.author._ref === authorRef);
}

/**
 * Get posts ordered by publish date (newest first)
 */
export function getPostsByPublishDate(): MockPost[] {
  return [...mockPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
