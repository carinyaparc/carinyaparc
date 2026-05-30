import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  datetime: string;
  tags: string[];
  excerpt: string;
  description: string;
  author: string;
  authorImageUrl: string;
  imageUrl: string;
  featured: boolean;
  href: string;
}

type Frontmatter = {
  title?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  description?: string;
  author?: string;
  image?: string;
  featured?: boolean;
};

function extractDateFromFilename(filename: string): string {
  const m = filename.match(/^(\d{4})(\d{2})(\d{2})-/);
  if (m) {
    return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function getBlogPosts(
  opts: {
    limit?: number;
    featured?: boolean;
  } = {},
): Promise<Post[]> {
  const { limit, featured = false } = opts;
  const postsDir = path.join(process.cwd(), 'content', 'posts');

  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
  const fallbackImages = [
    '/images/hero-home.jpg',
    '/images/highland-cattle-dam.jpg',
    '/images/alpacas-hill-pasture.jpg',
    '/images/river-valley-aerial.jpg',
    '/images/highland-cattle-paddock.jpg',
    '/images/farm-track-gate.jpg',
  ];

  const allPosts: Post[] = files.map((filename, idx) => {
    const fullPath = path.join(postsDir, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as Frontmatter;

    const slug = filename.replace(/^\d{8}-(.+)\.mdx$/, '$1');
    const date = fm.date ?? extractDateFromFilename(filename);
    const formattedDate = formatDate(date);
    const datetime = date;
    const title = fm.title ?? `Untitled Post ${idx + 1}`;
    const tags = Array.isArray(fm.tags) ? fm.tags : [];
    const excerpt = fm.excerpt ?? fm.description ?? '';
    const description = fm.description ?? '';
    const author = fm.author ?? 'Jonathan Daddia';
    const authorImageUrl = '/images/authors/jonathan.jpg';
    const fallbackImage = fallbackImages[idx % fallbackImages.length];
    const imageUrl = String(fm.image || fallbackImage);
    const isFeatured = fm.featured ?? false;

    return {
      id: idx + 1,
      slug,
      title,
      date,
      formattedDate,
      datetime,
      tags,
      excerpt,
      description,
      author,
      authorImageUrl,
      imageUrl,
      featured: isFeatured,
      href: `/blog/${slug}`,
    };
  });

  const sorted = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = featured ? sorted.filter((p) => p.featured) : sorted;
  return limit ? filtered.slice(0, limit) : filtered;
}
