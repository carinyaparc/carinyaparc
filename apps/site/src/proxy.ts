/**
 * Next.js v16 proxy function for security headers
 * Applies CSP and security headers on matched routes.
 * See: https://nextjs.org/docs/app/guides/content-security-policy
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildCSPHeader } from './lib/security/csp';
import { generateSecurityHeaders, createSecurityHeadersConfig } from './lib/security/headers';
import { CSP_DIRECTIVES } from './lib/security/constants';

// Environment configuration
const SECURITY_CSP_ENABLED = process.env.SECURITY_CSP_ENABLED !== 'false';
const SECURITY_CSP_REPORT_ONLY = process.env.SECURITY_CSP_REPORT_ONLY === 'true';
const SECURITY_CSP_REPORT_URI = process.env.SECURITY_CSP_REPORT_URI || '/api/csp-report';
const IS_DEV = process.env.NODE_ENV === 'development';

// Circuit breaker state (in-memory)
let errorCount = 0;
let errorWindowStart = Date.now();
let circuitOpen = false;
const ERROR_THRESHOLD = 10; // errors per minute
const ERROR_WINDOW = 60000; // 1 minute
const CIRCUIT_RECOVERY_TIME = 300000; // 5 minutes

/**
 * Check and update circuit breaker state
 * Implements: T2.4 - Error handling
 */
function updateCircuitBreaker(): boolean {
  const now = Date.now();

  // Reset error count if window has passed
  if (now - errorWindowStart > ERROR_WINDOW) {
    errorCount = 0;
    errorWindowStart = now;
  }

  // Check if circuit should open
  if (!circuitOpen && errorCount >= ERROR_THRESHOLD) {
    circuitOpen = true;
    console.error('[Security Proxy] Circuit breaker opened due to error threshold');
    // Auto-recovery after 5 minutes
    setTimeout(() => {
      circuitOpen = false;
      errorCount = 0;
      console.info('[Security Proxy] Circuit breaker closed, resuming normal operation');
    }, CIRCUIT_RECOVERY_TIME);
  }

  return circuitOpen;
}

/**
 * Log error and increment circuit breaker counter
 */
function handleError(error: unknown, context: string) {
  errorCount++;
  console.error(`[Security Proxy] Error in ${context}:`, error);
  updateCircuitBreaker();
}

/**
 * Next.js v16 proxy function (default export)
 * Implements: T2.1, SEC-001, SEC-004
 */
export default function proxy(_request: NextRequest) {
  // Next.js requires the request argument; headers are applied uniformly today.
  void _request;
  try {
    // Check circuit breaker
    if (updateCircuitBreaker()) {
      console.warn('[Security Proxy] Circuit breaker open, skipping security headers');
      return NextResponse.next();
    }

    // Generate CSP (T2.1, SEC-001) — no script nonces (static/ISR public shell)
    if (!SECURITY_CSP_ENABLED) {
      // CSP disabled, just apply other headers
      const response = NextResponse.next();
      return applyNonCSPHeaders(response);
    }

    let cspHeaderName = '';
    let cspHeaderValue = '';

    try {
      // Build CSP directives (shallow-copy arrays we may mutate)
      const directives: Record<string, string[]> = Object.fromEntries(
        Object.entries(CSP_DIRECTIVES.BALANCED).map(([key, sources]) => [key, [...sources]]),
      );

      // Allow unsafe-inline for styles (Next.js injects styles without nonces)
      if (directives['style-src'] && !directives['style-src'].includes("'unsafe-inline'")) {
        directives['style-src'] = [...directives['style-src'], "'unsafe-inline'"];
      }

      // In development, also allow unsafe-eval for debugging/hot reload
      if (
        IS_DEV &&
        directives['script-src'] &&
        !directives['script-src'].includes("'unsafe-eval'")
      ) {
        directives['script-src'] = [...directives['script-src'], "'unsafe-eval'"];
      }

      const cspResult = buildCSPHeader({
        directives,
        reportOnly: SECURITY_CSP_REPORT_ONLY,
        reportUri: SECURITY_CSP_REPORT_URI,
      });

      cspHeaderName = cspResult.headerName;
      cspHeaderValue = cspResult.headerValue;
    } catch (error) {
      handleError(error, 'CSP generation');
      // Continue without CSP rather than blocking request
      const response = NextResponse.next();
      return applyNonCSPHeaders(response);
    }

    const response = NextResponse.next();

    // Set CSP on response headers
    response.headers.set(cspHeaderName, cspHeaderValue);

    // Cache-Control is intentionally not set here: Next.js/Vercel own caching
    // for HTML and static routes (ISR, on-demand revalidation), and sensitive
    // API responses set no-store in their own route handlers.

    // Apply security headers (T2.1, SEC-004)
    try {
      const securityConfig = createSecurityHeadersConfig();
      const securityHeaders = generateSecurityHeaders(securityConfig);

      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    } catch (error) {
      handleError(error, 'Security headers generation');
      // Continue without additional security headers
    }

    return response;
  } catch (error) {
    // Catch-all error handler (T2.4)
    handleError(error, 'proxy execution');
    // Never block the request - fail open
    return NextResponse.next();
  }
}

/**
 * Helper to apply non-CSP headers when CSP is disabled or fails
 */
function applyNonCSPHeaders(response: NextResponse): NextResponse {
  // Apply security headers
  try {
    const securityConfig = createSecurityHeadersConfig();
    const securityHeaders = generateSecurityHeaders(securityConfig);

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  } catch (error) {
    handleError(error, 'Security headers generation (fallback)');
  }

  return response;
}

/**
 * Proxy configuration
 * Implements: T2.2, SEC-007
 *
 * Match all paths except:
 * - _next/static (static files)
 * - _next/image (image optimization)
 * - favicon.ico (favicon file)
 * - public folder files (images, fonts, etc.)
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
};
