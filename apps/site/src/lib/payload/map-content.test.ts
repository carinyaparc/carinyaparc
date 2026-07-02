import { describe, expect, it } from 'vitest';

import type { Author, Recipe as PayloadRecipe, Tag } from '@/payload-types';
import {
  formatContentDate,
  mapPayloadPostToListItem,
  mapPayloadRecipeToDetail,
  resolveAuthorName,
  resolveTagNames,
  type PostListInput,
} from '@/lib/payload/map-content';

const author: Author = {
  id: 1,
  name: 'Jonathan Daddia',
  slug: 'jonathan-daddia',
  imageUrl: '/images/authors/jonathan.jpg',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const tag: Tag = {
  id: 1,
  name: 'Soil Health',
  slug: 'soil-health',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('map-content', () => {
  it('formats content dates for display', () => {
    expect(formatContentDate('2026-03-15')).toMatch(/March 15, 2026/);
  });

  it('resolves populated author and tag relationships', () => {
    expect(resolveAuthorName(author)).toBe('Jonathan Daddia');
    expect(resolveTagNames([tag])).toEqual(['Soil Health']);
  });

  it('maps payload posts to list cards with blog URLs', () => {
    const doc: PostListInput = {
      id: 7,
      title: 'Restoring 42 Hectares',
      slug: 'restoring-42-ha-land',
      date: '2026-03-15',
      author,
      featured: true,
      excerpt: 'A regeneration journey.',
      description: 'SEO description',
      image: '/images/farm-track-gate.jpg',
      tags: [tag],
      updatedAt: '2026-03-16T00:00:00.000Z',
      createdAt: '2026-03-15T00:00:00.000Z',
      _status: 'published',
    };

    const mapped = mapPayloadPostToListItem(doc, 0);

    expect(mapped).toMatchObject({
      id: 7,
      slug: 'restoring-42-ha-land',
      title: 'Restoring 42 Hectares',
      author: 'Jonathan Daddia',
      authorImageUrl: '/images/authors/jonathan.jpg',
      imageUrl: '/images/farm-track-gate.jpg',
      featured: true,
      href: '/blog/restoring-42-ha-land',
      tags: ['Soil Health'],
      description: 'SEO description',
    });
  });

  it('maps payload recipes to detail view data', () => {
    const doc: PayloadRecipe = {
      id: 3,
      title: 'Rustic Flatbread',
      slug: 'rustic-farm-style-flatbread',
      date: '2026-02-01',
      author,
      excerpt: 'Simple farm flatbread.',
      description: 'Flatbread SEO',
      servings: 4,
      prepTime: 'PT20M',
      cookTime: 'PT15M',
      totalTime: 'PT35M',
      ingredients: [{ item: '500 g flour' }],
      instructions: [{ step: 'Mix the dough.' }],
      tags: [tag],
      updatedAt: '2026-02-02T00:00:00.000Z',
      createdAt: '2026-02-01T00:00:00.000Z',
      _status: 'published',
    };

    expect(mapPayloadRecipeToDetail(doc)).toEqual({
      slug: 'rustic-farm-style-flatbread',
      title: 'Rustic Flatbread',
      date: '2026-02-01',
      author: 'Jonathan Daddia',
      description: 'Flatbread SEO',
      excerpt: 'Simple farm flatbread.',
      servings: 4,
      prepTime: 'PT20M',
      cookTime: 'PT15M',
      totalTime: 'PT35M',
      ingredients: ['500 g flour'],
      instructions: ['Mix the dough.'],
      tags: ['Soil Health'],
      href: '/recipes/rustic-farm-style-flatbread',
    });
  });
});
