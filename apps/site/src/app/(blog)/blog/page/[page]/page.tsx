import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { PageHeader } from '@/src/components/sections/page-header';
import { PaginatedPosts } from '@/src/components/sections/blog';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';
import { getCachedBlogPostsPage } from '@/lib/payload/cache';
import { BASE_URL } from '@/src/lib/constants';

const POSTS_PER_PAGE = 6;

const pageHeaderProps = {
  variant: 'dark' as const,
  align: 'center' as const,
  title: 'Life on Pasture',
  subtitle: 'Our Blog',
  description:
    'Follow our regeneration journey through detailed updates, insights, and lessons learned as we transform Carinya Parc into a thriving ecosystem.',
  backgroundImage: '/images/farm-track-gate.jpg',
  backgroundImageAlt: 'Carinya Parc landscape',
};

export const revalidate = 86_400;

function parsePageParam(raw: string): number | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  const page = Number.parseInt(raw, 10);
  // Page 1 lives at /blog/ — only deeper pages render here.
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

export default async function BlogPageNumber({ params }: { params: Promise<{ page: string }> }) {
  const { page: rawPage } = await params;
  const page = parsePageParam(rawPage);

  if (!page) {
    notFound();
  }

  const { totalPages } = await getCachedBlogPostsPage({ page, perPage: POSTS_PER_PAGE });

  if (page > totalPages) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb />
      </div>

      <section>
        <PageHeader {...pageHeaderProps} />
      </section>

      <section className="py-20 bg-white">
        <PaginatedPosts
          title={`Articles — Page ${page}`}
          subtitle="Explore our insights and updates from the farm"
          page={page}
          perPage={POSTS_PER_PAGE}
        />
      </section>
    </div>
  );
}
