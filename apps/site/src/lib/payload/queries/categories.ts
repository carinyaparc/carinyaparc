import 'server-only';

import type { Category } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';

export type BlogCategory = Pick<Category, 'id' | 'name' | 'slug'>;

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
