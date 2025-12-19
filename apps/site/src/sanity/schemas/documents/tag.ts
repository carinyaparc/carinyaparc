/**
 * Tag Document Schema
 *
 * Defines the Tag content type for Sanity CMS.
 * Tags provide flat taxonomy for cross-referencing posts, recipes, and other content.
 *
 * @module sanity/schemas/documents/tag
 */

import { defineField, defineType } from 'sanity';
import type { SchemaTypeDefinition } from 'sanity';

/**
 * Tag schema definition
 *
 * Fields:
 * - title: Tag name (required, 1-50 chars)
 * - slug: URL-friendly identifier (required, auto-generated from title, unique)
 * - contentTypes: Array of content types this tag applies to
 *
 * Validation:
 * - Title required (1-50 chars)
 * - Slug uniqueness enforced via async validation
 * - At least one content type must be selected
 *
 * Preview: Shows tag title with content type scope badges
 */
export const tagSchema: SchemaTypeDefinition = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description:
        'Tag name (e.g., "Permaculture", "Winter Growing", "Fermentation"). Keep concise for best UX.',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(50)
          .error('Title must be between 1 and 50 characters. Tags should be concise.'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL-friendly identifier (auto-generated from title). Used for tag archive pages and filtering.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          // Enforce slug uniqueness across all tag documents
          if (!slug?.current) {
            return true; // Let required() rule handle empty case
          }

          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2025-01-01' });
          const id = document?._id?.replace(/^drafts\./, '');

          // Query for other tags with same slug
          const params = {
            slug: slug.current,
            id: id,
          };

          const query = `*[_type == "tag" && slug.current == $slug && _id != $id][0]`;
          const result = await client.fetch(query, params);

          if (result) {
            return `This slug is already in use by another tag: "${result.title}". Consider using a more specific name or check if the existing tag fits your needs.`;
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
        'Select which content types this tag applies to. Tags will only appear when editing selected content types. Defaults to all types.',
      options: {
        list: [
          { title: 'Posts', value: 'post' },
          { title: 'Recipes', value: 'recipe' },
        ],
        layout: 'grid',
      },
      initialValue: ['post', 'recipe'],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Select at least one content type. Tags must apply to at least one content type.')
          .unique()
          .error('Each content type can only be selected once'),
    }),
  ],
  preview: {
    // Configure preview with tag title and content type scope
    select: {
      title: 'title',
      contentTypes: 'contentTypes',
    },
    prepare({ title, contentTypes }: { title: string; contentTypes?: string[] }) {
      // Format content types as subtitle with visual indicators
      let scopeLabel = 'Unknown scope';

      if (contentTypes && contentTypes.length > 0) {
        const hasPost = contentTypes.includes('post');
        const hasRecipe = contentTypes.includes('recipe');

        if (hasPost && hasRecipe) {
          scopeLabel = '📝 Posts | 🍳 Recipes';
        } else if (hasPost) {
          scopeLabel = '📝 Posts only';
        } else if (hasRecipe) {
          scopeLabel = '🍳 Recipes only';
        }
      }

      return {
        title: title,
        subtitle: scopeLabel,
      };
    },
  },
});
