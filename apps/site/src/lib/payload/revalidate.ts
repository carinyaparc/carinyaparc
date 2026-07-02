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
  // Always revalidate the blog index and homepage — the "Latest Posts" section
  // on the homepage shows the 3 most recent posts regardless of featured status.
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

export async function revalidatePaths(
  paths: string[],
  ctx?: RevalidateLogContext,
  tags?: string[],
): Promise<void> {
  const normalizedPaths = uniqueNormalizedPaths(paths);

  if (normalizedPaths.length === 0 && !tags?.length) {
    return;
  }

  const start = Date.now();

  try {
    for (const path of normalizedPaths) {
      revalidatePath(path, 'page');
    }

    for (const tag of tags ?? []) {
      // 'max' tells Next.js 16 to keep re-fetched entries in the cache as long
      // as possible; the important effect is invalidating existing entries.
      revalidateTag(tag, 'max');
    }

    if (process.env.NODE_ENV === 'production') {
      console.info({
        event: 'content_revalidate',
        ...ctx,
        paths: normalizedPaths,
        tags: tags ?? [],
        durationMs: Date.now() - start,
      });
    }
  } catch (error) {
    console.error({
      event: 'content_revalidate',
      ...ctx,
      paths: normalizedPaths,
      tags: tags ?? [],
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
