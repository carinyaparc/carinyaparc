/**
 * LatestPosts organism - Refactored with PostCard molecule
 * Maps to: * Task: T4.5
 */

import Link from 'next/link';
import { getBlogPosts } from '@/src/lib/posts';
import PostCard from './PostCard';

// Force this component to be dynamic
export const dynamic = 'force-dynamic';

interface LatestPostsProps {
  title: string;
  subtitle: string;
  limit?: number;
  featured?: boolean;
  viewAllLink?: string;
}

export async function LatestPosts({
  title,
  subtitle,
  limit = 3,
  featured = false,
  viewAllLink = '/blog',
}: LatestPostsProps) {
  let posts: Awaited<ReturnType<typeof getBlogPosts>>;
  try {
    posts = await getBlogPosts({ limit, featured });
  } catch {
    return null;
  }

  return (
    <div className="">
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

        {viewAllLink && (
          <div className="text-center mt-12">
            <Link
              href={viewAllLink}
              className="inline-flex rounded-md bg-eucalyptus-600 text-white hover:bg-eucalyptus-700 px-3.5 py-2.5 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalyptus-600"
            >
              <span>
                View All Posts
                <span className="ml-2">→</span>
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
