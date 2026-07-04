#!/usr/bin/env tsx
/**
 * Import content seed JSON into Payload as drafts.
 *
 * Usage:
 *   pnpm --filter site import:content-seeds [--validate-only] [--file path.json]
 *
 * Requires DATABASE_URL and PAYLOAD_SECRET for import (not for --validate-only).
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical';
import config from '@payload-config';
import { getPayload } from 'payload';

import {
  parsePostSeed,
  parseRecipeSeed,
  type PostSeed,
  type RecipeSeed,
} from './lib/content-seed-schema';
import {
  resolveAuthorId,
  resolveCategoryId,
  resolveTagIds,
} from './lib/resolve-relationships';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '..');
const seedsRoot = path.join(siteRoot, 'content', 'seeds');

type CollectionSlug = 'posts' | 'recipes';

interface CliOptions {
  validateOnly: boolean;
  file?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { validateOnly: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--validate-only') {
      options.validateOnly = true;
    } else if (arg === '--file') {
      options.file = argv[i + 1];
      i += 1;
    }
  }

  return options;
}

function inferCollection(filePath: string): CollectionSlug {
  if (filePath.includes(`${path.sep}recipes${path.sep}`)) return 'recipes';
  return 'posts';
}

async function listSeedFiles(singleFile?: string): Promise<string[]> {
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

async function loadSeed(filePath: string): Promise<{ collection: CollectionSlug; seed: PostSeed | RecipeSeed }> {
  const raw = JSON.parse(await readFile(filePath, 'utf8'));
  const collection = inferCollection(filePath);

  if (collection === 'posts') {
    return { collection, seed: parsePostSeed(raw) };
  }

  return { collection, seed: parseRecipeSeed(raw) };
}

async function findExistingDoc(payload: Awaited<ReturnType<typeof getPayload>>, collection: CollectionSlug, slug: string) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  return result.docs[0] ?? null;
}

async function importPost(
  payload: Awaited<ReturnType<typeof getPayload>>,
  editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>>,
  seed: PostSeed,
): Promise<'created' | 'updated' | 'unchanged'> {
  const body = convertMarkdownToLexical({
    editorConfig,
    markdown: seed.body,
  });

  const data = {
    title: seed.title,
    slug: seed.slug,
    date: seed.date,
    author: await resolveAuthorId(payload, seed.author),
    category: await resolveCategoryId(payload, seed.category),
    tags: await resolveTagIds(payload, seed.tags),
    featured: seed.featured ?? false,
    excerpt: seed.excerpt,
    description: seed.description,
    image: seed.image,
    body,
  };

  const existing = await findExistingDoc(payload, 'posts', seed.slug);

  if (existing) {
    await payload.update({
      collection: 'posts',
      id: existing.id,
      data,
      draft: true,
    });
    return 'updated';
  }

  await payload.create({
    collection: 'posts',
    data,
    draft: true,
  });
  return 'created';
}

async function importRecipe(
  payload: Awaited<ReturnType<typeof getPayload>>,
  seed: RecipeSeed,
): Promise<'created' | 'updated' | 'unchanged'> {
  const data = {
    title: seed.title,
    slug: seed.slug,
    date: seed.date,
    author: await resolveAuthorId(payload, seed.author),
    difficulty: seed.difficulty,
    servings: seed.servings,
    prepTime: seed.prepTime,
    cookTime: seed.cookTime,
    totalTime: seed.totalTime,
    excerpt: seed.excerpt,
    description: seed.description,
    image: seed.image,
    tags: await resolveTagIds(payload, seed.tags),
    ingredients: seed.ingredients,
    instructions: seed.instructions,
  };

  const existing = await findExistingDoc(payload, 'recipes', seed.slug);

  if (existing) {
    await payload.update({
      collection: 'recipes',
      id: existing.id,
      data,
      draft: true,
    });
    return 'updated';
  }

  await payload.create({
    collection: 'recipes',
    data,
    draft: true,
  });
  return 'created';
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const files = await listSeedFiles(options.file);

  if (files.length === 0) {
    console.log('No seed files found.');
    return;
  }

  if (options.validateOnly) {
    for (const file of files) {
      await loadSeed(file);
      console.log(`✓ ${path.relative(siteRoot, file)}`);
    }
    console.log(`Validated ${files.length} seed file(s).`);
    return;
  }

  const payload = await getPayload({ config });
  const editorConfig = await editorConfigFactory.default({
    config: payload.config,
  });

  for (const file of files) {
    const { collection, seed } = await loadSeed(file);
    const rel = path.relative(siteRoot, file);

    const result =
      collection === 'posts'
        ? await importPost(payload, editorConfig, seed as PostSeed)
        : await importRecipe(payload, seed as RecipeSeed);

    console.log(`${result}: ${rel} → ${collection}/${seed.slug} (draft)`);
  }

  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
