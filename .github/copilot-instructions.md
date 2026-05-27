# GitHub Copilot Instructions — CMS Monorepo

Headless CMS + e-commerce. Monorepo: `server/` (Laravel + Inertia/React admin) and `client/` (Next.js storefront).

Use `.ai/routing.md` first for the minimal routing matrix (what to read / what to run).

## Must Follow

- Run all commands in Docker only.
- After code changes, run `make check` before claiming task is done.
- Before commit, run `make fix && make check`.
- Never ask the user to run checks if the agent can run them.
- Never run host `php artisan`, `pint`, or `npm`.
- Read `.ai/guide.md` by section only (do not load whole file by default).
- Use `.ai/rules.md` for canonical MUST/FORBIDDEN and quality gates.
- Use `.cursor/rules/backend.mdc` for `server/resources/js/**` and `server/**/*.php`.
- No branch/commit/push without explicit user approval.
- Keep diffs minimal; no drive-by refactors.
