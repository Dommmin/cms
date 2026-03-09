# AI Prompts — CMS Project

Reusable prompts for common development tasks.

---

## New Feature (Full Stack)

```
Implement [feature name] following the feature-process.md workflow.

Backend:
- Model: app/Models/[Name].php with factory
- Migration: with appropriate indexes
- Controller: app/Http/Controllers/Admin/[Name]Controller.php
- Form Requests: Store[Name]Request + Update[Name]Request
- Resource: app/Http/Resources/Api/V1/[Name]Resource.php (if API endpoint)
- Routes: add to routes/admin.php (admin) and/or routes/api.php (API)
- Policy: app/Policies/[Name]Policy.php

Frontend (admin):
- Pages: resources/js/pages/admin/[name]/{index,create,edit}.tsx
- Use Wayfinder for routes, <Form> component, DataTable for lists

Tests:
- tests/Feature/Admin/[Name]ControllerTest.php

Update:
- ai/guide.md with feature description
- server/docs/USER_GUIDE.md
- server/docs/DEVELOPER_GUIDE.md
```

---

## New API Endpoint

```
Add API endpoint for [resource] at GET/POST /api/v1/[resource].

- Controller: app/Http/Controllers/Api/V1/[Name]Controller.php
- Resource: app/Http/Resources/Api/V1/[Name]Resource.php
- Form Request (if mutation): app/Http/Requests/Api/V1/[Action][Name]Request.php
- Route: routes/api.php under 'api.v1.' prefix with rate limiter
- Test: tests/Feature/Api/[Name]Test.php
- Client type: add to client/types/api.ts
- Client API function: add to client/api/[name].ts
```

---

## Bug Fix

```
Fix: [describe the bug]

1. Read the failing test or reproduce the issue
2. Identify the root cause (don't guess)
3. Fix the minimal code needed
4. Run: php artisan test --compact --filter=[TestName]
5. Run: vendor/bin/pint --dirty
6. Confirm all 256+ tests still pass
```

---

## Add Admin CRUD Module

```
Create full admin CRUD for [Model]:
- index page with DataTable, search, pagination
- create page with form
- edit page with form
- destroy with confirmation
- routes in routes/admin.php
- policy (admin-only unless specified)
- tests in tests/Feature/Admin/

Follow existing pattern from e.g. FaqController / BlogPostController.
```

---

## Add to Public Frontend (client/)

```
Add [feature] to the Next.js client:
- Page: client/app/[path]/page.tsx (server component)
- API call: client/api/[name].ts using serverFetch() for SSR
- Types: check/update client/types/api.ts
- i18n: use locale from cookie, pass to API as ?locale=
- SEO: add metadata export + JSON-LD schema if applicable
- Schema.org: add to client/lib/schema.ts if new entity type
```

---

## Database Migration

```
Create migration to [describe change]:
- Use appropriate column types (decimal not unsignedDecimal in Laravel 12)
- Add indexes for FK and frequently queried columns
- Soft deletes: $table->softDeletes() if model needs SoftDeletes trait
- Run: docker compose exec php php artisan migrate
```

---

## Fix Failing Tests

```
Fix failing tests in [TestFile]:
1. Run: docker compose exec php php artisan test --compact [path/to/test]
2. Read error output carefully
3. Do NOT delete tests
4. Fix the underlying code or update test expectations if behavior changed intentionally
5. Confirm fix: run full suite with php artisan test --compact
```

---

## Refactor / Code Quality

```
Refactor [component/file]:
- Do not change external behavior
- Do not add new features
- Run tests before and after to confirm no regression
- Run pint after changes
- Minimal diff — only change what's necessary
```
