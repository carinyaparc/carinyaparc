import { getCachedBlogPostsPage } from '@/lib/payload/cache';

import PostCard from './PostCard';
import PaginationNav from './PaginationNav';

interface PaginatedPostsProps {
  page: number;
  perPage?: number;
  excludeFeatured?: boolean;
  categorySlug?: string;
}

export async function PaginatedPosts({
  page,
  perPage = 6,
  excludeFeatured = false,
  categorySlug,
}: PaginatedPostsProps) {
  let result;
  try {
    result = await getCachedBlogPostsPage({ page, perPage, excludeFeatured, categorySlug });
  } catch {
    return null;
  }

  const { posts, totalPages } = result;

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <p className="py-12 text-center text-charcoal">
          No posts in this category yet. Try another filter or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
      <div className="grid auto-rows-fr grid-cols-1 gap-[30px] lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="journal" />
        ))}
      </div>
      <PaginationNav currentPage={page} totalPages={totalPages} categorySlug={categorySlug} />
    </div>
  );
}
