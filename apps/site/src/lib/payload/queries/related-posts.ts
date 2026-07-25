import 'server-only';

import type { Where } from 'payload';

import { getPayloadClient } from '@/lib/payload/client';
import { mapPayloadPostToListItem, type PostListInput } from '@/lib/payload/map-content';
import type { Post } from '@/lib/posts';

/** Fields needed to score related posts (design: PostDetail). */
export type PostDetail = {
  slug: string;
  category?: number | { slug?: string | null } | null;
  tags?: (number | { slug?: string | null })[] | null;
};

const DEFAULT_RELATED_LIMIT = 3;

const POST_LIST_SELECT = {
  title: true,
  slug: true,
  date: true,
  author: true,
  category: true,
  tags: true,
  excerpt: true,
  description: true,
  image: true,
  featured: true,
} as const;

function categorySlugOf(category: PostDetail['category']): string | null {
  if (category && typeof category === 'object' && category.slug) {
    return category.slug;
  }

  return null;
}

function tagSlugsOf(tags: PostDetail['tags']): string[] {
  if (!tags?.length) {
    return [];
  }

  return tags
    .map((tag) => (typeof tag === 'object' && tag !== null ? tag.slug : null))
    .filter((slug): slug is string => Boolean(slug));
}

function excludeSlugWhere(slugs: string[]): Where {
  if (slugs.length === 1) {
    return { slug: { not_equals: slugs[0] } };
  }

  return { slug: { not_in: slugs } };
}

function andWhere(...conditions: Where[]): Where {
  if (conditions.length === 1) {
    return conditions[0]!;
  }

  return { and: conditions };
}

async function findPublishedPosts(where: Where, limit: number): Promise<PostListInput[]> {
  if (limit <= 0) {
    return [];
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'posts',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 1,
    limit,
    sort: '-date',
    select: POST_LIST_SELECT,
    where,
  });

  return result.docs as PostListInput[];
}

function appendUnique(
  collected: PostListInput[],
  incoming: PostListInput[],
  excluded: Set<string>,
  limit: number,
): void {
  for (const doc of incoming) {
    if (collected.length >= limit) {
      break;
    }
    if (excluded.has(doc.slug)) {
      continue;
    }
    collected.push(doc);
    excluded.add(doc.slug);
  }
}

/**
 * Prefer same category, then shared tags, then most recent published posts.
 * Always excludes the current post. Returns up to `limit` list items (default 3).
 */
export async function getRelatedPosts(
  post: PostDetail,
  limit: number = DEFAULT_RELATED_LIMIT,
): Promise<Post[]> {
  const target = Math.max(0, Math.min(limit, DEFAULT_RELATED_LIMIT));
  if (target === 0) {
    return [];
  }

  const excluded = new Set<string>([post.slug]);
  const collected: PostListInput[] = [];

  const categorySlug = categorySlugOf(post.category);
  if (categorySlug) {
    const sameCategory = await findPublishedPosts(
      andWhere(excludeSlugWhere([...excluded]), {
        'category.slug': { equals: categorySlug },
      }),
      target - collected.length,
    );
    appendUnique(collected, sameCategory, excluded, target);
  }

  const tagSlugs = tagSlugsOf(post.tags);
  if (tagSlugs.length > 0 && collected.length < target) {
    const sameTags = await findPublishedPosts(
      andWhere(excludeSlugWhere([...excluded]), {
        'tags.slug': { in: tagSlugs },
      }),
      target - collected.length,
    );
    appendUnique(collected, sameTags, excluded, target);
  }

  if (collected.length < target) {
    const recent = await findPublishedPosts(
      excludeSlugWhere([...excluded]),
      target - collected.length,
    );
    appendUnique(collected, recent, excluded, target);
  }

  return collected.map((doc, index) => mapPayloadPostToListItem(doc, index));
}
