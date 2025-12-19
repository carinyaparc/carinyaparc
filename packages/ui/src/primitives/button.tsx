/**
 * Button primitive component
 * Task: T1.7
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalyptus-600 disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-eucalyptus-600 text-white hover:bg-eucalyptus-500',
        destructive: 'bg-earth-red text-white hover:bg-earth-red/90',
        outline: 'border border-charcoal-300 bg-white text-charcoal-600 hover:bg-charcoal-50',
        secondary: 'bg-harvest-600 text-charcoal-600 hover:bg-harvest-500',
        ghost: 'hover:bg-eucalyptus-50 hover:text-eucalyptus-600',
        link: 'text-eucalyptus-600 underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'h-10 px-3.5 py-2.5',
        sm: 'h-9 rounded-md px-3 py-2 text-xs',
        lg: 'h-11 rounded-md px-4 py-2.5 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // When asChild is true, Slot expects exactly ONE child element
    // We cannot add the loading spinner as a sibling, so we skip it
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
