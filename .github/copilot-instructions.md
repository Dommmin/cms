# GitHub Copilot Instructions — CMS Monorepo

**Project**: Headless CMS + e-commerce. `server/` = Laravel 12 backend + Inertia/React admin SPA. `client/` = Next.js 16 public storefront.

Read `ai/guide.md` for the full feature map. Read `ai/context.md` for deep technical context.

---

## All Commands Run in Docker

```bash
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
make up / make down / make shell / make migrate / make fresh / make test
```

**Never run `php artisan` or `pint` directly** — host has no DB/Redis.

---

## PHP Rules (server/)

- `declare(strict_types=1)` on every file
- Explicit return types on all methods
- Constructor property promotion: `public function __construct(private readonly CartService $cs) {}`
- `Model::query()` — never `DB::` for standard queries
- Eager-load relations (no N+1)
- Form Request classes for all validation — never inline
- `env()` only inside `config/` files
- `casts()` method on models (not `$casts` property) — Laravel 12

### Architecture
- Models → `app/Models/`
- Business logic → `app/Services/` (fat services, thin controllers)
- One-off ops → `app/Actions/`
- Prices are **integer cents/grosze** — never floats
- Order state machine: `spatie/laravel-model-states`

### Routes
- API: `api.v1.` prefix, `/api/v1/`, rate limiter required (`api.strict` 10/min | `api.public` 60/min | `api.auth` 300/min)
- Admin: `admin.` prefix, `/admin/`

---

## TypeScript Rules (client/ and server/resources/js/)

- **`.tsx` files are clean** — no `interface` or `type` definitions inside `.tsx` files
- Types live in separate `.ts` files:
  - Component props → `ComponentName.types.ts` (colocated)
  - Directory-shared → `types.ts` in that directory
  - API response types → `client/types/api.ts` (check before writing any API call)
- Server components → `serverFetch()` from `lib/server-fetch.ts`
- Client components (`"use client"`) → `api` from `lib/axios.ts`
- All links use `useLocalePath()` — URLs are locale-prefixed (`/en/`, `/pl/`)
- Wayfinder for admin SPA routes: import from `@/actions/` or `@/routes/`

### API Type Gotchas
| Type | Correct field | Wrong assumption |
|------|--------------|--------------------|
| `CartItem` | `product` (direct) | ~~`variant.product`~~ |
| `ProductVariant` | `attributes: Record<string,string>` | ~~`attribute_values`~~ |
| `ProductReview` | `author`, `body` | ~~`reviewer_name`~~ |
| `Order` | `items?.length` | ~~`items_count`~~ |
| `BlogPost` | `featured_image: string\|null` | ~~`cover_image_url`~~ |

---

## Testing (Pest)

```php
declare(strict_types=1);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});

it('creates a product', function () {
    $user = User::factory()->create()->assignRole('admin');
    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/products', [...])
        ->assertCreated();
});
```

- Use factories, never `Model::create()` in tests
- `assertSoftDeleted()` for soft-delete models
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` — not `assertStatus(200)`
- API auth: `$this->actingAs($user, 'sanctum')`

---

## WCAG 2.1 AA (client/)

- Icon-only buttons: `aria-label` + `aria-hidden="true"` on icon
- Form inputs: `<label htmlFor="id">` or `aria-label`
- Active nav links: `aria-current="page"`
- Quantity steppers: `aria-live="polite" aria-atomic` on the number
- Modal/dialog: `role="dialog" aria-modal="true"` + focus trap
- Skip link in root layout: `<a href="#main-content">Skip to main content</a>`
- Pagination: `<nav aria-label="Pagination">` + `aria-current="page"` on active

---

## After Implementing a Feature

1. Update `ai/guide.md` → Implemented Features section
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — developer extension patterns
5. Run: `docker compose exec php vendor/bin/pint --dirty`
6. Run: `docker compose exec php php artisan test --compact`
