// Types (safe to import anywhere)
export type { SessionPayload, User, SessionConfig } from './types';

// Server-only functions (can only be imported in server components/routes)
export { getSession, setSession, updateSession, clearSession } from './server';
export { SESSION_COOKIE_NAME } from '@/lib/constants';
