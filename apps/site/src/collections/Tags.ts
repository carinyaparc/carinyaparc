import type { CollectionConfig } from 'payload';

import { authenticated, publicRead } from '@/lib/payload/access';
import { slugField } from '@/fields/slugField';

export const Tags: CollectionConfig = {
  slug: 'tags',
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
  ],
};
