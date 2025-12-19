/**
 * Text primitive component
 * Paragraph and span text with typography variants
 * Task: T1.4
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
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
      error: 'text-earth-red',
      success: 'text-eucalyptus-500',
      warning: 'text-harvest-500',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'default',
    align: 'left',
  },
});

export interface TextProps
  extends
    Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
  asChild?: boolean;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    { as = 'p', size, weight, color: colorScheme, align, className, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : as;
    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ size, weight, color: colorScheme, align }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = 'Text';

export { Text, textVariants };
