import type { CollectionConfig, Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { Authors } from '@/collections/Authors';
import { Categories } from '@/collections/Categories';
import { Posts } from '@/collections/Posts';
import { Tags } from '@/collections/Tags';

function fieldNames(collection: CollectionConfig): string[] {
  return (collection.fields ?? [])
    .map((field) => ('name' in field ? field.name : undefined))
    .filter((name): name is string => typeof name === 'string');
}

function fieldByName(collection: CollectionConfig, name: string): Field | undefined {
  return collection.fields?.find((field) => 'name' in field && field.name === name);
}

describe('blog collections', () => {
  it('defines authors with name and slug', () => {
    expect(Authors.slug).toBe('authors');
    expect(fieldNames(Authors)).toEqual(
      expect.arrayContaining(['name', 'slug', 'imageUrl', 'bio']),
    );
  });

  it('defines categories with name and slug', () => {
    expect(Categories.slug).toBe('categories');
    expect(fieldNames(Categories)).toEqual(expect.arrayContaining(['name', 'slug', 'description']));
  });

  it('defines tags with name and slug', () => {
    expect(Tags.slug).toBe('tags');
    expect(fieldNames(Tags)).toEqual(expect.arrayContaining(['name', 'slug']));
  });

  it('defines posts aligned with MDX frontmatter', () => {
    expect(Posts.slug).toBe('posts');
    expect(fieldNames(Posts)).toEqual(
      expect.arrayContaining([
        'title',
        'slug',
        'date',
        'author',
        'category',
        'featured',
        'excerpt',
        'description',
        'image',
        'tags',
        'body',
      ]),
    );
  });

  it('requires core post fields and enables drafts', () => {
    for (const name of ['title', 'date', 'author', 'excerpt', 'body'] as const) {
      const field = fieldByName(Posts, name);

      expect(field).toBeDefined();
      expect(field && 'required' in field && field.required).toBe(true);
    }

    expect(Posts.versions).toBeTruthy();
    expect(typeof Posts.versions === 'object' && Posts.versions?.drafts).toBeTruthy();
  });

  it('configures admin list columns and preview URL', () => {
    expect(Posts.admin?.defaultColumns).toEqual(
      expect.arrayContaining(['title', 'author', 'date', 'featured', '_status']),
    );

    const preview = Posts.admin?.preview;
    expect(typeof preview).toBe('function');

    if (typeof preview === 'function') {
      expect(preview({ slug: 'restoring-42-ha-land' }, {} as never)).toBe(
        'http://localhost:3000/blog/restoring-42-ha-land',
      );
    }
  });

  it('restricts anonymous reads to published posts', () => {
    const read = Posts.access?.read;
    expect(typeof read).toBe('function');

    if (typeof read === 'function') {
      expect(read({ req: { user: { id: 1 } } } as never)).toBe(true);
      expect(read({ req: { user: null } } as never)).toEqual({
        _status: { equals: 'published' },
      });
    }
  });
});
