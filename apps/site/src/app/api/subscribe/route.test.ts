import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/server', () => ({
  NextRequest: class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input, init);
    }
  },
  NextResponse: {
    json: vi.fn(
      (data, init) =>
        new Response(JSON.stringify(data), {
          ...init,
          headers: {
            'content-type': 'application/json',
            ...(init?.headers || {}),
          },
        }),
    ),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const originalEnv = process.env;

describe('subscribe route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MAILERLITE_API_KEY = 'test-api-key';
    global.fetch = mockFetch;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '123', email: 'test@example.com' }),
      clone: () => ({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123', email: 'test@example.com' }),
      }),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('subscribes a valid email', async () => {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'jane@carinyaparc.com.au',
        name: 'Jane',
        submissionTime: 5000,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('rejects requests without email', async () => {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ name: 'Guest' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 500 when MailerLite API key is missing', async () => {
    delete process.env.MAILERLITE_API_KEY;
    vi.resetModules();

    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'jane@carinyaparc.com.au',
        submissionTime: 5000,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
