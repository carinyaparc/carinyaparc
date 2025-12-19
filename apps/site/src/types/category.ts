/**
 * Category Type Definitions
 *
 * TypeScript interfaces for Category documents and data structures.
 * Used throughout the application for type-safe category data handling.
 *
 * Task: CP-04-002 (Category Taxonomy System)
 *
 * @module types/category
 */

/**
 * Content types that can be categorized
 */
export type ContentType = 'post' | 'recipe';

/**
 * Category document type as stored in Sanity
 *
 * This is the raw document structure returned from Sanity's Content Lake.
 * Includes all Sanity system fields (_id, _type, _createdAt, _updatedAt).
 */
export interface Category {
  _id: string;
  _type: 'category';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  description?: string;
  parent?: {
    _type: 'reference';
    _ref: string;
  };
  contentTypes: ContentType[];
}

/**
 * Category data as queried from Sanity (denormalized)
 *
 * This is the typical structure returned from GROQ queries where slug.current
 * is denormalized and parent references may be expanded.
 * Used for rendering category information on pages.
 */
export interface CategoryData {
  _id: string;
  title: string;
  slug: string; // Denormalized from slug.current
  description?: string;
  parent?: {
    _id: string;
    title: string;
    slug: string;
  };
  contentTypes: ContentType[];
}

/**
 * Category with full hierarchy path
 *
 * Extended category data that includes the full breadcrumb path from root to current category.
 * Used for display in category listings and navigation.
 */
export interface CategoryWithPath extends CategoryData {
  path: Array<{
    title: string;
    slug: string;
  }>;
}

/**
 * Category reference as stored in post/recipe documents
 *
 * This is how category documents are referenced in other content types.
 * The _ref field contains the category document's _id.
 */
export interface CategoryReference {
  _ref: string;
  _type: 'reference';
  _key?: string; // Optional key for array items
}
