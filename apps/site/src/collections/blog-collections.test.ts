import type { CollectionConfig, Field } from 'payload';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/payload/revalidate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/payload/revalidate')>();
  return {
    ...actual,
    revalidatePaths: vi.fn().mockResolvedValue(undefined),
    revalidatePayloadTags: vi.fn().mockResolvedValue(undefined),
  };
});

import { Authors } from '@/collections/Authors';
import { Categories } from '@/collections/Categories';
import { Posts } from '@/collections/Posts';
import { Tags } from '@/collections/Tags';
import { revalidatePaths } from '@/lib/payload/revalidate';

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

  describe('revalidation hooks', () => {
    beforeEach(() => {
      vi.mocked(revalidatePaths).mockReset();
      vi.mocked(revalidatePaths).mockResolvedValue(undefined);
    });

    it('registers afterChange and afterDelete revalidation hooks', () => {
      expect(Posts.hooks?.afterChange?.length).toBeGreaterThanOrEqual(1);
      expect(Posts.hooks?.afterDelete?.length).toBeGreaterThanOrEqual(1);

      for (const hook of Posts.hooks?.afterChange ?? []) {
        expect(typeof hook).toBe('function');
      }

      for (const hook of Posts.hooks?.afterDelete ?? []) {
        expect(typeof hook).toBe('function');
      }
    });

    it('revalidates blog paths when a published post is updated', async () => {
      const afterChange = Posts.hooks?.afterChange?.[0];
      expect(typeof afterChange).toBe('function');

      if (typeof afterChange !== 'function') {
        return;
      }

      await afterChange({
        doc: {
          slug: 'my-post',
          title: 'Updated title',
          featured: false,
          _status: 'published',
        },
        previousDoc: {
          slug: 'my-post',
          title: 'Original title',
          featured: false,
          _status: 'published',
        },
        operation: 'update',
        collection: { slug: 'posts' } as never,
        context: {} as never,
        data: {},
        req: { user: { id: 1 } } as never,
      });

      expect(revalidatePaths).toHaveBeenCalledOnce();
      const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
      expect(paths).toContain('/blog/');
      expect(paths).toContain('/blog/my-post/');
    });
  });
});
