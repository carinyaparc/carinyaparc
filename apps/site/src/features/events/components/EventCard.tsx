'use client';

import Link from 'next/link';

import { EventSignup } from './EventSignup';
import { Button } from '@/components/ui/Button';
import { EVENTS_LISTING_SOURCE, trackEventCtaClick } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import type { UpcomingEvent } from '../queries/events';
import { eventsListingUrl } from '@/lib/payload/urls';

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Australia/Sydney',
  }).format(new Date(iso));
}

export function eventSignupHref(event: UpcomingEvent): string {
  if (event.signupTarget) {
    return event.signupTarget;
  }
  // Deep-link to this event's on-site signup slot on the listing page.
  return `${eventsListingUrl()}#event-${event.slug}`;
}

export function isExternalEventHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

type EventCardProps = {
  event: UpcomingEvent;
  /** Attribution for external signup CTA clicks; defaults to listing. */
  source?: string;
  className?: string;
};

export function EventCard({ event, source = EVENTS_LISTING_SOURCE, className }: EventCardProps) {
  const externalHref = event.signupTarget?.trim() ? event.signupTarget.trim() : null;
  const external = externalHref ? isExternalEventHref(externalHref) : false;
  const full = Boolean(event.isFull);
  const showOnSiteSignup = !externalHref;

  const handleExternalCtaClick = () => {
    trackEventCtaClick({ event_id: event.id, source });
  };

  return (
    <article
      id={`event-${event.slug}`}
      className={cn(
        'flex flex-col rounded-lg border border-line bg-fleece p-7 shadow-md',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
        <time dateTime={event.startsAt}>{formatEventDate(event.startsAt)}</time>
      </p>
      <h2 className="mt-2.5 font-heading text-[22px] font-normal leading-[1.22] text-bark">
        {event.title}
      </h2>
      <p className="mt-2 text-[14.5px] leading-[1.55] text-stone">{event.location}</p>

      {showOnSiteSignup ? (
        <EventSignup
          eventId={event.id}
          eventTitle={event.title}
          source={EVENTS_LISTING_SOURCE}
          isFull={full}
        />
      ) : full ? (
        <div className="mt-6">
          <Button
            render={<Link href="/subscribe/" onClick={handleExternalCtaClick} />}
            variant="outline"
            size="sm"
          >
            Full — join the waitlist
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <Button
            render={
              <Link
                href={externalHref!}
                onClick={handleExternalCtaClick}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              />
            }
            variant="bracken"
            size="sm"
          >
            Sign up
          </Button>
        </div>
      )}
    </article>
  );
}

export function EventsEmptyState() {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <p className="text-[17px] leading-[1.7] text-charcoal">
        No upcoming events just now. Subscribe for invitations to planting days and workshops.
      </p>
      <div className="mt-6">
        <Button render={<Link href="/subscribe/" />} variant="bracken" size="sm">
          Subscribe for updates
        </Button>
      </div>
    </div>
  );
}
