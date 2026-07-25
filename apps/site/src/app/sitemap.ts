import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

import { BASE_URL } from '../lib/constants';
import { withTrailingSlash } from '@/lib/metadata/canonical';
import { getCategorySitemapEntries } from '@/lib/payload/queries/categories';
import { getPostSitemapEntries } from '@/lib/payload/queries/sitemap-posts';
import { getRecipeSitemapEntries } from '@/lib/payload/queries/recipes';
import type { ContentRouteEntry } from '@/lib/payload/map-content';

type RouteInfo = ContentRouteEntry;

/**
 * Legal pages remain MDX-backed in Phase 1.
 */
function getLegalContentRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const legalDirectory = path.join(process.cwd(), 'content', 'legal');

  if (!fs.existsSync(legalDirectory)) {
    return routes;
  }

  const files = fs.readdirSync(legalDirectory);

  for (const item of files) {
    if (item.startsWith('.')) {
      continue;
    }

    const itemPath = path.join(legalDirectory, item);
    const stats = fs.statSync(itemPath);

    if (!stats.isFile() || (!item.endsWith('.mdx') && !item.endsWith('.md'))) {
      continue;
    }

    const slug = item.replace(/\.mdx?$/, '');
    routes.push({
      route: `/legal/${slug}`,
      lastModified: new Date(stats.mtime).toISOString(),
      priority: 0.5,
      changeFrequency: 'yearly',
    });
  }

  return routes;
}

/**
 * Scans the app directory to discover static routes (excluding catch-all routes)
 */
function getAppRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const appDirectory = path.join(process.cwd(), 'src/app');

  function scanDirectory(currentPath: string, routePath: string = '') {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      if (
        item.startsWith('_') ||
        item.startsWith('.') ||
        item.startsWith('[') ||
        item === 'api' ||
        item === 'sitemap.ts'
      ) {
        continue;
      }

      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        if (item.startsWith('(') && item.endsWith(')')) {
          scanDirectory(itemPath, routePath);
        } else {
          const newPath = routePath === '' ? item : path.join(routePath, item);
          scanDirectory(itemPath, newPath);
        }
      } else if (item === 'page.tsx' || item === 'page.js' || item === 'page.mdx') {
        const isHomePage = routePath === '';

        routes.push({
          route: isHomePage ? '/' : `/${routePath}`,
          lastModified: new Date(stats.mtime).toISOString(),
          priority: isHomePage ? 1.0 : routePath.includes('blog') ? 0.7 : 0.8,
          changeFrequency: isHomePage ? 'weekly' : routePath.includes('blog') ? 'daily' : 'monthly',
        });
      }
    }
  }

  scanDirectory(appDirectory);
  return routes;
}

function combineRoutes(...routeGroups: RouteInfo[][]): RouteInfo[] {
  const routeMap = new Map<string, RouteInfo>();

  for (const group of routeGroups) {
    for (const route of group) {
      routeMap.set(route.route, route);
    }
  }

  return Array.from(routeMap.values());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postRoutes, recipeRoutes, categoryRoutes] = await Promise.all([
    getPostSitemapEntries(),
    getRecipeSitemapEntries(),
    getCategorySitemapEntries(),
  ]);

  const routes = combineRoutes(
    getAppRoutes(),
    getLegalContentRoutes(),
    postRoutes,
    recipeRoutes,
    categoryRoutes,
  );

  return routes.map(({ route, lastModified, priority, changeFrequency }) => ({
    // Trailing slash matches next.config trailingSlash: true, so crawlers are
    // never sent through a 308 redirect.
    url: `${BASE_URL}${withTrailingSlash(route)}`,
    lastModified,
    priority,
    changeFrequency,
  }));
}
