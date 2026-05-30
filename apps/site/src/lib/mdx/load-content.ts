import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import { postSlugFromFilename, recipeSlugFromFilename } from '@/lib/mdx/slugs';

export type PostFrontmatter = {
  title?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  description?: string;
  featured?: boolean;
  image?: string;
  author?: string;
};

export type RecipeFrontmatter = {
  title?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  description?: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients?: string[];
  author?: string;
  status?: string;
};

export type LoadedPost = {
  slug: string;
  filename: string;
  frontmatter: PostFrontmatter;
  body: string;
};

export type LoadedRecipe = {
  slug: string;
  filename: string;
  frontmatter: RecipeFrontmatter;
  body: string;
};

function contentRoot(): string {
  return path.join(process.cwd(), 'content');
}

export function loadPostFiles(): LoadedPost[] {
  const postsDir = path.join(contentRoot(), 'posts');
  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.mdx'));

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    const parsed = matter(raw);

    return {
      slug: postSlugFromFilename(filename),
      filename,
      frontmatter: parsed.data as PostFrontmatter,
      body: parsed.content,
    };
  });
}

export function loadRecipeFiles(): LoadedRecipe[] {
  const recipesDir = path.join(contentRoot(), 'recipes');
  const files = fs.readdirSync(recipesDir).filter((file) => file.endsWith('.mdx'));

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(recipesDir, filename), 'utf8');
    const parsed = matter(raw);

    return {
      slug: recipeSlugFromFilename(filename),
      filename,
      frontmatter: parsed.data as RecipeFrontmatter,
      body: parsed.content,
    };
  });
}
