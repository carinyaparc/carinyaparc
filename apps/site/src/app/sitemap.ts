import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { BASE_URL } from '../lib/constants';

type RouteInfo = {
  route: string;
  lastModified: string;
  priority?: number;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
};

/**
 * Gets routes from the content directory
 */
function getContentRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const contentDirectory = path.join(process.cwd(), 'content');

  // Skip if content directory doesn't exist
  if (!fs.existsSync(contentDirectory)) {
    return routes;
  }

  // Helper function to recursively scan content directories
  function scanContentDirectory(currentPath: string, routePath: string = '') {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      // Skip hidden files/directories
      if (item.startsWith('.')) continue;

      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // Regular directory - add to path and scan
        const newPath = routePath === '' ? item : path.join(routePath, item);
        scanContentDirectory(itemPath, newPath);
      } else if (item === 'index.mdx' || item === 'index.md') {
        // Found a content page - add its route
        routes.push({
          route: routePath === '' ? '/' : `/${routePath}`,
          lastModified: new Date(stats.mtime).toISOString(),
          priority: routePath === '' ? 1.0 : routePath.includes('blog') ? 0.7 : 0.8,
          changeFrequency:
            routePath === '' ? 'weekly' : routePath.includes('blog') ? 'daily' : 'monthly',
        });
      } else if ((item.endsWith('.mdx') || item.endsWith('.md')) && !item.startsWith('index')) {
        // Non-index mdx/md file - add as a slug
        const slug = item.replace(/\.mdx?$/, '');
        const fullPath = routePath === '' ? slug : `${routePath}/${slug}`;

        routes.push({
          route: `/${fullPath}`,
          lastModified: new Date(stats.mtime).toISOString(),
          priority: routePath.includes('blog') ? 0.7 : 0.8,
          changeFrequency: routePath.includes('blog') ? 'daily' : 'monthly',
        });
      }
    }
  }

  scanContentDirectory(contentDirectory);
  return routes;
}

/**
 * Scans the app directory to discover static routes (excluding catch-all routes)
 */
function getAppRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const appDirectory = path.join(process.cwd(), 'src/app');

  // Helper function to recursively scan directories
  function scanDirectory(currentPath: string, routePath: string = '') {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      // Skip special files and directories
      if (
        item.startsWith('_') ||
        item.startsWith('.') ||
        item.startsWith('[') || // Skip dynamic routes with brackets
        item === 'api' ||
        item === 'sitemap.ts'
      )
        continue;

      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // Handle route groups (directories with parentheses)
        if (item.startsWith('(') && item.endsWith(')')) {
          // For route groups, don't add to the path but scan inside
          scanDirectory(itemPath, routePath);
        } else {
          // Regular directory - add to path and scan
          const newPath = routePath === '' ? item : path.join(routePath, item);
          scanDirectory(itemPath, newPath);
        }
      } else if (item === 'page.tsx' || item === 'page.js' || item === 'page.mdx') {
        // Found a page - add its route
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

/**
 * Combine and deduplicate routes
 */
function combineRoutes(appRoutes: RouteInfo[], contentRoutes: RouteInfo[]): RouteInfo[] {
  const routeMap = new Map<string, RouteInfo>();

  // Add app routes first
  appRoutes.forEach((route) => {
    routeMap.set(route.route, route);
  });

  // Add content routes, overriding app routes if they exist
  contentRoutes.forEach((route) => {
    routeMap.set(route.route, route);
  });

  return Array.from(routeMap.values());
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appRoutes = getAppRoutes();
  const contentRoutes = getContentRoutes();
  const routes = combineRoutes(appRoutes, contentRoutes);

  // Convert to the expected MetadataRoute.Sitemap format
  return routes.map(({ route, lastModified, priority, changeFrequency }) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    priority,
    changeFrequency,
  }));
}
