# Junie Guidelines — CMS Monorepo

Monorepo: `server/` (Laravel backend + Inertia admin SPA) · `client/` (Next.js public frontend)

> **Read `ai/guide.md` first** — feature map, key paths, implemented features.
> Deep context: `ai/context.md` · Quality gates: `ai/rules.md`

---

## Commands (always via Docker)

```bash
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
make up / make down / make migrate / make fresh / make test / make quality
```

> **Never run `php artisan` or `pint` directly** — host has no DB/Redis.

---

## PHP Rules (server/)

- `declare(strict_types=1)` on every file; explicit return types on all methods
- Constructor property promotion for dependencies
- `Model::query()` — never `DB::` for standard queries; eager-load relations (no N+1)
- Form Request classes for all validation — never inline in controllers
- `env()` only inside `config/` files; `casts()` method on models (not `$casts` property)
- API controllers extend `App\Http\Controllers\Api\ApiController`
- Use helpers: `$this->ok()` · `$this->created()` · `$this->noContent()` · `$this->collection()`
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

## TypeScript Rules (client/ and server/resources/js/)

- `.tsx` files are clean — no `interface` or `type` definitions inside them
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API)
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components (`"use client"`) → `api` from `lib/axios.ts`
- All links → `useLocalePath()` — locale-prefixed URLs (`/en/`, `/pl/`)
- Admin SPA routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings

---

## Testing (Pest)

```php
declare(strict_types=1);

it('returns products list', function () {
    $this->getJson('/api/v1/products')->assertOk();
});

$this->actingAs($user, 'sanctum')->getJson('/api/v1/orders')->assertOk();

beforeEach(fn() => Role::firstOrCreate(['name' => 'admin']));
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
- Translatable models: Product, Category, BlogPost, Page

---

## After Implementing a Feature

1. Update `ai/guide.md` → Implemented Features section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
5. Run: `docker compose exec php vendor/bin/pint --dirty`
6. Run: `docker compose exec php php artisan test --compact`
