import { BlogIndexPostsClient } from './BlogIndexPostsClient';
import { getCachedBlogCategories, getCachedBlogPostsPage } from '@/lib/payload/cache';

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
    <BlogIndexPostsClient
      categories={categories}
      initialPosts={postsPage.posts}
      initialTotalPages={postsPage.totalPages}
    />
  );
}
