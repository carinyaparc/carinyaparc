export { metadata } from './metadata';

import { Suspense } from 'react';

import { PageIntro } from '@/components/sections/page';
import {
  FeaturedPosts,
  FeaturedPostsSkeleton,
  JournalCategoryFilter,
  JournalPostGrid,
} from '@/src/components/sections/blog';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { getCachedBlogCategories, getCachedBlogPostsPage } from '@/lib/payload/cache';

export const revalidate = 86_400;

const POSTS_PER_PAGE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [categories, postsPage] = await Promise.all([
    getCachedBlogCategories(),
    getCachedBlogPostsPage({
      page: 1,
      perPage: POSTS_PER_PAGE,
      excludeFeatured: true,
      categorySlug,
    }),
  ]);

  return (
    <>
      <SchemaMarkup type="page" />

      <div className="min-h-screen bg-paperbark">
        <PageIntro
          eyebrow="Life on pasture · The Branch, NSW"
          title="Field notes from a farm coming back to life"
          description="Follow the regeneration of 42 hectares in real time — the plantings, the setbacks, the soil results and the seasons. Read along, then come get your hands dirty."
          titleAs="h1"
          className="pb-12 pt-16"
          titleClassName="mx-auto max-w-[880px] text-[40px] leading-[1.06] sm:text-[58px]"
          descriptionClassName="mx-auto mt-[18px] max-w-[620px] text-stone leading-[1.6]"
        />

        <Suspense fallback={<FeaturedPostsSkeleton />}>
          <FeaturedPosts limit={1} />
        </Suspense>

        <JournalCategoryFilter categories={categories} activeSlug={categorySlug} />

        <JournalPostGrid
          posts={postsPage.posts}
          totalPages={postsPage.totalPages}
          categorySlug={categorySlug}
        />
      </div>
    </>
  );
}
