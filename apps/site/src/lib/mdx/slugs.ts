export const EXPECTED_POST_SLUGS = [
  'masterchef-to-mud-boots',
  'restoring-42-ha-land',
  'lessons-from-failure',
  'designing-polyculture-systems',
  'seasonal-soil-care-winter-composting-cover-crops',
  'creating-food-forest-complete-guide',
  'seven-layer-forest-design-guide',
  'hugelkulture-benefits-complete-guide',
] as const;

export const EXPECTED_RECIPE_SLUGS = [
  'slow-roasted-dexter-beef-with-root-vegetables',
  'rustic-farm-style-flatbread',
  'herbed-omlette-with-native-greens',
] as const;

export type PostSlug = (typeof EXPECTED_POST_SLUGS)[number];
export type RecipeSlug = (typeof EXPECTED_RECIPE_SLUGS)[number];

export function postSlugFromFilename(filename: string): string {
  const match = filename.match(/^\d{8}-(.+)\.mdx$/);
  if (!match?.[1]) {
    throw new Error(`Invalid post filename: ${filename}`);
  }

  return match[1];
}

export function recipeSlugFromFilename(filename: string): string {
  if (!filename.endsWith('.mdx')) {
    throw new Error(`Invalid recipe filename: ${filename}`);
  }

  return filename.replace(/\.mdx$/, '');
}

export function postUrl(slug: string): string {
  return `/blog/${slug}`;
}

export function recipeUrl(slug: string): string {
  return `/recipes/${slug}`;
}
