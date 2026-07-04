---
type: Tasks
epic: recipes-section
epic_id: CP10
version: '0.1'
owner: recipes
status: Draft
last_updated: 2026-07-04
related:
  - docs/product/backlog.md
  - docs/work/site-hardening/tasks.md
  - carinyaparc/squads/recipes/charter.md
---

# Tasks — Recipes section (CP10)

Squad C delivery epic. Canonical AC lives here; GitHub issues carry `squad:recipes` + task id link only.

## 1. Summary

- **Epic.** CP10 — Recipes section (index, filtering, structured data)
- **Squad.** C — `squad:recipes`
- **Estimate.** 13 points

## 2. Task checklist

### P1 — Navigation and index

- [ ] **[CP10-01] Recipes navigation link**
  - **Priority:** P1 | **Estimate:** 2
  - **Deliverable:** `navigation.tsx` Cook item `href: '/recipes'` with `visible: true`.
  - **Acceptance:**
    ```gherkin
    Scenario: Header links to recipes index
      When the public site header renders
      Then a visible link targets /recipes
    ```
  - **Note:** Overlaps SH-18 — close SH-18 when this ships.

- [ ] **[CP10-02] Recipe index filtering**
  - **Priority:** P1 | **Estimate:** 5
  - **Deliverable:** Filter UI or query params for seasonality/difficulty backed by Payload fields.

### P1 — Structured data and resilience

- [ ] **[CP10-03] Recipe JSON-LD completeness**
  - **Priority:** P1 | **Estimate:** 3
  - **Deliverable:** `recipes/[slug]/page.tsx` JSON-LD includes ingredient list and image when populated (SH-09 overlap).

- [ ] **[CP10-04] Recipes error boundary**
  - **Priority:** P1 | **Estimate:** 3
  - **Deliverable:** `apps/site/src/app/(recipes)/error.tsx` matching blog/www pattern (SH-10 overlap).

## 3. Overlap with site-hardening

SH-18, SH-09, SH-10 — dedupe during weekly planning; do not double-count story points.
