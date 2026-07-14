# Technical SEO audit — 2026-07-04

**Auditor:** seo-specialist  
**Production URL:** https://carinyaparc.com.au  
**Method:** Live fetch (robots.txt, page metadata review) + repo inspection

## Executive summary

Site is indexable with sensible robots rules and sitemap declaration. Primary gaps are
**Open Graph images** on blog/recipe pages, **recipes index discoverability** in sitemap,
and **CP04 SEO metadata epic** work still in backlog. Findings filed as GitHub issues #88 and #89.

## Findings summary

| ID     | Priority | Finding                                                                 | Owning squad               | Issue |
| ------ | -------- | ----------------------------------------------------------------------- | -------------------------- | ----- |
| SEO-01 | P2       | Recipe/blog OG tags missing `og:image` when hero image set              | squad:blog / squad:recipes | #88   |
| SEO-02 | P2       | Confirm all published posts/recipes appear in `/sitemap.xml`            | squad:site                 | #89   |
| SEO-03 | P3       | Recipe list page metadata — verify unique title/description vs homepage | squad:recipes              | —     |
| SEO-04 | P3       | Add absolute URLs for social preview images                             | squad:site                 | —     |

## Detailed findings

### SEO-01 — Missing Open Graph images on content pages

**Evidence:** `apps/site/src/app/(blog)/blog/[slug]/page.tsx` and
`apps/site/src/app/(recipes)/recipes/[slug]/page.tsx` set `openGraph.title` and
`openGraph.description` but do not pass `openGraph.images` from the `image` field.

**Impact:** Social shares fall back to generic previews; lower click-through from social links.

**Recommended fix:** Map Payload `image` (public path) to absolute URL in `generateMetadata`.

### SEO-02 — Sitemap coverage for CMS content

**Evidence:** Sitemap generation in `apps/site/src/app/sitemap.ts` includes posts via
`getCachedPostSlugsForSitemap`. Recipe routes should be verified similarly after new
recipe publishes.

**Recommended fix:** Audit sitemap.ts includes recipes index + all published recipe slugs;
add test asserting sitemap entries for seeded slugs post-publish.

### SEO-03 — Recipes index metadata differentiation

**Evidence:** Recipes index uses `generatePageMetadata` in
`apps/site/src/app/(recipes)/recipes/page.tsx`.

**Recommended fix:** Unique title/description targeting recipe hub queries.

### SEO-04 — Absolute OG image URLs

**Recommended fix:** Centralise `toAbsoluteUrl(path)` in metadata helpers.

## Passed checks

- `robots.txt` allows public content; disallows `/api/`, `/_next/data/`, `/profile/`
- Sitemap URL declared in robots.txt
- Canonical URLs set on blog and recipe detail pages
- Recipe JSON-LD via `SchemaMarkup` on recipe detail pages
- Organization schema in site shell

## Squad A/B/C — top 2 fixes for next sprint

1. **SEO-01** — Add OG images to blog and recipe `generateMetadata` (Squads B + C) — #88
2. **SEO-02** — Sitemap coverage audit + test (Squad A) — #89

## Next audit

Fortnightly cadence per Squad E charter. Re-run after first Squad D content publishes.
