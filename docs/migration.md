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

---

## PLD05 — MDX → Payload migration runbook

**Command (from `apps/site`, `NEON_DATABASE_URL` in `.env.local`, Postgres reachable):**

```bash
pnpm migrate:mdx
```

**What it does**

- Reads all MDX files from `content/posts/` (8) and `content/recipes/` (3).
- Upserts Payload `posts` and `recipes` by slug (safe to re-run).
- Preserves slugs, dates, metadata, tags, hero image paths (`/images/...`), and body content.
- Blog bodies convert to Lexical rich text; recipe instructions parse from numbered steps in MDX.
- Creates missing `authors` and `tags` as needed. All migrated content is published.

**Slug map (must match live URLs)**

| Type   | Slug                                               | URL                                                       |
| ------ | -------------------------------------------------- | --------------------------------------------------------- |
| Post   | `masterchef-to-mud-boots`                          | `/blog/masterchef-to-mud-boots/`                          |
| Post   | `restoring-42-ha-land`                             | `/blog/restoring-42-ha-land/`                             |
| Post   | `lessons-from-failure`                             | `/blog/lessons-from-failure/`                             |
| Post   | `designing-polyculture-systems`                    | `/blog/designing-polyculture-systems/`                    |
| Post   | `seasonal-soil-care-winter-composting-cover-crops` | `/blog/seasonal-soil-care-winter-composting-cover-crops/` |
| Post   | `creating-food-forest-complete-guide`              | `/blog/creating-food-forest-complete-guide/`              |
| Post   | `seven-layer-forest-design-guide`                  | `/blog/seven-layer-forest-design-guide/`                  |
| Post   | `hugelkulture-benefits-complete-guide`             | `/blog/hugelkulture-benefits-complete-guide/`             |
| Recipe | `slow-roasted-dexter-beef-with-root-vegetables`    | `/recipes/slow-roasted-dexter-beef-with-root-vegetables/` |
| Recipe | `rustic-farm-style-flatbread`                      | `/recipes/rustic-farm-style-flatbread/`                   |
| Recipe | `herbed-omlette-with-native-greens`                | `/recipes/herbed-omlette-with-native-greens/`             |

Canonical slug lists live in `apps/site/src/lib/mdx/slugs.ts` and are verified at migration time.

**Rollback**

- Frontend reads blog posts and recipes from Payload (PLD06). MDX source files remain in `content/` for reference until explicitly removed.
- To remove Payload copies: delete migrated documents in `/admin` or truncate `posts` / `recipes` tables in Postgres.
- Re-run `pnpm migrate:mdx` after editing MDX to refresh Payload content.
- MDX source files in `content/` are unchanged by the migration; they remain as reference copies now that PLD06 reads from Payload.

**Images**

Hero images stay as public paths (e.g. `/images/farm-track-gate.jpg`). No Payload media upload in this phase.
