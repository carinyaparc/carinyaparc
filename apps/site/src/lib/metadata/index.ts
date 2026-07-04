import type { Metadata, ResolvingMetadata } from 'next';
import { generateTitle } from './title';
import { generateDescription } from './description';
import { generateCanonicalUrl } from './canonical';
import { generateOpenGraph } from './openGraph';
import { generateTwitterCard } from './twitter';
import { generateRobots } from './robots';
import { generateIcons } from './icons';
import { viewport } from './viewport';
import {
  SITE_TITLE,
  SITE_DESCRIPTION,
  BASE_URL,
  DEFAULT_KEYWORDS,
  SITE_MANIFEST_PATH,
  DEFAULT_OG_IMAGE,
} from '../constants';

export { viewport };

interface MetadataConfig {
  pageTitle?: string;
  pageDescription?: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Generate metadata for the page.
 * This is the main function to be used in pages and layouts.
 */
export async function generateMetadata(
  config: MetadataConfig = {},
  parent?: ResolvingMetadata,
): Promise<Metadata> {
  const {
    pageTitle,
    pageDescription,
    path = '/',
    keywords = [],
    image,
    type = 'website',
    noIndex = false,
    noFollow = false,
  } = config;

  // Get parent metadata if available
  const previousImages = parent ? (await parent).openGraph?.images || [] : [];

  // Generate individual metadata components
  const title = pageTitle ? generateTitle(SITE_TITLE, pageTitle) : SITE_TITLE;
  const description = generateDescription(SITE_DESCRIPTION, pageDescription);
  const canonical = generateCanonicalUrl(BASE_URL, path);
  const imageUrl = image ? `${BASE_URL}${image}` : `${BASE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    title: {
      template: `%s | ${SITE_TITLE}`,
      default: SITE_TITLE,
    },
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
      canonical,
      types: {
        'application/rss+xml': `${BASE_URL}/feed.xml`,
      },
    },
    openGraph: generateOpenGraph({
      title,
      description,
      url: canonical,
      imageUrl,
      images: previousImages.map((img: unknown) => {
        if (typeof img === 'string') {
          return { url: img };
        } else if (typeof img === 'object' && img !== null) {
          const imageObj = img as { url?: string; width?: number; height?: number; alt?: string };
          return {
            url: imageObj.url || '',
            width: imageObj.width,
            height: imageObj.height,
            alt: imageObj.alt,
          };
        }
        return { url: '' };
      }),
      type,
    }),
    twitter: generateTwitterCard({
      title,
      description,
      images: [imageUrl],
    }),
    robots: generateRobots({
      index: !noIndex,
      follow: !noFollow,
    }),
    manifest: SITE_MANIFEST_PATH,
    icons: generateIcons(),
    metadataBase: new URL(BASE_URL),
  };
}

/**
 * Helper function to generate page-specific metadata
 * This is a convenience wrapper around generateMetadata
 */
export function generatePageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}): Metadata {
  // Generate individual metadata components
  const canonical = generateCanonicalUrl(BASE_URL, path);
  const imageUrl = image ? `${BASE_URL}${image}` : `${BASE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: generateOpenGraph({
      title,
      description,
      url: canonical,
      imageUrl,
      type,
    }),
    twitter: generateTwitterCard({
      title,
      description,
      images: [imageUrl],
    }),
    robots: generateRobots(),
    manifest: SITE_MANIFEST_PATH,
    icons: generateIcons(),
    metadataBase: new URL(BASE_URL),
  };
}

/**
 * Helper to determine path from Next.js params
 */
export function getPathFromParams(params: { [key: string]: string | string[] } = {}): string {
  // Handle different param types
  if (params.post) {
    return `/blog/${params.post}`;
  } else if (params.recipe) {
    return `/recipes/${params.recipe}`;
  } else if (params.slug) {
    // For dynamic routes with slug
    return `/${params.slug}`;
  } else if (params.param) {
    // Generic param handling
    return `/${params.param}`;
  }

  return '/';
}
