import { revalidatePath, revalidateTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPayloadRevalidationTags,
  getPostRevalidationPaths,
  getRecipeRevalidationPaths,
  normalizeRevalidatePath,
  revalidatePaths,
  revalidatePayloadTags,
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

  it('includes the home path when the post is featured', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', featured: true },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/');
  });

  it('includes the home path when the post is published', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', featured: false, _status: 'published' },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/');
  });

  it('includes the home path when a published post is unpublished', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', _status: 'draft' },
      previousDoc: { slug: 'my-post', _status: 'published' },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).toContain('/');
  });

  it('does not include the home path for a draft-only autosave', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post', featured: false, _status: 'draft' },
      previousDoc: { slug: 'my-post', _status: 'draft' },
      operation: 'update',
    };

    const paths = getPostRevalidationPaths(ctx);

    expect(paths).not.toContain('/');
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

describe('getPayloadRevalidationTags', () => {
  it('resolves collection and slug tags for posts', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'my-post' },
      operation: 'update',
    };

    const tags = getPayloadRevalidationTags(ctx);

    expect(tags).toContain('payload:posts');
    expect(tags).toContain('payload:post:my-post');
  });

  it('includes previous slug tag when the post slug changes', () => {
    const ctx: RevalidationContext = {
      collection: 'posts',
      doc: { slug: 'new-slug' },
      previousDoc: { slug: 'old-slug' },
      operation: 'update',
    };

    const tags = getPayloadRevalidationTags(ctx);

    expect(tags).toContain('payload:post:old-slug');
    expect(tags).toContain('payload:post:new-slug');
  });

  it('resolves collection and slug tags for recipes', () => {
    const ctx: RevalidationContext = {
      collection: 'recipes',
      doc: { slug: 'flatbread' },
      operation: 'delete',
    };

    const tags = getPayloadRevalidationTags(ctx);

    expect(tags).toContain('payload:recipes');
    expect(tags).toContain('payload:recipe:flatbread');
  });
});

describe('revalidatePayloadTags', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.mocked(revalidateTag).mockReset();
  });

  afterEach(() => {
    errorSpy.mockClear();
  });

  it('does not throw when revalidateTag fails and logs the tag list', async () => {
    vi.mocked(revalidateTag).mockImplementation(() => {
      throw new Error('revalidate failed');
    });

    await expect(revalidatePayloadTags(['payload:posts'])).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'content_revalidate',
        tags: ['payload:posts'],
      }),
    );
  });

  it('includes collection and slug in the error log when ctx is provided', async () => {
    vi.mocked(revalidateTag).mockImplementation(() => {
      throw new Error('revalidate failed');
    });

    await revalidatePayloadTags(['payload:post:my-post'], {
      collection: 'posts',
      slug: 'my-post',
    });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'content_revalidate',
        collection: 'posts',
        slug: 'my-post',
        tags: ['payload:post:my-post'],
      }),
    );
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
});
