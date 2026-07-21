import Image from 'next/image';

import { cn } from '@/lib/cn';

interface MotifTileProps {
  src: string;
  className?: string;
  tileClassName?: string;
  iconSize?: number;
}

export function MotifTile({ src, className, tileClassName, iconSize = 32 }: MotifTileProps) {
  return (
    <div
      className={cn(
        'flex h-[60px] w-[60px] items-center justify-center rounded-md',
        tileClassName,
        className,
      )}
    >
      <Image src={src} alt="" width={iconSize} height={iconSize} aria-hidden />
    </div>
  );
}
