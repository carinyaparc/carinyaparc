---
type: Roadmap
domain: carinya-parc-website
version: '0.3'
owner: product
status: Draft
last_updated: 2026-06-17
parent_product: docs/product.md
parent_roadmap: null
related:
  - docs/product.md
  - docs/architecture/solution.md
---

# Roadmap — Carinya Parc website

**When** work ships. Defines phased objectives, exit criteria, and milestones.

| Doc                                            | Role                                    |
| ---------------------------------------------- | --------------------------------------- |
| [`product.md`](../product.md)                  | What and why                            |
| **This document**                              | When — sequencing and phase gates       |
| [`solution.md`](../architecture/solution.md)   | How — architecture; current debt in §10 |
| [`structure.md`](../architecture/structure.md) | Where — routes and folders              |

This document does not list technical debt — see [`solution.md`](../architecture/solution.md) §10. Stories and acceptance criteria are scoped when a phase starts.

---

## 1. Roadmap intent

The website exists to build audience, pre-qualify guests, and publish stories and recipes that reflect life on the property. Payload already powers blog and recipes; legal content stays in MDX.

This roadmap **prioritises marketing and content management** — editorial capability, Stay information, and editable site copy — so owners can grow the newsletter and guest pipeline without engineering for every change. **Production hardening is woven through the first two phases** (CI alongside CMS work; form protection and production verification once editorial foundations land), not front-loaded as a gate before any marketing value ships.

Each phase unlocks the next without stacking risky changes.

---

## 2. Sequencing logic

1. **Marketing and editorial outcomes first** — Stay information, publishable posts and recipes with assets and SEO, and editable key site copy address guest pipeline, brand-building, and daily content work from [`product.md`](../product.md).
2. **Production hardening woven in, not blocking content** — CI lands early so CMS and marketing changes merge safely; shared rate limits and production admin verification follow once editors are actively publishing.
3. **Live editing before repo surgery** — Content changes must appear on the public site without redeploy. Prove the Payload + Next.js integration in production before collapsing the monorepo.
4. **Editorial foundations before full page CMS** — Media, SEO, and site globals address daily editing without migrating every marketing page into Payload.
5. **Repo simplification after stability** — Flatten to a single Next.js app only once CMS behaviour is proven in production.
6. **Discoverability after the content model settles** — Syndication, social previews, and richer structured data depend on stable media and recipe fields.

---

## 3. Phases

### Phase 1 — Marketing and content management

**Objective:** Enable daily marketing and editorial work — publish stories and recipes, maintain key site copy, and present honest Stay information — with CMS changes visible on the public site without redeploy.

**In scope:**

- On-demand revalidation so Payload edits reach public blog and recipe pages without redeploy.
- Media library with upload relationships, image sizes, and required alt text on posts, recipes, and authors.
- SEO controls per document (meta title, description, social overrides) with sensible defaults from existing fields.
- Scoped rich-text editing (essential formatting only — not a full embed toolbar).
- Site globals for homepage hero, tagline, navigation labels, and footer copy, wired to the public site.
- Structured recipe ingredients and richer recipe structured data; computed reading time on posts.
- **Stay information** — accommodation, seasonality, what to expect, honest "what it's not", and a clear enquiry path (per [`product.md`](../product.md) near-future).
- **Woven production hardening:** continuous integration on every pull request (lint, typecheck, test, build with database secrets available to build workers).

**Quality gates:**

- A published edit in the admin appears on the corresponding public URL within five minutes.
- Images uploaded in admin render on public pages with alt text.
- Editors can adjust SEO metadata and routine homepage or navigation copy without code changes.
- Stay pages answer "Is this for me?" and "How do I enquire?" without misleading expectations.
- Quality commands pass in CI on every merge to `main`.

**Exit criteria:**

- [ ] Blog and recipe updates propagate to the public site without redeploy.
- [ ] All post, recipe, and author imagery uses the media library with required alt text.
- [ ] SEO controls visible on posts and recipes.
- [ ] Rich-text toolbar matches an agreed allow-list, documented in engineering structure docs.
- [ ] Homepage hero, site tagline, and footer blurb editable via admin and rendered from CMS data.
- [ ] Recipe structured data includes a structured ingredient list; post cards show computed reading time.
- [ ] Stay information pages live with verified copy aligned to on-ground reality.
- [ ] Draft content never appears on the public site (verified after any access changes).
- [ ] CI runs lint, typecheck, test, and build on pull requests; build succeeds with production-equivalent database and CMS secrets.

**Out of scope:** Full page CMS for about, contact, and regenerate routes; scheduled publishing; multi-user roles beyond basic admin/editor; legal MDX migration; site search; shared rate limiting; repo flattening; RSS; dynamic social images.

---

### Phase 2 — Production hardening and cleanup

**Objective:** Close remaining production-trust gaps so the site withstands real traffic and abuse while editors publish from Phase 1.

**In scope:**

- Production delivery verification: env vars, content in the production database, admin usable under production content-security policy.
- Shared rate limiting on contact and subscribe endpoints (replacing per-instance in-memory limits).
- Post-migration cleanup: archive redundant content files, remove unused dependencies and dead configuration, fix misleading UI (e.g. non-functional category filters).
- Single clear content source of truth in the repository and database.

**Quality gates:**

- Production admin verified under production security headers; outcome documented.
- Form endpoints resist trivial abuse across serverless instances.

**Exit criteria:**

- [ ] Production admin verified under production security headers; outcome documented.
- [ ] Contact and subscribe rate limits enforced via a shared store in production.
- [ ] Single clear content source of truth in the repository and database.
- [ ] Misleading or non-functional UI removed or corrected (including blog category filter if not yet addressed).

**Out of scope:** New CMS schema or marketing pages; media uploads; SEO plugin; repo flattening; RSS; dynamic social images.

**Entry condition:** Phase 1 exit criteria met, or Phase 1 in progress with revalidation and CI already landed (rate limiting and production verification may proceed in parallel once CI is green).

---

### Phase 3 — Repo consolidation

**Objective:** Collapse the monorepo to a single deployable Next.js app, reducing tooling overhead.

**In scope:**

- Move shared UI into the application.
- Inline lint and TypeScript configuration at the repository root. (Tailwind inlined in `apps/site`.)
- Promote the site app to repo root; remove workspace orchestration and the packages folder.
- Update deployment configuration and normalise import paths.

**Quality gates:**

- Single-app repository builds, tests, and deploys with no functional regression.

**Exit criteria:**

- [ ] Repository root is one Next.js + Payload application.
- [ ] Dev, test, build, and CI pass on the flat structure.
- [ ] Production deployment succeeds from the new root.
- [ ] Import paths and engineering docs reflect the flat layout.

**Out of scope:** New product features, CMS schema changes, legal MDX migration.

**Entry condition:** Phase 2 exit criteria met and a stable production editing period with no critical CMS regressions.

---

### Phase 4 — Discoverability and marketing polish

**Objective:** Improve how content reaches and retains audiences — syndication, social previews, local discovery, and incremental marketing UX.

**In scope:**

- RSS/Atom feed for published posts.
- Dynamic social preview images per post and recipe.
- Accurate local business coordinates in structured data (replacing placeholders).
- Related-post navigation or category filtering on the blog (implement or remove misleading UI).
- Light scaffolding for experiences/workshops and partner/collaborator pages (per [`product.md`](../product.md) near-future).
- Targeted UX and accessibility improvements: route error boundaries, skip navigation, client/server boundary cleanup.

**Quality gates:**

- Syndication and social metadata support content distribution and sharing.
- Local business structured data reflects verified property location.

**Exit criteria:**

- [ ] Valid RSS feed at a documented URL.
- [ ] Post and recipe pages expose dynamic social preview images (or a documented fallback policy).
- [ ] Local business structured data uses verified coordinates.
- [ ] Blog category UI either filters correctly or is removed.
- [ ] Experiences and partner routes exist with honest placeholder or live copy and clear contact paths.

**Out of scope:** Booking engine, e-commerce, scheduled publishing, full marketing page CMS, multi-property support.

---

## 4. Milestones

| Milestone                             | Phase | Customer-visible? | Notes                                         |
| ------------------------------------- | ----- | ----------------- | --------------------------------------------- |
| Live content updates without redeploy | 1     | Yes               | Core editor experience                        |
| Media uploads in admin                | 1     | Yes               | Alt text and asset management                 |
| SEO controls on posts and recipes     | 1     | Partial           | Better search and social snippets             |
| Editable homepage and footer copy     | 1     | Yes               | Routine copy without deploys                  |
| Stay information pages live           | 1     | Yes               | Guest pipeline and pre-qualification          |
| CI green on every PR                  | 1     | Internal only     | Woven hardening — safe merges during CMS work |
| Production admin verified             | 2     | Internal only     | Security headers + env checklist              |
| Shared form rate limiting             | 2     | Internal only     | Reliable abuse resistance                     |
| Flat single-app repository            | 3     | No                | Reduced maintenance overhead                  |
| RSS feed live                         | 4     | Yes               | New distribution channel                      |
| Rich social previews                  | 4     | Yes               | When links are shared                         |
| Experiences and partner pages         | 4     | Yes               | Marketing scaffolding for future offers       |

---

## 5. Cross-domain dependencies

| Dependency                                 | Owner                 | Gates                              | Status      |
| ------------------------------------------ | --------------------- | ---------------------------------- | ----------- |
| Managed Postgres                           | Engineering / hosting | Admin, static generation, CI build | Active      |
| Vercel deployment and secrets              | Engineering / hosting | Production and CI                  | Active      |
| On-demand revalidation (Next.js + Payload) | Engineering           | Phase 1 — live editorial workflow  | Not started |
| SEO plugin (Payload)                       | Engineering           | Phase 1 — per-document SEO         | Not started |
| Shared rate-limit store                    | Engineering           | Phase 2 — reliable form protection | Not started |
| Vercel project root change                 | Engineering / hosting | Phase 3 — flat repo deploy         | Not started |

---

## 6. Out of scope for this roadmap

Deferred beyond Phase 4 or excluded per [`product.md`](../product.md):

- Full booking engine with real-time availability and payments.
- E-commerce and checkout flows.
- Multi-property or multi-brand CMS.
- Legal pages in Payload (remain MDX unless rescoped).
- Full marketing page CMS unless Phase 1 globals prove insufficient.
- Scheduled publishing, unless editorial workflow requires it.
- Multi-user access control beyond basic admin and editor roles.
- Formal WCAG certification programme (Phase 4 includes targeted items only).

---

## 7. Review cadence

- **Weekly (during active execution):** Track phase exit criteria; confirm no critical regressions in production editing or public routes.
- **Pre-phase-gate:** Before entering a new phase, confirm all prior exit criteria are met; run full quality checks locally and in CI; scope stories and acceptance criteria for the entering phase.
- **Quarterly:** Re-read [`product.md`](../product.md) near-future features and §6 deferrals; adjust phase order if product priorities shift.
