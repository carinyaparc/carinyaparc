/**
 * Sanity Studio Configuration
 *
 * This file configures the Sanity Studio embedded at /studio route.
 * It defines project settings, enabled plugins, and registers content schemas.
 *
 * @module sanity.config
 */

import { defineConfig } from 'sanity';
import type { Config } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { presentationTool } from 'sanity/presentation';

// Import Sanity client configuration
import { projectId, dataset, apiVersion } from './src/sanity/lib/api';

// Import schema types
import { schemaTypes } from './src/sanity/schemas';

/**
 * Site URL for preview mode in presentation tool
 * Defaults to localhost for development
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Sanity Studio Configuration
 *
 * Defines the embedded CMS at /studio with essential plugins:
 * - Structure Tool: Content organization and editing
 * - Vision Tool: GROQ query testing and debugging
 * - Presentation Tool: Visual editing with live preview
 */
const config: Config = defineConfig({
  // Project identification
  projectId,
  dataset,

  // Studio workspace configuration
  name: 'carinya-parc',
  title: 'Carinya Parc CMS',

  // Embed studio at /studio route
  basePath: '/studio',

  // API version in YYYY-MM-DD format
  apiVersion,

  // Studio plugins
  plugins: [
    // Content organization and management
    structureTool(),

    // GROQ query testing environment
    visionTool({
      defaultApiVersion: apiVersion,
      defaultDataset: dataset,
    }),

    // Visual editing with live preview
    presentationTool({
      previewUrl: {
        origin: siteUrl,
        previewMode: {
          enable: '/api/draft',
        },
      },
      name: 'presentation',
      title: 'Visual Editor',
    }),
  ],

  // Schema type registration
  schema: {
    types: schemaTypes,
  },
});

export default config;
