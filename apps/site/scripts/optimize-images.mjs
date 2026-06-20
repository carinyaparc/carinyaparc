#!/usr/bin/env node
/**
 * Batch-compress photography under public/images/ for production routes.
 * Uses sharp (already a site dependency). Run from repo root:
 *   node apps/site/scripts/optimize-images.mjs
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, '../public/images');

const HERO_FILENAME = 'hero-home.jpg';
const HERO_MAX_BYTES = 300 * 1024;
const DEFAULT_MAX_BYTES = 500 * 1024;
const RASTER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function listRasterFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRasterFiles(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (RASTER_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function compressToBudget(inputPath, maxBytes) {
  const metadata = await sharp(inputPath).metadata();
  const maxWidth = path.basename(inputPath) === HERO_FILENAME ? 1920 : 2400;

  let width = metadata.width ?? maxWidth;
  if (width > maxWidth) {
    width = maxWidth;
  }

  let quality = 82;

  while (quality >= 40) {
    const buffer = await sharp(inputPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (buffer.length <= maxBytes) {
      return { buffer, quality, width };
    }

    quality -= 5;
  }

  const buffer = await sharp(inputPath)
    .rotate()
    .resize({ width: Math.min(width, 1600), withoutEnlargement: true })
    .jpeg({ quality: 40, mozjpeg: true })
    .toBuffer();

  return { buffer, quality: 40, width: Math.min(width, 1600) };
}

async function main() {
  const files = await listRasterFiles(IMAGES_DIR);

  if (files.length === 0) {
    console.log('No raster images found under', IMAGES_DIR);
    return;
  }

  for (const filePath of files) {
    const before = (await stat(filePath)).size;
    const maxBytes = path.basename(filePath) === HERO_FILENAME ? HERO_MAX_BYTES : DEFAULT_MAX_BYTES;

    if (before <= maxBytes) {
      console.log(
        `${path.relative(IMAGES_DIR, filePath)}: ${before} bytes (already within budget)`,
      );
      continue;
    }

    const { buffer, quality, width } = await compressToBudget(filePath, maxBytes);
    await writeFile(filePath, buffer);

    const after = (await stat(filePath)).size;
    const label = path.relative(IMAGES_DIR, filePath);
    console.log(
      `${label}: ${before} -> ${after} bytes (q=${quality}, w<=${width}, budget ${maxBytes})`,
    );

    if (after > maxBytes) {
      console.error(`ERROR: ${label} still exceeds budget (${after} > ${maxBytes})`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
