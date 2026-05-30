import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import type { SessionPayload } from './types';

// Make sure SESSION_SECRET is set in your .env file
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error('SESSION_SECRET environment variable is not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

// Get session data from cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

// Set session data in cookie
export async function setSession(data: SessionPayload): Promise<void> {
  const session = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Configure expiration time as needed
    .sign(encodedKey);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: '/',
  });
}

// Update session data
export async function updateSession(
  updater: (data: SessionPayload) => SessionPayload,
): Promise<void> {
  const currentSession = await getSession();
  if (!currentSession) {
    throw new Error('No active session to update');
  }
  const updatedSession = updater(currentSession);
  await setSession(updatedSession);
}

// Clear session data
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
