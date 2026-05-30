import type { Post } from '@/payload-types';

type LexicalBody = Post['body'];
type LexicalChild = LexicalBody['root']['children'][number];

type TextPart = {
  text: string;
  bold: boolean;
};

function parseInlineText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }

    parts.push({ text: match[1] ?? '', bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }

  return parts.length > 0 ? parts : [{ text, bold: false }];
}

function createTextNodes(text: string) {
  return parseInlineText(text).map(({ text: value, bold }) => ({
    type: 'text' as const,
    detail: 0,
    format: bold ? 1 : 0,
    mode: 'normal' as const,
    style: '',
    text: value,
    version: 1,
  }));
}

function createParagraph(text: string): LexicalChild {
  return {
    type: 'paragraph',
    children: createTextNodes(text),
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  };
}

function createHeading(text: string, tag: 'h2' | 'h3' | 'h4'): LexicalChild {
  return {
    type: 'heading',
    tag,
    children: createTextNodes(text),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function createQuote(text: string): LexicalChild {
  return {
    type: 'quote',
    children: [createParagraph(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function createListItem(text: string, value: number): LexicalChild {
  return {
    type: 'listitem',
    value,
    children: [createParagraph(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function createList(items: string[], listType: 'bullet' | 'number'): LexicalChild {
  return {
    type: 'list',
    listType,
    tag: listType === 'bullet' ? 'ul' : 'ol',
    start: 1,
    children: items.map((item, index) => createListItem(item, index + 1)),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function headingTag(level: number): 'h2' | 'h3' | 'h4' {
  if (level <= 2) {
    return 'h2';
  }

  if (level === 3) {
    return 'h3';
  }

  return 'h4';
}

export function markdownToLexical(markdown: string): LexicalBody {
  const lines = markdown.split('\n');
  const children: LexicalChild[] = [];
  let listItems: string[] = [];
  let listType: 'bullet' | 'number' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      children.push(createList(listItems, listType));
      listItems = [];
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch?.[1] && headingMatch[2]) {
      flushList();
      const level = headingMatch[1].length;
      if (level === 1) {
        continue;
      }

      children.push(createHeading(headingMatch[2], headingTag(level)));
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s+(.+)$/);
    if (quoteMatch?.[1]) {
      flushList();
      children.push(createQuote(quoteMatch[1]));
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (listType && listType !== 'bullet') {
        flushList();
      }

      listType = 'bullet';
      listItems.push(bulletMatch[1] ?? '');
      continue;
    }

    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (listType && listType !== 'number') {
        flushList();
      }

      listType = 'number';
      listItems.push(numberedMatch[1] ?? '');
      continue;
    }

    flushList();
    children.push(createParagraph(trimmed));
  }

  flushList();

  if (children.length === 0) {
    children.push(createParagraph(''));
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}
