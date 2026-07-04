import { getCachedBlogPostsPage } from '@/lib/payload/cache';

import PostCard from './PostCard';
import PaginationNav from './PaginationNav';

interface PaginatedPostsProps {
  title: string;
  subtitle: string;
  page: number;
  perPage?: number;
}

export async function PaginatedPosts({ title, subtitle, page, perPage = 6 }: PaginatedPostsProps) {
  let result;
  try {
    result = await getCachedBlogPostsPage({ page, perPage });
  } catch {
    return null;
  }

  const { posts, totalPages } = result;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-eucalyptus-600 sm:text-5xl">
          {title}
        </h2>
        <p className="mt-2 text-lg/8 text-eucalyptus-300">{subtitle}</p>
      </div>
      <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <PaginationNav currentPage={page} totalPages={totalPages} />
    </div>
  );
}
