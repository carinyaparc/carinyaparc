// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { getClientSentryOptions, shouldEnableSentry } from './lib/sentry/options';

if (shouldEnableSentry()) {
  Sentry.init({
    ...getClientSentryOptions(),
    integrations: [
      Sentry.replayIntegration(),
      // Forward console.log / warn / error as structured logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
  });
}

export const onRouterTransitionStart = shouldEnableSentry()
  ? Sentry.captureRouterTransitionStart
  : () => {};
