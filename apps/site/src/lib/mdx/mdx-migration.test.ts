import { describe, expect, it } from 'vitest';

import { loadPostFiles, loadRecipeFiles } from '@/lib/mdx/load-content';
import { parseRecipeInstructions } from '@/lib/mdx/parse-recipe-body';
import {
  EXPECTED_POST_SLUGS,
  EXPECTED_RECIPE_SLUGS,
  postSlugFromFilename,
  postUrl,
  recipeSlugFromFilename,
  recipeUrl,
} from '@/lib/mdx/slugs';

describe('MDX slug map', () => {
  it('maps post filenames to /blog/{slug} URLs', () => {
    expect(postSlugFromFilename('20250220-restoring-42-ha-land.mdx')).toBe('restoring-42-ha-land');
    expect(postUrl('restoring-42-ha-land')).toBe('/blog/restoring-42-ha-land');
  });

  it('maps recipe filenames to /recipes/{slug} URLs', () => {
    expect(recipeSlugFromFilename('slow-roasted-dexter-beef-with-root-vegetables.mdx')).toBe(
      'slow-roasted-dexter-beef-with-root-vegetables',
    );
    expect(recipeUrl('rustic-farm-style-flatbread')).toBe('/recipes/rustic-farm-style-flatbread');
  });

  it('loads all 8 posts and 3 recipes from content/', () => {
    const posts = loadPostFiles();
    const recipes = loadRecipeFiles();

    expect(posts).toHaveLength(EXPECTED_POST_SLUGS.length);
    expect(recipes).toHaveLength(EXPECTED_RECIPE_SLUGS.length);

    expect(posts.map((post) => post.slug).sort()).toEqual([...EXPECTED_POST_SLUGS].sort());
    expect(recipes.map((recipe) => recipe.slug).sort()).toEqual([...EXPECTED_RECIPE_SLUGS].sort());
  });
});

describe('parseRecipeInstructions', () => {
  it('extracts numbered steps and skips headings and blockquotes', () => {
    const body = `# Title

> A short intro

1. **Preheat oven:** 140 °C (fan-forced).
2. **Serve:** Slice and rest.

Enjoy immediately.`;

    expect(parseRecipeInstructions(body)).toEqual([
      'Preheat oven: 140 °C (fan-forced).',
      'Serve: Slice and rest. Enjoy immediately.',
    ]);
  });
});
