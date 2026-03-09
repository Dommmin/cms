# Backend — Laravel 12

## Structure (`server/`)

```
server/
├── app/
│   ├── Actions/            One-off operations (AnonymizeUserData, etc.)
│   ├── Console/Commands/   Artisan commands
│   ├── Concerns/           Reusable traits (HasVersions)
│   ├── Data/               Spatie Data DTOs
│   ├── Enums/              PHP 8.1+ backed enums (TitleCase keys)
│   ├── Events/             Domain events
│   ├── Exports/            Excel exports (Maatwebsite)
│   ├── Filters/            Query filters
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/      Inertia admin controllers
│   │   │   ├── Api/V1/     REST API v1 controllers
│   │   │   └── Settings/   Profile/password/appearance settings
│   │   ├── Middleware/
│   │   ├── Requests/       Form Requests (validation)
│   │   └── Resources/      API Resources (JSON responses)
│   ├── Imports/            Excel imports
│   ├── Infrastructure/     External service integrations
│   ├── Interfaces/         Contracts
│   ├── Jobs/               Queue jobs
│   ├── Listeners/          Event listeners
│   ├── Models/             All Eloquent models
│   ├── Notifications/      Laravel notifications
│   ├── Observers/          Model observers (registered in AppServiceProvider)
│   ├── Policies/           Authorization policies
│   ├── Providers/          Service providers
│   ├── Queries/            Query classes (index queries with filter/sort/paginate)
│   ├── Services/           Business logic layer
│   ├── Sorts/              Custom query sorts
│   └── States/             Model states (spatie/laravel-model-states)
├── bootstrap/
│   ├── app.php             Middleware + exception config (no Kernel.php)
│   └── providers.php       Service provider registration
├── config/                 All config files (never use env() outside here)
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/                 Admin SPA (Inertia + React)
│   └── views/              Blade (app.blade.php + PDF views)
├── routes/
│   ├── api.php             /api/v1/* REST API
│   ├── web.php             includes admin.php + settings.php
│   ├── admin.php           /admin/* Inertia routes
│   ├── admin/cms.php       CMS sub-routes
│   ├── admin/blog.php      Blog sub-routes
│   ├── admin/ecommerce.php Ecommerce sub-routes
│   ├── settings.php        /settings/* profile routes
│   └── console.php         Scheduled commands
└── tests/
    ├── Feature/
    │   ├── Admin/          Admin panel tests
    │   ├── Api/            API endpoint tests
    │   ├── Auth/           Auth flow tests
    │   └── Settings/       Settings tests
    └── Unit/               Unit tests
```

---

## Routing

### API (`routes/api.php`)
- Prefix: `/api/v1/`
- Named: `api.v1.*`
- Middleware: `ForceJsonResponse`, rate limiters
- Rate limiters: `api.strict` (10/min), `api.public` (60/min), `api.auth` (300/min)

### Admin (`routes/admin.php` + sub-files)
- Prefix: `/admin/`
- Named: `admin.*`
- Middleware: `auth`, `AdminAccess` (requires admin or editor role)

### Settings (`routes/settings.php`)
- Prefix: `/settings/`
- Named: `profile.*`, `user-password.*`, etc.
- Middleware: `auth`, `verified`

---

## Key Packages

| Package | Purpose |
|---------|---------|
| `laravel/fortify` | Headless auth (admin) |
| `laravel/sanctum` | API token auth |
| `laravel/inertia` | Admin SPA bridge |
| `laravel/wayfinder` | TypeScript route generation |
| `laravel/scout` | Full-text search (Typesense) |
| `laravel/telescope` | Dev debugging |
| `laravel/boost` | AI dev tools (dev only) |
| `spatie/laravel-permission` | Roles + permissions |
| `spatie/laravel-medialibrary` | File uploads + conversions |
| `spatie/laravel-translatable` | Multi-language model fields |
| `spatie/laravel-model-states` | State machine (orders) |
| `spatie/laravel-query-builder` | API filtering/sorting |
| `spatie/laravel-activitylog` | Audit log |
| `spatie/laravel-health` | Health checks |
| `spatie/laravel-pdf` | PDF generation (Gotenberg) |
| `spatie/laravel-sluggable` | Auto slug generation |
| `spatie/laravel-data` | Type-safe DTOs |
| `maatwebsite/excel` | Import/export Excel |
| `dedoc/scramble` | Auto API docs |
| `grazulex/laravel-api-idempotency` | Idempotency middleware |

---

## Service Layer

Business logic goes in `app/Services/`. Controllers should be thin.

| Service | Responsibility |
|---------|---------------|
| `CartService` | Cart operations, token management |
| `CheckoutService` | Order creation, payment, shipping |
| `PromotionService` | Discount + promotion calculation |
| `PaymentGatewayManager` | Strategy pattern for payment providers |
| `ShippingCarrierManager` | Strategy pattern for shipping carriers |
| `PageBuilderSyncService` | Page builder draft/publish sync |
| `PageVersionService` | Page version management |
| `ModuleRegistryService` | Page module type registry |

---

## Model Conventions

```php
// Always declare strict types
declare(strict_types=1);

// Casts as method (Laravel 12 convention)
protected function casts(): array
{
    return [
        'status' => OrderStatusEnum::class,
        'created_at' => 'datetime',
    ];
}

// Prefer query() over DB::
User::query()->where('email', $email)->first();

// Constructor property promotion
public function __construct(
    private readonly CartService $cartService,
) {}
```

---

## Admin SPA (Inertia + React)

Pages: `resources/js/pages/`
- `admin/` — all admin panel pages
- `auth/` — login, register, 2FA
- `settings/` — profile, password, appearance

Shared Inertia props (from `HandleInertiaRequests`):
- `auth.user` — current user with roles
- `can.manageUsers` — permission flag
- `flash.success` / `flash.error` — flash messages
- `activeTheme` — active theme data
- `sidebarOpen` — sidebar state
- `frontendUrl` — public frontend URL

Wayfinder: TypeScript route helpers auto-generated in `resources/js/actions/` by Vite plugin. Import with named imports: `import { index, store } from '@/actions/App/Http/Controllers/Admin/UserController'`

---

## Running Commands

```bash
# From project root (via Docker)
docker compose exec php php artisan <command>
docker compose exec php vendor/bin/pint --dirty
docker compose exec php php artisan test --compact

# Via Makefile shortcuts
make migrate
make test
make shell
```
