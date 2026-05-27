# client/AGENTS.md — Next.js 16 Public Frontend

Part of the monorepo. Entry point for Codex and `AGENTS.md`-aware tools working in `client/`.

> Start with root `AGENTS.md` + `.ai/routing.md` (what to read / what to run).
> Client-specific rules: `client/CLAUDE.md`. Deep context lives in `.ai/context.md`.

---

## MUST (client, compact)

- Docker-only `npm` commands. Never run host `npm`.
- After code changes, run `make check` before claiming the task is done.
- Before commit, run `make fix && make check`.
- Next.js conventions live in `client/CLAUDE.md` (Server vs Client components, i18n, metadata/SEO, types rules).
- For API response fields, always check `client/types/api.ts`.
- No branch/commit/push without explicit user approval.
