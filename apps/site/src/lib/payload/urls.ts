// Public content URLs use trailing slashes to match next.config trailingSlash: true,
// so links, canonicals, and sitemap entries never point at a 308 redirect.
export function postUrl(slug: string): string {
  return `/blog/${slug}/`;
}

export function recipeUrl(slug: string): string {
  return `/recipes/${slug}/`;
}
