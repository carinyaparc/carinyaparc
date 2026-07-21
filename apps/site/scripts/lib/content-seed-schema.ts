import { z } from 'zod';

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case');

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

const isoDurationSchema = z
  .string()
  .regex(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/, 'duration must be ISO 8601, e.g. PT20M');

export const postSeedSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  date: isoDateSchema,
  author: slugSchema,
  category: slugSchema.optional(),
  tags: z.array(slugSchema).optional(),
  featured: z.boolean().optional(),
  excerpt: z.string().min(1).max(500),
  description: z.string().max(300).optional(),
  image: z.string().optional(),
  body: z.string().min(1),
});

export const recipeSeedSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  date: isoDateSchema,
  author: slugSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  servings: z.number().int().min(1).optional(),
  prepTime: isoDurationSchema.optional(),
  cookTime: isoDurationSchema.optional(),
  totalTime: isoDurationSchema.optional(),
  excerpt: z.string().min(1).max(500),
  description: z.string().max(300).optional(),
  image: z.string().optional(),
  tags: z.array(slugSchema).optional(),
  ingredients: z.array(z.object({ item: z.string().min(1) })).min(1),
  instructions: z.array(z.object({ step: z.string().min(1) })).min(1),
});

export const categorySeedSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type PostSeed = z.infer<typeof postSeedSchema>;
export type RecipeSeed = z.infer<typeof recipeSeedSchema>;
export type CategorySeed = z.infer<typeof categorySeedSchema>;

export function parsePostSeed(data: unknown): PostSeed {
  return postSeedSchema.parse(data);
}

export function parseRecipeSeed(data: unknown): RecipeSeed {
  return recipeSeedSchema.parse(data);
}

export function parseCategorySeed(data: unknown): CategorySeed {
  return categorySeedSchema.parse(data);
}

export function validateSeedFile(
  collection: 'categories' | 'posts' | 'recipes',
  data: unknown,
): CategorySeed | PostSeed | RecipeSeed {
  if (collection === 'categories') {
    return parseCategorySeed(data);
  }

  return collection === 'posts' ? parsePostSeed(data) : parseRecipeSeed(data);
}
