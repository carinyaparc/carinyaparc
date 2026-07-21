export { metadata } from './metadata';

import { Suspense } from 'react';

import { PageIntro } from '@/components/sections/page';
import {
  FeaturedPosts,
  FeaturedPostsSkeleton,
  JournalPostGrid,
  JournalSubscribeBand,
} from '@/src/components/sections/blog';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { getCachedBlogCategories, getCachedBlogPosts } from '@/lib/payload/cache';

export const revalidate = 86_400;

const LIST_LIMIT = 50;

export default async function BlogPage() {
  const [categories, posts] = await Promise.all([
    getCachedBlogCategories(),
    getCachedBlogPosts({ limit: LIST_LIMIT }),
  ]);

  const gridPosts = posts.filter((post) => !post.featured);

  return (
    <>
      <SchemaMarkup type="page" />

      <div className="min-h-screen bg-paperbark">
        <PageIntro
          eyebrow="Life on pasture · The Branch, NSW"
          title="Field notes from a farm coming back to life"
          description="Follow the regeneration of 42 hectares in real time — the plantings, the setbacks, the soil results and the seasons. Read along, then come get your hands dirty."
          titleAs="h1"
          className="pb-8 pt-12 sm:pt-16"
        />

        <Suspense fallback={<FeaturedPostsSkeleton />}>
          <FeaturedPosts limit={1} />
        </Suspense>

        <section className="py-9 pb-20">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <Suspense fallback={null}>
              <JournalPostGrid posts={gridPosts} categories={categories} />
            </Suspense>
          </div>
        </section>

        <JournalSubscribeBand />
      </div>
    </>
  );
}
