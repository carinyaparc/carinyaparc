import { revalidatePath, revalidateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { createRevalidateAfterChange, createRevalidateAfterDelete } from './revalidate-content';

describe('createRevalidateAfterChange', () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockReset();
    vi.mocked(revalidateTag).mockReset();
  });

  it('calls revalidateTag with post cache tags for a post afterChange hook', async () => {
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

    expect(revalidateTag).toHaveBeenCalledWith('payload:posts', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('payload:post:my-post', 'max');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/my-post/', 'page');
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

    expect(revalidatePath).toHaveBeenCalledWith('/', 'page');
  });

  it('calls revalidateTag with recipe cache tags for a recipe afterChange hook', async () => {
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

    expect(revalidateTag).toHaveBeenCalledWith('payload:recipes', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('payload:recipe:flatbread', 'max');
    expect(revalidatePath).toHaveBeenCalledWith('/recipes/flatbread/', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/recipes/', 'page');
  });

  it('still revalidates paths when revalidateTag throws', async () => {
    vi.mocked(revalidateTag).mockImplementation(() => {
      throw new Error('tag revalidate failed');
    });

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

    expect(revalidatePath).toHaveBeenCalledWith('/blog/', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/my-post/', 'page');
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
    vi.mocked(revalidatePath).mockReset();
    vi.mocked(revalidateTag).mockReset();
  });

  it('calls revalidateTag with recipe cache tags for a recipe afterDelete hook', async () => {
    const hook = createRevalidateAfterDelete('recipes');

    await hook({
      doc: { slug: 'flatbread', _status: 'published' },
      collection: { slug: 'recipes' } as never,
      context: {} as never,
      req: {} as never,
      id: '1',
    });

    expect(revalidateTag).toHaveBeenCalledWith('payload:recipes', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('payload:recipe:flatbread', 'max');
    expect(revalidatePath).toHaveBeenCalledWith('/recipes/flatbread/', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/recipes/', 'page');
  });

  it('calls revalidateTag with post cache tags for a post afterDelete hook', async () => {
    const hook = createRevalidateAfterDelete('posts');

    await hook({
      doc: { slug: 'my-post', featured: false, _status: 'published' },
      collection: { slug: 'posts' } as never,
      context: {} as never,
      req: {} as never,
      id: '1',
    });

    expect(revalidateTag).toHaveBeenCalledWith('payload:posts', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('payload:post:my-post', 'max');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/my-post/', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/', 'page');
  });
});
