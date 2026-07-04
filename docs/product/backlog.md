---
type: Backlog
level: epic
version: '0.2'
owner: product
status: Draft
last_updated: 2026-07-04
related:
  - docs/product/product.md
  - docs/product/roadmap.md
  - docs/architecture/solution.md
---

# Backlog — Carinya Parc website

- **Product:** [`docs/product/product.md`](product.md)
- **Solution:** [`docs/architecture/solution.md`](../architecture/solution.md)
- **Roadmap:** [`docs/product/roadmap.md`](roadmap.md)

## 1. Summary

**Objective.** Deliver Phase 1 — Marketing and content management: enable daily editorial work (publish stories and recipes, maintain key site copy, present honest Stay information) with CMS changes visible on the public site without redeploy.

**Delivery approach.** Seven Phase 1 epics sequenced for marketing value first, with CI landed early so schema and route changes merge safely. Revalidation unlocks the core editor experience immediately after CI. Media library and SEO foundations follow, then editor tooling (rich text, reading time, structured recipe data), site globals, and Stay pages. **CP08 (performance)** is the first Phase 2 epic: restore static/ISR rendering, cross-request Payload caching, and Core Web Vitals targets — image compression (CP08-01) may start once CP02 hooks are stable; remaining Phase 2 scope (production admin verification, shared rate limiting) to be epiced when Phase 1 exits.

**Prerequisites (complete).**

- Next.js 16 + Payload CMS 3 embedded app deployed on Vercel.
- Blog posts and recipes served from Neon Postgres; legal pages in MDX.
- Local quality commands (`lint`, `typecheck`, `test`, `build`) pass.
- Security middleware (CSP, HSTS, validation) in place.
- Draft/publish versioning on posts and recipes; `publicReadPublished` access pattern.

**Prerequisites (required).**

- GitHub repository with merge-to-`main` deploys to Vercel.
- Production Neon database with migrated blog and recipe content.
- Vercel project secrets for `NEON_DATABASE_URL`, `PAYLOAD_SECRET`, and build-time env vars (see `turbo.json`).
- Operator access to production `/admin` for verification during epic sign-off.
- Owner-provided Stay copy and photography aligned with on-ground reality.

**Out of scope.** See [`product.md`](product.md) non-goals and [`roadmap.md`](roadmap.md) Phase 1 deferred items: full page CMS for about, contact, and regenerate routes; scheduled publishing; multi-user roles beyond basic admin/editor; legal MDX migration; site search; shared rate limiting; production admin CSP verification checklist; post-migration repo cleanup; repo flattening; RSS; dynamic social images.

---

## 2. Conventions

| Convention     | Value                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Epic ID        | `CP{nn}` (e.g. `CP01`)                                                    |
| Epic work path | `docs/work/{epic}/` — kebab-case from title or short title, max two words |
| Task ID        | `CP{nn}-{nn}` in `docs/work/{epic}/tasks.md`                              |
| Status         | Not started · In progress · In review · Done · Blocked                    |
| Priority       | P0 must-have · P1 should-have · P2 defer                                  |
| Estimation     | Fibonacci story points (1, 2, 3, 5, 8, 13, 21)                            |

---

## 3. Epic breakdown

| Epic ID | Title                | Phase | Priority | Deps       | Points | Work path                         | Status      |
| ------- | -------------------- | ----- | -------- | ---------- | ------ | --------------------------------- | ----------- |
| CP01    | CI pipeline          | 1     | P0       | —          | 8      | `docs/work/ci-pipeline/`          | In progress |
| CP02    | Content revalidation | 1     | P0       | CP01       | 13     | `docs/work/content-revalidation/` | In progress |
| CP03    | Media library        | 1     | P0       | CP01       | 21     | `docs/work/media-library/`        | Not started |
| CP04    | SEO metadata         | 1     | P0       | CP03       | 8      | `docs/work/seo-metadata/`         | Not started |
| CP05    | Editor tooling       | 1     | P0       | CP03       | 13     | `docs/work/editor-tooling/`       | Not started |
| CP06    | Site globals         | 1     | P0       | CP02, CP03 | 13     | `docs/work/site-globals/`         | Not started |
| CP07    | Stay information     | 1     | P0       | CP03       | 13     | `docs/work/stay-information/`     | Not started |
| CP08    | Performance          | 2     | P0       | CP02       | 30     | `docs/work/performance/`          | In progress |
| CP09    | Blog section         | 2     | P1       | CP02       | 13     | `docs/work/blog-section/`         | Not started |
| CP10    | Recipes section      | 2     | P1       | CP02       | 13     | `docs/work/recipes-section/`      | Not started |

**Phase 1 total:** 89 points across 7 epics. **Phase 2 (started):** 30 points — CP08; **Squad B/C:** 26 points — CP09, CP10.

---

## 4. Epic detail (Now phase)

### CP01 — CI pipeline

**Scope.** GitHub Actions workflow on every pull request and merge to `main`: Prettier check, ESLint, TypeScript, Vitest, and production build with database and CMS secrets so `generateStaticParams` succeeds. Toolchain scaffold exists; quality and build jobs remain.

**Key deliverables.**

- Complete `.github/workflows/ci.yml` invoking root `pnpm` scripts.
- CI secrets documented for operators (GitHub Actions secrets mirroring Vercel build env).
- Required status check on pull requests before merge.

**Dependencies.** None.

**Downstream consumers.** All Phase 1 epics (safe iteration on CMS schema and routes).

**Status.** In progress (toolchain job landed).

**Work path:** `docs/work/ci-pipeline/`

---

### CP02 — Content revalidation

**Scope.** Wire Payload collection hooks so publishing or updating posts and recipes invalidates cached static pages. Public blog and recipe listing and detail routes — and home featured sections — reflect CMS edits without redeploy, within five minutes. Verify draft content never appears on public routes after any access changes.

**Key deliverables.**

- Revalidation helper in `lib/payload/` called from Payload `afterChange` / `afterDelete` hooks on posts and recipes.
- Path-based (or tag-based) invalidation for `/blog`, `/blog/[slug]`, `/recipes`, `/recipes/[slug]`, and `/` when featured content changes.
- Documented revalidation strategy in `solution.md` (resolves open question in §10.3).
- Verification record: production admin edit → public URL updated within five minutes.

**Dependencies.** CP01 (CI guards hook changes).

**Downstream consumers.** CP06 (globals must revalidate public layout); daily editorial workflow.

**Status.** In progress (CP02-01–06 done; CP02-07 revalidation verified — unpublish→404 code fix landed via `overrideAccess: false`; production 3.2 re-verify pending).

**Work path:** `docs/work/content-revalidation/`

---

### CP03 — Media library

**Scope.** Payload Media collection with upload relationships, configured image sizes, and required alt text on posts, recipes, and authors. Replace interim text-path `imageUrl` fields. Images uploaded in admin render on public pages with alt text.

**Key deliverables.**

- `Media` collection with alt text enforcement and size variants.
- Upload relationship fields on posts, recipes, and authors (hero and inline where applicable).
- Migration or backfill path for existing `public/` image references.
- Public routes render optimised images via Next.js image pipeline.

**Dependencies.** CP01 (schema changes merge safely).

**Downstream consumers.** CP04 (social image overrides), CP05 (rich-text embeds), CP06 (homepage hero image), CP07 (Stay photography).

**Status.** Not started.

**Work path:** `docs/work/media-library/`

---

### CP04 — SEO metadata

**Scope.** Per-document SEO controls on posts and recipes: meta title, description, and social overrides with sensible defaults from existing fields (title, excerpt). Satisfies roadmap exit criterion for editor-adjustable SEO without code changes.

**Key deliverables.**

- SEO fields or plugin integration on posts and recipes collections.
- Public routes consume SEO data in `lib/metadata/` helpers.
- Defaults documented when overrides are empty.

**Dependencies.** CP03 (social images reference Media uploads where applicable).

**Downstream consumers.** Discoverability groundwork for Phase 4 syndication and OG work.

**Status.** Not started.

**Work path:** `docs/work/seo-metadata/`

---

### CP05 — Editor tooling

**Scope.** Scoped rich-text editing (essential formatting allow-list — not a full embed toolbar), computed reading time on post cards, structured recipe ingredients, and richer recipe JSON-LD including ingredient list. Allow-list documented in `structure.md`.

**Key deliverables.**

- Rich-text field configuration with agreed toolbar allow-list on posts (and recipes where body uses rich text).
- Reading time computed at render or map time for post cards and detail metadata.
- Structured ingredient fields on recipes (if not already sufficient) wired to `lib/schema/` recipe JSON-LD.
- Engineering docs updated with toolbar allow-list.

**Dependencies.** CP03 (inline images in rich text use Media relations).

**Downstream consumers.** Phase 4 structured data and discoverability work.

**Status.** Not started.

**Work path:** `docs/work/editor-tooling/`

---

### CP06 — Site globals

**Scope.** Payload Globals for homepage hero, site tagline, navigation labels, and footer copy — wired to the public site layout and home page. Editors adjust routine marketing copy without code changes or redeploy.

**Key deliverables.**

- Globals schema (single or grouped) for hero headline, subcopy, hero image, tagline, nav labels, and footer blurb.
- Public `(www)` layout and home page read from globals via server-side Payload fetch.
- Revalidation hooks so globals edits appear on public routes within five minutes.

**Dependencies.** CP02 (live updates without redeploy), CP03 (hero image via Media).

**Downstream consumers.** Reduces need for full marketing page CMS in later phases.

**Status.** Not started.

**Work path:** `docs/work/site-globals/`

---

### CP07 — Stay information

**Scope.** New Stay section answering "Is this for me?" and "How do I enquire?" — accommodation, seasonality, what to expect, honest "what it's not", and a clear enquiry path. Copy verified against on-ground reality per product tone principles.

**Key deliverables.**

- Stay route(s) under `(www)` with honest, place-first content structure.
- Enquiry path linking to contact flow (form or mailto as per existing patterns).
- Media-backed photography where appropriate.
- Metadata and JSON-LD appropriate for accommodation information (not a booking engine).

**Dependencies.** CP03 (Stay imagery via Media library).

**Downstream consumers.** Guest pipeline and pre-qualification outcomes from [`product.md`](product.md).

**Status.** Not started.

**Work path:** `docs/work/stay-information/`

---

## 4b. Epic detail (Phase 2)

### CP08 — Performance

**Scope.** Improve Core Web Vitals on the public site: remove request-time dynamic APIs from the public root layout; eliminate erroneous `force-dynamic` exports; add cross-request Payload caching with tag invalidation aligned to CP02 hooks; compress and right-size `public/images/` sources; reduce above-the-fold client JS (Framer Motion, React Query scope); verify mobile p75 LCP, INP, CLS, and TTFB in production via Speed Insights — without weakening consent, CSP, or draft/publish safety.

**Key deliverables.**

- Compressed photography under `public/images/` (hero ≤ 300 KB; route-referenced assets ≤ 500 KB).
- Static public root layout with consent bootstrap via `/api/consent` and `ConsentGate` (httpOnly `cp_consent` unchanged).
- `lib/payload/cache.ts` with `unstable_cache` wrappers and `PAYLOAD_CACHE_TAGS`; `revalidateTag` in existing CP02 revalidation hooks.
- ISR `revalidate` exports on `/`, `/blog/`, `/blog/[slug]/`, `/recipes/`, and `/recipes/[slug]/`.
- Server-rendered hero and page-header shells; deferred Framer Motion; narrowed React Query scope.
- Caching strategy documented in `solution.md` §7.4; resolved `force-dynamic` debt removed from §10.2.
- Production CWV verification record (Speed Insights before/after).

**Dependencies.** CP02 (revalidation hooks stable before cache tag invalidation — CP08-05). CP08-01 (image compression) has no epic dependencies and can land once CP02 is verified.

**Downstream consumers.** CP03 (Media upload variants extend cache tags and LCP paths); CP06 (globals paths added to invalidation lists).

**Explicit out of scope.** Payload Media collection (CP03); site globals CMS hero (CP06); PPR / `use cache` migration; admin `/admin` performance; GTM container edits.

**Status.** In progress (CP08-01–09 merged to `main`; CP08-10 post-deploy Speed Insights verification pending).

**Work path:** `docs/work/performance/`

---

### CP09 — Blog section (Squad B)

**Scope.** Blog parity and discoverability beyond core CP02 revalidation: category and tag archive routes, pagination UX, RSS feed hygiene, and navigation integration. Editorial content remains Squad D (Payload seeds).

**Key deliverables.**

- `/blog/category/[slug]/` (and optional `/blog/tag/[tag]/`) listing published posts only
- Pagination on blog index aligned with Payload query patterns
- RSS feed valid, linked from `robots.ts`, and covered by smoke tests
- Tasks tracked in `docs/work/blog-section/tasks.md`; issues labelled `squad:blog`

**Dependencies.** CP02 (published-only public queries verified).

**Downstream consumers.** Squad E SEO recommendations; Phase 4 syndication.

**Status.** Not started (seeded Sprint 3 for Squad B cloud-agent delivery chain).

**Work path:** `docs/work/blog-section/`

---

### CP10 — Recipes section (Squad C)

**Scope.** Recipe index UX, filtering, structured data (JSON-LD), site navigation to `/recipes`, and error boundaries. Editorial recipes remain Squad D (Payload seeds).

**Key deliverables.**

- Recipes index with filtering; navigation `href: '/recipes'` visible in header
- Recipe detail JSON-LD includes ingredients and images when populated
- `(recipes)/error.tsx` matching blog/www error boundary pattern
- Tasks in `docs/work/recipes-section/tasks.md`; issues labelled `squad:recipes`

**Dependencies.** CP02 (revalidation stable); overlaps with `site-hardening` SH-18–SH-21 (dedupe during sprint planning).

**Downstream consumers.** Squad E structured-data audit; content calendar recipe slots.

**Status.** Not started (seeded Sprint 3 for Squad C cloud-agent delivery chain).

**Work path:** `docs/work/recipes-section/`

---

## 5. Dependency graph

```text
                         ┌──────────────┐
                         │    CP07      │  Stay (after media)
                         │ stay-info    │
                         └──────┬───────┘
                                │
┌──────────┐     ┌──────────────┴──────────────┐
│  CP01   │────>│           CP03              │
│ CI pipe  │     │       media library         │
└────┬─────┘     └───┬──────────┬──────────────┘
     │               │          │
     │         ┌─────┴───┐  ┌───┴────┐  ┌──────────┐
     │         │  CP04   │  │  CP05  │  │   CP07   │
     │         │   SEO   │  │ editor │  │  (also)  │
     │         └─────────┘  └────────┘  └──────────┘
     │
     v
┌──────────┐     ┌──────────────┐
│  CP02   │────>│    CP06      │
│revalidate│     │site globals  │
└────┬─────┘     └──────────────┘
     │
     v
┌──────────┐
│  CP08   │  Performance (Phase 2; CP08-01 images parallel after CP02)
│   perf   │
└──────────┘
```

**Critical path:** CP01 → CP03 → CP06 (media + globals on home) and CP01 → CP02 → CP06 (live globals). CP02 can start in parallel with CP03 after CP01. CP04 and CP05 parallel after CP03. CP07 can start once CP03 lands. CP08 cache and static unlock (CP08-03–06) follow CP02; CP08-01 (images) can start in parallel once CP02 hooks are verified.

---

## 6. Parallelisation

| Track | Epics       | Notes                                                      |
| ----- | ----------- | ---------------------------------------------------------- |
| A     | CP01        | Finish quality and build jobs first; unblocks all CMS work |
| B     | CP02 + CP03 | After CP01; independent of each other until CP06           |
| C     | CP04 + CP05 | After CP03; independent of each other                      |
| D     | CP06        | After CP02 and CP03                                        |
| E     | CP07        | After CP03; content copy can be drafted in parallel        |
| F     | CP08        | After CP02 verification; CP08-01 (images) can start early  |

---

## 7. Minimum viable slice

The smallest increment that materially improves the editor and visitor experience:

1. **CP01** — Complete lint, typecheck, test, and build jobs (safe merges).
2. **CP02** — Revalidation hooks on posts and recipes (core editor experience).
3. **CP03** — Media collection with hero images on one collection (prove upload path).

Defer CP06, CP07, and full SEO until the slice above is verified in production. Phase 1 exit requires all roadmap exit criteria — use this slice for early validation only.

---

## 8. Definition of Done (Phase 1)

- [ ] All P0 epics marked Done.
- [ ] [`roadmap.md` Phase 1 exit criteria](roadmap.md) satisfied.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass locally and in CI.
- [ ] Relevant updates to `solution.md` (revalidation, media, globals) and `structure.md` (toolbar allow-list, Stay routes) where behaviour changed.
- [ ] No new technical debt without entry in `solution.md` §10.2.

---

## 9. Risks

| ID  | Risk                                           | Likelihood | Impact | Mitigation                                                                             |
| --- | ---------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------- |
| R1  | CI secret provisioning delayed                 | Medium     | High   | Document minimal secret set; use Neon branch for CI builds                             |
| R2  | Media migration breaks existing image URLs     | Medium     | High   | Backfill script with fallback; verify all published posts/recipes in staging           |
| R3  | Revalidation scope creep (tags, ISR intervals) | Medium     | Medium | Ship path-based revalidation first; document in CP02 sign-off                          |
| R4  | Rich-text allow-list disagreements             | Low        | Medium | Agree toolbar list before CP05 implementation; document in structure.md                |
| R5  | Stay copy not ready from owners                | Medium     | Medium | Ship page structure with placeholder sections; block exit until copy verified          |
| R6  | Globals schema churn delays home page          | Low        | Medium | Start with minimal fields (hero, tagline, footer); expand in Phase 2 if needed         |
| R7  | Phase 1 scope expands into Phase 2 items       | Medium     | Medium | Hold to roadmap exit criteria; defer rate limiting and prod verification to Phase 2    |
| R8  | CWV targets not met after CP08 Slices A–D      | Medium     | Medium | Document residual gap in CP08-10; evaluate PPR follow-up; do not weaken CSP or consent |

Technical risks (stale content, CSP, draft leakage, build failures) are tracked in [`solution.md` §10.1](../architecture/solution.md) — not duplicated here.

---

## 10. Handoff

**Phase 1 leaves:**

- CI quality gate on every PR and merge to `main`.
- Blog and recipe edits visible on the public site without redeploy.
- Media library with required alt text on posts, recipes, and authors.
- SEO controls on posts and recipes; editable homepage hero, tagline, and footer via globals.
- Rich-text allow-list, reading time on posts, structured recipe ingredients in JSON-LD.
- Stay information pages live with verified copy.

**What comes next:** Phase 2 — Production hardening and cleanup ([`roadmap.md` Phase 2](roadmap.md)): **CP08 (performance)** first; then production admin verification under CSP, shared form rate limiting, and post-migration repository cleanup. Scope remaining Phase 2 epics when Phase 1 exit criteria are met.

**Next steps for delivery:**

1. `design write ci-pipeline` (or epic ID `CP01`) — then `tasks write ci-pipeline`
2. Repeat for CP02–CP07 in dependency order, or parallelise CP02 and CP03 after CP01 design is approved.
3. CP08 — design and tasks at `docs/work/performance/`; start **CP08-01** (image compression) once CP02 hooks are verified; land static unlock and cache layers (CP08-03–06) before Phase 1 exit or early Phase 2 deploy.
