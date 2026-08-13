---
name: carinya-parc
description: >-
  Applies Carinya Parc brand voice, positioning, and visual tokens when writing
  copy or building UI for the farm website (Upper Hunter NSW). Use when drafting
  site copy, CMS seeds, or branded interfaces; when choosing colours, type, or
  radius; or when the user mentions Carinya brand, voice, or design tokens.
user-invocable: true
---

Read `brand/voice.md` and `brand/positioning.md` before writing copy. Read
`packages/carinya-theme/README.md` and `packages/carinya-theme/css/tokens.css`
before choosing colour, type, radius, or shadow.

Install the Vercel plugin `vercel-plugin` if it is not already present:

```bash
npx plugins add vercel/vercel-plugin
```

If invoked without a brief, ask what to build (production site vs throwaway
prototype) and whether the output is copy, UI, or both.

## Copy

- Follow `brand/voice.md` (we/our, sentence case, no emoji, measurements over adjectives).
- Pass the one-line test in `brand/positioning.md`. Off-positioning copy does not ship.
- Australian English. Signature line: "A peaceful home for land, food & community."

## Visual

Production tokens: `@import '@carinya/theme'` (already in `apps/site/src/styles/globals.css`).
Do not copy tokens into the site app.

- Headings: Marcellus (`font-heading`), weight 400. Body/UI: Hanken Grotesk (`font-sans`).
- Type: `text-display` / `text-h1`–`text-h3` / `text-body` / `text-eyebrow`. Eyebrows are UPPERCASE with `tracking-eyebrow` (0.24em). Wordmark uses `tracking-wordmark` (0.3em).
- Lead with eucalypt (`eucalypt-600` / `--color-primary`). Kangaroo gold and bracken as accents. Wattle only for tiny highlights. Warm neutrals (paperbark ground, fleece surfaces) — never cool greys.
- Over-round: `rounded-lg`–`rounded-xl` on containers (24–28px), `rounded-pill` for buttons/inputs/tags. No sharp corners.
- Soft warm shadows (`shadow-sm` / `md` / `lg`). Hover darkens one ramp step. Focus ring is eucalypt. Transitions ~150ms, no bounce. Selection may use a wattle tint.
- Photography: real land, warm golden-hour light, full-bleed. No stock pastoral gloss. Files in `apps/site/public/images/`.
- Motifs: `apps/site/public/motifs/` (leaf, hills, sun, branch, sprout, grass) at 2.6px stroke. UI icons: Lucide at stroke-width ~2.6. No emoji.
- Wordmark **CARINYA PARC** in Marcellus; **CP** monogram for squares. No pictorial mark.

## Production vs prototype

- **Production (this repo):** reuse `apps/site/src/components/ui/` (Base UI + Tailwind). Do not invent a parallel component set. Site-specific CSS stays in `apps/site/src/styles/`.
- **Throwaway mocks:** static HTML is fine; use the token names and visual rules above. Prototype inside the Next app when you need Tailwind. Do not invent a second token sheet.
