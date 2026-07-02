import { revalidatePath, revalidateTag } from 'next/cache';

import { PAYLOAD_CACHE_TAGS } from '@/lib/payload/cache-tags';

export type RevalidatableCollection = 'posts' | 'recipes';

export type RevalidationContext = {
  collection: RevalidatableCollection;
  doc: { slug?: string | null; featured?: boolean | null; _status?: string | null };
  previousDoc?: { slug?: string | null; featured?: boolean | null; _status?: string | null } | null;
  operation: 'create' | 'update' | 'delete';
};

/** Normalise to trailing-slash paths for next.config trailingSlash: true */
export function normalizeRevalidatePath(path: string): string {
  let normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized !== '/' && !normalized.endsWith('/')) {
    normalized = `${normalized}/`;
  }

  return normalized;
}

function uniqueNormalizedPaths(paths: string[]): string[] {
  return [...new Set(paths.map(normalizeRevalidatePath))];
}

export function getPostRevalidationPaths(ctx: RevalidationContext): string[] {
  // Always revalidate the blog index and homepage — the "Latest Posts" section
  // on the homepage shows the most recent posts regardless of featured status.
  const paths: string[] = ['/blog/', '/'];
  const slug = ctx.doc.slug;

  if (slug) {
    paths.push(`/blog/${slug}/`);
  }

  if (ctx.previousDoc?.slug && ctx.previousDoc.slug !== slug) {
    paths.push(`/blog/${ctx.previousDoc.slug}/`);
  }

  return uniqueNormalizedPaths(paths);
}

export function getRecipeRevalidationPaths(ctx: RevalidationContext): string[] {
  const paths: string[] = ['/recipes/'];
  const slug = ctx.doc.slug;

  if (slug) {
    paths.push(`/recipes/${slug}/`);
  }

  if (ctx.previousDoc?.slug && ctx.previousDoc.slug !== slug) {
    paths.push(`/recipes/${ctx.previousDoc.slug}/`);
  }

  return uniqueNormalizedPaths(paths);
}

type RevalidateLogContext = {
  collection?: string;
  slug?: string;
};

function uniqueTags(tags: string[]): string[] {
  return [...new Set(tags)];
}

export function getPayloadRevalidationTags(ctx: RevalidationContext): string[] {
  const tags: string[] = [];

  if (ctx.collection === 'posts') {
    tags.push(PAYLOAD_CACHE_TAGS.posts);

    if (ctx.doc.slug) {
      tags.push(PAYLOAD_CACHE_TAGS.post(ctx.doc.slug));
    }

    if (ctx.previousDoc?.slug && ctx.previousDoc.slug !== ctx.doc.slug) {
      tags.push(PAYLOAD_CACHE_TAGS.post(ctx.previousDoc.slug));
    }
  }

  if (ctx.collection === 'recipes') {
    tags.push(PAYLOAD_CACHE_TAGS.recipes);

    if (ctx.doc.slug) {
      tags.push(PAYLOAD_CACHE_TAGS.recipe(ctx.doc.slug));
    }

    if (ctx.previousDoc?.slug && ctx.previousDoc.slug !== ctx.doc.slug) {
      tags.push(PAYLOAD_CACHE_TAGS.recipe(ctx.previousDoc.slug));
    }
  }

  return uniqueTags(tags);
}

export async function revalidatePayloadTags(
  tags: string[],
  ctx?: RevalidateLogContext,
): Promise<void> {
  const normalizedTags = uniqueTags(tags);

  if (normalizedTags.length === 0) {
    return;
  }

  const start = Date.now();

  try {
    for (const tag of normalizedTags) {
      revalidateTag(tag, 'max');
    }

    if (process.env.NODE_ENV === 'production') {
      console.info({
        event: 'content_revalidate',
        ...ctx,
        tags: normalizedTags,
        durationMs: Date.now() - start,
      });
    }
  } catch (error) {
    console.error({
      event: 'content_revalidate',
      ...ctx,
      tags: normalizedTags,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function revalidatePaths(paths: string[], ctx?: RevalidateLogContext): Promise<void> {
  const normalizedPaths = uniqueNormalizedPaths(paths);

  if (normalizedPaths.length === 0) {
    return;
  }

  const start = Date.now();

  try {
    for (const path of normalizedPaths) {
      revalidatePath(path, 'page');
    }

    if (process.env.NODE_ENV === 'production') {
      console.info({
        event: 'content_revalidate',
        ...ctx,
        paths: normalizedPaths,
        durationMs: Date.now() - start,
      });
    }
  } catch (error) {
    console.error({
      event: 'content_revalidate',
      ...ctx,
      paths: normalizedPaths,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
