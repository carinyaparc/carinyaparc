import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

import {
  getPostRevalidationPaths,
  getRecipeRevalidationPaths,
  revalidatePaths,
} from '@/lib/payload/revalidate';
import type { RevalidatableCollection } from '@/lib/payload/revalidate';

type PathResolver = (ctx: {
  collection: RevalidatableCollection;
  doc: { slug?: string | null; featured?: boolean | null; _status?: string | null };
  previousDoc?: { slug?: string | null; featured?: boolean | null; _status?: string | null } | null;
  operation: 'create' | 'update' | 'delete';
}) => string[];

const resolvers: Record<RevalidatableCollection, PathResolver> = {
  posts: getPostRevalidationPaths,
  recipes: getRecipeRevalidationPaths,
};

export function createRevalidateAfterChange(
  collection: RevalidatableCollection,
): CollectionAfterChangeHook {
  const resolve = resolvers[collection];

  return async ({ doc, previousDoc, operation }) => {
    const paths = resolve({
      collection,
      doc: {
        slug: typeof doc?.slug === 'string' ? doc.slug : null,
        featured: typeof doc?.featured === 'boolean' ? doc.featured : null,
        _status: typeof doc?._status === 'string' ? doc._status : null,
      },
      previousDoc: previousDoc
        ? {
            slug: typeof previousDoc?.slug === 'string' ? previousDoc.slug : null,
            featured: typeof previousDoc?.featured === 'boolean' ? previousDoc.featured : null,
            _status: typeof previousDoc?._status === 'string' ? previousDoc._status : null,
          }
        : null,
      operation,
    });

    await revalidatePaths(paths, {
      collection,
      slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
    });

    return doc;
  };
}

export function createRevalidateAfterDelete(
  collection: RevalidatableCollection,
): CollectionAfterDeleteHook {
  const resolve = resolvers[collection];

  return async ({ doc }) => {
    const paths = resolve({
      collection,
      doc: {
        slug: typeof doc?.slug === 'string' ? doc.slug : null,
        featured: typeof doc?.featured === 'boolean' ? doc.featured : null,
        _status: typeof doc?._status === 'string' ? doc._status : null,
      },
      operation: 'delete',
    });

    await revalidatePaths(paths, {
      collection,
      slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
    });
  };
}
