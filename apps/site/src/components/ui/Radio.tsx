'use client';

import * as React from 'react';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { cn } from '@/lib/cn';

export interface RadioProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadio.Root>,
  'className'
> {
  label?: React.ReactNode;
  className?: string;
}

/**
 * Single radio item — must be used inside `RadioGroup`.
 * DS-aligned: 22px ring, eucalypt filled indicator when checked.
 */
const Radio = React.forwardRef<HTMLElement, RadioProps>(({ className, label, ...props }, ref) => {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 font-sans text-[15px] text-foreground',
        'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-45',
        className,
      )}
    >
      <BaseRadio.Root
        ref={ref}
        className={cn(
          'flex size-[22px] shrink-0 items-center justify-center rounded-pill',
          'border-2 border-border bg-transparent transition-colors',
          'data-[checked]:border-eucalypt-600',
          'focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
        {...props}
      >
        <BaseRadio.Indicator className="flex size-[11px] rounded-pill bg-eucalypt-600" />
      </BaseRadio.Root>
      {label}
    </label>
  );
});
Radio.displayName = 'Radio';

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>
>(({ className, ...props }, ref) => (
  <BaseRadioGroup ref={ref} className={cn('flex flex-col gap-3', className)} {...props} />
));
RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
