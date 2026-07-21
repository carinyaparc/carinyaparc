import type { Metadata } from 'next';
import Image from 'next/image';

import {
  Hero,
  HeroActions,
  HeroBackgroundImage,
  HeroButton,
  HeroContent,
  HeroEyebrow,
  HeroText,
  HeroTitle,
} from '@/components/sections/hero';
import { InlineSubscribeForm } from '@/components/sections/forms/InlineSubscribeForm';
import { PartnersSection, WaysToHelpSection } from '@/components/sections/regenerate';
import { generatePageMetadata } from '@/src/lib/metadata';
import { SchemaMarkup } from '@/components/ui/SchemaMarkup';

export const metadata: Metadata = generatePageMetadata({
  title: 'Regenerate - Carinya Parc',
  description:
    'Join us as we transform 42 hectares of former grazing land into thriving, biodiverse ecosystems through strategic restoration, wildlife corridors, and regenerative agroforestry.',
  path: '/regenerate',
  image: '/images/river-valley-aerial.jpg',
  keywords: [
    'regenerate',
    'restoration',
    'planting days',
    'volunteer',
    'partnerships',
    'grants',
    'ecological restoration',
  ],
});

export default function RegeneratePage() {
  return (
    <>
      <SchemaMarkup type="page" />

      <main className="min-h-screen bg-paperbark">
        <Hero className="min-h-[600px]">
          <HeroBackgroundImage
            src="/images/river-valley-aerial.jpg"
            alt="Carinya Parc landscape being regenerated"
          />
          <HeroContent>
            <HeroEyebrow>Regenerate with us</HeroEyebrow>
            <HeroTitle>Help restore diversity, for our native wildlife</HeroTitle>
            <HeroText>
              We&apos;re planting 30,000+ native trees, reviving waterways and building wildlife
              corridors along our Branch River frontage. Every partner, dollar and pair of hands
              moves it forward.
            </HeroText>
            <HeroActions>
              <HeroButton href="#support" variant="secondary">
                Support the work →
              </HeroButton>
              <HeroButton href="#volunteer" variant="ghost-light">
                Join a planting day
              </HeroButton>
            </HeroActions>
          </HeroContent>
        </Hero>

        <WaysToHelpSection />

        <PartnersSection />

        <section id="volunteer" className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-14">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                Get on the list
              </p>
              <h2 className="mt-3.5 font-heading text-[38px] font-normal leading-[1.14] text-eucalypt-600">
                Be first to know about planting days &amp; visits
              </h2>
              <p className="mt-[18px] text-[17px] leading-[1.7] text-charcoal">
                Sign up and we&apos;ll email you when the next planting day, farm tour, workshop or
                eco-stay opens — plus quarterly progress from the paddock. No spam, ever.
              </p>
              <InlineSubscribeForm className="mt-[26px]" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/images/farm-track-gate.jpg"
                alt="A gate onto the farm track"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
