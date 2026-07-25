import type { Metadata } from 'next';

import { EventCard, EventsEmptyState } from '@/features/events/components/EventCard';
import { PageIntro } from '@/components/sections/page';
import { SchemaMarkup } from '@/components/ui/SchemaMarkup';
import { generatePageMetadata } from '@/lib/metadata';
import { getUpcomingEvents } from '@/features/events/queries/events';
import { eventsListingUrl } from '@/lib/payload/urls';

export const revalidate = 86_400;

export const metadata: Metadata = generatePageMetadata({
  title: 'Events - Get Involved',
  description:
    'Upcoming planting days, workshops, and volunteer opportunities at Carinya Parc. Join us on the land.',
  path: eventsListingUrl(),
  keywords: ['events', 'planting days', 'workshops', 'volunteer', 'get involved', 'Carinya Parc'],
});

export default async function EventsListingPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <SchemaMarkup type="page" />

      <main className="min-h-screen bg-paperbark">
        <PageIntro
          eyebrow="Get involved · The Branch, NSW"
          title="Come get your hands dirty"
          description="Planting days, workshops, and open days on the farm. Sign up for an upcoming event — or subscribe so you're first to hear about the next one."
          titleAs="h1"
          className="pb-12 pt-16"
          titleClassName="mx-auto max-w-[880px] text-[40px] leading-[1.06] sm:text-[58px]"
          descriptionClassName="mx-auto mt-[18px] max-w-[620px] text-stone leading-[1.6]"
        />

        <section className="pb-[84px]" aria-label="Upcoming events">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
            {events.length > 0 ? (
              <ul className="grid auto-rows-fr grid-cols-1 gap-[30px] md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <li key={event.id} className="flex">
                    <EventCard event={event} className="w-full" />
                  </li>
                ))}
              </ul>
            ) : (
              <EventsEmptyState />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
