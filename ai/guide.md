# CMS Project — AI Guide

> This is the primary operational memory for AI. Read this first on every session.
> When a new feature is implemented, update this file under the relevant section.

---

## What This Project Is

A **headless CMS + e-commerce platform** with two apps in one monorepo:

| App | Path | Tech | Purpose |
|-----|------|------|---------|
| **Admin SPA** | `server/` | Laravel 12 + Inertia/React | Content management, orders, users, settings |
| **Public Frontend** | `client/` | Next.js 16 | Storefront, blog, pages for end users |

Communication: REST API (`/api/v1/*`) + Inertia protocol for admin

---

## Implemented Features

### CMS / Content
- **Page Builder** — drag-and-drop blocks, sections, reusable blocks, draft/publish versioning, live preview, mobile preview, undo/redo, copy/paste blocks
- **Themes** — multiple themes, activate/deactivate
- **Menus** — CRUD, menu items with link types
- **Forms** — form builder, submissions, email notifications
- **FAQ** — CRUD with reorder and toggle
- **Media** — upload, search, spatie/medialibrary
- **Locales + Translations** — CRUD, inline edit, URL-based locale (`/en/`, `/pl/`)
- **Blog** — posts (markdown/richtext), categories, featured, scheduling, SEO, views count
- **Stores** — physical store locations with map

### E-commerce
- **Products** — variants, attributes, product types, categories, flags, images (spatie/medialibrary), price history
- **Orders** — full lifecycle, status machine, invoices (PDF), export
- **Cart** — token-based guest cart, abandoned cart cleanup + emails
- **Checkout** — multi-step, shipping, payment providers, idempotency
- **Discounts + Promotions** — conditions, stackable, product/category targeting
- **Shipping Methods** — carriers, pickup
- **Returns** — return requests, status history
- **Wishlists** — per customer
- **Reviews** — with images, helpful votes, moderation
- **Affiliates + Referrals** — codes, commission tracking (pending/approved/paid)

### Newsletter
- Subscribers, segments, campaigns (with tracking: opens, clicks, sends)

### Users / Auth
- **Admin auth**: Laravel Fortify (session), 2FA/TOTP
- **API auth**: Laravel Sanctum (tokens)
- **Roles**: admin, editor (Spatie Permissions)
- **GDPR**: soft-delete + PII anonymization (`AnonymizeUserData`), data export (Art. 15), user trash (admin)

### System / Infrastructure
- **Settings** — 6 groups (general, mail, etc.), DB-driven, cached 1h, admin UI
- **Notifications** — SSE stream, channels, admin panel
- **Activity Log** — spatie/activitylog on key models
- **Model Versioning** — Product, BlogPost, Category (50/30/30 versions), compare + restore UI
- **Health Checks** — spatie/laravel-health endpoint
- **Dashboard Widgets** — configurable per-user
- **Cookie Consents** — GDPR, read-only admin view
- **Schema.org** — WebSite, Org, BlogPosting, Product, LocalBusiness, FAQPage (client)
- **Sitemap** — auto-generated
- **DataLayer / GTM** — view_item, remove_from_cart, begin_checkout, purchase, search events wired (client)
- **GDPR Data Export** — "Download my data" button in profile page, calls `GET /api/v1/profile/export`
- **Promo Badge %** — `discount_percentage` field in ProductData/ProductResource, shown on product cards
- **Recently Viewed** — `use-recently-viewed.ts` hook, `<RecentlyViewed />` component (localStorage, max 10)
- **Product Comparison** — `use-comparison.ts`, `<CompareButton />`, `<ComparisonBar />`, `/compare` page (max 4)
- **Block Templates Library** — `SectionTemplate` model/seeder (8 templates), admin CRUD at `/admin/section-templates`, in sidebar
- **Social Login** — Google + GitHub via `laravel/socialite` v5, `SocialLoginController`, `GET /api/v1/auth/social/{provider}/redirect` + `POST callback`, `<SocialLoginButtons />`, callback page at `/(auth)/social/callback`

---

## Key Paths

### Backend (`server/`)
| What | Where |
|------|-------|
| Models | `app/Models/` |
| API Controllers | `app/Http/Controllers/Api/V1/` |
| Admin Controllers | `app/Http/Controllers/Admin/` |
| Services | `app/Services/` |
| Actions | `app/Actions/` |
| Events | `app/Events/` |
| Jobs | `app/Jobs/` |
| Enums | `app/Enums/` |
| API Resources | `app/Http/Resources/Api/` |
| Form Requests | `app/Http/Requests/` |
| Policies | `app/Policies/` |
| Factories | `database/factories/` |
| Migrations | `database/migrations/` |
| Seeders | `database/seeders/` |
| Admin Routes | `routes/admin.php` + `routes/admin/*.php` |
| API Routes | `routes/api.php` |
| Console Schedule | `routes/console.php` |
| Inertia Pages | `resources/js/pages/` |
| UI Components | `resources/js/components/ui/` |
| Wayfinder Routes | `resources/js/actions/` (auto-generated) |
| Tests | `tests/Feature/` + `tests/Unit/` |

### Frontend (`client/`)
| What | Where |
|------|-------|
| Pages | `app/` (Next.js App Router) |
| API calls | `api/` |
| Hooks | `hooks/` |
| Components | `components/` |
| Types | `types/api.ts` |
| Server fetch | `lib/server-fetch.ts` |
| Client fetch | `lib/axios.ts` |
| i18n | `lib/i18n.ts` |
| Schema.org | `lib/schema.ts` |

---

## Critical Conventions

### PHP
- `declare(strict_types=1)` at top of every file
- Constructor property promotion
- Explicit return types
- `casts()` method (not `$casts` property)
- `Model::query()` never `DB::` for queries
- Eager load relations — no N+1
- Form Requests for all validation (never inline)
- `env()` only inside `config/` files

### TypeScript / React
- Wayfinder for all route references (`@/actions/` or `@/routes/`)
- `<Form>` component (Inertia) for forms
- `<Link>` (Inertia) for navigation, never `<a>`
- `serverFetch()` for server components, `api` (axios) for client components
- Check `client/types/api.ts` before writing any API call

### Testing
- Every feature needs tests — `php artisan make:test --pest Name`
- Run: `php artisan test --compact`
- Use factories; check for existing states before creating manually
- `assertSoftDeleted` for soft-delete models, not `assertDatabaseMissing`

### Database
- Docker: `docker compose exec php php artisan migrate`
- Soft deletes: User, Customer (+ Brand) use `SoftDeletes`
- Translatable: Product, Category, BlogPost, Page (spatie/laravel-translatable)

---

## Docker Commands (from repo root)

```bash
make up            # Start all containers
make down          # Stop containers
make shell         # Enter PHP container
make migrate       # Run migrations
make fresh         # Fresh migrate + seed
make test          # Run tests
make quality       # Pint + PHPStan

# Always use docker compose exec — never run php/pint directly (no DB/Redis on host)
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php vendor/bin/pint --dirty
```

---

## Seeder Order

`RolePermissionSeeder → UserSeeder → ProductTypeSeeder → EcommerceDemoSeeder → DiscountSeeder → PromotionSeeder → FormSeeder → PagesDemoSeeder → SectionTemplateSeeder → ThemeSeeder → SettingsSeeder → ShippingMethodSeeder → MenuSeeder → BlogSeeder → LocaleSeeder → TranslationSeeder → DashboardWidgetSeeder`

---

## Packages (key)

**Backend**: Laravel 12, Fortify, Sanctum, Inertia v2, Wayfinder, Scout + Typesense, spatie/permission, spatie/medialibrary, spatie/translatable, spatie/model-states, spatie/query-builder, spatie/activitylog, spatie/health, spatie/pdf, maatwebsite/excel, Telescope, Boost (dev)

**Frontend (client)**: Next.js 16, React 19, TanStack Query, Axios, Zod, react-hook-form, Tailwind v4, Leaflet, Recharts

**Frontend (admin)**: Inertia React v2, Radix UI, shadcn/ui, TanStack Table, Tiptap, DnD Kit, Wayfinder

---

## Current Test Count

291 passing, 1 skipped, 1 pre-existing fail (ThemeSeederTest — missing 3rd theme slug) (as of 2026-03-09)
