# Junie Guidelines — CMS Monorepo

**Project**: Headless CMS + e-commerce platform.
- `server/` — Laravel 12 backend + Inertia/React admin SPA
- `client/` — Next.js 16 public storefront

Extended context: `ai/guide.md` (feature map) · `ai/context.md` (deep technical) · `ai/rules.md` (quality gates)

---

## All Commands Run in Docker

```bash
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
make up / make down / make migrate / make fresh / make test
```

**Never run `php artisan` or `pint` directly** — host has no DB/Redis.

---

## PHP Rules (server/)

- `declare(strict_types=1)` on every file
- Explicit return types on all methods
- Constructor property promotion for dependencies
- `Model::query()` — never `DB::` for standard queries
- Eager-load relations (no N+1 in loops)
- Form Request classes for all validation — never inline
- `env()` only inside `config/` files
- `casts()` method on models (not `$casts` property) — Laravel 12 convention
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`
- Run tests: `docker compose exec php php artisan test --compact`

## TypeScript Rules (client/ and server/resources/js/)

- **`.tsx` files are clean** — no `interface` or `type` definitions inside `.tsx` files
- Types in separate `.ts` files:
  - Component props → `ComponentName.types.ts` (colocated with the component)
  - Shared within directory → `types.ts` in that directory
  - API response types → `client/types/api.ts` (check **before** writing any API call)
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components (`"use client"`) → `api` from `lib/axios.ts`
- All links use `useLocalePath()` — URLs are locale-prefixed (`/en/`, `/pl/`)
- Wayfinder for admin SPA routes: import from `@/actions/` or `@/routes/`

---

## Testing (Pest)

```php
declare(strict_types=1);

it('returns products list', function () {
    $this->getJson('/api/v1/products')->assertOk();
});

// API auth
$this->actingAs($user, 'sanctum')->getJson('/api/v1/orders')->assertOk();

// Roles
beforeEach(fn() => Role::firstOrCreate(['name' => 'admin']));
```

- Use factories, never `Model::create()` in tests
- `assertSoftDeleted()` for soft-delete models
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` — not `assertStatus(200)`

---

## Architecture Rules

- Models → `app/Models/` (never `app/Modules/`)
- Business logic → `app/Services/` (fat services, thin controllers)
- One-off ops → `app/Actions/`
- Prices are **integer cents/grosze** — never floats
- Order state machine: `spatie/laravel-model-states`
- Soft-delete users only via `App\Actions\AnonymizeUserData` (GDPR)
- Translatable models: Product, Category, BlogPost, Page (spatie/laravel-translatable)

---

## After Implementing a Feature

1. Update `ai/guide.md` → Implemented Features section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
5. Run: `docker compose exec php vendor/bin/pint --dirty`
6. Run: `docker compose exec php php artisan test --compact`
