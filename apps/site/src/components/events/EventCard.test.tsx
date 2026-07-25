/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpcomingEvent } from '@/lib/payload/queries/events';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    target,
    rel,
  }: {
    href: string;
    children?: React.ReactNode;
    className?: string;
    target?: string;
    rel?: string;
  }) => (
    <a href={href} className={className} target={target} rel={rel}>
      {children}
    </a>
  ),
}));

const baseEvent: UpcomingEvent = {
  id: 1,
  title: 'Winter planting day',
  slug: 'winter-planting-day',
  startsAt: '2030-06-15T23:00:00.000Z',
  location: 'Carinya Parc, The Branch NSW',
  capacity: 20,
  isFull: false,
  signupTarget: null,
};

describe('EventCard', () => {
  let container: HTMLDivElement;
  let root: Root;
  let EventCard: typeof import('@/components/events/EventCard').EventCard;
  let EventsEmptyState: typeof import('@/components/events/EventCard').EventsEmptyState;
  let formatEventDate: typeof import('@/components/events/EventCard').formatEventDate;

  beforeEach(async () => {
    vi.resetModules();
    ({ EventCard, EventsEmptyState, formatEventDate } =
      await import('@/components/events/EventCard'));

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders title, date, location, and a signup link', async () => {
    await act(async () => {
      root.render(<EventCard event={baseEvent} />);
    });

    expect(container.textContent).toContain('Winter planting day');
    expect(container.textContent).toContain('Carinya Parc, The Branch NSW');
    expect(container.textContent).toContain(formatEventDate(baseEvent.startsAt));

    const time = container.querySelector('time');
    expect(time?.getAttribute('dateTime')).toBe(baseEvent.startsAt);

    const links = Array.from(container.querySelectorAll('a'));
    const signup = links.find((el) => el.textContent?.includes('Sign up'));
    expect(signup?.getAttribute('href')).toBe('/get-involved/events/#event-winter-planting-day');
  });

  it('uses an external signupTarget when set', async () => {
    await act(async () => {
      root.render(
        <EventCard
          event={{
            ...baseEvent,
            signupTarget: 'https://example.com/signup',
          }}
        />,
      );
    });

    const signup = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('Sign up'),
    );
    expect(signup?.getAttribute('href')).toBe('https://example.com/signup');
    expect(signup?.getAttribute('target')).toBe('_blank');
    expect(signup?.getAttribute('rel')).toContain('noopener');
  });

  it('shows waitlist CTA when the event is full', async () => {
    await act(async () => {
      root.render(<EventCard event={{ ...baseEvent, isFull: true }} />);
    });

    expect(container.textContent).toContain('Full — join the waitlist');
    const waitlist = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('waitlist'),
    );
    expect(waitlist?.getAttribute('href')).toBe('/subscribe/');
  });

  it('renders an empty state with a subscribe path', async () => {
    await act(async () => {
      root.render(<EventsEmptyState />);
    });

    expect(container.textContent).toMatch(/No upcoming events/i);
    const subscribe = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('Subscribe'),
    );
    expect(subscribe?.getAttribute('href')).toBe('/subscribe/');
  });
});
