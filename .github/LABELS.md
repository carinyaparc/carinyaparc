# GitHub labels — squad and type

Create these labels on `carinyaparc/website` (and linked repos as squads expand).
Run once via GitHub UI or:

```bash
gh label create "squad:site" --color "1D76DB" --description "Squad A — Site platform"
gh label create "squad:blog" --color "5319E7" --description "Squad B — Blog engineering"
gh label create "squad:recipes" --color "B60205" --description "Squad C — Recipes engineering"
gh label create "squad:content" --color "FBCA04" --description "Squad D — Content"
gh label create "squad:seo" --color "0E8A16" --description "Squad E — SEO"
gh label create "type:feature" --color "A2EEEF" --description "New capability"
gh label create "type:maintenance" --color "C5DEF5" --description "Maintenance / hygiene"
gh label create "type:defect" --color "D93F0B" --description "Bug or regression"
gh label create "type:seo-recommendation" --color "FEF2C0" --description "SEO audit finding"
```

Org Project **Carinya Parc Delivery** uses custom **Squad** field values: `site`, `blog`,
`recipes`, `content`, `seo`.
