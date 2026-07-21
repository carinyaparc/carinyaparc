'use client';

import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  'className'
> {
  label?: React.ReactNode;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex cursor-pointer items-center gap-3 font-sans text-[15px] text-foreground',
          'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-45',
          className,
        )}
      >
        <BaseCheckbox.Root
          ref={ref}
          className={cn(
            'flex size-[22px] shrink-0 items-center justify-center rounded-[7px]',
            'border-[1.5px] border-border bg-card transition-colors',
            'data-[checked]:border-eucalypt-600 data-[checked]:bg-eucalypt-600',
            'focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
          {...props}
        >
          <BaseCheckbox.Indicator className="flex text-primary-foreground">
            <Check className="size-[13px]" strokeWidth={3.4} />
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
        {label}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
