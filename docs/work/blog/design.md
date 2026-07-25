---
type: Design
mode: tdd
epic: blog
epic_id: CP09
version: '0.2'
owner: blog
status: Draft
last_updated: 2026-07-24
related:
  - docs/architecture/solution.md
  - docs/work/blog/tasks.md
  - docs/product/roadmap.md
---

# Design — Blog (CP09)

Design for epic CP09 at `docs/work/blog/`. Covers the full blog surface: discoverability, reader engagement, subscriber conversion, participation, and measurement. Architecture-wide patterns are authoritative in [`solution.md`](../../architecture/solution.md) and are cited, not repeated.

## 1. Scope

Builds reader-facing capability on top of the **already-shipped** blog foundation — SSG/ISR rendering, pagination, RSS, on-demand revalidation, and draft-safe public queries (`solution.md` §5.1, §7.4, §6.3). This epic adds the surfaces those foundations were built for.

| Capability | Stories | tasks.md |
| ---------- | ------- | -------- |
| Discoverability — category/tag archives, related posts | S1, S2, S3 | CP09-01…03 |
| Conversion — in-flow subscribe, author credibility, welcome routing | S4, S5, S6 | CP09-04…08 |
| Participation — events surface, in-article CTA, signup | S7 | CP09-09…12 |
| Measurement — subscribe/participation funnels, scroll depth, dashboard | S8 | CP09-13, 14, 16 |
| Sharing — copy-link / native share | S9 | CP09-15 |

**MVP slice.** S1 (category archives) — the thinnest end-to-end proof: a published-only `/blog/category/{slug}/` reachable from nav, satisfying the roadmap Phase 4 category-UI exit.

**Out of scope.** Rendering/CWV (shipped in the performance work); on-site search (product non-goal); the standalone `/subscribe/` page (live — S4 reuses it); editorial content (Squad D seeds).

## 2. Architecture fit

| Concern | How this epic fits |
| ------- | ------------------ |
| Rendering | New archive and article-embedded surfaces use the existing SSG + ISR path (`solution.md` §5.1, §7.4). No `force-dynamic`. |
| Draft safety | All new queries pass `overrideAccess: false` / `_status` filters (`solution.md` §6.3); enforced by regression tests. |
| Revalidation | Archive/related freshness rides the existing `payload:posts` cache tag; publish hooks in `revalidate.ts` gain the new archive paths (`solution.md` §7.4). |
| Data model | Reuses `Post`, `Author`, `Category`, `Tag` relations (`solution.md` §6.1–6.2). Adds one new collection, `Events` (§4). |
| Subscribe | Reuses the public `/api/subscribe` handler and MailerLite integration (`solution.md` §7.8, §1.1); in-flow modules call it with added `source`/`interest`. |
| Forms/security | Event signup mirrors the contact-form pattern — Zod validation, honeypot, rate limit, sanitise (`solution.md` §5.3, §7.1). |
| Metadata/SEO | Archive and article surfaces reuse `lib/metadata` + `lib/schema` composers (`solution.md` §7.5). |
| Analytics | GA events flow through the existing GTM/dataLayer, strictly consent-gated via `ConsentGate` (`solution.md` §7.2, §7.4). |
| Accessibility | New UI meets the semantic-HTML/alt baseline (`solution.md` §7.6). |

## 3. Files and components

```text
# Discoverability (S1–S3)
app/(blog)/blog/category/[slug]/page.tsx     NEW     category archive, published-only, 404 on miss
app/(blog)/blog/tag/[tag]/page.tsx           NEW     tag archive (fast-follow, S2)
lib/payload/queries/categories.ts            EVOLVE  getCategorySlugs, getPostsByCategory
lib/payload/queries/tags.ts                  EVOLVE  getTagSlugs, getPostsByTag
lib/payload/queries/related-posts.ts         NEW     getRelatedPosts(post): same-cat, recency fallback
lib/payload/urls.ts                          EVOLVE  categoryUrl, tagUrl
lib/payload/revalidate.ts                    EVOLVE  add archive paths to publish revalidation
app/sitemap.ts                               EVOLVE  include archive URLs
components/blog/BlogTopicNav.tsx             NEW     category links in blog nav
components/blog/RelatedPosts.tsx             NEW     end-of-article related module

# Conversion (S4–S6)
app/api/subscribe/route.ts                   EVOLVE  accept + persist source, interest
lib/validation/subscribe.ts                  EVOLVE  schema adds source, interest
components/subscribe/InlineSubscribe.tsx     NEW     mid-article capture
components/subscribe/EndOfPostSubscribe.tsx  NEW     end-of-article capture w/ interest
components/blog/AuthorBlock.tsx              NEW     byline: photo, bio, links to bio + property
docs/work/blog/welcome-map.md                NEW     interest → MailerLite welcome mapping

# Participation (S7)
collections/Events.ts                        NEW     Payload events collection (§4)
app/(www)/get-involved/events/page.tsx       NEW     upcoming events listing
components/events/EventCard.tsx              NEW     event card + empty state
components/events/GetInvolvedCTA.tsx         NEW     in-article CTA to next event
app/api/events/signup/route.ts               NEW     signup handler (contact-form pattern)
components/events/EventSignup.tsx            NEW     signup form + confirmation
collections/EventRegistrations.ts            NEW     registrations against events

# Measurement (S8) + Sharing (S9)
lib/analytics/events.ts                      NEW     typed GA event helpers (consent-gated)
docs/work/blog/analytics-events.md           NEW     event schema (names, params, allowed values)
components/blog/ShareBar.tsx                 NEW     copy-link + navigator.share

# Reused unchanged
lib/payload/map-content.ts                   KEEP    list/detail mappers for archive + related cards
lib/payload/cache.ts                         KEEP    payload:posts tag covers archives (decision 2)
components/consent/ConsentGate               KEEP    gates all analytics (solution §7.4)
```

## 4. Data contracts

Query helpers (all published-only):

```typescript
export function getCategorySlugs(): Promise<string[]>;
export function getPostsByCategory(slug: string): Promise<PostListItem[]>;
export function getTagSlugs(): Promise<string[]>;
export function getPostsByTag(tag: string): Promise<PostListItem[]>;
export function getRelatedPosts(post: PostDetail, limit?: number): Promise<PostListItem[]>;
```

Subscribe payload (extends the existing schema):

```typescript
const SubscribeInput = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  interest: z.enum(['restoration','regenerative-farming','community','produce','learning']).optional(),
  source: z.string().max(200).optional(), // e.g. "blog:{slug}"
  website: z.string().max(0).optional(),  // honeypot (solution §7.1)
});
```

Events collection (new — participation, S7):

```typescript
// collections/Events.ts — draft/publish, publicReadPublished
type Event = {
  title: string;
  slug: string;
  startsAt: string;          // ISO datetime
  location: string;
  description: RichText;
  capacity?: number;         // omit = uncapped
  signupTarget?: string;     // external URL or internal form
  _status: 'draft' | 'published';
};
// EventSignup: { eventId, name, email, website(honeypot) }
// EventRegistrations collection: { event, name, email, status: 'registered' | 'waitlisted' }
```

Analytics events (GA, consent-gated) — full names/params in `docs/work/blog/analytics-events.md`:
`subscribe_start`, `subscribe_complete` (source, interest), `event_cta_click` (eventId, source), `event_signup_complete` (eventId), `article_scroll_depth` (depth).

## 5. Runtime view

```text
Category archive (S1)
  GET /blog/category/{slug}/  → SSG page (generateStaticParams over getCategorySlugs)
    → getPostsByCategory(slug) with overrideAccess:false
    → notFound() on unknown slug → 404
    → list via map-content; metadata/JSON-LD via lib/metadata, lib/schema

In-article subscribe (S4)
  Reader submits module → POST /api/subscribe {email, interest?, source:"blog:{slug}"}
    → Zod validate + honeypot (solution §7.1) → MailerLite upsert (idempotent)
    → 2xx → inline success; interest drives welcome automation (S6)

Event signup (S7)
  POST /api/events/signup {eventId, name, email} → Zod + honeypot + rate limit (solution §5.3, §7.1)
    → capacity check → register or waitlist → confirmation
```

## 6. Error paths

| Failure | Behaviour |
| ------- | --------- |
| Unknown category/tag slug | `notFound()` → branded 404 |
| Empty category/tag | Explicit empty state; never a draft leak (`solution.md` §6.3) |
| Too few related posts | Recency fallback; module still renders |
| Invalid subscribe email | Inline validation error; no ESP call |
| MailerLite unavailable | Retryable error surfaced/queued; submission not lost silently |
| Event at capacity | Waitlist / subscribe state instead of the form |
| Consent not granted | Analytics events suppressed (no dataLayer push) |

## 7. Testing strategy

- **Unit:** published-only archive/related queries (draft excluded); subscribe schema incl. honeypot; related-posts selection + fallback; analytics helpers no-op without consent.
- **Collection config:** `Events` registered with draft/publish + `publicReadPublished`.
- **Component:** author block renders links; subscribe modules validate + call endpoint; ShareBar copies canonical URL.
- **Build:** post-build static-route assertion covers new archive routes; `pnpm build` succeeds against the DB.
- **Manual/prod:** MailerLite welcome per interest; GA DebugView shows funnel events with consent.

## 8. Acceptance gates

Subset of `solution.md` §2.1 this epic must satisfy: published-only visibility holds on every new surface; new routes are static/ISR (no `force-dynamic`); analytics respect the consent cookie; forms validate and rate-limit; WCAG 2.2 AA on new UI; `pnpm lint/typecheck/test/build` green. Story-level Gherkin lives in `tasks.md`.

## 9. Decisions

1. **Taxonomy = existing `categories`/`tags`, not a new "pillar" scheme.** Categories are the primary post taxonomy and what the removed decorative filter implied; archives satisfy discoverability and the roadmap Phase 4 exit without new schema.
2. **Revalidation — reuse the coarse `payload:posts` tag.** Single editor, small catalogue; per-archive tags add moving parts for no gain. Add archive paths to the existing `revalidate.ts` hooks.
3. **Archive pagination — single-page now.** No category will exceed one page soon; escape hatch is `/blog/category/[slug]/page/[page]/` reusing the shipped pagination pattern.
4. **Subscribe — reuse `/api/subscribe` + MailerLite; extend, don't rebuild.** In-flow modules add `source`/`interest`; the standalone `/subscribe/` page stays as-is.
5. **Author block — reuse the Payload `authors` relation.** No new fields; resolve the author image through the existing pipeline.
6. **Participation events — a new Payload `Events` collection is the source of truth.** Admin-managed, draft/publish, public read of published only; signup mirrors the contact-form security pattern. Marked Later (P3); may graduate to its own epic if scope grows.
7. **Measurement — GA via existing GTM, strictly consent-gated.** No new analytics platform; events suppressed without consent (`solution.md` §7.4).
8. **Tag archives — fast-follow after categories** behind one generic archive query.

## 10. What was NOT delivered / Handoff

**Not delivered:** on-site search (non-goal); related-post ML/personalisation (recency + category only); paid ticketing or volunteer rostering beyond a signup; per-category RSS (feed stays whole-blog at `/feed.xml`); A/B testing.

**Stable on close:** category/tag archive surfaces + nav; related-posts module; in-flow subscribe with source/interest and interest-routed welcomes; author block; events collection + listing + signup; consent-gated funnel analytics; share control. Foundation (rendering, pagination, RSS, revalidation, draft-safety) unchanged.

## 11. Open questions

1. **Subscribe payload.** Does `/api/subscribe` already accept `source`/`interest`, or is CP09-04 a genuine extension? Default: extend. Owner: implementer; non-blocking.
2. **Events data source.** Confirm a Payload `Events` collection (decision 6) versus an external calendar feed. Default: Payload collection. Owner: product; blocks S7 only.
3. **Funnel dashboard.** GA4 exploration (no build) versus an in-app admin view (CP09-16). Default: GA4 exploration first; build the admin view only if the exploration proves insufficient. Owner: JD; non-blocking.
