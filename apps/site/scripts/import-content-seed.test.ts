import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { parsePostSeed, parseRecipeSeed } from './lib/content-seed-schema';

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
    const collections = ['posts', 'recipes'] as const;

    for (const collection of collections) {
      const dir = path.join(seedsRoot, collection);
      let files: string[] = [];
      try {
        const { readdir } = await import('node:fs/promises');
        const entries = await readdir(dir);
        files = entries.filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f));
      } catch {
        continue;
      }

      for (const file of files) {
        const raw = JSON.parse(await readFile(file, 'utf8'));
        if (collection === 'posts') {
          parsePostSeed(raw);
        } else {
          parseRecipeSeed(raw);
        }
      }
    }

    expect(true).toBe(true);
  });
});
