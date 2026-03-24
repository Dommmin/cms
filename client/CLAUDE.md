# client/CLAUDE.md — Next.js 16 Public Frontend

Part of the monorepo. See root `CLAUDE.md` + `ai/guide.md` for full project context.

---

## Commands

```bash
docker compose exec node npm run build       # production build
docker compose exec node npm run dev         # dev server (usually via make up)
docker compose exec node npx playwright test # E2E tests
```

> Never run `npm` directly on host — use `docker compose exec node`.

---

## Server vs Client Components

| Situation | Use | Import from |
|-----------|-----|-------------|
| SSR page, initial data fetch | Server component | `lib/server-fetch.ts` → `serverFetch()` |
| Interactive, hooks, browser APIs | Client component (`"use client"`) | `lib/axios.ts` → `api` |
| Locale-aware server fetch | Pass `locale` cookie | `cookies()` from `next/headers` |

```ts
// Server component
import { serverFetch } from "@/lib/server-fetch";
const data = await serverFetch<ProductList>("/products", { revalidate: 60 });

// Client component
import { api } from "@/lib/axios";
const { data } = await api.get("/products");
```

---

## i18n — Locale-Prefixed URLs

All public URLs are locale-prefixed (`/en/products`, `/pl/blog`).

```ts
// Client components
const lp = useLocalePath();           // returns (path) => `/${locale}${path}`
const locale = useLocale();           // extracts locale from pathname

// Server components
import { localePath } from "@/lib/i18n";
import { cookies } from "next/headers";
const locale = (await cookies()).get("locale")?.value ?? "en";
```

- **Never hardcode locale** in links — always use `lp(path)` or `localePath(locale, path)`
- Middleware rewrites: `/en/x` → `/x` internally; `/x` → redirects to `/en/x`

---

## API Types — Read Before Writing

Always check `client/types/api.ts` first. Common gotchas:

| Type | Field | Note |
|------|-------|------|
| `CartItem` | `unit_price`, `subtotal` | `product` is direct (not `variant.product`) |
| `ProductVariant` | `attributes: Record<string, string>` | not `attribute_values` |
| `ProductReview` | `author`, `body` | not `reviewer_name` |
| `OrderItem` | `unit_price`, `subtotal`, `variant_sku`, `product_name` | |
| `Order` | use `items?.length` | no `items_count` field |
| `BlogPost` | `featured_image: string\|null`, `author: {id,name}\|null` | not `cover_image_url` |

---

## Key Paths

| What | Where |
|------|-------|
| Pages (App Router) | `app/` |
| API functions | `api/` |
| React hooks | `hooks/` |
| Reusable components | `components/` |
| API types | `types/api.ts` |
| Server fetch | `lib/server-fetch.ts` |
| Client fetch (axios) | `lib/axios.ts` |
| i18n helpers | `lib/i18n.ts` |
| Schema.org builders | `lib/schema.ts` |
| Global styles | `app/globals.css` |
| Middleware (locale) | `middleware.ts` |
| Playwright config | `playwright.config.ts` |
| E2E tests | `tests/e2e/` |

---

## Component Conventions

- `page.tsx` / `layout.tsx` — Next.js App Router conventions (default export)
- Reusable components — named export, `PascalCase.tsx`
- Hooks — `use-kebab-case.ts` in `hooks/`
- Server components by default; add `"use client"` only when needed (interactivity, hooks)
- Dark mode: `dark:` prefix (`.dark` class on `<html>`) — Tailwind v4

## SEO / Metadata

Every public page needs `generateMetadata()`:
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await serverFetch<...>(`/...`);
  return { title: data.title, description: data.description, openGraph: { ... } };
}
```

Add JSON-LD via `<JsonLd data={buildXxx(...)} />` from `components/json-ld.tsx`.

---

## WCAG 2.1 AA — Accessibility Rules

- Icon-only buttons **must** have `aria-label`
- `aria-hidden="true"` on decorative icons
- Form inputs need `<label htmlFor>` or `aria-label`
- Active nav links: `aria-current="page"`
- Pagination: `<nav aria-label>`, `aria-current="page"` on active page
- Live regions for quantity changes: `aria-live="polite" aria-atomic`
- Focus trap on dialogs/modals (Tab/Shift+Tab must stay inside)
