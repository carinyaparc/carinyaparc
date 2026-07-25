/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const trackEventSignupComplete = vi.fn();

vi.mock('@/lib/analytics', () => ({
  EVENTS_LISTING_SOURCE: 'events-listing',
  trackEventSignupComplete: (...args: unknown[]) => trackEventSignupComplete(...args),
}));

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

describe('EventSignup', () => {
  let container: HTMLDivElement;
  let root: Root;
  let EventSignup: typeof import('@/features/events/components/EventSignup').EventSignup;

  beforeEach(async () => {
    vi.resetModules();
    trackEventSignupComplete.mockReset();
    vi.stubGlobal('fetch', vi.fn());
    ({ EventSignup } = await import('@/features/events/components/EventSignup'));

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
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

  it('fires event_signup_complete with event_id on successful submit', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "You're signed up — see you on the day." }),
    } as Response);

    await act(async () => {
      root.render(<EventSignup eventId={12} eventTitle="Winter planting day" />);
    });

    const name = container.querySelector('input[name="name"]') as HTMLInputElement;
    const email = container.querySelector('input[name="email"]') as HTMLInputElement;

    await act(async () => {
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(name).onChange?.({
        target: { value: 'Alex Reader' },
      });
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(email).onChange?.({
        target: { value: 'alex@example.com' },
      });
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      await reactProps<{
        onSubmit?: (e: { preventDefault: () => void }) => void | Promise<void>;
      }>(form).onSubmit?.({ preventDefault: () => undefined });
    });

    expect(trackEventSignupComplete).toHaveBeenCalledTimes(1);
    expect(trackEventSignupComplete).toHaveBeenCalledWith({
      event_id: 12,
      source: 'events-listing',
    });
    expect(container.textContent).toMatch(/signed up/i);
  });

  it('does not fire event_signup_complete when the API fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to sign up' }),
    } as Response);

    await act(async () => {
      root.render(<EventSignup eventId={12} eventTitle="Winter planting day" />);
    });

    const name = container.querySelector('input[name="name"]') as HTMLInputElement;
    const email = container.querySelector('input[name="email"]') as HTMLInputElement;

    await act(async () => {
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(name).onChange?.({
        target: { value: 'Alex Reader' },
      });
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(email).onChange?.({
        target: { value: 'alex@example.com' },
      });
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      await reactProps<{
        onSubmit?: (e: { preventDefault: () => void }) => void | Promise<void>;
      }>(form).onSubmit?.({ preventDefault: () => undefined });
    });

    expect(trackEventSignupComplete).not.toHaveBeenCalled();
  });
});
