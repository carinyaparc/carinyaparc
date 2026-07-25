/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const CANONICAL_URL = 'https://carinyaparc.com.au/blog/soil-health/';
const TITLE = 'Soil health on the ridge';

describe('ShareBar', () => {
  let container: HTMLDivElement;
  let root: Root;
  let ShareBar: typeof import('@/components/blog/ShareBar').ShareBar;
  let writeText: ReturnType<typeof vi.fn>;
  let share: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    toastSuccess.mockReset();
    toastError.mockReset();
    writeText = vi.fn().mockResolvedValue(undefined);
    share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    ({ ShareBar } = await import('@/components/blog/ShareBar'));

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    // @ts-expect-error — restore share stub between tests
    delete navigator.share;
  });

  it('copies the canonical URL and shows confirmation', async () => {
    await act(async () => {
      root.render(<ShareBar url={CANONICAL_URL} title={TITLE} />);
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find((el) =>
      el.textContent?.includes('Copy link'),
    );
    expect(copyButton).toBeTruthy();

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledWith(CANONICAL_URL);
    expect(toastSuccess).toHaveBeenCalledWith('Link copied');
    expect(container.textContent).toContain('Copied');
    expect(container.textContent).toContain('Link copied to clipboard');
  });

  it('hides native share when navigator.share is unavailable', async () => {
    // @ts-expect-error — ensure share is absent
    delete navigator.share;

    await act(async () => {
      root.render(<ShareBar url={CANONICAL_URL} title={TITLE} />);
    });

    const labels = Array.from(container.querySelectorAll('button')).map((el) => el.textContent);
    expect(labels.some((text) => text?.includes('Share'))).toBe(false);
  });

  it('shows native share and passes title + url when supported', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    await act(async () => {
      root.render(<ShareBar url={CANONICAL_URL} title={TITLE} />);
    });

    const shareButton = Array.from(container.querySelectorAll('button')).find(
      (el) => el.getAttribute('aria-label') === 'Share',
    );
    expect(shareButton).toBeTruthy();

    await act(async () => {
      shareButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(share).toHaveBeenCalledWith({
      title: TITLE,
      text: TITLE,
      url: CANONICAL_URL,
    });
  });
});
