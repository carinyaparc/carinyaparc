import * as React from 'react';
import { cn } from '@/lib/cn';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-line bg-card text-card-foreground shadow-md overflow-hidden transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

/** 16/10 media slot (DS Card media) */
const CardMedia = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('aspect-[16/10] overflow-hidden', className)} {...props} />
  ),
);
CardMedia.displayName = 'CardMedia';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-7', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/** Uppercase letterspaced accent kicker (DS Card kicker) */
const CardKicker = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-[11px] font-semibold uppercase tracking-[0.16em] text-accent', className)}
      {...props}
    />
  ),
);
CardKicker.displayName = 'CardKicker';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'font-heading text-[23px] font-normal leading-tight tracking-normal',
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-[14.5px] leading-[1.55] text-muted-foreground', className)}
      {...props}
    />
  ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-7 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-7 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardMedia,
  CardHeader,
  CardKicker,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
