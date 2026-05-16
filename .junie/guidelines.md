# Junie Guidelines — CMS Monorepo

Headless CMS + e-commerce platform. Monorepo: `server/` (Laravel 12 backend + Inertia/React admin SPA) · `client/` (Next.js 16 public storefront).

> Entry point for Junie. Carries the compact non-negotiable core; read `.ai/` for depth:
>
> - **`.ai/guide.md`** — feature map, key paths, packages (PRIMARY — read first every session)
> - **`.ai/rules.md`** — canonical rules: MUST/FORBIDDEN, task routing, Docker, quality gates, GDPR
> - **`.ai/context.md`** — deep technical context: auth, cart, i18n, payments, page builder
> - **`.ai/commit-rules.md`** — atomic-commit convention
>
> `server/.junie/guidelines.md` is auto-managed by Laravel Boost — do not edit it.

---

## Commands (always via Docker)

```bash
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
make up / make down / make migrate / make fresh / make test / make quality
make fix    # auto-fix before committing
make check  # CI mirror — must pass before commit
```

> **Never run `php artisan`, `pint`, or `npm` directly** — host has no DB/Redis. If a container is down, report it and stop.

---

## Task Routing

- **Bug fix** — locate the root cause first; fix only what is broken; no drive-by refactors.
- **New endpoint / feature** — copy the nearest existing example: migration → model → FormRequest → Controller → Resource → route → test.
- **Refactoring** — only when explicitly requested, never as a side effect.
- **Cross-project change** — one side at a time, verify each independently.
- Read 2-3 similar files first; plan before coding when a task has 3+ steps.

---

## PHP Rules (server/)

- `declare(strict_types=1)` on every file; explicit return types on all methods
- Constructor property promotion for dependencies
- `Model::query()` — never `DB::` for standard queries; eager-load relations (no N+1)
- Form Request classes for all validation — never inline in controllers
- `env()` only inside `config/` files; `casts()` method on models (not `$casts` property)
- API controllers extend `App\Http\Controllers\Api\ApiController`
- Use helpers: `$this->ok()` · `$this->created()` · `$this->noContent()` · `$this->collection()`
- Business logic in `app/Services/` — controllers stay thin
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

## TypeScript Rules (client/ and server/resources/js/)

- `.tsx` files are clean — no `interface` or `type` definitions inside them
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API)
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components (`"use client"`) → `api` from `lib/axios.ts`
- All client links → `useLocalePath()` — locale-prefixed URLs (`/en/`, `/pl/`)
- Admin SPA routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings

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

## Testing (Pest)

```php
declare(strict_types=1);

beforeEach(fn () => Role::firstOrCreate(['name' => 'admin']));

it('returns products list', function () {
    $this->getJson('/api/v1/products')->assertOk();
});

$this->actingAs($user, 'sanctum')->getJson('/api/v1/orders')->assertOk();
```

- Use factories — never `Model::create()` in tests
- `assertSoftDeleted()` for soft-delete models
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` — not `assertStatus(200)`

---

## Architecture Rules

- Models → `app/Models/` · Business logic → `app/Services/` · One-off ops → `app/Actions/`
- Prices are **integer cents/grosze** — never floats
- Order state machine: `spatie/laravel-model-states`
- Soft-delete users only via `App\Actions\AnonymizeUserData` (GDPR)
- Translatable models: Product, Category, BlogPost, Page, ProductVariant
- API endpoints need a rate limiter: `api.strict` (10/min) · `api.public` (60/min) · `api.auth` (300/min)

---

## Git — Requires Explicit Consent

- **NEVER** create a branch, commit, or push without the user's explicit approval. Read-only git is always fine.
- Commit **only files you explicitly modified** — never stage unrelated or auto-generated files. Review `git diff --staged` first.
- Atomic commits — one concern per commit (`.ai/commit-rules.md`).
- `make fix && make check` must both pass before any commit.

---

## After Implementing a Feature

1. Update `.ai/guide.md` → Implemented Features section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
5. Run: `docker compose exec php vendor/bin/pint --dirty`
6. Run: `docker compose exec php php artisan test --compact`
