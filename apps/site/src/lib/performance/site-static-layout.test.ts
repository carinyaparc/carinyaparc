import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SITE_ROOT = path.resolve(import.meta.dirname, '../../..');
const LAYOUTS_DIR = path.join(SITE_ROOT, 'src/components/layouts');
const BLOG_SECTIONS_DIR = path.join(SITE_ROOT, 'src/components/sections/blog');

const DYNAMIC_REQUEST_API_PATTERN =
  /\b(cookies|headers|draftMode)\s*\(|from\s+['"]next\/headers['"]/;

const FORCE_DYNAMIC_EXPORT_PATTERN = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/;

describe('static public root layout', () => {
  it('does not use dynamic request APIs in site-root-layout', () => {
    const source = readFileSync(path.join(LAYOUTS_DIR, 'site-root-layout.tsx'), 'utf8');

    expect(source).not.toMatch(DYNAMIC_REQUEST_API_PATTERN);
  });

  it('renders ConsentGate from the public root layout', () => {
    const source = readFileSync(path.join(LAYOUTS_DIR, 'site-root-layout.tsx'), 'utf8');

    expect(source).toContain('ConsentGate');
    expect(source).toMatch(/<ConsentGate\b/);
  });

  it('delegates html shell rendering to SiteStaticShell', () => {
    const rootLayout = readFileSync(path.join(LAYOUTS_DIR, 'site-root-layout.tsx'), 'utf8');
    const staticShell = readFileSync(path.join(LAYOUTS_DIR, 'site-static-shell.tsx'), 'utf8');

    expect(rootLayout).toContain('SiteStaticShell');
    expect(staticShell).not.toMatch(DYNAMIC_REQUEST_API_PATTERN);
    expect(staticShell).toMatch(/<html\b/);
    expect(staticShell).toMatch(/<body\b/);
  });
});

describe('blog section rendering mode', () => {
  it('LatestPosts does not force dynamic rendering', () => {
    const source = readFileSync(path.join(BLOG_SECTIONS_DIR, 'LatestPosts.tsx'), 'utf8');

    expect(source).not.toMatch(FORCE_DYNAMIC_EXPORT_PATTERN);
  });

  it('FeaturedPosts does not force dynamic rendering', () => {
    const source = readFileSync(path.join(BLOG_SECTIONS_DIR, 'FeaturedPosts.tsx'), 'utf8');

    expect(source).not.toMatch(FORCE_DYNAMIC_EXPORT_PATTERN);
  });
});
