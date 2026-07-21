import type { Payload } from 'payload';

async function findIdBySlug(
  payload: Payload,
  collection: 'authors' | 'categories' | 'tags',
  slug: string,
): Promise<number> {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const doc = result.docs[0];
  if (!doc) {
    throw new Error(`No ${collection} document found for slug "${slug}"`);
  }

  return doc.id as number;
}

function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function ensureTagId(payload: Payload, slug: string): Promise<number> {
  const result = await payload.find({
    collection: 'tags',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const existing = result.docs[0];
  if (existing) {
    return existing.id as number;
  }

  const created = await payload.create({
    collection: 'tags',
    data: {
      name: slugToDisplayName(slug),
      slug,
    },
  });

  return created.id as number;
}

export async function resolveAuthorId(payload: Payload, slug: string): Promise<number> {
  return findIdBySlug(payload, 'authors', slug);
}

export async function resolveCategoryId(
  payload: Payload,
  slug: string | undefined,
): Promise<number | undefined> {
  if (!slug) return undefined;
  return findIdBySlug(payload, 'categories', slug);
}

export async function resolveTagIds(
  payload: Payload,
  slugs: string[] | undefined,
): Promise<number[] | undefined> {
  if (!slugs?.length) return undefined;

  const ids = await Promise.all(slugs.map((slug) => ensureTagId(payload, slug)));
  return ids;
}
