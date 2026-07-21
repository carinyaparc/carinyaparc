import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const alertVariants = cva(
  'rounded-md border px-6 py-[18px] flex flex-col items-stretch border-l-[5px]',
  {
    variants: {
      tone: {
        success: 'bg-eucalypt-50 border-eucalypt-200 border-l-eucalypt-600 text-eucalypt-700',
        warning: 'bg-bracken-50 border-bracken-200 border-l-bracken-500 text-bracken-700',
        info: 'bg-branch-50 border-branch-200 border-l-branch-500 text-branch-700',
        default: 'bg-eucalypt-50 border-eucalypt-200 border-l-eucalypt-600 text-eucalypt-700',
        destructive:
          'bg-destructive/10 border-destructive/30 border-l-destructive text-destructive',
      },
    },
    defaultVariants: {
      tone: 'success',
    },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Optional title (DS) — use AlertTitle when composing */
  title?: string;
  /**
   * Legacy alias for `tone`. Prefer `tone`.
   * @deprecated Use `tone`
   */
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone, variant, title, children, ...props }, ref) => {
    const resolvedTone = tone ?? variant ?? 'success';
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ tone: resolvedTone }), className)}
        {...props}
      >
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        {children}
      </div>
    );
  },
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 text-[15px] font-bold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-85 [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
