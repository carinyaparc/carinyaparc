'use client';

import { useSearchParams } from 'next/navigation';

import type { Post } from '@/lib/posts';

import { JournalCategoryFilter, type JournalCategory } from './JournalCategoryFilter';
import PostCard from './PostCard';

interface JournalPostGridProps {
  posts: Post[];
  categories: JournalCategory[];
}

export function JournalPostGrid({ posts, categories }: JournalPostGridProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get('category') ?? undefined;
  const visiblePosts = activeSlug
    ? posts.filter((post) => post.categorySlug === activeSlug)
    : posts;

  return (
    <>
      <JournalCategoryFilter categories={categories} activeSlug={activeSlug} />

      {visiblePosts.length > 0 ? (
        <div className="grid auto-rows-fr grid-cols-1 gap-8 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-charcoal">
          No posts in this category yet. Try another filter or check back soon.
        </p>
      )}
    </>
  );
}
