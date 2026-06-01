# AI routing — when to read what, when to run what

> **~40 lines.** Entry points (`AGENTS.md`, `global.mdc`) link here instead of duplicating long rules.
> Do **not** read `.ai/guide.md` whole-file unless you need a feature map or are adding a feature.

## Read on demand

| Situation | Read (section or file) |
|-----------|-------------------------|
| New area / "where is X?" | `.ai/guide.md` — search or skim **Implemented Features** |
| MUST/FORBIDDEN, Docker, git, quality gates | `.ai/rules.md` |
| Auth, cart, i18n, payments, page builder depth | `.ai/context.md` |
| Commit / PR | `.ai/commit-rules.md` |
| Admin `server/resources/js/**` | `.cursor/rules/backend.mdc` (globs) |
| Client `client/**` | `.cursor/rules/frontend-client.mdc` (globs) |
| Copy-paste task templates | `.ai/prompts.md` |

## Skills (project)

- Use `.claude/skills/frontend-design` for UI building/polish tasks.
- Use `.claude/skills/find-skills` when deciding what skill to apply or when promoting global skills into the repo.

## Verify in Docker (never host `php` / `npm`)

| When | Command (repo root) |
|------|---------------------|
| During implementation | Prefer targeted checks below; reserve full pipeline for release validation |
| Before deploy / final release validation | `make fix && make check` |
| After `server/**/*.php` | `docker compose exec php vendor/bin/pint --dirty` |
| After `server/resources/js/**` | `docker compose exec php npm run types` |
| After admin UI change (optional) | `docker compose exec php npx eslint . --max-warnings=0` on touched paths |
| After PHP feature | `docker compose exec php php artisan test --compact tests/Feature/…` |
| Containers down | `docker compose ps` — **stop and report**; do not run on host |

`rtk` only compresses output — **not** a substitute for the commands above.

## Common mistakes

- Running `npx tsc` / `npm run typecheck` on the **host** → use `docker compose exec php npm run types`
- Using `make fix` / `make check` after every small edit instead of writing code that already matches local patterns
- Treating targeted checks as optional when a touched area has a fast, relevant verifier
- Delegating verification to the user ("uruchom u siebie make check")
