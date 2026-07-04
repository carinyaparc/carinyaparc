import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ORGANIZATION_SCHEMA_JSON } from '@/lib/schema/organization-json';
import {
  isStaticOrIsr,
  parseBuildRouteTable,
  readPrerenderManifest,
  resolveRouteRenderMode,
} from '@/lib/performance/parse-build-routes';

const SITE_ROOT = path.resolve(import.meta.dirname, '../../..');
const BUILD_MANIFEST_PATH = path.join(SITE_ROOT, '.next/prerender-manifest.json');

const KEY_CONTENT_ROUTES = ['/', '/blog/', '/blog/[slug]', '/recipes/', '/recipes/[slug]'] as const;

const SAMPLE_BUILD_OUTPUT = `
Route (app)                                                 Revalidate  Expire
┌ ○ /                                                             1d      1y
├ ○ /blog                                                         1d      1y
├ ● /blog/[slug]                                                  1d      1y
├ ƒ /api/consent
└ ○ /sitemap.xml

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
`;

function loadProductionBuildManifest(): ReturnType<typeof readPrerenderManifest> {
  if (!existsSync(BUILD_MANIFEST_PATH)) {
    throw new Error(
      'Missing .next/prerender-manifest.json. Run `pnpm site:build` before this test suite.',
    );
  }

  return readPrerenderManifest(BUILD_MANIFEST_PATH);
}

describe('parseBuildRouteTable', () => {
  it('extracts route symbols and paths from next build output', () => {
    const routes = parseBuildRouteTable(SAMPLE_BUILD_OUTPUT);

    expect(routes).toEqual([
      { path: '/', symbol: '○', mode: 'static' },
      { path: '/blog/', symbol: '○', mode: 'static' },
      { path: '/blog/[slug]', symbol: '●', mode: 'static' },
      { path: '/api/consent/', symbol: 'ƒ', mode: 'dynamic' },
      { path: '/sitemap.xml/', symbol: '○', mode: 'static' },
    ]);
  });

  it('treats ISR manifest entries as static or ISR even when absent from stdout', () => {
    const manifest = {
      routes: {
        '/blog': {
          initialRevalidateSeconds: 86_400,
          srcRoute: '/blog',
        },
      },
    };

    expect(resolveRouteRenderMode([], manifest, '/blog/')).toBe('isr');
    expect(isStaticOrIsr(resolveRouteRenderMode([], manifest, '/blog/'))).toBe(true);
  });
});

describe('organization schema CSP hash', () => {
  it('matches the CSP allowlist hash for the static layout JSON-LD script', () => {
    const hash = createHash('sha256').update(ORGANIZATION_SCHEMA_JSON).digest('base64');
    const constants = readFileSync(path.join(SITE_ROOT, 'src/lib/security/constants.ts'), 'utf8');

    expect(constants).toContain(`'sha256-${hash}'`);
  });
});

describe.skipIf(!existsSync(BUILD_MANIFEST_PATH))('production build route classification', () => {
  it.each(KEY_CONTENT_ROUTES)('marks %s as static or ISR in the build route table', (routePath) => {
    const manifest = loadProductionBuildManifest();
    const mode = resolveRouteRenderMode([], manifest, routePath);

    expect(isStaticOrIsr(mode)).toBe(true);
    expect(mode).not.toBe('dynamic');
  });
});
