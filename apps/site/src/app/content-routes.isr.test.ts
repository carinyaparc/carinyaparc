import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const appDir = resolve(import.meta.dirname);

function readRouteSource(relativePath: string): string {
  return readFileSync(resolve(appDir, relativePath), 'utf8');
}

describe('content route ISR config', () => {
  it('exports a 24-hour revalidate interval on the home page', () => {
    const source = readRouteSource('(www)/page.tsx');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });

  it('exports a 24-hour revalidate interval on the blog listing page', () => {
    const source = readRouteSource('(blog)/blog/page.tsx');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });

  it('exports a 24-hour revalidate interval on the blog detail page', () => {
    const source = readRouteSource('(blog)/blog/[slug]/page.tsx');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });

  it('exports a 24-hour revalidate interval on the recipe detail page', () => {
    const source = readRouteSource('(recipes)/recipes/[slug]/page.tsx');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });
});

describe('blog section cached queries', () => {
  it('fetches latest posts via getCachedBlogPosts', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../components/sections/blog/LatestPosts.tsx'),
      'utf8',
    );

    expect(source).toContain("from '@/lib/payload/cache'");
    expect(source).toContain('getCachedBlogPosts');
    expect(source).not.toContain("from '@/lib/payload/queries/posts'");
    expect(source).not.toContain("from '@/src/lib/posts'");
  });
});
