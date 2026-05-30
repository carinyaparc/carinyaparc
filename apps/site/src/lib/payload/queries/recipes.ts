import 'server-only';

import type { Recipe as PayloadRecipe } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';
import { mapPayloadDocToRoute, mapPayloadRecipeToDetail } from '@/lib/payload/map-content';
import type { ContentRouteEntry } from '@/lib/payload/map-content';
import { recipeUrl } from '@/lib/mdx/slugs';

export async function getRecipeBySlug(slug: string): Promise<PayloadRecipe | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
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

export async function getRecipeDetailBySlug(slug: string) {
  const recipe = await getRecipeBySlug(slug);
  return recipe ? mapPayloadRecipeToDetail(recipe) : null;
}

export async function getRecipeSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
    depth: 0,
    limit: 100,
    select: {
      slug: true,
    },
    sort: '-date',
  });

  return result.docs.map((doc) => doc.slug);
}

export async function getRecipeSitemapEntries(): Promise<ContentRouteEntry[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
    depth: 0,
    limit: 100,
    select: {
      slug: true,
      updatedAt: true,
    },
    sort: '-date',
  });

  return result.docs.map((doc) =>
    mapPayloadDocToRoute(recipeUrl(doc.slug), doc.updatedAt, {
      priority: 0.8,
      changeFrequency: 'monthly',
    }),
  );
}
