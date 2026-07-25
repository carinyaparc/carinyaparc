import type { Post } from '@/payload-types';

export type LexicalBody = Post['body'];

/**
 * Split a Lexical body at the midpoint of top-level blocks so an inline
 * subscribe module can sit mid-article. Short bodies (0–1 blocks) keep the
 * full content in `before` and leave `after` empty.
 */
export function splitRichTextAtMidpoint(body: LexicalBody): {
  before: LexicalBody;
  after: LexicalBody | null;
} {
  const children = body.root.children;

  if (children.length <= 1) {
    return { before: body, after: null };
  }

  const mid = Math.ceil(children.length / 2);

  return {
    before: {
      ...body,
      root: {
        ...body.root,
        children: children.slice(0, mid),
      },
    },
    after: {
      ...body,
      root: {
        ...body.root,
        children: children.slice(mid),
      },
    },
  };
}
