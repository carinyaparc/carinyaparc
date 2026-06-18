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
      mechanism?: { type?: string | null };
      value?: string | null;
      stacktrace?: { frames?: Array<{ in_app?: boolean | null }> | null } | null;
    } | null>;
  } | null;
}

/**
 * Returns true for undefined unhandled rejections that originate entirely
 * inside node_modules (no in_app frames). These come from the pg pool during
 * Neon serverless cold-start connection resets and produce noise without
 * actionable signal. They started being captured when @sentry/nextjs was
 * updated to 10.56.0 which broadened the onUnhandledRejection handler.
 */
export function isPgPoolNoiseEvent(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  if (
    firstException?.mechanism?.type !== 'onunhandledrejection' ||
    firstException?.value !== 'undefined'
  ) {
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
 * it. This typically occurs on 404 pages or after transient network drops and
 * produces no actionable signal because all stack frames are inside Next.js
 * internals — there is no application code on the path.
 */
export function isRscConnectionClosedNoise(event: SentryEventShape): boolean {
  const firstException = event.exception?.values?.[0];

  if (
    firstException?.mechanism?.type !== 'onunhandledrejection' ||
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
      return isRscConnectionClosedNoise(event) ? null : event;
    },
  };
}
