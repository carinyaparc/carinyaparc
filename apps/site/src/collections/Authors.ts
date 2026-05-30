import type { CollectionConfig } from 'payload';

import { authenticated, publicRead } from '@/lib/payload/access';
import { slugField } from '@/fields/slugField';

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    create: authenticated,
    read: publicRead,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
      admin: {
        description: 'Public path, e.g. /images/authors/jonathan.jpg',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
  ],
};
