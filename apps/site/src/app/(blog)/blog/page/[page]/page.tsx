import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { PageIntro } from '@/components/sections/page';
import {
  JournalCategoryFilter,
  JournalSubscribeBand,
  PaginatedPosts,
  PaginatedPostsSkeleton,
} from '@/src/components/sections/blog';
import { getCachedBlogCategories, getCachedBlogPostsPage } from '@/lib/payload/cache';
import { BASE_URL } from '@/src/lib/constants';

const POSTS_PER_PAGE = 6;

export const revalidate = 86_400;

function parsePageParam(raw: string): number | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  const page = Number.parseInt(raw, 10);
  return page >= 2 ? page : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page: rawPage } = await params;
  const page = parsePageParam(rawPage);

  if (!page) {
    return { title: 'Blog - Carinya Parc' };
  }

  return {
    title: `Blog - Page ${page} - Carinya Parc`,
    description: 'Older articles on regenerative farming and life at Carinya Parc.',
    alternates: {
      canonical: `${BASE_URL}/blog/page/${page}/`,
    },
  };
}

export async function generateStaticParams(): Promise<Array<{ page: string }>> {
  const { totalPages } = await getCachedBlogPostsPage({ page: 1, perPage: POSTS_PER_PAGE });

  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
    page: String(index + 2),
  }));
}

interface BlogPageNumberProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPageNumber({ params, searchParams }: BlogPageNumberProps) {
  const { page: rawPage } = await params;
  const { category: categorySlug } = await searchParams;
  const page = parsePageParam(rawPage);

  if (!page) {
    notFound();
  }

  const { totalPages } = await getCachedBlogPostsPage({
    page,
    perPage: POSTS_PER_PAGE,
    categorySlug,
  });

  if (page > totalPages) {
    notFound();
  }

  const categories = await getCachedBlogCategories();

  return (
    <div className="min-h-screen bg-paperbark">
      <PageIntro
        eyebrow="Life on pasture · The Branch, NSW"
        title="Field notes from a farm coming back to life"
        description="Follow the regeneration of 42 hectares in real time — the plantings, the setbacks, the soil results and the seasons."
        titleAs="h1"
        className="pb-8 pt-12 sm:pt-16"
      />

      <JournalCategoryFilter
        categories={categories}
        activeSlug={categorySlug}
        basePath={`/blog/page/${page}/`}
      />

      <section className="py-9 pb-20">
        <Suspense fallback={<PaginatedPostsSkeleton count={POSTS_PER_PAGE} />}>
          <PaginatedPosts page={page} perPage={POSTS_PER_PAGE} categorySlug={categorySlug} />
        </Suspense>
      </section>

      <JournalSubscribeBand />
    </div>
  );
}
