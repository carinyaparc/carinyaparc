import type { CollectionConfig } from 'payload';

import {
  createRevalidateAfterChange,
  createRevalidateAfterDelete,
} from '@/collections/hooks/revalidate-content';
import { recipeIngredientFields, recipeInstructionFields } from '@/collections/recipeIngredient';
import { authenticated, publicReadPublished } from '@/lib/payload/access';
import { slugField } from '@/fields/slugField';

const difficultyOptions = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
] as const;

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'date', 'difficulty', 'servings', '_status'],
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : '';
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
      return `${baseUrl}/recipes/${slug}`;
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 120,
      },
    },
  },
  access: {
    create: authenticated,
    read: publicReadPublished,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [createRevalidateAfterChange('recipes')],
    afterDelete: [createRevalidateAfterDelete('recipes')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
    },
    slugField(),
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [...difficultyOptions],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'servings',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'prepTime',
      type: 'text',
      label: 'Prep time',
      admin: {
        position: 'sidebar',
        description: 'ISO 8601 duration, e.g. PT20M',
      },
    },
    {
      name: 'cookTime',
      type: 'text',
      label: 'Cook time',
      admin: {
        position: 'sidebar',
        description: 'ISO 8601 duration, e.g. PT180M',
      },
    },
    {
      name: 'totalTime',
      type: 'text',
      label: 'Total time',
      admin: {
        position: 'sidebar',
        description: 'ISO 8601 duration, e.g. PT200M',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 500,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'SEO meta description. Falls back to excerpt when empty.',
      },
    },
    {
      name: 'image',
      type: 'text',
      label: 'Hero image URL',
      admin: {
        description: 'Public path, e.g. /images/highland-cattle-dam.jpg',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'ingredients',
      type: 'array',
      required: true,
      minRows: 1,
      fields: recipeIngredientFields,
    },
    {
      name: 'instructions',
      type: 'array',
      required: true,
      minRows: 1,
      fields: recipeInstructionFields,
    },
  ],
};
