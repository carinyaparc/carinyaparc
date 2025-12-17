/**
 * Grid layout primitive
 * Responsive grid layout
 * Maps to: FR-3, NFR-3
 * Task: T1.12
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';
import type { Align } from '../types';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
    },
    gap: {
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
  },
  defaultVariants: {
    cols: 3,
    gap: 'md',
    align: 'stretch',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {
  align?: Align;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols, gap, align, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(gridVariants({ cols, gap, align }), className)} {...props} />
    );
  },
);
Grid.displayName = 'Grid';

export { Grid, gridVariants };
