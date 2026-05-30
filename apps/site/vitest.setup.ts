import { afterEach, vi } from 'vitest';

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
