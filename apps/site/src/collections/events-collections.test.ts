import type { CollectionConfig, Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { Events } from '@/collections/Events';

function fieldNames(collection: CollectionConfig): string[] {
  return (collection.fields ?? [])
    .map((field) => ('name' in field ? field.name : undefined))
    .filter((name): name is string => typeof name === 'string');
}

function fieldByName(collection: CollectionConfig, name: string): Field | undefined {
  return collection.fields?.find((field) => 'name' in field && field.name === name);
}

describe('Events collection', () => {
  it('defines events with listing and signup fields', () => {
    expect(Events.slug).toBe('events');
    expect(fieldNames(Events)).toEqual(
      expect.arrayContaining([
        'title',
        'slug',
        'startsAt',
        'location',
        'capacity',
        'isFull',
        'signupTarget',
        'description',
      ]),
    );
  });

  it('requires core fields and enables drafts', () => {
    for (const name of ['title', 'startsAt', 'location', 'description'] as const) {
      const field = fieldByName(Events, name);

      expect(field).toBeDefined();
      expect(field && 'required' in field && field.required).toBe(true);
    }

    expect(Events.versions).toBeTruthy();
    expect(typeof Events.versions === 'object' && Events.versions?.drafts).toBeTruthy();
  });

  it('treats capacity as optional (uncapped when omitted)', () => {
    const capacity = fieldByName(Events, 'capacity');
    expect(capacity).toBeDefined();
    expect(capacity && 'required' in capacity && capacity.required).not.toBe(true);
    expect(capacity && 'type' in capacity && capacity.type).toBe('number');
  });

  it('exposes an explicit full-state flag for waitlist UI', () => {
    const isFull = fieldByName(Events, 'isFull');
    expect(isFull).toBeDefined();
    expect(isFull && 'type' in isFull && isFull.type).toBe('checkbox');
    expect(isFull && 'defaultValue' in isFull && isFull.defaultValue).toBe(false);
  });

  it('configures admin list columns including status and capacity', () => {
    expect(Events.admin?.defaultColumns).toEqual(
      expect.arrayContaining(['title', 'startsAt', 'location', 'capacity', 'isFull', '_status']),
    );
  });

  describe('draft access regression', () => {
    const read = Events.access?.read;

    it('restricts anonymous reads to published events only', () => {
      expect(typeof read).toBe('function');

      if (typeof read === 'function') {
        expect(read({ req: { user: null } } as never)).toEqual({
          _status: { equals: 'published' },
        });
      }
    });

    it('allows authenticated editors to read draft events', () => {
      expect(typeof read).toBe('function');

      if (typeof read === 'function') {
        expect(read({ req: { user: { id: 1 } } } as never)).toBe(true);
      }
    });
  });
});
