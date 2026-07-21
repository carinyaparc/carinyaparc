import type {
  Author,
  Category,
  Post as PayloadPost,
  Recipe as PayloadRecipe,
  Tag,
} from '@/payload-types';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';
import { postUrl, recipeUrl } from '@/lib/payload/urls';
import type { Post } from '@/lib/posts';

/**
 * Subset of PayloadPost fields required to render a post card/list item.
 * Excludes `body` (rich-text JSONB) so list queries can omit that heavy column.
 */
export type PostListInput = Omit<PayloadPost, 'body'>;

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

export function resolveCategoryName(category: number | Category | null | undefined): string | null {
  if (category && typeof category === 'object') {
    return category.name;
  }

  return null;
}

export function resolveCategorySlug(category: number | Category | null | undefined): string | null {
  if (category && typeof category === 'object') {
    return category.slug;
  }

  return null;
}

export function mapPayloadPostToListItem(doc: PostListInput, index = 0): Post {
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
    category: resolveCategoryName(doc.category),
    categorySlug: resolveCategorySlug(doc.category),
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

/**
 * Subset of PayloadRecipe fields required to render a recipe card/list item.
 * Excludes the ingredients and instructions arrays, which only detail needs.
 */
export type RecipeListInput = Pick<
  PayloadRecipe,
  | 'id'
  | 'slug'
  | 'title'
  | 'date'
  | 'excerpt'
  | 'description'
  | 'image'
  | 'servings'
  | 'totalTime'
  | 'difficulty'
>;

export type RecipeListItem = {
  id: number;
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  datetime: string;
  description: string;
  excerpt: string;
  imageUrl: string;
  servings?: number;
  totalTime?: string;
  difficulty?: string;
  href: string;
};

export function mapPayloadRecipeToListItem(doc: RecipeListInput, index = 0): RecipeListItem {
  const fallbackImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0];

  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    date: doc.date,
    formattedDate: formatContentDate(doc.date),
    datetime: doc.date,
    description: doc.description ?? doc.excerpt,
    excerpt: doc.excerpt,
    imageUrl: doc.image ?? fallbackImage,
    servings: doc.servings ?? undefined,
    totalTime: doc.totalTime ?? undefined,
    difficulty: doc.difficulty ?? undefined,
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
