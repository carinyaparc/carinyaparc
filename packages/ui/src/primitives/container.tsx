/**
 * Container layout primitive
 * Max-width container with responsive padding
 * Task: T1.10
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';

const containerVariants = cva('mx-auto px-4 sm:px-6', {
  variants: {
    size: {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-5xl',
      xl: 'max-w-7xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size, className, ...props }, ref) => {
    return <div ref={ref} className={cn(containerVariants({ size }), className)} {...props} />;
  },
);
Container.displayName = 'Container';

export { Container, containerVariants };
