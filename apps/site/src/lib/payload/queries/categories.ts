import 'server-only';

import type { Category } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';
import {
  mapPayloadDocToRoute,
  mapPayloadPostToListItem,
  type ContentRouteEntry,
  type PostListInput,
} from '@/lib/payload/map-content';
import type { Post } from '@/lib/posts';
import { categoryUrl } from '@/lib/payload/urls';

export type BlogCategory = Pick<Category, 'id' | 'name' | 'slug'>;

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

async function getCategoriesFromPosts(): Promise<BlogCategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    depth: 1,
    limit: 100,
    sort: '-date',
    select: {
      category: true,
    },
  });

  const bySlug = new Map<string, BlogCategory>();

  for (const doc of result.docs) {
    const category = doc.category;
    if (category && typeof category === 'object') {
      bySlug.set(category.slug, {
        id: category.id,
        name: category.name,
        slug: category.slug,
      });
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'categories',
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
    return result.docs as BlogCategory[];
  }

  return getCategoriesFromPosts();
}

export async function getCategorySlugs(): Promise<string[]> {
  const categories = await getBlogCategories();
  return categories.map((category) => category.slug);
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const categories = await getBlogCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getPostsByCategory(slug: string): Promise<Post[]> {
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
      'category.slug': {
        equals: slug,
      },
    },
  });

  return result.docs.map((doc, index) => mapPayloadPostToListItem(doc as PostListInput, index));
}

export async function getCategorySitemapEntries(): Promise<ContentRouteEntry[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'categories',
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
      mapPayloadDocToRoute(categoryUrl(doc.slug), doc.updatedAt, {
        priority: 0.6,
        changeFrequency: 'weekly',
      }),
    );
  }

  const fromPosts = await getCategoriesFromPosts();
  const lastModified = new Date().toISOString();

  return fromPosts.map((category) =>
    mapPayloadDocToRoute(categoryUrl(category.slug), lastModified, {
      priority: 0.6,
      changeFrequency: 'weekly',
    }),
  );
}
