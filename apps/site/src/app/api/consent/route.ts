import { NextResponse } from 'next/server';

import { getConsent } from '@/lib/consent/get-consent';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getConsent();
  return NextResponse.json(status);
}
