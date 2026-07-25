/**
 * Content Security Policy (CSP) utilities
 * Implements: T1.3, T1.4, SEC-001
 */

import type { NonceContext, CSPConfig, CSPResult } from './types';

/**
 * Generate a cryptographically secure nonce
 * Kept for callers that still want a request-scoped token; public CSP no longer
 * injects script nonces (static/ISR pages cannot stamp them onto scripts).
 *
 * @param requestId - Optional request correlation ID
 * @returns NonceContext with base64-encoded nonce and metadata
 */
export function generateNonce(requestId?: string): NonceContext {
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
 * Build complete CSP header without script nonce injection.
 * Public routes are static/ISR; a per-request nonce in CSP would disable
 * `'unsafe-inline'` and block Next.js flight scripts that have no nonce attrs.
 *
 * @param config - CSP configuration
 * @returns CSP result with header name and value
 */
export function buildCSPHeader(config: CSPConfig): CSPResult {
  let headerValue = buildCSPHeaderValue(config.directives);

  if (config.reportUri) {
    headerValue += `; report-uri ${config.reportUri}`;
  }

  const headerName = config.reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  return {
    headerName,
    headerValue,
    nonce: '',
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
