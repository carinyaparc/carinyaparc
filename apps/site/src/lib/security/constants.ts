/**
 * Security header constants and presets
 * Implements: T1.2, SEC-004, SEC-006
 */

import type { SecurityHeadersConfig } from './types';

/**
 * Balanced CSP directives preset
 * Follows Next.js v16 best practices for nonce-based CSP
 * Allows GTM, Google Analytics, Google Fonts, and Vercel tooling while maintaining strong security.
 * Nonce is injected per request in proxy.ts; `'strict-dynamic'` in `script-src` trusts scripts
 * loaded by nonced scripts. `script-src-elem` is separate so host allowlists (e.g. Vercel toolbar)
 * still apply to `<script src="…">` tags — strict-dynamic disables host allowlists in script-src.
 */
export const CSP_DIRECTIVES: Record<string, Record<string, string[]>> = {
  BALANCED: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      'blob:',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://*.vercel-scripts.com',
      "'strict-dynamic'",
      // Next.js RSC / hydration inline bootstrap (stable for a given Next build)
      "'sha256-mjAPvJKRBATPwtDkDe1t+tw2mbmVjgXVfYImJfeAdz8='",
      // Site-wide Organization JSON-LD in the public layout shell
      "'sha256-MAYHmAgp9szqC9iYA0JbHfsQnLabVS8yaUOhlc2vEFY='",
    ],
    'script-src-elem': [
      "'self'",
      'blob:',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://*.vercel-scripts.com',
      'https://vercel.live',
      "'sha256-mjAPvJKRBATPwtDkDe1t+tw2mbmVjgXVfYImJfeAdz8='",
      "'sha256-MAYHmAgp9szqC9iYA0JbHfsQnLabVS8yaUOhlc2vEFY='",
    ],
    'style-src': ["'self'", 'https://fonts.googleapis.com'],
    'img-src': [
      "'self'",
      'blob:',
      'data:',
      'https://www.google-analytics.com',
      'https://*.googleusercontent.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
      'https://*.google-analytics.com',
      'https://*.sentry.io',
      'https://vitals.vercel-insights.com',
      'https://vercel.live',
      'wss://vercel.live',
    ],
    'worker-src': ["'self'", 'blob:'],
    'frame-src': ["'self'", 'https://www.googletagmanager.com', 'https://vercel.live'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  },
};

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
