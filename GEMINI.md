# GEMINI.md — CMS Monorepo

Monorepo: `server/` (Laravel backend + Inertia admin SPA) · `client/` (Next.js public frontend)

> **Read `ai/guide.md` first** — feature map, implemented features, key paths.
> Deep context: `ai/context.md` · Quality gates: `ai/rules.md` · MCP: `ai/mcp.md`

---

## Commands (always via Docker)

```bash
# Makefile shortcuts (from repo root)
make up / make down / make shell / make migrate / make fresh / make test / make quality

# Direct
docker compose exec php php artisan <cmd>
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run PHP or Node commands directly on host** — no DB/Redis outside Docker.

---

## Structure

| Component | Path | Stack |
|-----------|------|-------|
| Backend + Admin SPA | `server/` | Laravel, Inertia/React, Pest |
| Public Frontend | `client/` | Next.js, React, TanStack Query |

REST API: `/api/v1/*` · Admin: `/admin/*` · DB: MariaDB + Redis

---

## Key Conventions

**PHP:**
- `declare(strict_types=1)` on every file
- `Model::query()` — never `DB::` for standard queries
- Form Request classes for all validation — never inline
- `env()` only inside `config/` files
- API controllers extend `App\Http\Controllers\Api\ApiController`; use `$this->ok()` / `$this->created()` / `$this->noContent()` / `$this->collection()`
- No `{ data: T }` wrapper on single resource responses (`JsonResource::withoutWrapping()` is global)
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`
- Tests: `docker compose exec php php artisan test --compact`

**TypeScript:**
- `.tsx` files: component logic + JSX only — no type/interface definitions
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API)
- Admin routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings
- Client links → `useLocalePath()` / `lp()` for locale-prefixed URLs (`/en/`, `/pl/`)
- Server components → `serverFetch()`, client components → `api` from `lib/axios.ts`

**Quality:**
- Pest tests for every feature — no exceptions
- WCAG 2.1 AA, GDPR (soft-delete/anonymize users), EU/PL legal requirements

---

## Key Paths

- Backend: `server/app/`
- Admin pages: `server/resources/js/pages/`
- API controllers: `server/app/Http/Controllers/Api/V1/`
- Migrations: `server/database/migrations/`
- Frontend pages: `client/app/` (Next.js App Router)
- API types: `client/types/api.ts`
- Docs: `docs/` · AI context: `ai/`
