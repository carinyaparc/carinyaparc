import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MotifTile } from '@/components/sections/page/MotifTile';
import {
  Hero,
  HeroContent,
  HeroBackgroundImage,
  HeroTitle,
  HeroText,
  HeroEyebrow,
  HeroActions,
  HeroButton,
} from '@/src/components/sections/hero';
import { ImpactStats } from '@/src/components/sections/stats/ImpactStats';
import { LatestPosts } from '@/src/components/sections/blog';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';

export const revalidate = 86_400;

const MISSION_FEATURES = [
  {
    motif: '/motifs/motif-leaf.svg',
    title: 'Regeneration over extraction',
    description:
      'Practices that rebuild soil, water and biodiversity rather than deplete them. Every action leaves the land healthier.',
  },
  {
    motif: '/motifs/motif-sprout.svg',
    title: 'Stewardship over ownership',
    description:
      "We treat the land as borrowed from our grandkids — cared for with humility, guided by science and nature's own wisdom.",
  },
  {
    motif: '/motifs/motif-hills.svg',
    title: 'Collaboration & transparency',
    description:
      'Many hands, open sharing. We partner with community and publish our wins and setbacks alike.',
  },
] as const;

const STORY_TAGS = [
  { label: '30,000+ native trees', className: 'bg-eucalypt-50 text-eucalypt-700' },
  { label: 'Branch River frontage', className: 'bg-kangaroo-100 text-kangaroo-700' },
  { label: 'Wildlife corridors', className: 'bg-bracken-100 text-bracken-700' },
] as const;

const EXPERIENCE_ITEMS = [
  {
    title: 'Join a planting day.',
    description: 'Get your hands dirty at an upcoming event.',
  },
  {
    title: 'Book a tour.',
    description: 'Small-group experiences led by Jonno.',
  },
  {
    title: 'Stay on the land.',
    description: 'Rustic accommodation, coming soon.',
  },
] as const;

export default async function HomePage() {
  return (
    <>
      <SchemaMarkup type="page" includeLocalBusiness={true} />

      <div className="min-h-screen bg-paperbark">
        {/* Hero */}
        <section>
          <Hero>
            <HeroBackgroundImage src="/images/hero-home.jpg" alt="Carinya Parc Hero" priority />
            <HeroContent>
              <HeroEyebrow>Upper Hunter, NSW</HeroEyebrow>
              <HeroTitle>
                Restoring the land,
                <br />
                nurturing the future
              </HeroTitle>
              <HeroText>
                A peaceful home for land, food &amp; community. We&apos;re healing 42 hectares of
                degraded country and growing nutrient-dense food through regenerative agriculture —
                and we&apos;d love your help.
              </HeroText>
              <HeroActions>
                <HeroButton href="/regenerate" variant="secondary">
                  Support our work →
                </HeroButton>
                <HeroButton href="/#stay" variant="ghost-light">
                  Join the journey
                </HeroButton>
              </HeroActions>
            </HeroContent>
          </Hero>
        </section>

        {/* Mission */}
        <section className="bg-paperbark py-24">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="mx-auto max-w-[780px] text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                Our mission
              </p>
              <h2 className="mt-4 font-heading text-3xl font-normal text-balance text-eucalypt-600 sm:text-[44px] sm:leading-[1.12]">
                Heal land and food systems, together
              </h2>
              <p className="mt-[18px] text-[19px] leading-relaxed text-stone">
                Through hands-on ecological restoration, nutrient-dense produce, and inspiring
                collective action — leaving every acre healthier than we found it.
              </p>
            </div>

            <div className="mt-[60px] grid gap-7 md:grid-cols-3">
              {MISSION_FEATURES.map((feature) => (
                <Card key={feature.title} className="rounded-[24px] bg-fleece">
                  <CardContent className="p-10 pt-10">
                    <MotifTile
                      src={feature.motif}
                      className="h-16 w-16"
                      tileClassName="bg-eucalypt-50"
                      iconSize={34}
                    />
                    <h3 className="mt-[22px] font-heading text-[25px] font-normal text-bark">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-stone">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-paperbark pb-24">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="grid items-center gap-[60px] lg:grid-cols-2">
              <div className="relative order-first aspect-4/3 overflow-hidden rounded-xl shadow-lg lg:order-0">
                <Image
                  src="/images/river-valley-aerial.jpg"
                  alt="Aerial view of the river valley at Carinya Parc"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={80}
                />
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                  Our story
                </p>
                <h2 className="mt-4 font-heading text-[32px] font-normal leading-[1.1] text-eucalypt-600 sm:text-[42px]">
                  Regenerating land,
                  <br />
                  growing community
                </h2>
                <p className="mt-5 text-[17px] leading-[1.7] text-charcoal">
                  We&apos;re transforming 42 hectares of previously degraded land into thriving
                  woodland, habitat corridors and productive agroforestry. Founded by Jonathan
                  Daddia — strategic leader turned regenerative farmer — combining evidence-based
                  ecology with community engagement.
                </p>
                <div className="mt-[26px] flex flex-wrap gap-2.5">
                  {STORY_TAGS.map((tag) => (
                    <span
                      key={tag.label}
                      className={`rounded-pill px-[17px] py-[9px] text-[13.5px] font-semibold ${tag.className}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <Button render={<Link href="/about" />} variant="primary" className="mt-[30px]">
                  Read our story →
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ImpactStats />

        {/* Experience */}
        <section id="visit" className="bg-paperbark py-24">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="grid items-center gap-[60px] lg:grid-cols-2">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
                  Experience the farm
                </p>
                <h2 className="mt-4 font-heading text-[32px] font-normal leading-[1.1] text-eucalypt-600 sm:text-[42px]">
                  Reconnect with nature, hands in the soil
                </h2>
                <p className="mt-5 text-[17px] leading-[1.7] text-charcoal">
                  Be first in line for guided tours, hands-on planting days, seasonal workshops and
                  eco-stays. Wander the permaculture gardens, syntropic food forest and meet our
                  Highland herd.
                </p>
                <ul role="list" className="mt-[26px] flex flex-col gap-3.5">
                  {EXPERIENCE_ITEMS.map((item) => (
                    <li key={item.title} className="flex items-start gap-3 text-base text-charcoal">
                      <span className="font-bold text-kangaroo-500" aria-hidden>
                        ◦
                      </span>
                      <span>
                        <strong className="font-semibold text-bark">{item.title}</strong>{' '}
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  render={<Link href="/#stay" />}
                  className="mt-[30px] bg-kangaroo-500 text-kangaroo-900 hover:bg-kangaroo-400"
                >
                  Be first to know →
                </Button>
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-xl shadow-lg">
                <Image
                  src="/images/highland-cattle-paddock.jpg"
                  alt="Highland cattle grazing in a paddock at Carinya Parc"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={80}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Journal */}
        <section>
          <LatestPosts
            title="Life on Pasture"
            limit={3}
            viewAllLink="/blog"
            eyebrow="Our journal"
          />
        </section>
      </div>
    </>
  );
}
