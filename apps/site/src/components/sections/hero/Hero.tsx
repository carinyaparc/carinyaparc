/**
 * Hero organism - Refactored with compound components
 * Maps to: * Task: T3.2
 *
 * Simplified from original - preserved animations and styling
 * Now in subdirectory with explicit exports
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { cn } from '@/src/lib/cn';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@repo/ui/button';

// Hero Container Component
interface HeroProps {
  children: ReactNode;
}

export function Hero({ children }: HeroProps) {
  return (
    <div className="bg-eucalyptus-600">
      <div className="relative isolate overflow-hidden pt-14">
        {children}

        {/* Decorative background elements */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <motion.div
            animate={{
              rotate: [30, 35, 30],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-400 to-emerald-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* Bottom decorative element */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <motion.div
            animate={{
              x: [-10, 10, -10],
              y: [5, -5, 5],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-eucalyptus-500 to-emerald-700 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
    </div>
  );
}

// Hero Content Components
export function HeroContent({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-3xl py-32 sm:py-32 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function HeroImage({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function HeroBackgroundImage({
  src,
  alt,
  className,
  priority = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <HeroImage>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        className={cn('absolute inset-0 -z-10 object-cover opacity-80 brightness-50', className)}
      />
    </HeroImage>
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
      asChild
      className="text-white bg-eucalyptus-600 hover:bg-eucalyptus-200 hover:text-eucalyptus-600"
    >
      <Link href={href}>{children}</Link>
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
