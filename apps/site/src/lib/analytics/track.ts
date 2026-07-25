import { hasAnalyticsConsent } from '@/lib/analytics/consent';
import type { AnalyticsEventName } from '@/lib/analytics/types';

type DataLayerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  va?: (command: 'track', eventName: string, properties?: Record<string, unknown>) => void;
};

function getAnalyticsWindow(): DataLayerWindow | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as DataLayerWindow;
}

function pushToDataLayer(event: AnalyticsEventName, params: Record<string, unknown>): void {
  const win = getAnalyticsWindow();
  if (!win) {
    return;
  }

  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...params });
}

function pushToVercelAnalytics(event: AnalyticsEventName, params: Record<string, unknown>): void {
  const win = getAnalyticsWindow();
  if (!win?.va) {
    return;
  }

  win.va('track', event, params);
}

/**
 * Consent-gated analytics push. No-ops when consent is missing, rejected, or unknowable.
 * Fire-and-forget so callers stay sync-friendly in event handlers.
 */
export function trackEvent(event: AnalyticsEventName, params: Record<string, unknown> = {}): void {
  void (async () => {
    if (!(await hasAnalyticsConsent())) {
      return;
    }

    pushToDataLayer(event, params);
    pushToVercelAnalytics(event, params);
  })();
}

/** Test / advanced use: await the consent check and push. */
export async function trackEventAsync(
  event: AnalyticsEventName,
  params: Record<string, unknown> = {},
): Promise<boolean> {
  if (!(await hasAnalyticsConsent())) {
    return false;
  }

  pushToDataLayer(event, params);
  pushToVercelAnalytics(event, params);
  return true;
}
