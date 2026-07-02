import { revalidatePath, revalidateTag } from 'next/cache';

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
  const paths: string[] = ['/blog/'];
  const slug = ctx.doc.slug;

  if (slug) {
    paths.push(`/blog/${slug}/`);
  }

  if (ctx.previousDoc?.slug && ctx.previousDoc.slug !== slug) {
    paths.push(`/blog/${ctx.previousDoc.slug}/`);
  }

  paths.push('/');

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

export async function revalidatePaths(
  paths: string[],
  ctx?: RevalidateLogContext,
  tags?: string[],
): Promise<void> {
  const normalizedPaths = uniqueNormalizedPaths(paths);
  const normalizedTags = tags ?? [];

  if (normalizedPaths.length === 0 && normalizedTags.length === 0) {
    return;
  }

  const start = Date.now();

  try {
    for (const path of normalizedPaths) {
      revalidatePath(path, 'page');
    }

    for (const tag of normalizedTags) {
      revalidateTag(tag, 'max');
    }

    if (process.env.NODE_ENV === 'production') {
      console.info({
        event: 'content_revalidate',
        ...ctx,
        paths: normalizedPaths,
        tags: normalizedTags,
        durationMs: Date.now() - start,
      });
    }
  } catch (error) {
    console.error({
      event: 'content_revalidate',
      ...ctx,
      paths: normalizedPaths,
      tags: normalizedTags,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
