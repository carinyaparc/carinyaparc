/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@next/third-parties/google', () => ({
  GoogleTagManager: ({ gtmId }: { gtmId: string }) => (
    <div data-testid="google-tag-manager" data-gtm-id={gtmId} />
  ),
}));

vi.mock('@/lib/consent/actions', () => ({
  setConsent: vi.fn(),
}));

describe('ConsentGate', () => {
  let container: HTMLDivElement;
  let root: Root;
  let ConsentGate: typeof import('@/components/consent/ConsentGate').ConsentGate;

  beforeEach(async () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-TEST123');
    vi.resetModules();
    ({ ConsentGate } = await import('@/components/consent/ConsentGate'));

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('does not load GTM before consent is accepted', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: null }),
    } as Response);

    await act(async () => {
      root.render(<ConsentGate />);
    });

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/consent');
    });

    expect(container.querySelector('[data-testid="google-tag-manager"]')).toBeNull();
  });

  it('loads GTM after accepted consent', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'accepted' }),
    } as Response);

    await act(async () => {
      root.render(<ConsentGate />);
    });

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="google-tag-manager"]')).not.toBeNull();
    });

    const gtm = container.querySelector('[data-testid="google-tag-manager"]');

    expect(gtm?.getAttribute('data-gtm-id')).toBe('GTM-TEST123');
  });

  it('shows the banner when the consent API fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ choice: 'accepted' }),
    } as Response);

    await act(async () => {
      root.render(<ConsentGate />);
    });

    await vi.waitFor(() => {
      expect(container.textContent).toContain('Accept all');
    });

    expect(container.querySelector('[data-testid="google-tag-manager"]')).toBeNull();
  });

  it('shows the banner when the consent API returns an unknown choice', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'maybe' }),
    } as Response);

    await act(async () => {
      root.render(<ConsentGate />);
    });

    await vi.waitFor(() => {
      expect(container.textContent).toContain('Accept all');
    });

    expect(container.querySelector('[data-testid="google-tag-manager"]')).toBeNull();
  });
});
