---
type: Roadmap
domain: carinya-parc-website
version: '0.2'
owner: product
status: Draft
last_updated: 2026-05-31
parent_product: docs/product.md
parent_roadmap: null
related:
  - docs/product.md
  - docs/solution.md
---

# Roadmap — Carinya Parc website

**When** work ships. Defines phased objectives, exit criteria, and milestones.

| Doc | Role |
| --- | --- |
| [`product.md`](../product.md) | What and why |
| **This document** | When — sequencing and phase gates |
| [`solution.md`](../solution.md) | How — architecture; current debt in §10 |
| [`structure.md`](../structure.md) | Where — routes and folders |

This document does not list technical debt — see [`solution.md`](../solution.md) §10. Stories and acceptance criteria are scoped when a phase starts.

---

## 1. Roadmap intent

The website runs on Payload for blog and recipes, with legal content in MDX. This roadmap sequences what ships next: production readiness, editorial CMS capability, repo consolidation, then discoverability polish.

Each phase unlocks the next without stacking risky changes.

---

## 2. Sequencing logic

1. **Production trust before feature expansion** — Automated quality checks, reliable form protection, and verified admin access under production security must be in place before expanding CMS capability or restructuring the repo.
2. **Live editing before repo surgery** — Content changes should appear on the public site without a redeploy. Prove the Payload + Next.js integration holds in production before collapsing the monorepo.
3. **Editorial foundations before full page CMS** — Media uploads, SEO controls, and editable site copy address daily editing needs without the scope of a full page builder.
4. **Repo simplification after stability** — Flatten to a single Next.js app only once CMS behaviour is proven in production. One large change at a time.
5. **Discoverability after the content model settles** — Syndication, social previews, and richer structured data depend on stable media and recipe fields.

---

## 3. Phases

### Phase 1 — Production readiness

**Objective:** Make the site trustworthy for production traffic and day-to-day editing.

**In scope:**

- Continuous integration on every pull request (lint, typecheck, test, build with database secrets available to build workers).
- Production delivery verification: env vars, content in the production database, admin usable under production content-security policy.
- On-demand revalidation so Payload edits reach public blog and recipe pages without redeploy.
- Post-migration cleanup: archive redundant content files, remove unused dependencies and dead configuration, fix misleading UI (e.g. non-functional category filters).
- Shared rate limiting on contact and subscribe endpoints (replacing per-instance in-memory limits).

**Quality gates:**

- Quality commands pass in CI on every merge to `main`.
- A published edit in the admin appears on the corresponding public URL within five minutes.
- Form endpoints resist trivial abuse across serverless instances.

**Exit criteria:**

- [ ] CI runs lint, typecheck, test, and build on pull requests; build succeeds with production-equivalent database and CMS secrets.
- [ ] Production admin verified under production security headers; outcome documented.
- [ ] Blog and recipe updates propagate to the public site without redeploy.
- [ ] Single clear content source of truth in the repository and database.
- [ ] Contact and subscribe rate limits enforced via a shared store in production.

**Out of scope:** Media uploads, SEO plugin, repo flattening, RSS, dynamic social images, editable homepage copy.

---

### Phase 2 — Editorial CMS maturity

**Objective:** Enable daily content work — assets, SEO, and key site copy — without migrating legal pages or turning every marketing page into CMS-managed content.

**In scope:**

- Media library with upload relationships, image sizes, and required alt text on posts, recipes, and authors.
- SEO controls per document (meta title, description, social overrides) with sensible defaults from existing fields.
- Scoped rich-text editing (essential formatting only — not a full embed toolbar).
- Site globals for homepage hero, tagline, navigation labels, and footer copy, wired to the public site.
- Structured recipe ingredients and richer recipe structured data; computed reading time on posts.

**Quality gates:**

- Images uploaded in admin render on public pages with alt text.
- Editors can adjust SEO metadata without code changes.
- Routine homepage and navigation copy is editable in admin.

**Exit criteria:**

- [ ] All post, recipe, and author imagery uses the media library with required alt text.
- [ ] SEO controls visible on posts and recipes.
- [ ] Rich-text toolbar matches an agreed allow-list, documented in engineering structure docs.
- [ ] Homepage hero, site tagline, and footer blurb editable via admin and rendered from CMS data.
- [ ] Recipe structured data includes a structured ingredient list; post cards show computed reading time.
- [ ] Draft content never appears on the public site (verified after any access changes).

**Out of scope:** Full page CMS for about, contact, and regenerate routes; scheduled publishing; multi-user roles beyond basic admin/editor; legal MDX migration; site search.

---

### Phase 3 — Repo consolidation

**Objective:** Collapse the monorepo to a single deployable Next.js app, reducing tooling overhead.

**In scope:**

- Move shared UI into the application.
- Inline lint, TypeScript, and Tailwind configuration at the repository root.
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

**Entry condition:** Phase 1 exit criteria met and a stable production editing period with no critical CMS regressions.

---

### Phase 4 — Discoverability and polish

**Objective:** Improve how content reaches and retains audiences — syndication, social previews, local discovery, and incremental UX quality.

**In scope:**

- RSS/Atom feed for published posts.
- Dynamic social preview images per post and recipe.
- Accurate local business coordinates in structured data (replacing placeholders).
- Related-post navigation or category filtering on the blog (implement or remove misleading UI).
- Targeted UX and accessibility improvements: route error boundaries, skip navigation, client/server boundary cleanup.

**Quality gates:**

- Syndication and social metadata support content distribution and sharing.
- Local business structured data reflects verified property location.

**Exit criteria:**

- [ ] Valid RSS feed at a documented URL.
- [ ] Post and recipe pages expose dynamic social preview images (or a documented fallback policy).
- [ ] Local business structured data uses verified coordinates.
- [ ] Blog category UI either filters correctly or is removed.

**Out of scope:** Booking engine, e-commerce, workshops and experiences pages, scheduled publishing, full marketing page CMS, multi-property support.

---

## 4. Milestones

| Milestone | Phase | Customer-visible? | Notes |
| --- | --- | --- | --- |
| CI green on every PR | 1 | Internal only | Confident merges and deploys |
| Production admin verified | 1 | Internal only | Security headers + env checklist |
| Live content updates without redeploy | 1 | Yes | Core editor experience |
| Media uploads in admin | 2 | Yes | Alt text and asset management |
| SEO controls on posts and recipes | 2 | Partial | Better search and social snippets |
| Editable homepage and footer copy | 2 | Yes | Routine copy without deploys |
| Flat single-app repository | 3 | No | Reduced maintenance overhead |
| RSS feed live | 4 | Yes | New distribution channel |
| Rich social previews | 4 | Yes | When links are shared |

---

## 5. Cross-domain dependencies

| Dependency | Owner | Gates | Status |
| --- | --- | --- | --- |
| Managed Postgres | Engineering / hosting | Admin, static generation, CI build | Active |
| Vercel deployment and secrets | Engineering / hosting | Production and CI | Active |
| Shared rate-limit store | Engineering | Phase 1 — reliable form protection | Not started |
| SEO plugin (Payload) | Engineering | Phase 2 — per-document SEO | Not started |
| Vercel project root change | Engineering / hosting | Phase 3 — flat repo deploy | Not started |

---

## 6. Out of scope for this roadmap

Deferred beyond Phase 4 or excluded per [`product.md`](../product.md):

- Full booking engine with real-time availability and payments.
- E-commerce and checkout flows.
- Multi-property or multi-brand CMS.
- Legal pages in Payload (remain MDX unless rescoped).
- Full marketing page CMS unless Phase 2 globals prove insufficient.
- Scheduled publishing, unless editorial workflow requires it.
- Multi-user access control beyond basic admin and editor roles.
- Workshops, experiences, and partner pages (`product.md` near-future ideas).
- Formal WCAG certification programme (Phase 4 includes targeted items only).

---

## 7. Review cadence

- **Weekly (during active execution):** Track phase exit criteria; confirm no critical regressions in production editing or public routes.
- **Pre-phase-gate:** Before entering a new phase, confirm all prior exit criteria are met; run full quality checks locally and in CI; scope stories and acceptance criteria for the entering phase.
- **Quarterly:** Re-read [`product.md`](../product.md) near-future features and §6 deferrals; adjust phase order if product priorities shift (e.g. Stay information before discoverability polish).
