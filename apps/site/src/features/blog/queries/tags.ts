import 'server-only';

import type { Tag } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';
import {
  mapPayloadDocToRoute,
  mapPayloadPostToListItem,
  type ContentRouteEntry,
  type PostListInput,
} from '@/lib/payload/map-content';
import type { Post } from '@/features/blog/types';
import { tagUrl } from '@/lib/payload/urls';

export type BlogTag = Pick<Tag, 'id' | 'name' | 'slug'>;

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

async function getTagsFromPosts(): Promise<BlogTag[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    depth: 1,
    limit: 100,
    sort: '-date',
    select: {
      tags: true,
    },
  });

  const bySlug = new Map<string, BlogTag>();

  for (const doc of result.docs) {
    const tags = doc.tags;
    if (!tags?.length) {
      continue;
    }

    for (const tag of tags) {
      if (tag && typeof tag === 'object') {
        bySlug.set(tag.slug, {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        });
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'tags',
    overrideAccess: false,
    depth: 0,
    limit: 100,
    sort: 'name',
    select: {
      name: true,
      slug: true,
    },
  });

  if (result.docs.length > 0) {
    return result.docs as BlogTag[];
  }

  return getTagsFromPosts();
}

export async function getTagSlugs(): Promise<string[]> {
  const tags = await getBlogTags();
  return tags.map((tag) => tag.slug);
}

export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
  const tags = await getBlogTags();
  return tags.find((tag) => tag.slug === slug) ?? null;
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 1,
    limit: 100,
    sort: '-date',
    select: POST_LIST_SELECT,
    where: {
      'tags.slug': {
        equals: tag,
      },
    },
  });

  return result.docs.map((doc, index) => mapPayloadPostToListItem(doc as PostListInput, index));
}

export async function getTagSitemapEntries(): Promise<ContentRouteEntry[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'tags',
    overrideAccess: false,
    depth: 0,
    limit: 100,
    sort: 'name',
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  if (result.docs.length > 0) {
    return result.docs.map((doc) =>
      mapPayloadDocToRoute(tagUrl(doc.slug), doc.updatedAt, {
        priority: 0.6,
        changeFrequency: 'weekly',
      }),
    );
  }

  const fromPosts = await getTagsFromPosts();
  const lastModified = new Date().toISOString();

  return fromPosts.map((tag) =>
    mapPayloadDocToRoute(tagUrl(tag.slug), lastModified, {
      priority: 0.6,
      changeFrequency: 'weekly',
    }),
  );
}
