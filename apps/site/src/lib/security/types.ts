/**
 * Type definitions for security headers module
 * Implements: T1.1, SEC-004
 */

/**
 * Context object returned when generating a nonce
 */
export interface NonceContext {
  /** Cryptographically secure uuid v4 nonce */
  nonce: string;
  /** Unix timestamp (ms) when nonce was generated */
  timestamp: number;
  /** Optional correlation ID for distributed tracing */
  requestId?: string;
}

/**
 * CSP directive names supported by the security module
 */
export type CSPDirective =
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'connect-src'
  | 'frame-src'
  | 'object-src'
  | 'base-uri'
  | 'form-action';

/**
 * Configuration for CSP header generation
 */
export interface CSPConfig {
  /** CSP directives mapping directive names to allowed sources */
  directives: Record<string, string[]>;
  /** Whether to use Content-Security-Policy-Report-Only header */
  reportOnly?: boolean;
  /** URI to send CSP violation reports to */
  reportUri?: string;
}

/**
 * Result of CSP header generation
 */
export interface CSPResult {
  /** The header name (Content-Security-Policy or Content-Security-Policy-Report-Only) */
  headerName: string;
  /** The complete CSP header value */
  headerValue: string;
  /** The nonce that was injected into the CSP */
  nonce: string;
}

/**
 * Configuration for security headers generation
 */
export interface SecurityHeadersConfig {
  /** HTTP Strict Transport Security configuration */
  hsts: {
    /** Max age in seconds (e.g., 63072000 = 2 years) */
    maxAge: number;
    /** Include all subdomains */
    includeSubDomains: boolean;
    /** Submit to HSTS preload list */
    preload: boolean;
  };
  /** Referrer-Policy header value */
  referrerPolicy:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
  /** X-Frame-Options header value */
  frameOptions: 'DENY' | 'SAMEORIGIN';
  /** Permissions-Policy features mapping */
  permissionsPolicy: Record<string, string[]>;
}

/**
 * Options for security headers generation
 */
export interface SecurityHeadersOptions {
  /** Nonce to include in headers if applicable */
  nonce?: string;
  /** Environment context (affects some header values) */
  environment?: 'development' | 'production';
}
