import { NextResponse } from 'next/server';

import { getConsent } from '@/lib/consent/get-consent';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getConsent();
  return NextResponse.json(status, {
    headers: {
      // Per-visitor consent state must never be cached by browsers or CDNs.
      'Cache-Control': 'no-store',
    },
  });
}
