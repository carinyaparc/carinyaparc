'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Author {
  name: string;
  imageUrl: string;
}

interface Post {
  id: number;
  title: string;
  href: string;
  description: string;
  imageUrl: string;
  date: string;
  datetime: string;
  author?: Author;
}

interface PostsLatestProps {
  title: string;
  subtitle: string;
  posts: Post[];
  viewAllLink?: string;
}

export function PostsLatest({ title, subtitle, posts, viewAllLink = '/blog' }: PostsLatestProps) {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-eucalypt-600 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-2 text-lg/8 text-eucalypt-300">{subtitle}</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-eucalypt-600 px-8 pt-80 pb-8 sm:pt-48 lg:pt-80"
            >
              <Image
                alt={post.title}
                src={post.imageUrl}
                fill
                loading="lazy"
                className="absolute inset-0 -z-10 object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={80}
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-eucalypt-600 via-eucalypt-600/40" />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-eucalypt-600/10 ring-inset" />

              <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-eucalypt-200">
                <time dateTime={post.datetime} className="mr-8">
                  {post.date}
                </time>
                {post.author && (
                  <div className="-ml-4 flex items-center gap-x-4">
                    <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <div className="flex gap-x-2.5">
                      <Image
                        alt=""
                        src={post.author.imageUrl}
                        width={24}
                        height={24}
                        loading="lazy"
                        className="size-6 flex-none rounded-full bg-white/10"
                        quality={80}
                      />
                      {post.author.name}
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
                <p className="mt-2 line-clamp-2 text-sm/6 text-eucalypt-100">{post.description}</p>
              )}
            </article>
          ))}
        </div>

        {viewAllLink && (
          <div className="text-center mt-12">
            <Link
              href={viewAllLink}
              className="inline-flex rounded-md bg-eucalypt-600 text-white hover:bg-eucalypt-700 px-3.5 py-2.5 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalypt-600"
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
