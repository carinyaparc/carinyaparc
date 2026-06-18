import type { CollectionConfig } from 'payload';

import {
  createRevalidateAfterChange,
  createRevalidateAfterDelete,
} from '@/collections/hooks/revalidate-content';
import { authenticated, publicReadPublished } from '@/lib/payload/access';
import { slugField } from '@/fields/slugField';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'date', 'featured', '_status'],
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : '';
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
      return `${baseUrl}/blog/${slug}`;
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
    afterChange: [createRevalidateAfterChange('posts')],
    afterDelete: [createRevalidateAfterDelete('posts')],
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
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
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
        description: 'Public path, e.g. /images/farm-track-gate.jpg',
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
      name: 'body',
      type: 'richText',
      required: true,
    },
  ],
};
