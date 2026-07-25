import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { BlogTopicNav } from '@/components/blog/BlogTopicNav';
import PostCard from '@/components/sections/blog/PostCard';
import { PageIntro } from '@/components/sections/page';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { generatePageMetadata } from '@/src/lib/metadata';
import {
  getBlogCategories,
  getCategoryBySlug,
  getCategorySlugs,
  getPostsByCategory,
} from '@/lib/payload/queries/categories';
import { categoryUrl } from '@/lib/payload/urls';

export const revalidate = 86_400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found - Carinya Parc',
      description: 'The requested blog category could not be found.',
    };
  }

  return generatePageMetadata({
    title: `${category.name} - Blog`,
    description: `Published stories in ${category.name} from Carinya Parc — regenerative farming, restoration, and life on the property.`,
    path: categoryUrl(slug),
    keywords: [category.name, 'Carinya Parc blog', 'regenerative farming'],
  });
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [categories, posts] = await Promise.all([getBlogCategories(), getPostsByCategory(slug)]);

  return (
    <>
      <SchemaMarkup type="page" />

      <div className="min-h-screen bg-paperbark">
        <PageIntro
          eyebrow="Blog · Categories"
          title={category.name}
          description={`Published field notes filed under ${category.name}.`}
          titleAs="h1"
          className="pb-12 pt-16"
          titleClassName="mx-auto max-w-[880px] text-[40px] leading-[1.06] sm:text-[58px]"
          descriptionClassName="mx-auto mt-[18px] max-w-[620px] text-stone leading-[1.6]"
        />

        <BlogTopicNav categories={categories} activeSlug={slug} />

        <section className="py-9 pb-[84px]">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            {posts.length > 0 ? (
              <div className="grid auto-rows-fr grid-cols-1 gap-[30px] lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="journal" />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-charcoal">
                No posts in this category yet. Try another topic or check back soon.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
