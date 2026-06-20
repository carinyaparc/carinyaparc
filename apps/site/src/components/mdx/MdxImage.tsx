import Image from 'next/image';
import type { ComponentProps } from 'react';

type MdxImageProps = ComponentProps<'img'>;

export function MdxImage({ src, alt, width, height, className }: MdxImageProps) {
  if (!src || typeof src !== 'string') {
    return null;
  }

  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt ?? ''}
        width={Number(width)}
        height={Number(height)}
        className={className}
        sizes="(max-width: 768px) 100vw, 800px"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={800}
      height={450}
      className={className ?? 'h-auto w-full max-w-full'}
      sizes="(max-width: 768px) 100vw, 800px"
    />
  );
}
