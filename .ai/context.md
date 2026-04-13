# Project Deep Context

Technical details that go beyond the quick-reference guide.md.
Useful for complex tasks, debugging, or onboarding.

---

## Auth Architecture

### Two separate systems (intentional)

| System | Use case | Session/Token |
|--------|----------|---------------|
| **Fortify** | Admin SPA at `/admin/*` | Session (cookie) |
| **Sanctum** | REST API at `/api/v1/*` | Bearer token |

- Fortify views → Inertia pages (`resources/js/pages/auth/`)
- Supports 2FA/TOTP (`TwoFactorAuthenticatable` trait on User)
- API tokens: `POST /api/v1/auth/login` → returns token

### User deletion flow (GDPR)
Always use `App\Actions\AnonymizeUserData::handle(User $user)`:
1. Revoke all Sanctum tokens
2. Anonymize: `name = "Deleted User #ID"`, `email = "deleted+ID@deleted.invalid"`
3. Cascade soft-delete Customer + hard-delete Addresses/Cart/Wishlists
4. Soft-delete User

Order, ProductReview, AffiliateCode are KEPT (legal/financial obligation).

---

## Rate Limiting (AppServiceProvider)

| Limiter | Limit | Applied to |
|---------|-------|-----------|
| `api.strict` | 10/min | Auth endpoints (login, register, password reset) |
| `api.public` | 60/min | Public API endpoints |
| `api.auth` | 300/min | Authenticated API endpoints |

---

## Middleware Stack

Configured in `bootstrap/app.php` (no Kernel.php in Laravel 12).

- `ForceJsonResponse` — all `/api/*` routes return JSON
- `AdminAccess` — checks `admin` or `editor` role (Spatie Permissions)
- `SetLocale` — reads `?locale=` query param on API routes
- `HandleInertiaRequests` — shares props: `auth.user`, `can.manageUsers`, `flash.success/error`, `activeTheme`, `sidebarOpen`, `frontendUrl`
- `EnsureEmailVerified` — on verified-only routes
- `LogApiRequests` — API request logging

---

## Page Builder Architecture

### Page types
- `Blocks` — sections → blocks hierarchy
- `Module` — single page module (registered in ModuleRegistryService)
- `RichText` — simple rich text content

### Versioning (draft/publish)
- `PageVersion` model — stores draft and published snapshots
- `PageBuilderSyncService` — sync changes between versions
- `PageVersionService` — publish/revert
- NOT using `HasVersions` trait (that's for Product/BlogPost/Category)

### Blocks hierarchy
`Page → PageSection → PageBlock → (nested blocks via BlockRelation)`

### Key services
- `ModuleRegistryService` — registers page module types
- `PageBuilderSyncService` — draft/publish lifecycle
- `PageVersionService` — versioning operations

---

## Model Versioning (HasVersions)

Applied to: Product (50 versions), BlogPost (30), Category (30)

- Trait: `app/Concerns/HasVersions.php`
- Storage: `model_versions` table (polymorphic)
- Admin UI: `GET /admin/versions/{type}/{id}` — compare, restore
- Allowed types in controller: `product`, `blog-post`, `category`
- **Page is excluded** — has own `PageVersion` system

---

## i18n / Locale System

### Backend
- `spatie/laravel-translatable` on: Product (name, description, short_description), Category (name, description), BlogPost (title, excerpt, content), Page (title, excerpt, content, rich_content)
- `available_locales` (JSON array) on BlogPost and Page — controls visibility per locale (`null` = all)
- `SetLocale` middleware reads `?locale=` query param
- DB queries for translatable: `where('title->en', 'value')` or `whereJsonContainsLocale()`

### Frontend (client)
- URL-based: `/en/products`, `/pl/blog` etc.
- `client/middleware.ts` — rewrites `/en/x` → `/x`, redirects `/x` → `/en/x`
- Locale from cookie (`locale`) for server components
- `useLocale()` hook — extracts from `usePathname()`
- `useLocalePath()` — returns `(path) => /${locale}${path}`
- `localePath()` — server-side helper from `client/lib/i18n.ts`
- `TranslationProvider` — receives `initialLocale` from root layout SSR

---

## Cart System

- Guest carts: token in localStorage as `cart_token`, sent via `X-Cart-Token` header
- `CartResource` (flat): `{ id, token, items, subtotal, discount_amount, total, discount_code, currency, items_count }`
- `CartItemResource`: `unit_price = variant.price`, `product.thumbnail = null`
- Abandoned cart cleanup: `cart:clean` command (daily), `SendAbandonedCartEmails` job (hourly)

---

## Checkout & Orders

- Idempotency middleware on all mutating checkout endpoints (prevents double-submit)
- Order amounts in **integer cents/grosze**
- `spatie/laravel-model-states` for order state machine
- States: AwaitingPayment → Pending → Processing → Shipped → Delivered | Cancelled | Refunded
- PDF invoices via `spatie/laravel-pdf` + Gotenberg container

---

## Newsletter System

- Subscribers → Segments → Campaigns
- Tracking: `newsletter_opens`, `newsletter_sends`, `newsletter_clicks`
- `NewsletterSubscriber` lacks Notifiable trait → use `Notification::route('mail', $email)->notify(...)`

---

## Admin SSE Notifications

- `GET /admin/notifications/stream` — Server-Sent Events, 25s keepalive loop, 3s poll
- Client: `EventSource` with auto-reconnect in Inertia layout

---

## Settings System

- DB table `settings`: `group`, `key`, `value`, `is_public`
- Mail config overridden at runtime from `settings` group `mail`, cached 1h
- Cache invalidated when settings saved
- Public settings: `GET /api/v1/profile/settings` (is_public = true only)

---

## Typesense Search

- `laravel/scout` + `typesense/typesense-php`
- Used for product/content search
- Typesense not included in Docker compose by default — add if needed

---

## PDF Generation

- `spatie/laravel-pdf` via Gotenberg container
- Used for order invoices
- Blade views in `resources/views/pdf/`

---

## Frontend (client/) API Type Reference

Check `client/types/api.ts` BEFORE writing any client code. Key gotchas:
- `CartItem`: `unit_price`, `subtotal`, `product` (not `variant.product`)
- `ProductVariant`: `attributes: Record<string, string>`
- `ProductReview`: `author`, `body` (not `reviewer_name`)
- `OrderItem`: `unit_price`, `subtotal`, `variant_sku`, `product_name`
- `Order`: use `items?.length` (no `items_count`)
- `BlogPost`: `featured_image: string|null`, `author: { id, name }|null`

---

## Factories Available

`User`, `Category`, `Product`, `ProductType`, `BlogPost`, `BlogCategory`, `Page`, `Currency`, `Discount`, `Promotion`, `Faq`, `Store`, `Customer`, `Address`

Missing factories (create if needed): `Order`, `OrderItem`, `ProductVariant`, `ShippingMethod`
