export function getNeonDatabaseUrl(): string {
  const url = process.env.NEON_DATABASE_URL?.trim();

  if (url) {
    return url;
  }

  throw new Error(
    'NEON_DATABASE_URL is not set. Add your Postgres connection string to .env.local or Vercel environment variables.',
  );
}

export function getPayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    throw new Error(
      'PAYLOAD_SECRET is not set. Generate with `openssl rand -hex 32` and add it in Vercel environment variables.',
    );
  }

  return '';
}
