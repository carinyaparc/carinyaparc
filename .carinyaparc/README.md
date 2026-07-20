# Carinya Parc target pointer

Minimal link from the **website** repo to the Carinya Parc instance.

## Pointer

[`target.json`](target.json):

```json
{ "instance": "carinyaparc", "target": "website" }
```

## Config source of truth

All instance wiring lives in **`carinyaparc/carinyaparc`**:

| What                   | Where                                                       |
| ---------------------- | ----------------------------------------------------------- |
| Instance config        | `config/instance.json`                                      |
| Website artefact paths | `config/targets/website.json`                               |
| Plugin set             | `config/plugins.json` → `carinyaparc/.claude/settings.json` |
| Brand                  | `brand/`                                                    |
| Squad charters         | `squads/`                                                   |

## Workspace contract (this repo)

| Doc         | Path                            |
| ----------- | ------------------------------- |
| Product     | `docs/product/product.md`       |
| Backlog     | `docs/product/backlog.md`       |
| Roadmap     | `docs/product/roadmap.md`       |
| Solution    | `docs/architecture/solution.md` |
| Epic tasks  | `docs/work/{epic}/tasks.md`     |
| Sprint plan | `docs/work/sprint-{id}/plan.md` |

Brand resolves from `carinyaparc/brand/` — not `docs/brand/` here.

## Plugins

Install practice plugins from **[carinyaparc/digital-agency-plugins](https://github.com/carinyaparc/digital-agency-plugins)**
via Cursor Settings → Plugins (or the project `.claude/settings.json` marketplace entry).
Enable agents via `carinyaparc/config/plugins.json` when working from the instance repo
or multi-root workspace.
