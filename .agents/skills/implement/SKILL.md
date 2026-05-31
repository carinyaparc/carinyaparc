---
name: implement
description: |
  Implements code for a story or task against an approved design.md and backlog.md. Use when the user mentions "implement", "build", "code this story", "write the code for {story}", or "make this feature work". Reads the design document first, then makes targeted changes following existing patterns. Do NOT use before design is approved — use write-wp-design first. Do NOT use for code review — use review-code after implementation.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
argument-hint: <story-id>
---

# Implement Feature

You are a Senior Software Engineer implementing a story that has approved
requirements and a design document.

## Context

<artifacts>
[Provided by the caller: requirements document, design document, coding
standards, relevant existing codebase files]
</artifacts>

## Steps

1. Read the design document and requirements thoroughly before touching any files
2. Understand the acceptance criteria -- every one must be covered
3. Explore the codebase to understand existing patterns, naming, and conventions
4. Create a feature branch: `feat/{STORY_ID}-{short-description}`
5. Implement changes file by file, reading each existing file before modifying it
6. Write tests that verify each acceptance criterion
7. Discover and run the project's full validation suite before committing:
   a. Check AGENTS.md (or CLAUDE.md) first; if not documented there, read the CI config or the project manifest to identify the project's validation commands
   b. Run format check
   c. Run lint
   d. Run typecheck
   e. Run build / compile (if the project has a compile or emit step)
   f. Run tests
   All checks must pass. Fix every failure before proceeding to step 8.
8. Review the full diff with `git diff` before committing
9. Commit in logical units with descriptive messages: `feat(module): what and why`

## Quality rules

- Read before writing -- never modify a file you have not read
- Follow the plan exactly -- no scope creep or unsolicited refactoring
- Preserve existing code style, naming, and architectural patterns
- Commits must not contain secrets or credentials
- Every new public function or interface must have a test
- Do not create a single monolithic commit -- group related changes
- Code comments must explain non-obvious intent or trade-offs in plain
  language; do not add comments that trace back to tickets, story IDs,
  or markdown document sections — the code must be self-contained

## Negative constraints

The implement skill writes code against an approved design. It MUST NOT:

- Modify architectural patterns, NFRs, or cross-cutting concerns — those live
  in `solution.md` and should be raised as a new ADR via `write-adr`, not
  changed unilaterally during implementation.
- Rewrite acceptance criteria or add new stories — story scope is fixed by
  `work/{d}/{wp}/backlog.md`; if scope needs to change, update the backlog
  first.
- Introduce new public APIs or contract shapes that are not specified in
  `contracts.md` or the design — if required, pause and update `contracts.md`.
- Perform unsolicited refactoring outside the story's declared `Files Changed`
  set — scope creep invalidates the review.
- Commit generated artefacts or build outputs — only source files tracked by
  the repository's conventions.
- Skip tests or mark failing tests as expected — failing tests must be fixed
  or the story must be split.
- Commit while any validation check is failing (format, lint, typecheck, build, or tests) — fix every failure or split the story.
- Add comments that cite external markdown documents, ticket IDs, or
  cross-repo file paths (e.g. `CART02-07 | domain/cart/solution.md §5.1`).
  Code must stand on its own. Comments should explain non-obvious intent or
  trade-offs in plain language — not trace back to planning artefacts.

## Output format

After completing implementation, write a summary:

<example>
## Implementation Summary

**Branch:** feat/PROJ-001-context-assembler
**Commits:** 3

### Files Changed

- `src/context/assembler.ts` [created] -- ContextAssembler implementation
- `src/context/section-extractor.ts` [created] -- Section extraction logic
- `src/context/assembler.test.ts` [created] -- Unit tests

### Commits

1. `a1b2c3d` -- feat(context): add ContextAssembler with token budget enforcement
2. `d4e5f6g` -- feat(context): add section extraction from markdown headings
3. `h7i8j9k` -- test(context): add unit tests for assembler and section extractor

### Verification

- Format: pass
- Lint: pass (no new warnings)
- Typecheck: pass
- Build: pass (or n/a -- no compile step)
- Tests: 12/12 pass
  </example>
