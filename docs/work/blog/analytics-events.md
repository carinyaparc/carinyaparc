---
type: Work
epic: blog
epic_id: CP09
story: S8
task: CP09-14
owner: blog
status: Draft
last_updated: 2026-07-25
related:
  - docs/work/blog/design.md
  - docs/work/blog/tasks.md
  - apps/site/src/lib/analytics/
  - apps/site/src/components/events/
  - docs/architecture/solution.md
---

# Analytics events — blog funnels (CP09)

Canonical GA4 / GTM event names and parameters for blog measurement (S8). Events are pushed to `window.dataLayer` (and mirrored to Vercel Analytics when available) **only when** analytics consent is `accepted` (`cp_consent` via `ConsentGate` → `GET /api/consent`). Without consent, helpers no-op — no `dataLayer` push (`solution.md` §7.2, §7.4; design decision 7).

Implementation: `apps/site/src/lib/analytics/`.

## 1. Transport

| Layer            | Behaviour                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Consent          | `hasAnalyticsConsent()` reads `/api/consent`; caches a positive `accepted` result for the page session |
| GTM              | `dataLayer.push({ event, ...params })` — custom event names match the table below                      |
| Vercel Analytics | `window.va('track', event, params)` when `va` is present (same consent gate)                           |
| Debug            | GA4 DebugView / GTM Preview with consent granted                                                       |

Do **not** put email addresses, names, or other PII in event parameters.

## 2. Event catalog

### Subscribe funnel (CP09-13)

| Event                | When                                                                                    | Parameters                                       | Allowed values                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subscribe_start`    | First meaningful interaction with an in-flow subscribe form (focus / change on a field) | `source` (string), `interest` (string, optional) | `source`: attribution string, e.g. `blog:{slug}`. `interest`: one of `restoration`, `regenerative-farming`, `community`, `produce`, `learning`, or omitted |
| `subscribe_complete` | Successful subscribe API response (`ok`)                                                | `source` (string), `interest` (string, optional) | Same as `subscribe_start`. `interest` is the value submitted (may be omitted for mid-article capture)                                                      |

**Sources.** In-flow blog modules use `blogSubscribeSource(slug)` → `blog:{slug}`. Do not invent alternate prefixes without updating this doc.

**Fired once per form mount for `subscribe_start`** (first interaction only). `subscribe_complete` fires once per successful submit.

### Participation funnel (CP09-14)

| Event                   | When                                                                 | Parameters                                       | Allowed values                                                                 |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| `event_cta_click`       | Reader activates a participation CTA (in-article or listing)         | `event_id` (string \| number), `source` (string) | `event_id`: Payload event id. `source`: e.g. `blog:{slug}` or `events-listing` |
| `event_signup_complete` | Successful on-site event signup API response (`ok`)                  | `event_id` (string \| number), `source` (string) | `event_id`: Payload event id. `source`: e.g. `events-listing` or `blog:{slug}` |

**Sources.** In-article `GetInvolvedCTA` uses `blogSubscribeSource(slug)` → `blog:{slug}`. Listing-card external CTAs default to `EVENTS_LISTING_SOURCE` (`events-listing`).

**CTA surfaces.** Primary button on `GetInvolvedCTA` (sign up or full/waitlist). External signup / waitlist buttons on `EventCard`. The “All upcoming events” text link does not fire `event_cta_click`.

**Signup complete.** Fires once per successful `/api/events/signup` response from `EventSignup`, with `event_id` and `source` (defaults to `events-listing` on the listing page). Honeypot fake-success does not fire.

Helpers: `trackEventCtaClick`, `trackEventSignupComplete` in `lib/analytics`.

### Article engagement (CP09-13)

| Event                  | When                                             | Parameters       | Allowed values                     |
| ---------------------- | ------------------------------------------------ | ---------------- | ---------------------------------- |
| `article_scroll_depth` | Reader scrolls an article past a depth threshold | `depth` (number) | Exactly `25`, `50`, `75`, or `100` |

Each threshold fires **at most once** per page view. Depth is measured against the article element (viewport bottom relative to article height).

## 3. Example payloads

```js
// Subscribe start (mid-article — no interest yet)
dataLayer.push({
  event: 'subscribe_start',
  source: 'blog:winter-fencing-progress',
});

// Subscribe complete (end-of-post with interest)
dataLayer.push({
  event: 'subscribe_complete',
  source: 'blog:winter-fencing-progress',
  interest: 'community',
});

// In-article get-involved CTA
dataLayer.push({
  event: 'event_cta_click',
  event_id: 12,
  source: 'blog:winter-fencing-progress',
});

// Successful on-site event signup
dataLayer.push({
  event: 'event_signup_complete',
  event_id: 12,
  source: 'events-listing',
});

// Scroll depth
dataLayer.push({
  event: 'article_scroll_depth',
  depth: 50,
});
```

## 4. Instrumentation map

| Surface                                                   | Events                                     |
| --------------------------------------------------------- | ------------------------------------------ |
| `components/subscribe/InlineSubscribe.tsx`                | `subscribe_start`, `subscribe_complete`    |
| `components/subscribe/EndOfPostSubscribe.tsx`             | `subscribe_start`, `subscribe_complete`    |
| `components/blog/ArticleScrollDepth.tsx` on `blog/[slug]` | `article_scroll_depth`                     |
| `components/events/GetInvolvedCTA.tsx`                    | `event_cta_click`                          |
| `components/events/EventCard.tsx` (external / waitlist)   | `event_cta_click`                          |
| `components/events/EventSignup.tsx`                       | `event_signup_complete`                    |

## 5. Out of scope here

- Funnel dashboard / GA4 exploration UI (CP09-16)
- Contact form Vercel `va` events (pre-existing; not part of this schema)
- Changing ConsentGate / CSP for analytics hosts
