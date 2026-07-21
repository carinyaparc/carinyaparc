export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  datetime: string;
  tags: string[];
  category: string | null;
  categorySlug: string | null;
  excerpt: string;
  description: string;
  author: string;
  authorImageUrl: string;
  imageUrl: string;
  featured: boolean;
  href: string;
}

export { getBlogPosts, getBlogPostBySlug, getBlogPostSlugs } from '@/lib/payload/queries/posts';
