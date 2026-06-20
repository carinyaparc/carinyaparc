import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import Image from 'next/image';

type UploadDoc = {
  alt?: string | null;
  filename?: string;
  height?: number | null;
  mimeType?: string;
  url?: string;
  width?: number | null;
};

export const richTextJsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const uploadNode = node as { fields?: { alt?: string }; value?: UploadDoc | number | string };

    if (typeof uploadNode.value !== 'object' || !uploadNode.value) {
      return null;
    }

    const uploadDoc = uploadNode.value;
    const alt = uploadNode.fields?.alt || uploadDoc.alt || uploadDoc.filename || '';
    const url = uploadDoc.url;

    if (!url) {
      return null;
    }

    if (!uploadDoc.mimeType?.startsWith('image')) {
      return (
        <a href={url} rel="noopener noreferrer">
          {uploadDoc.filename}
        </a>
      );
    }

    const width = uploadDoc.width ?? 800;
    const height = uploadDoc.height ?? 450;

    return (
      <Image
        alt={alt}
        src={url}
        width={width}
        height={height}
        className="h-auto w-full max-w-full rounded-lg"
        sizes="(max-width: 768px) 100vw, 800px"
      />
    );
  },
});
