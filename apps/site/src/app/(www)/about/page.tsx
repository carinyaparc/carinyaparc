import type { Metadata } from 'next';
import Image from 'next/image';
import { HeroWithTiles } from '@/src/components/sections/hero';
import { generatePageMetadata } from '@/src/lib/metadata';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';

// Define stats data
const stats = [
  { label: 'Hectares to Rewild', value: '10+' },
  { label: 'Natives to Plant', value: '30,000' },
  { label: 'Riparian Repair', value: '400m' },
  { label: 'Farm Dams', value: '5' },
];

export const metadata: Metadata = generatePageMetadata({
  title: 'About - Carinya Parc',
  description:
    "Discover the story of Carinya Parc, our peaceful home where we're regenerating land, building community, and demonstrating ecological stewardship in practice.",
  path: '/about',
  image: '/images/hero-home.jpg',
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
      {/* Schema markup for about page */}
      <SchemaMarkup type="about" />

      <main className="isolate min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb />
        </div>

        {/* Hero with Stats */}
        <section>
          <HeroWithTiles
            variant="light"
            title="Regenerating Country One Landscape at a Time"
            subtitle="About Carinya Parc"
            description="Discover the story of Carinya Parc, our peaceful home where we're regenerating land, building community, and demonstrating ecological stewardship in practice."
            tileImages={[
              { src: '/images/highland-cattle-paddock.jpg', alt: 'Carinya Parc landscape' },
              { src: '/images/highland-cattle-dam.jpg', alt: 'Carinya Parc river' },
              { src: '/images/alpacas-farm-field.jpg', alt: 'Native plantings' },
              { src: '/images/farm-track-gate.jpg', alt: 'Farm dam' },
              { src: '/images/farm-valley-landscape.jpg', alt: 'Carinya Parc landscape' }, // Duplicating first image to ensure we have 5 for the layout
            ]}
          />
        </section>

        {/* Carinya meaning */}
        <section className="isolate py-8 sm:py-12">
          <div className="mx-auto my-16 max-w-7xl sm:my-20 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-charcoal-600 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-charcoal-200 sm:text-4xl">
                What does Carinya mean?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-xl leading-8 text-white">
                <strong>Carinya</strong> is an Aboriginal Australian word, primarily from the
                Awabakal language of the Newcastle-Lake Macquarie region, that translates to{' '}
                <span className="text-eucalyptus-600 font-semibold">"peaceful home"</span> or{' '}
                <span className="text-eucalyptus-600 font-semibold">"happy home"</span>.
              </p>
              <div
                aria-hidden="true"
                className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
              >
                <div
                  style={{
                    clipPath:
                      'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                  }}
                  className="aspect-[1404/767] w-[27.875rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission section with stats */}
        <section className="isolate py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <h2 className="text-3xl font-semibold tracking-tight text-pretty text-eucalyptus-600 sm:text-4xl">
                Our Mission
              </h2>
              <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
                <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
                  <p className="text-xl/8 font-medium text-charcoal-500">
                    At Carinya Parc, we're transforming a 42-hectare former grazing property into a
                    living demonstration of regenerative agriculture and ecological restoration.
                    Nestled on the mid-north coast of New South Wales, our land has been resting
                    since early 2024—giving us time to observe, plan and begin the journey of
                    renewal.
                  </p>
                  <p className="mt-10 max-w-xl text-lg/7 font-medium text-charcoal-500">
                    What drives us? A vision of thriving landscapes where biodiversity, food
                    production and community connection work in harmony to heal Country.
                  </p>
                </div>
                <div className="lg:flex lg:flex-auto lg:justify-center">
                  <dl className="w-64 space-y-8 xl:w-80">
                    {stats.map((stat) => (
                      <div key={stat.label} className="flex flex-col-reverse gap-y-4">
                        <dt className="text-base/7 text-charcoal-500">{stat.label}</dt>
                        <dd className="text-5xl font-semibold tracking-tight text-eucalyptus-600">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image section */}
        <section>
          <div className="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
            <Image
              alt="Carinya Parc landscape"
              src="/images/farm-track-gate.jpg"
              width={1920}
              height={768}
              className="aspect-5/2 w-full object-cover xl:rounded-3xl"
              quality={80}
            />
          </div>
        </section>
      </main>
    </>
  );
}
