export { metadata } from './metadata';

import { Suspense } from 'react';

import { PageIntro } from '@/components/sections/page';
import {
  FeaturedPosts,
  FeaturedPostsSkeleton,
  JournalCategoryFilter,
  JournalSubscribeBand,
  PaginatedPosts,
  PaginatedPostsSkeleton,
} from '@/src/components/sections/blog';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { getCachedBlogCategories } from '@/lib/payload/cache';

export const revalidate = 86_400;

const POSTS_PER_PAGE = 6;

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: categorySlug } = await searchParams;
  const categories = await getCachedBlogCategories();

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

        {!categorySlug && (
          <Suspense fallback={<FeaturedPostsSkeleton />}>
            <FeaturedPosts limit={1} />
          </Suspense>
        )}

        <JournalCategoryFilter categories={categories} activeSlug={categorySlug} />

        <section className="py-9 pb-20">
          <Suspense fallback={<PaginatedPostsSkeleton count={POSTS_PER_PAGE} />}>
            <PaginatedPosts
              page={1}
              perPage={POSTS_PER_PAGE}
              excludeFeatured={!categorySlug}
              categorySlug={categorySlug}
            />
          </Suspense>
        </section>

        <JournalSubscribeBand />
      </div>
    </>
  );
}
