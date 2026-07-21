import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill border border-transparent px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      tone: {
        success: 'bg-eucalypt-50 text-eucalypt-700',
        warning: 'bg-kangaroo-100 text-kangaroo-700',
        info: 'bg-branch-100 text-branch-700',
        /** Legacy / extras */
        default: 'bg-eucalypt-50 text-eucalypt-700',
        secondary: 'bg-kangaroo-100 text-kangaroo-700',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-line bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      tone: 'success',
    },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>, VariantProps<typeof badgeVariants> {
  /** Optional status dot (DS) */
  dot?: boolean;
  /**
   * Legacy alias for `tone`. Prefer `tone`.
   * @deprecated Use `tone`
   */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

function Badge({ className, tone, variant, dot = false, children, ...props }: BadgeProps) {
  const resolvedTone = tone ?? variant ?? 'success';
  return (
    <span className={cn(badgeVariants({ tone: resolvedTone }), className)} {...props}>
      {dot ? <span className="size-[7px] shrink-0 rounded-pill bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
