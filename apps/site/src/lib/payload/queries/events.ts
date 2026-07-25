import 'server-only';

import type { Event as PayloadEvent } from '@/payload-types';
import { getPayloadClient } from '@/lib/payload/client';

export type UpcomingEvent = Pick<
  PayloadEvent,
  'id' | 'title' | 'slug' | 'startsAt' | 'location' | 'capacity' | 'isFull' | 'signupTarget'
>;

const EVENT_LIST_SELECT = {
  title: true,
  slug: true,
  startsAt: true,
  location: true,
  capacity: true,
  isFull: true,
  signupTarget: true,
} as const;

/**
 * Published upcoming events for the public listing (CP09-10).
 * Sorted soonest-first; past events and drafts are excluded.
 */
export async function getUpcomingEvents(opts: { limit?: number } = {}): Promise<UpcomingEvent[]> {
  const { limit = 50 } = opts;
  const payload = await getPayloadClient();
  const now = new Date().toISOString();

  const result = await payload.find({
    collection: 'events',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 0,
    limit,
    sort: 'startsAt',
    select: EVENT_LIST_SELECT,
    where: {
      startsAt: {
        greater_than_equal: now,
      },
    },
  });

  return result.docs as UpcomingEvent[];
}

/**
 * Next published upcoming event (in-article CTA, CP09-11).
 */
export async function getNextUpcomingEvent(): Promise<UpcomingEvent | null> {
  const events = await getUpcomingEvents({ limit: 1 });
  return events[0] ?? null;
}

export async function getEventBySlug(slug: string): Promise<PayloadEvent | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'events',
    // Local API bypasses access control by default; enforce publicReadPublished
    // so drafts never reach public surfaces.
    overrideAccess: false,
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs[0] ?? null;
}

export async function getEventById(id: number): Promise<PayloadEvent | null> {
  const payload = await getPayloadClient();

  try {
    const doc = await payload.findByID({
      collection: 'events',
      id,
      // Local API bypasses access control by default; enforce publicReadPublished
      // so drafts never reach public surfaces.
      overrideAccess: false,
      depth: 0,
    });
    return doc;
  } catch {
    return null;
  }
}
