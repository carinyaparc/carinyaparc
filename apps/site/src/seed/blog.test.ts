import { describe, expect, it, vi } from 'vitest';

import { createLexicalParagraph } from '@/lib/payload/lexical';
import { RESTORING_42_HA_SLUG, blogSeedTags, seedBlog } from '@/seed/blog';

describe('blog seed data', () => {
  it('targets the cornerstone MDX post slug', () => {
    expect(RESTORING_42_HA_SLUG).toBe('restoring-42-ha-land');
  });

  it('includes tags from the MDX frontmatter', () => {
    expect(blogSeedTags).toEqual([
      'regeneration',
      'biodiversity',
      'agroforestry',
      'restoration',
      'ecosystem',
    ]);
  });

  it('builds minimal lexical content for seed posts', () => {
    const body = createLexicalParagraph('Hello world');
    expect(body.root.type).toBe('root');
    expect(body.root.children[0]?.type).toBe('paragraph');
  });

  it('skips creating a post when the slug already exists', async () => {
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'posts') {
          return { docs: [{ id: 1 }] };
        }

        return { docs: [] };
      }),
      create: vi.fn(),
    };

    const result = await seedBlog(payload as never);

    expect(result).toEqual({ created: false, slug: RESTORING_42_HA_SLUG });
    expect(payload.create).not.toHaveBeenCalled();
  });
});
