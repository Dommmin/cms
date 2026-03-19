# Features Backlog

> Last updated: 2026-03-17

---

## ✏️ Lexical Rich Text Editor — Full Implementation

**Status:** ✅ Fully implemented (2026-03-17).

**Reference:** https://playground.lexical.dev/ · https://github.com/facebook/lexical/tree/main/packages/lexical-playground

### Current state (what exists)
- Text: bold, italic, underline, strikethrough ✅
- Headings: H1, H2, H3 ✅
- Lists: ordered, unordered ✅
- Code block (with syntax highlighting) ✅
- Link — via `window.prompt()` (no edit/remove UI) ⚠️
- Table — hardcoded 3×3, no toolbar controls ⚠️
- Undo/redo ✅
- Markdown shortcuts ✅
- HTML serialization/deserialization ✅
- Toolbar: plain text labels (`B`, `I`, `U`, `H1`, `OL`, etc.) — no icons, no shadcn/ui styling ❌
- `ImageNode`, `YouTubeNode`, `ImageGalleryNode` exist in source but are **not registered or accessible from toolbar** ❌

### Toolbar UX
- [x] Replace all text labels with **Lucide icons** (`Bold`, `Italic`, `Underline`, `Strikethrough`, `Link`, `List`, `ListOrdered`, `Code`, `Image`, `Youtube`, `Table`, `Undo2`, `Redo2`, etc.)
- [x] Proper **shadcn/ui** styled toolbar using `Toggle` / `ToggleGroup` components with active state
- [x] Separator `<Separator orientation="vertical" />` dividers between tool groups
- [x] **Block type dropdown** (replaces individual H1/H2/H3 buttons): Paragraph / H1 / H2 / H3 / H4 / H5 / H6 / Quote / Code / Bullet list / Numbered list / Check list
- [x] **Floating format toolbar** — bubble menu that appears above text selection with: Bold / Italic / Underline / Strikethrough / Code / Link / Text color / Highlight (`FloatingTextFormatPlugin`)
- [x] Tooltip (`<TooltipProvider>`) on every toolbar button with keyboard shortcut hint

### Text formatting (missing)
- [x] Subscript / Superscript
- [x] Inline code (`` `text` `` — distinct from code block)
- [x] Text highlight / background color (color picker popover)
- [x] Text color (color picker popover) — color grid in ToolbarPlugin
- [x] Font size selector (dropdown: 10–36px) — `$patchStyleText` in ToolbarPlugin
- [x] Font family selector (dropdown: default, serif, monospace, cursive)
- [x] Clear all formatting button (Eraser icon)

### Block types (missing)
- [x] Quote / Blockquote — `QuoteNode` in toolbar
- [x] Check list — `CheckListPlugin` + `ListItemNode` with checkbox rendering
- [x] H4, H5, H6 headings

### Text alignment (missing)
- [x] Left / Center / Right / Justify — `FORMAT_ELEMENT_COMMAND`

### Insert menu / dropdown (missing)
- [x] Horizontal rule (`<hr>`)
- [x] Image from URL — via MediaPickerModal in Insert menu
- [x] Image upload — via MediaPickerModal in Insert menu
- [x] YouTube embed — `InsertYouTubeDialog` with URL input
- [x] Table — `InsertTableDialog` (rows × columns input)
- [x] Collapsible section — `CollapsibleContainerNode`/`CollapsibleTitleNode`/`CollapsibleContentNode` custom nodes; renders as `<details>/<summary>/<div>`; in Insert dropdown
- [x] Columns layout — `LayoutContainerNode`/`LayoutItemNode` (CSS grid); 2-col (`1fr 1fr`) and 3-col (`1fr 1fr 1fr`) in Insert dropdown
- [x] Emoji picker — dialog with 7 category groups, ~140 emojis (in Insert dropdown)
- [x] Special characters / symbols — dialog with 4 groups (Typography, Currency, Arrows, Math) in Insert dropdown

### Links (improvement required)
- [x] Floating link editor popover — `FloatingLinkEditorPlugin`
- [x] `AutoLinkPlugin` — automatic conversion of typed URLs/emails to links

### Table improvements (missing)
- [x] `TableActionMenuPlugin` — right-click context menu: insert row above/below, insert column left/right, delete row, delete column, unmerge cell (`TableActionMenuPlugin.tsx`)
- [x] Cell background color — 9-color preset palette in `TableActionMenuPlugin` context menu; `TablePlugin hasCellBackgroundColor` enabled

### Code blocks (improvement required)
- [x] Language selector dropdown on code blocks (40+ languages — in toolbar, context-sensitive)
- [x] Copy code button in top-right corner of code block (`CopyCodePlugin`, appears on hover)

### Other (missing)
- [x] **Character and word count** display at bottom of editor (`WordCountPlugin`, `showWordCount` prop)
- [x] **Draggable block plugin** — drag handle on left of each block for reordering (`DraggableBlockPlugin_EXPERIMENTAL` from `@lexical/react`)
- [x] **Slash command menu** `/` — type `/` at start of line to open block-type insert menu (like Notion) (`SlashCommandPlugin.tsx`)
- [x] Max height + scroll container — `maxHeight` prop on `<Editor>`
- [x] Read-only mode prop — `editable={false}` prop on `<Editor>`
- [x] Spellcheck toggle — `SpellCheck` icon in toolbar, toggles `editor.getRootElement().spellcheck`

### Notes
- All plugins should respect the existing `nodes.ts` registration pattern — add nodes there before using them
- ImageNode and YouTubeNode are already defined in `image-node.tsx` and `youtube-node.tsx` but are **not in `nodes.ts`** and have no triggering UI
- Toolbar styles must be consistent with shadcn/ui design system used in the rest of the admin SPA
- Follow the Lexical playground source: `packages/lexical-playground/src/plugins/`

---

## 🔧 Admin Bar — Frontend Editing Mode

**Status:** ✅ Fully implemented (2026-03-17). Level 1 (Admin Bar) + Level 2 (Block Overlays).

**Concept:** When an admin is viewing the public Next.js frontend in preview mode, a sticky bar at the top and inline block overlays give direct access to the admin editor — similar to WordPress Admin Bar but focused on CMS edit actions.

**How it works:**
1. Admin clicks "Preview" on any Page / Product / BlogPost / Category edit page in admin panel
2. Server sets a signed `admin_preview` cookie (2h TTL, not HttpOnly) with `{ userId, role, entity: { type, id } }`
3. Client reads cookie via `useAdminPreview()` hook on every page load
4. `AdminBar` component renders at top of page (z-50, sticky, 40px height offset to body)
5. Each Next.js page passes its entity context to `AdminBar` via props
6. AdminBar shows entity name + "Edit in admin" button + "Exit preview" button

### Level 1 — Admin Bar (priority)

**Backend (Laravel):**
- [x] `GET /admin/preview?url={frontendUrl}` — sets `admin_preview` cookie (2h, not HttpOnly), redirects to `url`; requires auth + admin role
- [x] "Preview" button on edit pages: Page, BlogPost, Product, Category — links to frontend URL in new tab and triggers cookie set
- [x] `frontendUrl` is already in shared Inertia props — use it to build preview links: `frontendUrl + /{locale}/{slug}`

**Frontend (Next.js):**
- [x] `useAdminPreview()` hook — reads `admin_preview` cookie, returns `{ isPreview: boolean, entity: EntityContext | null }`
- [x] `AdminBar` component — sticky top bar:
  - Dark background (`bg-gray-950`)
  - Left: Settings icon + "Admin Preview" label
  - Center: entity type badge + entity name
  - Right: "Edit in Admin" button (opens admin URL in new tab) + "Exit Preview" button (clears cookie, reloads)
  - Height: 40px, `position: fixed`, `z-index: 9999`
- [x] Entity context passed from each page:

| Next.js page | Entity type | Admin edit URL |
|---|---|---|
| `app/[...slug]/page.tsx` | `page` | `/admin/cms/pages/{id}/edit` |
| `app/blog/[slug]/page.tsx` | `blog_post` | `/admin/blog/posts/{id}/edit` |
| `app/products/[slug]/page.tsx` | `product` | `/admin/ecommerce/products/{id}/edit` |
| `app/products/page.tsx` | — | `/admin/ecommerce/products` |

### Level 2 — Block Overlays (Page Builder, after Level 1)

**Goal:** Hovering over a page builder block shows an edit button that opens the page builder scrolled to that block.

**Backend:**
- [x] `data-section-id` already in `SectionRenderer` (was existing); `data-block-id` added to `BlockCard` in page builder
- No server-side change needed — block IDs are already in the page API response

**Frontend:**
- [x] `AdminBlockOverlay` component (`client/components/admin/admin-block-overlay.tsx`) — hover overlay with indigo border + block type label + "Edit" button → `builder?block={blockId}` (opens in new tab)
- [x] `PageRenderer` reads `admin_preview` cookie server-side, passes `isPreview` + `pageId` + `adminBaseUrl` to `SectionRenderer`
- [x] `SectionRenderer` wraps each active block with `<AdminBlockOverlay>` when `isPreview` is true
- [x] Page builder: `useEffect` reads `?block=` from URL, scrolls to `[data-block-id="{id}"]` card and adds pulse ring animation

---

## 🚀 Faza 1 — Produkcja

> Zadania wymagane do stabilnej produkcji.

- [x] Fix 38 failing tests (Auth route names, FaqController, CurrencyController, PromotionService, PageBuilderLiveEdit, UsersTest)
- [x] Invoice PDF attachment in `OrderConfirmedNotification` — attach generated PDF to order confirmation email
- [x] `cart:clean` Artisan command + daily scheduler — delete carts older than 30 days (auth) / 7 days (guest)
- [x] `ProductsImport` extended with variant rows — `variant_sku`, `variant_price`, `variant_stock`, `attribute_*` columns

---

## 🔮 Faza 2 — Post-launch

> Kluczowe funkcje marketingowe i operacyjne po wdrożeniu.

- [x] **Abandoned Cart Recovery** — `AbandonedCartNotification` + `SendAbandonedCartEmails` job (hourly), settings `abandoned_cart_hours` + `abandoned_cart_discount_code`
- [x] **Low-Stock Alerts** — `LowStockNotification` + `SendLowStockAlerts` job (daily), setting `low_stock_alert_email`
- [x] **Post-Purchase Review Request** — `ReviewRequestNotification` + `SendReviewRequestEmail` listener on `OrderDelivered` event
- [x] **RSS Feed** — `GET /feed` (web), `BlogFeedController`, XML response, locale filter, 1h cache
- [x] **Product Comparison endpoint** — `GET /api/v1/products/compare?ids[]=1&ids[]=2` (max 4, same product_type validation)

---

## 🌍 i18n

**Status:** ✅ Fully implemented.

- URL-based locale middleware (`/en/products` → rewrite, sets cookie)
- Translatable models: `Product`, `Category`, `BlogPost`, `Page` via `spatie/laravel-translatable`
- `SetLocale` middleware on all API routes (`?locale=`)
- Admin panel locale switcher (`LocaleTabSwitcher`) wired into: Product create/edit, Category create/edit, BlogPost edit
- Locales CRUD + Translations inline editor in admin
- `TranslationProvider` + `useLocale()` + `useLocalePath()` in client frontend

**Remaining:**
- Slug regeneration per locale (slugs are currently locale-neutral)

---

## 🏗️ Mega Menu

**Status:** ✅ Fully implemented (client frontend).

- `MegaMenu` component — hover/click dropdowns with categories panel
- `SearchBar` component — debounced search, highlighted match text, keyboard navigation (↑↓ Enter Esc)
- Recent searches in `localStorage` (last 5, clear button)
- `useSearchSuggestions()` hook
- `google-tag-manager.tsx`, `locale-switcher.tsx`, `mobile-menu.tsx` in `client/components/layout/`

**Remaining:**
- Admin Settings group `mega_menu` for featured categories/brands/banner configuration

---

## 🔍 Advanced Search Page

**Status:** ✅ Implemented (client frontend).

- `/search` page with filter sidebar: categories, price range (min/max), sort options
- URL-persisted filters (`?q=&category=&sort=&min_price=&max_price=`)
- Sort: default, price asc/desc, newest
- `useProducts()` hook with full filter support

**Remaining:**
- Attribute filter (size/color/etc.) — requires backend `allowedFilters` extension
- "No results" state with suggested categories

---

## ⭐ Product Reviews — Front-end

**Status:** ✅ Implemented (client frontend).

- Reviews section on product detail page with star rating summary + list
- "Write a review" form (authenticated users)
- Helpful vote button (`useMarkReviewHelpful`)
- Review tabs (Description / Reviews) on product page

**Remaining:**
- Review images upload

---

## 💌 Wishlist — Front-end

**Status:** ✅ Implemented.

- Heart toggle button on `ProductCard` (`useAddToWishlist`, `useRemoveFromWishlist`, `useIsInWishlist`)
- `/account/wishlist` page — list items, move to cart, remove
- Backend API fully functional

**Remaining:**
- Max items limit enforcement (no 100-item cap enforced in `WishlistController::addItem()`)

---

## 📦 Order Tracking Page

**Status:** ✅ Implemented.

- `/account/orders` — order list
- `/account/orders/[reference]` — order detail with items and status

---

## 🏷️ Promotions / Banners — Front-end

**Status:** ⚠️ Partially implemented.

- Admin: Promotions model + CRUD ✅
- Client: No promo badge on product cards
- Client: No homepage/category promotional banners
- Client: No "flash sale" countdown timer

**Remaining:**
- Promo badge on `ProductCard` (show active promotions)
- Homepage promotional banner section
- Category page top banner
- Flash sale countdown timer

---

## 🍪 Cookie Consent + GTM / DataLayer

**Status:** ✅ Fully implemented.

- `CookieConsentBanner` component — "Accept all", "Reject all", "Manage preferences"
- Consent stored in `localStorage` + cookie for SSR reads
- GTM consent mode v2 — default denied, update on accept
- `client/lib/datalayer.ts` — `pushDataLayer()`, `initConsentMode()`, `updateConsent()`, `trackPageView()`
- `GoogleTagManager` component reads `gtm_id` from settings, wired into root layout
- GTM initialized only after consent given

**Remaining:**
- Admin Settings group `tracking` UI for `gtm_id`, `ga4_id`, `meta_pixel_id` (backend `Setting` records may need seeding)
- DataLayer events for: `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `purchase`, `sign_up`, `login`, `search` — need wiring into actual user actions

---

## 🗂️ Page Builder improvements

**Status:** ✅ Fully implemented (except Block Templates Library).

- ✅ Block preview thumbnails (`BlockThumbnail` component in `block-card.tsx`)
- ✅ Copy/paste blocks between pages (localStorage key `pb_clipboard`, copy button in `BlockCard`, Paste in `BlocksList`)
- ✅ Undo/redo (Ctrl+Z / Ctrl+Shift+Z) — `useReducer` with history stacks, max 20 steps (`use-builder-state.ts`)
- ✅ Mobile preview mode (`PreviewDevice` type, device selector in toolbar, iframe max-width in `builder.tsx`)
- ⚠️ Block templates library — `SectionTemplatesDialog` component exists with UI skeleton, but **no pre-built templates seeded**

**Remaining:**
- Seed pre-built section templates (`SectionTemplate` model → `section_templates` table)

---

## 📊 Admin Dashboard — Widgets

**Status:** ✅ Fully implemented.

- Widget system: `DashboardWidget` model, `StatCard`, `ChartWidget`, configurable position/size
- `DashboardWidgetSeeder` creates default widgets
- `DashboardController` implements `getChartData`, `getTableData`, `getStatData` with real backend aggregation queries
- Revenue chart, orders by status, top products, recent reviews, low stock alert all wired up

---

## 🔔 Real-time Notifications (Admin)

**Status:** ✅ SSE implemented.

- `GET /admin/notifications/stream` — SSE, 3s poll, 25s reconnect loop
- `NotificationBell` component with auto-reconnect `EventSource`

**Remaining:**
- Browser notification permission request (Web Notifications API)

---

## 🤝 Affiliate / Referral System

**Status:** ✅ Fully implemented.

- `AffiliateCode` model — create codes, toggle active, track uses_count
- `Referral` model — commission flow: pending → approved → paid (with `paid_at`)
- Admin: `/admin/affiliates/codes` (CRUD), `/admin/affiliates/referrals` (index + approve/mark-paid/cancel + bulk mark-paid)
- Checkout: `referral_code` in `CheckoutRequest` → `CheckoutService` records referral, increments uses_count

---

## 📋 Activity Log (Audit Trail)

**Status:** ✅ Implemented.

- `spatie/laravel-activitylog` — `LogsActivity` trait on: Product, ProductVariant, Category, BlogPost, Order, Page, User, Setting
- Admin: `/admin/activity-log` — paginated, filter by user/model/event/date, field-level diff display
- Logs kept 90 days (`activitylog:clean` weekly via scheduler)

**Remaining:**
- Per-model activity log sidebar panel on edit pages (currently only `<VersionHistory>` is in the sidebar, not activity log)

---

## 🗂️ Model Versioning

**Status:** ✅ Fully implemented.

- `model_versions` table — polymorphic, snapshot + diff per save
- `HasVersions` trait (`app/Concerns/HasVersions.php`) — hooks `saved`/`deleted`, respects `$versionedAttributes` and `$maxVersions`
- Applied to: `Product` (50 versions), `BlogPost` (30), `Category` (30)
- `ModelVersionController` — index, compare, restore
- `<VersionHistory>` component — sidebar panel on Product, BlogPost, Category edit pages; click to expand diff, restore button
- Routes: `GET /admin/versions/{type}/{id}`, compare, restore

---

## ⚖️ Product Comparison (Front-end)

**Status:** ❌ Not implemented.

**Planned:**
- `useComparison()` hook (max 4, same product_type guard, 7-day TTL localStorage)
- `ComparisonBar` — sticky bottom bar
- `/compare` page — side-by-side attribute table
- `CompareButton` on `ProductCard` + product detail
- Backend: `GET /api/v1/products/compare?ids[]=1&ids[]=2`
- Admin setting `comparison_max_products`

---

## 🛒 Cart & Wishlist — Limits and Auto-cleanup

**Status:** ❌ Not implemented.

**Planned:**
- `cart:clean` Artisan command (30 days auth, 7 days guest) + daily scheduler
- Wishlist max 100 items enforced in `WishlistController::addItem()` (currently no limit)
- `versions:prune` weekly scheduler (currently the pruning happens inline on every save — no separate job needed)
- `recently_viewed` in localStorage (rolling 20 product IDs, client-side only)

---

## 💬 Customer Support Chat

**Status:** ✅ Fully implemented (2026-03-08).

> Jak robią to enterprise firmy (Zalando, Modivo, About You, xkom, morele):
> Sticky widget (prawy dolny róg) → pre-chat kwalifikujące pytania → rozmowa z agentem lub zgłoszenie ticketu.
> Agent w panelu widzi całą historię konwersacji, dane klienta, historię zamówień, może przypisać rozmowę.

### Decyzja: **Natywna implementacja** (zamiast zewnętrznego Chatwoot/Intercom)

| Opcja                     | Zalety                                                                         | Wady                                  |
|---------------------------|--------------------------------------------------------------------------------|---------------------------------------|
| **Natywna** ✅             | Pełna kontrola danych (GDPR), integracja z orderami/klientami, spójny admin UI | Więcej kodu do napisania              |
| Chatwoot (self-hosted)    | Gotowe UI agenta, websockets                                                   | Dodatkowy serwis Docker, osobna DB    |
| Tawk.to / Crisp (SaaS)    | Darmowe, szybki start                                                          | Brak kontroli danych, GDPR ryzyko     |
| Intercom / Zendesk (SaaS) | Bogaty w funkcje                                                               | Drogie (od $89/mies.), vendor lock-in |

**Verdict: natywna implementacja** — spójna z architekturą, GDPR-safe, pełna integracja z orderami.

### Architektura

**Modele:**
- `SupportConversation` — `id`, `customer_id` (nullable), `email`, `name`, `status` (open/pending/resolved/closed), `subject`, `channel` (widget/email), `assigned_to` (user_id), `token` (UUID, dla gości), `last_reply_at`
- `SupportMessage` — `id`, `conversation_id`, `sender_type` (customer/agent), `sender_name`, `body`, `is_internal` (notatka agenta, niewidoczna dla klienta), `read_at`
- `SupportCannedResponse` — `id`, `title`, `shortcut`, `body` (szybkie odpowiedzi dla agentów)

**Pre-chat flow (kwalifikacja):**
1. Użytkownik klika ikonę chatu → pojawia się okno z pytaniami wyboru: „Masz pytanie o zamówienie? / Pytanie o produkt? / Inny temat?"
2. Po wyborze tematu: formularz z imieniem, emailem (jeśli niezalogowany) i treścią pierwszej wiadomości
3. Tworzona jest `SupportConversation` z `status=open`, token UUID w localStorage

**API (public):**
- `POST /api/v1/support/conversations` — start rozmowy (pre-chat form submit)
- `GET /api/v1/support/conversations/{token}` — pobierz wiadomości (token z localStorage)
- `POST /api/v1/support/conversations/{token}/messages` — wyślij wiadomość (klient)
- `GET /api/v1/support/conversations/{token}/unread` — liczba nieprzeczytanych (polling co 5s lub SSE)

**Admin panel:**
- `GET /admin/support/conversations` — inbox ze statusami (open/pending/resolved), filtrowanie, przypisanie
- `GET /admin/support/conversations/{id}` — widok konwersacji: chat po lewej, panel klienta po prawej (profil, zamówienia)
- `POST /admin/support/conversations/{id}/messages` — odpowiedź agenta
- `POST /admin/support/conversations/{id}/assign` — przypisz do agenta
- `POST /admin/support/conversations/{id}/status` — zmień status
- CRUD `/admin/support/canned-responses` — zarządzanie gotowymi odpowiedziami

**Frontend (client):**
- `<SupportChatWidget>` — sticky przycisk prawy dolny róg (kółko z ikoną chatu)
- Otwiera sidebar/popup z historią wiadomości
- Pre-chat pytania kwalifikujące (wybór tematu)
- Token konwersacji w `localStorage` (`support_token`)
- Polling co 5s lub SSE stream dla nowych wiadomości od agenta
- Wskaźnik nieprzeczytanych wiadomości na ikonie

**Admin UX:**
- Licznik otwartych konwersacji w sidebarze (obok „Support")
- Powiadomienie real-time w `NotificationBell` gdy nowa wiadomość (istniejący SSE stream)
- Canned responses — skrót `#` + szukanie po shortcut w polu odpowiedzi
- Notatki wewnętrzne (is_internal) — żółte tło, niewidoczne dla klienta

---

## 🏢 Enterprise Features — Roadmap

> Features for future production-grade releases.

### 🔐 Security & Compliance
- **2FA** — ✅ Fortify 2FA implemented
- **API rate limiting** — ✅ 3 named limiters defined
- **GDPR data export** — ❌ `GET /api/v1/account/gdpr/export` not built
- **GDPR account deletion** — ❌ not built
- **Audit log retention UI** — ❌ configurable via Settings but no admin UI field
- **IP allowlist for admin** — ❌ not built
- **Session management page** — ❌ not built

### 📧 Email & Marketing
- **Transactional email templates (DB-stored)** — ❌ not built
- **Abandoned cart recovery** — ✅ Implemented (Faza 2)
- **Newsletter double opt-in** — ❌ not built
- **Post-purchase review request email** — ✅ Implemented (Faza 2)

### 📊 Analytics & Reporting
- **Admin dashboard charts** — ⚠️ widget system exists, data missing
- **Sales reports (CSV/XLSX export)** — ❌ not built
- **Inventory report** — ❌ not built
- **Search analytics (search_logs)** — ❌ not built

### 🏷️ Pricing & Promotions
- **Price rules engine (flash sales, VIP pricing, quantity breaks)** — ❌ not built
- **Bundle products** — ❌ not built
- **Gift cards** — ❌ not built
- **Loyalty points** — ❌ not built

### 📦 Logistics
- **Multi-warehouse support** — ❌ not built
- **Shipment tracking webhook** — ❌ not built
- **Click & Collect** — ❌ `Store` model exists, no checkout integration

### 🌐 Internationalization (advanced)
- **Currency auto-conversion UI** — ❌ `ExchangeRate` model exists, no frontend display
- **Per-locale SEO slugs** — ❌ not built
- **RTL support** — ❌ not built

### ⚙️ Developer Experience
- **Webhook outbox** — ❌ not built
- **CSV import for products** — ⏳ Faza 1 (with variant support, planned)
- **CSV export for orders/customers** — ⚠️ `export` route exists in ecommerce routes, implementation unknown
- **API v2 namespace** — ❌ not built

### 💬 Customer Support
- **Support Chat Widget** — ✅ implemented (sticky widget, pre-chat form, token-based, polling 5s)
- **Support Ticket system** — ✅ implemented (SupportConversation model, open/pending/resolved/closed)
- **Canned responses** — ✅ implemented (shortcut system, admin CRUD)
- **Agent assignment + inbox** — ✅ implemented (2-column show page, assign, status, internal notes)

### 🛍️ Product Discovery (Zalando, xkom, morele, About You)
- **Recently Viewed Products** — ❌ localStorage rolling 20 IDs (client-only, planned in Cart section)
- **"Customers Also Bought" recommendations** — ❌ not built (co-purchase matrix)
- **"Similar Products" section** — ❌ not built (same category/type, different price)
- **"Frequently Bought Together" bundles** — ❌ not built
- **Product availability notification** — ❌ "Powiadom mnie gdy dostępny" (`StockNotification` email when `stock > 0`)
- **Real-time stock urgency indicator** — ❌ "Tylko 3 sztuki!" shown when `stock <= 5`
- **Product video support** — ❌ video_url field on Product + embedded player
- **Size guide** — ❌ per product_type guide modal (fashion platforms)
- **Social proof counters** — ❌ "X osób ogląda teraz" (fake/real), "Y sprzedanych w 24h"

### 🛒 Checkout & UX (Shopify, About You, xkom)
- **Address autocomplete** — ❌ Google Places / Algolia Places API integration
- **One-click reorder** — ❌ "Kup ponownie" button on order history page
- **Express checkout** — ❌ PayPal Express, Apple Pay, Google Pay
- **Gift wrapping option** — ❌ checkbox + note at checkout
- **Save cart for later** — ❌ move item from cart to saved-for-later list
- **Order SMS notifications** — ❌ SMS via Twilio/SMS API for order status changes
- **Store credit / wallet balance** — ❌ refund to store balance, pay with balance

### 📱 Mobile & Performance
- **Progressive Web App (PWA)** — ❌ service worker, offline support, "Add to Home Screen"
- **Web Push Notifications** — ❌ order updates, back-in-stock via browser push
- **Lazy loading / infinite scroll** — ⚠️ basic pagination exists, no infinite scroll
- **Image lazy loading with blur placeholder** — ❌ Next.js Image optimization (blurDataURL)

### 💎 Loyalty & Retention (Zalando Plus, morele Premium)
- **Customer tier / VIP pricing** — ❌ Bronze/Silver/Gold based on total spend
- **Loyalty points program** — ❌ earn points per purchase, redeem as discount
- **Subscription / recurring orders** — ❌ for consumables (subscribe & save)
- **Store credit** — ❌ gift as compensation, use at checkout

### 🔔 Notifications & Communication
- **Browser notification permission** — ⚠️ Web Notifications API not requested (noted in Real-time section)
- **SMS order status notifications** — ❌ not built
- **WhatsApp notifications** — ❌ not built (popular in EU markets)

### 🔑 Authentication (Social Login)
- **Social login** — ❌ Google / Facebook / Apple OAuth via Socialite
- **Magic link login** — ❌ passwordless email link

### 🏪 B2B Features (xkom, morele business accounts)
- **B2B/business account type** — ❌ company name, NIP/VAT number fields on Customer
- **Bulk order / quote request** — ❌ request pricing for large quantities
- **Net payment terms** — ❌ "Pay in 30 days" for B2B customers
- **Per-customer pricing** — ❌ custom price lists per customer/company

---

## 🧩 Schema.org / Structured Data

**Status:** ✅ Fully implemented.

- `client/lib/schema.ts` — builders: `buildWebSite`, `buildOrganization`, `buildBlogPosting`, `buildWebPage`, `buildFaqPage`, `buildProduct`, `buildLocalBusiness`, `buildBreadcrumbList`
- `client/components/json-ld.tsx` — `<JsonLd>` server component
- Wired into: `layout.tsx` (WebSite + Organization), `blog/[slug]` (BlogPosting), `[...slug]` (WebPage/FAQPage), `stores` (LocalBusiness), `products/[slug]` (Product, client-side)

---

## 📦 Spatie Packages — Infrastructure

> Additional Spatie packages identified as valuable for this project. Grouped by implementation timing.

---

### 🏥 `spatie/laravel-health`

**Status:** ✅ Implemented.

- `GET /api/health` public endpoint returning JSON with `storedCheckResults`
- Checks: `DatabaseCheck`, `RedisCheck`, `ScheduleCheck`, `UsedDiskSpaceCheck` (warn 70%, fail 80%)
- `HealthServiceProvider` registered in `bootstrap/providers.php`
- Tests: `tests/Feature/Api/HealthCheckTest.php`

---

### 📊 `maatwebsite/laravel-excel`

**Status:** ✅ Implemented.

- `app/Exports/OrdersExport.php`, `CustomersExport.php`, `ProductsExport.php` — `FromQuery + WithHeadings + WithMapping + ShouldQueue + ShouldAutoSize`
- `app/Imports/ProductsImport.php` — `ToModel + WithChunkReading(200) + WithHeadingRow + WithValidation`
- Admin routes: `GET /admin/ecommerce/orders/export`, `GET /admin/ecommerce/customers/export`, `GET /admin/ecommerce/products/export`, `POST /admin/ecommerce/products/import`
- Tests: `tests/Feature/Admin/OrderExportTest.php`, `tests/Feature/Admin/ProductImportTest.php`

---

### 🖨️ `spatie/laravel-pdf` v2

**Status:** ✅ Implemented.

> Chosen over raw `spatie/browsershot` — higher-level Laravel abstraction with driver flexibility.
> Driver decision: **Gotenberg** (see analysis below).

**Driver comparison:**

| Driver | CSS/Tailwind | Infra needed | Docker fit | Notes |
|---|---|---|---|---|
| **Gotenberg** ✅ | ✅ full (Chromium) | separate container | ✅ excellent | No Node.js in PHP image |
| Browsershot | ✅ full (Chromium) | Node.js + Chrome in PHP | ⚠️ heavy | Default driver, bloats PHP container |
| Cloudflare | ✅ full (Chromium) | none (HTTP API) | ✅ | Paid API, vendor lock-in, latency |
| WeasyPrint | ⚠️ no grid/flex/Tailwind | Python binary | ⚠️ | Good for print headers/footers only |
| DOMPDF | ❌ no modern CSS | none (pure PHP) | ✅ | Unacceptable for Tailwind invoices |

**Verdict: Gotenberg is the best choice for this stack.**
- Runs as a dedicated Docker service (`gotenberg/gotenberg:8`) — clean separation of concerns
- No Node.js or Chromium installed in the PHP container (keeps image lean)
- Full Chromium rendering — Tailwind CSS, grid, flexbox all work
- Open-source, self-hosted — no vendor lock-in, no API costs
- Scales independently from PHP workers

**Limitations vs Browsershot:** Requires a running Gotenberg container (adds one service to `docker-compose.yml`), but this is a non-issue in a Docker environment.

- `InvoiceService::download(Order)` + `save(Order, path)` in `app/Services/InvoiceService.php`
- Blade template: `resources/views/pdf/invoice.blade.php` (company header, addresses, items table, totals)
- Gotenberg service added to `docker-compose.yml`; `LARAVEL_PDF_DRIVER` + `GOTENBERG_URL` in `.env.example`
- Driver: `gotenberg` (prod), `dompdf` (tests via `config(['laravel-pdf.driver' => 'dompdf'])`)
- Routes: `GET /api/v1/orders/{reference}/invoice` (customer, ownership check), `GET /admin/ecommerce/orders/{order}/invoice`
- `ForceJsonResponse` updated to pass through `application/pdf` and `Content-Disposition` responses
- Tests: `tests/Feature/Api/OrderInvoiceTest.php`

---

### 🔄 `spatie/laravel-model-states`

**Status:** ✅ Implemented.

- State classes in `app/States/Order/`: `PendingState`, `AwaitingPaymentState`, `PaidState`, `ProcessingState`, `ShippedState`, `DeliveredState`, `CancelledState`, `RefundedState`
- `Order` model uses `HasStates` + `casts()` → `OrderState::class`; `changeStatus(OrderStatusEnum)` maps to `transitionTo()`
- Invalid transitions throw `CouldNotPerformTransition`; admin panel returns error flash
- `OrderStatusEnum` retained for labels, colors, and form validation (no longer used as cast)
- Tests: `tests/Feature/Admin/OrderStateTransitionTest.php`

---

### 🖼️ `spatie/image-optimizer`

**Status:** ✅ Implemented.

- `.docker/php/Dockerfile` updated with `jpegoptim`, `optipng`, `pngquant`, `webp`, `gifsicle` apt packages
- `config/media-library.php` has `image_optimizations` enabled — medialibrary picks up optimizers automatically
- Image compression runs on all media conversions after upload

---

### 💾 `spatie/laravel-backup`

**Status:** ❌ Not implemented. **⚠️ Do NOT implement before 01.04.2026.**

> Scheduled implementation date: **01.04.2026**. Add to server only when the production environment and S3/Backblaze storage are configured.

- Full DB + file backup to S3 / SFTP / Backblaze B2 with configurable rotation
- Backup health monitoring: notifies via mail/Slack if backup is too old or too large
- `backup:run`, `backup:clean`, `backup:monitor` Artisan commands — wire into scheduler

**Plan (for 01.04.2026+):**
- `composer require spatie/laravel-backup`
- Configure `config/backup.php`: destination disk (S3/Backblaze), include `storage/app`, exclude `storage/logs`
- Add to scheduler in `routes/console.php`:
  ```php
  Schedule::command('backup:run')->daily()->at('02:00');
  Schedule::command('backup:clean')->daily()->at('02:30');
  Schedule::command('backup:monitor')->daily()->at('09:00');
  ```
- Set up Slack/mail notifications for backup failures
- Document required env vars: `BACKUP_DISK`, `AWS_BACKUP_BUCKET`, etc.
