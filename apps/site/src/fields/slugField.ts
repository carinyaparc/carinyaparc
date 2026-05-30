import type { Field } from 'payload';

import { slugify } from '@/lib/payload/slugify';

type SlugFieldOptions = {
  fieldToUse?: string;
};

export function slugField({ fieldToUse = 'title' }: SlugFieldOptions = {}): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ value, data, operation }) => {
          if (typeof value === 'string' && value.trim().length > 0) {
            return slugify(value);
          }

          if (operation === 'create' && data && typeof data[fieldToUse] === 'string') {
            return slugify(data[fieldToUse]);
          }

          return value;
        },
      ],
    },
  };
}
