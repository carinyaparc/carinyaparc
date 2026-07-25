---
type: Tasks
epic: blog
epic_id: CP09
owner: blog
status: Validated — ops gaps
last_updated: 2026-07-25
related:
  - docs/work/blog/design.md
  - docs/product/roadmap.md
  - docs/architecture/solution.md
  - docs/work/site/tasks.md
---

# Tasks — Blog (CP09)

Squad B delivery epic — the full blog surface: discoverability, reader engagement, subscriber conversion, participation, and measurement. Canonical AC lives here; GitHub issues carry `squad:blog` + task-id link only. Design: [`./design.md`](design.md).

## 1. Summary

- **Epic.** CP09 — Blog (discoverability → conversion → participation → measurement)
- **Depends on (all shipped).** Server rendering + SSG, pagination (`blog/page/[page]`), RSS (`feed.xml`), on-demand revalidation (`lib/payload/cache.ts`, `revalidate.ts`), and draft-safety (`overrideAccess: false` + regression test). See `solution.md` §5.1, §7.4, §6.3.
- **Serves.** Product objectives — grow the newsletter and build a returning audience; groundwork for future offers (`product.md` §Business objectives).

**Scope (phased by priority).**

| Phase      | Stories        | Theme                                                                |
| ---------- | -------------- | -------------------------------------------------------------------- |
| Now (P1)   | S1, S3, S4, S5 | Category archives, related posts, in-article subscribe, author block |
| Next (P2)  | S2, S6, S8     | Tag archives, interest welcome routing, funnel measurement           |
| Later (P3) | S7             | Participation: events surface, CTA, signup                           |

**Out of scope.** Editorial content (Squad D Payload seeds); on-site search (product non-goal); rendering/CWV (shipped in the performance work); the standalone `/subscribe/` page (already live — these are in-flow modules that reuse it).

**MVP.** S1 (CP09-01) — category archives list published posts only, giving the removed decorative filter a working surface (roadmap Phase 4 exit).

**Open clarifications.**

- `[NEEDS CLARIFICATION]` Participation (S7): how planting days/workshops are managed — determines the events data source.
- `[NEEDS CLARIFICATION]` Does `/api/subscribe` already accept `source` + `interest`, or must it be extended (S4)? MailerLite is the ESP (`solution.md` §1.1).

## 2. Conventions

| Convention      | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| Task ID         | `CP09-{nn}` — sequential, never reused (contract with GitHub issues) |
| Story label     | `[S{n}]` on every task                                               |
| Parallel marker | `[P]` — different files, no incomplete dependency                    |
| Acceptance      | Gherkin on the story                                                 |
| Estimate        | Fibonacci story points                                               |
| Paths           | `apps/site/src/...` (`structure.md`)                                 |

## 3. Stories

### S1 — Category archives + navigation (P1) — MVP

**As a** reader, **I want** to browse posts by category, **so that** I can find related stories — and the category UI actually works.
**Independent test criterion.** `/blog/category/{slug}/` lists only published posts for that slug; categories are reachable from blog nav.

```gherkin
Scenario: Category archive shows published posts only
  Given a category with published and draft posts
  When /blog/category/{slug}/ is requested
  Then only published posts appear
  And draft posts never appear

Scenario: Unknown category
  Given a slug with no matching category
  When /blog/category/{slug}/ is requested
  Then the response is HTTP 404
```

- [x] **[CP09-01]** [S1] Category archive route + nav — `apps/site/src/app/(blog)/blog/category/[slug]/page.tsx`, `components/blog/BlogTopicNav.tsx` · Est 5 · Depends: — · status: done
  - Server-rendered, published-only; `getCategorySlugs`/`getPostsByCategory` in `lib/payload/queries/categories.ts`; category URLs in `sitemap.ts`; archive paths added to `revalidate.ts`.

### S2 — Tag archives (P2)

**As a** reader, **I want** to browse posts by tag, **so that** I can follow a cross-cutting theme.
**Independent test criterion.** `/blog/tag/{tag}/` lists only published posts for that tag.

```gherkin
Scenario: Tag archive shows published posts only
  Given posts tagged and published
  When /blog/tag/{tag}/ is requested
  Then only published posts with that tag appear
```

- [x] **[CP09-02]** [P] [S2] Tag archive route — `apps/site/src/app/(blog)/blog/tag/[tag]/page.tsx` · Est 3 · Depends: CP09-01 · status: done
  - Reuses the generic archive query behind `getPostsByTag`/`getTagSlugs`.

### S3 — Related posts at end of article (P1)

**As a** reader who just finished a post, **I want** related posts, **so that** I keep reading.
**Independent test criterion.** Every article shows 2–3 related posts (same category/tag, recency fallback), excluding the current post.

```gherkin
Scenario: Related posts shown
  Given an article with a category
  When the article page renders
  Then 2 to 3 related posts from the same category are shown
  And the current post is never listed

Scenario: Too few in-category posts
  Given a category with only the current post
  When the article renders
  Then the module falls back to the most recent other posts
```

- [x] **[CP09-03]** [S3] Related-posts selection + UI — `apps/site/src/lib/payload/queries/related-posts.ts`, `components/blog/RelatedPosts.tsx`, `app/(blog)/blog/[slug]/page.tsx` · Est 3 · Depends: — · status: done
  - Published-only selection reusing the list mapper; rendered at the end of the article.

### S4 — In-article subscribe capture (P1)

**As a** reader mid- or end-of-article, **I want** to subscribe in place, **so that** I act at peak intent.
**Independent test criterion.** Submitting the inline module creates a MailerLite subscriber tagged with the article as source; the end-of-post module also records the selected interest.

```gherkin
Scenario: Inline subscribe from within an article
  Given a reader on /blog/{slug}
  When they submit a valid email in the inline module
  Then a subscriber is created via /api/subscribe with the article as source
  And an inline success confirmation replaces the form

Scenario: Invalid email
  Given the inline module
  When an invalid email is submitted
  Then an inline validation error is shown and no request is sent

Scenario: End-of-post subscribe records interest
  Given the end-of-article module with the interest options from /subscribe/
  When a reader submits email and selects an interest
  Then the subscriber is created with that interest recorded
```

- [x] **[CP09-04]** [S4] Extend subscribe endpoint for source + interest — `apps/site/src/app/api/subscribe/route.ts`, `lib/validation/subscribe.ts`, MailerLite integration · Est 2 · Depends: — · status: done
- [x] **[CP09-05]** [P] [S4] Inline + end-of-post subscribe components — `components/subscribe/InlineSubscribe.tsx`, `components/subscribe/EndOfPostSubscribe.tsx`, `app/(blog)/blog/[slug]/page.tsx` · Est 3 · Depends: CP09-04 · status: done
  - Reuses the five interest options from `/subscribe/`; privacy/consent copy consistent with the standalone page.

### S5 — Author / credibility block (P1)

**As a** reader deciding whether to trust the advice, **I want** to see who wrote it, **so that** I trust it and subscribe.
**Independent test criterion.** Every article shows a byline with the author's photo, one-line bio, and links to `/about/jonathan/` and `/about/the-property/`.

```gherkin
Scenario: Author block on articles
  Given a published article with an author relation
  When it renders
  Then an author block shows name, photo and a one-line bio
  And it links to the full bio and the property page
```

- [x] **[CP09-06]** [S5] Author block component + placement — `components/blog/AuthorBlock.tsx`, `app/(blog)/blog/[slug]/page.tsx` · Est 2 · Depends: — · status: done
  - Uses the existing Payload `authors` relation and resolved author image.

### S6 — Interest-based welcome routing (P2)

**As a** new subscriber, **I want** a first email matched to my interest, **so that** my first experience is relevant (locals → participation).
**Independent test criterion.** A test signup for each interest triggers the matching MailerLite welcome.

```gherkin
Scenario: Interest routes the welcome
  Given a new subscriber who selected "Community involvement"
  When /api/subscribe records them
  Then MailerLite sends the community-oriented welcome
  And that welcome links to the get-involved page
```

- [x] **[CP09-07]** [S6] Map interests to welcome automations — `docs/work/blog/welcome-map.md` · Est 1 · Depends: CP09-04 · status: done
- [ ] **[CP09-08]** [P] [S6] Configure MailerLite automations — MailerLite (external), notes in `welcome-map.md` · Est 1 · Depends: CP09-07 · status: in-progress — ops pending (welcome-map.md §7; automations not live)

### S7 — Participation: events surface, CTA, signup (P3, Later)

**As a** local reader moved by a story, **I want** to see and sign up for planting days, **so that** inspiration becomes attendance.
**Independent test criterion.** `/get-involved/events` lists upcoming events; an in-article CTA links to the next one; a signup records a registration and confirms.

```gherkin
Scenario: Upcoming events listed
  Given upcoming events in the data source
  When a visitor opens /get-involved/events
  Then each shows title, date, location and a signup link
  And past events are not shown

Scenario: Event signup recorded
  Given an upcoming event with a signup form
  When a visitor submits name and email
  Then the registration is recorded against that event
  And a confirmation is shown and/or emailed

Scenario: Event at capacity
  Given an event marked full
  When its signup is opened
  Then a "full — join the waitlist / subscribe" state is shown instead of the form
```

- [x] **[CP09-09]** [S7] Events data source + model — `apps/site/src/collections/Events.ts` (or content source) · Est 3 · Depends: — · status: done (apply Neon migration for live data)
- [x] **[CP09-10]** [P] [S7] Events listing page + card — `app/(www)/get-involved/events/page.tsx`, `components/events/EventCard.tsx` · Est 2 · Depends: CP09-09 · status: done
- [x] **[CP09-11]** [P] [S7] In-article get-involved CTA — `components/events/GetInvolvedCTA.tsx`, `app/(blog)/blog/[slug]/page.tsx` · Est 2 · Depends: CP09-09 · status: done
- [x] **[CP09-12]** [S7] Event signup endpoint + confirmation — `app/api/events/signup/route.ts`, `components/events/EventSignup.tsx` · Est 3 · Depends: CP09-09 · status: done

### S8 — Measurement: funnel analytics (P2)

**As** JD, **I want** subscribe and participation funnels tracked, **so that** I can measure growth and participation by placement.
**Independent test criterion.** Subscribe and event interactions fire named GA events with source/interest/event params, visible in GA DebugView (consent-gated).

```gherkin
Scenario: Subscribe funnel events fire
  Given a reader using an in-article subscribe module with consent granted
  When they start and complete the form
  Then subscribe_start and subscribe_complete are recorded with source and interest

Scenario: Participation funnel events fire
  Given an article CTA and an event signup
  When a reader clicks the CTA and completes signup
  Then event_cta_click and event_signup_complete are recorded with the event id and source
```

```gherkin
Scenario: Article scroll depth recorded
  Given a reader with consent granted scrolls through an article
  When they reach 25/50/75/100% depth
  Then an article_scroll_depth event is recorded with the depth reached
```

- [x] **[CP09-13]** [S8] Event schema + subscribe-funnel + scroll-depth instrumentation — `docs/work/blog/analytics-events.md`, `apps/site/src/lib/analytics/*`, `components/subscribe/*`, `app/(blog)/blog/[slug]/page.tsx` · Est 2 · Depends: CP09-05 · status: done
- [x] **[CP09-14]** [P] [S8] Participation-funnel instrumentation — `components/events/*`, `lib/analytics/*` · Est 1 · Depends: CP09-11, CP09-12 · status: done
- [x] **[CP09-16]** [S8] Funnel dashboard (GA4 exploration or lightweight admin view) — `docs/work/blog/funnel-dashboard.md` (GA4 explorations + DebugView; no admin UI) · Est 1 · Depends: CP09-13, CP09-14 · status: done

### S9 — Share affordances (P2)

**As a** reader, **I want** to share or copy a post link, **so that** I can pass it on.
**Independent test criterion.** Each article exposes a working copy-link control and native share where supported.

```gherkin
Scenario: Copy link
  Given an article page
  When the reader activates "copy link"
  Then the canonical post URL is placed on the clipboard
  And a confirmation is shown
```

- [x] **[CP09-15]** [P] [S9] Share / copy-link control — `components/blog/ShareBar.tsx`, `app/(blog)/blog/[slug]/page.tsx` · Est 1 · Depends: — · status: done

## 4. Dependencies and Definition of Done

```text
Shipped foundation (rendering, pagination, RSS, revalidation, draft-safety)
  ├─ S1 CP09-01 ──> S2 CP09-02
  ├─ S3 CP09-03
  ├─ S4 CP09-04 ──> CP09-05 ──> S6 CP09-07 ──> CP09-08
  ├─ S5 CP09-06
  ├─ S7 CP09-09 ──> CP09-10, CP09-11, CP09-12
  └─ S8 CP09-13 (needs CP09-05), CP09-14 (needs CP09-11/12)
```

- **Parallel:** CP09-02, -05, -08, -10, -11, -14 are `[P]`. Now-phase stories S1/S3/S4/S5 are independent of each other.
- **DoD (per story):** Gherkin passes; draft content never appears on new routes (`solution.md` §6.3); new routes render static/ISR (no `force-dynamic`); analytics respect consent (`solution.md` §7.4); `pnpm lint/typecheck/test/build` green; issues labelled `squad:blog`.

## 5. Handoff

Delivers the full reader journey on the blog — find (archives, related), trust (author block), convert (in-flow subscribe + interest routing), participate (events), and measure (funnels) — on top of the already-shipped rendering and revalidation foundation. Participation (S7) may graduate to its own epic if the events data source proves substantial.
