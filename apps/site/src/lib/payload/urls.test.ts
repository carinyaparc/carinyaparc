import { describe, expect, it } from 'vitest';

import { categoryUrl, postUrl, recipeUrl } from '@/lib/payload/urls';

describe('payload public urls', () => {
  it('builds trailing-slash content urls', () => {
    expect(postUrl('field-notes')).toBe('/blog/field-notes/');
    expect(categoryUrl('restoration')).toBe('/blog/category/restoration/');
    expect(recipeUrl('flatbread')).toBe('/recipes/flatbread/');
  });
});
