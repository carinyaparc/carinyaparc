/**
 * Category Document Schema
 *
 * Defines the Category content type for Sanity CMS.
 * Categories provide hierarchical taxonomy for organizing posts, recipes, and other content.
 *
 * Requirements: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008
 * Task: CP-04-002 (Category Taxonomy System)
 *
 * @module sanity/schemas/documents/category
 */

import { defineField, defineType } from 'sanity';
import type { SchemaTypeDefinition } from 'sanity';

/**
 * Category schema definition
 *
 * Fields:
 * - title: Category name (required, 1-100 chars) (FR-001)
 * - slug: URL-friendly identifier (required, auto-generated from title, unique) (FR-002, FR-008)
 * - description: Optional category description (FR-001)
 * - parent: Optional parent category for hierarchical organization (FR-003)
 * - contentTypes: Array of content types this category applies to (FR-004)
 *
 * Validation:
 * - Title required (1-100 chars) (FR-001)
 * - Slug uniqueness enforced via async validation (FR-002, FR-008)
 * - At least one content type must be selected (FR-004)
 * - Circular reference prevention for parent category (FR-003)
 *
 * Preview: Shows category title with hierarchy breadcrumb and content type badges (FR-006, FR-007)
 */
export const categorySchema: SchemaTypeDefinition = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Category name (e.g., "Sustainability", "Recipes", "Regenerative Agriculture")',
      validation: (Rule) =>
        Rule.required().min(1).max(100).error('Title must be between 1 and 100 characters'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL-friendly identifier (auto-generated from title). Used for category pages and filtering.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          // FR-008: Enforce slug uniqueness across all category documents
          if (!slug?.current) {
            return true; // Let required() rule handle empty case
          }

          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2025-01-01' });
          const id = document?._id?.replace(/^drafts\./, '');

          // Query for other categories with same slug
          const params = {
            slug: slug.current,
            id: id,
          };

          const query = `*[_type == "category" && slug.current == $slug && _id != $id][0]`;
          const result = await client.fetch(query, params);

          if (result) {
            return 'This slug is already in use by another category';
          }

          return true;
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description:
        'Short description of what this category contains (optional). Helps editors understand category purpose and improves SEO.',
      rows: 3,
      validation: (Rule) => Rule.max(500).error('Description must be 500 characters or less'),
      // FR-001: Description is optional
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description:
        'Optional parent category for hierarchical organization (e.g., "Regenerative Agriculture" → "Soil Health")',
      options: {
        filter: ({ document }) => {
          // FR-003: Prevent self-reference and circular references
          const currentId = document?._id?.replace(/^drafts\./, '');
          return {
            filter: '_id != $id',
            params: { id: currentId },
          };
        },
        disableNew: true, // Prevent creating new categories from reference field
      },
      validation: (Rule) =>
        Rule.custom(async (parent, context) => {
          // FR-003: Detect circular references by traversing parent chain
          if (!parent || !parent._ref) {
            return true; // No parent is valid
          }

          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2025-01-01' });
          const currentId = document?._id?.replace(/^drafts\./, '');

          // Check if current category appears anywhere in parent's ancestor chain
          let checkId: string | null = parent._ref;
          const visited = new Set<string>(currentId ? [currentId] : []);
          let depth = 0;
          const maxDepth = 10; // Safety limit to prevent infinite loops

          while (checkId && depth < maxDepth) {
            if (visited.has(checkId)) {
              return 'Circular reference detected. A category cannot be its own ancestor.';
            }

            visited.add(checkId);
            const ancestor: { parentId?: string } | null = await client.fetch(
              `*[_type == "category" && _id == $id][0]{ "parentId": parent._ref }`,
              { id: checkId },
            );

            checkId = ancestor?.parentId || null;
            depth++;
          }

          if (depth >= maxDepth) {
            return 'Category hierarchy is too deep (max 10 levels). Consider restructuring your taxonomy.';
          }

          return true;
        }),
    }),
    defineField({
      name: 'contentTypes',
      title: 'Content Types',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Select which content types this category applies to. Categories will only appear when editing selected content types.',
      options: {
        list: [
          { title: 'Posts', value: 'post' },
          { title: 'Recipes', value: 'recipe' },
        ],
        layout: 'grid',
      },
      initialValue: ['post', 'recipe'], // FR-004: Default to all types for simplicity
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Select at least one content type')
          .unique()
          .error('Each content type can only be selected once'),
    }),
  ],
  preview: {
    // FR-006, FR-007: Configure preview with hierarchy breadcrumb and content type badges
    select: {
      title: 'title',
      parentTitle: 'parent.title',
      parentParentTitle: 'parent.parent.title',
      contentTypes: 'contentTypes',
    },
    prepare({
      title,
      parentTitle,
      parentParentTitle,
      contentTypes,
    }: {
      title: string;
      parentTitle?: string;
      parentParentTitle?: string;
      contentTypes?: string[];
    }) {
      // Build hierarchy breadcrumb (up to 3 levels shown)
      const breadcrumbs = [
        parentParentTitle && `${parentParentTitle}`,
        parentTitle && `${parentTitle}`,
        title,
      ]
        .filter(Boolean)
        .join(' > ');

      // Format content types as subtitle
      const typesLabel = contentTypes?.length
        ? `Applies to: ${contentTypes.map((t) => (t === 'post' ? 'Posts' : 'Recipes')).join(', ')}`
        : 'No content types selected';

      return {
        title: breadcrumbs,
        subtitle: typesLabel,
      };
    },
  },
});
