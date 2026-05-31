# Carinya Parc Website

This repository contains the website for [Carinya Parc](https://carinyaparc.com.au) — a working rural property in New South Wales.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 4**
- **Payload CMS 3** with **PostgreSQL** for blog posts and recipes
- **MDX** for legal pages only
- **pnpm** + **Turborepo** monorepo, deployed on **Vercel**

See [`docs/structure.md`](docs/structure.md) for architecture details and [`AGENTS.md`](AGENTS.md) for agent and contributor guidance.

## Getting started

**Requirements:** Node `^24.10.0`, pnpm `10.26.0`, Docker (for local Postgres).

```bash
pnpm install
cp apps/site/.env.example apps/site/.env.local   # fill in secrets
docker compose -f apps/site/docker-compose.yml up -d
pnpm site:dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Payload admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Quality checks

From the repo root:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Documentation

| Document                                 | Purpose                        |
| ---------------------------------------- | ------------------------------ |
| [`docs/product.md`](docs/product.md)     | Product vision and scope       |
| [`docs/structure.md`](docs/structure.md) | Routes, folders, conventions, content stack |
| [`docs/migration.md`](docs/migration.md) | CMS migration plan and runbook |
| [`docs/backlog.md`](docs/backlog.md)     | Engineering backlog            |

## License

This project is available under the MIT license. It is freely available for any agricultural business to copy, modify, and deploy for their own farm website.
