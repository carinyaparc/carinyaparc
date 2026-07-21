import Link from 'next/link';

import { Button } from '@/components/ui/Button';

const BENEFITS = [
  'Grant-ready reporting on carbon, water and biodiversity',
  'Named corridor and planting-day sponsorships',
  'Open data, published quarterly, free to reference',
] as const;

const TIERS = [
  {
    title: '$18 plants a tree',
    description:
      'Seedling, guard, and the crew to plant and water it through its first summer.',
  },
  {
    title: '$2,500 a corridor',
    description:
      'Fences, seedlings and monitoring for a 100-metre stretch of wildlife corridor.',
  },
  {
    title: 'Grants & partnerships',
    description: 'Multi-year restoration at scale, with the reporting your board expects.',
  },
] as const;

export function PartnersSection() {
  return (
    <section id="support" className="bg-eucalypt-800 py-16 text-inverse sm:py-24">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-14">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-wattle">
            For partners &amp; funders
          </p>
          <h2 className="mt-3.5 font-heading text-[38px] font-normal leading-[1.14] text-primary-foreground">
            Partner with a project that shows its working
          </h2>
          <p className="mt-[18px] text-[17px] leading-[1.7] text-inverse-muted">
            We work with government, philanthropy and organisations to fund on-ground restoration at
            scale — and we publish the outcomes. If you&apos;re looking for a regeneration project
            with rigour and transparency, let&apos;s talk.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-base text-inverse-light">
                <span className="font-bold text-wattle" aria-hidden>
                  ◦
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <Button render={<Link href="/contact" />} variant="secondary" className="mt-7">
            Start a conversation →
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.title}
              className="rounded-[22px] border border-eucalypt-700 bg-eucalypt-900 px-[30px] py-7"
            >
              <div className="font-heading text-[30px] leading-tight text-primary-foreground">
                {tier.title}
              </div>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-inverse-subtle">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
