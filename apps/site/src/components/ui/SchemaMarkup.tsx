'use client';

import { usePathname } from 'next/navigation';
import { generateBreadcrumbsFromPath, generateBreadcrumbSchema } from '@/lib/schema/breadcrumb';
import { generateArticleSchema, type ArticleData } from '@/features/blog/schema/article';
import { generateRecipeSchema, type RecipeData } from '@/features/recipes/schema/recipe';
import { generateLocalBusinessSchema } from '@/lib/schema/localBusiness';
import { LOCAL_BUSINESS } from '@/lib/constants';

interface BaseSchemaProps {
  /** Page type determines which schemas to include */
  type: 'page' | 'blog' | 'recipe' | 'about' | 'legal';
  /** Optional page-specific data */
  data?: {
    article?: ArticleData;
    recipe?: RecipeData;
    /** Override the automatic breadcrumbs */
    breadcrumbs?: Array<{ name: string; url: string; position: number }>;
  };
  /** Whether to include LocalBusiness schema (default: false) */
  includeLocalBusiness?: boolean;
}

export function SchemaMarkup({ type, data, includeLocalBusiness = false }: BaseSchemaProps) {
  const pathname = usePathname();

  // Generate schemas array
  const schemas = [];

  // Generate breadcrumbs (use provided or auto-generate)
  const breadcrumbItems = data?.breadcrumbs || generateBreadcrumbsFromPath(pathname);
  schemas.push(generateBreadcrumbSchema(breadcrumbItems));

  // Add LocalBusiness schema if requested (e.g., for home page)
  if (includeLocalBusiness) {
    schemas.push(generateLocalBusinessSchema(LOCAL_BUSINESS));
  }

  // Add page-specific schemas
  switch (type) {
    case 'blog':
      if (data?.article) {
        schemas.push(generateArticleSchema(data.article));
      }
      break;

    case 'recipe':
      if (data?.recipe) {
        schemas.push(generateRecipeSchema(data.recipe));
      }
      break;

    // About and legal pages might have specific schemas in the future
    case 'about':
    case 'legal':
    case 'page':
      // Currently just breadcrumbs for these pages
      break;
  }

  // Only render if we have schemas to add
  if (schemas.length === 0) {
    return null;
  }

  // If only one schema, render it directly
  if (schemas.length === 1) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas[0]) }}
      />
    );
  }

  // Multiple schemas: combine into @graph
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
