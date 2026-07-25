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

const nextEvent: UpcomingEvent = {
  id: 1,
  title: 'Winter planting day',
  slug: 'winter-planting-day',
  startsAt: '2030-06-15T23:00:00.000Z',
  location: 'Carinya Parc, The Branch NSW',
  capacity: 20,
  isFull: false,
  signupTarget: null,
};

describe('GetInvolvedCTA', () => {
  let container: HTMLDivElement;
  let root: Root;
  let GetInvolvedCTA: typeof import('@/components/events/GetInvolvedCTA').GetInvolvedCTA;
  let formatEventDate: typeof import('@/components/events/EventCard').formatEventDate;

  beforeEach(async () => {
    vi.resetModules();
    ({ GetInvolvedCTA } = await import('@/components/events/GetInvolvedCTA'));
    ({ formatEventDate } = await import('@/components/events/EventCard'));

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

  it('renders the next event with deep link and listing link', async () => {
    await act(async () => {
      root.render(<GetInvolvedCTA event={nextEvent} />);
    });

    expect(container.textContent).toContain('Come get your hands dirty');
    expect(container.textContent).toContain('Winter planting day');
    expect(container.textContent).toContain('Carinya Parc, The Branch NSW');
    expect(container.textContent).toContain(formatEventDate(nextEvent.startsAt));

    const time = container.querySelector('time');
    expect(time?.getAttribute('dateTime')).toBe(nextEvent.startsAt);

    const links = Array.from(container.querySelectorAll('a'));
    const signup = links.find((el) => el.textContent?.includes('Sign up for this event'));
    const listing = links.find((el) => el.textContent?.includes('All upcoming events'));

    expect(signup?.getAttribute('href')).toBe('/get-involved/events/#event-winter-planting-day');
    expect(listing?.getAttribute('href')).toBe('/get-involved/events/');
  });

  it('uses signupTarget for external registration URLs', async () => {
    await act(async () => {
      root.render(
        <GetInvolvedCTA
          event={{ ...nextEvent, signupTarget: 'https://example.com/register' }}
        />,
      );
    });

    const signup = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('Sign up for this event'),
    );
    expect(signup?.getAttribute('href')).toBe('https://example.com/register');
    expect(signup?.getAttribute('target')).toBe('_blank');
    expect(signup?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('shows waitlist copy when the next event is full', async () => {
    await act(async () => {
      root.render(<GetInvolvedCTA event={{ ...nextEvent, isFull: true }} />);
    });

    expect(container.textContent).toContain('Full — join the waitlist');
    const waitlist = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('waitlist'),
    );
    expect(waitlist?.getAttribute('href')).toBe('/subscribe/');
  });

  it('hides when there is no upcoming event', async () => {
    await act(async () => {
      root.render(<GetInvolvedCTA event={null} />);
    });

    expect(container.innerHTML).toBe('');
  });
});
