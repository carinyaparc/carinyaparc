import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react';

import type { Post } from '@/payload-types';

type RichTextProps = {
  data: Post['body'];
  className?: string;
};

export function RichText({ data, className }: RichTextProps) {
  return <PayloadRichText className={className} data={data} />;
}
