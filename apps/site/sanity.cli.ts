/**
 * Sanity CLI Configuration
 *
 * This file configures the Sanity CLI for command-line operations like
 * schema deployment, migrations, and dataset management.
 *
 * Separate from sanity.config.ts which configures the embedded Studio.
 *
 * @module sanity.cli
 */

import { defineCliConfig } from 'sanity/cli';

/**
 * Sanity CLI Configuration
 *
 * Used by CLI commands:
 * - pnpm sanity deploy - Deploy Studio
 * - pnpm sanity dataset - Manage datasets
 * - pnpm sanity migration - Run migrations
 * - pnpm sanity typegen - Generate TypeScript types
 *
 * Note: Requires authentication via `pnpm sanity login` before use
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  },
});
