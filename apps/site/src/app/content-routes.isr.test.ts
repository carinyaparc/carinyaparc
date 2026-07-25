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

  it('exports a 24-hour revalidate interval on the recipes listing page', () => {
    const source = readRouteSource('(recipes)/recipes/page.tsx');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });

  it('exports a 24-hour revalidate interval on paginated blog pages', () => {
    const source = readRouteSource('(blog)/blog/page/[page]/page.tsx');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });

  it('exports a 24-hour revalidate interval on the RSS feed route', () => {
    const source = readRouteSource('feed.xml/route.ts');
    expect(source).toMatch(/export const revalidate = 86[_,]?400/);
  });
});

describe('blog section cached queries', () => {
  it('fetches latest posts via getCachedBlogPosts', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../features/blog/components/LatestPosts.tsx'),
      'utf8',
    );

    expect(source).toContain("from '@/lib/payload/cache'");
    expect(source).toContain('getCachedBlogPosts');
    expect(source).not.toContain("from '@/features/blog/queries/posts'");
    expect(source).not.toMatch(/import\s*\{[^}]*getBlogPosts/);
  });
});
