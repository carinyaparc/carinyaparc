import type { Payload } from 'payload';

export const DEXTER_BEEF_SLUG = 'slow-roasted-dexter-beef-with-root-vegetables';

const recipeSeedTags = ['dinner', 'beef', 'roast'] as const;

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
    data: { name: 'Jonno', slug: 'jonno' },
    overrideAccess: true,
  });

  return author.id;
}

async function findOrCreateTags(payload: Payload, names: readonly string[]) {
  const tagIds: number[] = [];

  for (const name of names) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: name } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      tagIds.push(existing.docs[0].id);
      continue;
    }

    const tag = await payload.create({
      collection: 'tags',
      data: { name, slug: name },
      overrideAccess: true,
    });

    tagIds.push(tag.id);
  }

  return tagIds;
}

export async function seedRecipes(payload: Payload) {
  const existing = await payload.find({
    collection: 'recipes',
    where: { slug: { equals: DEXTER_BEEF_SLUG } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    return { created: false, slug: DEXTER_BEEF_SLUG };
  }

  const authorId = await findOrCreateAuthor(payload);
  const tagIds = await findOrCreateTags(payload, recipeSeedTags);

  await payload.create({
    collection: 'recipes',
    data: {
      title: 'Slow-Roasted Dexter Beef with Root Vegetables',
      slug: DEXTER_BEEF_SLUG,
      date: '2025-06-22T00:00:00.000Z',
      author: authorId,
      difficulty: 'medium',
      servings: 4,
      prepTime: 'PT20M',
      cookTime: 'PT180M',
      totalTime: 'PT200M',
      excerpt:
        'Classic comfort food showcasing future Dexter beef—dry-aged, grass-fed and paired with seasonal root veg.',
      tags: tagIds,
      ingredients: [
        { item: '1.5 kg Dexter beef roast' },
        { item: '500 g mixed root vegetables (carrots, parsnips, potatoes)' },
        { item: '4 sprigs rosemary' },
        { item: '4 garlic cloves, smashed' },
        { item: '2 tbsp olive oil' },
        { item: 'Salt and pepper' },
      ],
      instructions: [
        {
          step:
            'Preheat oven to 140 °C (fan-forced). Season beef with olive oil, salt, pepper, rosemary and garlic.',
        },
        {
          step:
            'Place beef on a rack over a roasting tray. Scatter root vegetables below. Roast for 3 hours until internal temperature reaches 60 °C for medium-rare.',
        },
        {
          step:
            'Transfer beef to a plate, cover loosely with foil, and rest for 15 minutes. Slice and serve with roasted root veg and pan juices.',
        },
      ],
      _status: 'published',
    },
    overrideAccess: true,
  });

  return { created: true, slug: DEXTER_BEEF_SLUG };
}
