# Project Status & Roadmap

> Generated: 2026-02-19

---

## Table of Contents

1. [Completed Work](#completed-work)
2. [Test Suite Status](#test-suite-status)
3. [Known Issues & Pre-existing Failures](#known-issues--pre-existing-failures)
4. [Missing Features & Gaps](#missing-features--gaps)
5. [Suggested Next Steps](#suggested-next-steps)
6. [Module Coverage Map](#module-coverage-map)

---

## Completed Work

### Blog Module ✅

Everything from the original plan has been implemented and tested.

| Artifact | Status |
|---|---|
| `app/Models/BlogCategory.php` + factory | ✅ |
| `app/Models/BlogPost.php` + factory | ✅ |
| `app/Enums/BlogPostStatusEnum.php` | ✅ |
| `app/Http/Controllers/Admin/BlogPostController.php` | ✅ |
| `app/Http/Controllers/Admin/BlogCategoryController.php` | ✅ |
| `app/Queries/Admin/BlogPostIndexQuery.php` | ✅ |
| `app/Queries/Admin/BlogCategoryIndexQuery.php` | ✅ |
| `app/Http/Requests/Admin/StoreBlogPostRequest.php` | ✅ |
| `app/Http/Requests/Admin/UpdateBlogPostRequest.php` | ✅ |
| `app/Http/Requests/Admin/StoreBlogCategoryRequest.php` | ✅ |
| `app/Http/Requests/Admin/UpdateBlogCategoryRequest.php` | ✅ |
| `routes/admin/blog.php` | ✅ |
| `resources/js/pages/admin/blog/posts/{index,create,edit}.tsx` | ✅ |
| `resources/js/pages/admin/blog/categories/{index,create,edit}.tsx` | ✅ |
| Blog Posts + Blog Categories in sidebar (under CMS) | ✅ |
| `tests/Feature/Admin/BlogPostControllerTest.php` (9 tests) | ✅ |
| `tests/Feature/Admin/BlogCategoryControllerTest.php` (9 tests) | ✅ |
| Migrations: `blog_categories`, `blog_posts` | ✅ |

**Blog routes available:**
- `GET/POST /admin/blog/posts` — index / store
- `GET /admin/blog/posts/create` — create form
- `GET/PUT/DELETE /admin/blog/posts/{post}` — edit / update / destroy
- `POST /admin/blog/posts/{post}/publish` — publish
- `POST /admin/blog/posts/{post}/unpublish` — unpublish
- `POST /admin/blog/posts/{post}/toggle-featured` — toggle featured flag
- `GET/POST/PUT/DELETE /admin/blog/categories/{category}` — full CRUD

---

### Rich Text Editor Upgrades ✅

| Fix / Feature | Status |
|---|---|
| `resizable-image-extension.tsx` — inline atom node with ReactNodeViewRenderer | ✅ |
| Width presets toolbar (25% / 50% / 75% / 100%) shown on image selection | ✅ |
| Float alignment (left / none / right) via toolbar | ✅ |
| Drag-resize handle (bottom-right corner, `nwse-resize`) | ✅ |
| Clicking outside image deselects it (inline span, not block div) | ✅ |
| Text before/after image in same paragraph | ✅ |
| `TrailingNode` extension — always a paragraph after block nodes | ✅ |
| `GapCursor` CSS in `app.css` | ✅ |
| Fixed `setContent(value, { emitUpdate: false })` — Tiptap v3 API | ✅ |
| Fixed `TextStyle` import — named export in Tiptap v3 | ✅ |
| `isImageSelected` using `NodeSelection` — reliable image toolbar trigger | ✅ |
| `ImageGallery` extension (insert multi-image gallery block) | ✅ |

---

### Markdown Editor ✅

`resources/js/components/ui/markdown-editor.tsx` — wraps `@uiw/react-md-editor` with live split preview, dark/light mode sync, and project styling. Used in blog post create/edit when `content_type = 'markdown'`.

---

### Previously Completed Modules

The following admin modules were already fully implemented before this sprint:

| Module | Controller | Pages | Routes | Tests |
|---|---|---|---|---|
| **CMS Pages** + Page Builder | ✅ | ✅ | `routes/admin/cms.php` | ✅ partial |
| **Reusable Blocks** | ✅ | ✅ | `routes/admin/cms.php` | ✅ |
| **Menus** | ✅ | ✅ | `routes/admin.php` | ✅ |
| **Themes** | ✅ | ✅ | `routes/admin.php` | ✅ |
| **Forms + Submissions** | ✅ | ✅ | `routes/admin.php` | ❌ |
| **FAQ** | ✅ | ✅ | `routes/admin.php` | ⚠️ failing |
| **Media** | ✅ | ✅ | `routes/admin.php` | ❌ |
| **Settings** (6 groups) | ✅ | ✅ | `routes/admin.php` | ❌ |
| **Users** | ✅ | ✅ | `routes/admin.php` | ⚠️ 1 failing |
| **Notifications** | ✅ | ✅ | `routes/admin.php` | ✅ |
| **Cookie Consents** | ✅ | ✅ | `routes/admin.php` | ❌ |
| **Currencies** | ✅ | ✅ | `routes/admin.php` | ⚠️ failing |
| **Exchange Rates** | ✅ | ✅ | `routes/admin.php` | ❌ |
| **Newsletter** (subscribers/segments/campaigns) | ✅ | ✅ | `routes/admin.php` | ❌ |
| **Ecommerce** (products, orders, customers, etc.) | ✅ | ✅ | `routes/admin/ecommerce.php` | ✅ partial |
| **Dashboard** + widgets | ✅ | ✅ | `routes/admin.php` | ❌ |

---

## Test Suite Status

```
Tests:    114 passing, 38 failing, 1 skipped
```

### Passing test groups (all green)

| File | Tests |
|---|---|
| `BlogPostControllerTest` | 9 ✅ |
| `BlogCategoryControllerTest` | 9 ✅ |
| `ProductControllerTest` | varies ✅ |
| `ProductTypeControllerTest` | varies ✅ |
| `ProductVariantControllerTest` | varies ✅ |
| `CategoryControllerTest` | varies ✅ |
| `MenuControllerTest` | varies ✅ |
| `ThemeControllerTest` | varies ✅ |
| `AppNotificationControllerTest` | varies ✅ |
| `BlockRelationSearchTest` | varies ✅ |
| `CmsPagesTest` | varies ✅ |
| `CmsPagesCrudTest` | varies ✅ |

---

## Known Issues & Pre-existing Failures

These failures exist independently of recent blog/RTE work.

### 1. `RouteNotFoundException` in Auth / Dashboard / Settings tests
**Files:** `AuthenticationTest`, `RegistrationTest`, `EmailVerificationTest`, `DashboardTest`, `ExampleTest`, `ProfileUpdateTest`, `VerificationNotificationTest`
**Cause:** Tests reference named routes (e.g. `route('login')`, `route('register')`) that were moved or renamed when the project migrated from default Laravel scaffolding to the custom admin layout with Fortify.
**Fix:** Update test route references to match current Fortify/admin route names, or delete stale framework-default test files that no longer apply.

### 2. `FaqControllerTest` — 8 failures (404 responses)
**Cause:** Test user likely doesn't have `'admin'` role assigned, so the `auth + role` middleware redirects instead of serving the page, resulting in a non-200 status.
**Fix:** Add `$this->user->assignRole('admin')` in the `beforeEach` of `FaqControllerTest`, following the same pattern as `BlogPostControllerTest`.

### 3. `CurrencyControllerTest` — 8 failures (404 responses)
**Same cause as FAQ.** Missing `assignRole('admin')` in `beforeEach`.

### 4. `UsersTest` — 1 failure (`admin can create a user`)
**Cause:** Likely a form validation rule change or missing field in the test payload.

### 5. `PromotionServiceTest` — 7 failures (`Error`)
**Cause:** `PromotionService` or related model/service has a runtime error (null reference, method signature mismatch, etc.).
**Fix:** Run `php artisan test --compact tests/Feature/PromotionServiceTest.php` with `--verbose` to inspect the exception.

### 6. `PageBuilderLiveEditTest` — 2 failures (`TypeError`)
**Cause:** Type mismatch in the live-edit endpoint, likely a `null` vs expected array, or a changed method signature in `PageBuilderController` / sync service.

---

## Missing Features & Gaps

### Critical (needed before production)

#### 1. Public Blog API endpoints
The admin panel manages blog posts, but **there are no public API endpoints** for reading them on the frontend. If the project is a headless CMS, this is a blocker.

Missing routes (suggested):
```
GET  /api/v1/blog/posts                — paginated list (published only)
GET  /api/v1/blog/posts/{slug}         — single post by slug (increments views_count)
GET  /api/v1/blog/categories           — list of categories
GET  /api/v1/blog/categories/{slug}/posts — posts filtered by category
```

#### 2. Views count increment
`blog_posts.views_count` column exists but **nothing increments it**. The public `show` endpoint (when created) should call `$post->increment('views_count')`.

#### 3. Scheduled publishing
`blog_posts.published_at` supports future dates, but there is **no scheduled job** to auto-publish posts when their `published_at` arrives. Content editors who schedule posts in advance won't see them go live automatically.

Suggested: Add a `PublishScheduledBlogPostsCommand` + schedule it in `console.php` or `bootstrap/app.php`.

#### 4. Fix pre-existing failing tests (see above)
38 failing tests undermines confidence in CI. The Auth/Dashboard failures alone account for ~12 of them and are quick to fix.

---

### Important (significant value, medium effort)

#### 5. Blog post frontend preview
No way to preview a draft post as it would appear on the frontend before publishing. The CMS Pages module already has a `PagePreviewToken` system — the same pattern could be applied to blog posts.

#### 6. Tags as a proper model (optional improvement)
`blog_posts.tags` is a JSON array of strings. This works but limits filtering/grouping. A `blog_tags` + `blog_post_tag` pivot would enable tag cloud, tag archives, and cross-linking.

#### 7. Blog comments
No comment system. Options:
- **Disqus / external** — zero backend work
- **Native** — `blog_comments` model with moderation workflow (adds significant scope)

#### 8. RSS feed
`GET /blog/feed.xml` — standard for blog discoverability. Laravel makes this easy with a simple controller + `Response::stream()` or a dedicated `feed` package.

#### 9. Sitemap generation
No sitemap that includes blog posts. If the project uses a sitemap package it needs blog post URLs added. If not, a `SitemapController` returning XML is ~50 lines.

---

### Nice to have (lower priority)

#### 10. Newsletter integration with Blog
A "Send campaign" button on a published blog post could auto-populate a newsletter campaign body with the post title + excerpt + link, leveraging the existing `NewsletterCampaign` model.

#### 11. Test coverage for untested controllers
The following controllers have **zero feature tests**:
- `SettingsController`
- `MediaController`
- `FormController`, `FormSubmissionController`
- `NewsletterSubscriberController`, `NewsletterSegmentController`, `NewsletterCampaignController`
- `ExchangeRateController`
- `CookieConsentController`
- `DashboardWidgetController`
- Most ecommerce: `OrderController`, `CustomerController`, `DiscountController`, `PromotionController`, `ShippingMethodController`, `TaxRateController`, `BrandController`, `AttributeController`, `ReviewController`, `ReturnRequestController`, `WishlistController`, `CartController`, `AddressController`

#### 12. Reading time calculation
`blog_posts.reading_time` exists but the controller does not auto-calculate it on store/update. Should use `BlogPost::estimateReadingTime($content)`.

#### 13. Media picker in RTE toolbar
The "Insert image" button in the rich text editor opens a URL input dialog. Integrating the existing `MediaPickerModal` component would allow editors to pick from uploaded media instead of entering URLs manually.

#### 14. Image center alignment in RTE
The current `align` options are `none` (inline), `left` (float left), and `right` (float right). True center alignment (like `display:block; margin:auto`) requires wrapping the image in a block element, which isn't straightforward with an inline atom node. A workaround is to insert the image inside a centered paragraph — or add a dedicated "centered image" block type.

#### 15. API rate limiting applied consistently
`config/throttle-smart.php` exists but it's not confirmed that all public API routes have appropriate rate limiting middleware applied. Verify `/api/v1/` routes have `throttle:api` or equivalent.

#### 16. Role-based access control on admin controllers
Most admin controllers only check `auth` middleware (user is logged in). Fine-grained permission checks using Spatie Permissions (`can:manage-blog`, `can:manage-settings`, etc.) are not implemented — any authenticated user can access any admin area.

---

## Suggested Next Steps

Priority order based on impact vs effort:

| # | Task | Priority | Effort |
|---|---|---|---|
| 1 | Fix 38 failing tests (Auth routes, FaqController, CurrencyController) | 🔴 High | Low |
| 2 | Public blog API endpoints (list + show with views increment) | 🔴 High | Low |
| 3 | Scheduled publishing job for `published_at` | 🟡 Medium | Low |
| 4 | Blog post frontend preview (reuse PagePreviewToken pattern) | 🟡 Medium | Medium |
| 5 | Media picker integration in RTE toolbar (replace URL dialog) | 🟡 Medium | Medium |
| 6 | RSS feed + sitemap for blog | 🟡 Medium | Low |
| 7 | Role/permission guards on admin controllers | 🟡 Medium | Medium |
| 8 | Newsletter → Blog integration (quick campaign creation) | 🟢 Low | Medium |
| 9 | Test coverage for untested controllers | 🟢 Low | High |
| 10 | Blog comments (native or Disqus) | 🟢 Low | High |

---

## Module Coverage Map

```
Admin Panel
├── Dashboard                ✅ complete, ❌ no tests
├── Media                    ✅ complete, ❌ no tests
├── CMS
│   ├── Pages + Builder      ✅ complete, ✅ partial tests
│   ├── Reusable Blocks      ✅ complete, ✅ tests
│   ├── Menus                ✅ complete, ✅ tests
│   ├── Themes               ✅ complete, ✅ tests
│   ├── Forms                ✅ complete, ❌ no tests
│   ├── FAQ                  ✅ complete, ⚠️ tests broken (role issue)
│   ├── Blog Posts           ✅ complete, ✅ tests (9)
│   └── Blog Categories      ✅ complete, ✅ tests (9)
├── Shop (Ecommerce)
│   ├── Products             ✅ complete, ✅ tests
│   ├── Categories           ✅ complete, ✅ tests
│   ├── Product Types        ✅ complete, ✅ tests
│   ├── Brands/Attributes    ✅ complete, ❌ no tests
│   ├── Orders               ✅ complete, ❌ no tests
│   ├── Customers            ✅ complete, ❌ no tests
│   ├── Discounts            ✅ complete, ❌ no tests
│   ├── Promotions           ✅ complete, ⚠️ service test broken
│   ├── Tax Rates            ✅ complete, ❌ no tests
│   └── Shipping/Returns     ✅ complete, ❌ no tests
├── Newsletter               ✅ complete, ❌ no tests
├── Finance (Currencies)     ✅ complete, ⚠️ tests broken (role issue)
├── Users                    ✅ complete, ⚠️ 1 test failing
├── Notifications            ✅ complete, ✅ tests
├── Cookie Consents          ✅ complete, ❌ no tests
└── Settings                 ✅ complete, ❌ no tests

Public API
├── Auth                     ✅ complete
├── Products (read)          ✅ complete
├── Cart (guest + auth)      ✅ complete
├── Checkout                 ✅ complete
├── Orders (auth)            ✅ complete
├── Newsletter               ✅ complete
├── Pages/Menus (public)     ✅ complete
└── Blog (public read)       ❌ missing

Frontend (React/Inertia)
├── Rich Text Editor         ✅ complete (inline image resize, gallery, etc.)
├── Markdown Editor          ✅ complete (@uiw/react-md-editor)
└── Media Picker Modal       ✅ complete (used in gallery, page builder, not in RTE toolbar yet)
```
