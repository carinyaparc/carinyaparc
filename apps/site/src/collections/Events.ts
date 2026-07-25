import type { CollectionConfig } from 'payload';

import { authenticated, publicReadPublished } from '@/lib/payload/access';
import { slugField } from '@/fields/slugField';

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'location', 'capacity', 'isFull', '_status'],
    description: 'Planting days, workshops, and other participation events.',
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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
    },
    slugField(),
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Event start date and time (ISO datetime).',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: {
        description: 'Where the event takes place, e.g. Carinya Parc, Glen Innes.',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Maximum attendees. Leave empty for uncapped.',
      },
    },
    {
      name: 'isFull',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Mark as full',
      admin: {
        position: 'sidebar',
        description: 'Show waitlist / subscribe instead of the signup form.',
      },
    },
    {
      name: 'signupTarget',
      type: 'text',
      admin: {
        position: 'sidebar',
        description:
          'Optional external signup URL (must start with https:// or http://). Empty = use the on-site form.',
      },
      validate: (value) => {
        if (!value || value.trim() === '') {
          return true;
        }
        try {
          const parsed = new URL(value.trim());
          if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return 'Signup target must be a valid http:// or https:// URL.';
          }
          return true;
        } catch {
          return 'Signup target must be a valid http:// or https:// URL.';
        }
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
  ],
};
