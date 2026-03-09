# Coding Standards

---

## PHP (Laravel 12)

### File header
Every PHP file must start with:
```php
<?php

declare(strict_types=1);
```

### Types
- **Always** explicit return types on methods and functions
- **Always** type hints on parameters
- Nullable with `?Type` not `Type|null` for simple cases
- Use union types `Type1|Type2` when needed

### Classes
- Constructor property promotion for all injected dependencies
- `readonly` on properties that don't change after construction

```php
public function __construct(
    private readonly CartService $cartService,
    private readonly OrderRepository $orders,
) {}
```

### Eloquent
- `casts()` method (not `$casts` property) — Laravel 12 convention
- `Model::query()` always, never `DB::` for standard queries
- Eager load relations — never lazy load in loops (N+1)
- Use `->sole()` for must-exist single results, `->firstOrFail()` when appropriate
- Avoid `->get()` on large tables without pagination

```php
// Good
$users = User::query()
    ->with(['roles', 'customer'])
    ->paginate(20);

// Bad
$users = User::all();
foreach ($users as $user) {
    echo $user->customer->name; // N+1
}
```

### Controllers
- **Thin controllers** — no business logic
- Always use Form Request classes for validation
- Use API Resources for JSON responses
- One action per method, max ~20 lines per controller method

### Enums
- Keys are **TitleCase**: `case Active`, `case AwaitingPayment`
- Backed enums with string values: `case Active = 'active'`

### Comments
- PHPDoc blocks over inline comments
- Inline comments only for exceptionally complex logic
- Don't comment obvious code

### Naming
- Variables and methods: descriptive, `camelCase`
- `isRegisteredForDiscounts` not `discount()`
- Controllers: `[Resource]Controller` — always plural resource
- Form Requests: `[Store|Update][Resource]Request`
- Events: past tense — `OrderCreated`, `UserDeleted`
- Listeners: `[Send|Process|Update][Something][On|After]` — `SendOrderConfirmationEmail`
- Jobs: present tense action — `SendAbandonedCartEmails`, `ProcessImport`

### Configuration
- **Never** `env()` outside `config/` files
- Use `config('app.name')`, not `env('APP_NAME')`

---

## TypeScript / React

### File naming
- React components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utilities: `kebab-case.ts`
- Pages (Next.js): `page.tsx`, `layout.tsx`

### Components
- Named exports for reusable components, default exports for pages
- Props interface defined inline or as `type Props = { ... }`
- Destructure props in function signature

```tsx
export default function UserCard({ user, onDelete }: { user: User; onDelete: () => void }) {
  return <div>{user.name}</div>
}
```

### State
- `useState` for simple local state
- `useReducer` for complex state with multiple sub-values
- TanStack Query for server state
- No prop drilling beyond 2 levels — use context or colocation

### Forms
- react-hook-form + Zod for client forms
- Inertia `<Form>` component for admin SPA forms
- Always show validation errors next to the relevant field

### Imports
- Group: external packages → internal (`@/`) → relative (`./`)
- Named imports preferred (tree-shaking)
- Wayfinder: always named imports `import { index, store } from '@/actions/...'`

### Tailwind CSS v4
- Use utility classes, avoid inline styles
- Dark mode: `dark:` prefix (class-based, `.dark` on `<html>`)
- No custom CSS unless absolutely necessary
- Follow existing component patterns before creating new ones

---

## Testing

### General
- **Every feature must have tests** — no exceptions
- Feature tests for HTTP endpoints, unit tests for isolated logic
- Run `php artisan test --compact` — **all tests must pass** before committing
- Run pint after any PHP change

### Structure
```
tests/
├── Feature/
│   ├── Admin/        Admin endpoint tests
│   ├── Api/          REST API tests
│   ├── Auth/         Authentication tests
│   └── Settings/     Settings endpoint tests
└── Unit/             Pure logic tests
```

### Pest conventions
```php
// File header
declare(strict_types=1);

// Use it() for behavior descriptions
it('exports user data when authenticated', function () { ... });

// Use test() for state descriptions
test('admin can create a user', function () { ... });

// Group with beforeEach
beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});
```

### Factories
- Use factories, not manual `Model::create()` in tests
- Use factory states when available
- Create factory if it doesn't exist for a model

```php
// Good
$user = User::factory()->create();
$admin = User::factory()->create()->assignRole('admin');

// Bad
$user = User::create(['name' => 'Test', 'email' => 'test@test.com', ...]);
```

### Assertions
- `assertSoftDeleted()` for soft-delete models
- `assertDatabaseHas()` / `assertDatabaseMissing()` for DB state
- `assertInertia()` for admin page component checks
- `assertOk()` / `assertCreated()` / `assertUnprocessable()` (not `assertStatus(200)`)

---

## Git

### Commits
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Present tense: "add user export" not "added user export"
- Reference feature area: `feat(auth): add 2FA support`

### Branches
- Feature branches from `master`
- Name: `feat/gdpr-anonymization`, `fix/cart-token-bug`

### Before merging
1. All tests pass (`php artisan test --compact`)
2. Pint clean (`vendor/bin/pint --dirty`)
3. No `console.log` or debug code left
4. Docs updated if behavior changed
