# AI Rules

Rules that AI must follow automatically in this project.

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
- Lint runs in check-only mode: `pint --test`, `rector --dry-run`, `eslint --max-warnings=0`, `prettier --check`

---

## Code Quality Rules

### Always
- Run `docker compose exec php vendor/bin/pint --dirty` after any PHP changes
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
