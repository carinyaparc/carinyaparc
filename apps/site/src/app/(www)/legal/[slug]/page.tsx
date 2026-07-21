// app/(www)/legal/[slug]/page.tsx
import '../../../../styles/pages/legal.css';

import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generatePageMetadata } from '@/src/lib/metadata';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';

function legalPageExists(slug: string): boolean {
  const mdxPath = path.join(process.cwd(), 'content', 'legal', `${slug}.mdx`);
  return fs.existsSync(mdxPath);
}

// Generate metadata for each legal page - ensure async/await usage is correct
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await the params promise
  const { slug } = await params;

  // Map slugs to proper titles and descriptions
  const metadataMap: Record<string, { title: string; description: string }> = {
    'privacy-policy': {
      title: 'Privacy Policy - Carinya Parc',
      description:
        'Our privacy policy explains how we collect, use, and protect your personal information when you use our website and services.',
    },
    'terms-of-service': {
      title: 'Terms of Service - Carinya Parc',
      description:
        'Our terms of service outline the rules and guidelines for using the Carinya Parc website and services.',
    },
  };

  const metadata = metadataMap[slug] || {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} - Carinya Parc`,
    description: `Legal information about ${slug.replace(/-/g, ' ')} at Carinya Parc.`,
  };

  // Explicitly define the canonical URL for legal pages
  return generatePageMetadata({
    title: metadata.title,
    description: metadata.description,
    path: `/legal/${slug}`,
    keywords: ['legal', slug.replace(/-/g, ' '), 'policy', 'terms'],
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!legalPageExists(slug)) {
    notFound();
  }

  let Content: React.ComponentType;

  try {
    const content = await import(
      /* webpackInclude: /\.mdx$/ */
      /* webpackMode: "eager" */
      `@/content/legal/${slug}.mdx`
    );
    Content = content.default;
  } catch {
    notFound();
  }

  return (
    <>
      {/* Schema markup for legal pages */}
      <SchemaMarkup type="legal" />

      <main className="isolate min-h-screen">
        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          <div className="container mx-auto max-w-4xl px-4">
            {/* Breadcrumb navigation */}
            <Breadcrumb />

            <article className="legal-prose">
              <Content />
            </article>
          </div>
        </div>
      </main>
    </>
  );
}

export function generateStaticParams() {
  const legalDir = path.join(process.cwd(), 'content', 'legal');

  try {
    const files = fs.readdirSync(legalDir);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => ({
        slug: file.replace(/\.mdx$/, ''),
      }));
  } catch {
    return [];
  }
}
