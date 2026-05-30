# Recommendation: Carinya Parc website

**Migrate to Payload CMS on the current repo structure. Do not flatten the monorepo first. After Payload is live and Sanity is gone, collapse `@repo/ui` into the app and flatten to a single Next.js repo.**

---

## Why

Carinya Parc is a real multi-page product site (blog, recipes, contact, legal, tests, CI). Unlike daddia, the monorepo isn’t accidental — `@repo/ui` is actively used and the tooling packages are thin Turbo scaffolding, not substantial shared infrastructure.

The real duplication today is **three content layers**: MDX in git (what pages actually use), Sanity (built but not wired to production routes), and the planned Payload CMS. That’s the problem worth solving — not repo shape.

Flattening first would mean two large refactors back-to-back (repo surgery, then CMS migration) with little benefit. Payload works fine inside `apps/site`.

---

## Plan

**Phase 1 — Payload migration (keep monorepo as-is)**  
- Add Payload to `apps/site` using the standard embedded Next.js pattern.  
- Migrate blog and recipes from MDX to Payload collections.  
- Keep legal as MDX unless you want one CMS for everything.  
- Remove Sanity, its studio route, env vars, CSP rules, and related tests once Payload replaces it.  
- Update `docs/tech.md` to reflect Payload + database.

**Phase 2 — Consolidate the repo (after Payload is stable)**  
- Move `packages/ui` into the app (e.g. `src/components/ui`).  
- Inline `@repo/eslint-config`, `@repo/typescript-config`, and `@repo/tailwind-config` as normal root config files.  
- Promote `apps/site` to repo root.  
- Remove Turbo, pnpm workspaces, and the `packages/` folder.  
- Point Vercel at the flat root.

---

## What not to do

- Don’t stack Payload on top of Sanity and MDX long term.  
- Don’t keep the monorepo after UI is inlined — tooling alone doesn’t justify it.

---

## Success criteria

One deployable Next.js app with Payload as the content source for blog/recipes, no Sanity, minimal repo overhead, and tests/CI still passing throughout.