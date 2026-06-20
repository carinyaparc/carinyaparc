import { unstable_cache } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getCachedBlogPostBySlug,
  getCachedBlogPosts,
  getCachedBlogPostSlugs,
  getCachedRecipeBySlug,
  getCachedRecipeSlugs,
  PAYLOAD_CACHE_TAGS,
} from '@/lib/payload/cache';
import { getBlogPostBySlug, getBlogPosts, getBlogPostSlugs } from '@/lib/payload/queries/posts';
import { getRecipeBySlug, getRecipeSlugs } from '@/lib/payload/queries/recipes';

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: () => unknown) => fn),
}));

vi.mock('@/lib/payload/queries/posts', () => ({
  getBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  getBlogPostSlugs: vi.fn(),
}));

vi.mock('@/lib/payload/queries/recipes', () => ({
  getRecipeBySlug: vi.fn(),
  getRecipeSlugs: vi.fn(),
}));

describe('PAYLOAD_CACHE_TAGS', () => {
  it('resolves a unique cache tag for a post slug', () => {
    expect(PAYLOAD_CACHE_TAGS.post('my-post')).toBe('payload:post:my-post');
  });

  it('uses a stable collection tag for posts', () => {
    expect(PAYLOAD_CACHE_TAGS.posts).toBe('payload:posts');
  });

  it('resolves a unique cache tag for a recipe slug', () => {
    expect(PAYLOAD_CACHE_TAGS.recipe('flatbread')).toBe('payload:recipe:flatbread');
  });

  it('uses a stable collection tag for recipes', () => {
    expect(PAYLOAD_CACHE_TAGS.recipes).toBe('payload:recipes');
  });
});

describe('cached query functions', () => {
  beforeEach(() => {
    vi.mocked(unstable_cache).mockClear();
    vi.mocked(getBlogPosts).mockResolvedValue([]);
    vi.mocked(getBlogPostBySlug).mockResolvedValue(null);
    vi.mocked(getBlogPostSlugs).mockResolvedValue(['alpha', 'beta']);
    vi.mocked(getRecipeBySlug).mockResolvedValue(null);
    vi.mocked(getRecipeSlugs).mockResolvedValue(['flatbread']);
  });

  it('exports blog cached query functions', () => {
    expect(typeof getCachedBlogPosts).toBe('function');
    expect(typeof getCachedBlogPostBySlug).toBe('function');
    expect(typeof getCachedBlogPostSlugs).toBe('function');
  });

  it('wraps getBlogPosts with a list cache key and posts tag', async () => {
    await getCachedBlogPosts({ limit: 3, featured: true });

    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['payload', 'posts', 'list', '3', 'featured'],
      expect.objectContaining({
        tags: ['payload:posts'],
        revalidate: 86_400,
      }),
    );
    expect(getBlogPosts).toHaveBeenCalledWith({ limit: 3, featured: true });
  });

  it('wraps getBlogPostBySlug with slug cache key and post tags', async () => {
    await getCachedBlogPostBySlug('my-post');

    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['payload', 'post', 'my-post'],
      expect.objectContaining({
        tags: ['payload:posts', 'payload:post:my-post'],
        revalidate: 86_400,
      }),
    );
    expect(getBlogPostBySlug).toHaveBeenCalledWith('my-post');
  });

  it('wraps getBlogPostSlugs with a slugs cache key and posts tag', async () => {
    await getCachedBlogPostSlugs();

    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['payload', 'posts', 'slugs'],
      expect.objectContaining({
        tags: ['payload:posts'],
        revalidate: 86_400,
      }),
    );
    expect(getBlogPostSlugs).toHaveBeenCalledOnce();
  });

  it('wraps getRecipeBySlug with slug cache key and recipe tags', async () => {
    await getCachedRecipeBySlug('flatbread');

    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['payload', 'recipe', 'flatbread'],
      expect.objectContaining({
        tags: ['payload:recipes', 'payload:recipe:flatbread'],
        revalidate: 86_400,
      }),
    );
    expect(getRecipeBySlug).toHaveBeenCalledWith('flatbread');
  });

  it('wraps getRecipeSlugs with a slugs cache key and recipes tag', async () => {
    await getCachedRecipeSlugs();

    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['payload', 'recipes', 'slugs'],
      expect.objectContaining({
        tags: ['payload:recipes'],
        revalidate: 86_400,
      }),
    );
    expect(getRecipeSlugs).toHaveBeenCalledOnce();
  });
});
