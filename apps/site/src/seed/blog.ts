import type { Payload } from 'payload';

import { createLexicalParagraph } from '@/lib/payload/lexical';

export const RESTORING_42_HA_SLUG = 'restoring-42-ha-land';

export const blogSeedTags = [
  'regeneration',
  'biodiversity',
  'agroforestry',
  'restoration',
  'ecosystem',
] as const;

async function findOrCreateAuthor(payload: Payload) {
  const existing = await payload.find({
    collection: 'authors',
    where: { slug: { equals: 'jonno' } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    return existing.docs[0].id;
  }

  const author = await payload.create({
    collection: 'authors',
    data: {
      name: 'Jonno',
      slug: 'jonno',
    },
    overrideAccess: true,
  });

  return author.id;
}

async function findOrCreateTags(payload: Payload) {
  const tagIds: number[] = [];

  for (const name of blogSeedTags) {
    const slug = name;
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

export async function seedBlog(payload: Payload) {
  const existingPost = await payload.find({
    collection: 'posts',
    where: { slug: { equals: RESTORING_42_HA_SLUG } },
    limit: 1,
    overrideAccess: true,
  });

  if (existingPost.docs[0]) {
    return { created: false, slug: RESTORING_42_HA_SLUG };
  }

  const authorId = await findOrCreateAuthor(payload);
  const tagIds = await findOrCreateTags(payload);

  await payload.create({
    collection: 'posts',
    data: {
      title: "How We're Restoring 42 Hectares of Land: A Journey Back to Life",
      slug: RESTORING_42_HA_SLUG,
      date: '2025-02-20T00:00:00.000Z',
      author: authorId,
      featured: true,
      excerpt:
        'Follow our systematic approach to transforming degraded pasture into a thriving ecosystem through strategic habitat regeneration, agroforestry trials, and riparian restoration.',
      image: '/images/farm-track-gate.jpg',
      tags: tagIds,
      body: createLexicalParagraph(
        'When we first stepped onto Carinya Parc in early 2024, we saw a landscape full of promise—but also one deeply wounded by decades of grazing and neglect.',
      ),
      _status: 'published',
    },
    overrideAccess: true,
  });

  return { created: true, slug: RESTORING_42_HA_SLUG };
}
