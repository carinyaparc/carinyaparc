/**
 * FormField composition component
 * Composes Label + children + error message for forms
 * Task: T2.1
 */

import * as React from 'react';
import { Label } from './label';
import { Text } from './text';
import { cn } from './utils';

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
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-earth-red ml-1">*</span>}
        </Label>
        {description && (
          <Text as="p" size="sm" color="muted" className="mt-1">
            {description}
          </Text>
        )}
        {children}
        {error && (
          <Text as="p" size="sm" color="error" className="mt-1" role="alert">
            {error}
          </Text>
        )}
      </div>
    );
  },
);
FormField.displayName = 'FormField';

export { FormField };
