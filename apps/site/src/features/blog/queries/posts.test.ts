import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({
  find: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ find }),
}));

import { getBlogPosts } from '@/features/blog/queries/posts';

describe('getBlogPosts', () => {
  beforeEach(() => {
    find.mockClear();
  });

  it('does not select the Lexical body field for list views', async () => {
    await getBlogPosts({ limit: 3 });

    expect(find).toHaveBeenCalledOnce();
    const options = find.mock.calls[0]![0] as { select?: Record<string, boolean> };
    expect(options.select).toBeDefined();
    expect(options.select).not.toHaveProperty('body');
  });
});
