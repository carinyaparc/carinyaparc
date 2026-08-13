---
name: carinya-parc
description: >-
  Applies Carinya Parc brand voice, positioning, and visual tokens when writing
  copy or building UI for the farm website (Upper Hunter NSW). Use when drafting
  site copy, CMS seeds, or branded interfaces; when choosing colours, type, or
  radius; or when the user mentions Carinya brand, voice, or design tokens.
---

Read `brand/voice.md` and `brand/positioning.md` before writing copy. Read
`packages/carinya-theme/README.md` and `packages/carinya-theme/css/tokens.css`
before choosing colour, type, radius, or shadow.

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
- Lead with eucalypt (`eucalypt-600` / `--color-primary`). Kangaroo gold and bracken as accents. Wattle only for tiny highlights. Warm neutrals (paperbark ground, fleece surfaces) — never cool greys.
- Over-round: large container radii, `rounded-pill` for buttons/inputs/tags. No sharp corners.
- Soft warm shadows. Hover darkens one ramp step. Focus ring is eucalypt.
- Photography: real land, warm golden-hour light, full-bleed. No stock pastoral gloss.
- UI icons: Lucide at stroke-width ~2.6. No emoji. Wordmark **CARINYA PARC** in Marcellus; **CP** monogram for squares. No pictorial mark.

## Production vs prototype

- **Production (this repo):** reuse `apps/site/src/components/ui/` (Base UI + Tailwind). Do not invent a parallel component set. Site-specific CSS stays in `apps/site/src/styles/`.
- **Throwaway mocks:** static HTML is fine; still use token names and the visual rules above. Do not treat design-system JSX as a production import.

HTML brand decks and specimen cards live in the sibling `design-system` repo (studio only). They are not the token or voice source of truth.
