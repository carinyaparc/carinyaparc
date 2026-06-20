import 'server-only';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE_NAME } from '@/lib/constants';

import type { ConsentStatusResponse } from '@/lib/consent/types';

export type { ConsentStatusResponse } from '@/lib/consent/types';

export async function getConsent(): Promise<ConsentStatusResponse> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CONSENT_COOKIE_NAME)?.value;

  if (value === 'accepted' || value === 'rejected') {
    return { choice: value };
  }

  return { choice: null };
}
