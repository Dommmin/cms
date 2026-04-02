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

**API Controllers (`server/app/Http/Controllers/Api/`):**
- All API controllers extend `App\Http\Controllers\Api\ApiController` (not base `Controller`)
- **Never call `response()->json()` directly** — use base class helpers:
  - `$this->ok(new SomeResource($model))` → 200 (GET, PUT, PATCH, DELETE)
  - `$this->created(new SomeResource($model))` → 201 (POST that creates a resource)
  - `$this->noContent()` → 204 (DELETE with no body)
  - `$this->collection(Resource::collection($paginator))` → paginated response
- `JsonResource::withoutWrapping()` is set globally — responses have **no `{ data: T }` wrapper**
- Paginated responses (`->paginate()`) still return `{ data: [], meta: {}, links: {} }` — that's the paginator, not the resource wrapper
- **Client-side** (`client/`): use `apiGet<T>()`, `apiGetMany<T>()`, `apiGetPage<T>()`, `apiPost<T>()` etc. from `lib/api.ts` — never `api.get().then(r => r.data.data)`

**TypeScript (`client/` and `server/resources/js/`):**
- `.tsx` files are clean — component logic + JSX only, **no type/interface definitions**
- Types live in separate `.ts` files:
  - Component-specific → `ComponentName.types.ts` (colocated)
  - Directory-shared → `types.ts` in the same directory
  - API response types → `client/types/api.ts` (check before writing any API call)
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components → `api` from `lib/axios.ts`
- All internal links must use `useLocalePath()` / `lp()` (locale-prefixed URLs)

**Admin SPA (`server/resources/js/`):**
- Standalone HTTP requests → use `axios` (dependency), **never `fetch()`**
- Route URLs → always use **Wayfinder** functions from `@/actions/` or `@/routes/`, **never hardcode strings** like `"/admin/products"`

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
