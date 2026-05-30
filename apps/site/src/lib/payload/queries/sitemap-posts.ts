import 'server-only';

import { getPayloadClient } from '@/lib/payload/client';
import { mapPayloadDocToRoute } from '@/lib/payload/map-content';
import type { ContentRouteEntry } from '@/lib/payload/map-content';
import { postUrl } from '@/lib/mdx/slugs';

export async function getPostSitemapEntries(): Promise<ContentRouteEntry[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 100,
    select: {
      slug: true,
      updatedAt: true,
    },
    sort: '-date',
  });

  return result.docs.map((doc) =>
    mapPayloadDocToRoute(postUrl(doc.slug), doc.updatedAt, {
      priority: 0.7,
      changeFrequency: 'daily',
    }),
  );
}
