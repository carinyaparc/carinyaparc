import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMailerLiteSubscriberPayload, POST } from '@/app/api/subscribe/route';

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('buildMailerLiteSubscriberPayload', () => {
  it('persists canonical interest and source as MailerLite fields', () => {
    expect(
      buildMailerLiteSubscriberPayload({
        email: 'reader@example.com',
        interest: 'restoration',
        source: 'blog:soil-notes',
      }),
    ).toEqual({
      email: 'reader@example.com',
      fields: {
        interest: 'restoration',
        interests: 'restoration',
        source: 'blog:soil-notes',
      },
    });
  });

  it('maps legacy interests into interest + interests fields', () => {
    expect(
      buildMailerLiteSubscriberPayload({
        email: 'reader@example.com',
        name: 'Alex',
        interests: 'farming',
      }),
    ).toEqual({
      email: 'reader@example.com',
      fields: {
        name: 'Alex',
        interest: 'regenerative-farming',
        interests: 'regenerative-farming',
      },
    });
  });

  it('forwards unknown legacy interests without inventing a canonical interest', () => {
    expect(
      buildMailerLiteSubscriberPayload({
        email: 'reader@example.com',
        interests: 'something-custom',
      }),
    ).toEqual({
      email: 'reader@example.com',
      fields: {
        interests: 'something-custom',
      },
    });
  });
});

describe('POST /api/subscribe', () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.MAILERLITE_API_KEY;

  beforeEach(() => {
    process.env.MAILERLITE_API_KEY = 'test-key';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: '1' } }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.MAILERLITE_API_KEY;
    } else {
      process.env.MAILERLITE_API_KEY = originalApiKey;
    }
    vi.restoreAllMocks();
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('returns 400 for an invalid email', async () => {
    const response = await POST(jsonRequest({ email: 'nope', submissionTime: 5000 }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toMatch(/email/i);
  });

  it('returns 400 for an invalid interest enum', async () => {
    const response = await POST(
      jsonRequest({
        email: 'reader@example.com',
        interest: 'farming',
        submissionTime: 5000,
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when source exceeds 200 characters', async () => {
    const response = await POST(
      jsonRequest({
        email: 'reader@example.com',
        source: 's'.repeat(201),
        submissionTime: 5000,
      }),
    );
    expect(response.status).toBe(400);
  });

  it('silently succeeds on honeypot fill without calling MailerLite', async () => {
    const response = await POST(
      jsonRequest({
        email: 'bot@example.com',
        website: 'http://spam.example',
        submissionTime: 5000,
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('silently succeeds when submissionTime is too fast', async () => {
    const response = await POST(
      jsonRequest({
        email: 'fast@example.com',
        submissionTime: 500,
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('upserts to MailerLite with interest and source fields', async () => {
    const response = await POST(
      jsonRequest({
        email: 'blog.reader@carinyaparc.com.au',
        interest: 'community',
        source: 'blog:planting-day',
        submissionTime: 5000,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [, init] = vi.mocked(global.fetch).mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'blog.reader@carinyaparc.com.au',
      fields: {
        interest: 'community',
        interests: 'community',
        source: 'blog:planting-day',
      },
    });
  });

  it('accepts legacy interests from the standalone form', async () => {
    const response = await POST(
      jsonRequest({
        email: 'legacy.reader@carinyaparc.com.au',
        name: 'Jordan',
        interests: 'regeneration',
        website: '',
        submissionTime: 5000,
      }),
    );

    expect(response.status).toBe(200);
    const [, init] = vi.mocked(global.fetch).mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'legacy.reader@carinyaparc.com.au',
      fields: {
        name: 'Jordan',
        interest: 'restoration',
        interests: 'restoration',
      },
    });
  });
});
