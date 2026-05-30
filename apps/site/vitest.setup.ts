import { afterEach, vi } from 'vitest';

process.env.PAYLOAD_SECRET ??= 'test-payload-secret';
process.env.DATABASE_URI ??= 'postgresql://payload:payload@localhost:5432/payload';
process.env.NEXT_PUBLIC_SERVER_URL ??= 'http://localhost:3000';

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
