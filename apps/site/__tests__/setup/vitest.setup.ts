import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Only import and setup MSW in jsdom environment
const isJsdomEnvironment = typeof window !== 'undefined';

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  withSentry: (handler: any) => handler,
  init: vi.fn(),
}));

// Mock server-only package for test environment
vi.mock('server-only', () => ({}));

// Only mock browser APIs if we're in jsdom environment
if (isJsdomEnvironment) {
  // Mock browser APIs not available in jsdom
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));
}

// Setup MSW server for API mocking only in jsdom environment
if (isJsdomEnvironment) {
  const { setupServer } = await import('msw/node');
  const { handlers } = await import('../mocks/handlers');

  const server = setupServer(...handlers);

  // Start MSW server before all tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}

// Environment-agnostic cleanup
afterEach(() => {
  vi.clearAllMocks();
});

// Export a placeholder to satisfy TypeScript
export {};
