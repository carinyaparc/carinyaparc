# Architecture Guiding Principles

Engineering rules for the Carinya Parc website.

| Doc                                           | Role                            |
| --------------------------------------------- | ------------------------------- |
| [`product/product.md`](../product/product.md) | What and why                    |
| [`product/roadmap.md`](../product/roadmap.md) | When                            |
| [`solution.md`](solution.md)                  | How — architecture; debt in §10 |
| [`structure.md`](structure.md)                | Where — routes and folders      |

1. **Separation of Concerns:** Modules **SHALL** adhere to the single‑responsibility principle. UI components **SHALL NOT** contain side‑effects such as data fetching or business logic.

2. **Reusability:** Shared logic and UI elements **MUST** reside in dedicated folders (`components/`, `hooks/`, `lib/`) to avoid duplication and encourage reuse.

3. **Maintainability:** File‑based routing conventions **MUST** be followed. Each route folder **SHALL** include at least a `page.tsx`, and **SHOULD** include a `layout.tsx` (where required) for consistent nested layouts.

4. **Simplicity:** `page.tsx` files **MUST** be as simple as possible, containing only routing and data‑loading logic. Complex UI or formatting **SHOULD** be delegated to child components in `components/`.

5. **Server Components:** Data‑fetching logic **SHOULD** reside in server components (no `"use client"`). Client components **MAY** receive pre‑fetched data via props but **MUST NOT** perform server‑side data fetching.

6. **Client Components:** Any component using browser‑only APIs or React state **SHALL** include the `"use client"` directive. Client components **SHALL NOT** access server‑only modules (e.g. database clients).

7. **Type Safety:** TypeScript strict mode is **REQUIRED**. Global/shared types **MUST** live under `types/` (or adjacent to related modules). Use of `any` **SHOULD NOT** be permitted.

8. **Testing:** Automated tests are **REQUIRED** for non-trivial logic. Test suites **SHOULD** be colocated with source as `*.test.ts` / `*.test.tsx` under `src/` (API routes, validation, Payload helpers, schema generators).

9. **Styling:** Global CSS or Tailwind imports **SHALL** live in `styles/`. Component‑level styles **MAY** use CSS modules or utility classes. All dynamic class merging **MUST** use a central util (e.g. `cn()`).

10. **Performance Optimisation:** Large or rarely used dependencies **SHOULD** be loaded via dynamic imports. Pure components **MAY** be memoised (e.g. `React.memo`) to minimise unnecessary re‑renders.

11. **Metadata Generation:** SEO metadata **SHALL** be generated via multiple small functions (e.g. `generateTitle()`, `generateOpenGraph()`) in `lib/metadata/`. A central `generateMetadata()` orchestrator **MUST** compose and return the unified `Metadata`.

12. **Structured Data (JSON‑LD):** Schema generation **SHALL** use discrete functions per type (Organization, Breadcrumb, Article, Recipe, etc.) in `lib/schema/`. A top‑level `generateJsonLd()` **MUST** assemble the final `@graph` based on page type.

13. **Environment Configuration:** Environment variables **MUST** be validated at build time. Variables exposed to the client **MUST** be prefixed with `NEXT_PUBLIC_` and **SHALL NOT** include secrets.

14. **Accessibility:** Pages and components **SHOULD** use semantic HTML and ARIA roles. All images **MUST** have meaningful `alt` text and interactive elements **MUST** be keyboard‑navigable.
