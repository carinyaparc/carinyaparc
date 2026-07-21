'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/cn';

// Main container component
interface SectionWithImageTilesProps {
  children: ReactNode;
  className?: string;
}

export function SectionWithImageTiles({ children, className = '' }: SectionWithImageTilesProps) {
  return (
    <div className={cn('overflow-hidden bg-white py-24 sm:py-32', className)}>
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">{children}</div>
    </div>
  );
}

// Header components
export function SectionHeader({ children }: { children: ReactNode }) {
  return <div className="max-w-4xl">{children}</div>;
}

export function SectionTag({ children }: { children: ReactNode }) {
  return <div className="text-base/7 font-semibold text-eucalypt-300">{children}</div>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-eucalypt-600 sm:text-5xl">
      {children}
    </h1>
  );
}

export function SectionDescription({ children }: { children: ReactNode }) {
  return <div className="my-6 text-xl/8 text-balance text-charcoal-600">{children}</div>;
}

// Content section
export function SectionContent({ children }: { children: ReactNode }) {
  return (
    <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
      {children}
    </section>
  );
}

// Text content
export function TextContent({ children }: { children: ReactNode }) {
  return <div className="lg:pr-8">{children}</div>;
}

export function ContentHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight text-pretty text-eucalypt-600">
      {children}
    </h2>
  );
}

export function ContentParagraph({ children }: { children: ReactNode }) {
  return <div className="mt-6 text-base/7 text-charcoal-600">{children}</div>;
}

// Image tiles
export function ImageTiles({ children }: { children: ReactNode }) {
  return (
    <div className="pt-16 lg:row-span-2 lg:-mr-16 xl:mr-auto">
      <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
        {children}
      </div>
    </div>
  );
}

export function ImageTile({
  src,
  alt = '',
  offset = false,
}: {
  src: string;
  alt?: string;
  offset?: boolean;
}) {
  return (
    <div
      className={cn(
        'aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-eucalypt-100/20 relative',
        { '-mt-8 lg:-mt-40': offset },
      )}
    >
      <Image
        alt={alt}
        src={src}
        fill
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={80}
        className="object-cover"
      />
    </div>
  );
}

// Stats section
export function StatsSection({ children }: { children: ReactNode }) {
  return (
    <div className="max-lg:mt-16 lg:col-span-1">
      <hr className="my-6 border-t border-eucalypt-100/30" />
      {children}
      <hr className="my-6 border-t border-eucalypt-100/30" />
    </div>
  );
}

export function StatsLabel({ children }: { children: ReactNode }) {
  return <p className="text-base/7 font-semibold text-eucalypt-400">{children}</p>;
}

export function StatsGrid({ children }: { children: ReactNode }) {
  return <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">{children}</dl>;
}

export function StatItem({
  label,
  value,
  suffix = '',
  lastInRow = false,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  lastInRow?: boolean;
}) {
  return (
    <div
      className={cn('flex flex-col gap-y-2', {
        'border-b border-dotted border-eucalypt-100/30 pb-4': !lastInRow,
        'max-sm:border-b max-sm:border-dotted max-sm:border-eucalypt-100/30 max-sm:pb-4':
          lastInRow && !suffix,
      })}
    >
      <dt className="text-sm/6 text-gray-600">{label}</dt>
      <dd className="order-first text-6xl font-semibold tracking-tight text-eucalypt-600">
        {suffix && suffix.startsWith('$') && '$'}
        <span>{value}</span>
        {suffix && !suffix.startsWith('$') ? suffix : ''}
      </dd>
    </div>
  );
}
