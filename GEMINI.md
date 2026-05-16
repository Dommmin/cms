# GEMINI.md — CMS Monorepo

Headless CMS + e-commerce platform. Monorepo: `server/` (Laravel 12 backend + Inertia/React admin SPA) · `client/` (Next.js 16 public storefront).

> Entry point for Gemini CLI. Carries the compact non-negotiable core; read `.ai/` for depth:
>
> - **`.ai/guide.md`** — feature map, key paths, packages (PRIMARY — read first every session)
> - **`.ai/rules.md`** — canonical rules: MUST/FORBIDDEN, task routing, Docker, quality gates, GDPR
> - **`.ai/context.md`** — deep technical context: auth, cart, i18n, payments, page builder
> - **`.ai/mcp.md`** — MCP servers · **`.ai/commit-rules.md`** — atomic-commit convention
>
> `server/GEMINI.md` is auto-managed by Laravel Boost — do not edit it.

---

## Commands (always via Docker)

```bash
# Makefile shortcuts (from repo root)
make up / make down / make shell / make migrate / make fresh / make test / make quality

# Pre-commit workflow — always run before committing
make fix    # auto-fix: pint → rector → pint → eslint --fix → prettier (server + client)
make check  # CI mirror: read-only, fails if anything is wrong — same checks as GitHub Actions

# Direct
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run `php artisan`, `pint`, or `npm` directly** — the host has no DB/Redis access.
> If a container is down, report it and stop — do not fall back to the host.

---

## Structure

| Component | Path | Stack |
|-----------|------|-------|
| Backend + Admin SPA | `server/` | Laravel 12, Inertia/React, Pest |
| Public Frontend | `client/` | Next.js 16, React, TanStack Query |

REST API: `/api/v1/*` · Admin: `/admin/*` · DB: MariaDB + Redis

---

## Task Routing

- **Bug fix** — locate the root cause first; fix only what is broken; no drive-by refactors.
- **New endpoint / feature** — copy the nearest existing example: migration → model → FormRequest → Controller → Resource → route → test.
- **Refactoring** — only when explicitly requested, never as a side effect.
- **Cross-project change** — one side at a time, verify each independently.
- Read 2-3 similar files first; plan before coding when a task has 3+ steps.

---

## Non-Negotiable Rules

**PHP:**
- `declare(strict_types=1)` on every file; explicit return types
- Constructor property promotion for dependencies
- `Model::query()` — never `DB::` for standard queries; eager-load relations (no N+1)
- Form Request classes for all validation — never inline
- `env()` only inside `config/` files; `casts()` method on models (not `$casts` property)
- API controllers extend `App\Http\Controllers\Api\ApiController`; use `$this->ok()` / `$this->created()` / `$this->noContent()` / `$this->collection()`
- No `{ data: T }` wrapper on single resources (`JsonResource::withoutWrapping()` is global)
- Business logic in `app/Services/` — controllers stay thin
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

**TypeScript (`client/` and `server/resources/js/`):**
- `.tsx` files are clean — no type/interface definitions inside them
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API)
- Server components → `serverFetch()`; client components → `api` from `lib/axios.ts`
- Admin routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings
- Client links → `useLocalePath()` / `lp()` for locale-prefixed URLs (`/en/`, `/pl/`)

**Quality:**
- Pest tests for every feature — no exceptions; all must pass before committing
- Use factories in tests — never `Model::create()` manually
- `assertSoftDeleted()` for soft-delete models; `assertOk()` / `assertCreated()` — not `assertStatus(200)`
- WCAG 2.1 AA, GDPR (soft-delete/anonymize users via `AnonymizeUserData`), EU/PL legal requirements

---

## API Types — Critical Gotchas

Check `client/types/api.ts` before writing client code.

| Type | Field | Note |
|------|-------|------|
| `CartItem` | `unit_price`, `subtotal` | `product` is direct (not `variant.product`) |
| `ProductVariant` | `attributes: Record<string, string>` | not `attribute_values` |
| `ProductReview` | `author`, `body` | not `reviewer_name` |
| `Order` | `items?.length` | no `items_count` field |
| `BlogPost` | `featured_image: string\|null` | not `cover_image_url` |

---

## Git — Requires Explicit Consent

- **NEVER** create a branch, commit, or push without the user's explicit approval. Read-only git is always fine.
- Commit **only files you explicitly modified** — never stage unrelated or auto-generated files. Review `git diff --staged` first.
- Atomic commits — one concern per commit (`.ai/commit-rules.md`).
- `make fix && make check` must both pass before any commit.

---

## Key Paths

- Backend: `server/app/` · Admin pages: `server/resources/js/pages/`
- API controllers: `server/app/Http/Controllers/Api/V1/` · Migrations: `server/database/migrations/`
- Frontend pages: `client/app/` (Next.js App Router) · API types: `client/types/api.ts`
- Docs: `docs/` · AI context: `.ai/` · Project skills (Claude Code): `.claude/skills/`

---

## Documentation Update Rules

After implementing a feature:
1. Add to `.ai/guide.md` → "Implemented Features" section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — non-technical editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
