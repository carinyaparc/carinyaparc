'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/cn';

// Main container component
interface PageSectionAProps {
  children: ReactNode;
  className?: string;
}

export function PageSectionA({ children, className = '' }: PageSectionAProps) {
  return (
    <div className={cn('overflow-hidden bg-eucalypt-600 py-24 sm:py-32', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {children}
        </div>
      </div>
    </div>
  );
}

// Content side component
interface ContentProps {
  children: ReactNode;
  className?: string;
}

export function Content({ children, className = '' }: ContentProps) {
  return (
    <div className={cn('lg:pt-4 lg:pr-8', className)}>
      <div className="lg:max-w-lg">{children}</div>
    </div>
  );
}

// Title components
export function Eyebrow({ children }: { children: ReactNode }) {
  return <h2 className="text-base/7 font-semibold text-indigo-400">{children}</h2>;
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
      {children}
    </p>
  );
}

export function Description({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-lg/8 text-gray-300">{children}</p>;
}

// Features component
interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
}

interface FeaturesListProps {
  items: Feature[];
  className?: string;
}

export function FeaturesList({ items, className = '' }: FeaturesListProps) {
  return (
    <dl
      className={cn('mt-10 max-w-xl space-y-8 text-base/7 text-gray-400 lg:max-w-none', className)}
    >
      {items.map((feature) => (
        <div key={feature.name} className="relative pl-9">
          <dt className="inline font-semibold text-white">
            <feature.icon
              aria-hidden="true"
              className="absolute top-1 left-1 h-5 w-5 text-indigo-400"
            />
            {feature.name}
          </dt>{' '}
          <dd className="inline">{feature.description}</dd>
        </div>
      ))}
    </dl>
  );
}

// Image component
interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function SectionImage({
  src,
  alt,
  width = 2432,
  height = 1442,
  className = '',
}: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-228 md:-ml-4 lg:-ml-0',
        className,
      )}
      quality={80}
    />
  );
}

// Export default as named export to match convention
export default PageSectionA;
