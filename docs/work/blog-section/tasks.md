---
type: Tasks
epic: blog-section
epic_id: CP09
version: '0.1'
owner: blog
status: Draft
last_updated: 2026-07-04
related:
  - docs/product/backlog.md
  - docs/work/site-hardening/tasks.md
  - carinyaparc/squads/blog/charter.md
---

# Tasks — Blog section (CP09)

Squad B delivery epic. Canonical AC lives here; GitHub issues carry `squad:blog` + task id link only.

## 1. Summary

- **Epic.** CP09 — Blog section parity (archives, pagination, RSS)
- **Squad.** B — `squad:blog`
- **Estimate.** 13 points

## 2. Task checklist

### P1 — Archives and navigation

- [ ] **[CP09-01] Category archive routes**
  - **Priority:** P1 | **Estimate:** 5
  - **Deliverable:** `apps/site/src/app/(blog)/category/[slug]/page.tsx` lists published posts for category slug only.
  - **Acceptance:**
    ```gherkin
    Scenario: Category archive shows published posts only
      Given a category with published and draft posts
      When /blog/category/{slug}/ is requested
      Then only published posts appear
      And draft posts never appear
    ```

- [ ] **[CP09-02] Tag archive routes (optional)**
  - **Priority:** P2 | **Estimate:** 3
  - **Deliverable:** `/blog/tag/[tag]/` listing page or defer with documented reason in sprint retro.

### P1 — Pagination and feeds

- [ ] **[CP09-03] Blog index pagination**
  - **Priority:** P1 | **Estimate:** 3
  - **Deliverable:** Paginated blog index with stable URLs; aligns with existing partial implementation in site-hardening §2.
  - **Acceptance:**
    ```gherkin
    Scenario: Page 2 shows the next set of posts
      Given more than one page of published posts
      When /blog/page/2/ is requested
      Then the next page of posts renders with correct prev/next links
    ```

- [ ] **[CP09-04] RSS and robots linkage**
  - **Priority:** P1 | **Estimate:** 2
  - **Deliverable:** RSS feed validates; `app/robots.ts` references sitemap and feed (coordinate SH-14 if open).

## 3. Overlap with site-hardening

SH-19 (category archives) and RSS/pagination items marked verified in SH §2 — confirm in sprint planning before re-implementing. Close SH-19 when CP09-01 ships.
