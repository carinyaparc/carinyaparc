# Specs

Design artefacts for open work, one folder per domain. GitHub issues
replace filesystem `TASKS.md` as the issue source: intake, Gherkin AC, and
assignment live on the issue. Issues may link here for design context.

```text
specs/{domain}/
├── SPEC.md     # Team / feature intent (agents only, for now)
└── tdd.md      # Technical design (from tdd skill)
```

Existing `TASKS.md` files are the current checklist. Cut them over to
issues (AGENTS-09) and delete them so the source is not split.

`agents/` also has a team design ([`SPEC.md`](agents/SPEC.md)) because the
work is a Cursor desk, not a site-app epic. Other domains keep TDD only.

| Domain               | Status     | Notes                                                     |
| -------------------- | ---------- | --------------------------------------------------------- |
| [`admin/`](admin/)   | Open       | Payload admin hardening                                   |
| [`agents/`](agents/) | Draft      | Site product-manager on Cursor Cloud                      |
| [`blog/`](blog/)     | Open (ops) | MailerLite welcomes + GA4 funnels; reader surface shipped |
| [`media/`](media/)   | Open       | Media library                                             |
| [`site/`](site/)     | Open       | Remaining site hardening                                  |

Canonical product/architecture docs stay under `docs/`. Slack `#site` is
standup, not intake.
