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

export function getServerSentryOptions(): NodeOptions {
  return {
    dsn: getServerSentryDsn(),
    sendDefaultPii: true,
    tracesSampleRate,
    includeLocalVariables: true,
    enableLogs: true,
    debug: false,
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
  };
}
