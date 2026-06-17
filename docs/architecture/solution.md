---
type: Solution
scope: carinyaparc-website
version: '0.1'
owner: engineering
status: Draft
last_updated: 2026-05-31
related:
  - docs/product/product.md
  - docs/architecture/principles.md
  - docs/architecture/structure.md
  - docs/product/roadmap.md
---

# Solution — Carinya Parc website

**How** the Carinya Parc website is built and behaves — architecture, runtime, data model, and integration boundaries.

| Doc | Role |
| --- | --- |
| [`product/product.md`](../product/product.md) | What and why |
| [`product/roadmap.md`](../product/roadmap.md) | When |
| **This document** | How — plus risks, technical debt, and open questions (**§10 only**) |
| [`structure.md`](structure.md) | Where — routes and folders |
| [`principles.md`](principles.md) | Engineering rules |

---

## 1. Context and scope

### 1.1 System context

```text
                    ┌─────────────────────────────────────────┐
                    │           External services              │
                    │  Neon Postgres · MailerLite · Resend*   │
                    │  Sentry · GTM · Vercel Analytics        │
                    └───────────────┬─────────────────────────┘
                                    │
[Visitor / Editor]                  │ HTTPS
       │                            │
       v                            v
┌──────────────┐            ┌───────────────────────────────┐
│   Browser    │───────────>│  Carinya Parc website         │
│  (public +   │            │  Next.js 16 + Payload CMS 3   │
│   /admin)    │<───────────│  Vercel (production)          │
└──────────────┘            └───────────────────────────────┘

* Resend optional; contact/subscribe integrations vary by env.
```

**Actors**

- **Public visitor** — reads marketing pages, blog, recipes; submits contact or subscribe forms.
- **Content editor** — authenticates to Payload admin; creates and publishes posts and recipes.
- **Operator** — deploys via Vercel; manages secrets, database, and third-party API keys.

### 1.2 System boundary

**This system owns:**

- Public marketing site (home, about, regenerate, contact flows, legal).
- Blog and recipe surfaces backed by Payload collections in Postgres.
- Embedded Payload admin at `/admin` and Payload REST/GraphQL API routes under `(payload)/`.
- Legal pages compiled from MDX in `content/legal/`.
- Public API routes: contact, subscribe, cookie consent, Sentry tunnel, cron.
- Security middleware (`proxy.ts`): CSP with nonces, HSTS, cache-control, security headers.
- SEO metadata and JSON-LD generation for public routes.
- Static assets in `public/` (photography, favicons, manifest).

**This system does not own:**

- Email list CRM logic beyond API integration (MailerLite).
- Payment, booking, or inventory systems.
- Social media publishing or CDN beyond Vercel/Next image optimisation.
- Agronomic or property operational systems.
- Multi-property or multi-brand tenancy.

**Upstream / downstream**

| System | Relationship |
| --- | --- |
| Neon Postgres | System of record for CMS content and admin users |
| Vercel | Hosting, serverless execution, build pipeline |
| MailerLite | Downstream — newsletter subscriptions |
| Sentry | Downstream — error and performance telemetry |
| Google Tag Manager / Vercel Analytics | Downstream — usage analytics (consent-gated) |

---

## 2. Quality goals and constraints

Ordered by priority for architectural trade-offs.

| Priority | Quality goal | Implication |
| --- | --- | --- |
| 1 | **Trust and security** | Strict CSP, validated env secrets, sanitised form input, httpOnly cookies for session/consent; no secrets in client bundles |
| 2 | **Editorial reliability** | Payload as single source of truth for blog/recipes; draft/publish separation; preview URLs from admin |
| 3 | **Performance on regional mobile** | Server Components by default; static generation for content detail pages; optimised images; lean client JS |
| 4 | **Maintainability for a small team** | Thin route files; shared `lib/` helpers; colocated tests for non-trivial logic; generated Payload types |
| 5 | **Ownable content** | No dependency on third-party CMS for core narrative content; git-retained legal MDX |

**Constraints**

- TypeScript strict mode; no `any` in new code ([`principles.md`](principles.md)).
- Australian English for user-visible copy ([`product.md`](product.md)).
- Single property, single editor today — RBAC and multi-tenant patterns deferred.
- Build-time static generation currently queries Postgres (`generateStaticParams`) — CI and Vercel builds require database connectivity and secrets.
- Monorepo shape today (`apps/site` + `packages/*`); consolidation to a flat repo is a future structural change, not current runtime behaviour.

---

## 3. Solution strategy

### 3.1 Architectural style

**Embedded CMS monolith** — one Next.js application hosts both the public site and Payload CMS using the official embedded-app pattern. No separate CMS service or headless API consumer app.

**Trade-off:** Simplicity and operational surface area vs. independent scaling of CMS and web tiers. Acceptable for single-property traffic and one editorial user.

### 3.2 Key decisions and trade-offs

| Choice | Satisfies | Trade-off accepted |
| --- | --- | --- |
| Payload 3 + Postgres | Editorial reliability, structured recipes, drafts | Operational dependency on Neon; build-time DB access |
| Server Components + cached Payload client | Performance, type safety | Client interactivity pushed to leaf components (forms, motion) |
| SSG for blog/recipe `[slug]` routes | Fast TTFB, CDN-friendly HTML | Content stale until revalidation or redeploy (known gap) |
| MDX for legal only | Git-reviewed legal text, no CMS scope creep | Two content pipelines to document and test |
| Text-path image fields (interim) | Fast migration, static `public/` assets | No media library, alt enforcement, or upload workflow yet |
| `map-content.ts` mapping layer | Stable UI types decoupled from Payload shapes | Extra indirection when schema changes |
| Security via `proxy.ts` + nonce CSP | Trust goal | Admin UI must be verified under production CSP |
| Base UI + inline `src/components/ui/` | No external primitive package; leaner dependency graph | Primitive API differs from Radix (`render` prop vs `asChild`) |

### 3.3 Principles applied

From [`principles.md`](principles.md): separation of concerns (data in server routes/`lib`, UI in `components/`), discrete metadata and JSON-LD helpers, env validation at build time, colocated Vitest for validation and Payload helpers.

---

## 4. Building block view

### 4.1 Containers (C4 Level 2)

```text
┌─────────────────────────────────────────────────────────────────┐
│ apps/site (Next.js 16 App Router)                                │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Route groups│  │ Components  │  │ lib/                    │ │
│  │ (www)(blog) │  │ sections/   │  │ payload/ metadata/      │ │
│  │ (recipes)   │  │ forms/ ui/  │  │ schema/ security/       │ │
│  │ (payload)   │  │ rich-text/  │  │ validation/ consent/    │ │
│  └──────┬──────┘  └─────────────┘  └───────────┬─────────────┘ │
│         │                                        │               │
│  ┌──────v────────────────────────────────────────v─────────────┐ │
│  │ Payload CMS (collections, access, Lexical, postgres adapter)│ │
│  └──────────────────────────────┬──────────────────────────────┘ │
│                                 │                                │
│  ┌──────────────┐  ┌────────────v────────┐  ┌─────────────────┐ │
│  │ content/     │  │ public/             │  │ proxy.ts        │ │
│  │ legal MDX    │  │ static images       │  │ security layer  │ │
│  └──────────────┘  └─────────────────────┘  └─────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────v──────────┐
                    │ Neon Postgres        │
                    └──────────────────────┘
```

### 4.2 Components (selected Level 3)

| Block | Responsibility | Location |
| --- | --- | --- |
| **Query layer** | Payload `find` / `findByID`; sort, depth, featured filters | `src/lib/payload/queries/` |
| **Content mapper** | Payload document → list/detail DTOs for UI and metadata | `src/lib/payload/map-content.ts` |
| **Payload client** | Singleton `getPayload()` per request (`React.cache`) | `src/lib/payload/client.ts` |
| **Collections** | Schema, access, drafts, admin columns | `src/collections/` |
| **Rich text renderer** | Lexical JSON → React | `src/components/rich-text/` |
| **Metadata composers** | Title, OG, canonical helpers | `src/lib/metadata/` |
| **Schema generators** | Article, Recipe, Breadcrumb, LocalBusiness JSON-LD | `src/lib/schema/` |
| **Form APIs** | Zod validation, sanitise, rate limit, upstream email APIs | `src/app/api/contact`, `subscribe` |
| **Access control** | `publicReadPublished` hides drafts from anonymous reads | `src/lib/payload/access.ts` |

### 4.3 Repository layout

See [`structure.md`](structure.md) for the canonical directory map. Architectural rule: **`page.tsx` loads data; sections render; `lib/` holds side effects and integration.**

---

## 5. Runtime view

### 5.1 Public blog post request (SSG)

```text
CDN / Vercel edge
  → serve pre-rendered HTML for /blog/{slug} (from last build)
  → (future) on-demand revalidation after Payload publish

At build time (generateStaticParams + page render):
  getBlogPostSlugs()
    → getPayloadClient()
    → payload.find({ collection: 'posts', ... })
    → publicReadPublished access filter
  getBlogPostBySlug(slug)
    → payload.find with slug
    → mapPayloadPostToDetail (if applicable)
  generateMetadata + page
    → RichText body, SchemaMarkup, Breadcrumb
```

**Static behaviour:** Without `revalidatePath` / Payload `afterChange` hooks, pages stay static until the next deploy (see §10).

### 5.2 Editor publishes a post

```text
Editor → /admin → Payload admin UI
  → authenticate via Payload Users collection (Payload session)
  → edit Post (draft autosave every 120s)
  → transition _status to published
  → persisted to Postgres

Public site (today):
  → unchanged until rebuild/redeploy OR (planned) revalidation hook
```

### 5.3 Contact form submission

```text
Browser (client) → ContactFormSection (React Query mutation)
  → POST /api/contact
  → proxy.ts applies security headers (not API body logic)
  → Zod schema validation
  → honeypot check
  → in-memory rate limit by email (per instance — to be replaced)
  → sanitise fields (plain-Node strip/escape)
  → send via configured mail integration
  → JSON response
```

### 5.4 Legal page request

```text
GET /legal/{slug}
  → MDX page module from content/legal/
  → marketing layout (header/footer)
  → no Payload query
```

### 5.5 Security request path

```text
Incoming request
  → proxy.ts
  → generate nonce → attach to CSP (strict-dynamic in prod)
  → cache-control (feature-flagged)
  → HSTS, X-Frame-Options, etc.
  → NextResponse.next() with headers on request for downstream nonce use
```

---

## 6. Data model and ubiquitous language

### 6.1 Core entities

| Entity | Meaning | Storage |
| --- | --- | --- |
| **Post** | Long-form blog article | Payload `posts` |
| **Recipe** | Structured cooking content with ingredients and instructions | Payload `recipes` |
| **Author** | Byline identity for posts/recipes | Payload `authors` |
| **Category** | Primary taxonomy for posts | Payload `categories` |
| **Tag** | Cross-cutting labels for posts and recipes | Payload `tags` |
| **User** | Payload admin account | Payload `users` |
| **Legal page** | Privacy policy, terms of service | MDX + frontmatter in git |

### 6.2 Relationships

```text
Post ──author──> Author
Post ──category──> Category (optional)
Post ──tags──> Tag[]

Recipe ──author──> Author
Recipe ──tags──> Tag[]

User (standalone; auth only)
```

### 6.3 Invariants

- **Slug uniqueness** — enforced per collection; public URLs are `/blog/{slug}` and `/recipes/{slug}` (`lib/payload/urls.ts`).
- **Published visibility** — anonymous Payload reads return only `_status: published` for posts and recipes.
- **Required publish date** — `date` on posts and recipes drives sort order and metadata.
- **Draft safety** — authenticated admin sees drafts; public queries must never leak draft bodies (verify when changing access rules).
- **Image paths (interim)** — `image` / `imageUrl` string fields reference paths under `public/`; not upload relations until Media collection lands.

### 6.4 Glossary

| Term | Definition |
| --- | --- |
| **Lexical body** | Rich text stored as JSON from `@payloadcms/richtext-lexical` |
| **Featured post** | Boolean on Post; drives home page highlights |
| **ISO duration** | Recipe time fields stored as text (e.g. `PT20M`); formatted for display via `format-duration` |
| **List item vs detail** | Mapper produces lighter shapes for cards/indexes vs full document for `[slug]` pages |

---

## 7. Cross-cutting concepts

### 7.1 Security

- **CSP:** Nonce-based `strict-dynamic` scripting in production; `'unsafe-eval'` only in development for admin tooling. Feature flags: `SECURITY_CSP_ENABLED`, `SECURITY_CSP_REPORT_ONLY`.
- **Rate limiting:** Contact and subscribe use in-process maps on each serverless instance (see §10).
- **Cookies:** `cp_consent` — httpOnly analytics consent via `setConsent` server action. `cp_session` — httpOnly JWT helpers in `lib/session/` exist as a scaffold for future public-site auth; not read or set by any route today. Payload admin authenticates via Payload Users, not `cp_session`.
- **Input validation:** Zod schemas in `lib/validation/`; contact/subscribe sanitisation without browser-only DOM libraries.
- **Secrets:** `PAYLOAD_SECRET`, `NEON_DATABASE_URL`, API keys never exposed client-side; only `NEXT_PUBLIC_*` for browser-safe config.

### 7.2 Observability

- **Sentry** — client and server error capture; tunnel route under `/api/sentry`.
- **Analytics** — GTM and Vercel Analytics loaded subject to consent cookie.
- **Logging** — form rejections (honeypot, validation) at API layer; avoid logging PII or secrets.

### 7.3 Error handling

- **Route level:** `global-error.tsx`, `not-found.tsx`.
- **API routes:** Structured JSON errors; validation messages sanitised for client display.
- **Proxy circuit breaker:** In-memory error window in `proxy.ts` to fail open on header generation failures.

### 7.4 Caching and content freshness

- **Static pages:** Blog/recipe detail pre-rendered at build; no `revalidate` export today.
- **Image optimisation:** Next.js `minimumCacheTTL` one day in `next.config.mjs`.
- **Payload client:** Request-scoped memoisation via `React.cache` — not a cross-request cache.

### 7.5 Metadata and structured data

- Small composable functions in `lib/metadata/` per [`principles.md`](principles.md) §11.
- JSON-LD types in `lib/schema/` (Article, Recipe, Breadcrumb, LocalBusiness, Organization).

### 7.6 Accessibility

- Semantic HTML and meaningful `alt` on images per [`principles.md`](principles.md) §14.

### 7.7 Testing strategy

- **Vitest** (Node env) for Payload mapping, collection config, recipe duration formatting.
- API route integration tests, E2E, and CI automation are not in place (see §10).

### 7.8 Public HTTP API surface

Public route handlers (distinct from Payload's admin REST/GraphQL under `(payload)/`):

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/contact` | POST | Contact form submission |
| `/api/subscribe` | POST | Newsletter subscription |
| `/api/sentry` | POST | Sentry tunnel |
| `/api/cron` | GET | Scheduled tasks (protected) |

Request and response shapes are defined by Zod schemas in `lib/validation/` and inline route handlers.

---

## 8. Deployment and environments

### 8.1 Topology

| Environment | Hosting | Database | Notes |
| --- | --- | --- | --- |
| **Local dev** | `pnpm site:dev` (Turbopack) | Docker Compose Postgres or Neon dev branch | `.env.local` from `.env.example` |
| **Production** | Vercel project → `apps/site` | Neon pooled connection string | Secrets in Vercel env |

### 8.2 Build and release

```text
git push → Vercel build
  → pnpm install (monorepo root)
  → turbo build (site package)
  → Next.js production build
      → generateStaticParams queries Neon for all post/recipe slugs
      → static HTML for public routes
  → deploy serverless functions + static assets
```

**Implications:**

- Production and CI builds **must** reach Postgres with valid `NEON_DATABASE_URL` and `PAYLOAD_SECRET`.
- Payload type generation: `pnpm generate:types` after collection schema changes; commit `payload-types.ts`.

### 8.3 Configuration surface

Key env vars (non-exhaustive; see `apps/site/.env.example` and `turbo.json`):

- `NEON_DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`
- `MAILERLITE_API_KEY`, `SESSION_SECRET`
- `SECURITY_CSP_*`, `SECURITY_CACHE_ENABLED`
- Sentry and GTM public/private keys

### 8.4 Rollout pattern

- Trunk-based deploys to Vercel on merge to main (no blue/green today).
- Content changes today require redeploy for public static pages until revalidation is implemented.
- Schema migrations rely on Payload/Postgres adapter migrations (`payload-migrations` collection).

---

## 9. Architectural decisions

Formal ADR files are not yet authored. Candidate decisions recorded here; bodies marked pending.

| ID | Decision | Status |
| --- | --- | --- |
| ADR-001 | Embed Payload in Next.js rather than standalone CMS | _(Not yet written)_ — reflects shipped state |
| ADR-002 | Postgres (Neon) as CMS database | _(Not yet written)_ |
| ADR-003 | Keep legal content in git MDX, not Payload | _(Not yet written)_ |
| ADR-004 | Static generation for blog/recipe detail at build time | _(Not yet written)_ — revisit when revalidation ships |
| ADR-005 | Interim text-path images instead of Media uploads | _(Not yet written)_ — time-bounded; supersede when Media lands |
| ADR-006 | Inline UI components into `apps/site`; adopt Base UI + Sonner | _(Not yet written)_ — `@repo/ui` removed from site dependencies; `packages/ui` deleted during flat-repo consolidation |
| ADR-007 | Nonce-based strict CSP on all non-static routes including `/admin` | _(Not yet written)_ — production verification pending |

---

## 10. Risks, technical debt, and open questions

### 10.1 Risks

| Risk | Likelihood | Impact | Mitigation direction |
| --- | --- | --- | --- |
| Static content stale after CMS edit | High (today) | Medium | Payload `afterChange` + `revalidatePath` / tags |
| Rate limit bypass on serverless | Medium | Medium | Shared KV/Redis store |
| CSP breaks Payload admin in production | Medium | High | Verify prod-like build; admin CSP exception if required |
| Build fails when DB unreachable | Medium | High | CI secrets + Neon availability; optional build-time fallback policy |
| Draft leakage to public site | Low | High | Access tests; smoke-test after schema changes |

### 10.2 Technical debt

- No GitHub Actions CI workflow (quality checks run locally only).
- Static blog/recipe pages require redeploy for CMS edits (no revalidation hooks).
- In-memory rate limiting on contact and subscribe APIs (not reliable on serverless).
- Archived MDX under `content/posts/` and `content/recipes/` (not runtime source).
- Unused MDX dependencies in `package.json` (`gray-matter`, remark packages).
- Non-functional blog category filter UI vs Payload categories.
- No-op `dynamic = 'force-dynamic'` on section components.
- Unused `/api/media/file/**` rewrite without Media collection.
- Import alias duplication (`@/*` vs `@/src/*`).
- `lib/session/` scaffold (`cp_session`) — module present, not wired to routes.
- Honeypot field named `website` on forms.
- Placeholder `LOCAL_BUSINESS` geo coordinates in JSON-LD.
- No skip-navigation link; no route-group error boundaries.
- Text-path image fields (no Media collection or enforced alt text).

### 10.3 Open questions

- **Revalidation strategy:** Tag-based vs path-based; ISR fallback interval?
- **Rate limit store:** Vercel KV vs Upstash vs other?
- **Media migration:** Backfill strategy for existing public-path images when upload collection is added?
- **Globals scope:** Which marketing surfaces move to Payload Globals vs remain in code?
- **Repo flatten timing:** Entry criteria beyond roadmap exit checks?

Mitigation timing is in [`product/roadmap.md`](product/roadmap.md). Do not track debt elsewhere in this doc set.

---

## 11. Graduation candidates

Patterns that may lift to shared `architecture/patterns/` if a second product or domain adopts them.

| Pattern | Trigger for graduation |
| --- | --- |
| **Cached Payload client wrapper** (`getPayloadClient` + `server-only`) | Second Next.js + Payload app in the portfolio |
| **Public published access helper** (`publicReadPublished`) | Reused across multiple Payload collections/projects |
| **Content mapper layer** (CMS DTO → UI types) | Second content type or second CMS backend |
| **Nonce CSP proxy module** | Standard security baseline for all public Next.js apps in org |
| **Metadata + JSON-LD composer split** | Third site requiring the same SEO structure |

Until then, these remain conventions inside `apps/site` documented in [`structure.md`](structure.md) and [`AGENTS.md`](../../AGENTS.md).
