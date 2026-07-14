import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parsePostSeed,
  parseRecipeSeed,
  type PostSeed,
  type RecipeSeed,
} from './content-seed-schema';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '../..');
const seedsRoot = path.join(siteRoot, 'content', 'seeds');

type CollectionSlug = 'posts' | 'recipes';

function inferCollection(filePath: string): CollectionSlug {
  if (filePath.includes(`${path.sep}recipes${path.sep}`)) return 'recipes';
  return 'posts';
}

export async function listSeedFiles(singleFile?: string): Promise<string[]> {
  if (singleFile) {
    return [path.resolve(singleFile)];
  }

  const collections: CollectionSlug[] = ['posts', 'recipes'];
  const files: string[] = [];

  for (const collection of collections) {
    const dir = path.join(seedsRoot, collection);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.endsWith('.json')) {
        files.push(path.join(dir, entry));
      }
    }
  }

  return files.sort();
}

export async function loadSeed(
  filePath: string,
): Promise<{ collection: CollectionSlug; seed: PostSeed | RecipeSeed }> {
  const raw = JSON.parse(await readFile(filePath, 'utf8'));
  const collection = inferCollection(filePath);

  if (collection === 'posts') {
    return { collection, seed: parsePostSeed(raw) };
  }

  return { collection, seed: parseRecipeSeed(raw) };
}

export async function validateAllSeeds(singleFile?: string): Promise<number> {
  const files = await listSeedFiles(singleFile);

  if (files.length === 0) {
    return 0;
  }

  for (const file of files) {
    await loadSeed(file);
    console.log(`✓ ${path.relative(siteRoot, file)}`);
  }

  return files.length;
}
