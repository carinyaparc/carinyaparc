/**
 * PostCard molecule - Extracted from LatestPosts
 * Maps to: * Task: T4.5
 *
 * Reusable blog post card component — homepage journal teaser style
 */

import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/src/lib/posts';
import { cn } from '@/lib/cn';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'related';
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  const category = post.category ?? post.tags?.[0] ?? 'Journal';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-line shadow-md transition-all duration-150 hover:-translate-y-1 hover:shadow-lg',
        variant === 'related' ? 'bg-paperbark' : 'bg-paperbark',
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          alt={post.title}
          src={post.imageUrl}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          quality={80}
        />
      </div>
      <div className="flex flex-1 flex-col p-[26px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
          {category}
        </p>
        <h3 className="mt-2 font-heading text-[22px] font-normal leading-snug text-bark">
          <Link href={post.href} className="hover:opacity-70 transition-opacity">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>
        {post.description && variant === 'default' && (
          <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-[1.55] text-stone">
            {post.description}
          </p>
        )}
        {variant === 'default' && (
          <p className="mt-4 text-[13px] text-stone">{post.formattedDate}</p>
        )}
      </div>
    </article>
  );
}
