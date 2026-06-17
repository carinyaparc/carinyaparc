---
type: Backlog
level: epic
version: '0.2'
owner: product
status: Draft
last_updated: 2026-06-17
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

**Delivery approach.** Seven epics sequenced for marketing value first, with CI landed early so schema and route changes merge safely. Revalidation unlocks the core editor experience immediately after CI. Media library and SEO foundations follow, then editor tooling (rich text, reading time, structured recipe data), site globals, and Stay pages. Production verification and shared rate limiting are Phase 2 — not in this backlog.

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
| CP02    | Content revalidation | 1     | P0       | CP01       | 13     | `docs/work/content-revalidation/` | Not started |
| CP03    | Media library        | 1     | P0       | CP01       | 21     | `docs/work/media-library/`        | Not started |
| CP04    | SEO metadata         | 1     | P0       | CP03       | 8      | `docs/work/seo-metadata/`         | Not started |
| CP05    | Editor tooling       | 1     | P0       | CP03       | 13     | `docs/work/editor-tooling/`       | Not started |
| CP06    | Site globals         | 1     | P0       | CP02, CP03 | 13     | `docs/work/site-globals/`         | Not started |
| CP07    | Stay information     | 1     | P0       | CP03       | 13     | `docs/work/stay-information/`     | Not started |

**Phase 1 total:** 89 points across 7 epics.

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

**Status.** Not started.

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
└──────────┘     └──────────────┘
```

**Critical path:** CP01 → CP03 → CP06 (media + globals on home) and CP01 → CP02 → CP06 (live globals). CP02 can start in parallel with CP03 after CP01. CP04 and CP05 parallel after CP03. CP07 can start once CP03 lands.

---

## 6. Parallelisation

| Track | Epics       | Notes                                                      |
| ----- | ----------- | ---------------------------------------------------------- |
| A     | CP01        | Finish quality and build jobs first; unblocks all CMS work |
| B     | CP02 + CP03 | After CP01; independent of each other until CP06           |
| C     | CP04 + CP05 | After CP03; independent of each other                      |
| D     | CP06        | After CP02 and CP03                                        |
| E     | CP07        | After CP03; content copy can be drafted in parallel        |

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

| ID  | Risk                                           | Likelihood | Impact | Mitigation                                                                          |
| --- | ---------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------- |
| R1  | CI secret provisioning delayed                 | Medium     | High   | Document minimal secret set; use Neon branch for CI builds                          |
| R2  | Media migration breaks existing image URLs     | Medium     | High   | Backfill script with fallback; verify all published posts/recipes in staging        |
| R3  | Revalidation scope creep (tags, ISR intervals) | Medium     | Medium | Ship path-based revalidation first; document in CP02 sign-off                       |
| R4  | Rich-text allow-list disagreements             | Low        | Medium | Agree toolbar list before CP05 implementation; document in structure.md             |
| R5  | Stay copy not ready from owners                | Medium     | Medium | Ship page structure with placeholder sections; block exit until copy verified       |
| R6  | Globals schema churn delays home page          | Low        | Medium | Start with minimal fields (hero, tagline, footer); expand in Phase 2 if needed      |
| R7  | Phase 1 scope expands into Phase 2 items       | Medium     | Medium | Hold to roadmap exit criteria; defer rate limiting and prod verification to Phase 2 |

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

**What comes next:** Phase 2 — Production hardening and cleanup ([`roadmap.md` Phase 2](roadmap.md)): production admin verification under CSP, shared form rate limiting, post-migration repository cleanup. Scope Phase 2 epics when Phase 1 exit criteria are met.

**Next steps for delivery:**

1. `design write ci-pipeline` (or epic ID `CP01`) — then `tasks write ci-pipeline`
2. Repeat for CP02–CP07 in dependency order, or parallelise CP02 and CP03 after CP01 design is approved.
