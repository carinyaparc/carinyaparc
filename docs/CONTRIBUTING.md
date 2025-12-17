# Contributing to Carinya Parc

Thanks for your interest in contributing to the Carinya Parc project.

This document explains how to set up the project locally, the expectations for changes, and how to keep code, tests and documentation in sync. It applies to both human contributors and AI agents working in the repository.

---

## 1. Project overview

Carinya Parc is a Next.js v16 App Router website for a working regenerative farm in NSW.

Key points:

- Monorepo managed with **pnpm** and **Turborepo**.
- Primary app is **`apps/site`**, a Next.js v16 App Router app written in **TypeScript**.
- Shared packages live in `packages/` (e.g. `ui`, `eslint-config`, `tailwind-config`, `typescript-config`).
- Long-lived documentation lives in `docs/`.

Before you contribute, it’s worth skimming:

- `docs/product.md` – what the product is and who it’s for.
- `docs/tech.md` – stack, tools, and constraints.
- `docs/structure.md` – how the repo and app are organised.
- `docs/agents.md` – commands, checks and conventions (especially for AI agents).

---

## 2. Getting started

### Prerequisites

- **Node.js**: `>= 22.17.0`
- **pnpm**: `>= 9` (preferred package manager)

Install pnpm if you don't already have it:

```bash
npm install -g pnpm
```

### Clone and install

```bash
git clone <REPO_URL> carinya-parc
cd carinya-parc
pnpm install
```

### Environment setup

The site requires environment variables for Sanity CMS integration. Follow these steps to configure your local environment:

1. **Copy the example environment file:**

   ```bash
   cp apps/site/.env.example apps/site/.env.local
   ```

2. **Obtain Sanity credentials:**
   - Navigate to [Sanity Dashboard](https://sanity.io/manage)
   - Select the Carinya Parc project
   - Go to **API** → **Tokens**
   - Create or obtain the required API tokens (see below)

3. **Configure required variables in `.env.local`:**

   | Variable                        | Description                                  | Where to get it                     |
   | ------------------------------- | -------------------------------------------- | ----------------------------------- |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project identifier                    | Sanity Dashboard → Project Settings |
   | `NEXT_PUBLIC_SANITY_DATASET`    | Dataset name (`development` or `production`) | Use `development` for local work    |
   | `SANITY_API_READ_TOKEN`         | API token with Viewer permissions            | Sanity Dashboard → API → Tokens     |
   | `SANITY_API_WRITE_TOKEN`        | API token with Editor permissions (optional) | Sanity Dashboard → API → Tokens     |

4. **Create API tokens in Sanity (if needed):**

   **Read Token (Viewer role):**
   - Name: `Carinya Parc Site - Read Token (Development)`
   - Permissions: **Viewer** (read-only)
   - Click "Add API Token"

   **Write Token (Editor role) - Optional:**
   - Name: `Carinya Parc Site - Write Token (Development)`
   - Permissions: **Editor** (read/write)
   - Click "Add API Token"

5. **Verify configuration:**

   Your `.env.local` file should look like:

   ```bash
   NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
   NEXT_PUBLIC_SANITY_DATASET=development
   SANITY_API_READ_TOKEN=skYourActualReadTokenHere
   SANITY_API_WRITE_TOKEN=skYourActualWriteTokenHere
   ```

**Security note:** Never commit `.env.local` to version control. This file contains sensitive API tokens and is excluded via `.gitignore`.

### Run the site locally

From the repo root:

```bash
pnpm dev
```

Or, targeting the site app directly:

```bash
pnpm site:dev
# or
cd apps/site
pnpm dev
```

Visit the local URL printed in the terminal (typically `http://localhost:3000`).

---

## 3. Ways to contribute

You can contribute in several ways:

- **Bug fixes** – fixing broken behaviour, layout issues, accessibility problems.
- **Features** – adding new pages or flows that align with the product vision (e.g. “experiences”, “stay”).
- **Refactors** – improving structure, naming, or reuse without changing behaviour.
- **Documentation** – improving or extending docs in `docs/` or inline code comments.
- **Tests** – adding or strengthening unit, integration, smoke or security tests.

If you’re unsure whether an idea fits, open a lightweight issue or discussion first and reference the relevant doc (usually `docs/product.md`).

---

## 4. Branching & workflow

If you’re using Git branches and pull requests:

1. Create a branch from `main`:

   ```bash
   git checkout -b feature/short-description
   ```

2. Make your changes in small, focused commits.

3. Run the checks described below.

4. Open a pull request with:
   - A clear title.
   - A short description of what changed and why.
   - Notes on any follow-up work or limitations.

Try to keep PRs reasonably small and focused on a single change or feature.

---

## 5. Code style & architecture

### Language and framework

- Use **TypeScript** for all application and library code (`.ts`, `.tsx`).
- Use **React function components** only.
- Prefer **server components** by default; opt into `"use client"` only when necessary.

### Project structure

- Routes live under `apps/site/src/app/` (Next.js App Router).
- Shared components live under `apps/site/src/components/`.
- Hooks live under `apps/site/src/hooks/`.
- Utilities and data helpers live under `apps/site/src/lib/` and `apps/site/src/utils/`.
- Long-form content is in MDX under `apps/site/content/`.

For more detail, see `docs/structure.md`.

### Imports & aliases

Use the configured aliases instead of long relative paths:

- `@/app/...`
- `@/components/...`
- `@/hooks/...`
- `@/lib/...`
- `@/styles/...`
- `@/utils/...`
- `@repo/ui/...` for shared UI components.

Example:

```ts
import { RegenerateSection } from '@/components/sections/regenerate-section';
import { getAllPosts } from '@/lib/posts';
```

### Styling

- Prefer **Tailwind CSS** utilities and shared UI components from `@repo/ui`.
- Keep Tailwind usage consistent with the existing patterns (spacing, typography, colours).
- Use CSS modules or global styles in `src/styles/` only when necessary.

### Comments and naming

- Name components in **PascalCase** (`HeroSection`, `SubscribeForm`).
- Name hooks starting with `use` (`useMobile`, `useToast`).
- Focus comments on **why** something is done, not what the code obviously does.

---

## 6. Tests & quality checks

Before opening a PR or considering work “done”, please run:

From the repo root:

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:smoke   # for changes touching routes, navigation, or key flows
```

For more extensive changes, also run:

```bash
pnpm test
# or
pnpm test:ci
```

From `apps/site` you can also run:

```bash
cd apps/site
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:smoke
pnpm test:coverage
```

### Where to put tests

- **Unit tests**: `apps/site/__tests__/unit/` mirroring `src/app`, `src/lib`, `src/hooks`, etc.
- **Integration tests**: `apps/site/__tests__/integration/`.
- **Smoke tests**: `apps/site/__tests__/smoke/`.
- **Security tests**: `apps/site/__tests__/security/`.

If you add new logic or a new route, please add or update tests to cover it.

---

## 7. Documentation expectations

Whenever you make a meaningful change, ask:

> Does this affect the product, the architecture, or how contributors should behave?

If yes, then update:

- **`docs/product.md`** – when user-facing features, flows or objectives change.
- **`docs/tech.md`** – when the stack, tooling, hosting or key integrations change.
- **`docs/structure.md`** – when routing, directory layout, or conventions change.
- **`docs/agents.md`** – when commands, checks or contribution expectations change.

For new feature areas (e.g. workshops, events, bookings), consider adding a separate doc in `docs/` and linking it from `docs/README.md`.

Treat mismatches between code and docs as a bug to fix.

---

## 8. Larger changes & ADRs

For larger or risky changes (for example):

- Introducing a database or new data store.
- Changing hosting platform or runtime assumptions.
- Adding a major dependency that affects many parts of the app.
- Changing global design system or styling approach.

Please:

1. Write an **Architecture Decision Record (ADR)** under `docs/adr/` (e.g. `docs/adr/0001-use-vercel-for-hosting.md`).
2. Update `docs/tech.md` and `docs/structure.md` as needed.
3. Reference the ADR in your PR description.

This keeps decisions traceable and easier to revisit later.

---

## 9. Security & privacy

- Do **not** commit secrets or environment variable files containing secrets.
- Environment variables should be configured via:
  - `.env.local` for local development (ignored by Git).
  - Hosting platform configuration for deployed environments.

- Be mindful of personal data (primarily email addresses for subscriptions) and follow the behaviour described in the legal MDX content under `apps/site/content/legal/`.

If you discover a security concern, flag it clearly (e.g. in an issue or PR) and avoid sharing sensitive details in public logs.

---

## 10. Commit messages

Use clear, descriptive commit messages that explain what changed. For example:

- `Add experiences page and hero section`
- `Fix layout shift on home page hero`
- `Refactor blog post loader to use shared MDX helper`
- `Update tech docs for Node 22`

Conventional Commit style (`feat: …`, `fix: …`, etc.) is welcome but not mandatory; clarity is more important than strict formatting.

---

## 11. Questions & support

If you’re unsure about:

- Where to put something,
- Whether a feature aligns with the product,
- How to structure a route or component,

refer back to the docs in `docs/` first. If it’s still unclear, raise a question in the issue, PR, or project chat with a link to the part of the code or doc you’re looking at.

Thanks again for contributing to Carinya Parc.
