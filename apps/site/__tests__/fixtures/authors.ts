/**
 * Author Test Fixtures
 *
 * Mock author data for unit and integration tests.
 * Used to provide consistent test data across the test suite.
 *
 * @module __tests__/fixtures/authors
 */

import type { Author, AuthorData } from '@/types/author';

/**
 * Mock author documents (raw Sanity document format)
 */
export const mockAuthors: Author[] = [
  {
    _id: 'author-1',
    _type: 'author',
    _createdAt: '2025-01-01T00:00:00Z',
    _updatedAt: '2025-01-01T00:00:00Z',
    name: 'Jonno Daddia',
    slug: {
      _type: 'slug',
      current: 'jonno-daddia',
    },
    bio: 'Regenerative farmer and chef transitioning from fine dining to land stewardship at Carinya Parc.',
    image: {
      _type: 'image',
      asset: {
        _ref: 'image-abc123',
        _type: 'reference',
      },
      alt: 'Portrait of Jonno Daddia',
    },
  },
  {
    _id: 'author-2',
    _type: 'author',
    _createdAt: '2025-01-15T00:00:00Z',
    _updatedAt: '2025-01-15T00:00:00Z',
    name: 'Guest Contributor',
    slug: {
      _type: 'slug',
      current: 'guest-contributor',
    },
    image: {
      _type: 'image',
      asset: {
        _ref: 'image-def456',
        _type: 'reference',
      },
      alt: 'Guest contributor profile',
    },
    // No bio - testing optional field
  },
];

/**
 * Mock author query results (denormalized format)
 * This is the typical structure returned from GROQ queries
 */
export const mockAuthorData: AuthorData[] = [
  {
    _id: 'author-1',
    name: 'Jonno Daddia',
    slug: 'jonno-daddia',
    bio: 'Regenerative farmer and chef transitioning from fine dining to land stewardship at Carinya Parc.',
    image: {
      asset: {
        _id: 'image-abc123',
        url: 'https://cdn.sanity.io/images/test/production/abc123-1200x1200.jpg',
        metadata: {
          dimensions: {
            width: 1200,
            height: 1200,
            aspectRatio: 1,
          },
          lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAYABgDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAMCAQT/xAAhEAABAwQCAwEAAAAAAAAAAAABAAIDBBEhEjFBUWFxgf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A5qUpQf/Z',
        },
      },
      crop: {
        top: 0.1,
        bottom: 0.1,
        left: 0.1,
        right: 0.1,
      },
      hotspot: {
        x: 0.5,
        y: 0.4,
        height: 0.6,
        width: 0.6,
      },
      alt: 'Portrait of Jonno Daddia',
    },
  },
  {
    _id: 'author-2',
    name: 'Guest Contributor',
    slug: 'guest-contributor',
    image: {
      asset: {
        _id: 'image-def456',
        url: 'https://cdn.sanity.io/images/test/production/def456-800x800.jpg',
        metadata: {
          dimensions: {
            width: 800,
            height: 800,
            aspectRatio: 1,
          },
        },
      },
      alt: 'Guest contributor profile',
    },
    // No bio - testing optional field
  },
];
