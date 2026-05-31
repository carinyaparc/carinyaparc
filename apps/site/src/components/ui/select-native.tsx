import * as React from 'react';
import { cn } from '@/lib/cn';

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          'block w-full rounded-md bg-white px-3.5 py-2 text-base text-charcoal-600 outline-1 -outline-offset-1 outline-charcoal-300 focus:outline-2 focus:-outline-offset-2 focus:outline-eucalyptus-600 disabled:cursor-not-allowed disabled:bg-gray-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Select.displayName = 'Select';

export { Select };
