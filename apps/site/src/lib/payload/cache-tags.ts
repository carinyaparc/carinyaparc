export const PAYLOAD_CACHE_TAGS = {
  posts: 'payload:posts',
  post: (slug: string) => `payload:post:${slug}`,
  recipes: 'payload:recipes',
  recipe: (slug: string) => `payload:recipe:${slug}`,
} as const;
