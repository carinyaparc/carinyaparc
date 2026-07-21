import Image from 'next/image';

import { cn } from '@/lib/cn';

interface MotifTileProps {
  src: string;
  className?: string;
  tileClassName?: string;
}

export function MotifTile({ src, className, tileClassName }: MotifTileProps) {
  return (
    <div
      className={cn(
        'flex h-[60px] w-[60px] items-center justify-center rounded-md',
        tileClassName,
        className,
      )}
    >
      <Image src={src} alt="" width={32} height={32} aria-hidden />
    </div>
  );
}
