# Design System Showcase

Visual documentation page for **base storefront components** — composition primitives (`Container`, `Section`, `Grid`), UI controls (`Button`, `Input`, `Card`, `Badge`), and design tokens from `globals.css`.

This is **not** the [Page Builder Showcase](/page-builder-showcase) (all 30 block types) and **not** the [Theme Showcase](/theme-showcase) (merchant theme token regression).

## Purpose

- Verify composition and UI primitives render correctly after refactors
- Onboard developers to the storefront design system
- Provide a single URL for QA to check typography, layout, forms, and colors

## URL

After seeding: **`/design-system-showcase`**

The Next.js `PageRenderer` detects this slug and renders `DesignSystemShowcasePage` instead of the default section/block pipeline. Section records in the database define **group order** via `settings.showcase_group`; React components render the actual examples.

## Running the showcase

```bash
# From repo root — Docker only
docker compose exec php php artisan db:seed --class=DesignSystemShowcaseSeeder
```

Or as part of the full demo seed pack:

```bash
make fresh   # runs DatabaseSeeder including DesignSystemShowcaseSeeder
```

Open the storefront (default locale, no prefix): `http://localhost/design-system-showcase`

## Sections (15 groups)

| Group | Examples |
|-------|----------|
| Typography | H1–H6, paragraph, lead, small, muted, link, list, quote |
| Containers | default, narrow, wide, full |
| Sections | default, light, dark, muted, accent |
| Stack layouts | gap xs–xl |
| Grid layouts | 2, 3, 4 columns + responsive |
| Surfaces | default, outlined, elevated, muted |
| Buttons | 5 variants × 3 sizes |
| Cards | basic, media, pricing, content |
| Forms | input, textarea, select, checkbox, radio, submit |
| Badges | all variants |
| Alerts | info, success, warning, danger |
| Prose | sample article (`.prose`) |
| Colors | semantic color tokens |
| Spacing | xs–3xl scale |
| Responsive | mobile, tablet, desktop layouts |

**Total showcase examples:** 106 (see `SHOWCASE_EXAMPLE_COUNTS` in `client/components/design-system-showcase/showcase-groups.ts`).

## Adding a new example group

1. **Client component** — add `client/components/design-system-showcase/groups/YourGroupShowcase.tsx` using real primitives from `components/composition/*` and `components/ui/*`.

2. **Registry** — register the group in:
   - `client/components/design-system-showcase/showcase-groups.ts` (`DESIGN_SYSTEM_SHOWCASE_GROUPS`, `SHOWCASE_EXAMPLE_COUNTS`, `GROUP_LABELS`)
   - `client/components/design-system-showcase/DesignSystemShowcasePage.tsx` (`GROUP_COMPONENTS` map)

3. **Seeder** — append the group key to `DesignSystemShowcaseSeeder::SHOWCASE_GROUPS` and set `SHOWCASE_EXAMPLE_COUNTS` (keep in sync with TypeScript).

4. **Test** — update `server/tests/Feature/DesignSystemShowcaseSeederTest.php` expected group list and section count.

5. **Seed** — run `docker compose exec php php artisan db:seed --class=DesignSystemShowcaseSeeder`

## Key files

| File | Role |
|------|------|
| `server/database/seeders/DesignSystemShowcaseSeeder.php` | Creates page + 15 sections |
| `client/components/design-system-showcase/DesignSystemShowcasePage.tsx` | Page renderer |
| `client/components/design-system-showcase/groups/*` | Per-group showcases |
| `client/components/page-builder/page-renderer.tsx` | Slug-based dispatch |
| `client/components/composition/*` | Layout primitives |
| `client/components/ui/*` | shadcn UI primitives |
| `client/app/globals.css` | Token contract + `.prose` |

## Related showcases

- **Page Builder** — `/page-builder-showcase` — all registered block types
- **Theme** — `/theme-showcase` — theme token snapshots (custom HTML)
