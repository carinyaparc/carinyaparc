import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SITE_ROOT = path.resolve(import.meta.dirname, '../../..');
const SRC_ROOT = path.join(SITE_ROOT, 'src');
const APP_ROOT = path.join(SRC_ROOT, 'app');

// Static internal hrefs written as string literals in JSX.
const INTERNAL_HREF_PATTERN = /href="(\/[^"#?]*)"/g;

// Dynamic route prefixes whose slugs come from Payload/MDX, not the app tree.
const DYNAMIC_PREFIXES = ['/blog/', '/recipes/', '/legal/'];

/**
 * Derive the set of static routes from the app directory, mirroring how the
 * sitemap discovers pages: route groups collapse, dynamic segments and api
 * routes are skipped.
 */
function collectStaticRoutes(dir: string, routePath = '', acc = new Set<string>()): Set<string> {
  for (const entry of readdirSync(dir)) {
    if (
      entry.startsWith('_') ||
      entry.startsWith('.') ||
      entry.startsWith('[') ||
      entry === 'api'
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry);
    const info = statSync(fullPath);

    if (info.isDirectory()) {
      if (entry.startsWith('(') && entry.endsWith(')')) {
        collectStaticRoutes(fullPath, routePath, acc);
      } else {
        collectStaticRoutes(fullPath, `${routePath}/${entry}`, acc);
      }
      continue;
    }

    if (/^page\.(tsx|jsx|mdx)$/.test(entry)) {
      acc.add(routePath === '' ? '/' : routePath);
    }
  }

  return acc;
}

function collectInternalHrefs(
  dir: string,
  acc = new Map<string, string[]>(),
): Map<string, string[]> {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const info = statSync(fullPath);

    if (info.isDirectory()) {
      collectInternalHrefs(fullPath, acc);
      continue;
    }

    if (!/\.(tsx|jsx|mdx)$/.test(entry)) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf8');
    for (const match of content.matchAll(INTERNAL_HREF_PATTERN)) {
      const href = match[1]!;
      const files = acc.get(href) ?? [];
      files.push(path.relative(SRC_ROOT, fullPath));
      acc.set(href, files);
    }
  }

  return acc;
}

describe('internal links resolve to real routes', () => {
  const routes = collectStaticRoutes(APP_ROOT);
  const hrefs = new Map([
    ...collectInternalHrefs(APP_ROOT),
    ...collectInternalHrefs(path.join(SRC_ROOT, 'components')),
  ]);

  it('every literal internal href matches a page route or dynamic content prefix', () => {
    const broken: string[] = [];

    for (const [href, files] of hrefs) {
      const normalised = href.length > 1 ? href.replace(/\/$/, '') : href;

      if (routes.has(normalised)) {
        continue;
      }

      if (DYNAMIC_PREFIXES.some((prefix) => normalised.startsWith(prefix))) {
        continue;
      }

      broken.push(`${href} (in ${files.join(', ')})`);
    }

    expect(broken, `Broken internal links:\n${broken.join('\n')}`).toEqual([]);
  });
});
