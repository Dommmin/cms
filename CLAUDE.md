# CLAUDE.md

Monorepo: **Laravel 12 backend + admin SPA** (`server/`) · **Next.js 16 public frontend** (`client/`)

> **Start every session by reading `ai/guide.md`** — it contains the full feature map, key paths, and conventions.

---

## AI Context Files

```
ai/guide.md       ← PRIMARY — features, paths, conventions (read this first)
ai/rules.md       ← Auto-update rules + quality gates
ai/prompts.md     ← Reusable prompts for common tasks
ai/context.md     ← Deep technical context (auth, cart, i18n, GDPR, etc.)
```

## Project Docs

```
docs/
├── architecture.md       System overview (Docker stack, data flow)
├── backend.md            Laravel structure, packages, patterns
├── frontend.md           Inertia admin SPA + Next.js public frontend
├── coding-standards.md   PHP / TypeScript / testing / git
├── feature-process.md    Step-by-step workflow for new features
├── deployment.md         Docker, Makefile, environment, production
├── page-builder.md       Page builder architecture (deep-dive)
├── features-backlog.md   Roadmap and planned features
└── project-status.md     Module coverage + test status

server/docs/
├── USER_GUIDE.md         For content editors (non-technical)
└── DEVELOPER_GUIDE.md    For developers extending the system
```

> `server/CLAUDE.md` is managed automatically by **laravel-boost** — do not edit manually.
> It contains Laravel-specific rules, package versions, and skill activation.

---

## Docker — All Commands Run in Containers

```bash
# From repo root (Makefile shortcuts)
make up             # Start all containers
make down           # Stop
make shell          # Enter PHP container (bash)
make migrate        # php artisan migrate
make fresh          # migrate:fresh --seed
make test           # php artisan test --compact
make quality        # Pint + PHPStan

# Direct docker compose (when you need specific args)
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run `php artisan` or `vendor/bin/pint` directly** — local PHP has no Redis/MySQL access.
> Always prefix with `docker compose exec php`.

---

## MCP Servers

Configured in `server/.ai/mcp/mcp.json`. Two active servers:

| Server | Purpose |
|--------|---------|
| `laravel-boost` | Tinker, DB queries, browser logs, docs search, artisan, health checks |
| `shadcn` | shadcn/ui component docs + generation |

> **laravel-boost runs on the HOST** (not inside Docker) — this is correct.
> MCP servers are host processes; boost connects to DB/Redis via Docker-exposed ports (`localhost:3306`, `localhost:6379`).
> The command points to `/Users/domin/admin/artisan` — a separate boost admin app, not this project.
