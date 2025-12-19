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

/**
 * Array of all schema type definitions for Sanity Studio
 *
 * Initially empty - will be populated with content type schemas:
 * - Post schema
 * - Recipe schema
 * - Author schema
 * - Category schema
 * - Tag schema
 * - Legal Page schema
 * - Site Settings schema
 * - Portable Text schema
 * - Recipe Ingredient schema
 * - SEO schema
 *
 * @example
 * ```typescript
 * import { postSchema } from './documents/post'
 * import { authorSchema } from './documents/author'
 *
 * export const schemaTypes: SchemaTypeDefinition[] = [
 *   postSchema,
 *   authorSchema,
 *   // ... other schemas
 * ]
 * ```
 */
export const schemaTypes: SchemaTypeDefinition[] = [];
