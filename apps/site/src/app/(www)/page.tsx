import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Shovel, Sprout, Newspaper, Ticket, TentTree, Trees } from 'lucide-react';

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
import {
  SectionWithImage,
  SectionImage,
  SectionContent,
  SectionTitle,
  SectionSubtitle,
  SectionText,
  SectionTag,
  SectionActions,
  SectionButton,
  SectionLink,
} from '@/src/components/sections/section';
import { ImpactStats } from '@/src/components/sections/stats/ImpactStats';
import { LatestPosts } from '@/src/components/sections/blog';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';

export const revalidate = 86_400;

export default async function HomePage() {
  return (
    <>
      {/* Schema markup for home page */}
      <SchemaMarkup type="page" includeLocalBusiness={true} />

      <div className="min-h-screen bg-paperbark">
        {/* Hero Section */}
        <section>
          <Hero>
            <HeroBackgroundImage src="/images/hero-home.jpg" alt="Carinya Parc Hero" priority />
            <HeroContent>
              <HeroEyebrow>The Branch · Upper Hunter, NSW</HeroEyebrow>
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

        <ImpactStats />

        {/* Features Section */}
        <section className="bg-paperbark py-12 sm:py-16">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-heading text-3xl font-normal text-eucalypt-600 lg:text-4xl">
                Our Mission
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-charcoal">
                To heal land and food systems through hands-on ecological restoration, delivering
                nutrient-dense produce, and inspiring collective action.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Trees,
                  title: 'Regeneration over Extraction',
                  description:
                    'We prioritise practices that rebuild soil health, biodiversity and water systems rather than deplete them. Ensuring every action leaves the land healthier than we found it.',
                },
                {
                  icon: Heart,
                  title: 'Stewardship over Ownership',
                  description:
                    "We treat the land as borrowed from future generations. Caring for it with respect and humility, guided by both scientific knowledge and nature's own wisdom.",
                },
                {
                  icon: Users,
                  title: 'Collaboration & Transparency',
                  description:
                    'True transformation requires many hands and open sharing. We partner with communities - inviting everyone to learn from our successes and setbacks.',
                },
              ].map((feature) => (
                <Card key={feature.title} className="h-full bg-eucalypt-800 border-eucalypt-700 hover:shadow-lg">
                  <CardContent className="p-8 text-center">
                    <feature.icon className="mx-auto mb-4 h-12 w-12 text-primary-foreground" />
                    <h3 className="mb-4 font-heading text-xl font-normal text-fleece">
                      {feature.title}
                    </h3>
                    <p className="text-[#CFDAC7]">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/*Our Story Section*/}
        <section className="py-8 sm:py-12">
          <SectionWithImage variant="dark" imagePosition="right">
            <SectionImage imagePosition="right">
              <Image
                src="/images/farm-track-gate.jpg"
                alt="Farm landscape"
                fill
                className="object-cover"
                quality={80}
              />
            </SectionImage>
            <SectionContent imagePosition="right">
              <SectionSubtitle variant="dark">Our Story</SectionSubtitle>
              <SectionTitle variant="dark">Regenerating Land, Growing Community</SectionTitle>
              <SectionText variant="dark">
                We&apos;re transforming 42 hectares (104 acres) of previously degraded land into
                thriving woodland, diverse habitat corridors, and productive agroforestry systems.
                Founded by Jonathan Daddia — strategic leader turned regenerative farmer — our
                approach combines evidence-based ecological practices with community engagement.
              </SectionText>
              <SectionActions>
                <SectionButton href="/about" variant="dark">
                  Read Our Story →
                </SectionButton>
              </SectionActions>
            </SectionContent>
          </SectionWithImage>
        </section>

        {/*Regenerate Section*/}
        <section className="bg-fleece py-8 sm:py-12">
          <SectionWithImage variant="light" imagePosition="left">
            <SectionImage imagePosition="left">
              <Image
                src="/images/river-valley-aerial.jpg"
                alt="Aerial view of the river valley at Carinya Parc"
                fill
                className="object-cover"
                quality={80}
              />
            </SectionImage>
            <SectionContent imagePosition="left">
              <SectionSubtitle variant="light">Regenerate with Us</SectionSubtitle>
              <SectionTitle variant="light">
                Help Restore Diversity, For our Native Wildlife
              </SectionTitle>
              <SectionText variant="light">
                How are we restoring biodiversity? Through planting 30,000+ native trees, enhancing
                waterways and creating wildlife corridors spanning our Branch River frontage. You
                can help:
                <div className="mt-6 flex flex-wrap gap-2">
                  <SectionTag tone="eucalypt">Planting days</SectionTag>
                  <SectionTag tone="kangaroo">Open reports</SectionTag>
                  <SectionTag tone="bracken">Wildlife corridors</SectionTag>
                </div>
                <ul role="list" className="mt-8 space-y-6">
                  <li className="flex gap-x-3">
                    <Shovel className="h-6 w-6 text-eucalypt-500" />
                    <span>
                      <strong className="font-semibold">Join a planting day.</strong> Get your hands
                      dirty at an upcoming planting events.
                    </span>
                  </li>
                  <li className="flex gap-x-3">
                    <Sprout className="h-6 w-6 text-kangaroo-500" />
                    <span>
                      <strong className="font-semibold">Support regeneration.</strong> Provide
                      seedlings, fencing and ecological monitoring equipment.
                    </span>
                  </li>
                  <li className="flex gap-x-3">
                    <Newspaper className="h-6 w-6 text-branch-500" />
                    <span>
                      <strong className="font-semibold">Follow our progress.</strong> Access open
                      reports tracking soil health, water quality and biodiversity improvements.
                    </span>
                  </li>
                </ul>
              </SectionText>
              <SectionActions>
                <SectionButton href="/regenerate" variant="light">
                  Get Involved →
                </SectionButton>
              </SectionActions>
            </SectionContent>
          </SectionWithImage>
        </section>

        {/*Experience Section*/}
        <section className="py-8 sm:py-12">
          <SectionWithImage variant="dark" imagePosition="right">
            <SectionImage imagePosition="right">
              <Image
                src="/images/highland-cattle-paddock.jpg"
                alt="Highland cattle grazing in a paddock at Carinya Parc"
                fill
                className="object-cover"
                quality={80}
              />
            </SectionImage>
            <SectionContent imagePosition="right">
              <SectionSubtitle variant="dark">Experience the Farm</SectionSubtitle>
              <SectionTitle variant="dark">
                Explore Regenerative Farming, Reconnect with Nature
              </SectionTitle>
              <SectionText variant="dark">
                Discover regenerative farming. Immerse yourself through guided tours, hands-on
                workshops and eco-stays. Explore our permaculture gardens, syntropic food forest and
                wildlife corridors.
                <ul role="list" className="mt-8 space-y-6">
                  <li className="flex gap-x-3">
                    <Ticket className="h-6 w-6 text-wattle" />
                    <span>
                      <strong className="font-semibold text-fleece">Book a tour.</strong> Small-group
                      experiences led by Jonno.
                    </span>
                  </li>
                  <li className="flex gap-x-3">
                    <Trees className="h-6 w-6 text-wattle" />
                    <span>
                      <strong className="font-semibold text-fleece">Join a workshop.</strong> Learn
                      practical skills in seed saving, soil building and food preservation
                    </span>
                  </li>
                  <li className="flex gap-x-3">
                    <TentTree className="h-6 w-6 text-wattle" />
                    <span>
                      <strong className="font-semibold text-fleece">Stay on the land.</strong> Connect
                      deeply with the land through our rustic accommodation options.
                    </span>
                  </li>
                </ul>
              </SectionText>
              <SectionActions>
                <SectionButton href="#" variant="dark">
                  Coming Soon!
                </SectionButton>
                <SectionLink href="/#stay" variant="dark">
                  Sign Up! Be the first to know
                </SectionLink>
              </SectionActions>
            </SectionContent>
          </SectionWithImage>
        </section>

        {/*Blog Section */}
        <section>
          <LatestPosts
            title="From the journal"
            subtitle="What's happening on the farm? Follow our journey as we transform Carinya Parc into a thriving regenerative farm."
            limit={3}
            viewAllLink="/blog"
            eyebrow="Life on pasture"
          />
        </section>
      </div>
    </>
  );
}
