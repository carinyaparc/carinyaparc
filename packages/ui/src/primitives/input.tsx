/**
 * Input primitive component
 * Task: T1.8
 */

import * as React from 'react';

import { cn } from '../utils';

export interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, iconPosition = 'left', ...props }, ref) => {
    const hasIcon = !!icon;

    if (hasIcon) {
      return (
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'block w-full rounded-md bg-white px-3.5 py-2 text-base text-charcoal-600 outline-1 -outline-offset-1 outline-charcoal-300 placeholder:text-charcoal-400 focus:outline-2 focus:-outline-offset-2 focus:outline-eucalyptus-600 disabled:cursor-not-allowed disabled:bg-gray-50',
              error && 'outline-earth-red focus:outline-earth-red',
              iconPosition === 'left' && 'pl-10',
              iconPosition === 'right' && 'pr-10',
              className,
            )}
            ref={ref}
            aria-invalid={error}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              {icon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'block w-full rounded-md bg-white px-3.5 py-2 text-base text-charcoal-600 outline-1 -outline-offset-1 outline-charcoal-300 placeholder:text-charcoal-400 focus:outline-2 focus:-outline-offset-2 focus:outline-eucalyptus-600 disabled:cursor-not-allowed disabled:bg-gray-50',
          error && 'outline-earth-red focus:outline-earth-red',
          className,
        )}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
