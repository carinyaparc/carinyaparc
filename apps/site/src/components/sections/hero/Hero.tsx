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
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HeroDecorations = dynamic(
  () => import('./HeroDecorations').then((mod) => mod.HeroDecorations),
  { ssr: false },
);

interface HeroProps {
  children: ReactNode;
}

export function Hero({ children }: HeroProps) {
  return (
    <div className="bg-eucalyptus-600">
      <div className="relative isolate overflow-hidden pt-14">
        {children}
        <HeroDecorations />
      </div>
    </div>
  );
}

export function HeroContent({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-3xl py-32 text-center sm:py-32 lg:py-36">{children}</div>
    </div>
  );
}

export function HeroTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
      {children}
    </h1>
  );
}

export function HeroText({ children }: { children: ReactNode }) {
  return <p className="mt-8 text-xl font-medium text-pretty text-white sm:text-2xl">{children}</p>;
}

export function HeroLocation({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center text-white mt-6">
      <MapPin className="h-5 w-5 mr-2" />
      <span>{children}</span>
    </div>
  );
}

export function HeroActions({ children }: { children: ReactNode }) {
  return <div className="mt-10 flex items-center justify-center gap-6">{children}</div>;
}

export function HeroButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      render={<Link href={href} />}
      className="text-white bg-eucalyptus-600 hover:bg-eucalyptus-200 hover:text-eucalyptus-600"
    >
      {children}
    </Button>
  );
}

export function HeroLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold leading-6 text-white">
      <span>
        {children} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
