# CMS Project — AI Guide

> Primary feature map for AI. **Do not read this whole file up front** — open the section you need, or search (see `.ai/routing.md`).
> When a new feature is implemented, update the relevant section below.

---

## What This Project Is

A **headless CMS + e-commerce platform** with three apps in one monorepo:

| App | Path | Tech | Purpose |
|-----|------|------|---------|
| **Admin SPA** | `server/` | Laravel 12 + Inertia/React | Content management, orders, users, settings |
| **Public Frontend** | `client/` | Next.js 16 | Storefront, blog, pages for end users |
| **Mobile App** | `mobile/` | Expo React Native | Native mobile storefront MVP |

Communication: REST API (`/api/v1/*`) + Inertia protocol for admin

---

## Implemented Features

### CMS / Content
- **Page Builder** — drag-and-drop blocks, sections, reusable blocks, draft/publish versioning, live preview, mobile preview, undo/redo, copy/paste blocks
  - **Visual Navigator** — sticky left outline in the admin builder lists sections and blocks; supports active selection, scroll-to, hide/show, duplicate section and duplicate block actions; selection outline uses stable `client_id` anchors
  - **Inspector + Health + Responsive Preview Panel** — sticky right panel in the admin builder with Inspector/Health/Preview tabs; Inspector edits the active section/block, Health checks the current snapshot for H1, CTA, link and image-alt issues, and Preview has desktop/tablet/mobile iframe toggles with stale/current status tied to save/autosave refreshes
  - **Publication Webhooks + Revalidation** — page publish/unpublish flows, including scheduled publishing, dispatch `page.published` / `page.unpublished` through the generic webhook system; the Next.js storefront exposes `POST /api/cms/revalidate` for signed tag/path revalidation; page cache invalidation in Laravel remains handled by `PageObserver`
  - **B1 Auto-save** — debounced auto-save via `router.put` when `hasUnsavedChanges`; `AutoSaveIndicator` in toolbar shows Saving.../Unsaved changes/Saved X min ago with colored dots; successful saves refresh the responsive preview iframe
  - **B2 Scheduled Publishing** — `scheduled_publish_at` + `scheduled_unpublish_at` on `pages` table; `cms:process-scheduled-pages` Artisan command run every minute; `PUT /admin/cms/pages/{page}/builder/schedule` endpoint; `SchedulePopover` in toolbar with datetime-local inputs
  - **B3 Custom CSS per Block** — `_custom_classes`, `_custom_id`, `_custom_css` keys in `block.configuration`; rendered in `SectionRenderer` with sanitized inline `<style>` tag + class/id attributes; Advanced panel in block form
  - **B4 Save as Template** — `section_templates` table (name, description, category, snapshot JSON, is_global, usage_count); `SectionTemplateController` (index/store/destroy/incrementUsage); "Save as Template" button in toolbar with dialog; templates shown in add-section panel
  - **B5 Block Animations** — per-block animation config (`_animation.type/duration/delay/trigger`) stored in configuration; `data-animation-*` attrs on frontend divs; `BlockAnimationObserver` uses IntersectionObserver; CSS in `globals.css`
  - **B6 Block Lock** — `_locked: true` in block.configuration shows amber banner + disables drag/delete in `BlockCard`; Lock toggle in Advanced panel; unlock button in form
  - **B7 Export/Import** — `GET /admin/cms/pages/{page}/builder/export` (JSON download), `POST /admin/cms/pages/{page}/builder/import` (file upload); Export/Import buttons in toolbar (Wayfinder)
  - **B8 Approval Workflow** — `approval_status` (draft/in_review/approved) + `reviewer_id/review_note/submitted_for_review_at/approved_at` on `pages` table; `PageApprovalController` (submitForReview/approve/reject); approval buttons in BuilderToolbar; state managed in builder.tsx
  - **B9 New Block Types** — `alert_banner` (dismissable, cookie-persisted, 4 variants) + `pricing_cards` (monthly/yearly toggle, popular badge); in `PageBlockTypeEnum`, `config/blocks.php`, `block-renderer.tsx`, `client/types/api.ts`
  - **B10 Design System Tokens** — Theme model extended with `typography`, `spacing`, `buttons`, `containers` JSON columns; `HandleAppearance` middleware generates CSS variables (`--font-heading`, `--section-padding-y`, `--btn-radius`, `--container-max-width`, `--section-dark-bg/text`); storefront `globals.css` includes defaults; `ThemeStyles` component on Next.js storefront injects active theme vars; `section-renderer.tsx` uses `var()` references with fallbacks; `call-to-action.tsx` and `hero-banner.tsx` use theme CSS variables for buttons and section variants
  - **B11 Inline Editing (Canvas View)** — Page builder has `viewMode` toggle (Cards/Canvas); `CanvasView` renders admin-native previews for all 30 current Page Builder block types, with section backgrounds/layout/padding; relational and interactive blocks use stable static previews without API calls; blocks are selectable with hover outlines and Edit buttons; double-click opens sidebar inspector; simple text fields (`title`, `heading`, `subtitle`, `description`, `primary_label`, `secondary_label`) can be edited inline and update block configuration; keyboard shortcuts: Ctrl+S (save), Delete (remove), Ctrl+D (duplicate), Esc (deselect), / (quick add); `addQuickBlock()` auto-creates section if needed
  - **B12 Image Editing** — `ImageEditorModal` (react-image-crop) with aspect ratio presets, zoom, rotation and focal point picker; integrated into `MediaPickerModal` with Edit button on images; backend `MediaController::crop()` validates image media, uses natural-pixel crop coordinates, generates cropped variants, stores `crop_of`, `crop_params`, `crop_variant`, dimensions and focal point metadata; media search exposes crop variants and RTE `ImageNode` can switch image nodes to available crop variants
  - **B13 Block Patterns** — `config/cms/block_patterns.php` defines multi-section presets (hero+CTA, features grid, pricing+FAQ, testimonials+stats, blog+newsletter); extensible config-driven system
  - **B14 Performance** — `SectionLazyWrapper` uses IntersectionObserver for lazy-loaded sections (`lazy_load` setting); `block-renderer.tsx` uses `dynamic()` imports for code splitting all 30 block types
  - **BlockRegistry strict mode** — env `BLOCK_REGISTRY_STRICT_MODE` (default `false`): missing registry entry logs a warning and falls back (dev amber placeholder, prod `null`); `true` throws at render time
  - **B15 RTE Full Mode** — `rich_text` block uses `RichTextEditor mode="full"` (full toolbar); other richtext fields use `mode="simple"`; `editor_mode` schema property controls this; `StringSchemaProperty` type includes `editor_mode` field
  - **B16 Simple / Advanced Builder Mode** — Builder toolbar has Simple/Advanced editor mode control; Simple switches to Canvas, keeps inline editing, shows only primary scalar fields and media relations in inspector/cards, and hides advanced animation/CSS/lock/linked-content controls without deleting stored configuration; Advanced shows the full schema-driven form
  - **B17 Storefront Renderer Tests** — `client/` has Vitest (`npm run test:ui`) with `tests/unit/page-builder-renderers.test.tsx`; the smoke suite renders all 30 storefront Page Builder block components with minimal fixtures and covers `SectionRenderer`, `SectionLazyWrapper`, section variants/layouts and `ThemeStyles` CSS variables, with one test case per block type for easy failure isolation
  - **Stable Builder Sync** — `PageBuilderSyncService` uses diff/upsert by DB `id` for sections, blocks and relations; normal saves preserve stable IDs, support block moves between sections, and delete only items omitted from the snapshot
  - **Block schema export** — `php artisan blocks:export` writes `storage/app/blocks.schema.json` (type, schema, `data_strategy`, `context_dependencies`, `allowed_children` per block); snapshot test in `tests/Unit/PageBuilder/BlockSchemaExportTest.php` gates contract drift in CI
- **Themes** — multiple themes with full design system (colors, typography, spacing, buttons, containers); activate/deactivate; per-page override via `theme_id`; CSS variables injected via `HandleAppearance` middleware (admin) and `ThemeStyles` component (storefront); theme editor with Typography/Spacing/Buttons/Containers sections
- **Menus** — CRUD, menu items with link types
- **System page roles foundation** — `pages.system_page_key` plus `config/cms/system_pages.php` define semantic storefront roles such as `privacy_policy`, `returns_portal`, `product_listing` and `blog_listing`; admin page create/edit now exposes a system-role assignment dropdown; public API supports `GET /api/v1/pages/system/{systemPageKey}` for locale-aware resolution with global fallback
- **Forms** — form builder, submissions, email notifications
- **FAQ** — CRUD with reorder and toggle
- **Media** — upload, search, spatie/medialibrary
- **Locales + Translations** — CRUD, inline edit, URL-based locale (`/en/`, `/pl/`)
- **Blog** — posts (markdown/richtext), categories, featured, scheduling, SEO, views count; rich text posts persist rendered HTML plus canonical `content_json` for Lexical editor state
- **Blog containers** — `Blog` model (Shopify Blog→Article pattern); multiple named blogs ("News", "Recipes"); settings per blog (layout, posts_per_page, commentable, default_author); `blog_id` FK on `blog_posts` (nullable, nullOnDelete); admin CRUD at `/admin/blogs`; API at `GET /api/v1/blogs`, `GET /api/v1/blogs/{slug}`, `GET /api/v1/blogs/{slug}/posts`
- **Stores** — physical store locations with map

### E-commerce
- **Products** — variants, attributes, product types, categories, flags, images (spatie/medialibrary), price history
- **Mobile storefront MVP** — `mobile/` Expo Router app with typed API client, TanStack Query provider, SecureStore-backed bearer auth, guest cart token persistence, idempotency keys for cart/checkout mutations, tab navigation (Home, Products, Cart, Account), refreshed glassmorphism storefront visual tokens/shell, CMS-backed home page fallback, product listing/detail with native filters/sort, brand + attribute facets, price range, infinite scroll, product promo/stock/review metadata, standalone `/search` screen with autocomplete/infinite scroll, reviews with submit/helpful votes, wishlist, comparison flow with thumbnails and bottom bar, recently viewed products, cart quantity/remove/discount actions, checkout submit with pickup point ID/map link, BLIK/P24/bank transfer/COD methods, notes, payment redirect and pending/success/failure status polling, login/register/forgot/reset/profile/password change/addresses, full orders list and order detail, account wishlist and GDPR consent/export/restriction/delete controls, blog infinite list/detail with category chips/metadata/share/tags/related posts, stores contact cards with opening hours/map preview, glass newsletter signup, expanded CMS Page Builder renderer for common storefront blocks/relations/video/map embeds, and GitHub Actions `lint-mobile` job. Remaining parity and product gaps are tracked in `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md`.
- **Orders** — full lifecycle, status machine, invoices (PDF), export
- **Cart** — token-based guest cart, abandoned cart cleanup + emails, shared-cart snapshot links with preview + import (`merge` / `replace`)
- **Checkout** — multi-step, shipping, payment providers, idempotency
- **Discounts + Promotions** — conditions, stackable, product/category targeting
- **Shipping Methods** — carrier strategy with Furgonetka aggregation for InPost Courier, DPD Courier, DPD Pickup, DHL Parcel, DHL ServicePoint and GLS; direct InPost ShipX integration for Paczkomat/locker shipments with GeoWidget token support; pickup-point methods expose checkout env requirements to the storefront; local pickup uses a no-op carrier
- **Returns** — return requests, status history, public guest lookup foundation (`POST /api/v1/returns/lookup`, `POST /api/v1/returns/guest-request`) and dedicated authenticated returns endpoints (`GET /api/v1/returns`, `GET /api/v1/returns/{reference}`)
- **Wishlists** — per customer
- **Reviews** — with images, helpful votes, moderation
- **Affiliates + Referrals** — codes, commission tracking (pending/approved/paid)
- **Tax Engine & B2B Mode** — Geographic tax zones (`tax_zones`, `tax_zone_countries`), customer-country rate matching (OSS), Polish NIP & EU VAT validation, customer types (`individual`/`business`), reverse charge rules, dynamic shipping tax behavior, gross-valued calculations, proforma invoice downloads.


### Newsletter
- Subscribers, segments, campaigns (with tracking: opens, clicks, sends)

### Users / Auth
- **Admin auth**: Laravel Fortify (session), 2FA/TOTP
- **API auth**: Laravel Sanctum (tokens)
- **Roles**: admin, editor (Spatie Permissions)
- **GDPR**: soft-delete + PII anonymization (`AnonymizeUserData`), data export (Art. 15), user trash (admin), consent management UI (Art. 7), account deletion notification (Art. 19), processing restriction (Art. 18)

### Payments
- **PayU** — BLIK native, Apple Pay, Google Pay, redirect; OAuth2 token caching; MD5 webhook verification; `POST /api/v1/webhooks/payu`
- **P24** — Basic Auth, SHA256 signature; Apple/Google Pay on P24 page; failed/cancelled returns are resolved from polled transaction status because P24 sends `urlStatus` only for successful payments; `POST /api/v1/webhooks/p24`
- **Paynow** — API v3 hosted/redirect payments for fast online payments and PayPo/deferred payment option; HMAC-SHA256/Base64 request + webhook signatures; `POST /api/v1/webhooks/paynow`
- **Stripe** — Cashier-backed hosted Stripe Checkout for foreign card/wallet/local-method payments; credentials are managed in the admin Settings panel under Payments; checkout session metadata links orders/payments back to local records; `POST /api/v1/webhooks/stripe`
- **Manual methods** — cash on delivery and bank transfer gateways are registered for checkout without redirect/webhook flow
- **Not implemented yet** — Autopay is a candidate for a future payment gateway
- **Payment status**: `GET /api/v1/payments/{payment}/status` (auth + policy)
- Checkout response: `{ order, payment: { id, action, redirect_url } }`
- Infrastructure: `app/Infrastructure/Payments/PayU/` + `app/Infrastructure/Payments/P24/` + `app/Infrastructure/Payments/Paynow/` + `app/Infrastructure/Payments/Stripe/`
- Frontend: `PaymentStep`, `BlikInput`, `ApplePayButton`, `GooglePayButton`, `usePaymentStatus` hook (3s poll), `/checkout/pending` page

### Polymorphic Tags (A2)
- **`HasTags` trait** (`app/Concerns/HasTags.php`) — added to Product, BlogPost, Page, Category; uses polymorphic `taggables` table (`tag_id`, `taggable_type`, `taggable_id`); methods: `tags()` (MorphToMany), `syncTags(array)`, `attachTag(string)`, `detachTag(string)`, `hasTag(string)`, `getTagNames()`; `bootHasTags()` detaches tags on model delete
- **`taggables` table** — replaces old `blog_post_tag` pivot; unique on `[tag_id, taggable_type, taggable_id]`; data migrated from `blog_post_tag` automatically
- **Tag model** — `blogPosts()`, `products()`, `categories()`, `pages()` via `morphedByMany`
- **API**: `GET /api/v1/tags` — public, optional `?type=blog-post|product|page|category` filter by morph type; returns `[{id, name, slug}]`
- **TagController**: `app/Http/Controllers/Api/V1/TagController.php`

### Smart Collections (A3)
- **Smart Category** — `collection_type` column on `categories` (`manual`|`smart`), `rules` (JSON), `rules_match` (`all`|`any`); migration `2026_04_14_000008_add_smart_collection_to_categories_table.php`
- **`SmartCollectionService`** (`app/Services/SmartCollectionService.php`) — `buildQuery(Category)`, `getMatchingProducts(Category)`, `countMatchingProducts(Category)`; supported fields: `price` (less/greater than cents), `brand_id`, `product_type_id`, `tag` (equals/not_equals name), `is_active`, `created_at` (after/before)
- **Category model** — `rules` cast to array, `isSmartCollection(): bool`; `collection_type`, `rules`, `rules_match` allowed in FormRequests
- **Category Attribute Schema (backend foundation)** — `category_attribute_schemas` table (`category_id`, `attribute_id`, `is_required`, `position`) with unique pair on category+attribute; `Category::attributeSchemas()` exposes direct rows and `Category::resolvedAttributeSchemas()` merges parent schema inheritance without inheriting product values
- **Transition compatibility** — migration `2026_06_12_130000_create_category_attribute_schemas_table.php` backfills schema from `product_type_attributes` through `categories.product_type_id` but does not remove or disable legacy `ProductTypeAttribute`
- **Catalog/content demo seed pack** — `DefaultBlogSeeder`, `AttributeDefinitionSeeder`, `CategoryAttributeSchemaSeeder`, `DemoProductSeeder`, `DemoProductVariantSeeder`, `DemoBlogSeeder`, `DemoCmsPageSeeder`, and `DemoMetafieldSeeder` now build an offline-ready final verification dataset with default blog, category-owned schemas, product-level core attributes, legacy-safe variant options, public/private metafields, seeded storefront system pages, and local placeholder assets
- **API**: `ProductController::byCategory()` uses `SmartCollectionService->buildQuery()` when `category->isSmartCollection()`
- **Admin**: Category edit page has Collection Type radio (Manual/Smart) + `SmartCollectionBuilder` component (`resources/js/components/smart-collection-builder.tsx`) for rule editing; `smart_product_count` prop passed from controller

### Metafields
- **Metafields** — Shopify-like arbitrary key/value metadata on any model; `metafields` table (polymorphic `owner_type`/`owner_id`, `namespace`, `key`, `type`, `value`); types: string, integer, float, boolean, json, date, datetime, url, color, image, rich_text
- **MetafieldDefinitions** — admin-managed schema definitions for metafields per owner type; `metafield_definitions` table; supports `visibility` (`private|admin_only|storefront`), `storefront_exposed`, `pinned`, `position`, `validations`
- **`HasMetafields` trait** (`app/Concerns/HasMetafields.php`) — added to Product, BlogPost, Page, Category; methods: `metafields()`, `metafield()`, `getMetafield()`, `setMetafield()`, `deleteMetafield()`, `syncMetafields()`, `getMetafieldsByNamespace()`
- **`Metafield` model** — `getCastedValue()` auto-casts value to correct PHP type
- **Visibility service** — `app/Services/MetafieldVisibilityService.php` serializes definitions/current values, filters public metafields, and resolves owner revalidation paths/events
- **API**: `GET /api/v1/metafields/{type}/{id}` — public, returns only public metafields (`visibility=storefront` or `storefront_exposed=true`) with `casted_value`; types: product, blog-post, page, category
- **Admin CRUD** — `/admin/metafield-definitions` (index/create/edit/destroy), `/admin/metafields/{type}/{id}/sync` (POST)
- **Admin editing** — Product, Category, Page, and BlogPost forms have a dedicated advanced `Metafields` section using `MetafieldEditor`; controlled forms use definition-backed fields and type validation
- **Storefront rendering** — storefront API exposes only public metafields, but UI renders only explicit allowlisted keys with dedicated components; private/admin-only data is not auto-rendered

### System / Infrastructure
- **Settings** — 6 groups (general, mail, etc.), DB-driven, cached 1h, admin UI
- **Notifications** — SSE stream, channels, admin panel
- **Activity Log** — spatie/activitylog on key models
- **Model Versioning** — Product, BlogPost, Category (50/30/30 versions), compare + restore UI
- **Health Checks** — spatie/laravel-health endpoint
- **Security Headers + Webhook Standards** — Laravel global `SecurityHeaders` middleware and Next.js storefront headers/CSP both enforce `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `X-Permitted-Cross-Domain-Policies`, nonce-based CSP on HTML, and HSTS on secure storefront/admin traffic; inbound provider webhooks run through a shared verifier/handler abstraction (`IncomingWebhookVerifierInterface`, provider verifier, `IncomingWebhookHandler`), while outbound admin webhooks use `OutboundWebhookDeliveryService` for public-HTTPS target policy, signed headers, timeouts, normalized results, and consistent delivery tracking
- **Dashboard Widgets** — configurable per-user
- **Cookie Consents** — GDPR, read-only admin view
- **Schema.org** — WebSite, Org, BlogPosting, Product, LocalBusiness, FAQPage (client)
- **Sitemap** — auto-generated, respects `sitemap_exclude` per product/post
- **Enterprise SEO** — `meta_robots`, `og_image`, `sitemap_exclude` on Product/BlogPost/Page/Category; `generateMetadata()` on all public pages; OG + Twitter Card tags; dynamic robots.txt from `seo.robots_txt` setting; `SeoPanel` admin component with SERP preview, Open Graph preview, character counters, and content quality warnings for missing/long SEO fields, missing OG image, canonical gaps, and noindex robots
- **Blog multilingual SEO** — blog posts support `slug_translations`, `translation_group_id`, canonical overrides, localized API slugs, localized article canonicals/hreflang, dynamic article OG images, PL/EN blog RSS (`/blog/rss.xml`, `/en/blog/rss.xml`), article ToC/updated/author/related-post rendering, and `blog:seo-audit` for metadata reports and safe generated fixes.
- **DataLayer / GTM** — view_item, remove_from_cart, begin_checkout, purchase, search events wired (client)
- **GDPR Data Export** — "Download my data" button in profile page, calls `GET /api/v1/profile/export`; includes `processing_restricted_at` in export JSON
- **GDPR Consent Management** — `GET /api/v1/consent` (auth or X-Session-ID header), `DELETE /api/v1/consent/{category}` (withdraw); Cookie Preferences section in profile page with toggles
- **GDPR Processing Restriction** — `POST /api/v1/profile/restrict-processing`, `DELETE /api/v1/profile/restrict-processing`; Data Processing section in profile page; `processing_restricted_at` timestamp on users table
- **GDPR Account Deletion Notification** — `AccountDeletedNotification` sent synchronously before `AnonymizeUserData` runs
- **Promo Badge %** — `discount_percentage` field in ProductData/ProductResource, shown on product cards
- **Recently Viewed** — `use-recently-viewed.ts` hook, `<RecentlyViewed />` component (localStorage, max 10)
- **Product Comparison** — `use-comparison.ts`, `<CompareButton />`, `<ComparisonBar />`, `/compare` page (max 4)
- **Storefront Design System (Epic 6 partial)** — public frontend has `--store-*` design tokens for shell/content width, section spacing, grid gap, card/control radius, product image ratio, focus ring and elevation; product listing uses desktop filter sidebar, mobile filter drawer, active filter chips, branded site name in header, and tokenized product cards; product detail is split into `ProductGallery`, `ProductBuyBox`, `VariantSelector`, `DeliveryPanel`, `ProductTabs`, `ReviewsSection`, and `RelatedProducts`
- **Social Login** — Google + GitHub via `laravel/socialite` v5, `SocialLoginController`, `GET /api/v1/auth/social/{provider}/redirect` + `POST callback`, `<SocialLoginButtons />`, callback page at `/(auth)/social/callback`
- **Admin Bar (Preview Mode)** — `GET /admin/preview?url=&entity_type=&entity_id=&entity_name=&admin_url=` sets `admin_preview` cookie (2h, non-HttpOnly), redirects to frontend URL; "Preview" buttons on Page/BlogPost/Product/Category edit pages; `useAdminPreview()` hook + `<AdminBar />` component in Next.js root layout (fixed dark bar, z-9999, entity badge, "Edit in Admin" + "Exit Preview")
- **Lexical RTE** — full-featured rich text editor at `resources/js/components/ui/rich-text-editor/`; block type dropdown (P/H1–H6/Quote/Code/Bullet/Number/Check), inline formatting (B/I/U/S/Code/Subscript/Superscript/Highlight/Eraser), alignment, floating link editor, floating bubble menu, insert (HR/Image/Gallery/File/Embed/Snippets/Table/2-3 Columns/Collapsible/Emoji/Special chars), code language selector (including PHP and C#), copy-code button, HTML/TXT/Markdown export, word/character count footer, `maxHeight` + `editable` + `showWordCount` props; font size (10–36px), font family, text color picker (24 colors), spellcheck; enterprise media picker modes (`image`, `gallery`, `file`, `video`, `any`) with metadata DTO fields, grid/list display, thumbnail sizing and sort controls; `ImageNode` v2 supports `mediaId`, caption, credit, decorative alt, layout/wrap/size preset, focal point, link URL, lazy/eager loading and responsive `figure` export with pointer/keyboard resize and 32px touch handle plus visible selected-media delete affordances; mobile toolbar scrolls horizontally; `ImageGalleryNode` exports `figure data-rte-gallery` with mobile columns, gap, aspect ratio and lightbox metadata; `AttachmentNode` exports safe `a[data-rte-attachment]`; `EmbedNode` exports safe responsive `figure[data-rte-embed]` iframes for YouTube, Vimeo, Spotify, Loom and TikTok plus safe link placeholders for Instagram and Twitter/X; `SnippetsPlugin` stores reusable selected HTML fragments in localStorage, sanitizes them before save/load/insert, and inserts them at the cursor; `PasteSanitizerPlugin` cleans pasted Word/Google HTML and blocks unsafe links/data images; `LinkDialog` supports internal locale-aware search/autocomplete via `admin.rte.links.search`; `ContentHealthPlugin` shows local RTE warnings and validates internal links through `admin.rte.links.validate`; `TableActionMenuPlugin` (right-click: row/col ops + cell bg color), `SlashCommandPlugin` (type `/`), `DraggableBlockPlugin`; custom nodes: `LayoutContainerNode`, `LayoutItemNode`, `CollapsibleContainerNode`, `CollapsibleTitleNode`, `CollapsibleContentNode`
- **Admin Bar Level 2 (Block Overlays)** — `<AdminBlockOverlay>` wraps each block in `SectionRenderer` when `admin_preview` cookie is set; hover shows block type label + "Edit" button (links to `builder?block={id}`); page builder scrolls to + highlights the block on load when `?block={id}` in URL
- **WCAG 2.1 AA** — skip nav link in root layout (`#main-content`), `aria-label` on icon-only buttons, `aria-live/atomic` on quantity steppers, `aria-current="page"` on active nav links, `aria-expanded/controls` on filter toggles, focus trap in cookie consent dialog (`role="dialog" aria-modal="true"`), labelled form inputs throughout
- **EU/PL Legal Compliance** — checkout terms checkbox (required/accepted validation in `CheckoutRequest`), 14-day withdrawal notice in checkout, ODR platform link in footer legal menu (`https://ec.europa.eu/consumers/odr`), Omnibus price history (30-day low via `PriceHistory` + `ProductVariantPriceObserver`)
- **Playwright E2E** — `client/tests/e2e/` (smoke, cart, i18n specs), Docker service under `testing` profile, `make e2e` / `make e2e-report` Makefile targets
- **Client Unit Smoke Tests** — `client/vitest.config.ts` runs `client/tests/unit/**/*.{test,spec}.{ts,tsx}` via `docker compose exec -T node npm run test:ui`; current coverage includes storefront Page Builder block renderer smoke tests
- **Storefront PWA** — `client/` exposes an App Router `app/manifest.ts`, PWA icons under `client/public/pwa/`, offline fallback at `/offline`, and a production-only service worker registration via `PwaServiceWorker`; `public/sw.js` cache strategy keeps static assets cache-first, public product/blog/store routes stale-while-revalidate, navigations network-first, and excludes cart/checkout/account/payment/auth/profile paths from cache.
- **k3s deployment templating** — Kubernetes manifests use `k8s/render.sh` placeholders (`APP_NAME`, `KUBE_NAMESPACE`, `IMAGE_SERVER`, `IMAGE_CLIENT`, `REVISION`); defaults preserve `app` namespace/prefix. GitHub Actions is the primary deploy path, GitLab CI is an alternative. MySQL backup CronJob lives at `k8s/mysql/cronjob-backup.yaml`.

---

## Key Paths

### Backend (`server/`)
| What | Where |
|------|-------|
| Models | `app/Models/` |
| API Controllers | `app/Http/Controllers/Api/V1/` |
| Admin Controllers | `app/Http/Controllers/Admin/` |
| Services | `app/Services/` |
| Actions | `app/Actions/` |
| Events | `app/Events/` |
| Jobs | `app/Jobs/` |
| Enums | `app/Enums/` |
| API Resources | `app/Http/Resources/Api/` |
| Form Requests | `app/Http/Requests/` |
| Policies | `app/Policies/` |
| Factories | `database/factories/` |
| Migrations | `database/migrations/` |
| Seeders | `database/seeders/` |
| Admin Routes | `routes/admin.php` + `routes/admin/*.php` |
| API Routes | `routes/api.php` |
| Console Schedule | `routes/console.php` |
| Inertia Pages | `resources/js/pages/` |
| UI Components | `resources/js/components/ui/` |
| Wayfinder Routes | `resources/js/actions/` (auto-generated) |
| Tests | `tests/Feature/` + `tests/Unit/` |

### Frontend (`client/`)
| What | Where |
|------|-------|
| Pages | `app/` (Next.js App Router) |
| API calls | `api/` |
| Hooks | `hooks/` |
| Components | `components/` |
| Types | `types/api.ts` |
| Server fetch | `lib/server-fetch.ts` |
| Client fetch | `lib/axios.ts` |
| i18n | `lib/i18n.ts` |
| Schema.org | `lib/schema.ts` |

---

## Critical Conventions

### PHP
- `declare(strict_types=1)` at top of every file
- Constructor property promotion
- Explicit return types
- `casts()` method (not `$casts` property)
- `Model::query()` never `DB::` for queries
- Eager load relations — no N+1
- Form Requests for all validation (never inline)
- `env()` only inside `config/` files

### TypeScript / React
- Wayfinder for all route references (`@/actions/` or `@/routes/`)
- `<Form>` component (Inertia) for forms
- `<Link>` (Inertia) for navigation, never `<a>`
- `serverFetch()` for server components, `api` (axios) for client components
- Check `client/types/api.ts` before writing any API call

### Testing
- Every feature needs tests — `php artisan make:test --pest Name`
- Run: `php artisan test --compact`
- Use factories; check for existing states before creating manually
- `assertSoftDeleted` for soft-delete models, not `assertDatabaseMissing`

### Database
- Docker: `docker compose exec php php artisan migrate`
- Soft deletes: User, Customer (+ Brand) use `SoftDeletes`
- Translatable: Product, Category, BlogPost, Page, **ProductVariant** (spatie/laravel-translatable) — ProductVariant translates `name` column (json)

---

## Docker Commands (from repo root)

```bash
make up            # Start all containers
make down          # Stop containers
make shell         # Enter PHP container
make migrate       # Run migrations
make fresh         # Fresh migrate + seed
make test          # Run tests
make quality       # Pint + PHPStan

# Always use docker compose exec — never run php/pint directly (no DB/Redis on host)
docker compose exec php php artisan <cmd>
docker compose exec php php artisan test --compact
docker compose exec php vendor/bin/pint --dirty
```

---

## Seeder Order

`RolePermissionSeeder → UserSeeder → ProductTypeSeeder → EcommerceDemoSeeder → DiscountSeeder → PromotionSeeder → FormSeeder → PagesDemoSeeder → ThemeSeeder → SettingsSeeder → ShippingMethodSeeder → MenuSeeder → BlogSeeder → LocaleSeeder → TranslationSeeder → DashboardWidgetSeeder`

---

## Packages (key)

**Backend**: Laravel 12, Fortify, Sanctum, Inertia v2, Wayfinder, Scout + Typesense, spatie/permission, spatie/medialibrary, spatie/translatable, spatie/model-states, spatie/query-builder, spatie/activitylog, spatie/health, spatie/pdf, maatwebsite/excel, Telescope, Boost (dev)

**Frontend (client)**: Next.js 16, React 19, TanStack Query, Axios, Zod, react-hook-form, Tailwind v4, Radix UI, shadcn/ui, Leaflet, Recharts, Playwright (E2E)

**Frontend (admin)**: Inertia React v2, Radix UI, shadcn/ui, TanStack Table, Tiptap, DnD Kit, Wayfinder

---

## Current Test Count

107 passing (as of 2026-03-24) — old broad tests removed; replaced with focused feature tests covering Cart, Checkout security, Orders API, Reviews, Webhooks (PayU/P24), Wishlists, Blog scheduling, PayU webhook verifier
