import type { CollectionConfig, Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { EventRegistrations } from '@/collections/EventRegistrations';

function fieldNames(collection: CollectionConfig): string[] {
  return (collection.fields ?? [])
    .map((field) => ('name' in field ? field.name : undefined))
    .filter((name): name is string => typeof name === 'string');
}

function fieldByName(collection: CollectionConfig, name: string): Field | undefined {
  return collection.fields?.find((field) => 'name' in field && field.name === name);
}

describe('EventRegistrations collection', () => {
  it('defines registrations linked to events', () => {
    expect(EventRegistrations.slug).toBe('event-registrations');
    expect(fieldNames(EventRegistrations)).toEqual(
      expect.arrayContaining(['event', 'name', 'email', 'status']),
    );
  });

  it('requires event, name, email, and status', () => {
    for (const name of ['event', 'name', 'email', 'status'] as const) {
      const field = fieldByName(EventRegistrations, name);
      expect(field).toBeDefined();
      expect(field && 'required' in field && field.required).toBe(true);
    }
  });

  it('defaults status to registered with waitlisted option', () => {
    const status = fieldByName(EventRegistrations, 'status');
    expect(status && 'type' in status && status.type).toBe('select');
    expect(status && 'defaultValue' in status && status.defaultValue).toBe('registered');
    expect(status && 'options' in status && status.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'registered' }),
        expect.objectContaining({ value: 'waitlisted' }),
      ]),
    );
  });

  it('restricts public create/read to authenticated admins', () => {
    const create = EventRegistrations.access?.create;
    const read = EventRegistrations.access?.read;

    expect(typeof create).toBe('function');
    expect(typeof read).toBe('function');

    if (typeof create === 'function') {
      expect(create({ req: { user: null } } as never)).toBe(false);
      expect(create({ req: { user: { id: 1 } } } as never)).toBe(true);
    }

    if (typeof read === 'function') {
      expect(read({ req: { user: null } } as never)).toBe(false);
      expect(read({ req: { user: { id: 1 } } } as never)).toBe(true);
    }
  });
});
