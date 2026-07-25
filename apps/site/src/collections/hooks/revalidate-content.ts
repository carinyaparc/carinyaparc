import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

import {
  getPayloadRevalidationTags,
  getPostRevalidationPaths,
  getRecipeRevalidationPaths,
  revalidatePaths,
  revalidatePayloadTags,
} from '@/lib/payload/revalidate';
import type {
  RevalidatableCollection,
  RevalidationContext,
  RevalidationDoc,
} from '@/lib/payload/revalidate';

type PathResolver = (ctx: RevalidationContext) => string[];

const resolvers: Record<RevalidatableCollection, PathResolver> = {
  posts: getPostRevalidationPaths,
  recipes: getRecipeRevalidationPaths,
};

async function resolveCategorySlug(category: unknown): Promise<string | null> {
  if (category && typeof category === 'object' && 'slug' in category) {
    const slug = (category as { slug?: unknown }).slug;
    return typeof slug === 'string' ? slug : null;
  }

  if (typeof category === 'number') {
    try {
      // Dynamic import avoids a circular init with payload.config → collections → this hook.
      const { getPayloadClient } = await import('@/lib/payload/client');
      const payload = await getPayloadClient();
      const doc = await payload.findByID({
        collection: 'categories',
        id: category,
        depth: 0,
        overrideAccess: false,
      });
      return typeof doc?.slug === 'string' ? doc.slug : null;
    } catch {
      return null;
    }
  }

  return null;
}

async function resolveTagSlug(tag: unknown): Promise<string | null> {
  if (tag && typeof tag === 'object' && 'slug' in tag) {
    const slug = (tag as { slug?: unknown }).slug;
    return typeof slug === 'string' ? slug : null;
  }

  if (typeof tag === 'number') {
    try {
      // Dynamic import avoids a circular init with payload.config → collections → this hook.
      const { getPayloadClient } = await import('@/lib/payload/client');
      const payload = await getPayloadClient();
      const doc = await payload.findByID({
        collection: 'tags',
        id: tag,
        depth: 0,
        overrideAccess: false,
      });
      return typeof doc?.slug === 'string' ? doc.slug : null;
    } catch {
      return null;
    }
  }

  return null;
}

async function resolveTagSlugs(tags: unknown): Promise<string[]> {
  if (!Array.isArray(tags) || tags.length === 0) {
    return [];
  }

  const slugs = await Promise.all(tags.map((tag) => resolveTagSlug(tag)));
  return [...new Set(slugs.filter((slug): slug is string => Boolean(slug)))];
}

async function toRevalidationDoc(
  doc: Record<string, unknown> | null | undefined,
): Promise<RevalidationDoc> {
  return {
    slug: typeof doc?.slug === 'string' ? doc.slug : null,
    featured: typeof doc?.featured === 'boolean' ? doc.featured : null,
    _status: typeof doc?._status === 'string' ? doc._status : null,
    categorySlug: await resolveCategorySlug(doc?.category),
    tagSlugs: await resolveTagSlugs(doc?.tags),
  };
}

export function createRevalidateAfterChange(
  collection: RevalidatableCollection,
): CollectionAfterChangeHook {
  const resolve = resolvers[collection];

  return async ({ doc, previousDoc, operation }) => {
    const revalidationCtx: RevalidationContext = {
      collection,
      doc: await toRevalidationDoc(doc as Record<string, unknown>),
      previousDoc: previousDoc
        ? await toRevalidationDoc(previousDoc as Record<string, unknown>)
        : null,
      operation,
    };

    const paths = resolve(revalidationCtx);
    const logCtx = {
      collection,
      slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
    };

    await revalidatePayloadTags(getPayloadRevalidationTags(revalidationCtx), logCtx);
    await revalidatePaths(paths, logCtx);

    return doc;
  };
}

export function createRevalidateAfterDelete(
  collection: RevalidatableCollection,
): CollectionAfterDeleteHook {
  const resolve = resolvers[collection];

  return async ({ doc }) => {
    const revalidationCtx: RevalidationContext = {
      collection,
      doc: await toRevalidationDoc(doc as Record<string, unknown>),
      operation: 'delete',
    };

    const paths = resolve(revalidationCtx);
    const logCtx = {
      collection,
      slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
    };

    await revalidatePayloadTags(getPayloadRevalidationTags(revalidationCtx), logCtx);
    await revalidatePaths(paths, logCtx);
  };
}
