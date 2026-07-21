import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import type { Post } from '@/lib/posts';

import PostCard from './PostCard';

interface JournalPostGridProps {
  posts: Post[];
  totalPages: number;
  categorySlug?: string;
}

function loadMoreHref(page: number, categorySlug?: string): string {
  const base = page <= 1 ? '/blog/' : `/blog/page/${page}/`;

  if (!categorySlug) {
    return base;
  }

  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}category=${encodeURIComponent(categorySlug)}`;
}

export function JournalPostGrid({ posts, totalPages, categorySlug }: JournalPostGridProps) {
  return (
    <section className="py-9 pb-[84px]">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        {posts.length > 0 ? (
          <div className="grid auto-rows-fr grid-cols-1 gap-[30px] lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} variant="journal" />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-charcoal">
            No posts in this category yet. Try another filter or check back soon.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-14 text-center">
            <Button render={<Link href={loadMoreHref(2, categorySlug)} />} variant="primary">
              Load more posts
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
