import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/payload/revalidate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/payload/revalidate')>();
  return {
    ...actual,
    revalidatePaths: vi.fn().mockResolvedValue(undefined),
  };
});

import { revalidatePaths } from '@/lib/payload/revalidate';
import { createRevalidateAfterChange, createRevalidateAfterDelete } from './revalidate-content';

describe('createRevalidateAfterChange', () => {
  beforeEach(() => {
    vi.mocked(revalidatePaths).mockReset();
    vi.mocked(revalidatePaths).mockResolvedValue(undefined);
  });

  it('calls revalidatePaths with post paths for a post afterChange hook', async () => {
    const hook = createRevalidateAfterChange('posts');

    await hook({
      doc: { slug: 'my-post', featured: false, _status: 'published' },
      previousDoc: { slug: 'my-post', featured: false, _status: 'published' },
      operation: 'update',
      collection: { slug: 'posts' } as never,
      context: {} as never,
      data: {},
      req: {} as never,
    });

    expect(revalidatePaths).toHaveBeenCalledOnce();
    const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
    expect(paths).toContain('/blog/');
    expect(paths).toContain('/blog/my-post/');
  });

  it('includes home path when post is featured', async () => {
    const hook = createRevalidateAfterChange('posts');

    await hook({
      doc: { slug: 'featured-post', featured: true, _status: 'published' },
      previousDoc: null,
      operation: 'create',
      collection: { slug: 'posts' } as never,
      context: {} as never,
      data: {},
      req: {} as never,
    });

    expect(revalidatePaths).toHaveBeenCalledOnce();
    const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
    expect(paths).toContain('/');
  });

  it('calls revalidatePaths with recipe paths for a recipe afterChange hook', async () => {
    const hook = createRevalidateAfterChange('recipes');

    await hook({
      doc: { slug: 'flatbread', _status: 'published' },
      previousDoc: null,
      operation: 'create',
      collection: { slug: 'recipes' } as never,
      context: {} as never,
      data: {},
      req: {} as never,
    });

    expect(revalidatePaths).toHaveBeenCalledOnce();
    const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
    expect(paths).toContain('/recipes/flatbread/');
    expect(paths).toContain('/recipes/');
  });

  it('returns the doc from the hook', async () => {
    const hook = createRevalidateAfterChange('posts');
    const doc = { slug: 'my-post', _status: 'published' };

    const result = await hook({
      doc,
      previousDoc: null,
      operation: 'update',
      collection: { slug: 'posts' } as never,
      context: {} as never,
      data: {},
      req: {} as never,
    });

    expect(result).toBe(doc);
  });
});

describe('createRevalidateAfterDelete', () => {
  beforeEach(() => {
    vi.mocked(revalidatePaths).mockReset();
    vi.mocked(revalidatePaths).mockResolvedValue(undefined);
  });

  it('calls revalidatePaths with recipe paths for a recipe afterDelete hook', async () => {
    const hook = createRevalidateAfterDelete('recipes');

    await hook({
      doc: { slug: 'flatbread', _status: 'published' },
      collection: { slug: 'recipes' } as never,
      context: {} as never,
      req: {} as never,
      id: '1',
    });

    expect(revalidatePaths).toHaveBeenCalledOnce();
    const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
    expect(paths).toContain('/recipes/flatbread/');
    expect(paths).toContain('/recipes/');
  });

  it('calls revalidatePaths with post paths for a post afterDelete hook', async () => {
    const hook = createRevalidateAfterDelete('posts');

    await hook({
      doc: { slug: 'my-post', featured: false, _status: 'published' },
      collection: { slug: 'posts' } as never,
      context: {} as never,
      req: {} as never,
      id: '1',
    });

    expect(revalidatePaths).toHaveBeenCalledOnce();
    const paths = vi.mocked(revalidatePaths).mock.lastCall![0];
    expect(paths).toContain('/blog/my-post/');
    expect(paths).toContain('/blog/');
  });
});
