import { normalizeConsentChoice } from '@/lib/consent/types';

/** Cached positive consent for the current page session. Reset in tests via `resetAnalyticsConsentCache`. */
let acceptedCache: true | null = null;
let inflight: Promise<boolean> | null = null;

/**
 * Whether analytics may fire for this visitor.
 * Reads `GET /api/consent` (httpOnly cookie is not visible to JS).
 * Caches only an `accepted` result so a later banner accept is still detected.
 */
export async function hasAnalyticsConsent(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (acceptedCache === true) {
    return true;
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      const response = await fetch('/api/consent');
      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { choice?: unknown };
      const choice = normalizeConsentChoice(data.choice);
      if (choice === 'accepted') {
        acceptedCache = true;
        return true;
      }

      return false;
    } catch {
      return false;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Test helper — clears the in-memory consent cache. */
export function resetAnalyticsConsentCache(): void {
  acceptedCache = null;
  inflight = null;
}
