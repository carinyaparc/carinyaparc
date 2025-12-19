/**
 * Author Type Definitions
 *
 * TypeScript interfaces for Author documents and data structures.
 * Used throughout the application for type-safe author data handling.
 *
 * @module types/author
 */

import type { SanityImageObject } from '@/sanity/lib/image';

/**
 * Author document type as stored in Sanity
 *
 * This is the raw document structure returned from Sanity's Content Lake.
 * Includes all Sanity system fields (_id, _type, _createdAt, _updatedAt).
 */
export interface Author {
  _id: string;
  _type: 'author';
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  bio?: string;
  image: SanityImageObject;
}

/**
 * Author data as queried from Sanity (denormalized)
 *
 * This is the typical structure returned from GROQ queries where slug.current
 * is denormalized and image asset references are expanded.
 * Used for rendering author information on pages.
 */
export interface AuthorData {
  _id: string;
  name: string;
  slug: string; // Denormalized from slug.current
  bio?: string;
  image: {
    asset: {
      _id: string;
      url: string;
      metadata?: {
        dimensions: {
          width: number;
          height: number;
          aspectRatio: number;
        };
        lqip?: string; // Low Quality Image Placeholder
      };
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
    alt: string;
  };
}

/**
 * Author reference as stored in post/recipe documents
 *
 * This is how author documents are referenced in other content types.
 * The _ref field contains the author document's _id.
 */
export interface AuthorReference {
  _ref: string;
  _type: 'reference';
}
