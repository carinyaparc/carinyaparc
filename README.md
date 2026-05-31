# Carinya Parc Website

This repository contains the website for [Carinya Parc](https://carinyaparc.com.au) — a working rural property in New South Wales.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 4**
- **Payload CMS 3** with **PostgreSQL** for blog posts and recipes
- **MDX** for legal pages only
- **pnpm** + **Turborepo** monorepo, deployed on **Vercel**

## Documentation

The docs are split by role — each topic has one home:

| Document | Role |
| --- | --- |
| [`docs/product.md`](docs/product.md) | **What and why** — vision, scope, features |
| [`docs/product/roadmap.md`](docs/product/roadmap.md) | **When** — phased delivery and exit criteria |
| [`docs/solution.md`](docs/solution.md) | **How** — architecture, runtime, data model; debt in §10 only |
| [`docs/structure.md`](docs/structure.md) | **Where** — routes, folders, conventions |
| [`docs/principles.md`](docs/principles.md) | Engineering rules |
| [`AGENTS.md`](AGENTS.md) | Agent and contributor setup, commands, security |

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

Run from the repo root before merge. GitHub Actions CI is planned ([`docs/product/roadmap.md`](docs/product/roadmap.md) Phase 1).

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## License

This project is available under the MIT license. It is freely available for any agricultural business to copy, modify, and deploy for their own farm website.
