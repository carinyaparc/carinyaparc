'use server';

import { cookies } from 'next/headers';
import { CONSENT_COOKIE_NAME } from '@/lib/constants';

export type ConsentChoice = 'accepted' | 'rejected';

export async function setConsent(
  consent: ConsentChoice,
): Promise<{ success: boolean; error?: string }> {
  if (!['accepted', 'rejected'].includes(consent)) {
    return { success: false, error: 'Invalid consent value' };
  }

  const cookieStore = await cookies();
  cookieStore.set(CONSENT_COOKIE_NAME, consent, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return { success: true };
}
