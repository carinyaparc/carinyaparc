import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find }),
}));

import { getBlogPostBySlug, getBlogPosts, getBlogPostSlugs } from '@/lib/payload/queries/posts';
import {
  getRecipeBySlug,
  getRecipeSitemapEntries,
  getRecipeSlugs,
} from '@/lib/payload/queries/recipes';
import { getPostSitemapEntries } from '@/lib/payload/queries/sitemap-posts';

/**
 * Payload's Local API defaults to overrideAccess: true, which bypasses the
 * publicReadPublished access rule. Every public-facing query must opt out so
 * draft documents never leak to pages, listings, or the sitemap.
 */
const publicQueries: Array<[string, () => Promise<unknown>]> = [
  ['getBlogPosts', () => getBlogPosts({ limit: 3 })],
  ['getBlogPostBySlug', () => getBlogPostBySlug('a-post')],
  ['getBlogPostSlugs', () => getBlogPostSlugs()],
  ['getPostSitemapEntries', () => getPostSitemapEntries()],
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
