# AI Rules

Rules every AI tool (Claude Code, Codex, Gemini, Copilot, Cursor, Junie, Cline, OpenCode) must follow in this project.

> This is the canonical rules file. Entry points (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.junie/guidelines.md`, `.github/copilot-instructions.md`, `.cursor/rules/global.mdc`) carry a compact copy and point here for depth.

---

## Core Rules — MUST

1. **MUST** run every command inside Docker — never on the host (`docker compose exec php ...` / `docker compose exec node ...`)
2. **MUST** read 2-3 similar existing files before writing new code, and match the local style
3. **MUST** touch only files related to the current task — minimal diff
4. **MUST** plan before coding when a task has 3+ steps
5. **MUST** use Form Request classes for all validation — never inline in controllers
6. **MUST** put business logic in the API (Controllers/Services/Resources) — the view receives ready-to-display data
7. **MUST** write Pest tests for every feature and keep the relevant suite green while iterating
8. **MUST** write code that should pass the current lint/static-analysis stack on first pass; reserve `make fix && make check` for pre-deploy / final release validation
9. **MUST** update `.ai/guide.md` (+ `server/docs/*`) when a feature is added or changed
10. **MUST** ask before any git branch / commit / push (see Git section)
11. **MUST** verify: "would a staff engineer approve this diff?"
12. **MUST** run `make audit` when requested to perform a security audit or security check to properly verify vulnerabilities inside the Docker environment.

## Core Rules — FORBIDDEN

- **NEVER** run `php artisan`, `pint`, `npm`, etc. directly on the host — no DB/Redis there
- **NEVER** run `npm run build` during local development while the dev server is running, as it corrupts the `.next` cache and breaks Turbopack / HMR. Use targeted tools like `npm run lint` or `make check` instead.
- **NEVER** use `env()` outside `config/` files — use `config('key')`
- **NEVER** use `DB::` raw queries when Eloquent suffices
- **NEVER** skip `declare(strict_types=1)` on a PHP file
- **NEVER** hard-delete users — always go through `App\Actions\AnonymizeUserData`
- **NEVER** define `type`/`interface` inside `.tsx` files — types live in `.ts` files
- **NEVER** hardcode admin route strings — use Wayfinder (`@/actions/`, `@/routes/`)
- **NEVER** hardcode locale in client links — use `useLocalePath()` / `localePath()`
- **NEVER** refactor code unrelated to the current change, or "normalize" style drive-by
- **NEVER** introduce new patterns, libraries, or top-level directories without approval
- **NEVER** add comments that describe WHAT the code does — only non-obvious WHY
- **NEVER** create branches, commits, or pushes without explicit user consent
- **NEVER** stage unrelated or auto-generated files (Wayfinder output, other people's work)

---

## Task Routing

| Task type                                  | Approach                                                                                                                       |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Bug fix**                                | Reproduce / locate the root cause first. Fix only what is broken. No drive-by refactors.                                       |
| **New endpoint / feature**                 | Find the nearest existing example, copy its structure: migration → model → FormRequest → Controller → Resource → route → test. |
| **Refactoring**                            | Only when explicitly requested — never as a side effect of another change.                                                     |
| **Cross-project change (server + client)** | One side at a time, verify each independently before moving on.                                                                |
| **3+ step task**                           | Plan before coding. State the steps, then execute.                                                                             |

---

## Docker-First Rule

**All commands MUST run inside Docker containers — never directly on the host.**

```bash
# Backend (PHP/Artisan/Pint/Rector/PHPStan/Pest)
docker compose exec php php artisan <cmd>
docker compose exec php vendor/bin/pint
docker compose exec php vendor/bin/rector process
docker compose exec php vendor/bin/phpstan analyse

# Frontend (npm/eslint/prettier/playwright)
docker compose exec node npm run lint
docker compose exec node npx prettier --write .
docker compose exec node npx playwright test
```

If a Docker container is down or crashing, **report it and stop** — do not fall back to running commands on the host. Host has no DB/Redis access and different architecture binaries may produce incorrect results.

To check container status: `docker compose ps`
To see why a container is failing: `docker compose logs <service> --tail=30`

---

## Git — Requires Explicit Consent

- **NEVER** create a branch without the user's explicit approval
- **NEVER** commit without the user's explicit approval
- **NEVER** push without the user's explicit approval
- Read-only git is always fine: `git status`, `git diff`, `git log`, `git show`
- Commit **only files you explicitly modified** — never stage unrelated changes, auto-generated files (Wayfinder, migrations you did not write), or other developers' work
- Always review `git diff --staged` before committing
- Atomic commits — one concern per commit. See `.ai/commit-rules.md` for the full convention (feature/tests/types/docs split, conventional-commit types)
- `make fix && make check` must both pass before any deploy / release candidate; tests must pass before releasing PHP changes

---

## Skills (Claude Code)

Project skills live in `.claude/skills/` — committed to the repo, shared with the team.

| Skill          | Purpose                                                                |
|----------------|------------------------------------------------------------------------|
| `commit`       | Conventional commit workflow reference; full validation belongs to pre-deploy / release checks |
| `fix`          | Run `make fix` (pint + rector + eslint + prettier)                     |
| `review`       | Code review of current-branch changes or a given file                  |
| `test`         | Write or run Pest tests                                                |
| `deploy-check` | Pre-deployment checklist (tests, build, debug calls, vulnerabilities)  |
| `audit-update` | Refresh `.ai/audit-plan.md` — verify gap/feature status, recalc scores |
| `a11y-check`   | WCAG 2.2 AA check + fixes for a view/component                         |
| `ux-review`    | UI/UX analysis of a screen or flow                                     |
| `seo-review`   | Technical + content SEO analysis of the storefront                     |

> Only **Claude Code** executes these as skills. Other tools (Codex, Gemini, Copilot…) should treat this table as a reference to available workflows and run the equivalent commands directly.
> **Global / personal skills** (`~/.claude/skills/`, installed plugins) are not shared — do not rely on them for team workflows. If a skill is valuable and stable, install/commit it under `.claude/skills/` (and mirror where required, e.g. `server/.cursor/skills/`), then reference it from this file.

---

## Auto-Update Rules

### After implementing a new feature:
1. Update `.ai/guide.md` → add to the relevant section under "Implemented Features"
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — non-technical editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — technical extension patterns

### After adding a new package:
- Add to the "Packages" section in `.ai/guide.md`
- Add to `docs/backend.md` or `docs/frontend.md` under dependencies
- If the package requires new env variables: add them to `server/.env.production.example` (with empty value) and to `server/.env.example` (with local dev default)

### After adding/changing routes:
- Note in `.ai/guide.md` under the relevant feature
- Run `docker compose exec php php artisan wayfinder:generate --no-interaction` if admin routes changed

### After adding a new model:
- Add factory if one doesn't exist
- Note soft-delete status in `.ai/guide.md` if applicable

### When editing GitHub Actions workflows (`.github/workflows/`):
- Always use the latest major version of each action — see the pinned versions table in `docs/deployment.md`
- Node version in CI must match the Docker setup: currently **Node 24** (`node:24-bookworm`)
- PHP version in CI must match production: currently **PHP 8.5**
- Workflows belong **only** in `.github/workflows/` at the repo root — never in `server/.github/` or `client/.github/`
- The pipeline order is always: lint → test → build → deploy (enforced via `needs:`)
- Lint runs in check-only mode: `pint --test`, `rector --dry-run`, `phpstan analyse`, `eslint --max-warnings=0`, `prettier --check`
- Locally use **write** mode before deploy / release validation: `pint` → `rector process` → `pint` (again) → `phpstan analyse` → `npm run lint` + `prettier --write`
- rector.php must have `->withoutParallel()` — Docker containers OOM-kill rector child processes otherwise
- phpstan level: 5 with baseline; regenerate baseline with `--generate-baseline` when stale entries appear after refactors

---

## Code Quality Rules

### Before deploy / final release validation

Use the Makefile commands — they are the canonical validation workflow:

```bash
make fix    # auto-fixes everything: pint → rector → pint → eslint --fix → prettier
make check  # read-only CI mirror: fails if anything is wrong (same checks as GitHub Actions)
make audit  # security audit: runs composer outdated + npm audits inside Docker
```

**Workflow for AI:**
1. **DO NOT** run `make test`, `make fix`, or `make check` after every single individual file edit or minor change. Write code to local conventions first, and use targeted checks while iterating.
2. Before deploy / final release validation: `make fix && make check`.
3. If `make check` fails with issues `make fix` cannot resolve, fix manually and repeat.
4. Never ask the user to run `make check` on your behalf unless Docker is unavailable on the agent side.

**Details:**
- `make fix` runs: `pint` → `rector process` → `pint` (again, to re-format rector output) → `npm run lint` (eslint --fix, server) → `npm run format` (prettier, server) → `eslint --fix` (client) → `npm run format` (prettier, client)
- `make check` mirrors CI exactly: `pint --test` / `rector --dry-run` / `phpstan analyse` / `eslint --max-warnings=0` / `prettier --check` (server + client) / `pest --parallel`
- If phpstan reports stale baseline entries after refactors, regenerate: `docker compose exec php php -d memory_limit=1G vendor/bin/phpstan analyse --generate-baseline`

### Write lint-compliant code from the start
- **PHP**: follow Pint/PSR-12 style — no unused imports, correct spacing, trailing commas in arrays/params, `declare(strict_types=1)` at top
- **TypeScript**: no unused variables, no `any` types, no `console.log` left in, imports organized (prettier-plugin-organize-imports runs on format)
- **Tailwind**: class order enforced by prettier-plugin-tailwindcss — always run prettier after adding Tailwind classes
- Read 2-3 nearby files before editing and mimic their structure, naming, imports, null-handling, and test style
- Prefer explicit PHP/TS types, existing helper abstractions, and boring patterns that already exist in the repo over clever one-off code
- Never leave code that will fail linting — fix it in the implementation, not only after CI fails

### Always
- Run the fastest relevant targeted verifier when a touched area has one available
- Run `docker compose exec php php artisan test --compact` for the affected feature area when behavior changes
- Write tests for every feature — no exceptions
- Use factories in tests (create them if missing)

### Never
- Use `env()` outside config files
- Use `DB::` raw queries when Eloquent suffices
- Write inline validation — always use Form Request classes
- Skip `declare(strict_types=1)` on PHP files
- Hard-delete users without going through `AnonymizeUserData`
- Create new top-level directories without approval

### PHP
- Constructor property promotion in `__construct()`
- Explicit return types on all methods
- `casts()` method (not `$casts` property)

### Frontend
- **Always prefer shadcn/ui components** over raw HTML elements for any interactive UI (buttons, inputs, switches, selects, dialogs, etc.) — both `server/` and `client/`
- The shadcn MCP tool (`npx shadcn@latest mcp`) is your source of truth for shadcn component API and variants; use it before writing custom UI
- Always use Wayfinder for backend route references
- Check `client/types/api.ts` before using API response fields
- Server components → `serverFetch()`, client components → `api` (axios)
- `.tsx` files are clean — no type/interface definitions inside them
- Types in separate `.ts` files: component-specific → `Name.types.ts` (colocated), shared → `types.ts`, API → `types/api.ts`

### Logic belongs in the API, not the view
- **Business logic, filtering, sorting, aggregation, and data transformations go in the backend** (Controllers, Services, Resources, QueryBuilders). The frontend receives ready-to-display data.
- `.tsx` view files must be thin: render data, handle user events, call API functions. If you find yourself writing array transforms, math, or conditional data reshaping inside a component, move it to the backend or at minimum to a dedicated hook/helper.
- Custom hooks in `hooks/` are the right place for client-side state logic — keep components focused on JSX.
- Never derive display data from raw API fields inside a component (e.g. computing totals, building label strings from codes). Ask: *can the backend return this directly?* If yes, do it there.
- API functions live in `api/`, hooks in `hooks/`, components in `components/` — respect this separation.

---

## Testing Rules

- Feature tests go in `tests/Feature/`
- Unit tests go in `tests/Unit/`
- Admin tests go in `tests/Feature/Admin/`
- API tests go in `tests/Feature/Api/`
- Test soft-deleted models with `assertSoftDeleted()`, not `assertDatabaseMissing()`
- Auth in tests: `Sanctum::actingAs($user)` for API, `$this->actingAs($user)` for web
- Roles in `beforeEach`: `Role::firstOrCreate(['name' => 'admin'])`

---

## Architecture Rules

- Models live in `app/Models/` (never `app/Modules/`)
- Business logic in `app/Services/` (fat services, thin controllers)
- One-off operations in `app/Actions/`
- No helpers/utilities for one-time operations — DRY only when DRY is justified
- Admin routes: prefix `admin.` → `route('admin.users.index')`
- API routes: prefix `api.v1.` under `/api/v1/`

---

## GDPR Rules

- User deletion always goes through `App\Actions\AnonymizeUserData`
- Never hard-delete users directly
- Orders, Reviews, AffiliateCode must be preserved (financial/legal retention)
- Addresses, Cart, Wishlists → delete on account removal
