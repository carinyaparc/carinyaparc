import { readFileSync } from 'node:fs';

export type RouteRenderMode = 'static' | 'isr' | 'dynamic';

export interface ParsedBuildRoute {
  path: string;
  symbol: string;
  mode: RouteRenderMode;
}

interface PrerenderManifestRoute {
  initialRevalidateSeconds?: number | false;
  srcRoute?: string;
}

interface PrerenderManifest {
  routes: Record<string, PrerenderManifestRoute>;
  dynamicRoutes?: Record<string, PrerenderManifestRoute>;
}

const BUILD_ROUTE_LINE_PATTERN = /^[┌├└]\s*([○●ƒℇλ])\s+(\S+)/;

const STATIC_BUILD_SYMBOLS = new Set(['○', '●']);
const DYNAMIC_BUILD_SYMBOLS = new Set(['ƒ', 'ℇ', 'λ']);

function normalizeRoutePath(routePath: string): string {
  if (routePath === '/') {
    return '/';
  }

  if (routePath.includes('[')) {
    return routePath.endsWith('/') ? routePath.slice(0, -1) : routePath;
  }

  return routePath.endsWith('/') ? routePath : `${routePath}/`;
}

function classifyBuildSymbol(symbol: string): RouteRenderMode {
  if (STATIC_BUILD_SYMBOLS.has(symbol)) {
    return 'static';
  }

  if (DYNAMIC_BUILD_SYMBOLS.has(symbol)) {
    return 'dynamic';
  }

  return 'dynamic';
}

export function parseBuildRouteTable(buildOutput: string): ParsedBuildRoute[] {
  const routes: ParsedBuildRoute[] = [];
  let inRouteTable = false;

  for (const line of buildOutput.split('\n')) {
    if (line.includes('Route (app)')) {
      inRouteTable = true;
      continue;
    }

    if (!inRouteTable) {
      continue;
    }

    if (line.trim() === '' || line.includes('Proxy (Middleware)')) {
      break;
    }

    const match = line.match(BUILD_ROUTE_LINE_PATTERN);
    if (!match) {
      continue;
    }

    const [, symbol, routePath] = match;
    if (!symbol || !routePath) {
      continue;
    }

    routes.push({
      path: normalizeRoutePath(routePath),
      symbol,
      mode: classifyBuildSymbol(symbol),
    });
  }

  return routes;
}

export function readPrerenderManifest(manifestPath: string): PrerenderManifest {
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as PrerenderManifest;
}

function manifestRouteMatchesPath(manifestRoute: string, routePath: string): boolean {
  const normalizedManifestRoute = normalizeRoutePath(manifestRoute);
  const normalizedRoutePath = normalizeRoutePath(routePath);

  if (normalizedManifestRoute === normalizedRoutePath) {
    return true;
  }

  const manifestWithoutTrailingSlash = normalizedManifestRoute.replace(/\/$/, '');
  const routeWithoutTrailingSlash = normalizedRoutePath.replace(/\/$/, '');

  return manifestWithoutTrailingSlash === routeWithoutTrailingSlash;
}

export function getManifestRouteMode(
  manifest: PrerenderManifest,
  routePath: string,
): RouteRenderMode | null {
  for (const [manifestRoute, config] of Object.entries(manifest.routes)) {
    const candidatePath = config.srcRoute ?? manifestRoute;
    if (!manifestRouteMatchesPath(candidatePath, routePath)) {
      continue;
    }

    if (
      typeof config.initialRevalidateSeconds === 'number' &&
      config.initialRevalidateSeconds > 0
    ) {
      return 'isr';
    }

    return 'static';
  }

  if (manifest.dynamicRoutes) {
    for (const [manifestRoute, config] of Object.entries(manifest.dynamicRoutes)) {
      if (!manifestRouteMatchesPath(manifestRoute, routePath)) {
        continue;
      }

      if (
        typeof config.initialRevalidateSeconds === 'number' &&
        config.initialRevalidateSeconds > 0
      ) {
        return 'isr';
      }

      return 'static';
    }
  }

  return null;
}

export function resolveRouteRenderMode(
  buildRoutes: ParsedBuildRoute[],
  manifest: PrerenderManifest | null,
  routePath: string,
): RouteRenderMode {
  const normalizedPath = normalizeRoutePath(routePath);
  const manifestMode = manifest ? getManifestRouteMode(manifest, normalizedPath) : null;

  if (manifestMode) {
    return manifestMode;
  }

  const buildRoute = buildRoutes.find((route) => route.path === normalizedPath);
  return buildRoute?.mode ?? 'dynamic';
}

export function isStaticOrIsr(mode: RouteRenderMode): boolean {
  return mode === 'static' || mode === 'isr';
}
