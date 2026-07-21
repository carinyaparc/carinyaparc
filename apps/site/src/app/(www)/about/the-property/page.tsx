import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Droplets, MapPin, Clock } from 'lucide-react';
import { generatePageMetadata } from '@/src/lib/metadata';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';

export const metadata: Metadata = generatePageMetadata({
  title: 'The Property - Carinya Parc',
  description:
    'Explore our 42-hectare property in The Branch, NSW - home to native woodland, river frontage, and the beginning of our ecological restoration journey.',
  path: '/about/the-property',
  image: '/images/farm-track-gate.jpg',
  keywords: [
    'The Branch NSW',
    'property',
    'farm',
    'river frontage',
    'native woodland',
    'ecological restoration',
    'regeneration',
  ],
});

export default function ThePropertyPage() {
  return (
    <>
      {/* Schema markup for about page */}
      <SchemaMarkup type="about" />

      <main className="isolate min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb />
        </div>

        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl lg:flex lg:justify-between lg:px-8 xl:justify-end">
            <div className="lg:flex lg:w-1/2 lg:shrink lg:grow-0 xl:absolute xl:inset-y-0 xl:right-1/2 xl:w-1/2">
              <div className="relative h-80 lg:-ml-8 lg:h-auto lg:w-full lg:grow xl:ml-0">
                <Image
                  alt="Aerial view of Carinya Parc property"
                  src="/images/river-valley-aerial.jpg"
                  fill
                  className="absolute inset-0 size-full bg-gray-50 object-cover"
                  priority
                  quality={80}
                />
              </div>
            </div>
            <div className="px-6 lg:contents">
              <div className="mx-auto max-w-2xl pt-16 pb-24 sm:pt-20 sm:pb-32 lg:mr-0 lg:ml-8 lg:w-full lg:max-w-lg lg:flex-none lg:pt-32 xl:w-1/2">
                <p className="text-base/7 font-semibold text-eucalypt-400">Our Land</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-eucalypt-600 sm:text-5xl">
                  The Property
                </h1>
                <p className="mt-6 text-xl/8 text-charcoal-700">
                  Carinya Parc is 42 hectares (approximately 102 acres) of gently undulating
                  countryside at The Branch, on New South Wales's mid-north coast.
                </p>
                <div className="mt-10 max-w-xl text-base/7 text-charcoal-700 lg:max-w-none">
                  <p>
                    The site runs for more than 400 metres along the Branch River, offering natural
                    frontage that supports swimming holes, fishing and, in time, improved riparian
                    habitat. Scattered remnants of native woodland peek through cleared paddocks,
                    hinting at the bush corridors we are reestablishing to connect fragmented
                    habitats for koalas, gliders and native birds. A network of five farm dams,
                    gravity-fed irrigation lines and four troughs ensures reliable water supply
                    across the property, while a sealed driveway and visitor parking beside the
                    homestead provide easy access for guests and volunteers.
                  </p>
                  <ul role="list" className="mt-8 space-y-8 text-charcoal-600">
                    <li className="flex gap-x-3">
                      <MapPin
                        aria-hidden="true"
                        className="mt-1 size-5 flex-none text-eucalypt-600"
                      />
                      <span>
                        Located in NSW's mid-north coast, 5 km from Stroud, 70 km to Newcastle, and
                        within easy reach of Barrington Tops National Park, Port Stephens, and the
                        Great Lakes region.
                      </span>
                    </li>
                    <li className="flex gap-x-3">
                      <Clock
                        aria-hidden="true"
                        className="mt-1 size-5 flex-none text-eucalypt-600"
                      />
                      <span>
                        Previously an alpaca farm, Carinya Parc has entered a deliberate rest period
                        in early 2024 to allow natural regeneration following decades of grazing
                        pressure.
                      </span>
                    </li>
                    <li className="flex gap-x-3">
                      <Droplets
                        aria-hidden="true"
                        className="mt-1 size-5 flex-none text-eucalypt-600"
                      />
                      <span>
                        The property includes five farm dams across undulating hills, frost-free
                        ridges and sheltered valleys. The Branch River frontage provides important
                        riparian habitat for local wildlife.
                      </span>
                    </li>
                  </ul>
                  <h2 className="mt-16 text-2xl font-bold tracking-tight text-charcoal-900">
                    A Canvas for Ecological Renewal
                  </h2>
                  <p className="mt-6">
                    Carinya Parc is a blank canvas poised for ecological renewal. Over the coming
                    years we will plant more than 30,000 native trees and shrubs across five
                    carefully defined zones, stabilise eroded riverbanks, trial syntropic
                    agroforestry guilds and monitor soil health, water quality and biodiversity
                    through an open-data framework. Every contour, watercourse and forest remnant
                    has been mapped to guide this long-term vision, ensuring that each hectare moves
                    steadily closer to its natural potential.
                  </p>
                  <p className="mt-6">
                    Whether you are here to learn, to lend a hand or simply to enjoy the peace and
                    privacy of rural NSW, The Property at Carinya Parc offers both a working farm
                    and a living laboratory for regeneration in action.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <Button render={<Link href="/regenerate/" />} variant="bracken">
                      Get Involved
                    </Button>
                    <Link
                      href="/about/"
                      className="text-sm font-semibold leading-6 text-charcoal-900"
                    >
                      <span>
                        Learn more about us <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
