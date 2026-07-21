/**
 * Contact Page - Server Component
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ContactFormSection } from '@/components/sections/forms';
import { PageIntro } from '@/components/sections/page';
import { generateMetadata as generateMetadataHelper } from '@/src/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataHelper({
    pageTitle: 'Contact Us',
    pageDescription:
      'Get in touch with Carinya Parc for inquiries about farm stays, tours, volunteering, or partnership opportunities. We respond to all inquiries within 48 business hours.',
    path: '/contact',
    type: 'website',
  });
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-paperbark">
      <PageIntro
        eyebrow="Get in touch"
        title="Let's talk about the land"
        titleAs="h1"
        description="Whether you're a funder, a neighbour, a school group or just curious — we'd love to hear from you. Tell us a little about what you have in mind and we'll get back to you."
        align="left"
        className="pb-10 pt-16 sm:pt-20"
      />

      <section className="pb-16 sm:pb-24">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 px-6 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12 lg:px-14">
          <div className="rounded-xl border border-line bg-fleece p-8 shadow-md sm:p-11">
            <ContactFormSection />
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-[22px] border border-line bg-paperbark p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
                Visit
              </p>
              <p className="mt-2.5 font-heading text-xl text-bark">The Branch, NSW</p>
              <p className="mt-1.5 text-[15px] leading-[1.6] text-stone">
                315 Warraba Road
                <br />
                The Branch NSW 2425
                <br />
                Upper Hunter, Australia
              </p>
              <p className="mt-3 text-sm text-stone">
                Visits by appointment — please get in touch first.
              </p>
            </div>

            <div className="rounded-[22px] border border-line bg-paperbark p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
                Reach us
              </p>
              <div className="mt-3 flex flex-col gap-2.5 text-[15px]">
                <a
                  href="mailto:contact@carinyaparc.com.au"
                  className="text-eucalypt-600 hover:opacity-70"
                >
                  contact@carinyaparc.com.au
                </a>
                <Link href="/#stay" className="text-eucalypt-600 hover:opacity-70">
                  Subscribe to the newsletter
                </Link>
                <span className="text-stone">Instagram · Facebook · @carinyaparc</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] shadow-md">
              <Image
                src="/images/farm-dam-trees.jpg"
                alt="The dam and trees at Carinya Parc"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 30vw"
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
