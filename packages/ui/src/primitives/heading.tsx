/**
 * Heading primitive component
 * Decouples semantic level (h1-h6) from visual size
 * Maps to: FR-3, NFR-2, NFR-3
 * Task: T1.3
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';

const headingVariants = cva('font-semibold tracking-tight', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      default: 'text-charcoal-600',
      primary: 'text-eucalyptus-600',
      secondary: 'text-harvest-600',
      muted: 'text-charcoal-400',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'semibold',
    color: 'default',
  },
});

export interface HeadingProps
  extends
    Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  asChild?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, size, weight, color: colorScheme, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ size, weight, color: colorScheme }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';

export { Heading, headingVariants };
