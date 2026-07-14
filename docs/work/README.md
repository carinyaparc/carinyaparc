# Work artefacts — conventions

Epic and sprint work lives under `docs/work/`. Canonical acceptance criteria are in
each epic's `tasks.md` — GitHub Issues link here; they do not duplicate Gherkin.

See [ADR-0002 work storage](https://github.com/carinyaparc/carinyaparc/blob/main/docs/architecture/decisions/ADR-0002-work-storage-and-tracking.md)
in the carinyaparc instance repo.

## Epic folder layout

```text
docs/work/{epic-slug}/
├── design.md          # Epic design (from design skill)
├── tasks.md           # Gherkin AC — source of truth for scope
└── verification.md    # Optional — validation notes
```

Epic slugs match rows in `docs/product/backlog.md`.

## Sprint folder layout

```text
docs/work/sprint-{nn}/
├── plan.md            # Sprint goal, committed tasks, squad assignments
└── retrospective.md   # Retro output (end of sprint)
```

Sprint numbers are zero-padded (`sprint-01`, `sprint-02`).

## Issue linkage

At sprint planning, create one GitHub Issue per committed task:

```markdown
Epic: docs/work/{epic-slug}/
Task: {TASK-ID}
AC: see tasks.md — do not paste Gherkin here
```

Title: `[{TASK-ID}] {short title}`. Labels: `squad:*` + `type:*`.

## Skill paths

| Skill       | Reads / writes                                 |
| ----------- | ---------------------------------------------- |
| `tasks`     | `docs/work/{epic}/tasks.md`                    |
| `design`    | `docs/work/{epic}/design.md`                   |
| `sprint`    | `docs/work/sprint-{id}/plan.md`, retrospective |
| `implement` | `design.md` + `tasks.md` for the task id       |
| `validate`  | `tasks.md` AC                                  |

## Ownership

Website engineering epics (Squads A/B/C) use this repo's `docs/work/`. Instance-wide
content calendar may live in `carinyaparc/docs/product/`. SEO keyword research uses
`docs/work/seo/`.
