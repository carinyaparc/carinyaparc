import * as React from 'react';
import { cn } from '@/lib/cn';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'block w-full rounded-md bg-white px-3.5 py-2 text-base text-charcoal-600 outline-1 -outline-offset-1 outline-charcoal-300 placeholder:text-charcoal-400 focus:outline-2 focus:-outline-offset-2 focus:outline-eucalyptus-600 disabled:cursor-not-allowed disabled:bg-gray-50 resize-y min-h-[80px]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
