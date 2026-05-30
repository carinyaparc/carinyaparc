---
type: Backlog
scope: domain
version: '0.1'
owner: engineering
status: Draft
last_updated: 2026-05-30
related:
  - docs/product.md
  - docs/migration.md
  - docs/structure.md
---

# Backlog — Payload CMS migration (Phase 1)

- **Product:** [`product.md`](product.md)
- **Migration plan:** [`migration.md`](migration.md)
- **Structure:** [`structure.md`](structure.md)
- **Solution:** `solution.md` (planned — technical risks will be authoritative in §10.1 when authored)
- **Roadmap:** `roadmap.md` (planned — Phase 2 deferrals will live in §Later when authored)

## 1. Summary

**Objective.** Replace the current three-layer content stack (MDX in git for production routes, Sanity built but unwired, and a planned Payload CMS) with a single CMS: **Payload embedded in `apps/site`**, serving blog posts and recipes. Legal pages remain MDX. Sanity is fully removed. The monorepo shape is unchanged in this phase.

**Delivery approach.** Remove Sanity first — it is not the production content source and should not coexist with Payload. Then Payload foundation (install, database, admin route), content models in parallel (blog and recipes), MDX migration, route rewiring, and documentation/CI gate. Each epic leaves the site deployable on MDX until Payload routes go live.

**Prerequisites (complete).**

- Next.js 16 App Router site in `apps/site` with working blog and recipe routes backed by MDX (`content/posts/`, `content/recipes/`).
- Sanity schemas, studio route, and tests exist but are not wired to production routes.
- Monorepo tooling (pnpm, Turbo, `@repo/ui`) is stable and CI is green on `main`.
- Eight blog posts and three recipes in MDX; two legal pages remain MDX-only by design.

**Prerequisites (required before core work ships).**

- Payload-compatible database provisioned for dev and staging (e.g. Postgres on Vercel or equivalent).
- Payload admin credentials and env vars documented in `.env.example` and Vercel project settings.
- Decision on rich-text approach for migrated MDX (Lexical/rich text vs. retained MDX blocks in Payload) recorded in `solution.md`.

**Out of scope.** The canonical list of product no-gos lives in [`product.md`](product.md) §5 (Non-goals & Out of Scope). Phase-gated deferrals for this migration live in [`migration.md`](migration.md) Phase 2 and will be tracked in `roadmap.md` §Later when authored. In summary for Phase 1:

- Repo flattening and `@repo/ui` inlining (Phase 2).
- Migrating legal pages to Payload (remain MDX unless explicitly rescoped).
- Booking engine, e-commerce, or multi-property CMS features.
- Stacking Payload on top of Sanity long term.

## 2. Conventions

| Convention | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Epic ID    | `PLD{nn}` (e.g. `PLD01`)                                   |
| Status     | Not started, In progress, In review, Done, Blocked         |
| Priority   | P0 (must have), P1 (should have), P2 (stretch), P3 (defer) |
| Estimation | Fibonacci story points (1, 2, 3, 5, 8, 13)                 |

## 3. Epic breakdown

| Epic  | Title                           | Phase | Priority | Deps         | Points | Status      |
| ----- | ------------------------------- | ----- | -------- | ------------ | ------ | ----------- |
| PLD01 | Sanity decommission             | Now   | P0       | —            | 8      | Done        |
| PLD02 | Payload foundation and database | Now   | P0       | PLD01        | 8      | Done        |
| PLD03 | Blog content model and admin    | Now   | P0       | PLD02        | 13     | Not started |
| PLD04 | Recipe content model and admin  | Now   | P0       | PLD02        | 8      | Not started |
| PLD05 | MDX content migration           | Now   | P0       | PLD03, PLD04 | 5      | Not started |
| PLD06 | Frontend data layer rewiring    | Now   | P0       | PLD05        | 13     | Not started |
| PLD07 | Documentation and delivery gate | Now   | P1       | PLD06        | 5      | Not started |
| PLD08 | Repo consolidation (Phase 2)    | Next  | P1       | PLD07        | TBD    | Not started |

## 4. Epic detail (Now phase)

### PLD01 — Sanity decommission

**Scope.** Remove Sanity entirely before Payload work begins. Sanity is built but not wired to production routes; deleting it now eliminates the triple-stack problem and clears dependencies, env vars, CSP rules, and test surface area for the migration.

**Key deliverables.** Sanity npm dependencies removed; `src/app/studio/` deleted; `src/sanity/` deleted; Sanity env vars removed from `.env.example`, Vercel, and `src/lib/env/`; CSP/security constants updated; Sanity-specific tests removed; `pnpm test`, `pnpm build`, and CI green with MDX routes unchanged.

**Dependencies.** None (prerequisites satisfied).

**Status.** Done.

---

### PLD02 — Payload foundation and database

**Scope.** Install Payload CMS in `apps/site` using the standard embedded Next.js pattern. Configure database adapter, admin route, authentication, and environment variables. Ensure `pnpm dev`, `pnpm build`, and CI pass with Payload present but not yet serving public routes.

**Key deliverables.** Payload package and config in `apps/site`; Postgres (or chosen DB) adapter wired; `/admin` (or equivalent) route reachable in dev; `.env.example` updated; build and typecheck green.

**Dependencies.** PLD01.

**Status.** Done.

---

### PLD03 — Blog content model and admin

**Scope.** Define Payload collections for blog posts and supporting entities (authors, categories, tags) aligned with existing MDX frontmatter. Editors can create, edit, and publish posts via the Payload admin UI.

**Key deliverables.** `posts` collection (title, slug, date, author, excerpt, description, tags, featured, image, body); author/category/tag collections or embedded fields as appropriate; validation rules; admin list/preview configuration; seed data for at least one test post.

**Dependencies.** PLD02.

**Status.** Not started.

---

### PLD04 — Recipe content model and admin

**Scope.** Define Payload collections for recipes aligned with existing MDX frontmatter, including structured ingredients and instructions.

**Key deliverables.** `recipes` collection (title, slug, date, author, excerpt, servings, prep/cook/total time, ingredients, instructions, tags, image, difficulty, SEO fields); ingredient object type; admin UX for recipe editing; seed data for at least one test recipe.

**Dependencies.** PLD02. Can run in parallel with PLD03 once PLD02 is done.

**Status.** Not started.

---

### PLD05 — MDX content migration

**Scope.** Migrate all production MDX blog posts (8) and recipes (3) into Payload, preserving slugs, dates, metadata, and body content. Images remain served from `public/` or are uploaded to Payload media as decided in solution design.

**Key deliverables.** Idempotent migration script or documented import process; slug map verified against current URLs (`/blog/{slug}`, `/recipes/{slug}`); migration runbook; rollback notes.

**Dependencies.** PLD03, PLD04.

**Status.** Not started.

---

### PLD06 — Frontend data layer rewiring

**Scope.** Replace MDX filesystem loaders with Payload queries for blog and recipe routes, indexes, home-page featured content, sitemap, and JSON-LD schema markup. Legal pages continue to load from `content/legal/` MDX unchanged.

**Key deliverables.** Updated `getBlogPosts` / post page / recipe page / blog index data sources; sitemap and metadata helpers using Payload; removal of MDX webpack imports for posts and recipes; smoke and integration tests updated for Payload-backed routes; URL and SEO parity verified.

**Dependencies.** PLD05.

**Status.** Not started.

---

### PLD07 — Documentation and delivery gate

**Scope.** Update engineering docs to reflect Payload + database as the content stack. Confirm all pre-flight checks pass and Phase 1 success criteria from `migration.md` are met.

**Key deliverables.** `docs/tech.md` updated (Payload, database, env vars); `docs/structure.md` updated (admin route, content paths); `docs/agents.md` commands/conventions if changed; CI green on lint, typecheck, unit, smoke, and integration tests.

**Dependencies.** PLD06.

**Status.** Not started.

---

### PLD08 — Repo consolidation (Phase 2)

**Scope.** Placeholder — see [`migration.md`](migration.md) Phase 2. Inline `@repo/ui`, flatten monorepo, remove Turbo/workspaces after Payload is stable.

**Status.** Not started.

## 5. Dependency graph

```text
PLD01 (Sanity removal)
  +-- PLD02 (Payload foundation)
        +-- PLD03 (blog model)
        +-- PLD04 (recipe model)
              +-- PLD05 (MDX migration)
                    +-- PLD06 (frontend rewire)
                          +-- PLD07 (docs & CI gate)
                                +-- PLD08 (Phase 2 — Next)
```

**Critical path:** PLD01 → PLD02 → PLD03 → PLD05 → PLD06 → PLD07

PLD04 joins PLD05 (must complete before migration). PLD03 and PLD04 can proceed in parallel after PLD02.

## 6. Parallelisation opportunities

| Window       | Parallel tracks                                        |
| ------------ | ------------------------------------------------------ |
| After PLD02  | PLD03 (blog model) and PLD04 (recipe model)            |
| During PLD05 | PLD06 spike/prototype on a single post in a branch     |
| During PLD06 | Draft `docs/tech.md` Payload sections (merge in PLD07) |
| After PLD07  | Phase 2 scoping (PLD08) — do not start repo surgery    |

## 7. Minimum viable slice

The smallest shippable increment that validates the approach:

1. **PLD01** — Sanity removed; site still serves MDX content; CI green.
2. **PLD02** — Payload running locally with admin and database.
3. **PLD03** — One post collection with minimal fields.
4. **PLD05 (partial)** — Migrate one cornerstone post (e.g. _Restoring 42 Hectares_).
5. **PLD06 (partial)** — Wire `/blog/{slug}` for Payload-sourced posts only; MDX fallback removed for that slug.

This proves Sanity is gone, Payload works embedded, migration fidelity holds, and route parity is achievable before bulk migration. Full Phase 1 completion requires all Now-phase epics through PLD07.

## 8. Assumptions

| ID  | Assumption                                                            | Impact if wrong                                      |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------- |
| A1  | Postgres (or Vercel-compatible SQL) is the database                   | Rework adapter config and hosting setup              |
| A2  | Existing URL shapes (`/blog/{slug}`, `/recipes/{slug}`) are preserved | Redirect map or SEO regression                       |
| A3  | Legal content stays MDX for Phase 1                                   | Scope creep if legal must move to Payload            |
| A4  | MDX body content maps cleanly to Payload rich text                    | Custom converters or hybrid MDX blocks needed        |
| A5  | Monorepo shape unchanged; Payload lives in `apps/site`                | Install path and Turbo config need revisiting        |
| A6  | Single editor (owner); no multi-tenant or RBAC beyond admin           | Simpler auth; revisit if collaborators need access   |
| A7  | Sanity can be removed before Payload routes go live                   | No production impact; MDX remains source until PLD06 |

## 9. Delivery risks

| ID  | Risk                                         | Likelihood | Impact | Mitigation                                               |
| --- | -------------------------------------------- | ---------- | ------ | -------------------------------------------------------- |
| R1  | Rich-text migration loses MDX formatting     | Medium     | High   | Migrate one post first; visual diff; document converter  |
| R2  | Payload + Next 16 build incompatibilities    | Medium     | High   | Pin versions; follow Payload embedded-app docs; CI early |
| R3  | Database provisioning blocks local dev       | Low        | Medium | Docker Compose or Neon free tier for dev                 |
| R4  | SEO/schema regression after data source swap | Medium     | High   | Compare JSON-LD and metadata before/after; sitemap test  |
| R5  | Early Sanity removal breaks unrelated tests  | Medium     | Medium | Remove incrementally; keep MDX routes verified in CI     |
| R6  | Content freeze during bulk migration         | Low        | Medium | Idempotent script; run against staging first             |

Technical and architecture risks are authoritative in [`solution.md`](solution.md) §10.1 when authored and are not duplicated here.

## 10. Phase 1 success criteria

From [`migration.md`](migration.md):

- One deployable Next.js app with Payload as the content source for blog and recipes.
- No Sanity (studio, deps, env vars, tests removed).
- Legal remains MDX unless rescoped.
- Monorepo unchanged.
- Tests and CI passing throughout (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`).
