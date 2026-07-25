/**
 * Security header constants and presets
 * Implements: T1.2, SEC-004, SEC-006
 */

import type { SecurityHeadersConfig } from './types';

/**
 * Balanced CSP directives preset for the public static/ISR site.
 *
 * Public routes use a static shell (no per-request script nonces). Nonce-based
 * `'strict-dynamic'` CSP is incompatible with that model — Next.js flight
 * scripts are parser-inserted inline scripts without nonces. This policy uses
 * host allowlists plus `'unsafe-inline'` for scripts so hydration works.
 *
 * Vercel Toolbar hosts follow
 * https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
 * Revisit nonce + strict-dynamic only if public routes become fully dynamic.
 */
export const CSP_BALANCED_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'blob:',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://*.vercel-scripts.com',
    'https://vercel.live',
  ],
  'style-src': ["'self'", 'https://fonts.googleapis.com', 'https://vercel.live'],
  'img-src': [
    "'self'",
    'blob:',
    'data:',
    'https://www.google-analytics.com',
    'https://*.googleusercontent.com',
    'https://vercel.live',
    'https://vercel.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://vercel.live',
    'https://assets.vercel.com',
  ],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://*.google-analytics.com',
    'https://*.sentry.io',
    'https://vitals.vercel-insights.com',
    'https://vercel.live',
    'wss://vercel.live',
    'wss://ws-us3.pusher.com',
  ],
  'worker-src': ["'self'", 'blob:'],
  'frame-src': ["'self'", 'https://www.googletagmanager.com', 'https://vercel.live'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/** Named CSP presets. Prefer `CSP_BALANCED_DIRECTIVES` for the public site. */
export const CSP_DIRECTIVES = {
  BALANCED: CSP_BALANCED_DIRECTIVES,
} as const;

/**
 * Production security headers preset
 * Configured for SecurityHeaders.com A+ rating
 */
export const SECURITY_HEADER_PRESETS: Record<string, SecurityHeadersConfig> = {
  PRODUCTION: {
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    frameOptions: 'DENY',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  },
};
