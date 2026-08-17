import type { BrowserOptions, EdgeOptions, NodeOptions } from '@sentry/nextjs';

export function getPublicSentryDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function getServerSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function shouldEnableSentry(): boolean {
  return process.env.NODE_ENV === 'production' && Boolean(getServerSentryDsn());
}

const tracesSampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1;

/**
 * Minimal shape of the parts of a Sentry event that this filter inspects.
 * Kept loose so it doesn't conflict with the DOM `ErrorEvent` global and
 * remains assignable from the real Sentry `Event` type passed to beforeSend.
 */
interface SentryEventShape {
  exception?: {
    values?: Array<{
      type?: string | null;
      mechanism?: { type?: string | null };
      value?: string | null;
      stacktrace?: { frames?: Array<{ in_app?: boolean | null }> | null } | null;
    } | null>;
  } | null;
}

/**
 * Mechanism type strings that indicate an unhandled promise rejection.
 *
 * Three known forms:
 *  - 'onunhandledrejection'                                  — Node SDK (legacy, pre-10.65)
 *  - 'auto.node.onunhandledrejection'                        — Node SDK (≥10.65, trace-origin naming)
 *  - 'auto.browser.global_handlers.onunhandledrejection'     — Browser SDK
 *
 * The Node SDK changed mechanism type in PR #17636 (sentry-javascript) to follow
 * the same trace-origin naming convention as the browser global handlers. All three
 * strings must be covered to ensure filters remain effective across SDK upgrades.
 */
const UNHANDLED_REJECTION_TYPES = new Set([
  'onunhandledrejection',
  'auto.node.onunhandledrejection',
  'auto.browser.global_handlers.onunhandledrejection',
]);

/**
 * Returns true for undefined unhandled rejections that originate entirely
 * inside node_modules (no in_app frames). These come from the pg pool during
 * Neon serverless cold-start connection resets and produce noise without
 * actionable signal. They started being captured when @sentry/nextjs was
 * updated to 10.56.0 which broadened the onUnhandledRejection handler.
 *
 * The Sentry Node SDK changed its mechanism type string in the 10.65 era
 * (PR #17636 in sentry-javascript) from 'onunhandledrejection' to
 * 'auto.node.onunhandledrejection'. Both strings are covered via the shared
 * UNHANDLED_REJECTION_TYPES set to handle all SDK versions.
 */
export function isPgPoolNoiseEvent(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  const mechanismType = firstException?.mechanism?.type ?? '';
  if (!UNHANDLED_REJECTION_TYPES.has(mechanismType) || firstException?.value !== 'undefined') {
    return false;
  }

  const frames = firstException.stacktrace?.frames ?? [];
  const hasAppFrame = frames.some((f) => f.in_app === true);

  return !hasAppFrame;
}

/**
 * Returns true for "Connection closed." unhandled rejections thrown by
 * React's RSC streaming client (react-server-dom-turbopack-client) when the
 * server-side RSC response stream closes before the browser finishes reading
 * it. This typically occurs on 404 pages, rapid client-side navigations, or
 * after transient network drops (especially on mobile). All stack frames live
 * inside Next.js internals — there is no application code on the path — so
 * the event carries no actionable signal.
 */
export function isRscConnectionClosedNoise(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  const mechanismType = firstException?.mechanism?.type ?? '';
  if (
    !UNHANDLED_REJECTION_TYPES.has(mechanismType) ||
    firstException?.value !== 'Connection closed.'
  ) {
    return false;
  }

  const frames = firstException.stacktrace?.frames ?? [];
  const hasAppFrame = frames.some((f) => f.in_app === true);

  return !hasAppFrame;
}

export function getServerSentryOptions(): NodeOptions {
  return {
    dsn: getServerSentryDsn(),
    sendDefaultPii: true,
    tracesSampleRate,
    includeLocalVariables: true,
    enableLogs: true,
    debug: false,
    beforeSend(event) {
      return isPgPoolNoiseEvent(event) ? null : event;
    },
  };
}

export function getEdgeSentryOptions(): EdgeOptions {
  return {
    dsn: getServerSentryDsn(),
    sendDefaultPii: true,
    tracesSampleRate,
    enableLogs: true,
    debug: false,
  };
}

/**
 * Returns true for TypeErrors thrown when browser-extension or injected
 * WKWebView-bridge scripts access `window.webkit.messageHandlers` in a
 * context where the WebKit native bridge is unavailable. This occurs on
 * Safari desktop, all iOS browsers, and Chromium with certain extensions —
 * none of which come from application code (no in-app frames). Suppressing
 * this event is safe because the property doesn't exist anywhere in the
 * codebase; any future intentional use would add in-app frames and would
 * not be filtered.
 */
export function isWebkitMessageHandlerNoise(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  const message = firstException?.value ?? '';
  if (!message.includes('window.webkit.messageHandlers')) {
    return false;
  }

  const frames = firstException?.stacktrace?.frames ?? [];
  const hasAppFrame = frames.some((f) => f.in_app === true);

  return !hasAppFrame;
}

/**
 * Returns true for `TypeError: Failed to construct 'URL': Invalid URL` events
 * that have no in-app stack frames.
 *
 * Root cause (WEBSITE-N): the Sentry SDK's app-router routing instrumentation
 * (`appRouterRoutingInstrumentation.js`) calls `new URL(href, location.href)`
 * without a try-catch when processing router transitions.  If a Next.js Link
 * href resolves to a malformed absolute URL (e.g. `"http:"` — scheme only,
 * no authority), the URL constructor throws and the error propagates to the
 * global handler.  The primary fix is `eventSignupHref` (which now validates
 * `signupTarget` before returning it) and Payload collection-level validation
 * that rejects non-http/https values at save time.  This filter acts as a
 * safety net for any residual events or similar patterns from third-party code.
 *
 * Keeping the in-app-frames guard ensures that any future `new URL()` call
 * that we add to application code (with in-app frames) still fires in Sentry.
 */
export function isInvalidUrlConstructionNoise(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  const message = firstException?.value ?? '';
  if (!message.includes("Failed to construct 'URL'") && !message.includes('Invalid URL')) {
    return false;
  }

  const frames = firstException?.stacktrace?.frames ?? [];
  const hasAppFrame = frames.some((f) => f.in_app === true);

  return !hasAppFrame;
}

/**
 * Returns true for `EvalError` events that have no in-app stack frames.
 *
 * Root cause (WEBSITE-Q): Google Tag Manager executes Custom JavaScript
 * Variables via `new Function(...)` internally. Because the site CSP
 * intentionally omits `'unsafe-eval'`, this call throws an `EvalError` that
 * propagates uncaught to Sentry's global error handler.  Unlike Zod's probe
 * (WEBSITE-P — wrapped in try/catch so only a `securitypolicyviolation` event
 * fired), GTM's runtime does not catch the EvalError, so it reaches Sentry.
 *
 * All stack frames come from GTM's script loaded from
 * `www.googletagmanager.com` — there are no in-app frames.  The in-app-frames
 * guard ensures any future application-level `eval()` usage (which would have
 * in-app frames) still fires in Sentry.
 */
export function isEvalErrorNoise(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  if (firstException?.type !== 'EvalError') {
    return false;
  }

  const frames = firstException?.stacktrace?.frames ?? [];
  const hasAppFrame = frames.some((f) => f.in_app === true);

  return !hasAppFrame;
}

export function getClientSentryOptions(): BrowserOptions {
  return {
    dsn: getPublicSentryDsn(),
    sendDefaultPii: true,
    tracesSampleRate,
    integrations: [],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: true,
    debug: false,
    beforeSend(event) {
      if (isRscConnectionClosedNoise(event)) return null;
      if (isWebkitMessageHandlerNoise(event)) return null;
      if (isInvalidUrlConstructionNoise(event)) return null;
      if (isEvalErrorNoise(event)) return null;
      return event;
    },
  };
}
