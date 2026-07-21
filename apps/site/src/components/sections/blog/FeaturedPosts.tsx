import Image from 'next/image';
import Link from 'next/link';

import { getCachedBlogPosts } from '@/lib/payload/cache';
import type { Post } from '@/lib/posts';

interface FeaturedPostsProps {
  limit?: number;
}

function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function FeaturedPosts({ limit = 1 }: FeaturedPostsProps) {
  let featuredPosts: Post[];
  try {
    featuredPosts = await getCachedBlogPosts({ featured: true, limit });
  } catch {
    return null;
  }

  if (!featuredPosts || featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="pb-10 pt-4">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        {featuredPosts.map((featuredPost) => {
          const category = featuredPost.category ?? featuredPost.tags?.[0] ?? 'Journal';

          return (
            <Link
              key={featuredPost.id}
              href={featuredPost.href}
              className="group grid items-center gap-8 overflow-hidden rounded-xl border border-line bg-fleece p-[22px] shadow-md transition-all duration-150 hover:-translate-y-1 hover:shadow-lg lg:grid-cols-[1.15fr_0.85fr] lg:gap-11"
            >
              <div className="relative aspect-[16/11] overflow-hidden rounded-[20px]">
                <Image
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  quality={80}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
              <div className="px-1 py-2 lg:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
                  Featured · {category}
                </p>
                <h2 className="mt-3 font-heading text-[32px] font-normal leading-[1.14] text-bark lg:text-4xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-3.5 text-[16.5px] leading-[1.7] text-charcoal">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3 text-sm text-stone">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-eucalypt-100 font-heading text-[15px] text-eucalypt-700">
                    {authorInitials(featuredPost.author)}
                  </span>
                  <span>
                    {featuredPost.author} · {featuredPost.formattedDate}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
