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

describe('EndOfPostSubscribe analytics', () => {
  let container: HTMLDivElement;
  let root: Root;
  let EndOfPostSubscribe: typeof import('@/components/subscribe/EndOfPostSubscribe').EndOfPostSubscribe;

  beforeEach(async () => {
    vi.resetModules();
    trackSubscribeStart.mockReset();
    trackSubscribeComplete.mockReset();
    postSubscribe.mockReset();
    ({ EndOfPostSubscribe } = await import('@/components/subscribe/EndOfPostSubscribe'));

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

  it('includes interest on subscribe_complete when selected', async () => {
    postSubscribe.mockResolvedValue({ ok: true });

    await act(async () => {
      root.render(<EndOfPostSubscribe source="blog:test-post" />);
    });

    const email = container.querySelector('#end-subscribe-email') as HTMLInputElement;
    const interest = container.querySelector('#end-subscribe-interest') as HTMLSelectElement;

    await act(async () => {
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(email).onChange?.({
        target: { value: 'reader@example.com' },
      });
    });

    await act(async () => {
      reactProps<{ onChange?: (e: { target: { value: string } }) => void }>(interest).onChange?.({
        target: { value: 'community' },
      });
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      await reactProps<{
        onSubmit?: (e: { preventDefault: () => void }) => void | Promise<void>;
      }>(form).onSubmit?.({ preventDefault: () => undefined });
    });

    expect(trackSubscribeStart).toHaveBeenCalled();
    expect(trackSubscribeComplete).toHaveBeenCalledWith({
      source: 'blog:test-post',
      interest: 'community',
    });
  });
});
