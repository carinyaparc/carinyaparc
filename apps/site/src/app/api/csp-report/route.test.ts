import { beforeEach, describe, expect, it, vi } from 'vitest';

const { captureMessage } = vi.hoisted(() => ({
  captureMessage: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage,
}));

import { GET, POST } from './route';

function post(body: string): Request {
  return new Request('http://localhost/api/csp-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/csp-report' },
    body,
  });
}

describe('POST /api/csp-report', () => {
  beforeEach(() => {
    captureMessage.mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('accepts a legacy report-uri payload and forwards it to Sentry', async () => {
    const response = await POST(
      post(
        JSON.stringify({
          'csp-report': {
            'document-uri': 'https://carinyaparc.com.au/',
            'effective-directive': 'script-src',
            'blocked-uri': 'https://evil.example',
          },
        }),
      ),
    );

    expect(response.status).toBe(204);
    expect(captureMessage).toHaveBeenCalledOnce();
    const [, context] = captureMessage.mock.calls[0]!;
    expect(context.extra.blockedUri).toBe('https://evil.example');
  });

  it('accepts a Reporting API payload', async () => {
    const response = await POST(
      post(
        JSON.stringify([
          {
            type: 'csp-violation',
            body: {
              documentURL: 'https://carinyaparc.com.au/',
              effectiveDirective: 'img-src',
              blockedURL: 'https://tracker.example/pixel.gif',
            },
          },
        ]),
      ),
    );

    expect(response.status).toBe(204);
    expect(captureMessage).toHaveBeenCalledOnce();
  });

  it('rejects malformed JSON', async () => {
    const response = await POST(post('not json'));
    expect(response.status).toBe(400);
    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('rejects payloads without a recognisable report', async () => {
    const response = await POST(post(JSON.stringify({ hello: 'world' })));
    expect(response.status).toBe(400);
    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('rejects oversized payloads', async () => {
    const response = await POST(post('x'.repeat(40_000)));
    expect(response.status).toBe(413);
    expect(captureMessage).not.toHaveBeenCalled();
  });
});

describe('GET /api/csp-report', () => {
  it('returns 405', async () => {
    const response = await GET();
    expect(response.status).toBe(405);
  });
});
