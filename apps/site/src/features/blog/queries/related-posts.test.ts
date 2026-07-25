import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find }),
}));

import { getRelatedPosts } from '@/features/blog/queries/related-posts';

function listDoc(overrides: {
  id: number;
  slug: string;
  title?: string;
  categorySlug?: string;
  tagSlugs?: string[];
  date?: string;
}) {
  const categorySlug = overrides.categorySlug ?? 'restoration';
  return {
    id: overrides.id,
    title: overrides.title ?? overrides.slug,
    slug: overrides.slug,
    date: overrides.date ?? '2026-01-15T00:00:00.000Z',
    author: { id: 1, name: 'Jonathan Daddia' },
    category: { id: 1, name: 'Restoration', slug: categorySlug },
    tags: (overrides.tagSlugs ?? []).map((slug, index) => ({
      id: index + 1,
      name: slug,
      slug,
    })),
    excerpt: 'An excerpt',
    description: null,
    image: '/images/farm-track-gate.jpg',
    featured: false,
  };
}

const currentPost = {
  slug: 'current-post',
  category: { id: 1, name: 'Restoration', slug: 'restoration' },
  tags: [{ id: 1, name: 'Soil Health', slug: 'soil-health' }],
};

describe('getRelatedPosts', () => {
  beforeEach(() => {
    find.mockReset();
  });

  it('prefers same-category posts and excludes the current post', async () => {
    find.mockResolvedValueOnce({
      docs: [
        listDoc({ id: 2, slug: 'same-cat-a', categorySlug: 'restoration' }),
        listDoc({ id: 3, slug: 'same-cat-b', categorySlug: 'restoration' }),
        listDoc({ id: 4, slug: 'same-cat-c', categorySlug: 'restoration' }),
      ],
    });

    const related = await getRelatedPosts(currentPost, 3);

    expect(find).toHaveBeenCalledOnce();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        overrideAccess: false,
        limit: 3,
        sort: '-date',
        where: {
          and: [
            { slug: { not_equals: 'current-post' } },
            { 'category.slug': { equals: 'restoration' } },
          ],
        },
      }),
    );
    expect(related).toHaveLength(3);
    expect(related.map((post) => post.slug)).toEqual(['same-cat-a', 'same-cat-b', 'same-cat-c']);
    expect(related.every((post) => post.slug !== 'current-post')).toBe(true);
  });

  it('fills with shared-tag posts when the category has too few', async () => {
    find
      .mockResolvedValueOnce({
        docs: [listDoc({ id: 2, slug: 'same-cat-only', categorySlug: 'restoration' })],
      })
      .mockResolvedValueOnce({
        docs: [
          listDoc({
            id: 3,
            slug: 'shared-tag',
            categorySlug: 'farming',
            tagSlugs: ['soil-health'],
          }),
          listDoc({
            id: 4,
            slug: 'another-tag',
            categorySlug: 'wildlife',
            tagSlugs: ['soil-health'],
          }),
        ],
      });

    const related = await getRelatedPosts(currentPost, 3);

    expect(find).toHaveBeenCalledTimes(2);
    expect(find.mock.calls[1]![0]).toEqual(
      expect.objectContaining({
        where: {
          and: [
            { slug: { not_in: ['current-post', 'same-cat-only'] } },
            { 'tags.slug': { in: ['soil-health'] } },
          ],
        },
      }),
    );
    expect(related.map((post) => post.slug)).toEqual([
      'same-cat-only',
      'shared-tag',
      'another-tag',
    ]);
  });

  it('falls back to most recent other posts when category and tags are sparse', async () => {
    find
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({
        docs: [
          listDoc({ id: 10, slug: 'recent-a', categorySlug: 'farming' }),
          listDoc({ id: 11, slug: 'recent-b', categorySlug: 'wildlife' }),
          listDoc({ id: 12, slug: 'recent-c', categorySlug: 'community' }),
        ],
      });

    const related = await getRelatedPosts(currentPost, 3);

    expect(find).toHaveBeenCalledTimes(3);
    expect(find.mock.calls[2]![0]).toEqual(
      expect.objectContaining({
        where: { slug: { not_equals: 'current-post' } },
        overrideAccess: false,
      }),
    );
    expect(related).toHaveLength(3);
    expect(related.map((post) => post.slug)).toEqual(['recent-a', 'recent-b', 'recent-c']);
    expect(related.every((post) => post.slug !== 'current-post')).toBe(true);
  });

  it('skips category and tag queries when the post has neither', async () => {
    find.mockResolvedValueOnce({
      docs: [
        listDoc({ id: 20, slug: 'recent-only-a' }),
        listDoc({ id: 21, slug: 'recent-only-b' }),
      ],
    });

    const related = await getRelatedPosts({ slug: 'lonely', category: null, tags: null }, 2);

    expect(find).toHaveBeenCalledOnce();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: { not_equals: 'lonely' } },
        limit: 2,
      }),
    );
    expect(related).toHaveLength(2);
  });

  it('maps results with the list-item mapper shape', async () => {
    find.mockResolvedValueOnce({
      docs: [listDoc({ id: 2, slug: 'mapped-post', title: 'Mapped Post' })],
    });

    const related = await getRelatedPosts(currentPost, 1);

    expect(related[0]).toEqual(
      expect.objectContaining({
        id: 2,
        slug: 'mapped-post',
        title: 'Mapped Post',
        href: '/blog/mapped-post/',
        category: 'Restoration',
        categorySlug: 'restoration',
      }),
    );
  });

  it('never returns more than three posts', async () => {
    find.mockResolvedValueOnce({
      docs: [
        listDoc({ id: 2, slug: 'a' }),
        listDoc({ id: 3, slug: 'b' }),
        listDoc({ id: 4, slug: 'c' }),
        listDoc({ id: 5, slug: 'd' }),
      ],
    });

    const related = await getRelatedPosts(currentPost, 10);

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ limit: 3 }));
    expect(related).toHaveLength(3);
  });
});
