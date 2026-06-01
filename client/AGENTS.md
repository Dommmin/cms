# client/AGENTS.md — Next.js 16 Public Frontend

Part of the monorepo. Entry point for Codex and `AGENTS.md`-aware tools working in `client/`.

> Start with root `AGENTS.md` + `.ai/routing.md` (what to read / what to run).
> Client-specific rules: `client/CLAUDE.md`. Deep context lives in `.ai/context.md`.

---

## MUST (client, compact)

- Docker-only `npm` commands. Never run host `npm`.
- During implementation, write code that should already satisfy the repo toolchain; do not rely on `make fix` for avoidable cleanup.
- Run `make fix && make check` only before deploy / final release validation.
- Next.js conventions live in `client/CLAUDE.md` (Server vs Client components, i18n, metadata/SEO, types rules).
- For API response fields, always check `client/types/api.ts`.
- Prefer targeted client verification while iterating when needed (`docker compose exec node npm run types`, `docker compose exec node npm run lint`, touched tests) instead of the full pipeline.
- No branch/commit/push without explicit user approval.
