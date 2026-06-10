# AGENTS.md — CMS Monorepo

Headless CMS + e-commerce platform. Monorepo: `server/` (Laravel 12 backend + Inertia/React admin SPA) · `client/` (Next.js 16 public storefront).

> This file is the entry point for Codex and any tool that reads `AGENTS.md`. It carries the compact
> non-negotiable core. For depth, read the shared knowledge base in `.ai/`:
>
> - **`.ai/routing.md`** — **when to read which file, when to run which Docker command** (read this if unsure)
> - **`.ai/guide.md`** — feature map (open **relevant section only**, not whole file)
> - **`.ai/rules.md`** — MUST/FORBIDDEN, Docker, quality gates, GDPR
> - **`.ai/context.md`** — deep context (auth, cart, i18n, payments, page builder)
> - **`.ai/mcp.md`** · **`.ai/commit-rules.md`** — MCP docs · commits
>
> `server/AGENTS.md` is auto-managed by Laravel Boost (package versions + skills) — do not edit it.
> Boost is the source for version-specific docs: use its `search-docs` MCP tool before code changes.

---

## Commands (always via Docker)

```bash
# Makefile shortcuts (from repo root)
make up / make down / make shell / make migrate / make fresh / make test / make quality

# Verification (Docker only — see .ai/routing.md)
make check  # run only before deploy / final release validation; CI mirror
make fix    # run only before deploy, immediately before make check

# Direct — when you need specific args
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run `php artisan`, `pint`, or `npm` directly** — the host has no DB/Redis access.
> **NEVER run `npm run build`** during development while the dev server is running (it corrupts `.next` cache and breaks Turbopack/HMR).
> If a container is down, report it and stop — do not fall back to the host.

---

## Per-project entry points

- **Server (Laravel + Inertia admin)**: `server/AGENTS.md` (auto-managed by Boost; version-specific)
- **Client (Next.js storefront)**: `client/AGENTS.md`

## Preferred Global Codex Skills

- **`ux-ui-review`**: use for UI/UX reviews of storefront pages, admin panels, forms, dashboards, checkout, and page-builder screens; prefer concrete component-level feedback.
- **`architecture-review`**: use for structural review of Laravel, Inertia, Next.js, payments, search, queues, and module boundaries.
- **`laravel-senior-review`**: use for backend-focused Laravel review of services, controllers, validation, Eloquent, transactions, authorization, and tests.
- **`glitchtip-triage`**: use when a task starts from a GlitchTip issue, event, stack trace, or production error.
- **`codebase-recon`**: use before larger refactors, unfamiliar subsystems, or bug hunts that likely depend on git history, hotspots, and recent change patterns.
- **`webapp-testing`**: use for dynamic UI verification in `client/` and the Inertia admin SPA in `server/`; prefer targeted Playwright checks, screenshots, and browser log inspection over ad hoc guessing.
- Built-in session skills already preferred when available: `gh-fix-ci` for failing GitHub Actions, `gh-address-comments` for PR review follow-up, `browser` for local browser interaction, `seo-audit` for storefront SEO diagnostics.

## Project Structure

```
server/          Laravel backend + Inertia/React admin SPA
  app/Models/                  Eloquent models
  app/Http/Controllers/Api/V1/ REST API controllers (extend ApiController)
  app/Http/Controllers/Admin/  Admin SPA controllers (Inertia)
  app/Services/                Business logic (fat services, thin controllers)
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

## MUST (compact)

This repo’s routing/verification matrix lives in `.ai/routing.md`.

- **Docker-only** commands. Never run host `php artisan`, `pint`, `npm`. Never run `npm run build` during local dev.
- **Done criteria during implementation**: write code that should already satisfy the existing toolchain; do not rely on `make fix` to clean up avoidable issues.
- **Full verification**: run `make fix && make check` only before deploy / final release validation, not after every coding task.
- If containers are down: `docker compose ps`, report blocker, stop (no host fallback).
- Read `.ai/guide.md` by **relevant section only** (no full-file preload).
- Use `.ai/rules.md` for canonical MUST/FORBIDDEN and quality gates.
- Admin SPA routes: Wayfinder (`@/actions/`, `@/routes/`) — no hardcoded strings.
- `.tsx` files: no inline `type/interface` — keep types in `.ts`.
- Static analysis & linters: do not silence by default. Never add `eslint-disable` (any form), `@ts-ignore`, `@ts-expect-error`, `@phpstan-ignore-*`, or update/create `server/phpstan-baseline.neon` unless there is a documented reason and no safe code-level fix exists. If unavoidable, suppress the narrowest possible rule/line and add a short inline explanation. Never regenerate/expand PHPStan baseline without explicit approval.
- Write code to pass the current stack on first pass: match 2-3 nearby files, keep imports/usages clean, preserve strict types, avoid unused code, keep TS/PHP types explicit, and follow existing Laravel/Inertia/Next patterns instead of inventing new ones.
- Prefer narrow, targeted verification while iterating when needed (for example a touched feature test or a file-scoped lint/type check) instead of the full pipeline.
- No branch/commit/push without explicit user approval.
- Keep diffs minimal; no drive-by refactors.
