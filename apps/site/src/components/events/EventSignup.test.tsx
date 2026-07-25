/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children?: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('EventSignup', () => {
  let container: HTMLDivElement;
  let root: Root;
  let EventSignup: typeof import('@/components/events/EventSignup').EventSignup;

  beforeEach(async () => {
    vi.resetModules();
    ({ EventSignup } = await import('@/components/events/EventSignup'));

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

  it('renders name and email fields for an open event', async () => {
    await act(async () => {
      root.render(<EventSignup eventId={1} eventTitle="Winter planting day" />);
    });

    expect(container.textContent).toContain('Sign up for this event');
    expect(container.querySelector('input[name="name"]')).toBeTruthy();
    expect(container.querySelector('input[name="email"]')).toBeTruthy();
    expect(container.querySelector('button[type="submit"]')?.textContent).toMatch(/Sign up/i);
  });

  it('shows waitlist / subscribe state when the event is full', async () => {
    await act(async () => {
      root.render(<EventSignup eventId={1} eventTitle="Winter planting day" isFull />);
    });

    expect(container.textContent).toMatch(/full/i);
    expect(container.textContent).toMatch(/waitlist/i);
    expect(container.querySelector('input[name="email"]')).toBeNull();

    const subscribe = Array.from(container.querySelectorAll('a')).find((el) =>
      el.textContent?.includes('waitlist'),
    );
    expect(subscribe?.getAttribute('href')).toBe('/subscribe/');
  });

  it('includes a honeypot field hidden from assistive tech', async () => {
    await act(async () => {
      root.render(<EventSignup eventId={9} eventTitle="Open day" />);
    });

    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toBeTruthy();
    expect(honeypot?.closest('[aria-hidden="true"]')).toBeTruthy();
  });
});
