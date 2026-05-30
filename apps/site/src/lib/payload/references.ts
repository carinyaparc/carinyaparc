import type { Payload } from 'payload';

import { slugify } from '@/lib/payload/slugify';

export async function findOrCreateAuthor(payload: Payload, name: string): Promise<number> {
  const slug = slugify(name);
  const existing = await payload.find({
    collection: 'authors',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    return existing.docs[0].id;
  }

  const author = await payload.create({
    collection: 'authors',
    data: { name, slug },
    overrideAccess: true,
  });

  return author.id;
}

export async function findOrCreateTags(payload: Payload, names: readonly string[]): Promise<number[]> {
  const tagIds: number[] = [];

  for (const name of names) {
    const slug = slugify(name);
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      tagIds.push(existing.docs[0].id);
      continue;
    }

    const tag = await payload.create({
      collection: 'tags',
      data: { name, slug },
      overrideAccess: true,
    });

    tagIds.push(tag.id);
  }

  return tagIds;
}

function toPayloadDate(value: string | undefined, fallbackFilename?: string): string {
  if (value) {
    return value.includes('T') ? value : `${value}T00:00:00.000Z`;
  }

  if (fallbackFilename) {
    const match = fallbackFilename.match(/^(\d{4})(\d{2})(\d{2})-/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`;
    }
  }

  return new Date().toISOString();
}

export { toPayloadDate };
