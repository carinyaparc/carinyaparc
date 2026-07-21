/**
 * HeaderWithStats organism - Preserved for regenerate page
 * Task: T3.6 (marked N/A but component needed)
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface HeaderWithStatsProps {
  subtitle: string;
  title: string;
  description: string;
  backgroundImage: string;
  backgroundImageAlt?: string;
  links?: { name: string; href: string }[];
  stats?: { name: string; value: string }[];
}

export default function HeaderWithStats({
  subtitle,
  title,
  description,
  backgroundImage,
  backgroundImageAlt = 'Header background',
  links = [],
  stats = [],
}: HeaderWithStatsProps) {
  return (
    <div className="relative isolate overflow-hidden bg-eucalypt-600 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 size-full overflow-hidden">
        <motion.div
          className="relative size-full"
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{
            duration: 40,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Image
            alt={backgroundImageAlt}
            src={backgroundImage}
            fill
            sizes="100vw"
            className="object-cover object-right md:object-center brightness-75"
          />
        </motion.div>
      </div>
      <div
        aria-hidden="true"
        className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-eucalypt-300 to-eucalypt-500 opacity-20"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-eucalypt-300 to-eucalypt-500 opacity-20"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <p className="text-base/7 font-semibold text-eucalypt-300">{subtitle}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-eucalypt-100 sm:text-xl/8">
            {description}
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          {links.length > 0 && (
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base/7 font-semibold text-white sm:grid-cols-2 md:flex lg:gap-x-10">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-eucalypt-200 transition-colors"
                >
                  <span>
                    {link.name} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          {stats.length > 0 && (
            <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col-reverse gap-1">
                  <dt className="text-base/7 text-eucalypt-100">{stat.name}</dt>
                  <dd className="text-4xl font-semibold tracking-tight text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
