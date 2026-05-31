---
type: Backlog
scope: <!-- domain | work-package -->
version: '0.1'
owner: <!-- team or squad name -->
status: Draft
last_updated: <!-- YYYY-MM-DD -->
related:
  - <!-- product.md -->
  - <!-- solution.md -->
  - <!-- roadmap.md -->
---

<!--
DRAFTING AIDE — DELETE THIS BLOCK BEFORE SAVING THE OUTPUT FILE.
DO NOT INCLUDE in backlog.md:
  - Architecture patterns, module boundaries, or technical rationale → solution.md
  - Business strategy, positioning, or target users                  → product.md
  - Phase dates, milestones, or delivery sequencing prose            → roadmap.md
  - API shapes, schemas, type aliases, or code fences                → contracts.md
  - Implementation detail for the active epic                        → design.md

Domain scope: §3 is an epic breakdown table; §4 contains epic detail entries.
Work-package scope: §3 is a story list with EARS + Gherkin AC; §4 is traceability.
-->

# Backlog -- {Name}

<!-- Domain scope: {Name} domain-level epic backlog.
     Work-package scope: story-level backlog for the {Epic-ID} work package. -->

- **Product:** [`product.md`](product.md)
- **Solution:** [`solution.md`](solution.md)
- **Phases and gates:** [`roadmap.md`](roadmap.md)

## 1. Summary

**Objective.** <!-- What does this backlog deliver and why? Reference the product strategy. -->

**Delivery approach.** <!-- Staged increments? Wave delivery? Walk before run. -->

**Prerequisites (complete).**

- <!-- what is already in place -->

**Prerequisites (required before core work ships).**

- <!-- what must be resolved before the first epic or story can complete -->

**Out of scope.** The canonical list of no-gos lives in [`product.md`](product.md) §5.
Phase-gated deferrals live in [`roadmap.md`](roadmap.md) §Later.

## 2. Conventions

| Convention        | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Epic ID           | `{PREFIX}{nn}` (e.g. `{PREFIX}01`)                            |
| Story ID          | `{PREFIX}{nn}-{nn}` (lives in the work-package backlog)        |
| Status            | Not started, In progress, In review, Done, Blocked             |
| Priority          | P0 (must have), P1 (should have), P2 (stretch), P3 (defer)    |
| Estimation        | Fibonacci story points (1, 2, 3, 5, 8, 13)                    |
| Acceptance format | EARS + Gherkin at work-package scope                           |

## 3. {Scope-dependent content}

<!--
DOMAIN SCOPE — epic breakdown table:

| Epic      | Title              | Phase | Priority | Deps      | Points | Work package    | Status      |
| --------- | ------------------ | ----- | -------- | --------- | ------ | --------------- | ----------- |
| {PRE}01   | {Now-phase title}  | Now   | P0       | -         | TBD    | `01-{slug}/`    | Not started |
| {PRE}02   | {Now-phase title}  | Now   | P0       | {PRE}01   | TBD    | `02-{slug}/`    | Not started |
| {PRE}03   | {Next-phase title} | Next  | P1       | {PRE}02   | TBD    | `03-{slug}/` (planned) | Not started |

WORK-PACKAGE SCOPE — story list (canonical schema):

- [ ] **[{EPIC-ID}-01] {Story title}**
  - **Status:** Not started | **Priority:** P0 | **Estimate:** 3
  - **Epic:** {EPIC-ID} | **Labels:** phase:{phase}, domain:{d}, type:{type}
  - **Depends on:** -
  - **Deliverable:** <!-- one paragraph: what exists when this story is done -->
  - **Design:** [`./design.md#{section}`](design.md#{section})
  - **Acceptance (EARS):**
    - WHEN <!-- trigger -->, THE SYSTEM SHALL <!-- behaviour -->.
    - THE SYSTEM SHALL <!-- behaviour -->.
  - **Acceptance (Gherkin):**

    ```gherkin
    Scenario: <!-- scenario title -->
      Given <!-- precondition -->
      When <!-- action -->
      Then <!-- outcome -->
    ```
-->

## 4. {Scope-dependent detail}

<!--
DOMAIN SCOPE — epic detail entries (one per Now-phase epic):

### {PRE}01 -- {Title}

**Scope.** <!-- What this epic delivers in one paragraph. -->
**Key deliverables.** <!-- comma-separated list -->
**Dependencies.** None (prerequisites satisfied).
**Status.** Not started. **Work package:** `01-{slug}/` (planned).

---

WORK-PACKAGE SCOPE — traceability:

### Stories to solution sections

| Story        | solution.md section       |
| ------------ | ------------------------- |
| {EPIC-ID}-01 | §N.M <!-- section title --> |

### Definition of Done

A story in this backlog is done when:

- [ ] All EARS statements hold and every Gherkin scenario passes.
- [ ] Tests pass locally and in CI; coverage on new files >= 80%.
- [ ] Lint and typecheck pass with no new warnings.
- [ ] Code review approved by at least one squad engineer.
- [ ] PR merged into main.
-->

## 5. Dependency graph

```text
{PRE}01 (foundation)
  +-- {PRE}02
        +-- {PRE}03
```

## 6. Risks

| ID  | Risk                  | Likelihood | Impact | Mitigation          |
| --- | --------------------- | ---------- | ------ | ------------------- |
| R1  | <!-- delivery risk --> | Medium    | Medium | <!-- mitigation --> |

Technical and architecture risks are authoritative in [`solution.md`](solution.md) §10.1
and are not duplicated here.
