import '@/src/styles/pages/blog.css';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import DateComponent from '@/src/components/ui/Date';
import { RichText } from '@/src/components/rich-text/RichText';
import { BASE_URL } from '@/src/lib/constants';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';
import { getCachedBlogPostBySlug, getCachedBlogPostSlugs } from '@/lib/payload/cache';
import { resolveAuthorName, resolveTagNames } from '@/lib/payload/map-content';

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
      canonical: `${BASE_URL}/blog/${slug}`,
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

      <main className="isolate min-h-screen">
        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          <div className="container mx-auto max-w-4xl px-4">
            <Breadcrumb />

            <article className="blog-prose">
              <header>
                <h1>{post.title}</h1>
                <div className="blog-meta">
                  <DateComponent dateString={post.date} />
                  {author && <span> • By {author}</span>}
                  {tags.length > 0 && (
                    <div className="blog-tags">
                      {tags.map((tag) => (
                        <span key={tag} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {post.excerpt && (
                  <div className="blog-excerpt">
                    <p>{post.excerpt}</p>
                  </div>
                )}
              </header>
              <RichText data={post.body} />
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
