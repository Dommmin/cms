# CLAUDE.md

Monorepo: **Laravel backend + admin SPA** (`server/`) · **Next.js public frontend** (`client/`)

> **Read `ai/guide.md` first** — feature map, key paths, conventions.
> Deep context: `ai/context.md` · Quality gates & Docker rules: `ai/rules.md` · MCP: `ai/mcp.md`

---

## Commands (always via Docker)

```bash
# Makefile shortcuts (from repo root)
make up / make down / make shell / make migrate / make fresh / make test / make quality

# Pre-commit workflow — always run before committing
make fix    # auto-fix: pint → rector → pint → eslint --fix → prettier (server + client)
make check  # CI mirror: read-only, fails if anything is wrong — same checks as GitHub Actions

# Direct — when you need specific args
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run `php artisan` or `pint` directly** — host has no DB/Redis access.
> **Before every commit:** `make fix && make check` — if `check` passes, the code is safe to push.

---

## Structure

| Part | Path | Stack |
|------|------|-------|
| Backend + Admin SPA | `server/` | Laravel, Inertia/React, Pest |
| Public Frontend | `client/` | Next.js, React, TanStack Query |

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

**API Controllers (`server/app/Http/Controllers/Api/`):**
- Extend `App\Http\Controllers\Api\ApiController` — never base `Controller`
- Use helpers: `$this->ok()` · `$this->created()` · `$this->noContent()` · `$this->collection()`
- `JsonResource::withoutWrapping()` is global — no `{ data: T }` wrapper on single resources
- Client-side: use `apiGet<T>()`, `apiGetPage<T>()` etc. from `lib/api.ts`

**TypeScript (`client/` and `server/resources/js/`):**
- `.tsx` files are clean — no type/interface definitions inside them
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API)
- Admin SPA routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings
- All client links → `useLocalePath()` / `lp()` (locale-prefixed URLs)

**Always:**
- Pest tests for every feature — `docker compose exec php php artisan make:test --pest Name`
- All tests must pass: `docker compose exec php php artisan test --compact`
- Update `ai/guide.md` when adding or changing features

---

## AI Context Files

```
ai/guide.md        ← feature map, key paths (PRIMARY — read every session)
ai/context.md      ← auth, cart, i18n, payments, page builder (deep tasks)
ai/rules.md        ← quality gates, auto-update rules, GDPR, Docker-first
ai/prompts.md      ← copy-paste task templates
ai/mcp.md          ← MCP server documentation
ai/mcp/mcp.json    ← MCP config (source of truth)

server/CLAUDE.md   ← Laravel rules — auto-managed by laravel-boost (do not edit)
client/CLAUDE.md   ← Next.js rules
```

---

## MCP Servers

See `ai/mcp.md` for full documentation.

| Server | Purpose |
|--------|---------|
| `laravel-boost` | Tinker, DB queries, schema, docs search, browser logs |
| `shadcn` | shadcn/ui component docs + generation |

> laravel-boost runs on HOST, connects to Docker services via `localhost:3306` / `localhost:6379`.
> Always use `search-docs` before making code changes (version-specific docs).
