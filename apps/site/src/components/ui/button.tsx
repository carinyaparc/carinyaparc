'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** Eucalypt primary */
        default:
          'bg-eucalypt-600 text-primary-foreground hover:bg-eucalypt-700 shadow-none',
        /** Wattle / kangaroo — high-emphasis CTAs */
        secondary:
          'bg-wattle text-kangaroo-900 hover:bg-kangaroo-400 shadow-none',
        outline:
          'border-[1.5px] border-eucalypt-600 bg-transparent text-eucalypt-600 hover:bg-eucalypt-50',
        /** Ghost for on-photo / secondary paths */
        ghost:
          'bg-transparent text-bracken-500 hover:bg-bracken-50 border-[1.5px] border-transparent',
        /** Glass outline for photo overlays */
        'ghost-light':
          'bg-fleece/12 border border-fleece/55 text-fleece hover:bg-fleece/22 shadow-none',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-eucalypt-600 underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'px-7 py-3.5 text-[15px] leading-none',
        sm: 'px-5 py-2.5 text-[13px] leading-none',
        lg: 'px-[34px] py-4 text-[17px] leading-none',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, 'render'>,
    VariantProps<typeof buttonVariants> {
  render?: React.ReactElement;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, render, isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        render={render}
        nativeButton={render ? false : undefined}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" />}
        {children}
      </BaseButton>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
