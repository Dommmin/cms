# AI Rules

Rules that AI must follow automatically in this project.

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
docker compose exec node npm run build
docker compose exec node npx prettier --write .
docker compose exec node npx playwright test
```

If a Docker container is down or crashing, **report it and stop** — do not fall back to running commands on the host. Host has no DB/Redis access and different architecture binaries may produce incorrect results.

To check container status: `docker compose ps`
To see why a container is failing: `docker compose logs <service> --tail=30`

---

## Auto-Update Rules

### After implementing a new feature:
1. Update `ai/guide.md` → add to the relevant section under "Implemented Features"
2. Update `docs/backend.md` or `docs/frontend.md` if architecture changed
3. Update `server/docs/USER_GUIDE.md` — non-technical editor instructions
4. Update `server/docs/DEVELOPER_GUIDE.md` — technical extension patterns

### After adding a new package:
- Add to the "Packages" section in `ai/guide.md`
- Add to `docs/backend.md` or `docs/frontend.md` under dependencies

### After adding/changing routes:
- Note in `ai/guide.md` under the relevant feature
- Run `docker compose exec php php artisan wayfinder:generate --no-interaction` if admin routes changed

### After adding a new model:
- Add factory if one doesn't exist
- Note soft-delete status in `ai/guide.md` if applicable

### When editing GitHub Actions workflows (`.github/workflows/`):
- Always use the latest major version of each action — see the pinned versions table in `docs/deployment.md`
- Node version in CI must match the Docker setup: currently **Node 24** (`node:24-bookworm`)
- PHP version in CI must match production: currently **PHP 8.5**
- Workflows belong **only** in `.github/workflows/` at the repo root — never in `server/.github/` or `client/.github/`
- The pipeline order is always: lint → test → build → deploy (enforced via `needs:`)
- Lint runs in check-only mode: `pint --test`, `rector --dry-run`, `phpstan analyse`, `eslint --max-warnings=0`, `prettier --check`
- Locally use **write** mode before committing: `pint` → `rector process` → `pint` (again) → `phpstan analyse` → `npm run lint` + `prettier --write`
- rector.php must have `->withoutParallel()` — Docker containers OOM-kill rector child processes otherwise
- phpstan level: 5 with baseline; regenerate baseline with `--generate-baseline` when stale entries appear after refactors

---

## Code Quality Rules

### Before every commit (local)

Use the two Makefile commands — they are the canonical pre-commit workflow:

```bash
make fix    # auto-fixes everything: pint → rector → pint → eslint --fix → prettier
make check  # read-only CI mirror: fails if anything is wrong (same checks as GitHub Actions)
```

**Workflow for AI:**
1. After writing code, run `make fix` — this auto-corrects style/refactor issues without human review
2. Then run `make check` — if it passes, the code is safe to commit and push
3. If `make check` fails with issues that `make fix` cannot resolve (e.g. Larastan type errors, failing tests), fix them manually and repeat

**Details:**
- `make fix` runs: `pint` → `rector process` → `pint` (again, to re-format rector output) → `npm run lint` (eslint --fix, server) → `npm run format` (prettier, server) → `eslint --fix` (client) → `npm run format` (prettier, client)
- `make check` mirrors CI exactly: `pint --test` / `rector --dry-run` / `phpstan analyse` / `eslint --max-warnings=0` / `prettier --check` (server + client) / `pest --parallel`
- If phpstan reports stale baseline entries after refactors, regenerate: `docker compose exec php php -d memory_limit=1G vendor/bin/phpstan analyse --generate-baseline`

### Write lint-compliant code from the start
- **PHP**: follow Pint/PSR-12 style — no unused imports, correct spacing, trailing commas in arrays/params, `declare(strict_types=1)` at top
- **TypeScript**: no unused variables, no `any` types, no `console.log` left in, imports organized (prettier-plugin-organize-imports runs on format)
- **Tailwind**: class order enforced by prettier-plugin-tailwindcss — always run prettier after adding Tailwind classes
- Never leave code that will fail linting — fix it before committing, not after CI fails

### Always
- Run `docker compose exec php vendor/bin/pint` after any PHP changes
- Run `docker compose exec php php artisan test --compact` — all tests must pass
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
