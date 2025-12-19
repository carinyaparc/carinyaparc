/**
 * Sanity Schema Type Registry
 *
 * Central registry for all Sanity schema type definitions.
 * This file exports the schema types array used by sanity.config.ts.
 *
 * Schema types will be imported and registered here as they are created.
 *
 * @module sanity/schemas
 */

import type { SchemaTypeDefinition } from 'sanity';

import { authorSchema } from './documents/author';
import { categorySchema } from './documents/category';
import { postSchema } from './documents/post';
import { tagSchema } from './documents/tag';

/**
 * Array of all schema type definitions for Sanity Studio
 *
 * Defined schemas:
 * - Author schema
 * - Category schema
 * - Tag schema
 * - Post schema
 */

export const schemaTypes: SchemaTypeDefinition[] = [
  // Document schemas
  authorSchema,
  categorySchema,
  postSchema,
  tagSchema,
];
