/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpcomingEvent } from '@/features/events/queries/events';

const trackEventCtaClick = vi.fn();

vi.mock('@/lib/analytics', () => ({
  trackEventCtaClick: (...args: unknown[]) => trackEventCtaClick(...args),
  trackEventSignupComplete: vi.fn(),
  EVENTS_LISTING_SOURCE: 'events-listing',
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    target,
    rel,
    onClick,
  }: {
    href: string;
    children?: React.ReactNode;
    className?: string;
    target?: string;
    rel?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} target={target} rel={rel} onClick={onClick}>
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

function reactProps<T extends Record<string, unknown>>(el: Element): T {
  const key = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
  if (!key) {
    throw new Error('React props not found on element');
  }
  const props = (el as unknown as Record<string, T>)[key];
  if (!props) {
    throw new Error('React props missing on element');
  }
  return props;
}

describe('EventCard', () => {
  let container: HTMLDivElement;
  let root: Root;
  let EventCard: typeof import('@/features/events/components/EventCard').EventCard;
  let EventsEmptyState: typeof import('@/features/events/components/EventCard').EventsEmptyState;
  let formatEventDate: typeof import('@/features/events/components/EventCard').formatEventDate;
  let eventSignupHref: typeof import('@/features/events/components/EventCard').eventSignupHref;

  beforeEach(async () => {
    vi.resetModules();
    trackEventCtaClick.mockReset();
    ({ EventCard, EventsEmptyState, formatEventDate, eventSignupHref } =
      await import('@/features/events/components/EventCard'));

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

  it('renders title, date, location, and on-site signup form', async () => {
    await act(async () => {
      root.render(<EventCard event={baseEvent} />);
    });

    expect(container.textContent).toContain('Winter planting day');
    expect(container.textContent).toContain('Carinya Parc, The Branch NSW');
    expect(container.textContent).toContain(formatEventDate(baseEvent.startsAt));

    const article = container.querySelector('#event-winter-planting-day');
    expect(article).toBeTruthy();

    const time = container.querySelector('time');
    expect(time?.getAttribute('dateTime')).toBe(baseEvent.startsAt);

    expect(container.querySelector('input[name="name"]')).toBeTruthy();
    expect(container.querySelector('input[name="email"]')).toBeTruthy();
    expect(eventSignupHref(baseEvent)).toBe('/get-involved/events/#event-winter-planting-day');
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
    expect(container.querySelector('input[name="email"]')).toBeNull();
  });

  it('fires event_cta_click for external signup with listing source', async () => {
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
    expect(signup).toBeTruthy();

    await act(async () => {
      reactProps<{ onClick?: () => void }>(signup!).onClick?.();
    });

    expect(trackEventCtaClick).toHaveBeenCalledWith({
      event_id: 1,
      source: 'events-listing',
    });
  });

  it('shows waitlist state when the event is full', async () => {
    await act(async () => {
      root.render(<EventCard event={{ ...baseEvent, isFull: true }} />);
    });

    expect(container.textContent).toContain('Full — join the waitlist');
    const waitlist = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('waitlist'),
    );
    expect(waitlist?.getAttribute('href')).toBe('/subscribe/');
    expect(container.querySelector('input[name="email"]')).toBeNull();
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
