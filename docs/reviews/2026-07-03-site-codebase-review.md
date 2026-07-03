---
type: Review
scope: carinyaparc-website
date: 2026-07-03
status: Complete
related:
  - docs/architecture/solution.md
  - docs/product/roadmap.md
---

# Site and codebase review — July 2026

A comprehensive review of the Carinya Parc website against its stated objectives: a
high-performance site on modern technology, at parity with WordPress. Items already tracked in
[`solution.md`](../architecture/solution.md) §10 are noted but not re-litigated; this review
focuses on findings that are **not** yet on the books.

**Verification state at time of review:** `pnpm typecheck` clean, `pnpm lint` 0 errors /
13 warnings, `pnpm test` 112 passed / 4 skipped.

---

## 1. Summary

The foundation is genuinely strong: Next.js 16 App Router with Server Components, Payload 3
embedded with typed collections, a considered caching/revalidation design, nonce-based CSP,
Zod-validated form APIs, and colocated tests including a novel post-build static-route assertion.
The architecture documentation is unusually good.

The review found **two critical defects** (draft content leaking to the public site; middleware
cache headers that defeat content revalidation), **a handful of high-impact quick wins** (broken
homepage CTAs, CI that gates nothing, a dead CSP reporting endpoint), and a **cluster of
WordPress-parity gaps** (no RSS, no pagination, no working categories, no recipes index, no
search) that should anchor the next phase of product work.

---

## 2. Critical

### 2.1 Draft posts and recipes leak to the public site

Payload's Local API defaults to `overrideAccess: true`, which **bypasses collection access
control**. Every public query goes through `payload.find` without `overrideAccess: false` and
without a `_status` filter:

- `src/lib/payload/queries/posts.ts` (`getBlogPosts`, `getBlogPostBySlug`, `getBlogPostSlugs`)
- `src/lib/payload/queries/recipes.ts` (all three queries)
- `src/lib/payload/queries/sitemap-posts.ts`

The `publicReadPublished` access rule on the collections is therefore **never applied** to
public page rendering, listings, `generateStaticParams`, or the sitemap. A never-published draft
post (parent doc `_status: 'draft'`) will appear on the blog index, get a public detail page,
and be advertised in `sitemap.xml`. This contradicts the invariant in `solution.md` §6.3
("public queries must never leak draft bodies") — the existing collection-config tests assert the
access _rule_ exists, not that queries _honour_ it.

**Fix:** add `overrideAccess: false` to every public query (or an explicit
`where: { _status: { equals: 'published' } }`), and add a regression test that creates a draft
and asserts it is absent from each query result.

### 2.2 Middleware cache headers defeat ISR and revalidation

`proxy.ts` (with `SECURITY_CACHE_ENABLED` defaulting to on) overwrites `Cache-Control` on every
matched route via `lib/security/cache.ts`:

- `/blog/*` and `/recipes/*` receive `public, max-age=31536000, immutable`. Blog and recipe
  **HTML** is told to be cached in browsers/CDNs for one year, immutable. On-demand
  revalidation after a Payload publish then does nothing for any visitor who has the page cached
  — the entire §7.4 freshness design is bypassed at the HTTP layer.
- Everything else receives `public, max-age=0, must-revalidate`, stomping the headers Next.js /
  Vercel set for ISR pages.
- The patterns are also trailing-slash inconsistent: with `trailingSlash: true` the canonical
  `/blog/my-post/` does **not** match minimatch `/blog/*` (single `*` doesn't cross `/`), while
  `/blog/my-post` does — so behaviour differs pre- and post-redirect.

**Fix:** stop setting `Cache-Control` for HTML routes in middleware entirely — let Next/Vercel
own it. Keep explicit `no-store` only for sensitive API responses (set in the route handlers
themselves). The year-long `immutable` directive is only correct for hashed `_next/static`
assets, which Vercel already handles.

---

## 3. High

### 3.1 Broken primary CTAs on the homepage

- Hero CTA `Learn Our Story →` links to `/our-farm` — route does not exist (404). Should be
  `/about` or `/about/the-property`.
- Regenerate section CTA `Get Involved →` links to `/regeneration` — route is `/regenerate`.
- Two further CTAs (`Coming Soon!`, `Sign Up! Be the first to know`) link to `#`.

These are the two most prominent conversion paths on the site. Recommend an automated internal
link check (e.g. a Vitest that walks rendered hrefs against the route manifest, or Playwright
smoke test) so this class of regression is caught in CI.

### 3.2 CI gates nothing

`.github/workflows/ci.yml` installs the toolchain and prints versions — it runs no lint,
typecheck, tests, or build. Meanwhile `AGENTS.md` still says "GitHub Actions CI is not yet
configured" (stale). Since all four checks pass today, wiring them in is nearly free:
`pnpm lint && pnpm typecheck && pnpm test` unconditionally, plus `pnpm build` when DB secrets
are available. This is the single highest-leverage engineering uplift available.

### 3.3 CSP violation reports go to a 404

`proxy.ts` defaults `SECURITY_CSP_REPORT_URI` to `/api/csp-report`, but no such route exists.
All CSP violation telemetry is silently lost — which matters given ADR-007's "production
verification pending" status for admin-under-CSP. Either add the endpoint (forwarding to
Sentry), point the default at Sentry's security-report ingest URL, or remove the directive.
Consider migrating to `report-to`/Reporting-Endpoints while there (`report-uri` is deprecated).

### 3.4 Leftover Sentry sample route and hollow cron route

- `/api/sentry` is the Sentry onboarding "throw a test error" route, publicly reachable —
  anyone can burn Sentry quota by curling it. The docs describe it as the Sentry tunnel, but the
  actual tunnel is `/monitoring` (Sentry build config). Remove the route and correct
  `solution.md` §7.8.
- `/api/cron` returns `{ ok: true }` with no auth, while docs describe it as "Scheduled tasks
  (protected)". Delete it until there is a real job, or protect it with `CRON_SECRET` per
  Vercel's pattern.

### 3.5 Canonical and sitemap URLs contradict `trailingSlash: true`

Every canonical URL (`generateCanonicalUrl`, blog `alternates.canonical`) and every sitemap URL
is emitted **without** a trailing slash, while the site 308-redirects to trailing-slash URLs.
Crawlers land on redirects for every URL they're given, and canonicals point at redirecting
URLs. Normalise once (helper that appends `/`) and add a unit test over metadata + sitemap
output.

---

## 4. Medium

1. **Blog index metadata is dead code.** `(blog)/blog/metadata.ts` is never imported —
   `blog/page.tsx` doesn't export `metadata`, so the listing inherits generic root metadata.
   Re-export it from the page (`export { metadata } from './metadata'`).
2. **Recipe detail metadata** lacks `alternates.canonical` and any OG image.
3. **Home and regenerate pages** have no page-specific metadata (title/description/canonical).
4. **Mobile menu button is white-on-white.** `Header.tsx` hard-codes `text-white` on the
   hamburger button while the header switches to `bg-white` on scroll and on all non-home pages
   (`isScrolled` initialises to `true` off the home page) — the icon becomes invisible. Needs a
   conditional colour like the rest of the header.
5. **Homepage content defects:** duplicated/incorrect alt text (`"Farm gate"` on the river-valley
   aerial and the highland-cattle image), and the typo "regerative farming" in the Experience
   section.
6. **Subscribe API leaks internals.** On missing config it tells the _public caller_ to "add
   MAILERLITE_API_KEY to .env.local"; MailerLite error bodies and status codes are forwarded
   verbatim to the browser. Return a generic message; log the detail server-side/Sentry.
7. **Rate limiting is keyed by attacker-controlled email** (both forms) — changing the email
   string bypasses it entirely. When the KV/Redis store lands (already-tracked debt), key by IP
   (`x-forwarded-for` first hop) _and_ email.
8. **Resend timeout is a no-op.** `send-contact-notification.ts` creates an `AbortController`
   and a 10 s `setTimeout`, but never passes `controller.signal` to the SDK call — the "timeout"
   protects nothing.
9. **No error boundary for the recipes group.** `(blog)/error.tsx` and `(www)/error.tsx` exist;
   `(recipes)` has none (related to the tracked "no route-group error boundaries" debt, but the
   asymmetry is new).
10. **`getPathFromParams`** (`lib/metadata/index.ts`) matches `params.post` / `params.recipe`,
    but all routes use `[slug]` — the helper would emit `/{slug}` for a blog post. It appears
    unused; delete it or fix the param names.
11. **Sitemap route discovery reads `src/app` from disk at runtime.** Works while the sitemap is
    statically generated, but breaks silently if the route ever becomes dynamic on Vercel (source
    isn't in the traced bundle) — and file `mtime` in a fresh CI clone makes `lastModified`
    equal to deploy time for every static page, which misinforms crawlers. Prefer an explicit
    static route list (it's eight routes) with meaningful dates, or drop `lastModified` for them.
12. **`X-XSS-Protection: 1; mode=block`** is deprecated and can _introduce_ XS-leak issues in old
    browsers; current guidance is `0` (or omit).
13. **`<html lang="en">`** — copy is Australian English; use `en-AU`.
14. **robots.txt** disallows `/profile/`, which doesn't exist; harmless but confusing. Consider
    `app/robots.ts` so the sitemap/robots pair is generated consistently with `BASE_URL`.
15. **Payload preview URL** (`admin.preview` on Posts) points at the public route with no draft
    mode/token — editors cannot preview drafts once 2.1 is fixed. Wire Next draft mode (or
    Payload's preview secret pattern) when fixing the draft leak, so the fix doesn't take
    preview down with it.

---

## 5. WordPress-parity gaps (product uplift)

These are the visible feature gaps against a stock WordPress blog. None are tracked in the
roadmap's shipped phases; several are cheap given data already in Payload:

| Gap                                                 | Notes                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RSS/Atom feed**                                   | Table stakes for a farming blog audience; trivial route handler over `getCachedBlogPosts`. Add `<link rel="alternate">` in the layout and reference in robots.                                                                                              |
| **Blog pagination**                                 | Blog index shows the latest 6 posts, full stop. Posts 7+ are unreachable by navigation (only the sitemap). Payload `find` already supports `page`/`totalPages`.                                                                                             |
| **Category/tag archives**                           | Categories and Tags are modelled in Payload but drive nothing. The index's category filter is decorative buttons (also an a11y issue — buttons that do nothing). Either wire `/blog/category/[slug]` (+ tag equivalent) or remove the filter UI until real. |
| **Recipes index**                                   | Recipe detail pages exist and are revalidated, but there is no `/recipes` listing and nothing links to recipes — they're orphaned pages reachable only by URL.                                                                                              |
| **Search**                                          | Absent. Payload + Postgres full-text (or a tiny client-side index at this content volume) covers it.                                                                                                                                                        |
| **Archived MDX content**                            | Eight posts in `content/posts/` and recipes in `content/recipes/` are outside Payload. If they're meant to be live, migrate them; if not, move them out of `apps/site/content/` to avoid the appearance of a third content pipeline.                        |
| **Post images in listings/OG**                      | `image` text-path fields exist but recipe OG images and per-post OG fall back inconsistently. Dynamic OG images via `next/og` would be a cheap, high-polish win.                                                                                            |
| **Comments / related posts / prev-next navigation** | Optional parity items; prev/next on post detail is nearly free with the existing sorted query.                                                                                                                                                              |

---

## 6. Performance

The heavy lifting (SSG/ISR, static shell, `unstable_cache` layer, image optimisation, query
projection, DB indexes) is done and shows in the git history. Remaining opportunities:

1. **Framer Motion for one fade-in.** `HeroContentMotion` and `Header`'s `AnimatePresence` pull
   the full `framer-motion` runtime into the shared client bundle for an opacity/translate
   entrance and a menu transition. A CSS animation (or `motion/react`'s `LazyMotion` +
   `domAnimation` subset) removes ~30 kB gzip from every page. Note `framer-motion` is pinned to
   `latest` (see §7).
2. **Consent fetch waterfall.** `ConsentGate` fetches `/api/consent` from `useEffect` on every
   page load for every visitor, then mounts GTM. The static-shell trade-off is documented and
   sound; the request itself could be avoided for returning visitors with a non-httpOnly
   _mirror_ flag cookie (the authoritative httpOnly cookie stays), or by reading the response
   from `sessionStorage`.
3. **Sentry client bundle.** Session replay integrations materially inflate the client bundle if
   enabled in `instrumentation-client.ts` — worth auditing `replaysSessionSampleRate` and using
   `Sentry.lazyLoadIntegration` for replay.
4. **`priority` hero + `quality={80}`** usage is correct. Largest photos are ~500 kB source but
   served through `next/image` AVIF/WebP — fine.
5. **Home page `revalidate = 86_400` + unconditional homepage revalidation on publish** — good;
   no action.

---

## 7. Dependency hygiene

From `apps/site/package.json`:

- **Remove — bogus/unused packages:** `fs` (`0.0.1-security` — an npm placeholder package),
  `path` (userland polyfill; all imports use `node:path`), `uuid` + `@types/uuid` (no imports
  found), `@emotion/is-prop-valid` (transitive optional dep of framer-motion; shouldn't be
  direct).
- **Pin floating versions:** `framer-motion: latest` and `@emotion/is-prop-valid: latest` make
  builds non-reproducible; any upstream major lands silently in the next install.
- **Misplaced:** `eslint-plugin-turbo` sits in `dependencies` (should be dev);
  `@types/mdx`, `@types/uuid` likewise belong in `devDependencies`.
- **Audit:** `graphql` and `minimatch` are only needed if Payload GraphQL / the middleware cache
  matcher stay — fine today, but `minimatch` disappears if §2.2 is fixed by deletion.
- `AGENTS.md` mentions `gray-matter`/remark cruft that has since been cleaned up — the tracked
  debt list needs a refresh alongside these removals.

---

## 8. Accessibility

- No skip-navigation link (already tracked).
- Decorative category "filter" buttons are announced as interactive but do nothing (§5).
- Invisible mobile menu trigger on light header (§4.4).
- Duplicate `aria-controls="mobile-menu"` target should be verified against the actual
  `MobileMenu` element id.
- `lang="en"` → `en-AU` (§4.13).
- Alt-text quality on the homepage (§4.5); alt enforcement arrives with the Media collection
  (tracked).

---

## 9. Documentation drift

`solution.md`/`AGENTS.md` are excellent but have drifted in spots — worth a sweep when the above
lands: CI "not configured" (a workflow exists; it just checks nothing), `/api/sentry` described
as the tunnel (it's the sample error route; tunnel is `/monitoring`), `/api/cron` described as
protected (it isn't), route segments documented as `[post]`/`[recipe]` (both are `[slug]`),
`docs/work/` referenced but absent, and the §10 debt list items already resolved (MDX deps).

---

## 10. Suggested sequencing

1. **Now (correctness):** draft-leak fix + regression tests (§2.1) · remove middleware
   Cache-Control for HTML (§2.2) · fix homepage links (§3.1) · make CI run lint/typecheck/test
   (§3.2).
2. **Next (trust/SEO):** trailing-slash canonical + sitemap normalisation (§3.5) · CSP reporting
   endpoint (§3.3) · delete `/api/sentry`, protect or delete `/api/cron` (§3.4) · blog index
   metadata (§4.1) · dependency cleanup (§7).
3. **Then (parity):** RSS feed · blog pagination · recipes index · wire or remove category
   filter · migrate archived MDX posts · dynamic OG images · search.
