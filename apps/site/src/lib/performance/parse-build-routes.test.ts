import { describe, expect, it } from 'vitest';

import { parseBuildRouteTable } from '@/lib/performance/parse-build-routes';

describe('parse-build-routes helpers', () => {
  it('classifies dynamic build symbols separately from static output', () => {
    const routes = parseBuildRouteTable(`
Route (app)
├ ƒ /
├ ƒ /blog
└ ƒ /blog/[slug]
`);

    expect(routes.map((route) => route.mode)).toEqual(['dynamic', 'dynamic', 'dynamic']);
  });
});
