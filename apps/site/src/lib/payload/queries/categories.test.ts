import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find }),
}));

import {
  getCategoryBySlug,
  getCategorySitemapEntries,
  getCategorySlugs,
  getPostsByCategory,
} from '@/lib/payload/queries/categories';

describe('category archive queries', () => {
  beforeEach(() => {
    find.mockReset();
  });

  it('getCategorySlugs returns slugs from the categories collection', async () => {
    find.mockResolvedValueOnce({
      docs: [
        { id: 1, name: 'Restoration', slug: 'restoration' },
        { id: 2, name: 'Farming', slug: 'farming' },
      ],
    });

    await expect(getCategorySlugs()).resolves.toEqual(['restoration', 'farming']);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'categories',
        overrideAccess: false,
      }),
    );
  });

  it('getCategoryBySlug returns null for an unknown slug', async () => {
    find.mockResolvedValueOnce({
      docs: [{ id: 1, name: 'Restoration', slug: 'restoration' }],
    });

    await expect(getCategoryBySlug('missing')).resolves.toBeNull();
  });

  it('getPostsByCategory queries published posts for the slug only', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 10,
          title: 'Published restoration note',
          slug: 'published-restoration',
          date: '2026-01-15T00:00:00.000Z',
          author: { id: 1, name: 'Jonathan Daddia' },
          category: { id: 1, name: 'Restoration', slug: 'restoration' },
          tags: [],
          excerpt: 'An excerpt',
          description: null,
          image: '/images/farm-track-gate.jpg',
          featured: false,
        },
      ],
    });

    const posts = await getPostsByCategory('restoration');

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        overrideAccess: false,
        where: {
          'category.slug': {
            equals: 'restoration',
          },
        },
      }),
    );
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe('published-restoration');
    expect(posts[0]?.categorySlug).toBe('restoration');
  });

  it('getCategorySitemapEntries includes trailing-slash category routes', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 1,
          slug: 'restoration',
          updatedAt: '2026-01-15T00:00:00.000Z',
        },
      ],
    });

    const entries = await getCategorySitemapEntries();

    expect(entries).toEqual([
      expect.objectContaining({
        route: '/blog/category/restoration/',
        priority: 0.6,
        changeFrequency: 'weekly',
      }),
    ]);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'categories',
        overrideAccess: false,
      }),
    );
  });
});
