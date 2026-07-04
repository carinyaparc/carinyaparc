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

  const ids = await Promise.all(slugs.map((slug) => findIdBySlug(payload, 'tags', slug)));
  return ids;
}
