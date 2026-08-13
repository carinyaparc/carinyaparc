# Specs

Delivery artefacts for open work, one folder per domain.

```text
specs/{domain}/
├── tdd.md      # Technical design (from tdd skill)
└── TASKS.md    # Gherkin AC — source of truth for scope
```

Task IDs use the domain prefix and are never reused: `ADMIN-01`, `BLOG-01`, `MEDIA-01`, `SITE-01`.

| Domain | Status | Notes |
| ------ | ------ | ----- |
| [`admin/`](admin/) | Open | Payload admin hardening |
| [`blog/`](blog/) | Open (ops) | MailerLite welcomes + GA4 funnels; reader surface shipped |
| [`media/`](media/) | Open | Media library |
| [`site/`](site/) | Open | Remaining site hardening |

Canonical product/architecture docs stay under `docs/`. GitHub issues should link here rather than duplicating Gherkin.
