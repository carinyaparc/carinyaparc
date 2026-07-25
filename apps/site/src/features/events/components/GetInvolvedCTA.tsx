'use client';

import Link from 'next/link';

import { eventSignupHref, formatEventDate, isExternalEventHref } from './EventCard';
import { Button } from '@/components/ui/Button';
import { trackEventCtaClick } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import type { UpcomingEvent } from '../queries/events';
import { eventsListingUrl } from '@/lib/payload/urls';

export type GetInvolvedCTAProps = {
  /** Next upcoming published event, or null when none are scheduled. */
  event: UpcomingEvent | null;
  /** Attribution for analytics, e.g. `blog:{slug}`. */
  source: string;
  className?: string;
};

/**
 * End-of-article participation CTA. Links to the next upcoming event when one
 * exists; returns null when the calendar is empty so articles stay clean.
 */
export function GetInvolvedCTA({ event, source, className }: GetInvolvedCTAProps) {
  if (!event) {
    return null;
  }

  const full = Boolean(event.isFull);
  const primaryHref = full ? '/subscribe/' : eventSignupHref(event);
  const primaryExternal = !full && isExternalEventHref(primaryHref);
  const listingHref = eventsListingUrl();

  const handlePrimaryClick = () => {
    trackEventCtaClick({ event_id: event.id, source });
  };

  return (
    <aside
      className={cn(
        'mx-auto my-12 max-w-[720px] rounded-[18px] border border-line bg-fleece px-6 py-8 sm:px-10',
        className,
      )}
      aria-labelledby="get-involved-cta-heading"
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
        Get involved
      </p>
      <h2
        id="get-involved-cta-heading"
        className="mt-3 font-heading text-[28px] font-normal text-eucalypt-600 sm:text-[32px]"
      >
        Come get your hands dirty
      </h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-charcoal">
        Moved by the story? Join us on the land for planting days, workshops, and open days.
      </p>

      <div className="mt-6 border-t border-line pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bracken-500">
          <time dateTime={event.startsAt}>{formatEventDate(event.startsAt)}</time>
        </p>
        <p className="mt-2 font-heading text-[22px] font-normal leading-[1.22] text-bark">
          {event.title}
        </p>
        <p className="mt-1.5 text-[14.5px] leading-[1.55] text-stone">{event.location}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          render={
            <Link
              href={primaryHref}
              onClick={handlePrimaryClick}
              {...(primaryExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            />
          }
          variant={full ? 'outline' : 'bracken'}
          size="sm"
        >
          {full ? 'Full — join the waitlist' : 'Sign up for this event'}
        </Button>
        <Link
          href={listingHref}
          className="text-[15px] font-semibold text-eucalypt-600 transition-opacity hover:opacity-70"
        >
          All upcoming events →
        </Link>
      </div>
    </aside>
  );
}
