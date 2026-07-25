import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { BlogTopicNav } from '@/features/blog/components/BlogTopicNav';
import { PageIntro } from '@/components/sections/page';
import { PaginatedPosts } from '@/features/blog/components';
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
  const { totalPages } = await getCachedBlogPostsPage({
    page: 1,
    perPage: POSTS_PER_PAGE,
    excludeFeatured: true,
  });

  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export default async function BlogPageNumber({ params }: { params: Promise<{ page: string }> }) {
  const { page: rawPage } = await params;
  const page = parsePageParam(rawPage);

  if (!page) {
    notFound();
  }

  const [{ totalPages }, categories] = await Promise.all([
    getCachedBlogPostsPage({
      page,
      perPage: POSTS_PER_PAGE,
      excludeFeatured: true,
    }),
    getCachedBlogCategories(),
  ]);

  if (page > totalPages) {
    notFound();
  }

  return (
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

      <BlogTopicNav categories={categories} />

      <section className="py-9 pb-[84px]">
        <PaginatedPosts page={page} perPage={POSTS_PER_PAGE} excludeFeatured />
      </section>
    </div>
  );
}
