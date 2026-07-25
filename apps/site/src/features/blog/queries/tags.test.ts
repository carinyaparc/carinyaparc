import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find }),
}));

import {
  getPostsByTag,
  getTagBySlug,
  getTagSitemapEntries,
  getTagSlugs,
} from '@/features/blog/queries/tags';

describe('tag archive queries', () => {
  beforeEach(() => {
    find.mockReset();
  });

  it('getTagSlugs returns slugs from the tags collection', async () => {
    find.mockResolvedValueOnce({
      docs: [
        { id: 1, name: 'Soil Health', slug: 'soil-health' },
        { id: 2, name: 'Wildlife', slug: 'wildlife' },
      ],
    });

    await expect(getTagSlugs()).resolves.toEqual(['soil-health', 'wildlife']);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'tags',
        overrideAccess: false,
      }),
    );
  });

  it('getTagBySlug returns null for an unknown slug', async () => {
    find.mockResolvedValueOnce({
      docs: [{ id: 1, name: 'Soil Health', slug: 'soil-health' }],
    });

    await expect(getTagBySlug('missing')).resolves.toBeNull();
  });

  it('getPostsByTag queries published posts for the tag only', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 10,
          title: 'Published soil note',
          slug: 'published-soil',
          date: '2026-01-15T00:00:00.000Z',
          author: { id: 1, name: 'Jonathan Daddia' },
          category: { id: 1, name: 'Restoration', slug: 'restoration' },
          tags: [{ id: 1, name: 'Soil Health', slug: 'soil-health' }],
          excerpt: 'An excerpt',
          description: null,
          image: '/images/farm-track-gate.jpg',
          featured: false,
        },
      ],
    });

    const posts = await getPostsByTag('soil-health');

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        overrideAccess: false,
        where: {
          'tags.slug': {
            equals: 'soil-health',
          },
        },
      }),
    );
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe('published-soil');
    expect(posts[0]?.tags).toContain('Soil Health');
  });

  it('getTagSitemapEntries includes trailing-slash tag routes', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 1,
          slug: 'soil-health',
          updatedAt: '2026-01-15T00:00:00.000Z',
        },
      ],
    });

    const entries = await getTagSitemapEntries();

    expect(entries).toEqual([
      expect.objectContaining({
        route: '/blog/tag/soil-health/',
        priority: 0.6,
        changeFrequency: 'weekly',
      }),
    ]);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'tags',
        overrideAccess: false,
      }),
    );
  });
});
