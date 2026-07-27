// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { config as zodConfig } from 'zod';
import * as Sentry from '@sentry/nextjs';

import { getClientSentryOptions, shouldEnableSentry } from './lib/sentry/options';

// Zod v4 probes JIT availability with `new Function("")` at object-schema
// creation time. Even though the call is wrapped in try/catch, browsers still
// fire a `securitypolicyviolation` event when CSP blocks eval — which lands as
// a Sentry noise issue (WEBSITE-P). Setting jitless:true skips the probe
// entirely; validation behaviour is identical, just without the JIT fast-path.
// This must run before any client-side Zod schema is first created.
zodConfig({ jitless: true });

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
