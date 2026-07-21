import { describe, expect, it } from 'vitest';

import type { Post } from '@/lib/posts';
import { buildRssFeed } from '@/lib/rss/build-feed';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    slug: 'my-post',
    title: 'My Post',
    date: '2026-06-01',
    formattedDate: 'June 1, 2026',
    datetime: '2026-06-01',
    tags: [],
    category: null,
    categorySlug: null,
    excerpt: 'Excerpt text',
    description: 'Description text',
    author: 'Jonathan Daddia',
    authorImageUrl: '/images/placeholder.jpg',
    imageUrl: '/images/hero-home.jpg',
    featured: false,
    href: '/blog/my-post/',
    ...overrides,
  };
}

describe('buildRssFeed', () => {
  const baseOptions = {
    baseUrl: 'https://carinyaparc.com.au',
    title: 'Carinya Parc Blog',
    description: 'Life on Pasture',
  };

  it('builds a valid RSS 2.0 channel with item links from post hrefs', () => {
    const xml = buildRssFeed({ ...baseOptions, posts: [makePost()] });

    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<title>Carinya Parc Blog</title>');
    expect(xml).toContain('<link>https://carinyaparc.com.au/blog/</link>');
    expect(xml).toContain('<link>https://carinyaparc.com.au/blog/my-post/</link>');
    expect(xml).toContain(
      '<guid isPermaLink="true">https://carinyaparc.com.au/blog/my-post/</guid>',
    );
    expect(xml).toContain(
      '<atom:link href="https://carinyaparc.com.au/feed.xml" rel="self" type="application/rss+xml"/>',
    );
  });

  it('escapes XML entities in titles and descriptions', () => {
    const xml = buildRssFeed({
      ...baseOptions,
      posts: [makePost({ title: 'Soil & Water <update>', description: 'A "quoted" note' })],
    });

    expect(xml).toContain('<title>Soil &amp; Water &lt;update&gt;</title>');
    expect(xml).toContain('<description>A &quot;quoted&quot; note</description>');
    expect(xml).not.toContain('<update>');
  });

  it('renders an empty channel without items when there are no posts', () => {
    const xml = buildRssFeed({ ...baseOptions, posts: [] });

    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });
});
