/**
 * PostCard molecule - Extracted from LatestPosts
 * Maps to: * Task: T4.5
 *
 * Reusable blog post card component
 */

import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/src/lib/posts';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-eucalyptus-600 px-8 pt-80 pb-8 sm:pt-48 lg:pt-80">
      <Image
        alt={post.title}
        src={post.imageUrl}
        fill
        loading="lazy"
        className="absolute inset-0 -z-10 object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        quality={80}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-eucalyptus-600 via-eucalyptus-600/40" />
      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-eucalyptus-600/10 ring-inset" />

      <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-eucalyptus-200">
        <time dateTime={post.datetime} className="mr-8">
          {post.formattedDate}
        </time>
        {post.author && (
          <div className="-ml-4 flex items-center gap-x-4">
            <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
              <circle r={1} cx={1} cy={1} />
            </svg>
            <div className="flex gap-x-2.5">
              {post.authorImageUrl && (
                <Image
                  alt=""
                  src={post.authorImageUrl}
                  width={24}
                  height={24}
                  loading="lazy"
                  className="size-6 flex-none rounded-full bg-white/10"
                  quality={80}
                />
              )}
              {post.author}
            </div>
          </div>
        )}
      </div>
      <h3 className="mt-3 text-lg/6 font-semibold text-white">
        <Link href={post.href}>
          <span>
            <span className="absolute inset-0" />
            {post.title}
          </span>
        </Link>
      </h3>
      {post.description && (
        <p className="mt-2 line-clamp-2 text-sm/6 text-eucalyptus-100">{post.description}</p>
      )}
    </article>
  );
}
