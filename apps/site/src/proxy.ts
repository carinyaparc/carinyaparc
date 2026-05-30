/**
 * Next.js v16 proxy function for security headers
 * Follows Next.js v16 best practices for CSP with nonces
 * See: https://nextjs.org/docs/app/guides/content-security-policy
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, buildCSPHeader } from './lib/security/csp';
import { generateCacheControl, createDefaultCacheConfig } from './lib/security/cache';
import { generateSecurityHeaders, createSecurityHeadersConfig } from './lib/security/headers';
import { CSP_DIRECTIVES } from './lib/security/constants';

// Environment configuration
const SECURITY_CSP_ENABLED = process.env.SECURITY_CSP_ENABLED !== 'false';
const SECURITY_CSP_REPORT_ONLY = process.env.SECURITY_CSP_REPORT_ONLY === 'true';
const SECURITY_CACHE_ENABLED = process.env.SECURITY_CACHE_ENABLED !== 'false';
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
export default function proxy(request: NextRequest) {
  try {
    // Check circuit breaker
    if (updateCircuitBreaker()) {
      console.warn('[Security Proxy] Circuit breaker open, skipping security headers');
      return NextResponse.next();
    }

    const pathname = request.nextUrl.pathname;

    // Generate nonce for CSP (T2.1, SEC-001)
    if (!SECURITY_CSP_ENABLED) {
      // CSP disabled, just apply other headers
      const response = NextResponse.next();
      return applyNonCSPHeaders(response, pathname);
    }

    let nonce = '';
    let cspHeaderName = '';
    let cspHeaderValue = '';

    try {
      const nonceContext = generateNonce();
      nonce = nonceContext.nonce;

      // Build CSP directives
      const directives = { ...CSP_DIRECTIVES.BALANCED };

      // Allow unsafe-inline for styles (Next.js injects styles without nonces)
      // This is required for Next.js to work properly
      if (directives['style-src']) {
        directives['style-src'] = [...directives['style-src'], "'unsafe-inline'"];
      }

      // In development, also allow unsafe-eval for debugging/hot reload
      if (IS_DEV && directives['script-src']) {
        directives['script-src'] = [
          ...directives['script-src'],
          "'unsafe-eval'",
          "'unsafe-inline'",
        ];
      }

      const cspResult = buildCSPHeader(
        {
          directives,
          reportOnly: SECURITY_CSP_REPORT_ONLY,
          reportUri: SECURITY_CSP_REPORT_URI,
        },
        nonce,
      );

      cspHeaderName = cspResult.headerName;
      cspHeaderValue = cspResult.headerValue;
    } catch (error) {
      handleError(error, 'CSP generation');
      // Continue without CSP rather than blocking request
      const response = NextResponse.next();
      return applyNonCSPHeaders(response, pathname);
    }

    // Set nonce and CSP on request headers (Next.js v16 pattern)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set(cspHeaderName, cspHeaderValue);

    // Create response with modified request headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Set CSP on response headers
    response.headers.set(cspHeaderName, cspHeaderValue);

    // Apply cache control headers (T2.6, SEC-003)
    if (SECURITY_CACHE_ENABLED) {
      try {
        const cacheConfig = createDefaultCacheConfig();
        const cacheControl = generateCacheControl(pathname, cacheConfig);
        response.headers.set('Cache-Control', cacheControl);
      } catch (error) {
        handleError(error, 'Cache control generation');
        // Continue without cache control header
      }
    }

    // Apply security headers (T2.1, SEC-004)
    try {
      const securityConfig = createSecurityHeadersConfig();
      const securityHeaders = generateSecurityHeaders(securityConfig, { nonce });

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
function applyNonCSPHeaders(response: NextResponse, pathname: string): NextResponse {
  // Apply cache control
  if (SECURITY_CACHE_ENABLED) {
    try {
      const cacheConfig = createDefaultCacheConfig();
      const cacheControl = generateCacheControl(pathname, cacheConfig);
      response.headers.set('Cache-Control', cacheControl);
    } catch (error) {
      handleError(error, 'Cache control generation (fallback)');
    }
  }

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
