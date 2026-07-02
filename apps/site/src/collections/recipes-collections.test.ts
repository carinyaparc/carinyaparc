import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/payload/revalidate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/payload/revalidate')>();
  return {
    ...actual,
    revalidatePaths: vi.fn().mockResolvedValue(undefined),
    revalidatePayloadTags: vi.fn().mockResolvedValue(undefined),
  };
});

import { Recipes } from '@/collections/Recipes';
import { revalidatePaths } from '@/lib/payload/revalidate';

describe('Recipes collection', () => {
  it('has slug "recipes" and registers required fields', () => {
    expect(Recipes.slug).toBe('recipes');

    const fieldNames = (Recipes.fields ?? [])
      .map((field) => ('name' in field ? field.name : undefined))
      .filter((name): name is string => typeof name === 'string');

    expect(fieldNames).toEqual(
      expect.arrayContaining([
        'title',
        'slug',
        'date',
        'author',
        'excerpt',
        'ingredients',
        'instructions',
      ]),
    );
  });

  describe('draft access regression', () => {
    const read = Recipes.access?.read;

    it('restricts anonymous reads to published recipes only', () => {
      expect(typeof read).toBe('function');

      if (typeof read === 'function') {
        expect(read({ req: { user: null } } as never)).toEqual({
          _status: { equals: 'published' },
        });
      }
    });

    it('allows authenticated editors to read draft recipes', () => {
      expect(typeof read).toBe('function');

      if (typeof read === 'function') {
        expect(read({ req: { user: { id: 1 } } } as never)).toBe(true);
      }
    });
  });

  describe('revalidation hooks', () => {
    beforeEach(() => {
      vi.mocked(revalidatePaths).mockReset();
      vi.mocked(revalidatePaths).mockResolvedValue(undefined);
    });

    it('registers afterChange and afterDelete revalidation hooks', () => {
      expect(Recipes.hooks?.afterChange?.length).toBeGreaterThanOrEqual(1);
      expect(Recipes.hooks?.afterDelete?.length).toBeGreaterThanOrEqual(1);

      for (const hook of Recipes.hooks?.afterChange ?? []) {
        expect(typeof hook).toBe('function');
      }

      for (const hook of Recipes.hooks?.afterDelete ?? []) {
        expect(typeof hook).toBe('function');
      }
    });

    it('revalidates recipe paths when a recipe is updated', async () => {
      const afterChange = Recipes.hooks?.afterChange?.[0];
      expect(typeof afterChange).toBe('function');

      if (typeof afterChange !== 'function') {
        return;
      }

      await afterChange({
        doc: {
          slug: 'flatbread',
          title: 'Updated title',
          _status: 'published',
        },
        previousDoc: {
          slug: 'flatbread',
          title: 'Original title',
          _status: 'published',
        },
        operation: 'update',
        collection: { slug: 'recipes' } as never,
        context: {} as never,
        data: {},
        req: { user: { id: 1 } } as never,
      });

      expect(revalidatePaths).toHaveBeenCalledOnce();
      const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
      expect(paths).toContain('/recipes/flatbread/');
      expect(paths).toContain('/recipes/');
    });
  });
});
