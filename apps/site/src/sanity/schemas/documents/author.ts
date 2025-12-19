/**
 * Author Document Schema
 *
 * Defines the Author content type for Sanity CMS.
 * Authors are referenced by blog posts and recipes for consistent attribution.
 *
 * Requirements: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007
 *
 * @module sanity/schemas/documents/author
 */

import { defineField, defineType } from 'sanity';
import type { SchemaTypeDefinition } from 'sanity';

/**
 * Author schema definition
 *
 * Fields:
 * - name: Full author name (required, 2-100 chars)
 * - slug: URL-friendly identifier (required, auto-generated from name, unique)
 * - bio: Biographical text (optional, plain text)
 * - image: Profile photo (required, with alt text for accessibility)
 *
 * Validation:
 * - Name, slug, and image are required (FR-006)
 * - Slug uniqueness enforced via async validation (FR-003)
 * - Image alt text required for accessibility (FR-004, NFR-004)
 *
 * Preview: Shows author name and profile image (FR-005)
 */
export const authorSchema: SchemaTypeDefinition = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Full name of the author (e.g., "Jonno Daddia")',
      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(100)
          .error('Name must be between 2 and 100 characters'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL-friendly identifier (auto-generated from name). Used for author pages and content attribution.',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          // FR-003: Enforce slug uniqueness across all author documents
          if (!slug?.current) {
            return true; // Let required() rule handle empty case
          }

          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2023-01-01' });
          const id = document?._id?.replace(/^drafts\./, '');

          // Query for other authors with same slug
          const params = {
            slug: slug.current,
            id: id,
          };

          const query = `*[_type == "author" && slug.current == $slug && _id != $id][0]`;
          const result = await client.fetch(query, params);

          if (result) {
            return 'This slug is already in use by another author';
          }

          return true;
        }),
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      description:
        'Short biographical information about the author (optional). Plain text for now; can be upgraded to rich text in future.',
      rows: 4,
      // FR-007: Bio is optional
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      description: 'Author profile photo (required). Use a clear headshot or portrait.',
      options: {
        hotspot: true, // Enable smart cropping for different aspect ratios
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description:
            'Describe the image for screen readers and SEO (e.g., "Portrait of Jonno Daddia")',
          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(200)
              .error('Alt text must be between 5 and 200 characters for accessibility'),
        },
      ],
      validation: (Rule) => Rule.required().error('Profile image is required'),
    }),
  ],
  preview: {
    // FR-005: Configure preview with author name and image
    select: {
      title: 'name',
      media: 'image',
    },
  },
});

