import { afterEach, describe, expect, it } from 'vitest';

import { getNeonDatabaseUrl, normalizePostgresSslMode } from '@/lib/payload/env';

describe('normalizePostgresSslMode', () => {
  it('replaces legacy sslmode values with verify-full', () => {
    expect(
      normalizePostgresSslMode(
        'postgresql://user:pass@host/db?sslmode=require&channel_binding=require',
      ),
    ).toBe('postgresql://user:pass@host/db?sslmode=verify-full&channel_binding=require');

    expect(normalizePostgresSslMode('postgresql://user:pass@host/db?sslmode=prefer')).toBe(
      'postgresql://user:pass@host/db?sslmode=verify-full',
    );

    expect(normalizePostgresSslMode('postgresql://user:pass@host/db?foo=bar&sslmode=verify-ca')).toBe(
      'postgresql://user:pass@host/db?foo=bar&sslmode=verify-full',
    );
  });

  it('leaves verify-full and non-ssl URLs unchanged', () => {
    const verifyFull = 'postgresql://user:pass@host/db?sslmode=verify-full';
    expect(normalizePostgresSslMode(verifyFull)).toBe(verifyFull);

    const local = 'postgresql://payload:payload@localhost:5432/payload';
    expect(normalizePostgresSslMode(local)).toBe(local);
  });
});

describe('getNeonDatabaseUrl', () => {
  afterEach(() => {
    delete process.env.NEON_DATABASE_URL;
  });

  it('normalizes sslmode in the configured URL', () => {
    process.env.NEON_DATABASE_URL = 'postgresql://user:pass@host/db?sslmode=require';

    expect(getNeonDatabaseUrl()).toBe('postgresql://user:pass@host/db?sslmode=verify-full');
  });
});
