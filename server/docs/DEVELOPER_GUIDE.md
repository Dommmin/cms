# Developer Guide

**Laravel CMS & E-commerce Platform — Technical Reference**

This guide covers the full architecture, extension patterns, conventions, and technical details a developer needs to understand, maintain, and extend the platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Backend Directory Reference](#3-backend-directory-reference)
4. [Routing](#4-routing)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Key Services](#6-key-services)
7. [Models & Domain Logic](#7-models--domain-logic)
8. [Observers](#8-observers)
9. [Traits & Concerns](#9-traits--concerns)
10. [Enums Reference](#10-enums-reference)
11. [Interfaces](#11-interfaces)
12. [API Layer](#12-api-layer)
13. [Admin SPA (Inertia + React)](#13-admin-spa-inertia--react)
14. [Extension Patterns](#14-extension-patterns)
    - [Adding a New Admin CRUD Module](#141-adding-a-new-admin-crud-module)
    - [Adding a Payment Gateway](#142-adding-a-payment-gateway)
    - [Adding a Shipping Carrier](#143-adding-a-shipping-carrier)
    - [Adding a Page Builder Block Type](#144-adding-a-page-builder-block-type)
    - [Adding a Page Module Type](#145-adding-a-page-module-type)
    - [Adding Model Versioning](#146-adding-model-versioning)
    - [Adding Activity Logging](#147-adding-activity-logging)
    - [Adding a Feature Flag](#148-adding-a-feature-flag)
    - [Adding a Settings Group](#149-adding-a-settings-group)
    - [Adding Translatable Fields](#1410-adding-translatable-fields)
    - [Adding a New Role/Permission](#1411-adding-a-new-rolepermission)
    - [Adding a New Observer](#1412-adding-a-new-observer)
15. [Query Builder, Filters & Sorts](#15-query-builder-filters--sorts)
16. [Settings System](#16-settings-system)
17. [Feature Flags](#17-feature-flags)
18. [Versioning System](#18-versioning-system)
19. [Page Builder Architecture](#19-page-builder-architecture)
20. [Newsletter & Campaigns](#20-newsletter--campaigns)
21. [Testing](#21-testing)
22. [Code Quality Tools](#22-code-quality-tools)
23. [PHP & TypeScript Conventions](#23-php--typescript-conventions)
24. [Third-Party Packages](#24-third-party-packages)
25. [Environment Variables](#25-environment-variables)
26. [Deployment Notes](#26-deployment-notes)

---

## 1. Architecture Overview

The platform is a **Laravel 12 monolith** serving two separate clients:

1. **Admin SPA** — an Inertia.js v2 / React 19 single-page application rendered server-side by Laravel and served at `/admin/*`. Session-based authentication via Laravel Fortify. Communicates with the server via Inertia's full-page component protocol.

2. **Public REST API** — a versioned JSON API at `/api/v1/*`. Token-based authentication via Laravel Sanctum. Consumed by the standalone Next.js frontend in `client/`.

Key design principles:
- **No `Kernel.php`** — middleware registered declaratively in `bootstrap/app.php`.
- **No inline validation** — all validation in Form Request classes.
- **Services hold business logic** — controllers are thin (resolve request, call service, return response).
- **Observers for side effects** — price history, cache invalidation, search indexing.
- **Strategy pattern** for swappable implementations (payment gateways, shipping carriers).
- **Spatie ecosystem** — permissions, media, activity log, query builder, translatable, sluggable.

---

## 2. Monorepo Structure

```
/                          — Repo root
├── server/                — Laravel 12 backend + Inertia admin SPA
│   ├── app/               — Application code
│   ├── bootstrap/         — App configuration (app.php replaces Kernel)
│   ├── config/            — Configuration files
│   ├── database/          — Migrations, factories, seeders
│   ├── resources/
│   │   ├── js/            — Inertia/React admin frontend
│   │   └── views/         — Blade root template (app.blade.php)
│   ├── routes/            — Route files
│   ├── tests/             — Pest test suite
│   └── public/            — Web root
└── client/                — Standalone Next.js 15 frontend
    ├── app/               — Next.js App Router pages
    ├── api/               — API call functions
    ├── components/        — React components
    ├── hooks/             — Custom React hooks
    ├── lib/               — Utilities (axios, i18n, SEO, schema.org)
    └── types/             — TypeScript type definitions
```

---

## 3. Backend Directory Reference

```
server/app/
├── Actions/               — Fortify action classes (CreateNewUser, ResetUserPassword)
├── Concerns/              — Reusable traits (HasVersions, PasswordValidationRules, ProfileValidationRules)
├── Console/Commands/      — Artisan commands (GenerateSitemap, PublishScheduledBlogPosts)
├── Data/                  — Spatie Laravel Data DTOs
├── Enums/                 — PHP 8.1+ backed enums (see Section 10)
├── Events/                — Event classes
├── Filters/               — Spatie QueryBuilder filter classes
├── Http/
│   ├── Controllers/
│   │   ├── Admin/         — Inertia admin controllers
│   │   │   ├── Cms/       — Page, PageBuilder, ReusableBlock controllers
│   │   │   └── Ecommerce/ — Product, Order, Cart, etc. controllers
│   │   ├── Api/V1/        — REST API controllers
│   │   │   ├── Auth/      — AuthController, EmailVerificationController
│   │   │   └── Blog/      — BlogPostController, BlogCategoryController
│   │   └── Settings/      — Settings page controllers
│   ├── Middleware/         — Custom middleware
│   ├── Requests/
│   │   ├── Admin/         — Form requests for admin panel
│   │   └── Api/V1/        — Form requests for REST API
│   └── Resources/Api/     — Eloquent API resources
├── Infrastructure/
│   ├── Payments/          — Payment gateway implementations
│   └── Shipping/          — Shipping carrier implementations
├── Interfaces/            — PaymentGatewayInterface, ShippingCarrierInterface
├── Listeners/             — Event listeners
├── Models/                — Eloquent models
├── Notifications/         — Laravel notification classes
├── Observers/             — Model observers
├── Policies/              — Authorization policies
├── Providers/             — AppServiceProvider, AuthServiceProvider, FortifyServiceProvider
├── Queries/Admin/         — Spatie QueryBuilder query classes for admin index pages
├── Services/              — Business logic services (see Section 6)
└── Sorts/                 — Spatie QueryBuilder sort classes
```

---

## 4. Routing

### Route Files

| File                         | Prefix      | Purpose                                   |
|------------------------------|-------------|-------------------------------------------|
| `routes/web.php`             | `/`         | Includes admin and settings routes        |
| `routes/admin.php`           | `/admin`    | Admin panel (requires `admin` middleware) |
| `routes/admin/cms.php`       | `/admin`    | CMS sub-routes                            |
| `routes/admin/blog.php`      | `/admin`    | Blog sub-routes                           |
| `routes/admin/ecommerce.php` | `/admin`    | E-commerce sub-routes                     |
| `routes/settings.php`        | `/settings` | Admin settings pages                      |
| `routes/api.php`             | `/api/v1`   | Public REST API                           |
| `routes/console.php`         | —           | Scheduled commands                        |

### Middleware

Middleware is registered in `bootstrap/app.php` with no `Kernel.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        HandleAppearance::class,
        HandleInertiaRequests::class,
        AddLinkHeadersForPreloadedAssets::class,
    ]);

    $middleware->api(append: [
        ForceJsonResponse::class,
        LogApiRequests::class,
        SetLocale::class,      // reads ?locale= query param
    ]);

    $middleware->alias([
        'admin'      => AdminAccess::class,       // requires admin or editor role
        'force.json' => ForceJsonResponse::class,
        'log.api'    => LogApiRequests::class,
        'verified'   => EnsureEmailVerified::class,
        'idempotent' => IdempotentMiddleware::class,
    ]);
})
```

### Named Route Conventions

- **Admin routes:** `admin.{resource}.{action}` (e.g. `admin.products.index`, `admin.products.store`)
- **API routes:** `api.v1.{resource}.{action}` (e.g. `api.v1.products.index`, `api.v1.cart.items.store`)

### Rate Limiting (defined in `AppServiceProvider`)

| Limiter name | Limit                | Applied to                        |
|--------------|----------------------|-----------------------------------|
| `api.strict` | 10 req/min per IP    | Auth endpoints (`/api/v1/auth/*`) |
| `api.public` | 60 req/min per IP    | Public endpoints                  |
| `api.auth`   | 300 req/min per user | Authenticated API endpoints       |

---

## 5. Authentication & Authorization

### Admin Panel — Laravel Fortify (Session-based)

Fortify provides the headless auth backend. Views are configured in `FortifyServiceProvider` to render Inertia pages:

| Inertia Page                | Route                       |
|-----------------------------|-----------------------------|
| `auth/login`                | `GET /login`                |
| `auth/register`             | `GET /register`             |
| `auth/forgot-password`      | `GET /forgot-password`      |
| `auth/reset-password`       | `GET /reset-password`       |
| `auth/two-factor-challenge` | `GET /two-factor-challenge` |

2FA uses TOTP (time-based one-time passwords). The `two_factor_*` columns are added to the `users` table via the migration `2025_08_14_170933_add_two_factor_columns_to_users_table.php`.

**Middleware alias `admin`** (`AdminAccess`) checks `$user->hasRole(['admin', 'editor'])` and returns 404 if the check fails.

### REST API — Laravel Sanctum (Token-based)

API authentication routes are under `/api/v1/auth/` with the `throttle:api.strict` limiter.

Sanctum tokens are returned on `POST /api/v1/auth/login` and used as `Bearer` tokens in the `Authorization` header.

Protected API routes use `auth:sanctum` middleware.

### Roles & Permissions (Spatie Laravel Permission)

Roles: `admin`, `editor`

Policies live in `app/Policies/`:

| Policy             | Model                |
|--------------------|----------------------|
| `CartPolicy`       | Cart                 |
| `CategoryPolicy`   | Category             |
| `NewsletterPolicy` | NewsletterSubscriber |
| `OrderPolicy`      | Order                |
| `ProductPolicy`    | Product              |
| `ReturnPolicy`     | ReturnRequest        |
| `ReviewPolicy`     | ProductReview        |
| `RolePolicy`       | Role                 |
| `SettingsPolicy`   | Setting              |
| `UserPolicy`       | User                 |
| `WishlistPolicy`   | Wishlist             |

Gates are registered in `AuthServiceProvider`. The `can.manageUsers` shared Inertia prop is resolved via `Gate::allows('viewAny', User::class)`.

---

## 6. Key Services

All services live in `app/Services/`.

### CartService

Manages guest (token-based) and authenticated customer carts.

- `getOrCreateCart(?User, ?string $cartToken): Cart` — resolves or creates a cart, merges guest cart on login
- `addItem(Cart, ProductVariant, int $quantity): CartItem`
- `updateItem(CartItem, int $quantity): CartItem`
- `removeItem(CartItem): void`
- `applyDiscount(Cart, string $code): void`
- `mergeGuestCartIntoCustomer(User, string $token): void`

Guest carts use the `X-Cart-Token` header. The token is stored client-side in `localStorage` as `cart_token`.

### CheckoutService

Processes the full checkout flow.

```php
checkout(
    User $user,
    int $shippingMethodId,
    PaymentProviderEnum $paymentProvider,
    array $billingAddress,
    array $shippingAddress,
    ?string $pickupPointId = null,
    ?string $notes = null,
    ?string $referralCode = null
): Order
```

Creates Order, OrderItems, Payment, Shipment, and resolves affiliate referral if a `referralCode` is provided.

### PaymentGatewayManager

Strategy pattern manager for payment providers. Registered as a singleton in `AppServiceProvider::register()`.

```php
// Usage
$gateway = app(PaymentGatewayManager::class)->driver(PaymentProviderEnum::P24);
$payment = $gateway->createPayment($order, $data);
```

Registered gateways: `P24Gateway` (in `Infrastructure/Payments/P24/`), `PayUGateway` (in `Infrastructure/Payments/PayU/`), `CashOnDeliveryGateway`.

`processPayment(Payment $payment, array $options = [])` accepts: `customer_ip`, `payment_method` (`blik`|`card`|`apple_pay`|`google_pay`|`bank_transfer`), `blik_code`, `payment_token`, `return_url`, `continue_url`. Returns `['action' => 'redirect'|'wait'|'none', 'redirect_url' => ?string, 'message' => string]`.

**PayU sub-services:** `PayUTokenService` (OAuth2 token caching), `PayUClient` (HTTP calls with auto-retry on 401), `PayUWebhookVerifier` (MD5 signature check).

**P24 sub-services:** `P24Client` (Basic Auth HTTP), `P24SignatureService` (SHA256 signature generation/verification).

**Webhooks:** `POST /api/v1/webhooks/payu` and `POST /api/v1/webhooks/p24` → dispatches `ProcessPaymentWebhook` job (3 tries, 10s backoff). PayU webhook verifies signature synchronously before queuing.

**Payment status polling:** `GET /api/v1/payments/{payment}/status` — authenticated, returns `{status, order_reference}`. Frontend polls every 3s while `status === 'pending'` (BLIK flow).

### ShippingCarrierManager

Same strategy pattern for shipping carriers. Implementations: `InpostCarrier`, `DpdCarrier`, `DhlCarrier`.

### PromotionService

Calculates applicable discounts and promotions for cart items.

- `calculateCartDiscounts(array $cartItems): array`
- `calculateItemDiscounts(Product, int $quantity, float $price): array`

Handles stackable discounts, product/category targeting, and promotion priority ordering.

### PageBuilderSyncService

Syncs a page builder snapshot (sections and blocks array) to the database.

```php
sync(Page $page, array $snapshot): void
```

Deletes all existing sections and blocks for the page and recreates them from the snapshot. Also handles block relations (polymorphic links to Products, Categories, etc.).

### PageVersionService

Creates and restores versioned snapshots of a page's full structure.

```php
createVersion(Page $page, ?int $userId, ?string $changeNote): PageVersion
restorePage(Page $page, PageVersion $version): void
```

Snapshots include page attributes, all sections, and all blocks.

### ModuleRegistryService

Manages page module types (for pages of type `Module`).

```php
$registry = app(ModuleRegistryService::class);
$registry->registerModule('products', [
    'name'                 => 'Products Catalogue',
    'icon'                 => 'shopping-bag',
    'description'          => 'Product listing and detail pages',
    'has_list_page'        => true,
    'has_detail_page'      => true,
    'list_route_pattern'   => '/products',
    'detail_route_pattern' => '/products/{slug}',
    'model_class'          => Product::class,
    'route_key_name'       => 'slug',
    'list_layouts'         => [...],
    'detail_layouts'       => [...],
]);
$registry->sync(); // persists to database
```

### FeatureFlagService

Controls which major features are active.

```php
$service = app(FeatureFlagService::class);
$service->isEnabled('blog');      // bool
$service->enable('ecommerce');
$service->disable('newsletter');
$service->getAll();               // ['blog' => true, 'ecommerce' => true, ...]
```

Settings are read from the `settings` table (group: `features`).

### PageCacheService / PageSlugService / PagePreviewService

Supporting services for the CMS page layer:

- **PageCacheService** — flushes page caches when pages are published or updated (called by `PageObserver`)
- **PageSlugService** — validates and generates unique slugs
- **PagePreviewService** — generates and validates signed preview tokens

### MediaService / BlockMediaService

- **MediaService** — wraps `spatie/laravel-medialibrary` for model media management
- **BlockMediaService** — resolves media attached to page builder blocks
- **BlockRelationService** — manages polymorphic relations from page builder blocks to Eloquent models
- **BlockUsageService** — finds all pages using a given reusable block

### InvoiceService

`app/Services/InvoiceService.php` wraps `spatie/laravel-pdf`:

```php
$invoiceService->download(Order $order): Response  // streams PDF to browser
$invoiceService->save(Order $order, string $path): void  // saves to disk
```

- Driver: `gotenberg` (production via `LARAVEL_PDF_DRIVER` env var), `dompdf` (tests)
- Blade template: `resources/views/pdf/invoice.blade.php`
- Routes: `GET /api/v1/orders/{reference}/invoice` (customer, ownership enforced), `GET /admin/ecommerce/orders/{order}/invoice`
- `ForceJsonResponse` middleware passes through `application/pdf` responses automatically

---

## 7. Models & Domain Logic

All models live in `app/Models/`. Key relationships and casts are listed below.

### Model Conventions

- Casts are defined in a `casts(): array` method (not the `$casts` property) per Laravel 12 convention.
- Slugs use `spatie/laravel-sluggable` (`HasSlug` trait).
- Translatable fields use `spatie/laravel-translatable` (`HasTranslations` trait).
- Media uses `spatie/laravel-medialibrary` (`HasMedia` + `InteractsWithMedia`).
- Activity log uses `spatie/laravel-activitylog` (`LogsActivity` trait).

### Translatable Models

| Model      | Translatable Fields                           |
|------------|-----------------------------------------------|
| `Product`  | `name`, `description`, `short_description`    |
| `Category` | `name`, `description`                         |
| `BlogPost` | `title`, `excerpt`, `content`                 |
| `Page`     | `title`, `excerpt`, `content`, `rich_content` |

The `SetLocale` middleware on the API group reads `?locale=` and sets the application locale for the request. Translatable models return the appropriate language transparently.

Database queries for translatable JSON fields:

```php
// In migrations/tests
->assertDatabaseHas('products', ['name->en' => 'My Product']);

// In queries
Product::query()->where('name->en', 'My Product');
Product::query()->whereJsonContainsLocale('name', 'en', $value);
```

### Key Model Relationships

```
User
 └─ Customer (hasOne)
     ├─ Cart (hasOne)
     │   └─ CartItems (hasMany)
     │       └─ ProductVariant (belongsTo)
     ├─ Orders (hasMany)
     │   ├─ OrderItems (hasMany)
     │   ├─ Payment (hasOne)
     │   ├─ Shipment (hasOne)
     │   └─ OrderStatusHistory (hasMany)
     └─ Wishlist (hasMany)

Product
 ├─ ProductType (belongsTo)
 ├─ Brand (belongsTo)
 ├─ Categories (belongsToMany)
 ├─ ProductVariants (hasMany)
 │   ├─ VariantAttributeValues (hasMany)
 │   │   └─ AttributeValue (belongsTo)
 │   └─ TaxRate (belongsTo)
 ├─ ProductImages (hasMany)
 ├─ ProductFlags (belongsToMany)
 └─ Promotions (belongsToMany via pivot)

Page
 ├─ PageSections (hasMany)
 │   └─ PageBlocks (hasMany)
 │       └─ BlockRelations (hasMany)
 └─ PageVersions (hasMany)
```

---

## 8. Observers

Observers are registered in `AppServiceProvider::registerObservers()`.

| Observer                       | Model                  | Purpose                                            |
|--------------------------------|------------------------|----------------------------------------------------|
| `ProductObserver`              | `Product`              | Syncs search index, handles slug generation        |
| `ProductVariantPriceObserver`  | `ProductVariant`       | Records price change to `PriceHistory` on `saving` |
| `CategoryObserver`             | `Category`             | Flushes category cache                             |
| `PageObserver`                 | `Page`                 | Flushes page cache via `PageCacheService`          |
| `WishlistObserver`             | `Wishlist`             | Side effects on wishlist changes                   |
| `NewsletterSubscriberObserver` | `NewsletterSubscriber` | Handles opt-in/opt-out logic                       |
| `NewsletterClickObserver`      | `NewsletterClick`      | Tracks click statistics on campaigns               |

To add a new observer, see [Section 14.12](#1412-adding-a-new-observer).

---

## 9. Traits & Concerns

Lives in `app/Concerns/`.

### HasVersions

Polymorphic versioning for any Eloquent model.

```php
use App\Concerns\HasVersions;

class BlogPost extends Model
{
    use HasVersions;

    protected array $versionedAttributes = ['title', 'content', 'excerpt', 'status'];
    protected int $maxVersions = 30;
}
```

**How it works:**

- `bootHasVersions()` hooks into `saved` and `deleted` model events.
- On every `saved` event where something changed (`wasChanged()`), a `ModelVersion` record is created with a snapshot of `$versionedAttributes`.
- `changes` stores a field-level diff from the previous version.
- Old versions are pruned to stay within `$maxVersions`.
- `restoreVersion(ModelVersion)` restores the snapshot fields and creates a new version entry.

**Methods available:**
- `$model->versions()` — `MorphMany` relation
- `$model->latestVersion()` — most recent version
- `$model->createVersion(string $event, ?string $changeNote): ModelVersion`
- `$model->restoreVersion(ModelVersion): void`

### PasswordValidationRules / ProfileValidationRules

Shared rule sets used in Fortify actions and settings requests.

---

## 10. Enums Reference

All enums are in `app/Enums/` and use PHP 8.1+ backed enum syntax.

| Enum                      | Values                                                                                                                                                                                                                                                 |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `AttributeTypeEnum`       | `text`, `select`, `multiselect`, `numeric`, `color`                                                                                                                                                                                                    |
| `AudienceTypeEnum`        | `all`, `segment`, `tags`                                                                                                                                                                                                                               |
| `BlogPostStatusEnum`      | `draft`, `scheduled`, `published`, `archived`                                                                                                                                                                                                          |
| `CampaignStatusEnum`      | (various campaign states)                                                                                                                                                                                                                              |
| `CampaignTriggerEnum`     | (trigger conditions)                                                                                                                                                                                                                                   |
| `CampaignTypeEnum`        | `broadcast`, `automated`, `scheduled`                                                                                                                                                                                                                  |
| `MenuLinkTypeEnum`        | `custom`, `category`, `product`, `page`                                                                                                                                                                                                                |
| `MenuLocationEnum`        | `header`, `footer`, `footer_legal`                                                                                                                                                                                                                     |
| `NotificationChannelEnum` | `email`, `sms`, `push`                                                                                                                                                                                                                                 |
| `NotificationStatusEnum`  | (notification states)                                                                                                                                                                                                                                  |
| `NotificationTypeEnum`    | (notification content types)                                                                                                                                                                                                                           |
| `OrderStatusEnum`         | `pending`, `awaiting_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` — used for labels, colors, and admin form validation. **Not** used as a model cast (see Order State Machine below).                               |
| `PageBlockTypeEnum`       | `hero_banner`, `rich_text`, `featured_products`, `categories_grid`, `promotional_banner`, `newsletter_signup`, `testimonials`, `image_gallery`, `video_embed`, `custom_html`, `two_columns`, `three_columns`, `accordion`, `tabs`, `form_embed`, `map` |
| `PageTypeEnum`            | `blocks`, `module`                                                                                                                                                                                                                                     |
| `PaymentProviderEnum`     | `p24`, `payu`, `stripe`, `cash_on_delivery`                                                                                                                                                                                                            |
| `ReturnStatusEnum`        | `pending`, `approved`, `rejected`, `return_label_sent`, `awaiting_return`, `received`, `inspected`, `refunded`, `closed`                                                                                                                               |
| `ReturnTypeEnum`          | (return request types)                                                                                                                                                                                                                                 |
| `ReviewStatusEnum`        | (review moderation states)                                                                                                                                                                                                                             |
| `SettingTypeEnum`         | (setting value types including encrypted)                                                                                                                                                                                                              |
| `ShipmentStatusEnum`      | (shipment tracking states)                                                                                                                                                                                                                             |
| `ShippingCarrierEnum`     | `inpost`, `dpd`, `dhl`, `pickup`                                                                                                                                                                                                                       |
| `WidgetSize`              | (dashboard widget size options)                                                                                                                                                                                                                        |
| `WidgetType`              | `stat`, `chart`, `table`, `recent_activity`, `quick_actions`                                                                                                                                                                                           |

### Order State Machine

The `Order` model uses `spatie/laravel-model-states` (`HasStates` trait). State classes live in `app/States/Order/`.

**Allowed transitions:**

| From               | To                        |
|--------------------|---------------------------|
| `pending`          | `processing`, `cancelled` |
| `awaiting_payment` | `paid`, `cancelled`       |
| `paid`             | `processing`, `refunded`  |
| `processing`       | `shipped`, `cancelled`    |
| `shipped`          | `delivered`               |
| `delivered`        | `refunded`                |

**Usage:**

```php
// Transition via the existing API (backwards-compatible)
$order->changeStatus(OrderStatusEnum::SHIPPED, 'admin', 'Dispatched');

// Direct state transition
$order->status->transitionTo(ShippedState::class);

// Read current status as string
(string) $order->status; // e.g. 'shipped'

// For labels/colors, keep using the enum
OrderStatusEnum::from((string) $order->status)->getLabel();
```

Invalid transitions throw `Spatie\ModelStates\Exceptions\CouldNotPerformTransition`.

---

## 11. Interfaces

### `App\Interfaces\PaymentGatewayInterface`

```php
interface PaymentGatewayInterface
{
    public function createPayment(Order $order, array $data): Payment;
    public function processPayment(Payment $payment, array $options = []): array;
    public function verifyPayment(Payment $payment): bool;
    public function refundPayment(Payment $payment, int $amount): bool;
    public function handleWebhook(array $payload): void;
}
```

Implementations: `P24Gateway`, `PayUGateway`, `CashOnDeliveryGateway` in `app/Infrastructure/Payments/`.

### `App\Interfaces\ShippingCarrierInterface`

```php
interface ShippingCarrierInterface
{
    public function createShipment(Order $order, array $data): Shipment;
    public function generateLabel(Shipment $shipment): string;
    public function trackShipment(Shipment $shipment): array;
    public function handleWebhook(array $payload): void;
}
```

Implementations: `InpostCarrier`, `DpdCarrier`, `DhlCarrier` in `app/Infrastructure/Shipping/`.

---

## 12. API Layer

### Versioning

All REST API routes are under `/api/v1/` with the named prefix `api.v1.*`. When introducing breaking changes, create a new `/api/v2/` group with its own controllers and resources.

### Response Format

All API responses are forced to JSON via `ForceJsonResponse` middleware. All endpoints use Eloquent API Resources (`app/Http/Resources/Api/`). Resources inherit from `JsonResource` or `ResourceCollection`.

### Cart Authentication

Guest carts use the `X-Cart-Token` header. Authenticated carts use Sanctum bearer tokens. The `CartService` handles both cases transparently.

### Idempotency

Mutating cart endpoints use the `idempotent` middleware (`grazulex/laravel-api-idempotency`). Clients should send an `Idempotency-Key` header to prevent duplicate operations on retry.

### API Documentation

Auto-generated OpenAPI docs via `dedoc/scramble` at `/docs/api`. The Scramble config in `AppServiceProvider::configureScramble()` adds Bearer token security.

### Public API Endpoints Summary

| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| `POST` | `/api/v1/auth/register`         | Register a new user             |
| `POST` | `/api/v1/auth/login`            | Login, returns Sanctum token    |
| `POST` | `/api/v1/auth/logout`           | Revoke token                    |
| `GET`  | `/api/v1/auth/me`               | Authenticated user details      |
| `GET`  | `/api/v1/products`              | Product listing (filterable)    |
| `GET`  | `/api/v1/products/{slug}`       | Product detail                  |
| `GET`  | `/api/v1/categories`            | Category tree                   |
| `GET`  | `/api/v1/blog/posts`            | Blog post listing               |
| `GET`  | `/api/v1/blog/posts/{slug}`     | Blog post detail                |
| `GET`  | `/api/v1/pages/{slug}`          | CMS page content                |
| `GET`  | `/api/v1/menus/{location}`      | Menu for a location             |
| `GET`  | `/api/v1/cart`                  | Current cart                    |
| `POST` | `/api/v1/cart/items`            | Add item to cart                |
| `POST` | `/api/v1/checkout`              | Place order (auth required)     |
| `GET`  | `/api/v1/locales`               | Available locales               |
| `GET`  | `/api/v1/translations/{locale}` | Translation strings (flat JSON) |

---

## 13. Admin SPA (Inertia + React)

### Technology Stack

| Library                    | Version | Purpose                                   |
|----------------------------|---------|-------------------------------------------|
| `@inertiajs/react`         | v2      | Server-driven SPA protocol                |
| `react`                    | v19     | UI framework                              |
| `tailwindcss`              | v4      | Utility CSS                               |
| `@dnd-kit/core`            | —       | Drag-and-drop (page builder)              |
| `@lexical/react`           | —       | Rich text editor                          |
| `@tanstack/react-table`    | —       | Data tables                               |
| `recharts`                 | —       | Charts (dashboard widgets)                |
| `radix-ui` / `@radix-ui/*` | —       | Accessible primitives (shadcn/ui pattern) |
| `lucide-react`             | —       | Icons                                     |

### Pages Directory

Pages live in `resources/js/pages/`. Every page is a React component that Inertia renders server-side.

```
resources/js/pages/
├── admin/
│   ├── dashboard.tsx
│   ├── cms/
│   │   ├── pages/        index, create, edit
│   │   ├── blocks/       index, create, edit
│   │   └── reusable-blocks/
│   ├── ecommerce/
│   │   ├── products/     index, create, edit
│   │   ├── orders/       index, show
│   │   ├── categories/   index, create, edit
│   │   └── ...
│   ├── blog/             index, create, edit
│   ├── newsletter/
│   ├── users/
│   └── settings/
├── auth/
│   ├── login.tsx
│   ├── register.tsx
│   └── two-factor-challenge.tsx
└── settings/
```

### Layouts

| Layout file                   | Used for                              |
|-------------------------------|---------------------------------------|
| `layouts/app-layout.tsx`      | All admin panel pages                 |
| `layouts/auth-layout.tsx`     | Login, register, password reset pages |
| `layouts/settings/layout.tsx` | Settings sub-pages                    |

### Shared Inertia Props

Defined in `HandleInertiaRequests::share()`:

```typescript
{
  name: string;              // App name from config
  auth: { user: User | null };
  can: { manageUsers: boolean };
  flash: { success: string | null; error: string | null };
  activeTheme: Theme | null;
  sidebarOpen: boolean;
  frontendUrl: string;       // Public website URL
  locales: Locale[];
}
```

Access in any page component:

```typescript
import { usePage } from '@inertiajs/react';
const { auth, can, flash, frontendUrl } = usePage().props;
```

### Wayfinder

TypeScript route functions are auto-generated from Laravel routes. Import from:
- `@/actions/` — controller-based (invokable or resource controllers)
- `@/routes/` — named routes

```typescript
import { show } from '@/actions/Admin/Ecommerce/ProductController';

// Navigate
router.get(show({ id: product.id }));

// Form submit
<Form action={store()} method="post">
```

Wayfinder regenerates automatically via the Vite plugin `@laravel/vite-plugin-wayfinder`.

### Sidebar

Add new admin sections to `resources/js/components/app-sidebar.tsx`. The sidebar is a grouped navigation list. Each item specifies a label, icon, and route.

### Dark Mode

Tailwind v4 dark mode uses `@custom-variant dark (&:is(.dark *))`. Toggle by adding/removing the `.dark` class on `<html>`. An inline script in `app.blade.php` applies the stored preference before first render to prevent flash.

### Real-time Notifications (SSE)

Notifications use Server-Sent Events:

- `GET /admin/notifications/stream` — SSE endpoint that polls every 3 seconds and streams events in a 25-second loop
- The client (`EventSource`) auto-reconnects on disconnect
- The bell icon in the top bar shows unread count and a dropdown list

---

## 14. Extension Patterns

### 14.1 Adding a New Admin CRUD Module

**Step 1: Model, migration, factory**

```bash
cd server
php artisan make:model MyModel -mf --no-interaction
```

Add casts, relationships, translatable fields, and sluggable config to the model. Follow existing models as reference (e.g. `app/Models/BlogPost.php`).

**Step 2: Form Requests**

```bash
php artisan make:request Admin/StoreMyModelRequest --no-interaction
php artisan make:request Admin/UpdateMyModelRequest --no-interaction
```

Always use Form Request classes. Never put validation inline in controllers.

**Step 3: Controller**

```bash
php artisan make:controller Admin/MyModelController --no-interaction
```

Keep controllers thin. Resolve the request in the controller, call a service if logic is complex, return `Inertia::render()` or `redirect()`.

Standard resource controller pattern:

```php
declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMyModelRequest;
use App\Http\Requests\Admin\UpdateMyModelRequest;
use App\Models\MyModel;
use Inertia\Inertia;
use Inertia\Response;

class MyModelController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/my-module/index', [
            'items' => MyModel::query()->paginate(20),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/my-module/create');
    }

    public function store(StoreMyModelRequest $request): \Illuminate\Http\RedirectResponse
    {
        MyModel::query()->create($request->validated());
        return redirect()->route('admin.my-models.index')
            ->with('success', 'Created successfully.');
    }

    public function edit(MyModel $myModel): Response
    {
        return Inertia::render('admin/my-module/edit', ['item' => $myModel]);
    }

    public function update(UpdateMyModelRequest $request, MyModel $myModel): \Illuminate\Http\RedirectResponse
    {
        $myModel->update($request->validated());
        return redirect()->route('admin.my-models.index')
            ->with('success', 'Updated successfully.');
    }

    public function destroy(MyModel $myModel): \Illuminate\Http\RedirectResponse
    {
        $myModel->delete();
        return redirect()->route('admin.my-models.index')
            ->with('success', 'Deleted.');
    }
}
```

**Step 4: Routes**

Add to the appropriate file under `routes/admin/`:

```php
Route::resource('my-models', MyModelController::class);
```

**Step 5: React Pages**

Create `resources/js/pages/admin/my-module/index.tsx`, `create.tsx`, `edit.tsx`. Use existing pages (e.g. `admin/faqs/`) as reference for structure and component usage.

**Step 6: Sidebar Entry**

Open `resources/js/components/app-sidebar.tsx` and add a new nav item:

```typescript
{
    title: 'My Module',
    href: route('admin.my-models.index'),
    icon: SomeIcon,
}
```

**Step 7: Tests**

```bash
php artisan make:test --pest Admin/MyModelControllerTest --no-interaction
```

Write feature tests covering `index`, `create`, `store`, `edit`, `update`, and `destroy`.

---

### 14.2 Adding a Payment Gateway

**Step 1: Implement the interface**

```php
// app/Infrastructure/Payments/StripeGateway.php
declare(strict_types=1);

namespace App\Infrastructure\Payments;

use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;

class StripeGateway implements PaymentGatewayInterface
{
    public function createPayment(Order $order, array $data): Payment { ... }
    public function processPayment(Payment $payment): array { ... }
    public function verifyPayment(Payment $payment): bool { ... }
    public function refundPayment(Payment $payment, int $amount): bool { ... }
    public function handleWebhook(array $payload): void { ... }
}
```

**Step 2: Add to enum** (already has `stripe` case in `PaymentProviderEnum`)

**Step 3: Register in `AppServiceProvider::register()`**

```php
$this->app->singleton(PaymentGatewayManager::class, function () {
    return new PaymentGatewayManager([
        PaymentProviderEnum::P24->value             => new P24Gateway(),
        PaymentProviderEnum::PAYU->value            => new PayUGateway(),
        PaymentProviderEnum::CASH_ON_DELIVERY->value => new CashOnDeliveryGateway(),
        PaymentProviderEnum::STRIPE->value          => new StripeGateway(),  // add this
    ]);
});
```

**Step 4: Add webhook route** in `routes/api.php`:

```php
Route::post('webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->name('api.v1.webhooks.stripe');
```

---

### 14.3 Adding a Shipping Carrier

Same pattern as payment gateways.

**Step 1:** Implement `App\Interfaces\ShippingCarrierInterface` in `app/Infrastructure/Shipping/MyCarrier.php`.

**Step 2:** Add case to `ShippingCarrierEnum`.

**Step 3:** Register in `ShippingCarrierManager` (find where it is instantiated, following the same pattern as `PaymentGatewayManager`).

---

### 14.4 Adding a Page Builder Block Type

**Step 1: Add the enum case**

```php
// app/Enums/PageBlockTypeEnum.php
case MyBlock = 'my_block';

public function label(): string
{
    return match ($this) {
        // ... existing ...
        self::MyBlock => 'My Block',
    };
}
```

**Step 2: Add block config schema**

Define the block's configuration schema in `config/blocks.php` following the existing structure.

**Step 3: Frontend block component (client)**

Create a React component in `client/components/page-builder/blocks/MyBlock.tsx`. The component receives the `configuration` object from the block record.

**Step 4: Admin editor component**

Create an editor form component in `resources/js/components/page-builder/blocks/my-block-editor.tsx` for configuring the block inside the admin page builder.

**Step 5: Register in block renderer**

Add the block type to the block renderer switch/map in the page builder component so the editor knows which editor to show for this block type.

---

### 14.5 Adding a Page Module Type

Page modules are data-driven page types (e.g. products catalogue, blog listing).

```php
// In a ServiceProvider or artisan command
$registry = app(ModuleRegistryService::class);

$registry->registerModule('my-module', [
    'name'                 => 'My Module',
    'icon'                 => 'layout',
    'description'          => 'Description of what this module does',
    'has_list_page'        => true,
    'has_detail_page'      => true,
    'list_route_pattern'   => '/my-module',
    'detail_route_pattern' => '/my-module/{slug}',
    'model_class'          => MyModel::class,
    'route_key_name'       => 'slug',
    'list_layouts'         => [
        'grid' => [
            'name'      => 'Grid',
            'component' => 'MyModuleGrid',
        ],
    ],
    'detail_layouts' => [
        'default' => [
            'name'      => 'Default Detail',
            'component' => 'MyModuleDetail',
        ],
    ],
]);

$registry->sync(); // call once to persist to database
```

---

### 14.6 Adding Model Versioning

```php
use App\Concerns\HasVersions;

class MyModel extends Model
{
    use HasVersions;

    /** Fields to snapshot on every save */
    protected array $versionedAttributes = ['name', 'content', 'status'];

    /** Maximum number of versions to retain */
    protected int $maxVersions = 30;
}
```

**Frontend: add the version history UI**

In the React edit page, add the `<VersionHistory>` component:

```typescript
import VersionHistory from '@/components/version-history';

// Inside the edit page JSX:
<VersionHistory modelType="my-model" modelId={item.id} />
```

**Backend: register the model type**

In `ModelVersionController`, add `my-model` to the `$allowedTypes` array to permit version API requests for this model type.

---

### 14.7 Adding Activity Logging

```php
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class MyModel extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
```

The activity log is automatically displayed in the admin Activity Log section.

---

### 14.8 Adding a Feature Flag

Feature flags are stored in the `settings` table under `group = 'features'`.

**Create the setting via seeder:**

```php
Setting::create([
    'group'       => 'features',
    'key'         => 'my_feature',
    'label'       => 'My Feature',
    'value'       => json_encode(false),
    'type'        => SettingTypeEnum::Boolean,
    'description' => 'Enables the My Feature module',
]);
```

**Check the flag in code:**

```php
$service = app(FeatureFlagService::class);

if ($service->isEnabled('my_feature')) {
    // feature is active
}
```

**In a route or middleware:**

```php
Route::middleware(['admin'])->group(function () {
    Route::get('/my-feature', [MyFeatureController::class, 'index'])
        ->can('manage-my-feature'); // or check inline
});
```

To gate an entire route group behind a feature flag, create a middleware that calls `FeatureFlagService::isEnabled()` and returns 404 if disabled.

---

### 14.9 Adding a Settings Group

Settings are stored in the `settings` table. Each row has `group`, `key`, `label`, `value` (JSON), `type`, `description`, and `is_public`.

**Seeding a new group:**

```php
$settings = [
    ['group' => 'integrations', 'key' => 'google_analytics_id', 'label' => 'Google Analytics ID',
     'value' => null, 'type' => SettingTypeEnum::String, 'description' => 'GA4 measurement ID'],
    ['group' => 'integrations', 'key' => 'hotjar_id', 'label' => 'Hotjar Site ID',
     'value' => null, 'type' => SettingTypeEnum::String, 'description' => 'Hotjar site ID'],
];

foreach ($settings as $data) {
    Setting::query()->updateOrCreate(
        ['group' => $data['group'], 'key' => $data['key']],
        $data
    );
}
```

**Reading settings:**

```php
$gaId = Setting::get('integrations', 'google_analytics_id');
Setting::set('integrations', 'google_analytics_id', 'G-XXXXXXXXXX');
```

Settings are cached per group for 1 hour. The cache key is `settings.{group}`. The cache is flushed in the `SettingsController` after saving.

**Mail settings** override is handled specially in `AppServiceProvider::configureMailFromSettings()` — it reads the `mail` group and overrides `config('mail.*')` at boot time, cached for 1 hour.

---

### 14.10 Adding Translatable Fields

```php
use Spatie\Translatable\HasTranslations;

class MyModel extends Model
{
    use HasTranslations;

    public array $translatable = ['name', 'description'];
}
```

The `SetLocale` middleware on the API group reads `?locale=en` (or whatever locale code) and sets `App::setLocale()`. Translatable models then return the correct language automatically.

In the admin React form, use a language switcher to let editors fill in each locale. Check existing forms (e.g. product edit) for the pattern.

---

### 14.11 Adding a New Role/Permission

The `spatie/laravel-permission` package manages roles and permissions.

**In a seeder:**

```php
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

// Create permissions
$permission = Permission::create(['name' => 'manage analytics']);

// Create a role and assign permissions
$role = Role::create(['name' => 'analyst']);
$role->givePermissionTo('manage analytics');

// Assign a role to a user
$user->assignRole('analyst');
```

**Protecting routes:**

```php
Route::middleware(['role:admin|analyst'])->group(function () {
    Route::get('/analytics', [AnalyticsController::class, 'index']);
});
```

**Protecting with gates/policies:**

```php
// In a Policy
public function viewAnalytics(User $user): bool
{
    return $user->hasPermissionTo('manage analytics');
}

// In a controller
$this->authorize('viewAnalytics');
```

**Adding to `AdminAccess` middleware:**

Currently `AdminAccess` allows `admin` and `editor` roles. If you add a new role that should access the admin panel, update the `hasRole()` check:

```php
if (!$request->user()?->hasRole(['admin', 'editor', 'analyst'])) {
    abort(404);
}
```

---

### 14.12 Adding a New Observer

**Step 1: Create the observer**

```bash
php artisan make:observer MyModelObserver --model=MyModel --no-interaction
```

**Step 2: Implement the needed hooks**

```php
declare(strict_types=1);

namespace App\Observers;

use App\Models\MyModel;

class MyModelObserver
{
    public function created(MyModel $model): void { ... }
    public function updated(MyModel $model): void { ... }
    public function deleted(MyModel $model): void { ... }
    public function saved(MyModel $model): void { ... }
}
```

**Step 3: Register in `AppServiceProvider::registerObservers()`**

```php
protected function registerObservers(): void
{
    // ... existing registrations ...
    MyModel::observe(MyModelObserver::class);
}
```

---

## 15. Query Builder, Filters & Sorts

The platform uses `spatie/laravel-query-builder` for admin index pages.

Query classes live in `app/Queries/Admin/`. Each follows the pattern:

```php
declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\MyModel;
use Spatie\QueryBuilder\QueryBuilder;

class MyModelIndexQuery extends QueryBuilder
{
    public function __construct()
    {
        parent::__construct(MyModel::query());

        $this
            ->allowedFilters(['name', 'status'])
            ->allowedSorts(['created_at', 'name'])
            ->defaultSort('-created_at');
    }
}
```

Custom filter classes go in `app/Filters/`. Custom sort classes go in `app/Sorts/`. Both extend the Spatie base classes (`Filter`, `Sort`).

Usage in a controller:

```php
public function index(): Response
{
    $items = (new MyModelIndexQuery())->paginate(20);
    return Inertia::render('admin/my-module/index', compact('items'));
}
```

---

## 16. Settings System

### Storage

Settings are stored in the `settings` database table:

| Column        | Type              | Description                                                         |
|---------------|-------------------|---------------------------------------------------------------------|
| `group`       | string            | Logical group name (e.g. `mail`, `features`)                        |
| `key`         | string            | Setting key within the group                                        |
| `label`       | string            | Human-readable label shown in admin                                 |
| `value`       | JSON              | The stored value                                                    |
| `type`        | `SettingTypeEnum` | Data type (string, boolean, integer, encrypted, etc.)               |
| `description` | text              | Help text shown in admin                                            |
| `is_public`   | boolean           | Whether the setting is exposed via the public settings API endpoint |

### API

```php
Setting::get('group', 'key', $default);  // read
Setting::set('group', 'key', $value);    // write
```

### Caching

Mail settings are cached for 1 hour at boot time. Other settings groups may be cached per-request or not at all, depending on frequency of access. The admin settings save action flushes the `settings.mail` cache key.

### Encrypted Settings

Settings with `type = SettingTypeEnum::Encrypted` are automatically encrypted with Laravel's `Crypt::encryptString()` on write and decrypted on read. Use this for SMTP passwords, API keys, etc.

---

## 17. Feature Flags

Feature flags map directly to settings in group `features`:

| Key          | Default | Controls                              |
|--------------|---------|---------------------------------------|
| `blog`       | `false` | Blog module and its API endpoints     |
| `ecommerce`  | `false` | Shop, products, orders, checkout      |
| `reviews`    | `false` | Product review system                 |
| `newsletter` | `false` | Newsletter subscription and campaigns |

Check via `FeatureFlagService::isEnabled(string $feature): bool`.

---

## 18. Versioning System

### Model Versioning (HasVersions trait)

For Eloquent models (Products, Blog Posts, Categories). See [Section 9](#9-traits--concerns) and [Section 14.6](#146-adding-model-versioning).

Versions are stored in the `model_versions` table as a polymorphic relation (`versionable_type`, `versionable_id`).

### Page Versioning (PageVersionService)

Pages use a separate, richer versioning system because they contain nested sections and blocks.

The `PageVersionService::createVersion()` snapshots the entire page tree (page attributes + all sections + all blocks) into the `page_versions` table.

Restore: `PageVersionService::restorePage(Page, PageVersion)` — clears the current structure and replays the snapshot through `PageBuilderSyncService::sync()`.

---

## 19. Page Builder Architecture

### Data Model

```
Page (page_type = 'blocks')
└─ PageSection (has position, section_type, layout, settings)
   └─ PageBlock (has position, type, configuration)
      └─ BlockRelation (polymorphic link to any Eloquent model)
```

### Sync Flow

1. The React page builder holds the entire page structure in component state (reducer-based with undo/redo).
2. On save, the full structure is serialised to a JSON snapshot and `POST`-ed to the `PageBuilderController`.
3. `PageBuilderSyncService::sync(Page, array $snapshot)` atomically deletes the old structure and recreates it.
4. A `PageVersion` snapshot is also created by `PageVersionService`.

### Undo/Redo

Implemented in `resources/js/hooks/use-builder-state.ts` using `useReducer` with two stacks (undo history, redo history). Maximum 20 steps.

### Copy/Paste Blocks

Clipboard stored in `localStorage` key `pb_clipboard`. Serialised block config is read on paste and inserted as a new block.

### Reusable Blocks

A `ReusableBlock` is a `PageBlock` record with a `reusable_block_id` foreign key. When rendered, the block uses the referenced `ReusableBlock`'s configuration. `BlockUsageService` can find all pages using a given reusable block.

---

## 20. Newsletter & Campaigns

### Subscription Flow

1. User submits email via `POST /api/v1/newsletter/subscribe`.
2. `NewsletterController::subscribe()` creates a `NewsletterSubscriber` with `is_active = false` and sends a confirmation email with a token.
3. User clicks the link → `GET /api/v1/newsletter/confirm/{token}` → subscriber is activated.
4. Unsubscribe: `GET /api/v1/newsletter/unsubscribe/{token}` or `POST /api/v1/newsletter/unsubscribe`.

The `NewsletterSubscriberObserver` handles side effects (e.g. syncing to external ESP if integrated).

### Campaign Sending

Campaigns are sent/scheduled from the admin panel. The `NewsletterCampaignController` handles create/update/send/schedule/duplicate.

Open and click tracking use `NewsletterOpen` and `NewsletterClick` models. The `NewsletterClickObserver` updates click statistics.

---

## 21. Testing

### Framework

Tests use **Pest 4** with the Laravel plugin. All tests are feature tests unless explicitly unit tests.

### Running Tests

```bash
# From server/
php artisan test --compact                          # all tests
php artisan test --compact tests/Feature/Admin/ProductControllerTest.php  # single file
php artisan test --compact --filter=test_admin_can_create_product          # filter by name
```

### Creating Tests

```bash
php artisan make:test --pest Admin/MyModelControllerTest --no-interaction
php artisan make:test --pest --unit MyServiceTest --no-interaction
```

### Conventions

- Use model factories. Check if the factory has states before building manually.
- Use `actingAs($user)` for authentication.
- Test HTTP responses, database state, and side effects.
- For translatable fields: `assertDatabaseHas('table', ['column->en' => 'value'])`.
- Do not use `DB::` in tests — use model factories and Eloquent.

### Example Feature Test

```php
<?php

use App\Models\User;
use App\Models\MyModel;

beforeEach(function () {
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('lists my models', function () {
    MyModel::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('admin.my-models.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/my-module/index')
            ->has('items.data', 3)
        );
});

it('creates a my model', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.my-models.store'), [
            'name' => ['en' => 'Test Model'],
        ])
        ->assertRedirect(route('admin.my-models.index'));

    expect(MyModel::query()->count())->toBe(1);
});
```

---

## 22. Code Quality Tools

| Tool                   | Command                      | Purpose                                              |
|------------------------|------------------------------|------------------------------------------------------|
| **Pint**               | `vendor/bin/pint --dirty`    | PHP code formatter (run before all PHP commits)      |
| **PHPStan / Larastan** | `vendor/bin/phpstan analyse` | Static analysis (level configured in `phpstan.neon`) |
| **Rector**             | `vendor/bin/rector process`  | Automated PHP refactoring (config in `rector.php`)   |
| **ESLint**             | `npm run lint`               | TypeScript/React linting                             |
| **Prettier**           | `npm run format`             | TypeScript/React formatting                          |
| **TypeScript**         | `npm run types`              | Type-checking (no emit)                              |

### Pre-commit Workflow

Before finalising any PHP change:

```bash
vendor/bin/pint --dirty
```

Before finalising any TypeScript change:

```bash
npm run types
npm run lint
npm run format
```

---

## 23. PHP & TypeScript Conventions

### PHP

- `declare(strict_types=1);` at the top of every PHP file — no exceptions.
- Use constructor property promotion.
- Explicit return types on all methods and functions.
- Enum keys are `TitleCase` (e.g. `case BlogPostStatus = 'blog_post_status'`).
- Casts in the `casts(): array` method, not `$casts` property.
- Never use `env()` outside of `config/` files.
- Always use Form Request classes — never inline `$request->validate()`.
- Prefer `Model::query()` over facades and `DB::`.
- Eager load relations to prevent N+1. Use `with()` in index queries.

### TypeScript / React

- Wayfinder-generated functions for all Laravel route references — never hardcode URLs.
- Use Inertia's `<Link>`, `useForm`, and `router` — never raw `fetch` for Inertia navigations.
- shadcn/ui component patterns from `resources/js/components/ui/`.
- Tailwind v4 with utility classes only — no inline styles.
- All admin page components are typed with Inertia's `PageProps` pattern.

---

## 24. Third-Party Packages

### PHP (production)

| Package                               | Purpose                                            |
|---------------------------------------|----------------------------------------------------|
| `dedoc/scramble`                      | Auto-generated OpenAPI documentation               |
| `grazulex/laravel-api-idempotency`    | Idempotency middleware for cart mutation endpoints |
| `grazulex/laravel-api-throttle-smart` | Smart throttling with configurable limits          |
| `inertiajs/inertia-laravel`           | Inertia.js server-side adapter                     |
| `laravel/fortify`                     | Headless authentication (login, register, 2FA)     |
| `laravel/sanctum`                     | API token authentication                           |
| `laravel/scout`                       | Full-text search (configured for Typesense)        |
| `laravel/telescope`                   | Debug assistant (dev only)                         |
| `laravel/wayfinder`                   | Auto-generates TypeScript route functions          |
| `spatie/laravel-activitylog`          | Audit trail for model changes                      |
| `spatie/laravel-data`                 | Typed DTOs                                         |
| `spatie/laravel-medialibrary`         | File uploads and image conversions                 |
| `spatie/laravel-permission`           | Roles and permissions                              |
| `spatie/laravel-query-builder`        | Filterable/sortable Eloquent queries via URL       |
| `spatie/laravel-sitemap`              | Sitemap generation                                 |
| `spatie/laravel-sluggable`            | Auto-slug generation                               |
| `spatie/laravel-translatable`         | Model field translations via JSON columns          |
| `typesense/typesense-php`             | Typesense search client                            |

### PHP (development only)

| Package                       | Purpose                       |
|-------------------------------|-------------------------------|
| `barryvdh/laravel-ide-helper` | IDE autocompletion helpers    |
| `fruitcake/laravel-debugbar`  | Debug toolbar                 |
| `laravel/pail`                | Real-time log tailing         |
| `laravel/pint`                | PHP code formatter            |
| `larastan/larastan`           | PHPStan plugin for Laravel    |
| `pestphp/pest`                | Test framework                |
| `rector/rector`               | Automated refactoring         |
| `driftingly/rector-laravel`   | Laravel-specific Rector rules |

### JavaScript

| Package                               | Purpose                                |
|---------------------------------------|----------------------------------------|
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag-and-drop in the page builder      |
| `@inertiajs/react`                    | Inertia.js React adapter               |
| `@lexical/react` + plugins            | Rich text editor in admin              |
| `@tanstack/react-table`               | Data tables                            |
| `@radix-ui/*`                         | Accessible UI primitives               |
| `leaflet`                             | Maps (store locations)                 |
| `lucide-react`                        | Icons                                  |
| `recharts`                            | Dashboard charts                       |
| `react-hot-toast`                     | Toast notifications                    |
| `tailwindcss` v4                      | Utility CSS                            |
| `@laravel/vite-plugin-wayfinder`      | Auto-regenerates Wayfinder route types |

---

## 25. Environment Variables

### Core Application

| Variable              | Description                                               | Default            |
|-----------------------|-----------------------------------------------------------|--------------------|
| `APP_NAME`            | Application name                                          | `Laravel`          |
| `APP_ENV`             | Environment (`local`, `production`)                       | `local`            |
| `APP_KEY`             | Encryption key (generate with `php artisan key:generate`) | —                  |
| `APP_DEBUG`           | Enable debug mode                                         | `true` (dev)       |
| `APP_URL`             | Application base URL                                      | `http://localhost` |
| `APP_LOCALE`          | Default application locale                                | `en`               |
| `APP_FALLBACK_LOCALE` | Fallback locale                                           | `en`               |

### Database

| Variable        | Description                        |
|-----------------|------------------------------------|
| `DB_CONNECTION` | Driver: `sqlite`, `mysql`, `pgsql` |
| `DB_HOST`       | Database host                      |
| `DB_PORT`       | Database port                      |
| `DB_DATABASE`   | Database name                      |
| `DB_USERNAME`   | Database user                      |
| `DB_PASSWORD`   | Database password                  |

### Cache, Queue & Sessions

| Variable           | Description                                     | Default    |
|--------------------|-------------------------------------------------|------------|
| `CACHE_STORE`      | Cache driver (`database`, `redis`, `memcached`) | `database` |
| `QUEUE_CONNECTION` | Queue driver (`database`, `redis`, `sync`)      | `database` |
| `SESSION_DRIVER`   | Session storage                                 | `database` |
| `SESSION_LIFETIME` | Session lifetime in minutes                     | `120`      |

### Redis

| Variable         | Description                  |
|------------------|------------------------------|
| `REDIS_HOST`     | Redis host                   |
| `REDIS_PORT`     | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | Redis password               |

### Mail

Mail configuration can be set either via `.env` or via the admin Settings panel. The admin panel settings override `.env` values (cached 1 hour).

| Variable            | Description                                         |
|---------------------|-----------------------------------------------------|
| `MAIL_MAILER`       | Driver: `smtp`, `sendmail`, `ses`, `mailgun`, `log` |
| `MAIL_HOST`         | SMTP host                                           |
| `MAIL_PORT`         | SMTP port                                           |
| `MAIL_USERNAME`     | SMTP username                                       |
| `MAIL_PASSWORD`     | SMTP password                                       |
| `MAIL_FROM_ADDRESS` | From email address                                  |
| `MAIL_FROM_NAME`    | From display name                                   |

### Search (Typesense)

| Variable            | Description                      |
|---------------------|----------------------------------|
| `SCOUT_DRIVER`      | Set to `typesense` to enable     |
| `TYPESENSE_API_KEY` | Typesense API key                |
| `TYPESENSE_HOST`    | Typesense host                   |
| `TYPESENSE_PORT`    | Typesense port (default: `8108`) |

### AWS S3 (Media Storage)

| Variable                | Description                     |
|-------------------------|---------------------------------|
| `AWS_ACCESS_KEY_ID`     | AWS access key                  |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                  |
| `AWS_DEFAULT_REGION`    | AWS region                      |
| `AWS_BUCKET`            | S3 bucket name                  |
| `FILESYSTEM_DISK`       | Set to `s3` to use S3 for media |

### Vite

| Variable        | Description                      |
|-----------------|----------------------------------|
| `VITE_APP_NAME` | App name exposed to the frontend |

---

## 26. Deployment Notes

### Build Steps

```bash
# Install PHP dependencies (no dev)
composer install --no-dev --optimize-autoloader

# Install and build frontend assets
npm ci
npm run build

# Optimise Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan icons:cache   # if using icon packages

# Run migrations
php artisan migrate --force

# Run seeders (first deploy only or when adding required seed data)
php artisan db:seed --class=RolePermissionSeeder --force
```

### Queue Worker

A queue worker must be running for:
- Email sending
- Newsletter campaign processing
- Search index updates
- Scheduled blog post publishing

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

Use Supervisor in production to keep the queue worker alive.

### Scheduled Commands

Add to server crontab:

```
* * * * * cd /path/to/server && php artisan schedule:run >> /dev/null 2>&1
```

Scheduled commands:
- `PublishScheduledBlogPosts` — publishes blog posts whose `scheduled_at` has passed
- `GenerateSitemap` — regenerates the XML sitemap

### Docker

A `docker-compose.yml` at the repo root provides:
- `php` — PHP 8.4 FPM + Supervisor (queue worker + PHP-FPM)
- `nginx` — Nginx with SSL termination (self-signed certs for local dev)
- `node` — Node.js for the Next.js client frontend

From the repo root, use the `Makefile` targets:

```bash
make up            # Start all containers
make down          # Stop containers
make shell         # Enter PHP container shell
make migrate       # Run migrations in container
make fresh         # Fresh migrate (drops all tables)
make fresh-seed    # Fresh migrate + seed all data
make test          # Run Pest tests in container
make quality       # Run Pint + PHPStan + TypeScript checks
```

### Seeder Execution Order

When seeding from scratch, the `DatabaseSeeder` runs seeders in this order:

```
RolePermissionSeeder
UserSeeder
ProductTypeSeeder
EcommerceDemoSeeder
PagesDemoSeeder
ThemeSeeder
SettingsSeeder
MenuSeeder
FormSeeder
BlogSeeder
LocaleSeeder
TranslationSeeder
```

This order matters because foreign key relationships must be satisfied (roles before users, product types before products, etc.).

### Performance Considerations

- **Search indexing:** Typesense is the recommended driver for production (`SCOUT_DRIVER=typesense`). SQLite's built-in full-text search is suitable for development.
- **Cache:** Use Redis for production cache and sessions (`CACHE_STORE=redis`, `SESSION_DRIVER=redis`).
- **Media:** Use S3 or compatible object storage for production file uploads.
- **Mail settings cache:** Flushed automatically when settings are saved. If mail stops working after a settings change, clear the cache manually: `php artisan cache:forget settings.mail`.
- **Telescope:** Disable in production by setting `TELESCOPE_ENABLED=false` or removing the service provider from `bootstrap/providers.php`.

---

## New Features (Faza 1 & 2)

### Invoice PDF Attachment

`OrderConfirmedNotification` now generates a PDF invoice and attaches it to the order confirmation email. It uses `InvoiceService::save()` to write the file to a temp path in `storage/app/invoices/`, reads the content via `Storage::get()`, attaches via `MailMessage::attachData()`, and deletes the temp file immediately (in a `finally` block). Configure the PDF driver per environment (`LARAVEL_PDF_DRIVER=gotenberg` for production, `dompdf` for tests).

### Cart Cleanup

`app/Console/Commands/CleanAbandonedCarts.php` — run via `php artisan cart:clean`. Deletes carts older than:
- **30 days** for authenticated customers (`customer_id` not null)
- **7 days** for guest carts (`customer_id` null)

Accepts `--auth-days` and `--guest-days` options. Runs daily via scheduler in `routes/console.php`.

### ProductsImport with Variants

`app/Imports/ProductsImport.php` now implements `OnEachRow` instead of `ToModel`, allowing full control over product/variant creation per row. CSV/XLSX columns:

| Column          | Required | Description                                                          |
|-----------------|----------|----------------------------------------------------------------------|
| `name`          | ✅        | Product name                                                         |
| `sku`           | ✅        | Product-level SKU (stored as `sku_prefix`)                           |
| `price`         | ✅        | Base price                                                           |
| `stock`         | —        | Default stock quantity                                               |
| `description`   | —        | Product description                                                  |
| `variant_sku`   | —        | If present, creates a separate variant                               |
| `variant_name`  | —        | Variant display name                                                 |
| `variant_price` | —        | Variant-specific price                                               |
| `variant_stock` | —        | Variant-specific stock                                               |
| `attribute_*`   | —        | Dynamic attribute columns (e.g. `attribute_color`, `attribute_size`) |

Products are identified/grouped by `sku_prefix`. Each `attribute_*` column auto-creates `Attribute` + `AttributeValue` records and links them via `VariantAttributeValue`.

### Abandoned Cart Recovery

`app/Jobs/SendAbandonedCartEmails.php` — runs hourly via scheduler. Finds carts updated between `now()-($hours+1)h` and `now()-$hours` that have items and no recent order. Sends `AbandonedCartNotification` to the cart owner.

**Settings** (group: `cart`):
- `abandoned_cart_hours` — hours to wait (default 24)
- `abandoned_cart_discount_code` — optional code included in the email

### Low-Stock Alerts

`app/Jobs/SendLowStockAlerts.php` — runs daily. Finds active variants where `stock_quantity > 0` and `stock_quantity <= stock_threshold`. Sends `LowStockNotification` to the configured email.

**Settings** (group: `inventory`):
- `low_stock_alert_email` — recipient email (required; no email = no alert sent)

### Post-Purchase Review Request

`app/Listeners/SendReviewRequestEmail.php` — handles the `OrderDelivered` event (auto-discovered). Sends `ReviewRequestNotification` to the order's customer, with a link to each product's page with `?review=1` query param to auto-open the review form.

### Blog RSS Feed

`GET /feed` — `BlogFeedController::__invoke()`. Returns RSS 2.0 XML, cached 1 hour per locale. Accepts `?locale=` query param. Only published posts included. Filters by `available_locales` (null = all locales, array = specific locales).

**Cache key:** `blog_rss_feed_{locale}` — invalidate manually with `Cache::forget('blog_rss_feed_en')` if needed.

### Product Comparison Endpoint

`GET /api/v1/products/compare?ids[]=1&ids[]=2` — returns comparison data for 2–4 active products. Validates that all products share the same `product_type_id`. Response includes `name`, `slug`, `price_min/max`, `category`, `brand`, and full `variants` with attribute values.

Errors:
- `422` — fewer than 2 or more than 4 IDs, or mixed product types
- `404` — fewer than 2 active products found from the provided IDs

---

## Admin Bar — Preview Mode

### Backend

`App\Http\Controllers\Admin\PreviewController` — invokable controller at `GET /admin/preview`.

**Parameters:**
- `url` (required) — full frontend URL to redirect to
- `entity_type` (optional) — `page|blog_post|product|category`
- `entity_id` (optional) — integer
- `entity_name` (optional) — display name
- `admin_url` (optional) — relative admin edit path (e.g. `/admin/cms/pages/5/edit`)

**Behaviour:** Sets a non-HttpOnly `admin_preview` cookie (2h TTL) with JSON payload `{ entity: { type, id, name, admin_url } }`. The `admin_url` is prepended with `config('app.url')` if it starts with `/`. Redirects to `url`.

**Preview buttons** are rendered on Page, BlogPost, Product, and Category edit pages as `<a href="/admin/preview?url=...&entity_*=...">` links with `target="_blank"`.

### Frontend (Next.js)

- `client/hooks/use-admin-preview.ts` — `useAdminPreview()` reads the `admin_preview` cookie on mount (client-only), parses JSON, returns `{ isPreview: boolean, entity: AdminPreviewEntity | null }`
- `client/components/admin/admin-bar.tsx` — `<AdminBar />` renders the fixed dark bar; reads `useAdminPreview()` internally; "Exit Preview" clears the cookie and reloads
- Wired in `client/app/layout.tsx` — `<AdminBar />` is at the top of the body; `pt-10` is added when `admin_preview` cookie is detected server-side
- `client/components/admin/admin-block-overlay.tsx` — `<AdminBlockOverlay>` wraps each page builder block in `SectionRenderer` when `isPreview` is true; hover shows block type label + "Edit" button linking to `builder?block={blockId}`
- `client/components/page-builder/page-renderer.tsx` — reads `admin_preview` cookie server-side, passes `isPreview` + `pageId` + `adminBaseUrl` to `SectionRenderer`
- Page builder (`resources/js/pages/admin/cms/pages/builder.tsx`) — on mount, reads `?block=` from URL, scrolls to the card with `data-block-id="{id}"` and pulses it

---

## Lexical Rich Text Editor

**Location:** `resources/js/components/ui/rich-text-editor/lexical/`

### Props (Editor component)

| Prop            | Type                     | Default              | Description                                |
|-----------------|--------------------------|----------------------|--------------------------------------------|
| `value`         | `string`                 | —                    | HTML content (controlled)                  |
| `onChange`      | `(html: string) => void` | —                    | Called on every change                     |
| `placeholder`   | `string`                 | `'Start writing...'` | Placeholder text                           |
| `className`     | `string`                 | —                    | CSS class on container                     |
| `maxHeight`     | `number \| string`       | —                    | Max height + scroll (e.g. `600` = `600px`) |
| `editable`      | `boolean`                | `true`               | Set `false` for read-only display          |
| `showWordCount` | `boolean`                | `true`               | Show word/character count footer           |

### Plugin files

| Plugin                     | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| `ToolbarPlugin`            | Full toolbar: block type, text format, alignment, link, insert |
| `FloatingLinkEditorPlugin` | Floating popover when cursor is inside a link                  |
| `FloatingTextFormatPlugin` | Bubble menu above text selection                               |
| `AutoLinkPlugin`           | Auto-converts typed URLs/emails to links                       |
| `HtmlPlugin`               | Serializes/deserializes HTML                                   |
| `MarkdownPlugin`           | Markdown shortcut transforms                                   |
| `CopyCodePlugin`           | Injects "Copy" button on `<code>` blocks via MutationObserver  |
| `WordCountPlugin`          | Shows word + character count in footer                         |

### Adding a new node type

1. Define the node in `resources/js/components/ui/rich-text-editor/` (follow `image-node.tsx` as a pattern)
2. Register it in `lexical/nodes.ts`
3. Add a theme class in `lexical/theme.ts`
4. Add CSS in `resources/css/editor.css`
5. Add toolbar trigger in `ToolbarPlugin.tsx`
