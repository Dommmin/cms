# Feature Development Process

Standard workflow for implementing new features. Follow this process to maintain quality and consistency.

---

## Process Overview

```
1. Define       →   2. Design       →   3. Backend      →   4. Frontend
                                              ↓                    ↓
                                         5. Tests        →   6. Docs update
```

---

## Step 1: Define

Before writing any code, answer:
- **What** does the feature do? (user-facing behavior)
- **Who** uses it? (admin only? public? both?)
- **What data** is created/read/updated/deleted?
- **Any GDPR implications?** (personal data, retention)
- **Any performance concerns?** (large datasets, N+1 risk)

---

## Step 2: Design

### Database
- What tables/columns are needed?
- FK constraints? Indexes?
- Soft deletes needed?
- Translatable fields?

### API (if public endpoint)
- Route: `GET|POST|PUT|DELETE /api/v1/[resource]`
- Request/response shape
- Auth required? Rate limiter?

### Admin UI
- Which pages? (index, create, edit)
- Form fields?
- Filters/sorting on list?

---

## Step 3: Backend Implementation

### Order
1. **Migration** — `php artisan make:migration create_[name]_table`
2. **Model** — `app/Models/[Name].php` with casts, relations, fillable
3. **Factory** — `database/factories/[Name]Factory.php`
4. **Seeder** (if needed) — add to `DatabaseSeeder` in correct order
5. **Form Requests** — `Store[Name]Request`, `Update[Name]Request`
6. **Policy** — `app/Policies/[Name]Policy.php`, register in `AuthServiceProvider`
7. **Controller** — thin, delegates to Service if logic > trivial
8. **Service** (if needed) — `app/Services/[Name]Service.php`
9. **API Resource** (if API endpoint) — `app/Http/Resources/Api/V1/[Name]Resource.php`
10. **Routes** — add to `routes/admin.php` (admin) and/or `routes/api.php` (API)
11. **Events/Listeners** (if domain events needed)

### Checklist
- [ ] `declare(strict_types=1)` on all files
- [ ] Explicit return types on all methods
- [ ] No raw `DB::` queries
- [ ] Eager loading (no N+1)
- [ ] Form Requests (no inline `$request->validate()`)
- [ ] Policy registered and enforced
- [ ] `php artisan wayfinder:generate` if admin routes added

---

## Step 4: Frontend Implementation

### Admin SPA (Inertia)
1. **Pages** — `resources/js/pages/admin/[name]/index.tsx`, `create.tsx`, `edit.tsx`
2. **Columns** (if DataTable) — `resources/js/components/columns/[name]-columns.tsx`
3. **Sidebar link** — add to sidebar navigation component

### Public Frontend (Next.js)
1. **Page** — `client/app/[locale]/[path]/page.tsx` (server component)
2. **API function** — `client/api/[name].ts`
3. **Types** — add to `client/types/api.ts`
4. **Components** — `client/components/[name]/`
5. **i18n** — use locale from cookie, pass to API
6. **SEO** — `metadata` export + JSON-LD if content page
7. **Schema.org** — add builder to `client/lib/schema.ts` if new entity

---

## Step 5: Tests

### Backend tests (required)
```bash
# Admin panel test
php artisan make:test --pest Admin/[Name]ControllerTest

# API test
php artisan make:test --pest Api/[Name]Test
```

Minimum coverage:
- List endpoint returns data
- Create/store creates record
- Update/edit updates record
- Delete removes record
- Unauthorized access returns 403/404
- Validation errors return 422

### Run tests
```bash
docker compose exec php php artisan test --compact tests/Feature/Admin/[Name]ControllerTest.php
docker compose exec php php artisan test --compact  # full suite — must be green
```

### Pint
```bash
docker compose exec php vendor/bin/pint --dirty
```

---

## Step 6: Documentation Update

After every feature, update ALL of these:

| File                             | What to update                                             |
|----------------------------------|------------------------------------------------------------|
| `ai/guide.md`                    | Add to "Implemented Features" section                      |
| `server/docs/USER_GUIDE.md`      | Non-technical editor instructions for using the feature    |
| `server/docs/DEVELOPER_GUIDE.md` | Technical details: extension points, services, conventions |
| `docs/backend.md`                | If new service or architectural pattern introduced         |
| `docs/frontend.md`               | If new frontend pattern introduced                         |

---

## Quick Reference: File Naming

| Type             | Pattern                                                    | Example                       |
|------------------|------------------------------------------------------------|-------------------------------|
| Model            | `app/Models/[Name].php`                                    | `BlogPost.php`                |
| Factory          | `database/factories/[Name]Factory.php`                     | `BlogPostFactory.php`         |
| Migration        | `YYYY_MM_DD_HHMMSS_[action]_[name]_table.php`              | `create_blog_posts_table.php` |
| Admin Controller | `app/Http/Controllers/Admin/[Name]Controller.php`          | `BlogPostController.php`      |
| API Controller   | `app/Http/Controllers/Api/V1/[Name]Controller.php`         | `ProductController.php`       |
| Form Request     | `app/Http/Requests/Admin/[Store\|Update][Name]Request.php` | `StoreBlogPostRequest.php`    |
| API Resource     | `app/Http/Resources/Api/V1/[Name]Resource.php`             | `ProductResource.php`         |
| Policy           | `app/Policies/[Name]Policy.php`                            | `BlogPostPolicy.php`          |
| Service          | `app/Services/[Name]Service.php`                           | `CheckoutService.php`         |
| Job              | `app/Jobs/[Action][Name].php`                              | `SendOrderConfirmation.php`   |
| Test (Admin)     | `tests/Feature/Admin/[Name]ControllerTest.php`             | `BlogPostControllerTest.php`  |
| Test (API)       | `tests/Feature/Api/[Name]Test.php`                         | `ProductTest.php`             |
| Inertia Page     | `resources/js/pages/admin/[name]/[action].tsx`             | `blog/posts/index.tsx`        |
| Next.js Page     | `client/app/[locale]/[name]/page.tsx`                      | `blog/page.tsx`               |
