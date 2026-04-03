# CLAUDE.md

Monorepo: **Laravel backend + admin SPA** (`server/`) · **Next.js public frontend** (`client/`)

> **Read `ai/guide.md` first** — feature map, key paths, conventions.
> Deep context: `ai/context.md` · Quality gates & Docker rules: `ai/rules.md` · MCP: `ai/mcp.md`

---

## Commands (always via Docker)

```bash
# Makefile shortcuts (from repo root)
make up / make down / make shell / make migrate / make fresh / make test / make quality

# Pre-commit workflow — always run before committing
make fix    # auto-fix: pint → rector → pint → eslint --fix → prettier (server + client)
make check  # CI mirror: read-only, fails if anything is wrong — same checks as GitHub Actions

# Direct — when you need specific args
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec node npm run build
```

> **Never run `php artisan` or `pint` directly** — host has no DB/Redis access.
> **Before every commit:** `make fix && make check` — if `check` passes, the code is safe to push.

---

## Structure

| Part | Path | Stack |
|------|------|-------|
| Backend + Admin SPA | `server/` | Laravel, Inertia/React, Pest |
| Public Frontend | `client/` | Next.js, React, TanStack Query |

REST API: `/api/v1/*` · Admin: `/admin/*` (Inertia SPA)

---

## Non-Negotiable Rules

**PHP (`server/`):**
- `declare(strict_types=1)` on every file
- `Model::query()` — never `DB::` for standard queries
- Eager-load relations (no N+1 in loops)
- Form Request classes for all validation — never inline
- `env()` only inside `config/` files
- After any PHP change: `docker compose exec php vendor/bin/pint --dirty`

**API Controllers (`server/app/Http/Controllers/Api/`):**
- Extend `App\Http\Controllers\Api\ApiController` — never base `Controller`
- Use helpers: `$this->ok()` · `$this->created()` · `$this->noContent()` · `$this->collection()`
- `JsonResource::withoutWrapping()` is global — no `{ data: T }` wrapper on single resources
- Client-side: use `apiGet<T>()`, `apiGetPage<T>()` etc. from `lib/api.ts`

**TypeScript (`client/` and `server/resources/js/`):**
- `.tsx` files are clean — no type/interface definitions inside them
- Types in `.ts` files: `Name.types.ts` (component), `types.ts` (shared), `client/types/api.ts` (API)
- Admin SPA routes → Wayfinder (`@/actions/`, `@/routes/`) — never hardcode strings
- All client links → `useLocalePath()` / `lp()` (locale-prefixed URLs)

**Always:**
- Pest tests for every feature — `docker compose exec php php artisan make:test --pest Name`
- All tests must pass: `docker compose exec php php artisan test --compact`
- Update `ai/guide.md` when adding or changing features

---

## AI Context Files

```
ai/guide.md        ← feature map, key paths (PRIMARY — read every session)
ai/context.md      ← auth, cart, i18n, payments, page builder (deep tasks)
ai/rules.md        ← quality gates, auto-update rules, GDPR, Docker-first
ai/prompts.md      ← copy-paste task templates
ai/mcp.md          ← MCP server documentation
ai/mcp/mcp.json    ← MCP config (source of truth)

server/CLAUDE.md   ← Laravel rules — auto-managed by laravel-boost (do not edit)
client/CLAUDE.md   ← Next.js rules
```

---

## MCP Servers

See `ai/mcp.md` for full documentation.

| Server | Purpose |
|--------|---------|
| `laravel-boost` | Tinker, DB queries, schema, docs search, browser logs |
| `shadcn` | shadcn/ui component docs + generation |

> laravel-boost runs on HOST, connects to Docker services via `localhost:3306` / `localhost:6379`.
> Always use `search-docs` before making code changes (version-specific docs).

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->