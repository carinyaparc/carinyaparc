'use server';

import { getCachedBlogPostsPage } from '@/lib/payload/cache';

const POSTS_PER_PAGE = 6;

export async function fetchBlogIndexPosts(categorySlug?: string) {
  return getCachedBlogPostsPage({
    page: 1,
    perPage: POSTS_PER_PAGE,
    excludeFeatured: true,
    categorySlug,
  });
}
