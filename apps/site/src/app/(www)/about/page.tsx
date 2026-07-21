import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import {
  Hero,
  HeroBackgroundImage,
  HeroContent,
  HeroEyebrow,
  HeroText,
  HeroTitle,
} from '@/components/sections/hero';
import { MotifTile, PageIntro } from '@/components/sections/page';
import { generatePageMetadata } from '@/src/lib/metadata';
import { SchemaMarkup } from '@/components/ui/SchemaMarkup';

const VALUES = [
  {
    motif: '/motifs/motif-leaf.svg',
    tileClassName: 'bg-eucalypt-50',
    title: 'Regeneration over extraction',
    description:
      'We rebuild soil, water and biodiversity rather than mine them. Every action leaves the land healthier.',
  },
  {
    motif: '/motifs/motif-sprout.svg',
    tileClassName: 'bg-eucalypt-50',
    title: 'Stewardship over ownership',
    description:
      'The land is borrowed from future generations. We care for it with humility and patience.',
  },
  {
    motif: '/motifs/motif-hills.svg',
    tileClassName: 'bg-eucalypt-50',
    title: 'Collaboration & transparency',
    description:
      'Many hands, open books. We publish our wins and setbacks so others can learn with us.',
  },
] as const;

const PROPERTY_STATS = [
  { value: '42 ha', label: 'under restoration' },
  { value: '30k+', label: 'native trees to plant' },
  { value: '104 ac', label: 'habitat corridor' },
  { value: '1', label: 'river frontage revived' },
] as const;

export const metadata: Metadata = generatePageMetadata({
  title: 'About - Carinya Parc',
  description:
    "Discover the story of Carinya Parc, our peaceful home where we're regenerating land, building community, and demonstrating ecological stewardship in practice.",
  path: '/about',
  image: '/images/farm-valley-landscape.jpg',
  keywords: [
    'about',
    'our story',
    'mission',
    'ecological restoration',
    'regeneration',
    'community',
    'The Branch NSW',
  ],
});

export default function AboutPage() {
  return (
    <>
      <SchemaMarkup type="about" />

      <main className="min-h-screen bg-paperbark">
        <Hero className="min-h-[560px]">
          <HeroBackgroundImage
            src="/images/farm-valley-landscape.jpg"
            alt="Carinya Parc valley landscape"
          />
          <HeroContent>
            <HeroEyebrow>Our story</HeroEyebrow>
            <HeroTitle>A peaceful home for land, food &amp; community</HeroTitle>
            <HeroText>
              Carinya is an Aboriginal word meaning &quot;peaceful home.&quot; That&apos;s what
              we&apos;re building at The Branch — 42 hectares returning to health, one season at a
              time.
            </HeroText>
          </HeroContent>
        </Hero>

        <PageIntro
          eyebrow="Why we're here"
          title="We didn't inherit healthy land. We're growing it back."
          description="When we arrived, much of Carinya Parc had been cleared and tired out. We treat the land as borrowed from our grandkids — so we set out to prove that degraded country can become thriving woodland, clean waterways and productive farmland, in plain view and on the record."
        />

        {/* Founder */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-14">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg lg:order-none">
              <Image
                src="/images/highland-cattle-paddock.jpg"
                alt="On the land at Carinya Parc"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                Meet Jonno
              </p>
              <h2 className="mt-3.5 font-heading text-[38px] font-normal leading-[1.14] text-eucalypt-600">
                From strategy rooms to seed trays
              </h2>
              <p className="mt-[18px] text-[17px] leading-[1.7] text-charcoal">
                Carinya Parc was founded by Jonathan Daddia — a strategic leader who traded the
                boardroom for a pair of boots and a plan. He brings evidence-based rigour to
                regenerative farming: measure everything, share it openly, and let the land teach
                the rest.
              </p>
              <p className="mt-4 text-[17px] leading-[1.7] text-charcoal">
                &quot;Come get your hands dirty,&quot; is his standing invitation. &quot;Every tree
                counts, and there&apos;s a place for you here.&quot;
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Tag tone="eucalypt">Evidence-led</Tag>
                <Tag tone="kangaroo">Hands-on</Tag>
                <Tag tone="branch">Community-first</Tag>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-line bg-fleece py-16 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                What guides us
              </p>
              <h2 className="mt-3.5 font-heading text-[38px] font-normal text-eucalypt-600">
                Three principles, held lightly and firmly
              </h2>
            </div>
            <div className="mt-12 grid gap-7 lg:grid-cols-3">
              {VALUES.map((value) => (
                <Card key={value.title} className="bg-paperbark">
                  <CardContent className="p-[38px] pt-[38px]">
                    <MotifTile src={value.motif} tileClassName={value.tileClassName} />
                    <CardTitle className="mt-5 text-bark">{value.title}</CardTitle>
                    <CardDescription className="mt-3 text-[15.5px] leading-[1.6]">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The property */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-14">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                The property
              </p>
              <h2 className="mt-3.5 font-heading text-[38px] font-normal leading-[1.14] text-eucalypt-600">
                42 hectares along the Branch
              </h2>
              <p className="mt-[18px] text-[17px] leading-[1.7] text-charcoal">
                The land runs from dry gold pasture down to a working river frontage, framed by
                blue-green ranges. We&apos;re rebuilding it as a mosaic: woodland, habitat
                corridors, syntropic food forest, permaculture gardens and grazing for our Highland
                herd.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-5">
                {PROPERTY_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[18px] border border-line bg-fleece p-[22px]"
                  >
                    <div className="font-heading text-[38px] leading-none text-eucalypt-600">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-sm text-stone">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/images/river-valley-aerial.jpg"
                alt="Aerial of the river valley"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="relative overflow-hidden rounded-xl px-8 py-16 text-center shadow-lg sm:px-14 sm:py-[72px]">
              <Image
                src="/images/farm-track-gate.jpg"
                alt=""
                fill
                className="object-cover"
                aria-hidden
                sizes="100vw"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,38,26,0.55),rgba(18,38,26,0.78))]"
              />
              <div className="relative z-10 mx-auto max-w-[640px]">
                <h2 className="font-heading text-[40px] font-normal leading-[1.14] text-fleece">
                  Be part of the next chapter
                </h2>
                <p className="mx-auto mt-4 max-w-[520px] text-lg leading-[1.6] text-[#E4EADE]">
                  Support the regeneration, join a planting day, or follow along from wherever you
                  are.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                  <Button render={<Link href="/regenerate" />} variant="secondary">
                    Support our work →
                  </Button>
                  <Button render={<Link href="/contact" />} variant="ghost-light">
                    Get in touch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
