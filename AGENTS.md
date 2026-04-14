# AGENTS.md — CMS Monorepo

Monorepo: `server/` (Laravel backend + Inertia admin SPA) · `client/` (Next.js public frontend)

> **Full context:** `ai/guide.md` (feature map) · `ai/context.md` (deep technical) · `ai/rules.md` (quality gates)

---

## Commands (always via Docker)

```bash
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
make up / make down / make shell / make migrate / make fresh / make test / make quality
```

> **Never run `php artisan` or `pint` directly on host** — no DB/Redis outside Docker.

---

## Project Structure

```
server/          Laravel backend + Inertia/React admin SPA
  app/Models/                  Eloquent models
  app/Http/Controllers/Api/V1/ REST API controllers (extend ApiController)
  app/Http/Controllers/Admin/  Admin SPA controllers (Inertia)
  app/Services/                Business logic
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

## Non-Negotiable Rules

**PHP:**
- `declare(strict_types=1)` on every file; explicit return types everywhere
- Constructor property promotion: `public function __construct(private readonly CartService $cs) {}`
- `Model::query()` — never `DB::` for standard queries; eager-load relations (no N+1)
- Form Requests for all validation — never inline in controllers
- `env()` only inside `config/` files; `casts()` method on models (not `$casts` property)
- API controllers extend `App\Http\Controllers\Api\ApiController`; use `$this->ok()` / `$this->created()` / `$this->noContent()` / `$this->collection()`
- `JsonResource::withoutWrapping()` is global — no `{ data: T }` wrapper on single resources
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

**TypeScript:**
- `.tsx` files are clean — no `interface` or `type` definitions inside them
- Types: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API — check before every API call)
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components (`"use client"`) → `api` from `lib/axios.ts`
- Admin SPA routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings
- All client links → `useLocalePath()` / `lp()` (locale-prefixed URLs)

**Always:**
- Pest tests for every feature: `docker compose exec php php artisan make:test --pest Name`
- All tests must pass: `docker compose exec php php artisan test --compact`
- Use factories in tests — never `Model::create()` manually
- Update `ai/guide.md` when adding or changing features

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
- Order state machine: `spatie/laravel-model-states`
- Translatable models (spatie/laravel-translatable): Product, Category, BlogPost, Page
- Soft deletes on User, Customer — always use `AnonymizeUserData` action for deletion (GDPR)
- Locale-prefixed URLs: `/en/products`, `/pl/blog` — middleware rewrites at Next.js edge

---

## Authentication

| System | Scope | Mechanism |
|--------|-------|-----------|
| Fortify | Admin SPA `/admin/*` | Session cookie |
| Sanctum | REST API `/api/v1/*` | Bearer token |

API test auth: `$this->actingAs($user, 'sanctum')`

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

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});
```

- `assertSoftDeleted()` for soft-delete models
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` — not `assertStatus(200)`

---

## Documentation Update Rules

After implementing a feature:
1. Add to `ai/guide.md` → "Implemented Features" section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — non-technical editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns

---

## Commit Rules

**Only commit files you explicitly modified.** Never stage or commit unrelated changes — including auto-generated files (Wayfinder, migrations, etc.), other developers' work, or files you did not intentionally edit. Always review `git diff --staged` before committing.
