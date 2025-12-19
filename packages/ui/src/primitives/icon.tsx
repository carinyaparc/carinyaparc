/**
 * Icon primitive component
 * Wrapper for lucide-react icons with consistent sizing
 * Task: T1.6
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';

import { cn } from '../utils';

const iconVariants = cva('shrink-0', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6',
      xl: 'size-8',
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
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});

export interface IconProps extends VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  className?: string;
  'aria-label'?: string;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size, color, className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size, color }), className)}
        {...props}
      />
    );
  },
);
Icon.displayName = 'Icon';

export { Icon, iconVariants };
