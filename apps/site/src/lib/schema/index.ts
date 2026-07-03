// src/lib/schema/index.ts
import { generateOrganizationSchema, type OrganizationSchema } from './organization';
import { generateBreadcrumbSchema, type BreadcrumbSchema } from './breadcrumb';
import { generateArticleSchema, type ArticleSchema } from './article';
import { generateRecipeSchema, type RecipeSchema } from './recipe';
import { generateLocalBusinessSchema, type LocalBusinessSchema } from './localBusiness';

export type PageType = 'page' | 'blog' | 'recipe' | 'ancillary';

// Union type for all possible schema objects
type SchemaObject =
  OrganizationSchema | BreadcrumbSchema | ArticleSchema | RecipeSchema | LocalBusinessSchema;

export function generateJsonLd(
  type: PageType,
  context: {
    org: Parameters<typeof generateOrganizationSchema>[0];
    breadcrumb: Parameters<typeof generateBreadcrumbSchema>[0];
    article?: Parameters<typeof generateArticleSchema>[0];
    recipe?: Parameters<typeof generateRecipeSchema>[0];
    localBusiness?: Parameters<typeof generateLocalBusinessSchema>[0];
  },
): string {
  const graph: SchemaObject[] = [];

  // always include Organization
  graph.push(generateOrganizationSchema(context.org));

  // optional LocalBusiness (if applicable)
  if (context.localBusiness) {
    graph.push(generateLocalBusinessSchema(context.localBusiness));
  }

  // page‑type specific
  switch (type) {
    case 'blog':
      if (context.article) graph.push(generateArticleSchema(context.article));
      break;
    case 'recipe':
      if (context.recipe) graph.push(generateRecipeSchema(context.recipe));
      break;
    // plain pages and ancillary might not need Article/Recipe
    default:
      break;
  }

  // breadcrumbs for all
  graph.push(generateBreadcrumbSchema(context.breadcrumb));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}
