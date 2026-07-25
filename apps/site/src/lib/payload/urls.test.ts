import { describe, expect, it } from 'vitest';

import { categoryUrl, postUrl, recipeUrl, tagUrl } from '@/lib/payload/urls';

describe('payload public urls', () => {
  it('builds trailing-slash content urls', () => {
    expect(postUrl('field-notes')).toBe('/blog/field-notes/');
    expect(categoryUrl('restoration')).toBe('/blog/category/restoration/');
    expect(tagUrl('soil-health')).toBe('/blog/tag/soil-health/');
    expect(recipeUrl('flatbread')).toBe('/recipes/flatbread/');
  });
});
