import { getCachedBlogPostsPage } from '@/lib/payload/cache';

import PostCard from './PostCard';
import PaginationNav from './PaginationNav';

interface PaginatedPostsProps {
  page: number;
  perPage?: number;
  excludeFeatured?: boolean;
  categorySlug?: string;
  title?: string;
  subtitle?: string;
}

export async function PaginatedPosts({
  page,
  perPage = 6,
  excludeFeatured = false,
  categorySlug,
  title,
  subtitle,
}: PaginatedPostsProps) {
  let result;
  try {
    result = await getCachedBlogPostsPage({ page, perPage, excludeFeatured, categorySlug });
  } catch {
    return null;
  }

  const { posts, totalPages } = result;

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
      {(title || subtitle) && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {title && (
            <h2 className="font-heading text-4xl font-normal tracking-tight text-balance text-eucalypt-600 sm:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-2 text-lg/8 text-charcoal">{subtitle}</p>}
        </div>
      )}
      <div className="grid auto-rows-fr grid-cols-1 gap-8 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <PaginationNav currentPage={page} totalPages={totalPages} categorySlug={categorySlug} />
    </div>
  );
}
