import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find, findByID } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
  findByID: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find, findByID }),
}));

import {
  getEventById,
  getEventBySlug,
  getNextUpcomingEvent,
  getUpcomingEvents,
} from '@/lib/payload/queries/events';

describe('events queries', () => {
  beforeEach(() => {
    find.mockClear();
    findByID.mockClear();
    find.mockResolvedValue({ docs: [] });
    findByID.mockResolvedValue(null);
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
});
