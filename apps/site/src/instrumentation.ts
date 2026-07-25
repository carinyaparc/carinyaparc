import * as Sentry from '@sentry/nextjs';

import { getServerSentryDsn, shouldEnableSentry } from './lib/sentry/options';

export async function register() {
  if (!getServerSentryDsn()) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = shouldEnableSentry() ? Sentry.captureRequestError : () => {};
