import type { Author, Post as PayloadPost, Recipe as PayloadRecipe, Tag } from '@/payload-types';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';
import { postUrl, recipeUrl } from '@/lib/mdx/slugs';
import type { Post } from '@/lib/posts';

const FALLBACK_IMAGES = [
  '/images/hero-home.jpg',
  '/images/highland-cattle-dam.jpg',
  '/images/alpacas-hill-pasture.jpg',
  '/images/river-valley-aerial.jpg',
  '/images/highland-cattle-paddock.jpg',
  '/images/farm-track-gate.jpg',
] as const;

export function formatContentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function resolveAuthorName(author: number | Author | null | undefined): string {
  if (author && typeof author === 'object') {
    return author.name;
  }

  return 'Jonathan Daddia';
}

export function resolveAuthorImageUrl(author: number | Author | null | undefined): string {
  if (author && typeof author === 'object' && author.imageUrl) {
    return author.imageUrl;
  }

  return PLACEHOLDER_IMAGE;
}

export function resolveTagNames(tags: (number | Tag)[] | null | undefined): string[] {
  if (!tags?.length) {
    return [];
  }

  return tags
    .map((tag) => (typeof tag === 'object' && tag !== null ? tag.name : null))
    .filter((name): name is string => Boolean(name));
}

export function mapPayloadPostToListItem(doc: PayloadPost, index = 0): Post {
  const date = doc.date;
  const fallbackImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0];

  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    date,
    formattedDate: formatContentDate(date),
    datetime: date,
    tags: resolveTagNames(doc.tags),
    excerpt: doc.excerpt,
    description: doc.description ?? doc.excerpt,
    author: resolveAuthorName(doc.author),
    authorImageUrl: resolveAuthorImageUrl(doc.author),
    imageUrl: doc.image ?? fallbackImage,
    featured: doc.featured ?? false,
    href: postUrl(doc.slug),
  };
}

export type RecipeDetail = {
  slug: string;
  title: string;
  date?: string;
  author: string;
  description: string;
  excerpt: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  href: string;
};

export function mapPayloadRecipeToDetail(doc: PayloadRecipe): RecipeDetail {
  return {
    slug: doc.slug,
    title: doc.title,
    date: doc.date,
    author: resolveAuthorName(doc.author),
    description: doc.description ?? doc.excerpt,
    excerpt: doc.excerpt,
    servings: doc.servings ?? undefined,
    prepTime: doc.prepTime ?? undefined,
    cookTime: doc.cookTime ?? undefined,
    totalTime: doc.totalTime ?? undefined,
    ingredients: doc.ingredients.map((entry) => entry.item),
    instructions: doc.instructions.map((entry) => entry.step),
    tags: resolveTagNames(doc.tags),
    href: recipeUrl(doc.slug),
  };
}

export type ContentRouteEntry = {
  route: string;
  lastModified: string;
  priority?: number;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
};

export function mapPayloadDocToRoute(
  route: string,
  updatedAt: string,
  options: Pick<ContentRouteEntry, 'priority' | 'changeFrequency'> = {},
): ContentRouteEntry {
  return {
    route,
    lastModified: updatedAt,
    ...options,
  };
}
