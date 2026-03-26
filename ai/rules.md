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

**PHP (`server/`):**
- Run `docker compose exec php vendor/bin/pint` (no `--dirty` — fixes **all** PHP files, not just git-modified ones)
- Run `docker compose exec php php -d memory_limit=1G vendor/bin/rector process` — applies automated refactors (rector.php uses `withoutParallel()` to avoid Docker OOM)
- Run `docker compose exec php vendor/bin/pint` again after rector (rector output may need style normalisation)
- Run `docker compose exec php php -d memory_limit=1G vendor/bin/phpstan analyse --no-progress` — must report "No errors" (baseline in `phpstan-baseline.neon` suppresses pre-existing issues)
- If phpstan reports stale baseline entries after code changes, regenerate: `vendor/bin/phpstan analyse --generate-baseline`
- Run `docker compose exec php php artisan test --compact` — all tests must pass
- Why: `--dirty` only processes uncommitted changes; pint + rector + larastan must all be clean before CI

**TypeScript (`client/`):**
- Run `docker compose exec node npm run lint` — ESLint must pass with 0 warnings (`--max-warnings=0` in CI)
- Run `docker compose exec node npx prettier --write .` — format all TS/TSX files
- Why: CI runs `eslint --max-warnings=0` and `prettier --check` and will fail on any violation

**TypeScript (`server/resources/js/`):**
- Run `docker compose exec node npx eslint resources/js --max-warnings=0`
- Run `docker compose exec node npx prettier --write resources/js`

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
