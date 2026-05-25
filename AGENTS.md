# AGENTS.md — CMS Monorepo

Headless CMS + e-commerce platform. Monorepo: `server/` (Laravel 12 backend + Inertia/React admin SPA) · `client/` (Next.js 16 public storefront).

> This file is the entry point for Codex and any tool that reads `AGENTS.md`. It carries the compact
> non-negotiable core. For depth, read the shared knowledge base in `.ai/`:
>
> - **`.ai/guide.md`** — feature map, key paths, packages (PRIMARY — read first every session)
> - **`.ai/rules.md`** — canonical rules: MUST/FORBIDDEN, task routing, Docker, quality gates, GDPR
> - **`.ai/context.md`** — deep technical context: auth, cart, i18n, payments, page builder
> - **`.ai/mcp.md`** — MCP server documentation · **`.ai/commit-rules.md`** — atomic-commit convention
>
> `server/AGENTS.md` is auto-managed by Laravel Boost (package versions + skills) — do not edit it.
> Boost is the source for version-specific docs: use its `search-docs` MCP tool before code changes.

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

> **Never run `php artisan`, `pint`, or `npm` directly** — the host has no DB/Redis access.
> If a container is down, report it and stop — do not fall back to the host.

---

## Project Structure

```
server/          Laravel backend + Inertia/React admin SPA
  app/Models/                  Eloquent models
  app/Http/Controllers/Api/V1/ REST API controllers (extend ApiController)
  app/Http/Controllers/Admin/  Admin SPA controllers (Inertia)
  app/Services/                Business logic (fat services, thin controllers)
  app/Actions/                 One-off operations
  app/Enums/                   PHP enums (TitleCase keys)
  app/Http/Requests/           Form Request validation classes
  app/Http/Resources/          API Resources
  app/Policies/                Authorization policies
  database/migrations/         Database migrations
  database/factories/          Model factories (use in tests)
  routes/api.php               REST API routes (/api/v1/*)
  routes/admin.php             Admin routes (/admin/*)
  resources/js/pages/          Inertia React pages

client/          Next.js public storefront
  app/             App Router pages
  api/             API call functions
  hooks/           React hooks
  components/      Reusable components
  types/api.ts     API response types (CHECK BEFORE USE)
  lib/server-fetch.ts  Server component data fetching
  lib/axios.ts         Client component data fetching
```

---

## Task Routing

- **Bug fix** — reproduce / locate the root cause first; fix only what is broken; no drive-by refactors.
- **New endpoint / feature** — find the nearest existing example, copy its structure: migration → model → FormRequest → Controller → Resource → route → test.
- **Refactoring** — only when explicitly requested, never as a side effect.
- **Cross-project change (server + client)** — one side at a time, verify each independently.
- Read 2-3 similar files before writing new code; match the local style. Plan before coding when a task has 3+ steps.

---

## Non-Negotiable Rules

**PHP:**
- `declare(strict_types=1)` on every file; explicit return types everywhere
- Constructor property promotion: `public function __construct(private readonly CartService $cs) {}`
- `Model::query()` — never `DB::` for standard queries; eager-load relations (no N+1)
- Form Requests for all validation — never inline in controllers
- `env()` only inside `config/` files; `casts()` method on models (not `$casts` property)
- Business logic in `app/Services/` — controllers stay thin
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

**API Controllers (`server/app/Http/Controllers/Api/V1/`):**
- Extend `App\Http\Controllers\Api\ApiController` — never base `Controller`
- Use helpers: `$this->ok()` · `$this->created()` · `$this->noContent()` · `$this->collection()`
- `JsonResource::withoutWrapping()` is global — no `{ data: T }` wrapper on single resources
- Every API endpoint needs a rate limiter: `api.strict` (10/min) · `api.public` (60/min) · `api.auth` (300/min)

**TypeScript (`client/` and `server/resources/js/`):**
- `.tsx` files are clean — no `interface` or `type` definitions inside them
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API — check before every API call)
- Server components → `serverFetch()` from `lib/server-fetch.ts`; client components (`"use client"`) → `api` from `lib/axios.ts`
- Admin SPA routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings
- All client links → `useLocalePath()` / `lp()` (locale-prefixed URLs `/en/`, `/pl/`)
- **No hardcoded strings in admin JSX** — always use `__('key', 'Fallback')` from `useTranslation()`, add keys to both `lang/en/admin.php` and `lang/pl/admin.php`

**Always:**
- Pest tests for every feature: `docker compose exec php php artisan make:test --pest Name`
- All tests must pass: `docker compose exec php php artisan test --compact`
- Use factories in tests — never `Model::create()` manually
- **Translations required** — every user-facing string in admin components must use `__('key', 'Fallback')` from `useTranslation()`. When creating or modifying components, add corresponding keys to both `server/lang/en/admin.php` and `server/lang/pl/admin.php`. Never hardcode English text in JSX. After adding translation keys, clear cache: `docker compose exec php php artisan cache:clear`
- Update `.ai/guide.md` when adding or changing features

---

## API Types — Critical Gotchas

Always check `client/types/api.ts` before writing client code.

| Type             | Field                                | Note                                        |
|------------------|--------------------------------------|---------------------------------------------|
| `CartItem`       | `unit_price`, `subtotal`             | `product` is direct (not `variant.product`) |
| `ProductVariant` | `attributes: Record<string, string>` | not `attribute_values`                      |
| `ProductReview`  | `author`, `body`                     | not `reviewer_name`                         |
| `Order`          | `items?.length`                      | no `items_count` field                      |
| `BlogPost`       | `featured_image: string\|null`       | not `cover_image_url`                       |

---

## Key Architectural Decisions

- Prices stored as **integer cents/grosze** (PLN base currency) — never floats
- All mutations use **idempotency keys** on checkout/cart endpoints
- Order state machine: `spatie/laravel-model-states`
- Translatable models (spatie/laravel-translatable): Product, Category, BlogPost, Page, ProductVariant
- Soft deletes on User, Customer — always use `AnonymizeUserData` action for deletion (GDPR)
- Locale-prefixed URLs: `/en/products`, `/pl/blog` — middleware rewrites at the Next.js edge

---

## Authentication

| System  | Scope                | Mechanism      |
|---------|----------------------|----------------|
| Fortify | Admin SPA `/admin/*` | Session cookie |
| Sanctum | REST API `/api/v1/*` | Bearer token   |

API test auth: `$this->actingAs($user, 'sanctum')`

---

## Testing Conventions (Pest)

```php
declare(strict_types=1);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});

it('does something', function () {
    $user = User::factory()->create();
    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/resource')
        ->assertOk();
});
```

- `assertSoftDeleted()` for soft-delete models — not `assertDatabaseMissing()`
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` — not `assertStatus(200)`

---

## Git — Requires Explicit Consent

- **NEVER** create a branch, commit, or push without the user's explicit approval. Read-only git (`status`, `diff`, `log`) is always fine.
- Commit **only files you explicitly modified** — never stage unrelated changes, auto-generated files (Wayfinder, migrations you did not write), or other developers' work. Review `git diff --staged` first.
- Atomic commits — one concern per commit. See `.ai/commit-rules.md` for the full convention.
- `make fix && make check` must both pass before any commit; tests must pass before committing PHP changes.

---

## Skills & Workflows

Project skills live in `.claude/skills/` (committed): `commit`, `fix`, `review`, `test`, `deploy-check`, `audit-update`, `a11y-check`, `ux-review`, `seo-review`. Only Claude Code runs them as skills — other tools should treat the list as a reference to available workflows and run the equivalent `make`/`artisan` commands. Personal/plugin skills are not part of this project.

Reusable task prompts: `.ai/prompts.md`. Communication style & language rules: `.ai/humanizer.md`.

---

## Documentation Update Rules

After implementing a feature:
1. Add to `.ai/guide.md` → "Implemented Features" section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — non-technical editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
