/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { hasAnalyticsConsent, resetAnalyticsConsentCache } from '@/lib/analytics/consent';
import {
  trackArticleScrollDepth,
  trackSubscribeComplete,
  trackSubscribeStart,
} from '@/lib/analytics/events';
import { trackEventAsync } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/types';

describe('analytics helpers', () => {
  beforeEach(() => {
    resetAnalyticsConsentCache();
    vi.stubGlobal('fetch', vi.fn());
    window.dataLayer = [];
    delete (window as { va?: unknown }).va;
  });

  afterEach(() => {
    resetAnalyticsConsentCache();
    vi.unstubAllGlobals();
    delete (window as { dataLayer?: unknown }).dataLayer;
  });

  it('hasAnalyticsConsent returns false when choice is null', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: null }),
    } as Response);

    await expect(hasAnalyticsConsent()).resolves.toBe(false);
  });

  it('hasAnalyticsConsent returns false when choice is rejected', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'rejected' }),
    } as Response);

    await expect(hasAnalyticsConsent()).resolves.toBe(false);
  });

  it('hasAnalyticsConsent returns true and caches accepted', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'accepted' }),
    } as Response);

    await expect(hasAnalyticsConsent()).resolves.toBe(true);
    await expect(hasAnalyticsConsent()).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('trackEventAsync no-ops without consent (no dataLayer push)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'rejected' }),
    } as Response);

    const pushed = await trackEventAsync(ANALYTICS_EVENTS.subscribeStart, {
      source: 'blog:test',
    });

    expect(pushed).toBe(false);
    expect(window.dataLayer).toEqual([]);
  });

  it('trackEventAsync pushes to dataLayer and va when consent is accepted', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'accepted' }),
    } as Response);

    const va = vi.fn();
    (window as { va?: typeof va }).va = va;

    const pushed = await trackEventAsync(ANALYTICS_EVENTS.subscribeComplete, {
      source: 'blog:test',
      interest: 'community',
    });

    expect(pushed).toBe(true);
    expect(window.dataLayer).toEqual([
      {
        event: 'subscribe_complete',
        source: 'blog:test',
        interest: 'community',
      },
    ]);
    expect(va).toHaveBeenCalledWith('track', 'subscribe_complete', {
      source: 'blog:test',
      interest: 'community',
    });
  });

  it('typed subscribe helpers omit undefined interest', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choice: 'accepted' }),
    } as Response);

    trackSubscribeStart({ source: 'blog:slug' });
    trackSubscribeComplete({ source: 'blog:slug', interest: 'learning' });
    trackArticleScrollDepth({ depth: 25 });

    await vi.waitFor(() => {
      expect(window.dataLayer?.length).toBe(3);
    });

    expect(window.dataLayer).toEqual([
      { event: 'subscribe_start', source: 'blog:slug' },
      { event: 'subscribe_complete', source: 'blog:slug', interest: 'learning' },
      { event: 'article_scroll_depth', depth: 25 },
    ]);
  });
});
