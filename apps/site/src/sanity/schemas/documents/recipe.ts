/**
 * Recipe Document Schema
 *
 * Defines the Recipe content type for Sanity CMS.
 * Recipes showcase farm-to-table cooking, seasonal produce, and preserving techniques.
 *
 * @module sanity/schemas/documents/recipe
 */

import { defineField, defineType } from 'sanity';
import type { SchemaTypeDefinition } from 'sanity';

/**
 * Recipe schema definition
 *
 * Field Groups:
 * - Content: Core content fields (title, slug, excerpt, images, metadata)
 * - Details: Recipe-specific fields (timing, servings, ingredients, instructions, nutrition, difficulty)
 * - SEO: Search engine optimisation metadata
 *
 * Required Fields:
 * - title: Recipe title (max 100 chars) [FR-001]
 * - slug: URL-friendly identifier [FR-002]
 * - excerpt: Recipe summary (max 200 chars) [FR-007]
 * - featuredImage: Hero image with alt text [FR-008]
 * - author: Reference to author document [FR-003]
 * - publishedAt: Publication date [FR-006]
 * - ingredients: Array of structured ingredient objects [FR-013]
 * - instructions: Portable Text instructions [FR-014]
 *
 * Optional Fields:
 * - category: Primary category reference [FR-004]
 * - tags: Array of tag references [FR-005]
 * - servings: Number of portions [FR-009]
 * - prepTime: Preparation time in minutes [FR-010]
 * - cookTime: Cooking time in minutes [FR-011]
 * - totalTime: Total time in minutes [FR-012]
 * - difficulty: Easy/Medium/Hard [FR-016]
 * - nutritionInfo: Nutritional data object [FR-015]
 * - seo: SEO metadata object [FR-017]
 *
 * Validation:
 * - Title max 100 characters [NFR-003]
 * - Slug uniqueness enforced [FR-018]
 * - Servings 1-100 [FR-018]
 * - Time values 0-2880 minutes (48 hours) [FR-018]
 * - At least 1 ingredient required [FR-018]
 * - Difficulty from controlled vocabulary [FR-016]
 *
 * Preview: Shows title, difficulty, timing info, and featured image [FR-019]
 */
export const recipeSchema: SchemaTypeDefinition = defineType({
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'details', title: 'Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Content Group
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'Recipe title (e.g., "Seasonal Vegetable Stir-Fry")',
      validation: (Rule) =>
        Rule.required().max(100).error('Title is required and must be 100 characters or less'),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description:
        'URL-friendly identifier (auto-generated from title). Used for recipe URLs and linking.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          // Enforce slug uniqueness across all recipe documents [FR-018]
          if (!slug?.current) {
            return true; // Let required() rule handle empty case
          }

          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2024-01-01' });
          const id = document?._id?.replace(/^drafts\./, '');

          // Query for other recipes with same slug
          const params = {
            slug: slug.current,
            id: id,
          };

          const query = `*[_type == "recipe" && slug.current == $slug && _id != $id][0]`;
          const result = await client.fetch(query, params);

          if (result) {
            return `This slug is already in use by another recipe: "${result.title}". Consider using a more specific title or modifying the slug manually.`;
          }

          return true;
        }),
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'Brief summary for recipe previews and social sharing (max 200 characters). Highlight key flavours or seasonality.',
      validation: (Rule) =>
        Rule.required().max(200).error('Excerpt is required and must be 200 characters or less'),
    }),

    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      description:
        'Hero image of the finished recipe. Recommended: 1200x800px for best display. Use natural lighting and styling.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description:
            'Describe the image for screen readers and SEO (e.g., "Golden roasted vegetables on white platter")',
          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(200)
              .error('Alt text is required (5-200 characters) for accessibility'),
        },
      ],
      validation: (Rule) => Rule.required().error('Featured image is required'),
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'content',
      description: 'Recipe creator for attribution and filtering.',
      validation: (Rule) => Rule.required().error('Author is required'),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'content',
      description:
        'Primary category for this recipe (e.g., "Preserves", "Main Courses", "Desserts")',
      options: {
        filter: () => {
          // Only show categories that apply to recipes
          return {
            filter: '_type == "category" && "recipe" in contentTypes',
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
              // Only show tags that apply to recipes
              return {
                filter: '_type == "tag" && "recipe" in contentTypes',
                params: {},
              };
            },
            disableNew: true,
          },
        },
      ],
      group: 'content',
      description:
        'Tags for content discovery and filtering (e.g., "Vegan", "Gluten-Free", "Summer", "Preserving")',
      validation: (Rule) =>
        Rule.max(15).warning(
          'Consider using fewer tags (max 15 recommended). Too many tags can reduce discoverability.',
        ),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'content',
      description:
        'When this recipe should be considered published. Affects ordering and filtering.',
      validation: (Rule) => Rule.required().error('Publication date is required'),
      initialValue: () => new Date().toISOString(),
    }),

    // Details Group
    defineField({
      name: 'servings',
      title: 'Servings',
      type: 'number',
      group: 'details',
      description: 'Number of servings this recipe yields',
      validation: (Rule) =>
        Rule.min(1).max(100).warning('Servings should be between 1 and 100 for practical recipes'),
    }),

    defineField({
      name: 'prepTime',
      title: 'Preparation Time (minutes)',
      type: 'number',
      group: 'details',
      description: 'Time required for ingredient preparation (chopping, measuring, etc.)',
      validation: (Rule) =>
        Rule.min(0).max(1440).warning('Prep time should be between 0 and 1440 minutes (24 hours)'),
    }),

    defineField({
      name: 'cookTime',
      title: 'Cook Time (minutes)',
      type: 'number',
      group: 'details',
      description: 'Active cooking time (baking, simmering, frying, etc.)',
      validation: (Rule) =>
        Rule.min(0).max(1440).warning('Cook time should be between 0 and 1440 minutes (24 hours)'),
    }),

    defineField({
      name: 'totalTime',
      title: 'Total Time (minutes)',
      type: 'number',
      group: 'details',
      description:
        'Total time from start to finish, including prep, cook, and any waiting time (e.g., marinating, rising). Can be calculated automatically from prep + cook.',
      validation: (Rule) =>
        Rule.min(0).max(2880).warning('Total time should be between 0 and 2880 minutes (48 hours)'),
    }),

    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      group: 'details',
      description: 'Recipe complexity level to help users choose appropriate recipes',
      options: {
        list: [
          { title: 'Easy', value: 'Easy' },
          { title: 'Medium', value: 'Medium' },
          { title: 'Hard', value: 'Hard' },
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [{ type: 'recipeIngredient' }],
      group: 'details',
      description: 'List of ingredients with quantities and preparation notes',
      validation: (Rule) => Rule.required().min(1).error('At least one ingredient is required'),
    }),

    defineField({
      name: 'instructions',
      title: 'Instructions',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      group: 'details',
      description:
        'Step-by-step cooking instructions. Use numbered lists for clear sequencing. Be specific about technique and timing.',
      validation: (Rule) => Rule.required().error('Instructions are required'),
    }),

    defineField({
      name: 'nutritionInfo',
      title: 'Nutrition Information',
      type: 'object',
      group: 'details',
      description: 'Optional nutritional data per serving (informational only, not verified)',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        {
          name: 'calories',
          type: 'number',
          title: 'Calories',
          description: 'Energy per serving (kcal)',
        },
        {
          name: 'protein',
          type: 'string',
          title: 'Protein',
          description: 'Protein per serving (e.g., "12g")',
        },
        {
          name: 'carbohydrates',
          type: 'string',
          title: 'Carbohydrates',
          description: 'Carbs per serving (e.g., "45g")',
        },
        {
          name: 'fat',
          type: 'string',
          title: 'Fat',
          description: 'Fat per serving (e.g., "15g")',
        },
        {
          name: 'fiber',
          type: 'string',
          title: 'Fiber',
          description: 'Dietary fiber per serving (e.g., "8g")',
        },
        {
          name: 'sodium',
          type: 'string',
          title: 'Sodium',
          description: 'Sodium per serving (e.g., "400mg")',
        },
      ],
    }),

    // SEO Group
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      description:
        'Search engine optimisation metadata (optional but recommended for recipe discovery)',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          description:
            'Custom title for search engines (max 60 chars). Leave empty to use recipe title.',
          validation: (Rule) =>
            Rule.max(60).warning(
              'Meta title should be 60 characters or less for optimal display in search results',
            ),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          rows: 3,
          description:
            'Description for search results (max 160 chars). Leave empty to use excerpt.',
          validation: (Rule) =>
            Rule.max(160).warning(
              'Meta description should be 160 characters or less for optimal display in search results',
            ),
        },
        {
          name: 'keywords',
          type: 'array',
          title: 'Keywords',
          of: [{ type: 'string' }],
          description:
            'Keywords for search optimisation (e.g., "seasonal vegetables", "summer recipe")',
          options: {
            layout: 'tags',
          },
        },
      ],
    }),
  ],

  preview: {
    // Configure preview with title, difficulty, timing, and featured image [FR-019]
    select: {
      title: 'title',
      media: 'featuredImage',
      prepTime: 'prepTime',
      cookTime: 'cookTime',
      totalTime: 'totalTime',
      difficulty: 'difficulty',
    },
    prepare(selection) {
      const { title, media, prepTime, cookTime, totalTime, difficulty } = selection;

      // Calculate time display
      const timeInfo = totalTime
        ? `${totalTime} min total`
        : prepTime && cookTime
          ? `${prepTime + cookTime} min total`
          : prepTime
            ? `${prepTime} min prep`
            : 'No time info';

      return {
        title: title || 'Untitled Recipe',
        subtitle: `${difficulty || 'No difficulty'} • ${timeInfo}`,
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



