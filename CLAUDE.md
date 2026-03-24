# CLAUDE.md

Monorepo: **Laravel 12 + admin SPA** (`server/`) · **Next.js 16 public frontend** (`client/`)

> Read **`ai/guide.md`** first — feature map, key paths, conventions.
> Read **`ai/context.md`** for deep context (auth, cart, i18n, payments, page builder).

---

## All Commands Run in Docker

```bash
# Makefile shortcuts (from repo root)
make up / make down / make shell / make migrate / make fresh / make test / make quality

# Direct (when you need specific args)
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run `php artisan` or `vendor/bin/pint` directly** — host has no DB/Redis access.

---

## Structure

| Part | Path | Stack |
|------|------|-------|
| Backend + Admin SPA | `server/` | Laravel 12, Inertia/React, Pest |
| Public Frontend | `client/` | Next.js 16, React 19, TanStack Query |

REST API: `/api/v1/*` · Admin: `/admin/*` (Inertia SPA)

---

## Non-Negotiable Rules

**PHP (`server/`):**
- `declare(strict_types=1)` on every file
- `Model::query()` — never `DB::` for standard queries
- Eager-load relations (no N+1 in loops)
- Form Request classes for all validation — never inline
- `env()` only inside `config/` files
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

**TypeScript (`client/`):**
- Check `client/types/api.ts` **before** using any API response field
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components → `api` from `lib/axios.ts`
- All internal links must use `useLocalePath()` / `lp()` (locale-prefixed URLs)

**Always:**
- Write Pest tests for every feature — `php artisan make:test --pest Name`
- All tests must pass before commit: `php artisan test --compact`
- Update `ai/guide.md` when adding or changing features

---

## AI Context Files

```
ai/guide.md      ← feature map, key paths, conventions        (read first)
ai/context.md    ← auth, cart, i18n, payments, page builder   (read for deep tasks)
ai/rules.md      ← quality gates, auto-update rules, GDPR
ai/prompts.md    ← copy-paste task templates
ai/commit-rules.md ← commit message conventions
ai/mcp/          ← MCP server configs

server/CLAUDE.md ← Laravel rules — auto-managed by laravel-boost (do not edit)
client/CLAUDE.md ← Next.js rules (loaded automatically when working in client/)
```

---

## MCP Servers

`server/.ai/mcp/mcp.json` — two active servers:

| Server | Purpose |
|--------|---------|
| `laravel-boost` | Tinker, DB queries, browser logs, artisan, docs search |
| `shadcn` | shadcn/ui component docs + generation |

> laravel-boost runs on HOST, connects to Docker DB/Redis via `localhost:3306` / `localhost:6379`.
> The command points to `/Users/domin/admin/artisan` — a separate boost admin app.
