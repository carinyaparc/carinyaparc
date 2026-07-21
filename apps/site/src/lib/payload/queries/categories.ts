import 'server-only';

import type { Category } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';

export type BlogCategory = Pick<Category, 'id' | 'name' | 'slug'>;

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

  return result.docs as BlogCategory[];
}
