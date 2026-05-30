import { describe, expect, it } from 'vitest';

import { markdownToLexical } from '@/lib/payload/markdown-to-lexical';

describe('markdownToLexical', () => {
  it('converts headings, paragraphs, and bullet lists', () => {
    const body = markdownToLexical(`## Section title

Intro paragraph.

- **Soil Health**: Organic matter doubled.
- Biodiversity increased.`);

    const children = body.root.children;
    expect(children[0]).toMatchObject({ type: 'heading', tag: 'h2' });
    expect(children[1]).toMatchObject({ type: 'paragraph' });
    expect(children[2]).toMatchObject({ type: 'list', listType: 'bullet' });
  });

  it('preserves bold inline formatting', () => {
    const body = markdownToLexical('Text with **bold** emphasis.');
    const paragraph = body.root.children[0];

    expect(paragraph).toMatchObject({ type: 'paragraph' });
    expect(paragraph && 'children' in paragraph && paragraph.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'bold', format: 1 }),
        expect.objectContaining({ text: ' emphasis.', format: 0 }),
      ]),
    );
  });
});
