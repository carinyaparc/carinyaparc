import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find }),
}));

import {
  getCategorySitemapEntries,
  getCategorySlugs,
  getPostsByCategory,
} from '@/lib/payload/queries/categories';
import {
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostSlugs,
  getBlogPostsPage,
} from '@/lib/payload/queries/posts';
import {
  getRecipeBySlug,
  getRecipeSitemapEntries,
  getRecipeSlugs,
  getRecipes,
} from '@/lib/payload/queries/recipes';
import { getRelatedPosts } from '@/lib/payload/queries/related-posts';
import { getPostSitemapEntries } from '@/lib/payload/queries/sitemap-posts';
import { getPostsByTag, getTagSitemapEntries, getTagSlugs } from '@/lib/payload/queries/tags';

/**
 * Payload's Local API defaults to overrideAccess: true, which bypasses the
 * publicReadPublished access rule. Every public-facing query must opt out so
 * draft documents never leak to pages, listings, or the sitemap.
 */
const publicQueries: Array<[string, () => Promise<unknown>]> = [
  ['getBlogPosts', () => getBlogPosts({ limit: 3 })],
  ['getBlogPostsPage', () => getBlogPostsPage({ page: 2 })],
  ['getBlogPostBySlug', () => getBlogPostBySlug('a-post')],
  ['getBlogPostSlugs', () => getBlogPostSlugs()],
  ['getPostSitemapEntries', () => getPostSitemapEntries()],
  ['getCategorySlugs', () => getCategorySlugs()],
  ['getPostsByCategory', () => getPostsByCategory('restoration')],
  ['getCategorySitemapEntries', () => getCategorySitemapEntries()],
  ['getTagSlugs', () => getTagSlugs()],
  ['getPostsByTag', () => getPostsByTag('soil-health')],
  ['getTagSitemapEntries', () => getTagSitemapEntries()],
  [
    'getRelatedPosts',
    () =>
      getRelatedPosts({
        slug: 'a-post',
        category: { slug: 'restoration' },
        tags: [{ slug: 'soil-health' }],
      }),
  ],
  ['getRecipes', () => getRecipes()],
  ['getRecipeBySlug', () => getRecipeBySlug('a-recipe')],
  ['getRecipeSlugs', () => getRecipeSlugs()],
  ['getRecipeSitemapEntries', () => getRecipeSitemapEntries()],
];

describe('public Payload queries enforce access control', () => {
  beforeEach(() => {
    find.mockClear();
  });

  it.each(publicQueries)('%s passes overrideAccess: false', async (_name, run) => {
    await run();

    expect(find).toHaveBeenCalled();
    for (const call of find.mock.calls) {
      const options = call[0] as { overrideAccess?: boolean };
      expect(options.overrideAccess).toBe(false);
    }
  });
});
