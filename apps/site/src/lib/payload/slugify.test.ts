import { describe, expect, it } from 'vitest';

import { slugify } from '@/lib/payload/slugify';

describe('slugify', () => {
  it('lowercases and hyphenates titles', () => {
    expect(slugify("How We're Restoring 42 Hectares")).toBe('how-were-restoring-42-hectares');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  Hello World!  ')).toBe('hello-world');
  });

  it('collapses repeated separators', () => {
    expect(slugify('foo__bar--baz')).toBe('foo-bar-baz');
  });
});
