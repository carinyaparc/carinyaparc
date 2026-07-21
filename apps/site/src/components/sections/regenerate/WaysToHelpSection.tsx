import Link from 'next/link';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { MotifTile } from '@/components/sections/page/MotifTile';

const WAYS = [
  {
    motif: '/motifs/motif-sprout.svg',
    tileClassName: 'bg-eucalypt-50',
    title: 'Join a planting day',
    description:
      'Get your hands dirty at an upcoming event. No experience needed — bring gloves and good spirits.',
    href: '#volunteer',
    linkLabel: 'See the dates',
  },
  {
    motif: '/motifs/motif-leaf.svg',
    tileClassName: 'bg-kangaroo-50',
    title: 'Support regeneration',
    description:
      'Fund seedlings, fencing and ecological monitoring equipment — the unglamorous gear that makes it work.',
    href: '#support',
    linkLabel: 'Support us',
  },
  {
    motif: '/motifs/motif-hills.svg',
    tileClassName: 'bg-bracken-50',
    title: 'Follow our progress',
    description:
      'Access open reports tracking soil health, water quality and biodiversity — evidence you can cite.',
    href: '/blog',
    linkLabel: 'Read the reports',
  },
] as const;

export function WaysToHelpSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <div className="max-w-[720px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
            Three ways to help
          </p>
          <h2 className="mt-3.5 font-heading text-[40px] font-normal leading-[1.14] text-eucalypt-600 text-balance">
            Restoration takes trees, tools and time — and people like you
          </h2>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {WAYS.map((way) => (
            <Card key={way.title} className="hover:-translate-y-1">
              <CardContent className="p-[38px] pt-[38px]">
                <MotifTile src={way.motif} tileClassName={way.tileClassName} />
                <CardTitle className="mt-5 text-bark">{way.title}</CardTitle>
                <CardDescription className="mt-3 text-[15.5px] leading-[1.6]">
                  {way.description}
                </CardDescription>
                <Link
                  href={way.href}
                  className="mt-4 inline-block text-[15px] font-semibold text-eucalypt-600 hover:opacity-70"
                >
                  {way.linkLabel} →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
