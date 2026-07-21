import * as React from 'react';

import { cn } from '@/lib/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-charcoal-100', className)}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };
