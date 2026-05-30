import type { Payload } from 'payload';

import { loadPostFiles, loadRecipeFiles } from '@/lib/mdx/load-content';
import { parseRecipeInstructions } from '@/lib/mdx/parse-recipe-body';
import {
  EXPECTED_POST_SLUGS,
  EXPECTED_RECIPE_SLUGS,
  postUrl,
  recipeUrl,
} from '@/lib/mdx/slugs';
import { stripMdxBody } from '@/lib/mdx/strip-mdx';
import { markdownToLexical } from '@/lib/payload/markdown-to-lexical';
import { findOrCreateAuthor, findOrCreateTags, toPayloadDate } from '@/lib/payload/references';

export type MigrationItemResult = {
  slug: string;
  url: string;
  action: 'created' | 'updated' | 'skipped';
};

export type MigrationSummary = {
  posts: MigrationItemResult[];
  recipes: MigrationItemResult[];
};

function assertExpectedSlugs(postSlugs: string[], recipeSlugs: string[]) {
  const missingPosts = EXPECTED_POST_SLUGS.filter((slug) => !postSlugs.includes(slug));
  const missingRecipes = EXPECTED_RECIPE_SLUGS.filter((slug) => !recipeSlugs.includes(slug));

  if (missingPosts.length > 0 || missingRecipes.length > 0) {
    throw new Error(
      `MDX slug map mismatch. Missing posts: ${missingPosts.join(', ') || 'none'}. Missing recipes: ${missingRecipes.join(', ') || 'none'}.`,
    );
  }
}

async function upsertPost(
  payload: Payload,
  item: ReturnType<typeof loadPostFiles>[number],
  authorId: number,
  tagIds: number[],
): Promise<MigrationItemResult> {
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: item.slug } },
    limit: 1,
    overrideAccess: true,
  });

  const data = {
    title: item.frontmatter.title ?? item.slug,
    slug: item.slug,
    date: toPayloadDate(item.frontmatter.date, item.filename),
    author: authorId,
    featured: item.frontmatter.featured ?? false,
    excerpt: item.frontmatter.excerpt ?? '',
    description: item.frontmatter.description ?? undefined,
    image: item.frontmatter.image ?? undefined,
    tags: tagIds,
    body: markdownToLexical(stripMdxBody(item.body)),
    _status: 'published' as const,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: 'posts',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });

    return { slug: item.slug, url: postUrl(item.slug), action: 'updated' };
  }

  await payload.create({
    collection: 'posts',
    data,
    overrideAccess: true,
  });

  return { slug: item.slug, url: postUrl(item.slug), action: 'created' };
}

async function upsertRecipe(
  payload: Payload,
  item: ReturnType<typeof loadRecipeFiles>[number],
  authorId: number,
  tagIds: number[],
): Promise<MigrationItemResult> {
  const existing = await payload.find({
    collection: 'recipes',
    where: { slug: { equals: item.slug } },
    limit: 1,
    overrideAccess: true,
  });

  const ingredients = (item.frontmatter.ingredients ?? []).map((entry) => ({ item: entry }));
  const instructions = parseRecipeInstructions(item.body).map((step) => ({ step }));

  if (ingredients.length === 0 || instructions.length === 0) {
    throw new Error(`Recipe ${item.slug} is missing ingredients or instructions`);
  }

  const data = {
    title: item.frontmatter.title ?? item.slug,
    slug: item.slug,
    date: toPayloadDate(item.frontmatter.date, item.filename),
    author: authorId,
    servings: item.frontmatter.servings ?? undefined,
    prepTime: item.frontmatter.prepTime ?? undefined,
    cookTime: item.frontmatter.cookTime ?? undefined,
    totalTime: item.frontmatter.totalTime ?? undefined,
    excerpt: item.frontmatter.excerpt ?? '',
    description: item.frontmatter.description ?? undefined,
    tags: tagIds,
    ingredients,
    instructions,
    _status: 'published' as const,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: 'recipes',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });

    return { slug: item.slug, url: recipeUrl(item.slug), action: 'updated' };
  }

  await payload.create({
    collection: 'recipes',
    data,
    overrideAccess: true,
  });

  return { slug: item.slug, url: recipeUrl(item.slug), action: 'created' };
}

export async function migrateMdxContent(payload: Payload): Promise<MigrationSummary> {
  const posts = loadPostFiles();
  const recipes = loadRecipeFiles();

  assertExpectedSlugs(
    posts.map((post) => post.slug),
    recipes.map((recipe) => recipe.slug),
  );

  const postResults: MigrationItemResult[] = [];
  const recipeResults: MigrationItemResult[] = [];

  for (const post of posts) {
    const authorId = await findOrCreateAuthor(payload, post.frontmatter.author ?? 'Jonno');
    const tagIds = await findOrCreateTags(payload, post.frontmatter.tags ?? []);
    postResults.push(await upsertPost(payload, post, authorId, tagIds));
  }

  for (const recipe of recipes) {
    const authorId = await findOrCreateAuthor(payload, recipe.frontmatter.author ?? 'Jonno');
    const tagIds = await findOrCreateTags(payload, recipe.frontmatter.tags ?? []);
    recipeResults.push(await upsertRecipe(payload, recipe, authorId, tagIds));
  }

  return { posts: postResults, recipes: recipeResults };
}

export function formatMigrationSummary(summary: MigrationSummary): string {
  const lines = ['MDX migration complete:', ''];

  lines.push('Posts:');
  for (const item of summary.posts) {
    lines.push(`  ${item.action.padEnd(7)} ${item.url}`);
  }

  lines.push('');
  lines.push('Recipes:');
  for (const item of summary.recipes) {
    lines.push(`  ${item.action.padEnd(7)} ${item.url}`);
  }

  return lines.join('\n');
}
