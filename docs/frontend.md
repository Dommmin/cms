# Frontend Documentation

This project has **three** frontend contexts:

| Context             | Path                   | Framework             | Served by      |
|---------------------|------------------------|-----------------------|----------------|
| **Admin SPA**       | `server/resources/js/` | Inertia v2 + React 19 | Laravel (PHP)  |
| **Public Frontend** | `client/`              | Next.js 16            | Node container |
| **Mobile App**      | `mobile/`              | Expo React Native     | Expo CLI       |

---

## Admin SPA (`server/resources/js/`)

### Architecture

Inertia.js turns Laravel responses into a React SPA without a separate API.
The backend renders Inertia pages server-side — no API calls needed from admin pages.

```
resources/js/
├── actions/          Wayfinder-generated route helpers (auto, don't edit)
├── components/
│   ├── ui/           shadcn/ui components (Radix UI)
│   ├── columns/      TanStack Table column definitions
│   ├── data-table.tsx
│   ├── page-header.tsx
│   ├── wrapper.tsx
│   └── ...
├── hooks/            Custom React hooks
├── layouts/
│   ├── app-layout.tsx      Main admin layout (sidebar + header)
│   ├── auth-layout.tsx     Login/register layout
│   └── settings/layout.tsx Settings sub-layout
├── pages/
│   ├── admin/        All admin panel pages
│   ├── auth/         Login, register, 2FA, password reset
│   └── settings/     Profile, password, appearance, 2FA settings
├── types/            TypeScript type definitions
└── lib/              Utilities (utils.ts, etc.)
```

### Key Patterns

**Navigation** — always use Inertia `<Link>` or `router.visit()`, never `<a>` tags
```tsx
import { Link, router } from '@inertiajs/react'
<Link href="/admin/users">Users</Link>
router.visit('/admin/users')
```

**Forms** — use `<Form>` component (Inertia v2)
```tsx
import { Form } from '@inertiajs/react'
import { store } from '@/actions/App/Http/Controllers/Admin/UserController'

<Form {...store.form()}>
  {({ errors, processing }) => (
    <>
      <input name="email" />
      {errors.email && <p>{errors.email}</p>}
      <button disabled={processing}>Save</button>
    </>
  )}
</Form>
```

**Routes** — always Wayfinder, never hardcoded strings
```tsx
import { index, show, store, update, destroy } from '@/actions/App/Http/Controllers/Admin/[Name]Controller'

// URL string
index.url()                     // '/admin/users'
show.url({ user: 1 })          // '/admin/users/1'

// Route object for Form
store.form()                    // { action: '/admin/users', method: 'post' }
update.form({ user: 1 })       // { action: '/admin/users/1', method: 'post' } + _method=PUT

// Programmatic navigation
router.visit(index.url())
```

**Data tables** — `DataTable` component with TanStack Table
```tsx
<DataTable
  columns={userColumns}
  data={users.data}
  pagination={{ current_page, last_page, per_page, total, prev_page_url, next_page_url }}
  searchable
  searchPlaceholder="Search..."
  baseUrl="/admin/users"
/>
```

**Deferred props** — for heavy data, use Inertia deferred props with skeleton
```tsx
// Backend: Inertia::render('page', ['heavyData' => Inertia::defer(fn() => ...)])
// Frontend:
export default function Page({ heavyData }) {
  return heavyData ? <DataGrid data={heavyData} /> : <Skeleton />
}
```

### UI Component Library

shadcn/ui pattern with Radix UI primitives. Components in `resources/js/components/ui/`:
`Button`, `Input`, `Label`, `Select`, `Dialog`, `Sheet`, `Tabs`, `Badge`, `Card`, `Table`, `Form`, `Checkbox`, `Switch`, `Textarea`, `Separator`, `Tooltip`, `Popover`, `Command`, `DropdownMenu`, `AlertDialog`

### Rich Text Editor

The admin Lexical editor lives in `server/resources/js/components/ui/rich-text-editor/`.
It supports enterprise media workflows:

- `MediaPickerModal` modes: `image`, `gallery`, `file`, `video`, `any`
- `ImageNode` v2: media ID, alt/decorative state, caption, credit, layout, wrap, size preset, link URL, loading hint
- `ImageGalleryNode`: multi-image grid with ordered assets, mobile columns, gap, aspect ratio, lightbox metadata and `figure[data-rte-gallery]` HTML export
- `AttachmentNode`: downloadable file link with MIME/size metadata and safe URL export
- `PasteSanitizerPlugin`: cleans Word/Google Docs HTML and strips unsafe links, event handlers, styles, and data images before import
- Link dialog internal search: locale-aware pages, products, categories and blog posts
- `ContentHealthPlugin`: local warnings for alt text, link metadata, headings, long paragraphs, inline styles, attachment labels and table headers

### Styling

Tailwind CSS v4. Dark mode via `.dark` class on `<html>` element.
```css
/* Dark mode custom variant (Tailwind v4) */
@custom-variant dark (&:is(.dark *))
```

Public storefront design tokens live in `client/app/globals.css` as `--store-*`
variables. Use them for product/card-heavy surfaces before adding ad hoc classes:

- `--store-shell-width`, `--store-content-width`
- `--store-section-y`, `--store-grid-gap`
- `--store-card-radius`, `--store-control-radius`
- `--store-product-image-ratio`
- `--store-focus-ring`, `--store-shadow-soft`, `--store-shadow-lifted`

The product listing uses a persistent desktop filter sidebar and a mobile filter
drawer. Active filters are represented as removable chips derived from URL params.

Product detail UI is split under `client/app/products/[slug]/` into focused
components for gallery, buy box, variant selection, delivery info, tabs, reviews,
and related products. Keep product data hooks in `ProductDetailClient.tsx` and
pass presentation state through typed props.

---

## Public Frontend (`client/`)

### Architecture

Next.js 16 with App Router. Server components by default, client components when needed.

```
client/
├── app/                    Next.js App Router pages
│   ├── (auth)/             Auth group (login, register)
│   ├── [locale]/           Locale-prefixed routes (e.g. /en/, /pl/)
│   │   ├── products/       Product listing + detail
│   │   ├── blog/           Blog list + post
│   │   ├── cart/           Shopping cart
│   │   ├── checkout/       Checkout flow
│   │   ├── account/        User account
│   │   ├── search/         Search results
│   │   ├── stores/         Physical store locator
│   │   ├── newsletter/     Newsletter subscription
│   │   └── [...slug]/      Dynamic CMS pages
│   ├── feed.xml/           RSS feed
│   ├── robots.ts           robots.txt
│   └── sitemap.ts          sitemap.xml
├── api/                    API call functions
├── components/
│   ├── ui/                 shadcn/ui components
│   ├── layout/             Header, footer, navigation
│   ├── page-builder/       CMS page block renderers
│   ├── checkout/           Checkout step components
│   └── ...
├── hooks/                  Custom React hooks
├── lib/
│   ├── axios.ts            Axios client (client-side, handles 401)
│   ├── server-fetch.ts     serverFetch() for SSR
│   ├── i18n.ts             Locale helpers (localePath, stripLocaleFromPath)
│   ├── schema.ts           Schema.org builders
│   ├── seo.ts              SEO metadata helpers
│   ├── format.ts           Currency/date formatters
│   └── datalayer.ts        Google Tag Manager events
├── providers/
│   └── ...                 React context providers
├── types/
│   └── api.ts              API response types (source of truth)
└── middleware.ts            Locale redirect/rewrite middleware
```

### Tests

Run client checks through the Node Docker service:

```bash
docker compose exec -T node npm run test:ui
docker compose exec -T node npm run types
docker compose exec -T node npm run lint
```

`npm run test:ui` uses Vitest with `client/vitest.config.ts` and loads
`client/tests/unit/**/*.{test,spec}.{ts,tsx}` in a Node environment. The initial
unit smoke suite covers storefront Page Builder renderers: every block type has
an isolated render case, and `SectionRenderer`/`SectionLazyWrapper` have basic
metadata, lazy-placeholder, section variant/layout and theme CSS variable
coverage.

### CMS Revalidation

CMS page fetches use cache tags in `client/api/cms.ts` (`page:{slug}`). The
storefront exposes `POST /api/cms/revalidate` for CMS webhooks:

- accepts `page.published` and `page.unpublished` webhook payloads,
- verifies `X-Webhook-Signature` with `CMS_REVALIDATION_SECRET`,
- calls `revalidateTag('page:{slug}')` for default and translated slugs,
- calls `revalidatePath()` for default and locale-prefixed page paths.

### PWA

The public storefront is installable as a PWA:

- `app/manifest.ts` generates the web app manifest.
- `public/pwa/` contains install icons and maskable icons.
- `components/pwa-service-worker.tsx` registers `/sw.js` only in production.
- `app/offline/page.tsx` is the offline fallback.
- `public/sw.js` uses cache-first for static assets, stale-while-revalidate for
  public product/blog/store routes, and network-first for navigations.
- Cart, checkout, account, payment, auth and profile paths are intentionally
  excluded from service worker cache.

Configure an active CMS webhook with the same secret and the storefront URL
`https://<storefront-host>/api/cms/revalidate`.

---

## Mobile App (`mobile/`)

Expo Router app backed by the same Laravel REST API as `client/`.

```
mobile/src/
├── app/              Expo Router tabs, product detail, checkout and CMS screens
├── api/              Axios API modules for products, cart, auth, checkout, CMS
├── components/       Native UI pieces for products, cart and screen states
├── hooks/            React Query hooks such as useCart()
├── lib/              env, storage, formatting and idempotency helpers
├── providers/        QueryClientProvider and AuthProvider
└── types/api.ts      Mobile API contracts mirrored from client/types/api.ts
```

Key rules:

- `EXPO_PUBLIC_API_URL` provides the `/api/v1` base URL.
- Auth uses Sanctum bearer tokens stored through `expo-secure-store`.
- Guest cart token is sent as `X-Cart-Token` and persisted locally.
- Cart and checkout mutations send `Idempotency-Key`.
- Prices stay as integer cents/grosze until formatted in `lib/format.ts`.
- Checkout MVP submits contact/address/delivery/payment/terms data to `/checkout`
  and opens provider redirect URLs through `expo-web-browser`.
- Account MVP supports login, registration, logout and recent order history.
- Order detail, blog list/detail, stores list, newsletter signup and a safe MVP
  CMS Page Builder renderer are implemented as native screens.
- Product reviews, wishlist actions, recently viewed products, profile editing and
  cart discount codes are included in the MVP surface.

Checks:

```bash
npm --prefix mobile run types
npm --prefix mobile run lint
```

### Blog SEO

The blog uses Polish as the clean default URL (`/blog`, `/blog/{slug}`) and
English under `/en/blog`. Article metadata is generated in
`client/app/blog/_blog-metadata.ts` from Laravel API fields, including localized
canonicals, hreflang alternates, x-default to English, OpenGraph, Twitter cards,
and generated fallback OG images.

The sitemap includes each published locale URL and excludes posts marked
`sitemap_exclude`. Locale-specific blog RSS feeds are served at `/blog/rss.xml`
and `/en/blog/rss.xml`. Article HTML is server-rendered and enriched with a table
of contents, normalized body headings, JSON-LD BlogPosting/BreadcrumbList, an
updated date, author box, and related posts.

### Server vs Client Components

**Server components** (default) — use `serverFetch()`:
```tsx
// app/blog/page.tsx
import { serverFetch } from '@/lib/server-fetch'
import { cookies } from 'next/headers'

export default async function BlogPage() {
  const locale = (await cookies()).get('locale')?.value ?? 'en'
  const posts = await serverFetch(`/api/v1/blog/posts?locale=${locale}`)
  return <BlogList posts={posts} />
}
```

**Client components** — use `api` (axios):
```tsx
'use client'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

export default function CartWidget() {
  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/api/v1/cart').then(r => r.data),
  })
  // ...
}
```

### i18n (Locale) System

- URLs prefixed with locale: `/en/products`, `/pl/blog`
- `middleware.ts` — redirects `/products` → `/en/products`, rewrites `/en/products` → `/products`
- Locale stored in cookie: `locale`
- `useLocale()` — extracts locale from `usePathname()`
- `useLocalePath()` — `(path) => /${locale}${path}`
- `localePath(locale, path)` — server-side helper

```tsx
// Server component link
import { localePath } from '@/lib/i18n'
import { cookies } from 'next/headers'

const locale = (await cookies()).get('locale')?.value ?? 'en'
<a href={localePath(locale, '/products')}>Products</a>

// Client component
import { useLocalePath } from '@/hooks/use-local-path'
const localePath = useLocalePath()
<Link href={localePath('/products')}>Products</Link>
```

### API Type Reference (`client/types/api.ts`)

Always check this file before using API response data. Key types:

```ts
CartItem: { unit_price, subtotal, product: { id, name, thumbnail } }
ProductVariant: { attributes: Record<string, string> }  // NOT attribute_values
ProductReview: { author: string, body: string }         // NOT reviewer_name
OrderItem: { unit_price, subtotal, variant_sku, product_name }
Order: items?: OrderItem[]                              // use items?.length, no items_count
BlogPost: { featured_image: string|null, author: { id, name }|null }
```

### SEO + Schema.org

```tsx
// Page metadata
export const metadata: Metadata = {
  title: 'Products',
  description: '...',
  openGraph: { ... }
}

// JSON-LD
import { JsonLd } from '@/components/json-ld';
import { buildProduct } from '@/lib/schema';

<JsonLd data={buildProduct(product)} />
```

Available schema builders in `lib/schema.ts`:
`buildWebSite`, `buildOrganization`, `buildBlogPosting`, `buildWebPage`, `buildFaqPage`, `buildProduct`, `buildLocalBusiness`, `buildBreadcrumbList`

### State Management

- **Server state**: TanStack Query (`@tanstack/react-query`)
- **Form state**: react-hook-form + Zod validation
- **No global state library** — colocate state near where it's used
- **Cart**: persisted in localStorage (`cart_token`), sent via `X-Cart-Token` header

### Key Dependencies

| Package                     | Use                |
|-----------------------------|--------------------|
| `next` 16                   | Framework          |
| `react` 19                  | UI                 |
| `@tanstack/react-query`     | Server state       |
| `axios`                     | HTTP client        |
| `react-hook-form` + `zod`   | Forms + validation |
| `tailwindcss` v4            | Styling            |
| `leaflet` + `react-leaflet` | Store map          |
| `recharts`                  | Charts             |
| `framer-motion`             | Animations         |
| `date-fns`                  | Date formatting    |
| `lucide-react`              | Icons              |
