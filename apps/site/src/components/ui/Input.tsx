import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  /** Invalid state (DS); also accepts legacy `error` */
  invalid?: boolean;
  /** @deprecated Prefer `invalid` */
  error?: boolean;
  /** Optional label wrapping the field (DS) */
  label?: string;
  /** Optional hint under the field (DS) */
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const inputClassName = (invalid: boolean, className?: string) =>
  cn(
    'block w-full rounded-md bg-card px-4 py-[13px] text-[15px] text-foreground',
    'border-[1.5px] border-input outline-none transition-colors',
    'placeholder:text-muted-foreground',
    'focus:border-eucalypt-600 focus:outline-2 focus:outline-offset-0 focus:outline-eucalypt-600/30',
    'disabled:cursor-not-allowed disabled:opacity-50',
    invalid && 'border-destructive focus:border-destructive focus:outline-destructive/30',
    className,
  );

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, invalid, error, label, hint, icon, iconPosition = 'left', id, ...props },
    ref,
  ) => {
    const isInvalid = Boolean(invalid ?? error);
    const inputId = id ?? props.name;

    const field = icon ? (
      <div className="relative">
        {iconPosition === 'left' && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            inputClassName(isInvalid, className),
            iconPosition === 'left' && 'pl-10',
            iconPosition === 'right' && 'pr-10',
          )}
          ref={ref}
          aria-invalid={isInvalid}
          {...props}
        />
        {iconPosition === 'right' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
      </div>
    ) : (
      <input
        type={type}
        id={inputId}
        className={inputClassName(isInvalid, className)}
        ref={ref}
        aria-invalid={isInvalid}
        {...props}
      />
    );

    if (!label && !hint) {
      return field;
    }

    return (
      <label className="block font-sans" htmlFor={inputId}>
        {label ? (
          <span className="mb-2 block text-[13.5px] font-semibold text-foreground">{label}</span>
        ) : null}
        {field}
        {hint ? <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span> : null}
      </label>
    );
  },
);
Input.displayName = 'Input';

export { Input };
