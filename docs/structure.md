---
title: Carinya Parc – Project Structure
status: active
owner: engineering
last_updated: 2025-11-25
---

## Overview

This document describes the structure of the Carinya Parc repository, with a focus on the `apps/site` Next.js v16 App Router application.  
It explains how routes, components, hooks, and utilities are organised, and provides guidance for adding new features in a consistent way.

## High-level Repository Layout

At a high level, the monorepo is structured as:

```text
.
├── apps/
│   └── site/                 # Next.js App Router app. for the Carinya Parc website
│       ├── content/          # MDX content (blog, recipes, legal)
│       ├── public/           # Static assets (images, favicons, manifest, robots.txt)
│       ├── src/
│       │   ├── app/          # App Router routes, layouts, and route-level files
│       │   ├── components/   # Shared React components
│       │   ├── context/      # React contexts (if any)
│       │   ├── hooks/        # Reusable hooks
│       │   ├── lib/          # Utilities, metadata, schema, session helpers
│       │   ├── styles/       # Global and component-level styles
│       │   └── utils/        # Cross-cutting utility functions
│       ├── eslint.config.mjs
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── vitest.config.mjs
├── packages/
│   ├── ui/                   # Shared UI component library
│   ├── eslint-config/        # Shared ESLint configuration
│   ├── tailwind-config/      # Shared Tailwind configuration
│   └── typescript-config/    # Shared TypeScript configs
├── docs/                     # Documentation for the repo
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── package.json              # Monorepo scripts and dev dependencies
```

The `docs/` directory contains this file plus product, tech, and agent-focused documentation that should be updated alongside code changes.

## Site App Structure (`apps/site`)

Within `apps/site`, the primary directories relevant to web behaviour are:

- `content/`
  - `posts/` – long-form blog posts in MDX.
  - `recipes/` – recipes in MDX.
  - `legal/` – legal pages (privacy, terms) in MDX.

- `public/`
  - `images/` – photography showcasing the property.
  - `favicons/`, `logo.png`, `robots.txt`, `site.webmanifest`, etc.

- `src/app/`
  - `layout.tsx` – root layout for the app.
  - `(www)/` – routing group for main marketing site:
    - `page.tsx` – home page.
    - `about/` with nested routes (e.g., `the-property`, `jonathan`).
    - `regenerate/` – regeneration overview.
    - `legal/[slug]/page.tsx` – legal pages resolved by slug.
    - `subscribe/page.tsx` – subscription / newsletter flows.

  - `(blog)/` – routing group for blog content:
    - `blog/page.tsx` – blog index at `/blog`.
    - `[post]/page.tsx` – individual post route at `/[post]` (root level).
    - Future: `blog/category/[slug]/page.tsx`, `blog/tag/[tag]/page.tsx`.

  - `(recipes)/` – routing group for recipe content:
    - `[recipe]/page.tsx` – individual recipe route at `/[recipe]` (root level).
    - Future: `recipes/page.tsx`, `recipes/category/[slug]/page.tsx`, `recipes/tag/[tag]/page.tsx`.

  - `api/` – API route handlers (`subscribe`, `cookie`, `sentry`, `cron`).
  - `global-error.tsx`, `not-found.tsx`, `sitemap.ts`, and other app-wide files.
  - Optional route-level `loading.tsx`, `error.tsx`, and `layout.tsx` as needed.

- `src/components/`
  - `sections/` – larger page sections (hero blocks, feature sections, etc.).
  - `forms/` – reusable form components (e.g., subscribe form).
  - `layouts/` – layout-level components.
  - `posts/`, `pages/`, `ui/` – post components, page-specific extras, and shared UI wrappers.

- `src/hooks/`
  - Hooks such as `use-mobile`, `use-toast`, etc.

- `src/lib/`
  - `cn.ts` – class name utility.
  - `mdx.ts` – MDX loading/rendering utilities.
  - `metadata/` – helper functions for route metadata.
  - `schema/` – schema generation utilities (article, breadcrumb, recipe, etc.).
  - `session/` – session management (types, server-only functions).
  - `security/` – security utilities (CSP, headers, caching).
  - Other cross-cutting library code.

- `src/styles/`
  - `globals.css`, `components.css`, typography, and page-level overrides.

- `src/utils/`
  - Smaller, focused utility functions.

- `__tests__/`
  - Integration, smoke, security tests, fixtures, mocks, helpers, and test setup
  - Unit tests are colocated with source files (e.g., `Button.tsx` → `Button.test.tsx`)
  - See `apps/site/__tests__/STRUCTURE.md` for full details

## Routing & Layout (Next.js App Router)

### Layout and error boundaries

- `src/app/layout.tsx`
  - Defines the root HTML structure, global providers, and shared navigation.

- `src/app/global-error.tsx`
  - Handles rendering for uncaught errors across the app.

- `src/app/not-found.tsx`
  - Default UI for unknown routes.

- `src/app/navigation.tsx`
  - Central navigation configuration (imported by layout or header components).

Each route or route group MAY also define:

- `layout.tsx` – layout for that subtree.
- `loading.tsx` – route-level loading UI.
- `error.tsx` – route-level error boundary.
- `template.tsx` – template for repeated segments (if needed).
- `route.ts` – handler for API routes or other HTTP endpoints.

### Routes

The current route structure includes (not exhaustive):

- `/` → `src/app/page.tsx` (home).
- `/about` → `src/app/about/page.tsx`.
- `/about/the-property` → `src/app/about/the-property/page.tsx`.
- `/about/jonathan` → `src/app/about/jonathan/page.tsx`.
- `/regenerate` → `src/app/regenerate/page.tsx`.
- `/blog` → `src/app/blog/page.tsx`.
- `/blog/[post]` → `src/app/blog/[post]/page.tsx`.
- `/recipes/[recipe]` → `src/app/recipes/[recipe]/page.tsx`.
- `/legal/[slug]` → `src/app/legal/[slug]/page.tsx`.
- `/subscribe` → `src/app/subscribe/page.tsx`.
- `/contact` → `src/app/(www)/contact/page.tsx` (✓ new).

API routes:

- `/api/subscribe` → `src/app/api/subscribe/route.ts`.
- `/api/contact` → `src/app/api/contact/route.ts` (✓ new).
- `/api/cookie` → `src/app/api/cookie/route.ts`.
- `/api/sentry` → `src/app/api/sentry/route.ts`.
- `/api/cron` → `src/app/api/cron/route.ts`.

### Route groups & segmentation (assumption)

As the site grows, we may introduce route groups such as:

- `(marketing)` – for marketing and storytelling pages.
- `(functional)` – for subscribe, booking, and forms.

If used, route groups should:

- Be purely structural (do not change URLs).
- Be documented here with examples when introduced.

### Marketing vs functional / booking pages

- **Marketing & storytelling pages (✓)**:
  - `/`, `/about`, `/about/the-property`, `/regenerate`, `/blog`, `/recipes/*`.
  - Focused on narrative, photography, and context-setting.

- **Functional / utility pages (✓)**:
  - `/subscribe`, API endpoints, and future enquiry/booking flows.

- **Future booking pages (assumption)**:
  - If/when an enquiries or booking flow is introduced, it should live under:
    - `/stay` or `/visit` for guest information.
    - `/stay/enquire` or similar for enquiry forms.

Any structural shift (e.g., introducing route groups like `(marketing)` or `(app)`) should be updated here and reflected in imports and tests.

## Components, Hooks & Utilities

### Components

- Live under `src/components/` with subfolders by concern:
  - `sections/` for large page sections (hero, story grids, etc.).
  - `forms/` for reusable form elements:
    - `SubscribeForm.tsx` - newsletter subscription form
    - `ContactForm.tsx` - contact inquiry form (✓ new)
    - `SubscribeModal.tsx` - modal wrapper for subscription
  - `ui/` for wrappers around shared UI primitives from `@repo/ui`.
  - `pages/` and `posts/` for page-specific and post-specific components.
  - `providers/` for React context providers:
    - `Providers.tsx` - TanStack Query provider wrapper (✓ new)

**Naming convention:**

- Components use **PascalCase** file and export names: `HeroSection.tsx`, `SubscribeForm.tsx`, `BlogPostCard.tsx`.
- Each file should export a single main component as default or named export.

### Hooks

- Live under `src/hooks/`.

**Naming convention:**

- Hooks start with `use`, e.g., `useMobile`, `useToast`.
- File names are in kebab-case mirroring the hook name, e.g., `use-mobile.ts`.

### Utilities & lib

- Live under `src/lib/` and `src/utils/`.
- **Data-fetching and content utilities**:
  - Functions like `getAllPosts`, `getPostBySlug`, `getRecipes` live in `src/lib/` (often with MDX helpers).

- **Naming convention**:
  - Data-fetching helpers: `getX`, `listX`, `fetchX`.
  - Parsing/formatting helpers: `parseX`, `formatX`.

- **Module organisation (✓)**:
  - **Single files** (e.g., `cn.ts`, `mdx.ts`, `posts.ts`) for focused utilities.
  - **Folders** (e.g., `metadata/`, `schema/`, `session/`, `security/`) for related functionality with:
    - Multiple implementation files
    - Separate type definitions
    - Co-located tests
    - A barrel export (`index.ts`) for clean imports

Examples of established folder patterns:

- `src/lib/metadata/` – metadata generation helpers with barrel export.
- `src/lib/security/` – CSP, headers, and cache control utilities.
- `src/lib/validation/` – Zod schemas and sanitization (✓ new):
  - `contact-schema.ts` - Contact form validation schema
  - `contact-schema.test.ts` - Colocated unit tests
  - `sanitize.ts` - DOMPurify wrapper utilities
  - `sanitize.test.ts` - Colocated unit tests
- `src/lib/email/` – Email service integration (✓ new):
  - `send-contact-notification.ts` - Resend SDK integration
  - `templates/contact-notification.ts` - Email HTML templates
- `src/lib/schema/` – schema generators (article, breadcrumb, recipe) with tests.
- `src/lib/session/` – session management with types, server functions, and barrel export.
- `src/lib/security/` – security utilities (CSP, headers, caching) with types and tests.

## Naming Conventions

- **Route segments**:
  - Use **kebab-case** for folder and URL segments (e.g., `the-property`, `slow-roasted-dexter-beef-with-root-vegetables`).
  - Dynamic segments are wrapped in square brackets (e.g., `[post]`, `[recipe]`).

- **Components**:
  - PascalCase file and export names.

- **Hooks**:
  - `useSomething` naming with strong, focused purpose.

- **Tests**:
  - **Unit tests**: Colocated with source files using `.test.ts` / `.test.tsx` suffix (not `.spec.ts`)
    - Example: `src/lib/cn.ts` → `src/lib/cn.test.ts`
  - **Integration/Smoke/Security tests**: Centralized in `apps/site/__tests__/` subdirectories

## Import Aliases & Examples

From `apps/site/tsconfig.json`, the primary aliases are:

- `@/*` → `./src/*`
- `@/app/*` → `./src/app/*`
- `@/components/*` → `./src/components/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/lib/*` → `./src/lib/*`
- `@/styles/*` → `./src/styles/*`
- `@/types/*` → `./src/types/*`
- `@/utils/*` → `./src/utils/*`
- `@repo/ui/*` → `../packages/ui/src/*`

**Examples (✓):**

```ts
// Importing a section component
import { RegenerateSection } from '@/components/sections/regenerate-section';

// Importing a data helper
import { getAllPosts } from '@/lib/posts';

// Importing from modular lib folders (via barrel exports)
import { getSession, setSession } from '@/lib/session';
import type { SessionPayload } from '@/lib/session';

// Importing a hook
import { useMobile } from '@/hooks/use-mobile';

// Importing a shared UI component
import { Button } from '@repo/ui/button';
```

Prefer these aliases over complex relative paths (✗ `../../../components/...`).

## Guidelines for Adding New Features

When adding a new feature (page, component, or flow):

1. **Decide where it belongs in the URL space (✓)**
   - Is it mainly marketing/storytelling? Place routes under a top-level path like `/regenerate`, `/about`, `/stay`, etc.
   - Is it functional (forms, preferences, profile)? Use more app-like top-level paths (e.g., `/profile`, `/subscribe`, `/stay/enquire`).

2. **Add the route under `src/app/`**
   - Create `src/app/<route>/page.tsx` for a new page.
   - If dynamic, create folders like `src/app/posts/[slug]/page.tsx`.
   - If the route has multiple visual components, keep the page component light and delegate layout to `src/components/sections/`.

3. **Create or reuse components**
   - Add page sections to `src/components/sections/`.
   - Reuse primitives from `@repo/ui` and wrappers in `src/components/ui/`.
   - Avoid duplicating patterns already present in `sections`, `forms`, or `ui`.

4. **Add hooks or utilities if needed**
   - Place new hooks in `src/hooks/` (e.g., `use-experiences-filter.ts`).
   - Place content or data helpers in `src/lib/` (e.g., `experiences.ts` for MDX loaders).

5. **Add tests**
   - For components, hooks, utilities, or route logic, add unit tests colocated with the source file (e.g., `Button.tsx` → `Button.test.tsx`).
   - For important user flows (e.g., subscription), add integration or smoke tests under `apps/site/__tests__/integration` or `apps/site/__tests__/smoke`.

6. **Update navigation and metadata**
   - If the route should be discoverable, update `apps/site/src/app/navigation.tsx` and any header components.
   - Add or update metadata helpers in `apps/site/src/lib/metadata/` or inline `export const metadata` as per current patterns.

7. **Update docs where relevant**
   - If you add or significantly change a user-visible feature, update:
     - `docs/product.md` (product implications).
     - `docs/tech.md` (if stack choices or integrations change).
     - `docs/structure.md` (if routing or organisational conventions change).

   - Mark new decisions or constraints with ✓ and any retired patterns with ✗.

## Worked Example: Adding a New “Experiences” Page

Goal: Add `/experiences` as a marketing page that introduces on-farm experiences (present or upcoming).

1. **Create the route**
   - File: `apps/site/src/app/experiences/page.tsx`

   Basic structure (sketch):

   ```tsx
   import { ExperiencesHero } from '@/components/sections/experiences-hero';
   import { ExperiencesList } from '@/components/sections/experiences-list';

   export default function ExperiencesPage() {
     return (
       <>
         <ExperiencesHero />
         <ExperiencesList />
       </>
     );
   }
   ```

2. **Add supporting components**
   - Files:
     - `apps/site/src/components/sections/experiences-hero.tsx`
     - `apps/site/src/components/sections/experiences-list.tsx`

   Use Tailwind classes and `@repo/ui` components to match existing visual language.

3. **Add content (optional but encouraged)**
   - If there is richer long-form content:
     - Add `apps/site/content/posts/20YYMMDD-experiences-at-carinya-parc.mdx`.
     - Use `getAllPosts` or similar utilities to surface it on `/experiences` and `/blog`.

4. **Wire navigation and metadata**
   - Update `apps/site/src/app/navigation.tsx` to include an `/experiences` link where appropriate.
   - Add a metadata helper for `/experiences` under `apps/site/src/lib/metadata/` if that pattern exists (or inline `export const metadata` on the page).

5. **Add tests**
   - `apps/site/src/app/experiences/page.test.tsx`:
     - Colocate unit test with the page file
     - Ensure the page renders key headings and content

   - Optional integration/smoke tests in `apps/site/__tests__/` if this is a critical path.

6. **Run checks**
   - From the monorepo root:

     ```bash
     pnpm lint
     pnpm test:unit
     pnpm test:smoke
     pnpm build
     ```

   - All checks should pass (✓) before merging or shipping.
