// Site metadata
export const SITE_TITLE = 'Carinya Parc';
export const SITE_DESCRIPTION = 'Carinya Parc - Regenerative farming and sustainable living';

export const BASE_URL =
  process.env.NODE_ENV === 'production' ? 'https://carinyaparc.com.au' : 'http://localhost:3000';

// SEO Keywords
export const DEFAULT_KEYWORDS = [
  'regenerative farming',
  'sustainable agriculture',
  'permaculture',
  'biodiversity',
  'soil health',
  'ecosystem restoration',
  'organic farming',
  'Australia',
  'NSW',
  'The Branch',
];

// Social defaults
export const DEFAULT_OG_IMAGE = '/images/hero-home.jpg';
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';
export const PLACEHOLDER_IMAGE_SVG = '/images/placeholder.svg';
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT = 'Carinya Parc regenerative farm landscape';
export const TWITTER_HANDLE = '@carinyaparc';
export const TWITTER_CARD_TYPE = 'summary_large_image';

// Icons and manifest
export const SITE_MANIFEST_PATH = '/site.webmanifest';
export const FAVICON_DIR = '/favicon';
export const FAVICON_ICO_PATH = `${FAVICON_DIR}/favicon.ico`;
export const FAVICON_192_PATH = `${FAVICON_DIR}/favicon-192x192.png`;
export const FAVICON_512_PATH = `${FAVICON_DIR}/favicon-512x512.png`;
export const APPLE_TOUCH_ICON_PATH = `${FAVICON_DIR}/apple-touch-icon-180.png`;

// JSON‑LD schema defaults
export const ORG_LOGO_URL = `${BASE_URL}${FAVICON_512_PATH}`;
export const ORG_LOGO_WIDTH = 512;
export const ORG_LOGO_HEIGHT = 512;

// Article schema defaults
export const DEFAULT_ARTICLE_SECTION = 'Blog';
export const DEFAULT_ARTICLE_WORD_COUNT = 2000;
export const DEFAULT_ARTICLE_KEYWORDS =
  'regenerative farming, sustainable agriculture, permaculture';
export const DEFAULT_ARTICLE_IMAGE = '/images/hero-home.jpg';
export const DEFAULT_AUTHOR_NAME = 'Jonathan Daddia';
export const DEFAULT_AUTHOR_URL_PATH = '/about/jonathan';

// Article "about" topic
export const ARTICLE_ABOUT_TOPIC = {
  name: 'Regenerative Agriculture',
  description: 'Sustainable farming practices that restore soil health and biodiversity',
};

// Blog defaults
export const BLOG_NAME = `${SITE_TITLE} Blog`;
export const BLOG_URL_PATH = '/blog';

// Breadcrumb defaults
export const DEFAULT_BREADCRUMB_HOME = { name: 'Home', url: BASE_URL, position: 1 };

// File‑system paths (build‑time only)
// Use string path instead of path.join to avoid issues in tests
export const APP_DIR = process.cwd() + '/src/app';

// Cookies
export const CONSENT_COOKIE_NAME = 'cp_consent';
export const SESSION_COOKIE_NAME = 'cp_session';

// LocalBusiness schema defaults
export const LOCAL_BUSINESS = {
  name: 'Carinya Parc',
  description:
    'Regenerative farm demonstrating ecological restoration, sustainable agriculture, and community building in The Branch, NSW.',
  address: {
    streetAddress: '315 Warraba Road',
    addressLocality: 'The Branch',
    addressRegion: 'NSW',
    postalCode: '2425',
    addressCountry: 'AU',
  },
  geo: {
    latitude: -32.0, // TODO: Add actual coordinates
    longitude: 152.0,
  },
  openingHours: ['By appointment'],
  priceRange: '$$',
};

// Organization social profiles
export const ORG_SOCIAL_PROFILES = [
  'https://www.facebook.com/carinyaparc',
  'https://www.instagram.com/carinyaparc',
];

// Breadcrumb name mapping
export const BREADCRUMB_NAME_MAP: Record<string, string> = {
  about: 'About',
  blog: 'Blog',
  recipes: 'Recipes',
  regenerate: 'Regenerate with Us',
  subscribe: 'Subscribe',
  legal: 'Legal',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  jonathan: 'Jonathan Daddia',
  'the-property': 'The Property',
};
