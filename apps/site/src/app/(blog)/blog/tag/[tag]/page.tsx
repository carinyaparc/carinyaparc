import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { BlogTopicNav } from '@/features/blog/components/BlogTopicNav';
import PostCard from '@/features/blog/components/PostCard';
import { PageIntro } from '@/components/sections/page';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { generatePageMetadata } from '@/src/lib/metadata';
import { getBlogCategories } from '@/features/blog/queries/categories';
import { getPostsByTag, getTagBySlug, getTagSlugs } from '@/features/blog/queries/tags';
import { tagUrl } from '@/lib/payload/urls';

export const revalidate = 86_400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return {
      title: 'Tag Not Found - Carinya Parc',
      description: 'The requested blog tag could not be found.',
    };
  }

  return generatePageMetadata({
    title: `${tag.name} - Blog`,
    description: `Published stories tagged ${tag.name} from Carinya Parc — regenerative farming, restoration, and life on the property.`,
    path: tagUrl(slug),
    keywords: [tag.name, 'Carinya Parc blog', 'regenerative farming'],
  });
}

export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  const slugs = await getTagSlugs();
  return slugs.map((tag) => ({ tag }));
}

export default async function BlogTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const [categories, posts] = await Promise.all([getBlogCategories(), getPostsByTag(slug)]);

  return (
    <>
      <SchemaMarkup type="page" />

      <div className="min-h-screen bg-paperbark">
        <PageIntro
          eyebrow="Blog · Tags"
          title={tag.name}
          description={`Published field notes tagged ${tag.name}.`}
          titleAs="h1"
          className="pb-12 pt-16"
          titleClassName="mx-auto max-w-[880px] text-[40px] leading-[1.06] sm:text-[58px]"
          descriptionClassName="mx-auto mt-[18px] max-w-[620px] text-stone leading-[1.6]"
        />

        <BlogTopicNav categories={categories} activeSlug={null} />

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
                No posts with this tag yet. Try another topic or check back soon.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
