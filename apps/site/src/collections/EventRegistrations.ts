import type { CollectionConfig } from 'payload';

import { authenticated } from '@/lib/payload/access';

/**
 * Public event signups. Created only via the trusted signup API
 * (`overrideAccess: true`); admins can review and manage in Payload.
 */
export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'event', 'status', 'createdAt'],
    description: 'Registrations and waitlist entries for participation events.',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      admin: {
        description: 'The event this registration belongs to.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'registered',
      options: [
        { label: 'Registered', value: 'registered' },
        { label: 'Waitlisted', value: 'waitlisted' },
      ],
      admin: {
        description: 'Registered attendees count toward capacity; waitlisted do not.',
      },
    },
  ],
};
