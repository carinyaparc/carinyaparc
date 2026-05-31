import * as React from 'react';
import { cn } from '@/lib/cn';

export interface FormFieldProps {
  name: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ name, label, description, error, required, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <label htmlFor={name} className="block text-sm/6 font-semibold text-charcoal-600">
          {label}
          {required && <span className="text-earth-red ml-1">*</span>}
        </label>
        {description && <p className="mt-1 text-sm text-charcoal-400">{description}</p>}
        {children}
        {error && (
          <p className="mt-1 text-sm text-earth-red" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = 'FormField';

export { FormField };
