import 'server-only';

import { unstable_cache } from 'next/cache';

import type { Post as PayloadPost } from '@/payload-types';
import { POSTS_CACHE_TAG } from '@/lib/constants';
import { getPayloadClient } from '@/lib/payload/client';
import { mapPayloadPostToListItem, type PostListInput } from '@/lib/payload/map-content';
import type { Post } from '@/lib/posts';

export { POSTS_CACHE_TAG };

type BlogPostsOptions = {
  limit?: number;
  featured?: boolean;
};

const fetchBlogPosts = async (opts: BlogPostsOptions): Promise<Post[]> => {
  const { limit, featured = false } = opts;
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: limit ?? 100,
    sort: '-date',
    // Positive projection for fields consumed by mapPayloadPostToListItem.
    // Excludes body (heavy JSONB) and tags/category relationships to avoid posts_rels joins.
    select: {
      title: true,
      slug: true,
      date: true,
      author: true,
      excerpt: true,
      description: true,
      image: true,
      featured: true,
    },
    ...(featured
      ? {
          where: {
            featured: {
              equals: true,
            },
          },
        }
      : {}),
  });

  return result.docs.map((doc, index) => mapPayloadPostToListItem(doc as PostListInput, index));
};

const getCachedBlogPosts = unstable_cache(fetchBlogPosts, [POSTS_CACHE_TAG], {
  tags: [POSTS_CACHE_TAG],
  revalidate: false,
});

export async function getBlogPosts(opts: BlogPostsOptions = {}): Promise<Post[]> {
  return getCachedBlogPosts(opts);
}

export async function getBlogPostBySlug(slug: string): Promise<PayloadPost | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs[0] ?? null;
}

export async function getBlogPostSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 100,
    select: {
      slug: true,
    },
    sort: '-date',
  });

  return result.docs.map((doc) => doc.slug);
}
