import 'server-only';

import type { Where } from 'payload';

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
  excludeFeatured?: boolean;
  categorySlug?: string;
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
  category: true,
  tags: true,
  excerpt: true,
  description: true,
  image: true,
  featured: true,
} as const;

function buildPostsWhere(opts: {
  featured?: boolean;
  excludeFeatured?: boolean;
  categorySlug?: string;
}): Where | undefined {
  const conditions: Where[] = [];

  if (opts.featured) {
    conditions.push({ featured: { equals: true } });
  }

  if (opts.excludeFeatured) {
    conditions.push({ featured: { not_equals: true } });
  }

  if (opts.categorySlug) {
    conditions.push({
      'category.slug': {
        equals: opts.categorySlug,
      },
    });
  }

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { and: conditions };
}

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
          where: buildPostsWhere({ featured: true }),
        }
      : {}),
  });

  return result.docs.map((doc, index) => mapPayloadPostToListItem(doc as PostListInput, index));
}

export async function getBlogPostsPage(opts: BlogPostsPageOptions = {}): Promise<BlogPostsPage> {
  const { page = 1, perPage = 6, excludeFeatured = false, categorySlug } = opts;
  const payload = await getPayloadClient();
  const where = buildPostsWhere({ excludeFeatured, categorySlug });

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
    ...(where ? { where } : {}),
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

export async function getRelatedBlogPosts(
  slug: string,
  categorySlug: string | null,
  limit = 3,
): Promise<Post[]> {
  const payload = await getPayloadClient();
  const where: Where = categorySlug
    ? {
        and: [{ slug: { not_equals: slug } }, { 'category.slug': { equals: categorySlug } }],
      }
    : { slug: { not_equals: slug } };

  const result = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    depth: 1,
    limit,
    sort: '-date',
    select: POST_LIST_SELECT,
    where,
  });

  return result.docs.map((doc, index) => mapPayloadPostToListItem(doc as PostListInput, index));
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
