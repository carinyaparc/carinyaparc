import { afterEach, vi } from 'vitest';

process.env.PAYLOAD_SECRET ??= 'test-payload-secret';
process.env.DATABASE_URI ??= 'postgresql://payload:payload@localhost:5432/payload';
process.env.NEXT_PUBLIC_SERVER_URL ??= 'http://localhost:3000';
process.env.NEXT_PUBLIC_SENTRY_DSN ??= 'https://example.ingest.sentry.io/123';
process.env.SENTRY_DSN ??= process.env.NEXT_PUBLIC_SENTRY_DSN;

vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  withSentry: (handler: unknown) => handler,
  init: vi.fn(),
}));

vi.mock('server-only', () => ({}));

afterEach(() => {
  vi.clearAllMocks();
});
