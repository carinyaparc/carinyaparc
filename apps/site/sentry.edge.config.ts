// This file configures the initialization of Sentry for edge features.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { getEdgeSentryOptions, shouldEnableSentry } from './src/lib/sentry/options';

if (shouldEnableSentry()) {
  Sentry.init({
    ...getEdgeSentryOptions(),
    integrations: [
      // Forward console.log / warn / error as structured logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
  });
}
