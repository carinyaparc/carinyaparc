import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SITE_ROOT = path.resolve(import.meta.dirname, '../../..');
const SRC_ROOT = path.join(SITE_ROOT, 'src');
const IMAGES_DIR = path.join(SITE_ROOT, 'public/images');
const HOME_PAGE = path.join(SRC_ROOT, 'app/(www)/page.tsx');

const HERO_MAX_BYTES = 300 * 1024;
const DEFAULT_MAX_BYTES = 500 * 1024;

const IMAGE_PATH_PATTERN = /\/images\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)/g;
const PRIORITY_IMAGE_PATTERN =
  /<(Image|HeroBackgroundImage)\b[^>]*\bpriority(?:=\{true\}|(?=\s|\/|>))/g;

function collectImagePathsFromDir(dir: string, acc = new Set<string>()): Set<string> {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const info = statSync(fullPath);

    if (info.isDirectory()) {
      collectImagePathsFromDir(fullPath, acc);
      continue;
    }

    if (!/\.(tsx?|jsx?|mdx)$/.test(entry)) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf8');
    for (const match of content.matchAll(IMAGE_PATH_PATTERN)) {
      acc.add(match[0]);
    }
  }

  return acc;
}

describe('route-referenced photography assets', () => {
  const appPaths = collectImagePathsFromDir(path.join(SRC_ROOT, 'app'));
  const componentPaths = collectImagePathsFromDir(path.join(SRC_ROOT, 'components'));
  const referencedPaths = new Set([...appPaths, ...componentPaths]);

  it('hero-home.jpg is within the hero size budget', () => {
    const heroPath = path.join(IMAGES_DIR, 'hero-home.jpg');
    const { size } = statSync(heroPath);
    expect(size).toBeLessThanOrEqual(HERO_MAX_BYTES);
  });

  it('every route-referenced image is within the maximum size budget', () => {
    for (const publicPath of referencedPaths) {
      const filePath = path.join(SITE_ROOT, 'public', publicPath);
      const { size } = statSync(filePath);
      expect(size, `${publicPath} exceeds 500 KB`).toBeLessThanOrEqual(DEFAULT_MAX_BYTES);
    }
  });
});

describe('home page LCP image loading', () => {
  it('declares exactly one priority image', () => {
    const content = readFileSync(HOME_PAGE, 'utf8');
    const priorityUsages = content.match(PRIORITY_IMAGE_PATTERN) ?? [];
    expect(priorityUsages).toHaveLength(1);
  });
});
