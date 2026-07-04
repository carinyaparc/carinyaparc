import 'server-only';

import type { Post as PayloadPost } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';
import { mapPayloadPostToListItem, type PostListInput } from '@/lib/payload/map-content';
import type { Post } from '@/lib/posts';

type BlogPostsOptions = {
  limit?: number;
  featured?: boolean;
};

export type BlogPostsPageOptions = {
  page?: number;
  perPage?: number;
};

export type BlogPostsPage = {
  posts: Post[];
  page: number;
  totalPages: number;
  totalDocs: number;
};

// Positive projection for fields consumed by mapPayloadPostToListItem.
// Excludes body (heavy JSONB) and tags/category relationships to avoid posts_rels joins.
const POST_LIST_SELECT = {
  title: true,
  slug: true,
  date: true,
  author: true,
  excerpt: true,
  description: true,
  image: true,
  featured: true,
} as const;

export async function getBlogPosts(opts: BlogPostsOptions = {}): Promise<Post[]> {
  const { limit, featured = false } = opts;
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 1,
    limit: limit ?? 100,
    sort: '-date',
    select: POST_LIST_SELECT,
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
}

export async function getBlogPostsPage(opts: BlogPostsPageOptions = {}): Promise<BlogPostsPage> {
  const { page = 1, perPage = 6 } = opts;
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 1,
    page,
    limit: perPage,
    sort: '-date',
    select: POST_LIST_SELECT,
  });

  return {
    posts: result.docs.map((doc, index) => mapPayloadPostToListItem(doc as PostListInput, index)),
    page: result.page ?? page,
    totalPages: result.totalPages ?? 1,
    totalDocs: result.totalDocs ?? result.docs.length,
  };
}

export async function getBlogPostBySlug(slug: string): Promise<PayloadPost | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    overrideAccess: false,
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
    overrideAccess: false,
    depth: 0,
    limit: 100,
    select: {
      slug: true,
    },
    sort: '-date',
  });

  return result.docs.map((doc) => doc.slug);
}
