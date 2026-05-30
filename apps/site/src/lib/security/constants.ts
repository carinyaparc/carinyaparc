/**
 * Security header constants and presets
 * Implements: T1.2, SEC-004, SEC-006
 */

import type { SecurityHeadersConfig, CacheControlConfig } from './types';

/**
 * Balanced CSP directives preset
 * Follows Next.js v16 best practices for nonce-based CSP
 * Allows GTM, Google Analytics, Google Fonts, and Vercel tooling while maintaining strong security.
 * Nonce is injected per request in proxy.ts; `'strict-dynamic'` trusts scripts loaded by nonced scripts.
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
      'https://vercel.live',
      "'strict-dynamic'",
      // Next.js RSC / hydration inline bootstrap (stable for a given Next build)
      "'sha256-mjAPvJKRBATPwtDkDe1t+tw2mbmVjgXVfYImJfeAdz8='",
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

/**
 * Default cache control patterns
 */
export const DEFAULT_CACHE_PATTERNS: CacheControlConfig = {
  sensitivePatterns: ['/api/subscribe', '/contact', '/api/auth/*'],
  authPatterns: ['/admin/*', '/api/auth/*'],
  publicPatterns: [
    '/blog/*',
    '/recipes/*',
    '/_next/static/*',
    '/_next/image/*',
    '/images/*',
    '/fonts/*',
  ],
};
