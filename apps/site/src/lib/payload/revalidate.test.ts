import { revalidatePath, revalidateTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPostRevalidationPaths,
  getRecipeRevalidationPaths,
  normalizeRevalidatePath,
  revalidatePaths,
  type RevalidationContext,
} from '@/lib/payload/revalidate';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

describe('normalizeRevalidatePath', () => {
  it('adds a trailing slash when missing', () => {
    expect(normalizeRevalidatePath('/blog')).toBe('/blog/');
  });

  it('leaves the root path unchanged', () => {
    expect(normalizeRevalidatePath('/')).toBe('/');
  });
});

describe('getPostRevalidationPaths', () => {
  it('resolves listing and detail paths with trailing slashes', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post' },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/blog/');
    expect(paths).toContain('/blog/my-post/');
    expect(paths.every((path) => path.endsWith('/'))).toBe(true);
  });

  it('always includes the home path for any post change', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', featured: true },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/');
  });

  it('includes the home path even for a draft-only autosave', () => {
    // Homepage always shows the latest posts — revalidate unconditionally so
    // the unstable_cache data cache is always fresh after any post mutation.
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', featured: false, _status: 'draft' },
      previousDoc: { slug: 'my-post', _status: 'draft' },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/');
  });

  it('includes previous and new slug paths when the slug changes', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'new-slug' },
      previousDoc: { slug: 'old-slug' },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/blog/old-slug/');
    expect(paths).toContain('/blog/new-slug/');
  });
});

describe('getRecipeRevalidationPaths', () => {
  it('resolves detail and index paths', () => {
    const ctx: RevalidationContext = {
      collection: 'recipes',
      doc: { slug: 'flatbread' },
      operation: 'update',
    };

    const paths = getRecipeRevalidationPaths(ctx);

    expect(paths).toContain('/recipes/flatbread/');
    expect(paths).toContain('/recipes/');
  });
});

describe('revalidatePaths', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.mocked(revalidatePath).mockReset();
    vi.mocked(revalidateTag).mockReset();
  });

  afterEach(() => {
    errorSpy.mockClear();
  });

  it('does not throw when revalidatePath fails and logs the path list', async () => {
    vi.mocked(revalidatePath).mockImplementation(() => {
      throw new Error('revalidate failed');
    });

    await expect(revalidatePaths(['/blog/'])).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'content_revalidate',
        paths: ['/blog/'],
      }),
    );
  });

  it('includes collection and slug in the error log when ctx is provided', async () => {
    vi.mocked(revalidatePath).mockImplementation(() => {
      throw new Error('revalidate failed');
    });

    await revalidatePaths(['/blog/my-post/'], { collection: 'posts', slug: 'my-post' });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'content_revalidate',
        collection: 'posts',
        slug: 'my-post',
        paths: ['/blog/my-post/'],
      }),
    );
  });

  it('calls revalidateTag for each provided tag', async () => {
    await revalidatePaths(['/blog/'], undefined, ['posts']);

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith('posts', 'max');
  });

  it('does nothing when paths and tags are both empty', async () => {
    await revalidatePaths([], undefined, []);

    expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
    expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled();
  });
});
