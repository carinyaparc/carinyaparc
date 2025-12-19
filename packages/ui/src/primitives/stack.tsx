/**
 * Stack layout primitive
 * Vertical/horizontal flex layout with consistent spacing
 * Task: T1.11
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';
import type { Align, Justify } from '../types';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    spacing: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    spacing: 'md',
    align: 'stretch',
    justify: 'start',
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {
  align?: Align;
  justify?: Justify;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ direction, spacing, align, justify, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(stackVariants({ direction, spacing, align, justify }), className)}
        {...props}
      />
    );
  },
);
Stack.displayName = 'Stack';

export { Stack, stackVariants };
