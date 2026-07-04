#!/usr/bin/env tsx
/**
 * Validate content seed JSON (no database required).
 *
 * Usage: tsx scripts/validate-content-seeds.ts [--file path.json]
 */
import { validateAllSeeds } from './lib/validate-seeds';

function parseArgs(argv: string[]): { file?: string } {
  const options: { file?: string } = {};

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--file') {
      options.file = argv[i + 1];
      i += 1;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const count = await validateAllSeeds(options.file);

  if (count === 0) {
    console.log('No seed files found.');
    return;
  }

  console.log(`Validated ${count} seed file(s).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
