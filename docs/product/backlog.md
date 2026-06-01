---
type: Backlog
scope: portfolio
phase: 1
version: '0.1'
owner: product
status: Draft
last_updated: 2026-05-31
parent_product: docs/product.md
parent_roadmap: docs/product/roadmap.md
related:
  - docs/solution.md
  - docs/structure.md
---

# Backlog — Carinya Parc website (Phase 1)

Portfolio backlog for **Phase 1 — Production readiness** only. Stories use Gherkin acceptance criteria.

| Doc | Role |
| --- | --- |
| [`product.md`](../product.md) | What and why |
| [`product/roadmap.md`](roadmap.md) | When — phase gates and exit criteria |
| [`solution.md`](../solution.md) | How — architecture; technical risks in §10.1 |
| **This document** | Phase 1 epics and stories |

---

## 1. Summary

**Objective.** Make the site trustworthy for production traffic and day-to-day editing: automated quality gates on every pull request, verified admin access under production security, live CMS updates on public blog and recipe pages, a single clear content source in the repository, and reliable form protection across serverless instances.

**Delivery approach.** Five epics sequenced for production trust before feature expansion. CI lands first so later changes merge safely. Revalidation and shared rate limiting address the two highest-impact runtime gaps (stale static pages and bypassable form limits). Cleanup and production verification run in parallel where they do not block each other.

**Prerequisites (complete).**

- Next.js 16 + Payload CMS 3 embedded app deployed on Vercel.
- Blog posts and recipes served from Neon Postgres; legal pages in MDX.
- Local quality commands (`lint`, `typecheck`, `test`, `build`) pass.
- Security middleware (CSP, HSTS, validation) in place.

**Prerequisites (required).**

- GitHub repository with merge-to-`main` deploys to Vercel.
- Production Neon database with migrated blog and recipe content.
- Vercel project secrets for `NEON_DATABASE_URL`, `PAYLOAD_SECRET`, and build-time env vars (see `turbo.json`).
- Operator access to production `/admin` for verification stories.

**Out of scope.** See [`product.md` §5](../product.md) and [`roadmap.md` §6](roadmap.md). Phase 2+ items (media uploads, SEO plugin, repo flattening, RSS, dynamic OG images, editable homepage copy) are not in this backlog.

---

## 2. Conventions

| Convention | Value |
| --- | --- |
| Epic ID | `CP{nn}` (e.g. `CP01`) |
| Story ID | `CP{nn}-{nnn}` (e.g. `CP01-001`) |
| Status | `Not started` · `In progress` · `Done` · `Blocked` |
| Priority | P0 must-have · P1 should-have · P2 defer |
| Estimation | Fibonacci story points (1, 2, 3, 5, 8, 13) |

---

## 3. Epic breakdown

| Epic | Title | Priority | Deps | Points | Status |
| --- | --- | --- | --- | --- | --- |
| CP01 | Continuous integration pipeline | P0 | — | 8 | Not started |
| CP02 | Production delivery verification | P0 | CP01 | 5 | Not started |
| CP03 | On-demand content revalidation | P0 | CP01 | 13 | Not started |
| CP04 | Post-migration repository cleanup | P1 | — | 8 | Not started |
| CP05 | Shared form rate limiting | P0 | CP01 | 8 | Not started |

**Phase 1 total:** 42 points across 5 epics, 18 stories.

---

## 4. Epic detail

### CP01 — Continuous integration pipeline

**Scope.** Add a GitHub Actions workflow that runs on every pull request and on merge to `main`: Prettier check, ESLint, TypeScript, Vitest, and production build. Build workers must receive database and CMS secrets so `generateStaticParams` succeeds.

**Key deliverables.**

- `.github/workflows/ci.yml` (or equivalent) invoking root `pnpm` scripts.
- CI secrets documented for operators (GitHub Actions secrets mirroring Vercel build env).
- Required status check on pull requests before merge.

**Dependencies.** None.

**Downstream consumers.** CP02, CP03, CP05 (safe iteration); all future phases.

**Status.** Not started.


#### Stories

- [ ] **[CP01-001] CI workflow scaffold and trigger rules**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CP01 | **Labels:** type:infra, area:ci
  - **Depends on:** —
  - **Deliverable:** GitHub Actions workflow file triggered on `pull_request` and `push` to `main`; Node 24.x and pnpm 10.26.0 aligned with root `package.json`.
  - **Design:** `solution.md` §8.2
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Pull request triggers CI
      Given an open pull request targeting main
      When new commits are pushed to the pull request branch
      Then a CI workflow run starts for that commit

    Scenario: Merge to main triggers CI
      Given a commit on main
      When the commit is pushed to the remote repository
      Then a CI workflow run starts for that commit
    ```

- [ ] **[CP01-002] Lint, format, and typecheck jobs**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CP01 | **Labels:** type:infra, area:ci
  - **Depends on:** CP01-001
  - **Deliverable:** CI jobs running `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` from the repository root.
  - **Design:** `AGENTS.md` — Quality checks
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Quality checks pass on a clean branch
      Given the branch passes format:check, lint, and typecheck locally
      When the CI pipeline runs
      Then the format, lint, and typecheck jobs succeed

    Scenario: Lint failure fails the pipeline
      Given a commit introduces an ESLint error
      When the CI pipeline runs
      Then the lint job fails
      And the overall workflow is marked failed
    ```

- [ ] **[CP01-003] Test job**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 1
  - **Epic:** CP01 | **Labels:** type:infra, area:ci
  - **Depends on:** CP01-001
  - **Deliverable:** CI job running `pnpm test` (Vitest, site app).
  - **Design:** `solution.md` §7.7
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Tests pass in CI
      Given all Vitest suites pass locally
      When the CI test job runs
      Then the job completes successfully
    ```

- [ ] **[CP01-004] Production build job with database secrets**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** CP01 | **Labels:** type:infra, area:ci
  - **Depends on:** CP01-001
  - **Deliverable:** CI build job with `NEON_DATABASE_URL`, `PAYLOAD_SECRET`, and other build-time env vars from GitHub Actions secrets; runs `pnpm build`.
  - **Design:** `solution.md` §8.2 · `turbo.json` build env list
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Build succeeds with CI secrets
      Given GitHub Actions secrets include NEON_DATABASE_URL and PAYLOAD_SECRET
      And the Neon database is reachable from GitHub-hosted runners
      When the CI build job runs
      Then pnpm build completes successfully

    Scenario: Missing database secret fails the build job
      Given NEON_DATABASE_URL is not configured in CI secrets
      When the CI build job runs
      Then the build job fails
      And no secret values appear in the workflow logs
    ```

---

### CP02 — Production delivery verification

**Scope.** Document and execute a production readiness checklist: required Vercel env vars, content present in the production database, first admin user, and Payload admin usable under production CSP and security headers.

**Key deliverables.**

- Production verification checklist (env, content, admin access).
- Documented outcome of `/admin` verification under production CSP (pass, or exceptions required).
- Confirmation that Vercel production build succeeds with current secrets.

**Dependencies.** CP01 (CI validates build parity; optional but recommended before sign-off).

**Downstream consumers.** Phase 2 entry gate; operator runbooks.

**Status.** Not started.


#### Stories

- [ ] **[CP02-001] Production environment checklist**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CP02 | **Labels:** type:ops, area:deployment
  - **Depends on:** —
  - **Deliverable:** Checklist covering required Vercel env vars (`NEON_DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, form and security flags) cross-referenced with `apps/site/.env.example` and `turbo.json`.
  - **Design:** `solution.md` §8.3 · `reviews/20260531-review.md` — Production checklist
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Checklist covers build-time database access
      Given the production verification checklist
      When an operator reviews build requirements
      Then NEON_DATABASE_URL and PAYLOAD_SECRET are listed as required for CI and Vercel build parity

    Scenario: Checklist records verification outcome
      Given the Vercel project is configured
      When an operator completes the env checklist
      Then each required variable has a documented verified or missing status
    ```

- [ ] **[CP02-002] Production content and admin user verification**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CP02 | **Labels:** type:ops, area:cms
  - **Depends on:** CP02-001
  - **Deliverable:** Verified presence of blog posts and recipes in production Postgres; at least one Payload admin user can sign in at `https://carinyaparc.com.au/admin`.
  - **Design:** `solution.md` §5.2
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Editor reaches production admin
      Given a Payload admin user exists in the production database
      When the editor signs in at /admin on the production URL
      Then the Payload admin dashboard loads successfully

    Scenario: Public site shows production CMS content
      Given published posts and recipes exist in production Postgres
      When a visitor opens /blog and /recipes
      Then listing pages show entries from the production database
    ```

- [ ] **[CP02-003] Admin under production CSP verification**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 1
  - **Epic:** CP02 | **Labels:** type:security, area:csp
  - **Depends on:** CP02-002
  - **Deliverable:** Documented verification of Payload admin under production security headers (`proxy.ts` CSP with `SECURITY_CSP_ENABLED`); outcome recorded (working, or required CSP adjustments documented).
  - **Design:** `solution.md` §7.1 · ADR-007 (pending)
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Admin UI usable under production CSP
      Given production CSP is enabled
      When an authenticated editor opens /admin and edits a post
      Then the admin UI renders and saves without CSP-related failures

    Scenario: Verification outcome is recorded
      Given admin CSP verification has been performed
      When the phase gate is reviewed
      Then the outcome is documented with date and result
    ```

---

### CP03 — On-demand content revalidation

**Scope.** Wire Payload collection hooks so publishing or updating posts and recipes invalidates cached static pages. Public blog and recipe detail and listing routes must reflect CMS edits without a full redeploy, within five minutes.

**Key deliverables.**

- Payload `afterChange` (and/or `afterDelete`) hooks on `posts` and `recipes` collections.
- `revalidatePath` (or tag-based equivalent) for affected public routes: `/blog`, `/blog/[slug]`, `/recipes`, `/recipes/[slug]`, and home featured sections if applicable.
- Documented revalidation strategy in `solution.md` (resolves open question §10.3).

**Dependencies.** CP01 (CI guards hook changes).

**Downstream consumers.** Phase 2 editorial work; editor daily workflow.

**Status.** Not started.


#### Stories

- [ ] **[CP03-001] Revalidation helper module**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** CP03 | **Labels:** type:feature, area:caching
  - **Depends on:** —
  - **Deliverable:** `lib/payload/revalidate-content.ts` (or equivalent) exporting functions to revalidate blog and recipe paths from a Payload document slug and collection type.
  - **Design:** `solution.md` §7.4 · §5.1
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Post publish revalidates detail and index paths
      Given a published post with slug "restoring-the-land"
      When the revalidation helper runs for that post
      Then /blog/restoring-the-land and /blog are marked for revalidation

    Scenario: Recipe update revalidates detail and index paths
      Given a published recipe with slug "herbed-omelette"
      When the revalidation helper runs for that recipe
      Then /recipes/herbed-omelette and /recipes are marked for revalidation
    ```

- [ ] **[CP03-002] Payload afterChange hooks on posts and recipes**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 5
  - **Epic:** CP03 | **Labels:** type:feature, area:cms
  - **Depends on:** CP03-001
  - **Deliverable:** Collection hooks on `Posts` and `Recipes` calling the revalidation helper when `_status` is `published` or when a previously published document changes.
  - **Design:** `solution.md` §5.2
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Publishing a post triggers revalidation
      Given a post transitioned to published in Payload admin
      When the save completes
      Then the revalidation helper runs for that post

    Scenario: Draft save does not refresh public detail content
      Given a post remains in draft status
      When the editor saves changes in admin
      Then public /blog/{slug} does not serve the draft body
    ```

- [ ] **[CP03-003] Home and featured content revalidation**
  - **Status:** Not started | **Priority:** P1 | **Estimate:** 2
  - **Epic:** CP03 | **Labels:** type:feature, area:caching
  - **Depends on:** CP03-002
  - **Deliverable:** Revalidation of `/` (or tagged home sections) when `featured` posts change.
  - **Design:** `solution.md` §5.1
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Featured post change updates home page cache
      Given a published post marked featured
      When the featured flag is toggled and saved
      Then the home page route is revalidated
    ```

- [ ] **[CP03-004] Revalidation verification and documentation**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** CP03 | **Labels:** type:docs, area:caching
  - **Depends on:** CP03-002
  - **Deliverable:** Manual verification record: edit in production admin → public URL reflects change within five minutes; `solution.md` §10.3 revalidation open question resolved.
  - **Design:** `roadmap.md` Phase 1 quality gates
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Production edit appears on public blog without redeploy
      Given a published post on production
      When an editor updates the title in admin and publishes
      Then the public /blog/{slug} page shows the new title within five minutes
      And no production redeploy was required

    Scenario: Revalidation strategy is documented
      Given Phase 1 revalidation is implemented
      When engineering docs are updated
      Then solution.md describes the revalidation mechanism and affected routes
    ```

---

### CP04 — Post-migration repository cleanup

**Scope.** Remove confusion and dead weight left after the Payload migration: archive or delete redundant MDX content, remove unused dependencies and config, and fix misleading blog category filter UI.

**Key deliverables.**

- Archived MDX under `content/posts/` and `content/recipes/` relocated or removed with `structure.md` updated.
- Unused packages removed from `package.json` (`gray-matter`, remark frontmatter plugins if unused).
- Dead config removed (`/api/media/file/**` rewrite, no-op `force-dynamic` on section components).
- Non-functional blog category filter removed (Phase 1 scope: remove; filtering deferred to Phase 4).

**Dependencies.** None (parallel-safe).

**Downstream consumers.** Phase 3 repo consolidation; editor trust in single source of truth.

**Status.** Not started.


#### Stories

- [ ] **[CP04-001] Archive migrated MDX content**
  - **Status:** Not started | **Priority:** P1 | **Estimate:** 2
  - **Epic:** CP04 | **Labels:** type:chore, area:content
  - **Depends on:** —
  - **Deliverable:** `content/posts/` and `content/recipes/` archived outside runtime paths (or deleted) with a short note in `structure.md` that blog and recipes are Payload-only.
  - **Design:** `structure.md` · `solution.md` §10.2
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Blog routes do not read archived MDX
      Given archived MDX remains in the repository for history
      When a visitor requests /blog/{slug}
      Then the page content comes from Payload only

    Scenario: Structure docs reflect Payload as source of truth
      Given cleanup is complete
      When an engineer reads structure.md
      Then blog and recipe runtime sources are documented as Payload collections
    ```

- [ ] **[CP04-002] Remove unused MDX dependencies**
  - **Status:** Not started | **Priority:** P1 | **Estimate:** 2
  - **Epic:** CP04 | **Labels:** type:chore, area:deps
  - **Depends on:** CP04-001
  - **Deliverable:** Remove `gray-matter`, `remark-frontmatter`, and `remark-mdx-frontmatter` from `apps/site/package.json` if legal MDX does not require them; lockfile updated.
  - **Design:** `solution.md` §10.2
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Build passes without removed packages
      Given unused MDX dependencies are removed
      When pnpm build runs
      Then the build completes successfully

    Scenario: Legal pages still render
      Given a legal page slug exists in content/legal
      When a visitor requests /legal/{slug}
      Then the page renders correctly
    ```

- [ ] **[CP04-003] Remove dead configuration and no-op directives**
  - **Status:** Not started | **Priority:** P1 | **Estimate:** 2
  - **Epic:** CP04 | **Labels:** type:chore, area:config
  - **Depends on:** —
  - **Deliverable:** Remove unused `/api/media/file/**` rewrite from `next.config.mjs`; remove no-op `export const dynamic = 'force-dynamic'` from `LatestPosts` and `FeaturedPosts` section components.
  - **Design:** `solution.md` §10.2
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Section components have no force-dynamic export
      Given LatestPosts and FeaturedPosts are section components
      When their source files are inspected
      Then they do not export dynamic segment config

    Scenario: Media rewrite removed from Next config
      Given no Media collection is configured
      When next.config.mjs is inspected
      Then there is no rewrite for /api/media/file/**
    ```

- [ ] **[CP04-004] Remove non-functional blog category filter UI**
  - **Status:** Not started | **Priority:** P1 | **Estimate:** 2
  - **Epic:** CP04 | **Labels:** type:fix, area:blog
  - **Depends on:** —
  - **Deliverable:** Remove hardcoded category filter buttons from `/blog` that do not query Payload categories; no misleading interactive affordance.
  - **Design:** `roadmap.md` Phase 1 in scope · `reviews/20260531-review.md`
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Blog page has no fake category filters
      Given the blog index page is rendered
      When a visitor views the page
      Then non-functional category filter buttons are not present

    Scenario: Blog listing still shows posts
      Given published posts exist in Payload
      When a visitor opens /blog
      Then recent and featured posts are displayed
    ```

---

### CP05 — Shared form rate limiting

**Scope.** Replace in-memory rate limiting on contact and subscribe API routes with a shared store suitable for Vercel serverless (e.g. Vercel KV or Upstash Redis). Limits must apply consistently across instances.

**Key deliverables.**

- Shared rate-limit module in `lib/` used by `/api/contact` and `/api/subscribe`.
- Provisioned shared store in production (and documented local/dev fallback behaviour).
- Tests for rate-limit logic (unit or integration against store abstraction).

**Dependencies.** CP01 (CI for API changes).

**Downstream consumers.** Public form trust; Phase 2+ unchanged.

**Status.** Not started.


#### Stories

- [ ] **[CP05-001] Rate limit store selection and provisioning**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CP05 | **Labels:** type:infra, area:security
  - **Depends on:** —
  - **Deliverable:** Decision recorded (Vercel KV vs Upstash vs alternative); production and CI env vars documented; store provisioned for production.
  - **Design:** `solution.md` §10.3 · `roadmap.md` cross-domain dependencies
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Store choice is documented
      Given Phase 1 rate limiting is planned
      When engineering completes store selection
      Then the decision and env vars are recorded in env example and solution docs

    Scenario: Production has shared store credentials
      Given the Vercel project is configured
      When rate limiting is deployed
      Then production env includes credentials for the shared store
    ```

- [ ] **[CP05-002] Shared rate limit library**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** CP05 | **Labels:** type:feature, area:security
  - **Depends on:** CP05-001
  - **Deliverable:** `lib/rate-limit/` (or equivalent) with store-backed `checkRateLimit(key, limits)` used by both form routes; preserves existing window and max-request semantics from contact/subscribe handlers.
  - **Design:** `solution.md` §7.1 · §5.3
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Rate limit exceeded returns 429
      Given a contact submission key has exceeded its window limit
      When another submission arrives with the same key
      Then the API responds with HTTP 429

    Scenario: Shared store counts across instances
      Given two concurrent requests hit different serverless instances
      When both use the same rate limit key within the window
      Then the shared store reflects the combined attempt count
    ```

- [ ] **[CP05-003] Wire contact and subscribe routes to shared limiter**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 2
  - **Epic:** CP05 | **Labels:** type:feature, area:api
  - **Depends on:** CP05-002
  - **Deliverable:** `/api/contact` and `/api/subscribe` use the shared module; in-memory `Map` implementations removed.
  - **Design:** `solution.md` §5.3
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Contact route uses shared rate limiter
      Given the contact API receives a valid payload
      When rate limiting is evaluated
      Then the shared rate limit module is invoked instead of an in-memory Map

    Scenario: Subscribe route uses shared rate limiter
      Given the subscribe API receives a valid payload
      When rate limiting is evaluated
      Then the shared rate limit module is invoked instead of an in-memory Map
    ```

- [ ] **[CP05-004] Rate limit tests and production verification**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 1
  - **Epic:** CP05 | **Labels:** type:test, area:security
  - **Depends on:** CP05-003
  - **Deliverable:** Vitest coverage for rate-limit logic (mocked store or test double); production smoke test documented (rapid duplicate submission blocked).
  - **Design:** `solution.md` §7.7
  - **Acceptance Criteria:**

    ```gherkin
    Scenario: Unit test covers limit exceeded path
      Given a rate limit fixture at maximum count
      When checkRateLimit is called for the same key
      Then the result indicates limited true

    Scenario: Production duplicate submission is blocked
      Given a successful contact form submission in production
      When an identical submission is sent again within the rate limit window
      Then the second request receives HTTP 429
    ```

---

## 5. Traceability

### Stories → solution sections

| Story | Solution reference |
| --- | --- |
| CP01-* | §8.2 Build and release · §7.7 Testing |
| CP02-* | §8.1 Topology · §8.3 Configuration · §7.1 Security |
| CP03-* | §5.1 · §5.2 · §7.4 Caching |
| CP04-* | §10.2 Technical debt items |
| CP05-* | §5.3 · §7.1 Rate limiting |

### Stories → product outcomes

| Outcome | Stories |
| --- | --- |
| Reliable, ownable digital presence | CP01-*, CP02-*, CP03-* |
| Channel to stay connected (newsletter) | CP05-* |
| Foundation for future revenue / content | CP03-* (live editing without deploy) |
| Trust and security for visitors | CP02-003, CP05-* |

---

## 6. Dependency graph

```text
                    ┌─────────────┐
                    │   CP04     │  cleanup (parallel)
                    │  cleanup    │
                    └─────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐
│  CP01   │────>│  CP02   │     │  CP03   │
│   CI     │     │ prod ver │     │revalidate│
└────┬─────┘     └──────────┘     └──────────┘
     │
     └──────────>┌──────────┐
                 │  CP05   │
                 │rate limit│
                 └──────────┘
```

**Critical path:** CP01 → CP03 (live editing) and CP01 → CP05 (form protection). CP02 gates Phase 1 sign-off on production trust. CP04 is off the critical path.

---

## 7. Parallelisation

| Parallel track | Epics / stories | Notes |
| --- | --- | --- |
| A | CP01 (CI) | Start first; unblocks safe merges |
| B | CP04 (cleanup) | No dependency on CI; can start immediately |
| C | CP02 (prod verification) | Checklist early; CSP/admin verification after env confirmed |
| D | CP03 + CP05 | After CP01 merges; independent of each other |

Within CP01, jobs CP01-002 through CP01-004 can run in parallel after CP01-001.

---

## 8. Minimum viable slice

The smallest increment that materially improves production trust:

1. **CP01-001 + CP01-002 + CP01-004** — CI with lint and build (blocks broken merges).
2. **CP03-001 + CP03-002** — Revalidation hooks (core editor experience).
3. **CP05-002 + CP05-003** — Shared rate limiting (form abuse).

Defer CP04 and CP02-003 documentation polish if needed, but Phase 1 exit requires all exit criteria in [`roadmap.md`](roadmap.md).

---

## 9. Definition of Done (Phase 1)

- [ ] All P0 stories marked Done.
- [ ] [`roadmap.md` Phase 1 exit criteria](roadmap.md) satisfied.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass locally and in CI.
- [ ] Relevant updates to `solution.md` (revalidation strategy; rate-limit store) and `structure.md` (content source) where stories changed behaviour.
- [ ] No new technical debt items introduced without entry in `solution.md` §10.2.

---

## 10. Assumptions and delivery risks

### Assumptions

| Assumption | Impact if wrong |
| --- | --- |
| GitHub Actions runners can reach Neon Postgres for CI builds | Build job fails; need ephemeral DB or build-time fallback policy |
| Vercel serverless supports chosen KV/Redis provider with low latency | Rate limits may be slow or unavailable; need provider change |
| Payload admin works under strict CSP without broad exceptions | Additional CSP directives or report-only period required |
| Single editorial user; no multi-tenant rate-limit keys needed | May need IP + email composite keys if abuse patterns change |

### Delivery risks (product / delivery)

| Risk | Mitigation |
| --- | --- |
| CI secret provisioning delayed | Document minimal secret set; use Neon branch for CI |
| Revalidation scope creep (tags, ISR intervals) | Ship path-based revalidation first; document in CP03-004 |
| Cleanup breaks legal MDX build | Verify legal routes in CP04-002 before removing deps |
| Phase 1 scope expands into Phase 2 (media, SEO) | Hold to roadmap exit criteria; defer to Phase 2 backlog |

Technical risks (stale content, CSP, draft leakage, build failures) are tracked in [`solution.md` §10.1](../solution.md) — not duplicated here.

---

## 11. Handoff

**Phase 1 leaves stable:**

- CI quality gate on every PR and merge to `main`.
- Production admin and env verified under production security.
- Blog and recipe edits visible on the public site without redeploy.
- Single Payload source of truth; no misleading blog UI or archived MDX confusion.
- Contact and subscribe endpoints rate-limited via shared store.

**What comes next:** Phase 2 — Editorial CMS maturity ([`roadmap.md` Phase 2](roadmap.md)): media library, SEO plugin, site globals, structured recipe ingredients, computed reading time. Scope Phase 2 stories when Phase 1 exit criteria are met.
