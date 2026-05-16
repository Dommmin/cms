# client/AGENTS.md — Next.js 16 Public Frontend

Part of the monorepo. Entry point for Codex and `AGENTS.md`-aware tools working in `client/`.

> Full context: root `AGENTS.md` · `.ai/guide.md` (feature map) · `.ai/rules.md` (canonical rules) · `.ai/context.md` (i18n, cart, payments deep context).
> This file mirrors `client/CLAUDE.md` — keep both in sync.

---

## Commands (always via Docker)

```bash
docker compose exec node npm run build       # production build
docker compose exec node npm run dev         # dev server (usually via make up)
docker compose exec node npx playwright test # E2E tests
```

> Never run `npm` directly on host — use `docker compose exec node`.

---

## Server vs Client Components

| Situation                        | Use                               | Import from                             |
| -------------------------------- | --------------------------------- | --------------------------------------- |
| SSR page, initial data fetch     | Server component                  | `lib/server-fetch.ts` → `serverFetch()` |
| Interactive, hooks, browser APIs | Client component (`"use client"`) | `lib/axios.ts` → `api`                  |
| Locale-aware server fetch        | Pass `locale` cookie              | `cookies()` from `next/headers`         |

Server components by default. Add `"use client"` only when you need hooks, event handlers, or browser APIs.

---

## i18n — Locale-Prefixed URLs

All public URLs are locale-prefixed (`/en/products`, `/pl/blog`).

```ts
// Client components
const lp = useLocalePath(); // (path) => `/${locale}${path}`
const locale = useLocale(); // extracts locale from pathname

// Server components
import { localePath } from '@/lib/i18n';
import { cookies } from 'next/headers';
const locale = (await cookies()).get('locale')?.value ?? 'en';
```

**Never hardcode locale in links** — always use `lp(path)` or `localePath(locale, path)`. Middleware rewrites `/en/x` → `/x` internally; `/x` → redirects to `/en/x`.

---

## API Types — Read Before Writing

Always check `client/types/api.ts` first. Common gotchas:

| Type             | Field                                                     | Note                                        |
| ---------------- | --------------------------------------------------------- | ------------------------------------------- |
| `CartItem`       | `unit_price`, `subtotal`                                  | `product` is direct (not `variant.product`) |
| `ProductVariant` | `attributes: Record<string, string>`                      | not `attribute_values`                      |
| `ProductReview`  | `author`, `body`                                          | not `reviewer_name`                         |
| `OrderItem`      | `unit_price`, `subtotal`, `variant_sku`, `product_name`   |                                             |
| `Order`          | use `items?.length`                                       | no `items_count` field                      |
| `BlogPost`       | `featured_image: string\|null`, `author: {id,name}\|null` | not `cover_image_url`                       |

---

## Types in Separate Files — Required

`.tsx` files must be clean (component logic + JSX only). **Never define types or interfaces inside `.tsx` files.**

- Component-specific types → colocated `ComponentName.types.ts`
- Directory-wide shared types → `types.ts` in that directory
- Global API response types → `types/api.ts`

---

## SEO / Metadata

Every public page needs `generateMetadata()`. Add JSON-LD via `<JsonLd data={buildXxx(...)} />` from `components/json-ld.tsx`.

---

## WCAG 2.1 AA

- Icon-only buttons must have `aria-label`; `aria-hidden="true"` on decorative icons
- Form inputs need `<label htmlFor>` or `aria-label`
- Active nav links: `aria-current="page"`; pagination: `<nav aria-label>`
- Live regions for quantity changes: `aria-live="polite" aria-atomic`
- Focus trap on dialogs/modals; skip link in root layout (`#main-content`)

---

## Key Paths

| What                 | Where                 |
| -------------------- | --------------------- |
| Pages (App Router)   | `app/`                |
| API functions        | `api/`                |
| React hooks          | `hooks/`              |
| Reusable components  | `components/`         |
| API types            | `types/api.ts`        |
| Server fetch         | `lib/server-fetch.ts` |
| Client fetch (axios) | `lib/axios.ts`        |
| i18n helpers         | `lib/i18n.ts`         |
| Schema.org builders  | `lib/schema.ts`       |
| Middleware (locale)  | `middleware.ts`       |
| E2E tests            | `tests/e2e/`          |

---

## Git — Requires Explicit Consent

Never create a branch, commit, or push without the user's explicit approval. Read-only git is always fine. Commit only files you explicitly modified. See `.ai/commit-rules.md`.
