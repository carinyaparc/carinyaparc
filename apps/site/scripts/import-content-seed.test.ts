import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { parsePostSeed, parseRecipeSeed } from './lib/content-seed-schema';
import { listSeedFiles, loadSeed } from './lib/validate-seeds';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const seedsRoot = path.join(scriptDir, '..', 'content', 'seeds');

describe('content seed schema', () => {
  it('accepts a valid post seed shape', () => {
    const seed = parsePostSeed({
      slug: 'winter-soil-care',
      title: 'Winter Soil Care',
      date: '2026-07-15',
      author: 'jonno',
      excerpt: 'How we prepare soil through the winter months.',
      body: '## Introduction\n\nContent here.',
    });

    expect(seed.slug).toBe('winter-soil-care');
  });

  it('accepts a valid recipe seed shape', () => {
    const seed = parseRecipeSeed({
      slug: 'winter-root-stew',
      title: 'Winter Root Stew',
      date: '2026-07-20',
      author: 'jonno',
      prepTime: 'PT15M',
      cookTime: 'PT45M',
      totalTime: 'PT60M',
      excerpt: 'Hearty winter stew.',
      ingredients: [{ item: '500 g root vegetables' }],
      instructions: [{ step: 'Dice vegetables.' }],
    });

    expect(seed.difficulty).toBeUndefined();
  });

  it('rejects invalid slug format', () => {
    expect(() =>
      parsePostSeed({
        slug: 'Invalid Slug',
        title: 'Test',
        date: '2026-07-15',
        author: 'jonno',
        excerpt: 'Test excerpt for validation.',
        body: 'Body',
      }),
    ).toThrow();
  });
});

describe('committed seed files', () => {
  it('validates all JSON seeds under content/seeds/', async () => {
    const files = await listSeedFiles();
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      await loadSeed(file);
    }
  });
});
