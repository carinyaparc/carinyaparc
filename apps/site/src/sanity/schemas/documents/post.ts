/**
 * Post Document Schema
 *
 * Defines the Post content type for Sanity CMS.
 * Posts are the primary content type for blog articles and written content.
 *
 * @module sanity/schemas/documents/post
 */

import { defineField, defineType } from 'sanity';
import type { SchemaTypeDefinition } from 'sanity';

/**
 * Post schema definition
 *
 * Fields:
 * - title: Post title (required, max 200 chars)
 * - slug: URL-friendly identifier (required, auto-generated from title, unique)
 * - publishedAt: Publication date (required)
 * - author: Reference to author document (required)
 * - body: Rich content using Portable Text
 * - excerpt: Brief summary for previews (optional, max 300 chars)
 * - category: Primary category reference (optional)
 * - tags: Array of tag references (optional)
 * - featuredImage: Hero image with alt text (optional)
 * - featured: Boolean flag for featured posts
 * - seo: SEO metadata object
 *
 * Validation:
 * - Title, slug, publishedAt, author are required
 * - Title max 200 characters
 * - Excerpt max 300 characters
 * - SEO title max 60 characters
 * - SEO description max 160 characters
 * - Slug uniqueness enforced via async validation
 *
 * Preview: Shows title, publish date, author name, and featured image
 * Orderings: By publish date (desc/asc) and title (asc/desc)
 */
export const postSchema: SchemaTypeDefinition = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    // Core content fields
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Post title (e.g., "Designing a Food Forest at Carinya Parc")',
      validation: (Rule) =>
        Rule.required().max(200).error('Title is required and must be 200 characters or less'),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL-friendly identifier (auto-generated from title). Used for post URLs and linking.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          // Enforce slug uniqueness across all post documents
          if (!slug?.current) {
            return true; // Let required() rule handle empty case
          }

          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2025-01-01' });
          const id = document?._id?.replace(/^drafts\./, '');

          // Query for other posts with same slug
          const params = {
            slug: slug.current,
            id: id,
          };

          const query = `*[_type == "post" && slug.current == $slug && _id != $id][0]`;
          const result = await client.fetch(query, params);

          if (result) {
            return `This slug is already in use by another post: "${result.title}". Consider using a more specific title or modifying the slug manually.`;
          }

          return true;
        }),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this post should be considered published. Affects ordering and filtering.',
      validation: (Rule) => Rule.required().error('Publication date is required'),
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      description: 'Post author for attribution and filtering.',
      validation: (Rule) => Rule.required().error('Author is required'),
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Main post content with rich formatting, images, and media.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto'],
                      }).error('Must be a valid URL (http, https, or mailto)'),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Describe the image for screen readers and SEO',
              validation: (Rule) =>
                Rule.required()
                  .min(5)
                  .max(200)
                  .error('Alt text is required (5-200 characters) for accessibility'),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption displayed below the image',
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description:
        'Brief summary for post previews and social sharing (max 300 characters). Leave empty to auto-generate from body.',
      validation: (Rule) =>
        Rule.max(300).warning('Excerpt should be 300 characters or less for best display'),
    }),

    // Categorisation fields
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Primary category for this post (e.g., "Regenerative Agriculture", "Recipes")',
      options: {
        filter: () => {
          // Only show categories that apply to posts
          return {
            filter: '_type == "category" && "post" in contentTypes',
            params: {},
          };
        },
        disableNew: true,
      },
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tag' }],
          options: {
            filter: () => {
              // Only show tags that apply to posts
              return {
                filter: '_type == "tag" && "post" in contentTypes',
                params: {},
              };
            },
            disableNew: true,
          },
        },
      ],
      description: 'Tags for content discovery and filtering (e.g., "Permaculture", "Soil Health")',
      validation: (Rule) =>
        Rule.max(20).warning(
          'Consider using fewer tags (max 20 recommended). Too many tags can reduce discoverability.',
        ),
    }),

    // Media fields
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description:
        'Hero image displayed at the top of the post and in previews. Recommended: 1200x630px for best social sharing.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describe the image for screen readers and SEO',
          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(200)
              .error('Alt text is required (5-200 characters) for accessibility'),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption displayed below the image',
        },
      ],
    }),

    // Flags
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Feature this post prominently on the homepage and archive pages',
      initialValue: false,
    }),

    // SEO metadata
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      description: 'Search engine optimisation metadata (optional but recommended)',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          description:
            'Custom title for search engines (max 60 chars). Leave empty to use post title.',
          validation: (Rule) =>
            Rule.max(60).warning(
              'SEO title should be 60 characters or less for optimal display in search results',
            ),
        },
        {
          name: 'description',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description:
            'Description for search results (max 160 chars). Leave empty to use excerpt or auto-generate.',
          validation: (Rule) =>
            Rule.max(160).warning(
              'Meta description should be 160 characters or less for optimal display in search results',
            ),
        },
        {
          name: 'image',
          title: 'Open Graph Image',
          type: 'image',
          description:
            'Custom image for social sharing (1200x630px recommended). Leave empty to use featured image.',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description:
            'Override canonical URL if content exists elsewhere (advanced, usually leave empty)',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https'],
            }).warning('Must be a valid URL (http or https)'),
        },
      ],
    }),
  ],

  preview: {
    // Configure preview with title, publish date, author name, and featured image
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      media: 'featuredImage',
      authorName: 'author.name',
    },
    prepare({ title, publishedAt, media, authorName }) {
      // Format date in Australian locale
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'No date';

      return {
        title: title || 'Untitled Post',
        subtitle: `${date}${authorName ? ` • ${authorName}` : ''}`,
        media,
      };
    },
  },

  orderings: [
    // Define orderings by publish date and title
    {
      title: 'Published Date (Newest First)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date (Oldest First)',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Title (Z-A)',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }],
    },
  ],
});
