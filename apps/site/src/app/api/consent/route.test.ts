import { cookies } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/consent/route';

describe('GET /api/consent', () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReset();
  });

  it('returns null when no cp_consent cookie is present', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ choice: null });
  });

  it('returns accepted when the cp_consent cookie is accepted', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'accepted' }),
    } as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ choice: 'accepted' });
  });
});
