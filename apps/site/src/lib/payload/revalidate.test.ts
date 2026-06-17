import { revalidatePath } from 'next/cache';
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

  it('includes the home path when the post is featured', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', featured: true },
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
});
