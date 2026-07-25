import 'server-only';

import { unstable_cache } from 'next/cache';

import type { Post as PayloadPost, Recipe as PayloadRecipe } from '@/payload-types';
import type { Post } from '@/features/blog/types';
import type { RecipeListItem } from '@/lib/payload/map-content';
import { PAYLOAD_CACHE_TAGS } from '@/lib/payload/cache-tags';
import {
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostSlugs,
  getBlogPostsPage,
  type BlogPostsPage,
  type BlogPostsPageOptions,
} from '@/features/blog/queries/posts';
import { getBlogCategories } from '@/features/blog/queries/categories';
import { getRecipeBySlug, getRecipeSlugs, getRecipes } from '@/features/recipes/queries/recipes';

export { PAYLOAD_CACHE_TAGS } from '@/lib/payload/cache-tags';

const CACHE_REVALIDATE_SECONDS = 86_400;

export type BlogPostsOptions = {
  limit?: number;
  featured?: boolean;
};

function blogPostsCacheKey(opts: BlogPostsOptions = {}): string[] {
  const { limit, featured = false } = opts;

  return ['payload', 'posts', 'list', String(limit ?? 'default'), featured ? 'featured' : 'all'];
}

function blogPostCacheKey(slug: string): string[] {
  return ['payload', 'post', slug];
}

function blogPostSlugsCacheKey(): string[] {
  return ['payload', 'posts', 'slugs'];
}

function recipeCacheKey(slug: string): string[] {
  return ['payload', 'recipe', slug];
}

function recipeSlugsCacheKey(): string[] {
  return ['payload', 'recipes', 'slugs'];
}

export async function getCachedBlogPosts(opts?: BlogPostsOptions): Promise<Post[]> {
  const options = opts ?? {};
  const cached = unstable_cache(() => getBlogPosts(options), blogPostsCacheKey(options), {
    tags: [PAYLOAD_CACHE_TAGS.posts],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}

export async function getCachedBlogPostsPage(
  opts: BlogPostsPageOptions = {},
): Promise<BlogPostsPage> {
  const { page = 1, perPage = 6, excludeFeatured = false, categorySlug } = opts;
  const cached = unstable_cache(
    () => getBlogPostsPage({ page, perPage, excludeFeatured, categorySlug }),
    [
      'payload',
      'posts',
      'page',
      String(page),
      String(perPage),
      excludeFeatured ? 'no-featured' : 'all-featured',
      categorySlug ?? 'all-categories',
    ],
    {
      tags: [PAYLOAD_CACHE_TAGS.posts],
      revalidate: CACHE_REVALIDATE_SECONDS,
    },
  );

  return cached();
}

export async function getCachedBlogCategories(): Promise<
  Awaited<ReturnType<typeof getBlogCategories>>
> {
  const cached = unstable_cache(() => getBlogCategories(), ['payload', 'categories', 'list'], {
    tags: [PAYLOAD_CACHE_TAGS.posts],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}

export async function getCachedRecipes(): Promise<RecipeListItem[]> {
  const cached = unstable_cache(() => getRecipes(), ['payload', 'recipes', 'list'], {
    tags: [PAYLOAD_CACHE_TAGS.recipes],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}

export async function getCachedBlogPostBySlug(slug: string): Promise<PayloadPost | null> {
  const cached = unstable_cache(() => getBlogPostBySlug(slug), blogPostCacheKey(slug), {
    tags: [PAYLOAD_CACHE_TAGS.posts, PAYLOAD_CACHE_TAGS.post(slug)],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}

export async function getCachedBlogPostSlugs(): Promise<string[]> {
  const cached = unstable_cache(() => getBlogPostSlugs(), blogPostSlugsCacheKey(), {
    tags: [PAYLOAD_CACHE_TAGS.posts],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}

export async function getCachedRecipeBySlug(slug: string): Promise<PayloadRecipe | null> {
  const cached = unstable_cache(() => getRecipeBySlug(slug), recipeCacheKey(slug), {
    tags: [PAYLOAD_CACHE_TAGS.recipes, PAYLOAD_CACHE_TAGS.recipe(slug)],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}

export async function getCachedRecipeSlugs(): Promise<string[]> {
  const cached = unstable_cache(() => getRecipeSlugs(), recipeSlugsCacheKey(), {
    tags: [PAYLOAD_CACHE_TAGS.recipes],
    revalidate: CACHE_REVALIDATE_SECONDS,
  });

  return cached();
}
