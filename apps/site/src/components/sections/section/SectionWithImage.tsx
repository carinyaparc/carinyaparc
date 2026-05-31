/**
 * SectionWithImage organism - Refactored without React Context
 * Maps to: * Task: T3.4
 *
 * Removed React Context, uses explicit props
 * Preserved existing styling and layout
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/src/lib/cn';
import { Button } from '@/components/ui/button';

// Types
interface SectionWithImageProps {
  children: ReactNode;
  imagePosition?: 'left' | 'right';
  variant?: 'dark' | 'light';
}

export function SectionWithImage({
  children,
  imagePosition = 'left',
  variant = 'light',
}: SectionWithImageProps) {
  const bgColor = variant === 'dark' ? 'bg-eucalyptus-600' : 'bg-white';
  const sectionClasses = cn('relative', bgColor);

  return (
    <div className={sectionClasses} data-image-position={imagePosition} data-variant={variant}>
      {children}
    </div>
  );
}

export function SectionImage({
  children,
  imagePosition = 'left',
}: {
  children: ReactNode;
  imagePosition?: 'left' | 'right';
}) {
  const positionClasses =
    imagePosition === 'left' ? 'md:left-0 md:rounded-r-xl' : 'md:right-0 md:rounded-l-xl';

  return (
    <div
      className={cn(
        'relative h-80 overflow-hidden shadow-xl ring-1 ring-eucalyptus-100/10 md:absolute md:h-full md:w-1/3 lg:w-1/2',
        positionClasses,
      )}
    >
      {children}
    </div>
  );
}

export function SectionContent({
  children,
  imagePosition = 'left',
}: {
  children: ReactNode;
  imagePosition?: 'left' | 'right';
}) {
  const positionClasses =
    imagePosition === 'left'
      ? 'md:ml-auto md:w-2/3 md:pl-16 lg:w-1/2 lg:pl-24 xl:pl-32 lg:pr-0'
      : 'md:mr-auto md:w-2/3 md:pr-16 lg:w-1/2 lg:pr-24 xl:pr-32 lg:pl-0';

  return (
    <div className="relative mx-auto max-w-7xl py-24 sm:py-32 lg:px-8 lg:py-40">
      <div className={cn('px-6', positionClasses)}>{children}</div>
    </div>
  );
}

export function SectionTitle({
  children,
  variant = 'light',
}: {
  children: ReactNode;
  variant?: 'dark' | 'light';
}) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-eucalyptus-600';
  return (
    <h2 className={cn('text-4xl font-semibold tracking-tight sm:text-5xl', textColor)}>
      {children}
    </h2>
  );
}

export function SectionSubtitle({
  children,
  variant = 'light',
}: {
  children: ReactNode;
  variant?: 'dark' | 'light';
}) {
  const textColor = variant === 'dark' ? 'text-eucalyptus-200' : 'text-eucalyptus-300';
  return <p className={cn('text-base/7 font-semibold', textColor)}>{children}</p>;
}

export function SectionText({
  children,
  variant = 'light',
}: {
  children: ReactNode;
  variant?: 'dark' | 'light';
}) {
  const textColor = variant === 'dark' ? 'text-eucalyptus-100' : 'text-charcoal-400';
  return <div className={cn('mt-6 text-base/7', textColor)}>{children}</div>;
}

export function SectionActions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex gap-4">{children}</div>;
}

export function SectionButton({
  href,
  children,
  variant = 'light',
}: {
  href: string;
  children: ReactNode;
  variant?: 'dark' | 'light';
}) {
  const buttonClasses =
    variant === 'dark'
      ? 'bg-white text-eucalyptus-600 hover:bg-gray-100'
      : 'bg-eucalyptus-600 text-white hover:bg-eucalyptus-700';

  return (
    <Button render={<Link href={href} />} className={buttonClasses}>
      {children}
    </Button>
  );
}

export function SectionLink({
  href,
  children,
  variant = 'light',
}: {
  href: string;
  children: ReactNode;
  variant?: 'dark' | 'light';
}) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-eucalyptus-600';

  return (
    <Link href={href} className={cn('px-3.5 py-2.5 text-sm font-semibold leading-6', textColor)}>
      <span>
        {children} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
