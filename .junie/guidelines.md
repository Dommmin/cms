# Junie Guidelines — CMS Monorepo

Headless CMS + e-commerce platform. Monorepo: `server/` (Laravel 12 backend + Inertia/React admin SPA) · `client/` (Next.js 16 public storefront).

> Entry point for Junie. Carries the compact non-negotiable core; read `.ai/` for depth:
>
> - **`.ai/routing.md`** — when to read which file, when to verify in Docker
> - **`.ai/guide.md`** — feature map (relevant section only)
> - **`.ai/rules.md`** — canonical rules: MUST/FORBIDDEN, task routing, Docker, quality gates, GDPR
> - **`.ai/context.md`** — deep technical context: auth, cart, i18n, payments, page builder
> - **`.ai/commit-rules.md`** — atomic-commit convention
>
> `server/.junie/guidelines.md` is auto-managed by Laravel Boost — do not edit it.

---

## MUST (short)

- Docker-only commands; never host `php artisan`, `pint`, `npm`.
- Done criteria: run `make check` before saying task is complete.
- Commit criteria: run `make fix && make check`.
- Container failure: `docker compose ps`, report blocker, stop.
- Never ask user to run checks that the agent can run in Docker.
- Read `.ai/guide.md` by relevant section only (no full-file preload).
- Use `.ai/rules.md` for canonical MUST/FORBIDDEN and quality gates.
- For `server/**` follow `.cursor/rules/backend.mdc`; for `client/**` use `.cursor/rules/frontend-client.mdc`.
- Branch/commit/push require explicit user approval.
- Keep changes narrow and task-focused.
