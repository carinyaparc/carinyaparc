import { unstable_cache } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POSTS_CACHE_TAG } from '@/lib/constants';
import { getBlogPosts } from '@/lib/payload/queries/posts';

type BlogPostsOptions = {
  limit?: number;
  featured?: boolean;
};

type FetchBlogPosts = (opts: BlogPostsOptions) => Promise<unknown>;

const { cachedFetchBlogPosts, find } = vi.hoisted(() => ({
  cachedFetchBlogPosts: vi.fn(),
  find: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fetchBlogPosts: FetchBlogPosts) => {
    cachedFetchBlogPosts.mockImplementation((opts: BlogPostsOptions) => fetchBlogPosts(opts));
    return cachedFetchBlogPosts;
  }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn(async () => ({ find })),
}));

vi.mock('@/lib/payload/map-content', () => ({
  mapPayloadPostToListItem: vi.fn((doc: { slug: string }, index: number) => ({
    index,
    slug: doc.slug,
  })),
}));

describe('getBlogPosts', () => {
  beforeEach(() => {
    find.mockReset();
    cachedFetchBlogPosts.mockClear();
    find.mockResolvedValue({ docs: [] });
  });

  it('configures a tagged cache with a TTL safety net', () => {
    expect(vi.mocked(unstable_cache)).toHaveBeenCalledWith(
      expect.any(Function),
      [POSTS_CACHE_TAG],
      {
        tags: [POSTS_CACHE_TAG],
        revalidate: 60 * 60,
      },
    );
  });

  it('passes distinct query options through to the cached function', async () => {
    await getBlogPosts({ limit: 3 });
    await getBlogPosts({ featured: true, limit: 1 });

    expect(cachedFetchBlogPosts).toHaveBeenNthCalledWith(1, { limit: 3 });
    expect(cachedFetchBlogPosts).toHaveBeenNthCalledWith(2, { featured: true, limit: 1 });
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        limit: 1,
        where: {
          featured: {
            equals: true,
          },
        },
      }),
    );
  });
});
