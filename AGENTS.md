# AGENTS.md — CMS Project

Monorepo: **Laravel 12 backend + admin SPA** (`server/`) · **Next.js 16 public frontend** (`client/`)

Extended context: `ai/guide.md` (feature map) · `ai/context.md` (deep technical) · `ai/rules.md` (quality gates)

---

## All Commands Run in Docker

```bash
# PHP / Laravel
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty

# Node / Next.js
docker compose exec node npm run build

# Makefile shortcuts
make up / make down / make shell / make migrate / make fresh / make test / make quality
```

> **Never run `php artisan` or `pint` directly on host** — no DB/Redis access outside Docker.

---

## Project Structure

```
server/          Laravel 12 backend + Inertia/React admin SPA
  app/Models/          Eloquent models
  app/Http/Controllers/Api/V1/   REST API controllers
  app/Http/Controllers/Admin/    Admin SPA controllers (Inertia)
  app/Services/        Business logic
  app/Actions/         One-off operations
  app/Enums/           PHP enums (TitleCase keys)
  app/Http/Requests/   Form Request validation classes
  app/Http/Resources/  API Resources
  app/Policies/        Authorization policies
  database/migrations/ Database migrations
  database/factories/  Model factories (use in tests)
  routes/api.php       REST API routes (/api/v1/*)
  routes/admin.php     Admin routes (/admin/*)
  resources/js/pages/  Inertia React pages
  tests/Feature/       Feature tests (Pest)
  tests/Unit/          Unit tests (Pest)

client/          Next.js 16 public storefront
  app/             App Router pages
  api/             API call functions
  hooks/           React hooks
  components/      Reusable components
  types/api.ts     API response types (CHECK BEFORE USE)
  lib/server-fetch.ts  Server component data fetching
  lib/axios.ts         Client component data fetching
  lib/i18n.ts          Locale helpers
  middleware.ts        Locale URL rewriting
```

---

## Non-Negotiable Rules

### PHP
- `declare(strict_types=1)` on every file
- Explicit return types on all methods
- Constructor property promotion: `public function __construct(private readonly CartService $cs) {}`
- `Model::query()` — never `DB::` for standard queries
- Eager-load relations (no N+1 in loops)
- Form Requests for all validation — never inline in controllers
- `env()` only inside `config/` files
- `casts()` method on models (not `$casts` property) — Laravel 12
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

### TypeScript (client/)
- Check `client/types/api.ts` **before** using any API response field
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components (`"use client"`) → `api` from `lib/axios.ts`
- All links use `useLocalePath()` or `lp()` — URLs are locale-prefixed (`/en/`, `/pl/`)
- Wayfinder for admin SPA routes: import from `@/actions/` or `@/routes/`

### Always
- Pest tests for every feature: `docker compose exec php php artisan make:test --pest Name`
- All tests must pass: `docker compose exec php php artisan test --compact`
- Use factories in tests — never `Model::create()` manually
- Update `ai/guide.md` when adding/changing features

---

## API Types — Critical Gotchas

| Type | Field | Note |
|------|-------|------|
| `CartItem` | `unit_price`, `subtotal` | `product` is direct (not `variant.product`) |
| `ProductVariant` | `attributes: Record<string, string>` | not `attribute_values` |
| `ProductReview` | `author`, `body` | not `reviewer_name` |
| `Order` | `items?.length` | no `items_count` field |
| `BlogPost` | `featured_image: string\|null` | not `cover_image_url` |

---

## Key Architectural Decisions

- Prices stored as **integer cents/grosze** (PLN base currency) — never floats
- All mutations use **idempotency keys** on checkout/cart endpoints
- Order state machine: `spatie/laravel-model-states` (AwaitingPayment → Shipped/Delivered/Cancelled)
- Translatable models (spatie/laravel-translatable): Product, Category, BlogPost, Page
- Soft deletes on User, Customer — always use `AnonymizeUserData` action for deletion
- Locale-prefixed URLs: `/en/products`, `/pl/blog` — middleware rewrites at Next.js edge

---

## Authentication

| System | Scope | Mechanism |
|--------|-------|-----------|
| Fortify | Admin SPA `/admin/*` | Session cookie |
| Sanctum | REST API `/api/v1/*` | Bearer token |

API test auth: `$this->actingAs($user, 'sanctum')`

---

## i18n

- Backend: `?locale=en` query param → `SetLocale` middleware
- Frontend: locale from URL path + cookie; `useLocalePath()` hook for links
- DB queries for translatable: `where('title->en', 'value')`

---

## Testing Conventions (Pest)

```php
declare(strict_types=1);

it('does something', function () {
    $user = User::factory()->create();
    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/resource')
        ->assertOk();
});

// Roles in beforeEach:
beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});
```

- `assertSoftDeleted()` for soft-delete models
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` — not `assertStatus(200)`
- Run specific: `php artisan test --compact --filter=TestName`

---

## Documentation Update Rules

After implementing a feature:
1. Add to `ai/guide.md` → "Implemented Features" section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — non-technical editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
