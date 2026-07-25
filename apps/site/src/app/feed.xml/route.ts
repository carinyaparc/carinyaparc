import { getCachedBlogPosts } from '@/lib/payload/cache';
import { BASE_URL, BLOG_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { buildRssFeed } from '@/features/blog/rss/build-feed';

// ISR fallback; publish-time freshness comes from the payload:posts cache tag
// plus the /feed.xml path revalidated by the Payload afterChange hooks.
export const revalidate = 86_400;

export async function GET() {
  const posts = await getCachedBlogPosts({ limit: 20 });

  const xml = buildRssFeed({
    posts,
    baseUrl: BASE_URL,
    title: BLOG_NAME,
    description: SITE_DESCRIPTION,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
