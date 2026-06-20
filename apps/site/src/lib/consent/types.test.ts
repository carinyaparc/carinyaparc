import { describe, expect, it } from 'vitest';

import { normalizeConsentChoice } from '@/lib/consent/types';

describe('normalizeConsentChoice', () => {
  it('returns accepted for the accepted value', () => {
    expect(normalizeConsentChoice('accepted')).toBe('accepted');
  });

  it('returns rejected for the rejected value', () => {
    expect(normalizeConsentChoice('rejected')).toBe('rejected');
  });

  it('returns null for null', () => {
    expect(normalizeConsentChoice(null)).toBe(null);
  });

  it('returns null for unknown values', () => {
    expect(normalizeConsentChoice('maybe')).toBe(null);
    expect(normalizeConsentChoice(undefined)).toBe(null);
  });
});
