// src/lib/metadata/canonical.ts

/**
 * Normalise a route path to a trailing slash, matching next.config
 * trailingSlash: true, so canonical and sitemap URLs never point at a
 * 308 redirect.
 */
export function withTrailingSlash(path: string): string {
  if (path === '' || path === '/') {
    return '/';
  }

  return path.endsWith('/') ? path : `${path}/`;
}

export function generateCanonicalUrl(baseUrl: string, path: string): string {
  const url = new URL(path, baseUrl);
  url.pathname = withTrailingSlash(url.pathname);
  return url.toString();
}
