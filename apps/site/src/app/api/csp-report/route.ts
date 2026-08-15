/**
 * CSP violation report endpoint.
 *
 * Receives reports from the report-uri directive set in proxy.ts. Accepts both
 * the legacy report-uri payload ({ "csp-report": { ... } }) and the Reporting
 * API shape ([{ type: "csp-violation", body: { ... } }]).
 *
 * Only processes reports whose document-uri originates from our own domain(s).
 * Off-domain reports (e.g. third parties that misconfigure their report-uri) are
 * silently discarded to prevent foreign CSP violations from polluting Sentry.
 */

import { NextResponse } from 'next/server';
import { captureMessage } from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 32_768;

// Hostnames that are allowed to submit CSP reports to this endpoint.
// Covers production, local development, and Vercel preview deployments.
const ALLOWED_REPORT_HOSTNAMES: ReadonlySet<string> = new Set([
  'carinyaparc.com.au',
  'www.carinyaparc.com.au',
  'localhost',
  '127.0.0.1',
  '[::1]',
]);

/**
 * Returns true when the documentUri hostname is one of our own origins.
 * Vercel preview URLs (*.vercel.app) are also accepted so that CSP errors
 * surfaced during preview reviews reach Sentry.
 */
export function isAllowedReportOrigin(documentUri: string | undefined): boolean {
  if (!documentUri) return false;
  try {
    const { hostname } = new URL(documentUri);
    if (ALLOWED_REPORT_HOSTNAMES.has(hostname)) return true;
    if (hostname.endsWith('.vercel.app')) return true;
    return false;
  } catch {
    return false;
  }
}

// Cap Sentry captures per instance so a report flood cannot burn quota;
// violations are always written to server logs regardless.
const SENTRY_CAPTURE_LIMIT = 10;
const SENTRY_CAPTURE_WINDOW_MS = 60_000;
let captureCount = 0;
let captureWindowStart = Date.now();

type CSPReport = {
  documentUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  blockedUri?: string;
  sourceFile?: string;
  lineNumber?: number;
  disposition?: string;
};

function pickReportFields(raw: Record<string, unknown>): CSPReport {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const value = raw[key];
      if (typeof value === 'string' || typeof value === 'number') {
        return value;
      }
    }
    return undefined;
  };

  return {
    documentUri: get('document-uri', 'documentURL') as string | undefined,
    violatedDirective: get('violated-directive') as string | undefined,
    effectiveDirective: get('effective-directive', 'effectiveDirective') as string | undefined,
    blockedUri: get('blocked-uri', 'blockedURL') as string | undefined,
    sourceFile: get('source-file', 'sourceFile') as string | undefined,
    lineNumber: get('line-number', 'lineNumber') as number | undefined,
    disposition: get('disposition') as string | undefined,
  };
}

function extractReports(payload: unknown): CSPReport[] {
  // Legacy report-uri shape: { "csp-report": { ... } }
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const body = (payload as Record<string, unknown>)['csp-report'];
    if (body && typeof body === 'object') {
      return [pickReportFields(body as Record<string, unknown>)];
    }
  }

  // Reporting API shape: [{ type: "csp-violation", body: { ... } }]
  if (Array.isArray(payload)) {
    return payload
      .filter(
        (entry): entry is { type?: string; body: Record<string, unknown> } =>
          Boolean(entry) &&
          typeof entry === 'object' &&
          typeof (entry as { body?: unknown }).body === 'object' &&
          (entry as { body?: unknown }).body !== null,
      )
      .filter((entry) => entry.type === undefined || entry.type === 'csp-violation')
      .map((entry) => pickReportFields(entry.body));
  }

  return [];
}

function underSentryCaptureLimit(): boolean {
  const now = Date.now();

  if (now - captureWindowStart > SENTRY_CAPTURE_WINDOW_MS) {
    captureCount = 0;
    captureWindowStart = now;
  }

  captureCount += 1;
  return captureCount <= SENTRY_CAPTURE_LIMIT;
}

export async function POST(request: Request) {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (raw.length > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const reports = extractReports(payload);

  if (reports.length === 0) {
    return new NextResponse(null, { status: 400 });
  }

  // Discard reports from foreign origins. Third parties that point their own
  // report-uri at this endpoint (intentionally or by misconfiguration) would
  // otherwise pollute Sentry with violations that are not ours to fix.
  const ownReports = reports.filter((r) => isAllowedReportOrigin(r.documentUri));
  if (ownReports.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  for (const report of ownReports) {
    console.warn({ event: 'csp_violation', ...report });

    if (underSentryCaptureLimit()) {
      captureMessage('CSP violation', {
        level: 'warning',
        tags: {
          feature: 'csp_report',
          effective_directive: report.effectiveDirective ?? 'unknown',
        },
        extra: { ...report },
        fingerprint: [
          'csp-violation',
          report.effectiveDirective ?? 'unknown',
          report.blockedUri ?? 'unknown',
        ],
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
