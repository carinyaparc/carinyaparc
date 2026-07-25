/**
 * PostCard molecule - Extracted from LatestPosts
 *
 * Reusable blog post card component — homepage journal teaser style
 */

import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/features/blog/types';
import { formatJournalMeta } from '@/lib/payload/map-content';
import { cn } from '@/lib/cn';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'journal' | 'related';
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  const category = post.category ?? post.tags?.[0] ?? 'Journal';
  const metaText = formatJournalMeta(post.date, post.excerpt || post.description);

  const cardContent = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          alt={post.title}
          src={post.imageUrl}
          fill
          loading="lazy"
          className={cn(
            'object-cover',
            variant === 'journal' && 'transition-transform duration-300 group-hover:scale-[1.02]',
          )}
          sizes="(max-width: 768px) 100vw, 33vw"
          quality={80}
        />
      </div>
      <div className="flex flex-1 flex-col p-[26px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
          {category}
        </p>
        <h3
          className={cn(
            'font-heading text-[22px] font-normal leading-[1.22] text-bark',
            variant === 'journal' ? 'mt-2.5' : 'mt-2',
          )}
        >
          {variant === 'journal' ? (
            post.title
          ) : (
            <Link href={post.href} className="transition-opacity hover:opacity-70">
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          )}
        </h3>
        {variant === 'default' && post.description && (
          <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-[1.55] text-stone">
            {post.description}
          </p>
        )}
        {variant === 'journal' && post.excerpt && (
          <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-[1.55] text-stone">
            {post.excerpt}
          </p>
        )}
        {variant === 'default' && (
          <p className="mt-4 text-[13px] text-stone">{post.formattedDate}</p>
        )}
        {variant === 'journal' && <p className="mt-4 text-[13px] text-stone">{metaText}</p>}
      </div>
    </>
  );

  if (variant === 'journal') {
    return (
      <Link
        href={post.href}
        className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-md transition-all duration-150 hover:-translate-y-1 hover:shadow-lg"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-line shadow-md transition-all duration-150 hover:-translate-y-1 hover:shadow-lg',
        variant === 'related' ? 'bg-paperbark' : 'bg-paperbark',
      )}
    >
      {cardContent}
    </article>
  );
}
