/**
 * Hero organism - Refactored with compound components
 * Maps to: * Task: T3.2
 *
 * Decorative motion is deferred to client-only subcomponents so the hero
 * background image can render from a Server Component.
 */

'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const HeroDecorations = dynamic(
  () => import('./HeroDecorations').then((mod) => mod.HeroDecorations),
  { ssr: false },
);

interface HeroProps {
  children: ReactNode;
  className?: string;
}

export function Hero({ children, className }: HeroProps) {
  return (
    <div className={cn('relative isolate min-h-[720px] overflow-hidden bg-eucalypt-900', className)}>
      {children}
      <HeroDecorations />
    </div>
  );
}

export function HeroContent({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1240px] items-end px-6 pb-[92px] pt-28 lg:px-14">
      <div className="max-w-[900px]">{children}</div>
    </div>
  );
}

export function HeroEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-wattle">{children}</p>
  );
}

export function HeroTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-[18px] max-w-[900px] text-balance font-heading text-[44px] font-normal leading-[1.03] text-fleece sm:text-6xl lg:text-[74px]">
      {children}
    </h1>
  );
}

export function HeroText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 max-w-[600px] text-pretty text-lg leading-[1.6] text-paperbark sm:text-[21px]">
      {children}
    </p>
  );
}

export function HeroLocation({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.24em] text-wattle">
      {children}
    </p>
  );
}

export function HeroActions({ children }: { children: ReactNode }) {
  return <div className="mt-9 flex flex-wrap items-center gap-3.5">{children}</div>;
}

export function HeroButton({
  href,
  children,
  variant = 'secondary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'ghost-light' | 'outline' | 'ghost';
}) {
  return (
    <Button render={<Link href={href} />} variant={variant}>
      {children}
    </Button>
  );
}

export function HeroLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold leading-6 text-fleece hover:opacity-70">
      <span>
        {children} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
