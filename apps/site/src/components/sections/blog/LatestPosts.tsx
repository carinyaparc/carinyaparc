/**
 * LatestPosts organism - Refactored with PostCard molecule
 * Maps to: * Task: T4.5
 */

import Link from 'next/link';

import { getCachedBlogPosts } from '@/lib/payload/cache';
import type { Post } from '@/lib/posts';

import PostCard from './PostCard';

interface LatestPostsProps {
  title: string;
  subtitle?: string;
  limit?: number;
  featured?: boolean;
  viewAllLink?: string;
  eyebrow?: string;
}

export async function LatestPosts({
  title,
  subtitle,
  limit = 3,
  featured = false,
  viewAllLink = '/blog',
  eyebrow = 'Life on pasture',
}: LatestPostsProps) {
  let posts: Post[];
  try {
    posts = await getCachedBlogPosts({ limit, featured });
  } catch {
    return null;
  }

  return (
    <div className="border-t border-line bg-fleece py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-4xl font-normal tracking-tight text-balance text-eucalypt-600 sm:text-[40px]">
              {title}
            </h2>
            {subtitle ? <p className="mt-2 text-lg/8 text-charcoal">{subtitle}</p> : null}
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="shrink-0 text-[15px] font-semibold text-eucalypt-600 hover:opacity-70 transition-opacity"
            >
              View all posts →
            </Link>
          )}
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl auto-rows-fr grid-cols-1 gap-7 sm:mt-14 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
