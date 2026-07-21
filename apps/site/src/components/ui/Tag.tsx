import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const tagVariants = cva(
  'inline-flex items-center gap-[7px] rounded-pill px-4 py-2 text-[13.5px] font-semibold',
  {
    variants: {
      tone: {
        eucalypt: 'bg-eucalypt-50 text-eucalypt-700',
        kangaroo: 'bg-kangaroo-100 text-kangaroo-700',
        bracken: 'bg-bracken-100 text-bracken-700',
        branch: 'bg-branch-100 text-branch-700',
        outline:
          'bg-transparent text-muted-foreground shadow-[inset_0_0_0_1.5px_var(--color-border)]',
      },
    },
    defaultVariants: {
      tone: 'eucalypt',
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {}

function Tag({ className, tone, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />;
}

export { Tag, tagVariants };
