import '@/src/styles/pages/blog.css';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ArticleScrollDepth } from '@/features/blog/components/ArticleScrollDepth';
import { AuthorBlock } from '@/features/blog/components/AuthorBlock';
import { RelatedPosts } from '@/features/blog/components/RelatedPosts';
import { ShareBar } from '@/features/blog/components/ShareBar';
import { GetInvolvedCTA } from '@/features/events/components/GetInvolvedCTA';
import { BlogPostHeader } from '@/features/blog/components/BlogPostArticle';
import { EndOfPostSubscribe } from '@/components/subscribe/EndOfPostSubscribe';
import { InlineSubscribe } from '@/components/subscribe/InlineSubscribe';
import { RichText } from '@/src/components/rich-text/RichText';
import { BASE_URL } from '@/src/lib/constants';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { getCachedBlogPostBySlug, getCachedBlogPostSlugs } from '@/lib/payload/cache';
import { resolveAuthorName, resolveTagNames } from '@/lib/payload/map-content';
import { getNextUpcomingEvent } from '@/features/events/queries/events';
import { getRelatedPosts } from '@/features/blog/queries/related-posts';
import { postUrl } from '@/lib/payload/urls';
import { splitRichTextAtMidpoint } from '@/lib/subscribe/split-rich-text';
import { blogSubscribeSource } from '@/lib/validation/subscribe-schema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found - Carinya Parc',
      description: 'The requested blog post could not be found.',
    };
  }

  const description = post.description ?? post.excerpt;
  const author = resolveAuthorName(post.author);
  const tags = resolveTagNames(post.tags);
  const image = post.image ?? undefined;

  return {
    title: `${post.title} - Blog - Carinya Parc`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: author ? [author] : undefined,
      tags: tags.length > 0 ? tags : undefined,
      images: image ? [{ url: `${BASE_URL}${image}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: image ? [`${BASE_URL}${image}`] : undefined,
    },
    alternates: {
      canonical: `${BASE_URL}${postUrl(slug)}`,
    },
  };
}

export const revalidate = 86_400;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getCachedBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getCachedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = resolveAuthorName(post.author);
  const tags = resolveTagNames(post.tags);
  const description = post.description ?? post.excerpt;
  const [relatedPosts, nextEvent] = await Promise.all([
    getRelatedPosts(post, 3),
    getNextUpcomingEvent(),
  ]);
  const heroImage = post.image ?? '/images/farm-track-gate.jpg';
  const subscribeSource = blogSubscribeSource(slug);
  const canonicalUrl = `${BASE_URL}${postUrl(slug)}`;
  const { before: bodyBefore, after: bodyAfter } = splitRichTextAtMidpoint(post.body);

  const articleData = {
    title: post.title,
    slug,
    author,
    datePublished: post.date,
    dateModified: post.updatedAt,
    imageUrl: post.image ?? undefined,
    description,
    excerpt: post.excerpt,
    tags: tags.length > 0 ? tags : undefined,
  };

  return (
    <>
      <SchemaMarkup
        type="blog"
        data={{
          article: articleData,
        }}
      />

      <main className="min-h-screen bg-paperbark">
        <article>
          <ArticleScrollDepth />
          <BlogPostHeader post={post} />

          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="blog-hero-image">
              <Image
                src={heroImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1040px) 100vw, 1040px"
              />
            </div>
          </div>

          <div className="blog-prose pt-3">
            <RichText data={bodyBefore} />
          </div>

          <div className="mx-auto max-w-[720px] px-6">
            <InlineSubscribe source={subscribeSource} />
          </div>

          {bodyAfter ? (
            <div className="blog-prose pb-8">
              <RichText data={bodyAfter} />
            </div>
          ) : (
            <div className="pb-8" />
          )}

          <EndOfPostSubscribe source={subscribeSource} />

          <ShareBar url={canonicalUrl} title={post.title} />

          <AuthorBlock author={post.author} />

          <GetInvolvedCTA event={nextEvent} source={subscribeSource} />
        </article>

        <RelatedPosts posts={relatedPosts} />
      </main>
    </>
  );
}
