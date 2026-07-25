import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find, findByID, count } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
  findByID: vi.fn().mockResolvedValue(null),
  count: vi.fn().mockResolvedValue({ totalDocs: 0 }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find, findByID, count }),
}));

import {
  countEventRegistrations,
  findEventRegistrationByEmail,
  getEventById,
  getEventBySlug,
  getNextUpcomingEvent,
  getUpcomingEvents,
  isEventAtCapacity,
} from '@/features/events/queries/events';

describe('events queries', () => {
  beforeEach(() => {
    find.mockClear();
    findByID.mockClear();
    count.mockClear();
    find.mockResolvedValue({ docs: [] });
    findByID.mockResolvedValue(null);
    count.mockResolvedValue({ totalDocs: 0 });
  });

  it('getUpcomingEvents queries published-only upcoming events soonest-first', async () => {
    const nowBefore = Date.now();
    await getUpcomingEvents({ limit: 10 });
    const nowAfter = Date.now();

    expect(find).toHaveBeenCalledOnce();
    const options = find.mock.calls[0]![0] as {
      collection: string;
      overrideAccess: boolean;
      sort: string;
      limit: number;
      where: { startsAt: { greater_than_equal: string } };
    };

    expect(options.collection).toBe('events');
    expect(options.overrideAccess).toBe(false);
    expect(options.sort).toBe('startsAt');
    expect(options.limit).toBe(10);

    const cutoff = Date.parse(options.where.startsAt.greater_than_equal);
    expect(cutoff).toBeGreaterThanOrEqual(nowBefore);
    expect(cutoff).toBeLessThanOrEqual(nowAfter);
  });

  it('getNextUpcomingEvent returns the first upcoming event or null', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 1,
          title: 'Planting day',
          slug: 'planting-day',
          startsAt: '2030-01-15T09:00:00.000Z',
          location: 'Carinya Parc',
          capacity: 20,
          isFull: false,
          signupTarget: null,
        },
      ],
    });

    const next = await getNextUpcomingEvent();
    expect(next?.slug).toBe('planting-day');
    expect(find.mock.calls[0]![0]).toMatchObject({ limit: 1 });

    find.mockResolvedValueOnce({ docs: [] });
    expect(await getNextUpcomingEvent()).toBeNull();
  });

  it('getEventBySlug looks up by slug with access enforced', async () => {
    await getEventBySlug('planting-day');

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'events',
        overrideAccess: false,
        where: { slug: { equals: 'planting-day' } },
      }),
    );
  });

  it('getEventById uses findByID with access enforced', async () => {
    findByID.mockResolvedValueOnce({ id: 7, slug: 'planting-day' });

    const event = await getEventById(7);
    expect(event?.id).toBe(7);
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'events',
        id: 7,
        overrideAccess: false,
      }),
    );
  });

  it('getEventById returns null when the document is missing', async () => {
    findByID.mockRejectedValueOnce(new Error('Not Found'));
    expect(await getEventById(999)).toBeNull();
  });

  it('countEventRegistrations counts registered signups only', async () => {
    count.mockResolvedValueOnce({ totalDocs: 4 });

    expect(await countEventRegistrations(7)).toBe(4);
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'event-registrations',
        overrideAccess: true,
        where: {
          and: [{ event: { equals: 7 } }, { status: { equals: 'registered' } }],
        },
      }),
    );
  });

  it('findEventRegistrationByEmail returns an existing signup', async () => {
    find.mockResolvedValueOnce({
      docs: [{ id: 3, status: 'registered' }],
    });

    expect(await findEventRegistrationByEmail(7, 'Alex@Fastmail.com')).toEqual({
      id: 3,
      status: 'registered',
    });
  });

  it('isEventAtCapacity respects isFull and numeric capacity', () => {
    expect(isEventAtCapacity({ isFull: true, capacity: 20 }, 0)).toBe(true);
    expect(isEventAtCapacity({ isFull: false, capacity: 20 }, 20)).toBe(true);
    expect(isEventAtCapacity({ isFull: false, capacity: 20 }, 19)).toBe(false);
    expect(isEventAtCapacity({ isFull: false, capacity: null }, 100)).toBe(false);
  });
});
