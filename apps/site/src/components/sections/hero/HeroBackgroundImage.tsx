import Image from 'next/image';

import { cn } from '@/src/lib/cn';

const HERO_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export function HeroBackgroundImage({
  src,
  alt,
  className,
  priority = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      quality={85}
      placeholder="blur"
      blurDataURL={HERO_BLUR_DATA_URL}
      className={cn('absolute inset-0 -z-10 object-cover opacity-80 brightness-50', className)}
    />
  );
}
