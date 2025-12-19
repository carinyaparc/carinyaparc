/**
 * EmptyState composition component
 * Display empty state with icon, message, and action
 * Task: T2.5
 */

import * as React from 'react';
import { Heading } from './heading';
import { Text } from './text';
import { cn } from './utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center text-center py-12', className)}
      >
        <div className="text-charcoal-300 mb-4">{icon}</div>
        <Heading level={3} size="lg" weight="semibold" color="default" className="mb-2">
          {title}
        </Heading>
        <Text as="p" size="base" color="muted" className="max-w-md mb-6">
          {description}
        </Text>
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  },
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
