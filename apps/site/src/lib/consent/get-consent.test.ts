import { cookies } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getConsent } from '@/lib/consent/get-consent';

describe('getConsent', () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReset();
  });

  it('returns null when no consent cookie is set', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    await expect(getConsent()).resolves.toEqual({ choice: null });
  });

  it('returns accepted when the consent cookie is accepted', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'accepted' }),
    } as never);

    await expect(getConsent()).resolves.toEqual({ choice: 'accepted' });
  });

  it('returns rejected when the consent cookie is rejected', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'rejected' }),
    } as never);

    await expect(getConsent()).resolves.toEqual({ choice: 'rejected' });
  });

  it('returns null for an unknown cookie value', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'maybe' }),
    } as never);

    await expect(getConsent()).resolves.toEqual({ choice: null });
  });
});
