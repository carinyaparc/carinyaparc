import type { CollectionConfig } from 'payload';

import { authenticated, publicRead } from '@/lib/payload/access';
import { slugField } from '@/fields/slugField';

export const Categories: CollectionConfig = {
  slug: 'categories',
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
      name: 'description',
      type: 'textarea',
    },
  ],
};
