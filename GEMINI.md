# GEMINI.md — CMS Monorepo

Headless CMS + e-commerce platform. Monorepo: `server/` (Laravel 12 backend + Inertia/React admin SPA) · `client/` (Next.js 16 public storefront).

> Entry point for Gemini CLI. Carries the compact non-negotiable core; read `.ai/` for depth:
>
> - **`.ai/routing.md`** — when to read which file, when to verify in Docker
> - **`.ai/guide.md`** — feature map (relevant section only)
> - **`.ai/rules.md`** — canonical rules: MUST/FORBIDDEN, task routing, Docker, quality gates, GDPR
> - **`.ai/context.md`** — deep technical context: auth, cart, i18n, payments, page builder
> - **`.ai/mcp.md`** — MCP servers · **`.ai/commit-rules.md`** — atomic-commit convention
>
> `server/GEMINI.md` is auto-managed by Laravel Boost — do not edit it.

---

## MUST (short)

- Docker-only commands: no host `php artisan`, `pint`, `npm`. Never run `npm run build` during local dev.
- Done criteria: run `make check` before saying task is complete.
- Commit criteria: run `make fix && make check`.
- If containers are down: run `docker compose ps`, report blocker, stop.
- Do not ask the user to run checks you can run in Docker.
- Read `.ai/guide.md` by relevant section only.
- Use `.ai/rules.md` for full quality gates and forbidden actions.
- For backend/admin code use `.cursor/rules/backend.mdc`; for storefront use `.cursor/rules/frontend-client.mdc`.
- No branch/commit/push without explicit user consent.
- Keep changes scoped to the task; avoid drive-by refactors.
