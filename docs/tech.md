---
title: Carinya Parc – Technology Stack
status: active
owner: engineering
last_updated: 2025-11-25
---

## Overview

The Carinya Parc website is built as a modern, performance-focused Next.js v16 App Router application within a pnpm-powered monorepo.  
This document defines the core technology stack, supporting tooling, and the constraints that should guide future technical decisions.

## Core Framework & Language

- **Framework**: Next.js `16.0.4` with the App Router (`apps/site/src/app`)
- **Runtime**: Node.js `^22.17.0` (as defined in `package.json`)
- **Language**: TypeScript `^5.9.3`
- **React**: React / React DOM `^19.2.0`

**Rationale (✓):**

- Next.js App Router provides file-based routing, server components, streaming, and good defaults for performance and SEO.
- TypeScript enables safer refactors and clearer contracts between components, hooks, and utilities.
- Node 22 takes advantage of the latest runtime improvements while aligning with Vercel and modern tooling.

**Usage notes:**

- Prefer **server components** by default; only opt into client components (`"use client"`) when necessary (e.g., interactive UI, hooks requiring browser APIs).
- All new code should be written in TypeScript (`.ts` / `.tsx`), not plain JavaScript.

## Styling & Design System

### Styling approach

- **Primary**: Tailwind CSS `^4.1.17` with PostCSS (`apps/site/tailwind.config.ts`, `packages/tailwind-config`)
- **Global styles**: CSS modules and global CSS files under `apps/site/src/styles/`
- **Component-level styling**:
  - Shared UI primitives in `@repo/ui` (see `packages/ui/src`)
  - Utility helpers like `cn` in `apps/site/src/lib/cn.ts`
- **Additional libraries**:
  - `tailwind-merge` for class merging
  - `tailwindcss-animate` and `framer-motion` for animations (where needed)
  - `styled-components` is present for integration or legacy styling, but **Tailwind + UI components should be preferred** for new work.

**Rationale (✓):**

- Tailwind provides a compact, consistent utility vocabulary that works well with the design system.
- A shared `@repo/ui` package allows common components (buttons, dialogs, etc.) to be reused across packages, ensuring consistent look and feel.

### Design system conventions

- Use `@repo/ui` components where possible before introducing new ad-hoc components.
- Keep **colour and typography** centralised in Tailwind configuration and shared CSS, not hard-coded scattered values.
- Favour semantic class usage and consistent spacing / sizing scales.

## Data & Content

### Content sources

- **MDX content**:
  - Blog posts under `apps/site/content/posts/`
  - Recipes under `apps/site/content/recipes/`
  - Legal content (privacy, terms) under `apps/site/content/legal/`
- **Metadata & helpers**:
  - Reusable metadata utilities under `apps/site/src/lib/metadata/`
  - MDX parsing helpers and content loading under `apps/site/src/lib/mdx.ts` and related utilities.
- **API routes**:
  - Route handlers under `apps/site/src/app/api/` (e.g., `subscribe`, `cookie`, `sentry`, `cron`).

**Rationale (✓):**

- MDX allows rich, long-form storytelling while staying in the Git version-controlled repo.
- File-based content is suitable for a single-property site with moderate publishing frequency.
- API routes support lightweight server-side interactions (e.g., newsletter subscription, instrumentation) without a separate backend.

### Data layer expectations

- No relational database is assumed for the initial site; instead:
  - **Content** is stored as files in the repo.
  - **Lightweight state** (subscriptions, analytics events) integrates with external services (assumption; see Security & Privacy).

If a database or headless CMS is introduced, it must be documented explicitly with:

- Connection patterns
- Schema overview
- Deployment and migration expectations

## Environment & Configuration

- Environment variables are loaded from:
  - `.env.local` for local development (not committed).
  - Hosting platform configuration (e.g., Vercel project settings) for deployed environments.
- Suggested naming conventions:
  - Public variables: `NEXT_PUBLIC_*` (safe to expose to the browser).
  - Secret variables: `CP_*` (e.g., `CP_SENTRY_DSN`, `CP_NEWSLETTER_API_KEY`).

**Rules (✓):**

- **Never** commit `.env*` files with secrets to Git.
- Keep environment-variable usage small and explicit. If a new secret is introduced:
  - Document it in a short “Environment variables” section in the relevant integration doc.
  - Add it to deployment configuration.

## Tooling: Linting, Formatting, Testing, Type Checking

### Package management & orchestration

- **Package manager**: pnpm (`pnpm-lock.yaml`, `packageManager` field)
- **Monorepo orchestration**: Turborepo (`turbo.json`)

Root scripts (✓):

- `pnpm dev` – run dev servers via Turbo for relevant apps.
- `pnpm build` – run build across the monorepo.
- `pnpm lint` – lint all packages.
- `pnpm test`, `pnpm test:unit`, `pnpm test:integration`, `pnpm test:smoke`, `pnpm test:ci` – run Vitest test suites via Turbo.
- `pnpm typecheck` – TS type checking across workspaces.
- `pnpm format`, `pnpm format:check` – Prettier formatting.

Site-level scripts (`apps/site/package.json`):

- `pnpm dev` – Next.js dev server (Turbopack) for the site.
- `pnpm build`, `pnpm start` – build and run the production build.
- `pnpm lint` – Next.js + ESLint linting.
- `pnpm typecheck` – TypeScript only.
- `pnpm test*` – Vitest-based unit, integration, smoke, CI, and coverage commands.
- `pnpm optimize-images` – image optimisation utility.

### Linting & formatting

- **ESLint**:
  - Shared configuration in `@repo/eslint-config` (`packages/eslint-config`).
  - Next.js-specific rules via `eslint-config-next`.
  - Applied in `apps/site/eslint.config.mjs` and `packages/ui/eslint.config.mjs`.
- **Prettier**:
  - Configured via `prettier.config.mjs`.
  - Used for consistent code formatting across the monorepo.

**Conventions (✓):**

- Fix lint errors before committing; treat new lint failures as ✗ blockers.
- Run `pnpm format:check` in CI; manual formatting with `pnpm format` when needed.

### Testing

- **Unit / integration / smoke tests**:
  - Vitest-based, configured at the root (`vitest.config.js`) and site level (`apps/site/vitest.config.mjs`).
  - Tests are organised under `apps/site/__tests__/` (see that package’s `STRUCTURE.md` for full details).
- **Testing libraries**:
  - `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, and `@testing-library/jest-dom`.
  - `msw` for API mocking.
  - `jsdom` for DOM environment.

- **End-to-end / UI regression** (assumption):
  - `@playwright/test` is present as a dev dependency.
  - When activated, Playwright tests should live in a dedicated directory (e.g., `apps/site/e2e/`) and be wired into CI.

### Type checking

- TypeScript is enforced via:
  - `pnpm typecheck` at the root.
  - `pnpm typecheck` in `apps/site` for the app.

Type errors are treated as ✗ build blockers.

## Hosting & Deployment

**Assumptions (labelled explicitly):**

- Hosting is via **Vercel**:
  - Optimal support for Next.js App Router, edge runtime, and built-in analytics.
  - Simple integration with Git-based workflows and environments (preview, production).
- Deployment flow:
  - On push to main or specified branches, CI runs build, tests, lint, and typecheck.
  - Successful pipelines deploy to Vercel.

If an alternative host is used, document:

- Build command (likely `pnpm build` or `pnpm site:build`).
- Start command (`pnpm start` from `apps/site`).
- Required environment variables and configuration differences.

## Form handling & validation

### Form libraries (✓ standardised)

- **Form state**: React Hook Form `^7.66.1` for performant form management
- **Validation**: Zod `^4.1.13` for type-safe schema validation
- **Resolver**: `@hookform/resolvers` `^5.2.2` for Zod integration with React Hook Form
- **Data fetching**: TanStack Query `^5.90.11` for mutations and server state
- **Sanitization**: `isomorphic-dompurify` `^2.33.0` for XSS prevention

**Rationale (✓):**

- Single source of truth for validation (Zod schemas shared between client and server)
- Reduced boilerplate compared to manual state management
- Type-safe form handling with automatic TypeScript inference
- Consistent patterns across all forms (contact, newsletter, future forms)

### Email services

- **Transactional emails**: Resend SDK `^6.5.2` (contact form notifications)
- **Marketing emails**: MailerLite (newsletter subscriptions) - existing integration
- **Email templates**: HTML templates in `apps/site/src/lib/email/templates/`

**Configuration:**

- Email service credentials via environment variables
- SPF/DKIM records required for production deliverability

## Observability & Analytics

- **Sentry**:
  - `@sentry/nextjs` is configured with `apps/site/sentry.edge.config.ts` and `apps/site/sentry.server.config.ts`.
  - Used for error monitoring on server and edge layers.
- **Vercel Analytics**:
  - `@vercel/analytics` used for privacy-respecting behavioural analytics.
- **Instrumentation hooks**:
  - Custom instrumentation files under `apps/site/src/instrumentation.ts` and `apps/site/src/instrumentation-client.ts`.

**Expectations (✓):**

- Significant production errors should be captured in Sentry.
- Important changes to event names or analytics flows must be tracked and documented.
- Error monitoring should treat regressions as ✗ events needing timely follow-up.

## Performance, Accessibility & SEO

### Performance

- Use Next.js image optimisation (`next/image`) and the `optimize-images` script to keep asset sizes low.
- Target **Core Web Vitals** good thresholds on typical Australian broadband and 4G.
- Avoid unnecessary client-side JavaScript; prefer server components and minimal client bundles.
- Use caching and static generation where content is largely static (blog, recipes, legal).

### Accessibility

- Prefer accessible primitives from `@repo/ui` (likely built on accessible headless components).
- Ensure all interactive components:
  - Are keyboard navigable.
  - Use proper ARIA roles where necessary.
  - Provide visible focus states.
- Test pages with screen reader-friendly semantics and heading structure.

Accessibility is treated as a ✓ requirement, not a “nice to have”.

### SEO

- Use metadata helpers in `apps/site/src/lib/metadata/` and route-specific `metadata.ts` files.
- Provide unique, descriptive titles and descriptions for:
  - The home page.
  - Blog posts and recipes.
  - Regeneration and about pages.
- Ensure there is a sitemap (`apps/site/src/app/sitemap.ts`) and human-readable `robots.txt` (`apps/site/public/robots.txt`).

## Security & Privacy

### Security module

- **Location**: `apps/site/src/lib/security/` - centralised security utilities
- **Content Security Policy (CSP)**: Dynamic CSP generation with nonce support
  - Allows Google Tag Manager, Google Analytics, Google Fonts
  - Allows Sanity Studio (`*.sanity.io` for API, `cdn.sanity.io` for images)
  - Allows Sentry error tracking and Vercel analytics
  - Configuration in `apps/site/src/lib/security/constants.ts`
- **Security headers**: Comprehensive headers (HSTS, X-Frame-Options, etc.)
- **Cache control**: Route-based cache directives for sensitive/public paths

### Rate limiting & spam protection

- **Rate limiting**: In-memory Map pattern (3 requests per email per 24h)
- **Spam detection**:
  - Honeypot fields (hidden from users)
  - Submission timing checks (min 2 seconds)
  - Email pattern validation via `validateEmailForAPI()`
- **Implementation**: Used in `/api/subscribe` and `/api/contact` routes

### Privacy & data

- **Secrets management**:
  - Secrets (API keys, mailing list credentials, Sentry DSN, etc.) must live in environment variables (`.env.local`, environment configuration in Vercel), never committed to Git.
- **Data handling**:
  - Minimal personal data is collected; primarily email addresses for newsletter subscriptions and contact form submissions.
  - Legal content in `apps/site/content/legal/` defines commitments; implementations (e.g., cookie handling in `app/api/cookie/`) must align.
- **Dependencies**:
  - Use maintained, up-to-date dependencies; run periodic upgrades, especially for security-sensitive packages (`next`, `react`, `sentry`, `jose`).
- **Go services (assumption)**:
  - If any backend or support tooling is introduced in Go, **Go 1.25** MUST be used, and its usage documented (build, deployment, and integration points).

Security-related tests under `apps/site/__tests__/security/` are expected to remain green (✓). Any failures are treated as ✗ issues blocking deploy.

## Technical Constraints & Non-goals

### Constraints

- **Browsers**:
  - Supported browsers are defined via `browserslist`:
    - `"last 2 versions"`, `"not dead"`, `"> 0.1%"`.
  - No explicit support for legacy browsers (e.g., IE).

- **Runtime**:
  - Node 22+ for local development and build.

- **Monorepo**:
  - All new packages must align with the existing pnpm / Turborepo structure and naming.

### Non-goals

- Supporting multi-tenant or multi-property routing in the current application.
- Building a generic CMS; content management remains file-based unless a separate ADR is written and accepted.
- Over-abstracting early; common patterns should be extracted into utilities or `@repo/ui` **only after** two to three reuses.

## Proposing Changes to the Stack

If you need to:

- Upgrade major frameworks (Next, React, Node, TypeScript), or
- Introduce a new core piece of infrastructure (database, headless CMS, auth provider):

You MUST:

1. Write or update an ADR under `docs/adr/`.
2. Update this document (`docs/tech.md`).
3. Ensure `docs/agents.md` and `docs/structure.md` still reflect reality.

Avoid silent stack drift.

## Assumptions

- Hosting is on Vercel; if not, equivalent edge-friendly hosting should be chosen.
- No database is required for the initial phase; if one is introduced, an ADR should define the engine, migration strategy, and operational responsibilities.
- Observability tools (Sentry, Vercel Analytics) are configured and enabled in production environments.

Any assumption relied on by implementation should be clearly marked in code comments and, where material, reflected in this document with ✓ for confirmed decisions or ! when flagging open questions.
