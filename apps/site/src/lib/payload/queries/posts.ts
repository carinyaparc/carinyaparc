import 'server-only';

import type { Post as PayloadPost } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';
import { mapPayloadPostToListItem, type PostListInput } from '@/lib/payload/map-content';
import type { Post } from '@/lib/posts';

type BlogPostsOptions = {
  limit?: number;
  featured?: boolean;
};

export async function getBlogPosts(opts: BlogPostsOptions = {}): Promise<Post[]> {
  const { limit, featured = false } = opts;
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: limit ?? 100,
    sort: '-date',
    select: {
      body: false,
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

  return result.docs.map((doc, index) =>
    mapPayloadPostToListItem(doc as PostListInput, index),
  );
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
