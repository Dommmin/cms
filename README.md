# CMS

A headless CMS and e-commerce platform — monorepo with a Laravel 12 admin backend and a Next.js 16 public storefront.

## Architecture

| App | Path | Stack |
|-----|------|-------|
| **Admin SPA + API** | `server/` | Laravel 12, Inertia/React, Pest |
| **Public Frontend** | `client/` | Next.js 16, React 19, TanStack Query |

REST API: `/api/v1/*` · Admin SPA: `/admin/*` (Inertia)

## Features

### CMS / Content
- **Page Builder** — drag-and-drop blocks, sections, reusable templates, draft/publish versioning, live preview, mobile preview, undo/redo, copy/paste
- **Blog** — posts with rich text (Lexical), categories, scheduling, SEO, view counts
- **Forms** — form builder, submissions, email notifications
- **Media** — file upload, search (spatie/medialibrary)
- **Menus** — CRUD with link types
- **FAQ** — reorderable with toggle
- **Themes** — multiple themes, activate/deactivate
- **Stores** — physical locations with map

### E-commerce
- **Products** — variants, attributes, product types, categories, images, price history, Omnibus 30-day low price
- **Orders** — full lifecycle state machine, PDF invoices, export
- **Cart** — token-based guest cart, abandoned cart emails
- **Checkout** — multi-step, idempotency, shipping, payments
- **Payments** — PayU (BLIK, Apple Pay, Google Pay, redirect) + Przelewy24
- **Discounts & Promotions** — stackable, conditions, product/category targeting
- **Shipping Methods** — carriers, pickup points (InPost)
- **Returns** — return requests with status history
- **Wishlists** — per customer
- **Reviews** — with images, helpful votes, moderation
- **Affiliates & Referrals** — codes, commission tracking

### Users & Auth
- **Admin auth** — Laravel Fortify (session), 2FA/TOTP
- **API auth** — Laravel Sanctum (Bearer token)
- **Roles** — admin, editor (Spatie Permissions)
- **GDPR** — soft-delete + PII anonymization, data export (Art. 15), user trash, cookie consents

### Newsletter
- Subscribers, segments, campaigns, open/click tracking

### System
- **Enterprise SEO** — `meta_robots`, `og_image`, `sitemap_exclude`, OG/Twitter Card, dynamic robots.txt, SERP preview in admin
- **Schema.org** — WebSite, Organization, BlogPosting, Product, LocalBusiness, FAQPage
- **i18n** — URL-based locales (`/en/`, `/pl/`), translatable models, inline admin editing
- **Model Versioning** — Product, BlogPost, Category (compare + restore UI)
- **Settings** — 6 groups, DB-driven, cached, admin UI
- **Notifications** — SSE stream in admin panel
- **Activity Log** — key model audit trail
- **Health Checks** — spatie/laravel-health endpoint
- **DataLayer / GTM** — e-commerce events (view, cart, checkout, purchase)
- **Playwright E2E** — smoke, cart, i18n test suites

## Getting Started

All commands run in Docker. Install [Docker](https://docs.docker.com/get-docker/) first, then:

```bash
cp server/.env.example server/.env
make up          # Start containers
make migrate     # Run migrations
make fresh       # Fresh migrate + seed (demo data)
```

Access:
- **Admin panel**: http://localhost/admin
- **Public frontend**: http://localhost:3000
- **API**: http://localhost/api/v1

Default admin credentials (after seeding): `admin@example.com` / `password`

## Makefile Commands

```bash
make up           # Start all containers
make down         # Stop containers
make shell        # Enter PHP container
make migrate      # Run migrations
make fresh        # Fresh migrate + seed
make test         # Run PHP tests (Pest)
make quality      # Pint + PHPStan
make e2e          # Run Playwright E2E tests
make e2e-report   # View E2E test report
```

Direct Docker commands (when you need specific args):

```bash
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> Never run `php artisan` or `vendor/bin/pint` directly on the host — it has no DB/Redis access.

## Tech Stack

**Backend**: Laravel 12, Fortify, Sanctum, Inertia v2, Scout + Typesense, spatie/permission, spatie/medialibrary, spatie/translatable, spatie/model-states, spatie/activitylog, spatie/health, spatie/pdf + Gotenberg, maatwebsite/excel

**Frontend (client)**: Next.js 16, React 19, TanStack Query, Axios, Zod, react-hook-form, Tailwind v4, Leaflet, Recharts, Playwright

**Frontend (admin)**: Inertia React v2, Radix UI, shadcn/ui, TanStack Table, Lexical RTE, DnD Kit

## Project Structure

```
server/   — Laravel backend + admin SPA
client/   — Next.js public frontend
ai/       — AI context files (guide.md, context.md, rules.md)
docs/     — Architecture and developer documentation
k8s/      — Kubernetes manifests
scripts/  — Utility scripts
```

See [`ai/guide.md`](ai/guide.md) for the full feature map, key paths, and conventions.
