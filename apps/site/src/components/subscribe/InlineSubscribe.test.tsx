/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const trackSubscribeStart = vi.fn();
const trackSubscribeComplete = vi.fn();
const postSubscribe = vi.fn();

vi.mock('@/lib/analytics', () => ({
  trackSubscribeStart: (...args: unknown[]) => trackSubscribeStart(...args),
  trackSubscribeComplete: (...args: unknown[]) => trackSubscribeComplete(...args),
}));

vi.mock('@/lib/subscribe/client', () => ({
  postSubscribe: (...args: unknown[]) => postSubscribe(...args),
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

describe('InlineSubscribe analytics', () => {
  let container: HTMLDivElement;
  let root: Root;
  let InlineSubscribe: typeof import('@/components/subscribe/InlineSubscribe').InlineSubscribe;

  beforeEach(async () => {
    vi.resetModules();
    trackSubscribeStart.mockReset();
    trackSubscribeComplete.mockReset();
    postSubscribe.mockReset();
    ({ InlineSubscribe } = await import('@/components/subscribe/InlineSubscribe'));

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

  it('fires subscribe_start once on first focus', async () => {
    await act(async () => {
      root.render(<InlineSubscribe source="blog:test-post" />);
    });

    const email = container.querySelector('#inline-subscribe-email') as HTMLInputElement;
    const props = reactProps<{ onFocus?: () => void }>(email);

    await act(async () => {
      props.onFocus?.();
      props.onFocus?.();
    });

    expect(trackSubscribeStart).toHaveBeenCalledTimes(1);
    expect(trackSubscribeStart).toHaveBeenCalledWith({ source: 'blog:test-post' });
  });

  it('fires subscribe_complete with source on successful submit', async () => {
    postSubscribe.mockResolvedValue({ ok: true });

    await act(async () => {
      root.render(<InlineSubscribe source="blog:test-post" />);
    });

    const email = container.querySelector('#inline-subscribe-email') as HTMLInputElement;

    await act(async () => {
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(email).onChange?.({
        target: { value: 'reader@example.com' },
      });
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      await reactProps<{
        onSubmit?: (e: { preventDefault: () => void }) => void | Promise<void>;
      }>(form).onSubmit?.({ preventDefault: () => undefined });
    });

    expect(postSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'reader@example.com',
        source: 'blog:test-post',
      }),
    );
    expect(trackSubscribeComplete).toHaveBeenCalledWith({ source: 'blog:test-post' });
  });

  it('does not fire subscribe_complete when the API fails', async () => {
    postSubscribe.mockResolvedValue({ ok: false, error: 'Nope' });

    await act(async () => {
      root.render(<InlineSubscribe source="blog:test-post" />);
    });

    const email = container.querySelector('#inline-subscribe-email') as HTMLInputElement;

    await act(async () => {
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(email).onChange?.({
        target: { value: 'reader@example.com' },
      });
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      await reactProps<{
        onSubmit?: (e: { preventDefault: () => void }) => void | Promise<void>;
      }>(form).onSubmit?.({ preventDefault: () => undefined });
    });

    expect(trackSubscribeComplete).not.toHaveBeenCalled();
  });
});
