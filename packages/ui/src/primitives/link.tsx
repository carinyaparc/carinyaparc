/**
 * Link primitive component
 * Next.js Link wrapper with consistent variants
 * Maps to: FR-3, NFR-3
 * Task: T1.5
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';

const linkVariants = cva(
  'inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalyptus-600',
  {
    variants: {
      variant: {
        default: 'text-eucalyptus-600 hover:text-eucalyptus-500',
        primary: 'text-eucalyptus-600 hover:text-eucalyptus-500 font-semibold',
        secondary: 'text-harvest-600 hover:text-harvest-500',
        ghost: 'text-charcoal-600 hover:text-eucalyptus-600',
        underline: 'text-eucalyptus-600 underline underline-offset-4 hover:text-eucalyptus-500',
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  external?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, external = false, ...props }, ref) => {
    const externalProps = external
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    return (
      <a
        ref={ref}
        className={cn(linkVariants({ variant, size }), className)}
        {...externalProps}
        {...props}
      />
    );
  },
);
Link.displayName = 'Link';

export { Link, linkVariants };
