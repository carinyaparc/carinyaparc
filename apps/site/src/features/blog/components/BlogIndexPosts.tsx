import { BlogTopicNav } from './BlogTopicNav';
import { getCachedBlogCategories, getCachedBlogPostsPage } from '@/lib/payload/cache';

import { BlogIndexPostsClient } from './BlogIndexPostsClient';

const POSTS_PER_PAGE = 6;

export async function BlogIndexPosts() {
  const [categories, postsPage] = await Promise.all([
    getCachedBlogCategories(),
    getCachedBlogPostsPage({
      page: 1,
      perPage: POSTS_PER_PAGE,
      excludeFeatured: true,
    }),
  ]);

  return (
    <>
      <BlogTopicNav categories={categories} />
      <BlogIndexPostsClient
        initialPosts={postsPage.posts}
        initialTotalPages={postsPage.totalPages}
      />
    </>
  );
}
