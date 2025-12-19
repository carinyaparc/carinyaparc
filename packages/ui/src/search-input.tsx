/**
 * SearchInput composition component
 * Input with search icon and clear button
 * Task: T2.2
 */

'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from './utils';

export interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> {
  onSearch: (value: string) => void;
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, className, ...props }, ref) => {
    const [value, setValue] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onSearch(newValue);
    };

    const handleClear = () => {
      setValue('');
      onSearch('');
      onClear?.();
    };

    return (
      <div className={cn('relative', className)}>
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          icon={<Search className="size-4 text-charcoal-400" />}
          iconPosition="left"
          className="pr-10"
          {...props}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
