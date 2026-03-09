# Architecture

## Overview

Headless CMS + e-commerce platform — monorepo with two independent apps.

```
cms/
├── server/          Laravel 12 — backend API + admin SPA (Inertia/React)
├── client/          Next.js 16 — public storefront + blog
├── .docker/         Docker build contexts (php, nginx, node)
├── docs/            Technical documentation
├── ai/              AI operational guides
├── docker-compose.yml
└── Makefile
```

---

## System Components

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | Laravel | 12 |
| Admin SPA | Inertia.js + React | v2 + v19 |
| Public Frontend | Next.js | 16 |
| Database | MySQL | 8.0 |
| Cache | Redis | alpine |
| Queue | Redis (database fallback in dev) | — |
| Search | Typesense (via Scout) | — |
| PDF | Gotenberg | 8 |
| Mail (dev) | MailHog | — |
| Web server | Nginx | — |
| PHP | PHP-FPM | 8.4 |

---

## Infrastructure (Docker)

```
nginx          :80, :443   — reverse proxy (PHP + Node)
php            :5173       — Laravel + Vite dev server
node           :3000       — Next.js dev server
mysql          :3306       — primary database
redis          :6379       — cache + queue
gotenberg      —           — PDF generation
mailhog        :8025       — mail UI (dev only)
```

All services on `cms-network` bridge.

---

## Communication

```
Browser
  │
  ├── /admin/*       → Nginx → PHP-FPM → Inertia (server-side render) → React SPA
  │
  ├── /api/v1/*      → Nginx → PHP-FPM → Laravel JSON API (Sanctum)
  │     └── Used by: client/ (Next.js), mobile apps, 3rd-party
  │
  └── :3000          → Node → Next.js (SSR + static)
        └── Calls /api/v1/* for data
```

---

## Authentication

| Flow | Mechanism | Where |
|------|-----------|-------|
| Admin panel | Fortify (session/cookie) | `/admin/*`, `/settings/*` |
| API clients | Sanctum (Bearer token) | `/api/v1/*` |
| 2FA | TOTP via Fortify | Admin panel |

---

## Data Flow

1. **Admin creates content** → admin SPA (Inertia) → Laravel → MySQL
2. **Public reads content** → Next.js (SSR) → `GET /api/v1/*` → Laravel → MySQL/Redis cache
3. **Queue jobs** → Laravel Queue → Redis → Workers (supervisord in PHP container)
4. **Search** → Scout → Typesense

---

## Key Design Decisions

- **Monorepo** — single repo, independent deployments
- **No API versioning on admin** — Inertia is coupled to backend, always in sync
- **API versioned** — `/api/v1/` with named routes `api.v1.*` for external stability
- **Idempotency** — all mutating checkout/order endpoints are idempotent (middleware)
- **Amounts in cents** — all monetary values stored as integers (grosze/cents)
- **Soft deletes on Users + Customers** — GDPR compliance with 5-year financial data retention
- **Model state machine** — orders use `spatie/laravel-model-states`
- **Translatable content** — `spatie/laravel-translatable` on Product, Category, BlogPost, Page
