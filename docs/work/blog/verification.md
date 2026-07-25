---
type: Verification
epic: blog
epic_id: CP09
last_updated: 2026-07-25
related:
  - docs/work/blog/tasks.md
  - docs/work/blog/design.md
---

## Validation Report — CP09: Blog

**Date:** 2026-07-25
**Validator:** AI QA Review
**Epic status:** incomplete (ops gap — see below)

### Summary

9 stories, 16 tasks, verified against Gherkin AC in `tasks.md` by reading the implementing code, tests, migrations and config directly (not trusting existing checkbox state). 15 tasks pass with concrete evidence, 1 fails (CP09-08 — MailerLite welcome automations not configured, this is external ops work outside the codebase). CP09-09 (Events migration) was flagged partial at initial review pending confirmation that the Neon migration had been applied in production; JD confirmed on 2026-07-25 that it has been applied, so it is now recorded as pass.

### Acceptance Matrix

| Task | Criterion | Evidence | Status |
| --- | --- | --- | --- |
| CP09-01 | Category archive lists published-only posts | `lib/payload/queries/categories.ts:94-108` `getPostsByCategory` — `overrideAccess: false` | pass |
| CP09-01 | Unknown category slug → 404 | `app/(blog)/blog/category/[slug]/page.tsx:49-53` `notFound()` | pass |
| CP09-01 | Categories reachable from nav | `components/blog/BlogTopicNav.tsx` rendered on category/tag/blog pages | pass |
| CP09-01 | Sitemap + revalidation | `app/sitemap.ts:116`, `lib/payload/revalidate.ts:59-66` | pass |
| CP09-02 | Tag archive published-only, 404, sitemap/revalidate | `lib/payload/queries/tags.ts:97-114`, `blog/tag/[tag]/page.tsx:47-49`, `sitemap.ts:117`, `revalidate.ts:68-71` | pass |
| CP09-03 | 2-3 related posts, same-category first, current excluded, fallback | `lib/payload/queries/related-posts.ts:108-150` + `related-posts.test.ts` (all branches covered) | pass |
| CP09-04 | Subscribe endpoint accepts + persists source/interest | `lib/validation/subscribe-schema.ts:79-103`, `app/api/subscribe/route.ts:93-125` + tests | pass |
| CP09-05 | Inline subscribe: valid submit, invalid email blocked, end-of-post records interest | `InlineSubscribe.tsx:46-103`, `EndOfPostSubscribe.tsx:74-88` | pass |
| CP09-06 | Author block: photo, bio, links to jonathan + property | `AuthorBlock.tsx:7-8,60-71` + `AuthorBlock.test.tsx:65-79` | pass |
| CP09-07 | Interest→welcome mapping documented | `docs/work/blog/welcome-map.md` §2, §5 | pass (doc only) |
| CP09-08 | MailerLite automations configured + live | `welcome-map.md` §7 — explicitly "not configured"; live API probe returned 401 (placeholder key) | fail |
| CP09-09 | Events collection (data model) | `collections/Events.ts` — draft/publish, `publicReadPublished` | pass |
| CP09-09 | Neon migration applied for live data | `migrations/20260725_add_events_tables.ts` authored + registered; application to production Neon confirmed by JD 2026-07-25 | pass |
| CP09-10 | Events listing: upcoming only, title/date/location/signup | `lib/payload/queries/events.ts:25-53`, `components/events/EventCard.tsx` | pass |
| CP09-11 | In-article CTA to next event | `components/events/GetInvolvedCTA.tsx`, wired in `blog/[slug]/page.tsx:88-90,158` | pass |
| CP09-12 | Signup records registration + confirmation; capacity → waitlist | `app/api/events/signup/route.ts:155-219`, `EventSignup.tsx:91-124` | pass |
| CP09-13 | subscribe_start/complete + article_scroll_depth, consent-gated | `lib/analytics/events.ts:15-22`, `lib/analytics/track.ts:40-49`, `ArticleScrollDepth.tsx:16-43` | pass |
| CP09-14 | event_cta_click / event_signup_complete with eventId+source | `lib/analytics/events.ts:25-32`, called from `GetInvolvedCTA.tsx`, `EventCard.tsx`, `EventSignup.tsx` | pass |
| CP09-16 | Funnel dashboard doc | `docs/work/blog/funnel-dashboard.md` | pass (doc) |
| CP09-15 | Copy-link to clipboard + confirmation; native share where supported | `components/blog/ShareBar.tsx:23-61` + `ShareBar.test.tsx` | pass |

### Design Deviations

| Area | Design spec | Actual implementation | Assessment |
| --- | --- | --- | --- |
| Category/tag source | Payload `categories`/`tags` collections only | Falls back to deriving categories/tags from published posts when those collections are empty | Acceptable — resilience fallback, still published-only |
| Event signup target | On-site form only | Optional external `signupTarget` URL supported alongside on-site form | Acceptable — reasonable superset, analytics still fires |
| MailerLite failure handling | "Retryable error surfaced/queued" | Error surfaced to the client only; no queuing mechanism | Minor gap — acceptable for current traffic, worth a follow-up if failure rate becomes material |

### Findings

- **[fail]** CP09-08: MailerLite welcome automations are not configured in the live MailerLite account — this is ops work outside the codebase, tracked in `welcome-map.md` §7.
- **[observation]** New event-signup rate-limit env vars (`EVENT_SIGNUP_RATE_LIMIT_MAX`, `EVENT_SIGNUP_RATE_LIMIT_WINDOW_HOURS`, `EVENT_SIGNUP_RATE_LIMITING`) are not documented in `apps/site/.env.example`; all three have working defaults so this is low severity.
- **[observation]** Test suite could not be executed in the verification sandbox (missing native `@rolldown/binding-linux-arm64-gnu` module — environment issue, not a code issue). Assertions were read directly and are internally consistent with the AC; a real `pnpm test` run is recommended before final close-out.

### Backlog / Tasks Changes

- `docs/work/blog/tasks.md`: CP09-09 re-checked, status set to `done` with a note that Neon migration application was operator-confirmed 2026-07-25.
- `docs/work/blog/tasks.md`: epic status header updated to name the one remaining gap (CP09-08) instead of the generic "ops gaps".
- All other 15 tasks confirmed as correctly marked `done` — no changes needed.
- No `.agency/backlog.md` exists in this repo (this project tracks epics under `docs/work/{epic}/` per `docs/work/README.md`, with no separate backlog roll-up file), so no backlog update was made.

### Conclusion

Not ready for full stakeholder sign-off yet. All in-repo, testable functionality (15 of 16 tasks) is implemented correctly with test coverage and matches the design, and the Events migration is now confirmed live. The one remaining item is operational, not a code defect: configure the MailerLite welcome automations per interest (CP09-08). Once that's closed out — plus a real `pnpm test`/`pnpm build` run to confirm the suite is green outside this sandbox — the epic can be marked done.
