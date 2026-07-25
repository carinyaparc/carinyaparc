import { describe, expect, it } from 'vitest';

import { splitRichTextAtMidpoint } from '@/lib/subscribe/split-rich-text';
import type { LexicalBody } from '@/lib/subscribe/split-rich-text';

function makeBody(blockCount: number): LexicalBody {
  return {
    root: {
      type: 'root',
      children: Array.from({ length: blockCount }, (_, i) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text: `Block ${i + 1}`, version: 1 }],
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

describe('splitRichTextAtMidpoint', () => {
  it('keeps short bodies entirely before the inline break', () => {
    const body = makeBody(1);
    const { before, after } = splitRichTextAtMidpoint(body);

    expect(before.root.children).toHaveLength(1);
    expect(after).toBeNull();
  });

  it('splits even-length bodies in half for mid-article placement', () => {
    const body = makeBody(4);
    const { before, after } = splitRichTextAtMidpoint(body);

    expect(before.root.children).toHaveLength(2);
    expect(after?.root.children).toHaveLength(2);
  });

  it('puts the extra block in the first half when odd', () => {
    const body = makeBody(3);
    const { before, after } = splitRichTextAtMidpoint(body);

    expect(before.root.children).toHaveLength(2);
    expect(after?.root.children).toHaveLength(1);
  });
});
