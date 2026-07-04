import 'server-only';

import type { Recipe as PayloadRecipe } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';
import {
  mapPayloadDocToRoute,
  mapPayloadRecipeToDetail,
  mapPayloadRecipeToListItem,
} from '@/lib/payload/map-content';
import type { ContentRouteEntry, RecipeListInput, RecipeListItem } from '@/lib/payload/map-content';
import { recipeUrl } from '@/lib/payload/urls';

export async function getRecipes(opts: { limit?: number } = {}): Promise<RecipeListItem[]> {
  const { limit = 100 } = opts;
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 0,
    limit,
    sort: '-date',
    // Positive projection for the listing page; excludes ingredients and
    // instructions arrays, which only the detail page needs.
    select: {
      title: true,
      slug: true,
      date: true,
      excerpt: true,
      description: true,
      image: true,
      servings: true,
      totalTime: true,
      difficulty: true,
    },
  });

  return result.docs.map((doc, index) => mapPayloadRecipeToListItem(doc as RecipeListInput, index));
}

export async function getRecipeBySlug(slug: string): Promise<PayloadRecipe | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
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

export async function getRecipeDetailBySlug(slug: string) {
  const recipe = await getRecipeBySlug(slug);
  return recipe ? mapPayloadRecipeToDetail(recipe) : null;
}

export async function getRecipeSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
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

export async function getRecipeSitemapEntries(): Promise<ContentRouteEntry[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'recipes',
    overrideAccess: false,
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
