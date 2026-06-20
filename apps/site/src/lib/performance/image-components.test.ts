import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SITE_ROOT = path.resolve(import.meta.dirname, '../../..');

function walkForRawImgTags(dir: string, matches: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const info = statSync(fullPath);

    if (info.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') {
        continue;
      }
      walkForRawImgTags(fullPath, matches);
      continue;
    }

    if (!/\.(tsx|jsx|mdx)$/.test(entry) || entry.endsWith('.test.tsx')) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf8');
    if (/<img\b/.test(content)) {
      matches.push(path.relative(SITE_ROOT, fullPath));
    }
  }

  return matches;
}

describe('image rendering conventions', () => {
  it('routes Payload rich-text uploads through next/image', () => {
    const source = readFileSync(
      path.join(SITE_ROOT, 'src/lib/rich-text/jsx-converters.tsx'),
      'utf8',
    );

    expect(source).toContain("from 'next/image'");
    expect(source).not.toMatch(/<img\b/);
  });

  it('maps MDX markdown images to next/image', () => {
    const mdxComponents = readFileSync(path.join(SITE_ROOT, 'mdx-components.tsx'), 'utf8');
    const mdxImage = readFileSync(path.join(SITE_ROOT, 'src/components/mdx/MdxImage.tsx'), 'utf8');

    expect(mdxComponents).toContain('MdxImage');
    expect(mdxImage).toContain("from 'next/image'");
    expect(mdxImage).not.toMatch(/<img\b/);
  });

  it('does not use raw img tags in application source', () => {
    expect(walkForRawImgTags(path.join(SITE_ROOT, 'src'))).toEqual([]);
    expect(walkForRawImgTags(path.join(SITE_ROOT, 'content'))).toEqual([]);
  });
});
