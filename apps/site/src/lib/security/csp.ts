/**
 * Content Security Policy (CSP) utilities
 * Implements: T1.3, T1.4, SEC-001
 */

import type { NonceContext, CSPConfig, CSPResult } from './types';

/**
 * Generate a cryptographically secure nonce for CSP
 * Implements: T1.3, SEC-001
 * Uses Web Crypto API for Edge Runtime compatibility
 * Encodes nonce as base64 per Next.js v16 best practices
 *
 * @param requestId - Optional request correlation ID
 * @returns NonceContext with base64-encoded nonce and metadata
 */
export function generateNonce(requestId?: string): NonceContext {
  // Generate UUID and encode as base64 (Next.js v16 recommendation)
  const uuid = crypto.randomUUID();
  const nonce = Buffer.from(uuid).toString('base64');

  return {
    nonce,
    timestamp: Date.now(),
    requestId,
  };
}

/**
 * Format nonce for CSP directive value
 *
 * @param nonce - The nonce string
 * @returns Formatted nonce (e.g., 'nonce-abc123')
 */
export function formatNonceForCSP(nonce: string): string {
  return `'nonce-${nonce}'`;
}

/**
 * Inject nonce into CSP directives
 * Adds nonce to script-src only (not style-src)
 *
 * Note: We don't inject nonce into style-src because:
 * 1. Next.js and React inject inline styles without nonces
 * 2. When a nonce is present in CSP, 'unsafe-inline' is ignored
 * 3. We use 'unsafe-inline' for styles to support framework-injected styles
 *
 * @param directives - Original CSP directives
 * @param nonce - Nonce to inject
 * @returns Updated directives with nonce
 */
function injectNonceIntoDirectives(
  directives: Record<string, string[]>,
  nonce: string,
): Record<string, string[]> {
  const updated = { ...directives };
  const formattedNonce = formatNonceForCSP(nonce);

  // Inject nonce into script-src and script-src-elem (Next.js script tags use src + nonce)
  if (updated['script-src']) {
    updated['script-src'] = [formattedNonce, ...updated['script-src']];
  }

  if (updated['script-src-elem']) {
    updated['script-src-elem'] = [formattedNonce, ...updated['script-src-elem']];
  }

  // DO NOT inject nonce into style-src - see function comment above
  // The 'unsafe-inline' in proxy.ts handles inline styles

  return updated;
}

/**
 * Build CSP header value from directives
 *
 * @param directives - CSP directives to build from
 * @returns Complete CSP header value string
 */
function buildCSPHeaderValue(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      // Handle directives with no sources (e.g., upgrade-insecure-requests)
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Build complete CSP header with nonce injection
 * Implements: T1.4, SEC-001
 *
 * @param config - CSP configuration
 * @param nonce - Nonce to inject into directives
 * @returns CSP result with header name, value, and nonce
 */
export function buildCSPHeader(config: CSPConfig, nonce: string): CSPResult {
  // Inject nonce into directives
  const directivesWithNonce = injectNonceIntoDirectives(config.directives, nonce);

  // Build header value
  let headerValue = buildCSPHeaderValue(directivesWithNonce);

  // Add report URI if configured
  if (config.reportUri) {
    headerValue += `; report-uri ${config.reportUri}`;
  }

  // Determine header name based on report-only mode
  const headerName = config.reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  return {
    headerName,
    headerValue,
    nonce,
  };
}

/**
 * Validate CSP configuration
 *
 * @param config - CSP configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateCSPConfig(config: CSPConfig): boolean {
  if (!config.directives || typeof config.directives !== 'object') {
    return false;
  }

  // Ensure at least default-src is present
  if (!config.directives['default-src']) {
    return false;
  }

  return true;
}
