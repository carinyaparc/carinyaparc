/**
 * StatCard composition component
 * Display metric with label and optional icon
 * Task: T2.4
 */

import * as React from 'react';
import { Card, CardContent } from './card';
import { Heading } from './heading';
import { Text } from './text';
import { cn } from './utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon, trend, variant = 'default', className }, ref) => {
    const variantStyles = {
      default: 'border-charcoal-100',
      primary: 'border-eucalyptus-100 bg-eucalyptus-50',
      secondary: 'border-harvest-100 bg-harvest-50',
    };

    return (
      <Card ref={ref} className={cn(variantStyles[variant], className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-2">
              <Text as="p" size="sm" color="muted" className="uppercase tracking-wide">
                {label}
              </Text>
              <Heading level={3} size="3xl" weight="bold">
                {value}
              </Heading>
              {trend && (
                <Text
                  as="p"
                  size="sm"
                  color={trend.isPositive ? 'success' : 'error'}
                  className="flex items-center gap-1"
                >
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </Text>
              )}
            </div>
            {icon && <div className="shrink-0 text-charcoal-400">{icon}</div>}
          </div>
        </CardContent>
      </Card>
    );
  },
);
StatCard.displayName = 'StatCard';

export { StatCard };
