# Page Builder — Developer & User Guide

## Table of Contents

1. [User Guide — How to Use the Builder](#user-guide)
2. [Architecture Overview](#architecture-overview)
3. [Developer Guide — Adding New Block Types](#adding-new-block-types)
4. [Developer Guide — Adding New Section Types](#adding-new-section-types)
5. [Schema Field Reference](#schema-field-reference)
6. [Global (Reusable) Blocks](#global-reusable-blocks)
7. [Responsive Preview](#responsive-preview)
8. [Data Flow & Persistence](#data-flow--persistence)

---

## User Guide

### Opening the Builder

Navigate to **CMS → Pages**, then click the **Builder** button next to any page.

> **Quick tip:** Set a **Scroll Animation** on any section to make it animate in when the visitor scrolls to it. Choose from Fade In, Fade Up, Slide from Left/Right, or Zoom In in the section container settings.

---

### Sections

A page is structured as a stack of **sections**, each of which can contain multiple **blocks**.

#### Adding a Section

Click **Add Section** in the top toolbar. A new blank section appears at the bottom of the list.

Expand the section (click the chevron or the row title) and configure:

| Field            | Description                                                                                                                              |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **Section Type** | Determines what kind of content area this is (e.g. Hero Banner, Content Area). Each type may offer different layout and variant options. |
| **Layout**       | Controls the structural layout (e.g. "Full Width", "Contained"). Available options depend on the selected Section Type.                  |
| **Variant**      | Visual variant/style (e.g. "Centered", "Left Aligned"). Optional, depends on Section Type.                                               |

#### Reordering Sections

Drag the **⠿ grip handle** on the left of each section to reorder.

#### Deleting a Section

Click the red trash icon on the right of the section header.

> **Important:** Save the page after making changes. Unsaved changes are only in local memory.

---

### Blocks

Each section contains a list of **blocks** — the actual content units.

#### Adding a Block

With a section expanded, click **+ Add Block** at the bottom of the section.

#### Configuring a Block

Expand a block (click the chevron). You will see:

1. **Block Type** selector — choose what kind of content this block renders (e.g. Rich Text, Hero Banner, Featured Products).
2. **Visible** toggle — show/hide the block on the page without deleting it.
3. **Content fields** — auto-generated from the block type's schema (see [Schema Field Reference](#schema-field-reference)).
4. **Media** section — image/video pickers specific to this block type.
5. **Linked Content** section — attach related models (products, categories, forms, etc.).

#### Reordering Blocks

Drag the **⠿ grip handle** inside a block card to reorder blocks within a section.

#### Deleting a Block

Click the red trash icon on the block card header.

---

### Saving

Click **Save** in the top-right toolbar. A toast notification confirms success.

> Saves and autosaves refresh the responsive preview iframe automatically.

---

## Architecture Overview

```
Page Builder (feature)
├── config/blocks.php              — Block type definitions (schema, relations)
├── config/cms/sections.php        — Section type definitions (layouts, variants)
│                                    (animation + padding stored in section.settings JSON)
│
├── Backend
│   ├── app/Models/Page.php
│   ├── app/Models/PageSection.php
│   ├── app/Models/PageBlock.php
│   ├── app/Models/BlockRelation.php
│   ├── app/Models/ReusableBlock.php
│   └── app/Http/Controllers/Admin/Cms/
│       ├── PageBuilderController.php   — show, update, preview
│       └── ReusableBlockController.php — CRUD for global blocks
│
└── Frontend (resources/js/features/page-builder/)
    ├── types/index.ts              — TypeScript types
    ├── hooks/use-builder-state.ts  — All section/block state mutations
    └── components/
        ├── page-builder.tsx        — Main orchestrator (DnD, toolbar)
        ├── builder-toolbar.tsx     — Top action bar
        ├── sortable-section.tsx    — Section wrapper (DnD)
        ├── section-card.tsx        — Section header UI
        ├── section-form.tsx        — Section type / layout / variant / padding / animation selectors
        ├── blocks-list.tsx         — Block list with DnD
        ├── block-card.tsx          — Block header UI + save-to-global
        ├── block-form.tsx          — Block type selector + active toggle
        └── dynamic-block-form.tsx  — Schema-driven field renderer

Public frontend (client/components/page-builder/)
    ├── section-renderer.tsx        — Renders a section + applies animation wrapper
    ├── animated-section.tsx        — "use client" framer-motion wrapper (5 presets)
    ├── block-renderer.tsx          — Switch on block.type → component
    └── blocks/                     — One file per block type
```

### Database Schema

```
pages
  └── page_sections (page_id, section_type, layout, variant, settings, position, is_active)
        └── page_blocks (section_id, page_id, type, configuration JSON, position, is_active, reusable_block_id)
              └── block_relations (block_id, relation_type, relation_id, relation_key, position, metadata)

reusable_blocks (name, description, type, configuration JSON, is_active)
```

---

## Developer Guide — Adding New Block Types

All block types are defined in **`config/blocks.php`** under the `block_types` key. No frontend code changes are required for standard blocks.

### Step 1: Add the Enum value

Add the new type to `app/Enums/PageBlockTypeEnum.php`:

```php
enum PageBlockTypeEnum: string
{
    case HeroBanner       = 'hero_banner';
    case RichText         = 'rich_text';
    case MyNewBlock       = 'my_new_block';  // ← add here
}
```

### Step 2: Define the block in `config/blocks.php`

```php
'my_new_block' => [
    // Required
    'name'     => 'My New Block',           // Display name in the UI
    'category' => 'content',               // Groups blocks in the type selector

    // Optional metadata
    'description' => 'Short description shown below the type selector.',
    'icon'        => 'layout-template',    // lucide icon name (informational only)

    // Relations: which external models can be attached to this block
    // Keys are arbitrary relation slot names used in block_relations.relation_key
    'allowed_relations' => [
        'background_image' => ['types' => ['media.image'], 'multiple' => false],
        'linked_products'  => ['types' => ['product'], 'multiple' => true],
        'linked_form'      => ['types' => ['form'], 'multiple' => false],
    ],

    // Schema: drives the auto-generated form. No frontend changes needed.
    'schema' => [
        'type'       => 'object',
        'properties' => [
            'title' => [
                'type'        => 'string',
                'label'       => 'Title',
                'placeholder' => 'Enter a title...',
                'maxLength'   => 100,
            ],
            'body' => [
                'type'   => 'string',
                'label'  => 'Body',
                'format' => 'richtext',         // renders a WYSIWYG editor
            ],
            'show_divider' => [
                'type'    => 'boolean',
                'label'   => 'Show Divider',
                'default' => false,
            ],
            'columns' => [
                'type'    => 'integer',
                'label'   => 'Number of Columns',
                'min'     => 1,
                'max'     => 4,
                'default' => 2,
            ],
            'style' => [
                'type'    => 'string',
                'label'   => 'Style',
                'enum'    => ['card', 'flat', 'bordered'],
                'default' => 'card',
            ],
            'items' => [                        // array → renders a repeater
                'type'  => 'array',
                'label' => 'Items',
                'items' => [
                    'type'       => 'object',
                    'properties' => [
                        'label' => ['type' => 'string', 'label' => 'Label'],
                        'value' => ['type' => 'string', 'label' => 'Value'],
                    ],
                ],
            ],
        ],
    ],
],
```

That's it. The `DynamicBlockForm` component reads the schema and renders fields automatically.

Server-side saves validate the same schema before anything is written. Unknown
configuration keys, wrong primitive types, invalid enum values, oversized payloads,
and relations outside `allowed_relations` are rejected with validation errors. Fields
declared as `format: richtext` or `format: html` are sanitized recursively, including
inside repeater items.

The `custom_html` block is additionally protected:

- users must have `cms.custom_html.manage`,
- `html` is purified with the `custom_html` HTMLPurifier profile,
- `css` is sanitized by `App\Services\CssSanitizerService`,
- `@import`, `expression()`, script URLs, unsafe `data:` URLs, and `</style` are removed.

### Step 3: Add the block to the frontend preview

If you have a standalone Preview page, add a case in
`resources/js/pages/admin/cms/pages/page-preview.tsx`:

```tsx
case 'my_new_block':
    return <MyNewBlockPreview config={block.configuration} />;
```

And implement `MyNewBlockPreview` in the same file or as a separate component.

### Available `category` values

| Value | Display |
|---|---|
| `layout` | Layout |
| `content` | Content |
| `ecommerce` | Ecommerce |
| `marketing` | Marketing |
| `media` | Media |
| `forms` | Forms |
| `navigation` | Navigation |

You can use any string — unknown categories are displayed as-is.

---

## Developer Guide — Adding New Section Types

Section types are defined in **`config/cms/sections.php`**.

```php
'my_section' => [
    'label'       => 'My Section',
    'description' => 'Optional description.',
    'category'    => 'Content',

    // Layouts available in the Layout dropdown
    // Use key => label pairs (or a simple indexed array for identical key/label)
    'layouts' => [
        'full-width' => 'Full Width',
        'contained'  => 'Contained',
    ],

    // Variants available in the Variant dropdown (optional)
    'variants' => [
        'light' => 'Light',
        'dark'  => 'Dark',
    ],

    // Business rules (informational, enforced by your frontend/backend as needed)
    'business_rules' => [
        'max_per_page' => 1,
    ],
],
```

Sections are containers only — they don't have their own schema-driven fields. Their
`layout` and `variant` values are stored and passed to the frontend theme/renderer for
visual differentiation.

---

## Schema Field Reference

All fields live under `schema.properties` in a block's config.

### `string`

```php
'field_name' => [
    'type'        => 'string',
    'label'       => 'Field Label',          // shown above the input
    'description' => 'Help text.',           // shown below the label
    'placeholder' => 'Enter text...',
    'maxLength'   => 200,                    // shows a character counter
    'default'     => 'Default value',

    // format controls the widget:
    'format' => 'textarea',   // multi-line text area
    'format' => 'richtext',   // WYSIWYG (TipTap) editor
    'format' => 'url',        // URL input (type="url")
    'format' => 'color',      // colour picker + hex input
    'format' => 'code',       // mono textarea (HTML/CSS snippets)

    // enum: renders a Select dropdown instead of an input
    'enum' => ['option_a', 'option_b', 'option_c'],
],
```

### `integer` / `number`

```php
'count' => [
    'type'    => 'integer',   // or 'number' for decimals
    'label'   => 'Count',
    'min'     => 1,
    'max'     => 100,
    'default' => 4,
],
```

### `boolean`

```php
'show_cta' => [
    'type'    => 'boolean',
    'label'   => 'Show Call to Action',
    'description' => 'Display the button below the text.',
    'default' => true,
],
```

### `array` (Repeater)

Use `array` for a list of structured sub-items (e.g. testimonials, features):

```php
'testimonials' => [
    'type'  => 'array',
    'label' => 'Testimonials',
    'items' => [
        'type'       => 'object',
        'properties' => [
            'author' => ['type' => 'string', 'label' => 'Author Name'],
            'quote'  => ['type' => 'string', 'label' => 'Quote', 'format' => 'textarea'],
            'rating' => ['type' => 'integer', 'label' => 'Rating', 'min' => 1, 'max' => 5],
        ],
    ],
],
```

### Relations (Media & Models)

Defined in `allowed_relations` (outside `schema`). Each key is a slot name stored in
`block_relations.relation_key`:

```php
'allowed_relations' => [
    // Media slots (rendered in the "Media" section of the block form)
    'hero_image'    => ['media.image'],
    'promo_video'   => ['media.video'],
    'download_file' => ['media.file'],

    // Model slots (rendered in the "Linked Content" section)
    'featured_products' => ['product'],         // many
    'cta_page'          => ['page'],            // one
    'contact_form'      => ['form'],            // one
    'category_filter'   => ['category'],
],
```

Available relation types (from `config/blocks.php` → `relation_types`):

| Key           | Type                  |
|---------------|-----------------------|
| `media.image` | Spatie Media image    |
| `media.icon`  | Spatie Media icon     |
| `media.file`  | Spatie Media file/PDF |
| `media.video` | Spatie Media video    |
| `product`     | Product model         |
| `category`    | Category model        |
| `brand`       | Brand model           |
| `page`        | Page model            |
| `menu`        | Menu model            |
| `form`        | Form model            |
| `faq`         | Faq model             |

---

## Global (Reusable) Blocks

### What they are

A **Global Block** is a block whose configuration is stored in the `reusable_blocks`
table and **shared** across multiple pages. Editing a global block propagates the
change to every page that uses it.

### Creating a Global Block

1. Open any Page Builder.
2. Create and configure a block normally.
3. Click the **LibraryBig** icon (📚) in the block card header.
4. Give it a name and optional description, then click **Save to Library**.

The block turns blue (🌐 Globe icon + "Global" badge) indicating it is linked.

### Managing Global Blocks

Go to **CMS → Global Blocks** (`/admin/cms/reusable-blocks`).

- **Edit** — change the name, description, or active status.
- **Delete** — removes the global block and unlinks it from all pages (the page blocks remain but become independent).

### Unlinking a Global Block

Inside the block form, click **Unlink** in the blue banner. The block becomes a local
copy and no longer syncs with the library.

---

## Responsive Preview

The builder renders a sticky side panel on desktop with two tabs:

- **Inspector** — edits the selected section or block using the same schema-driven
  controls as the inline editor.
- **Preview** — uses a signed preview URL from `PageBuilderController::previewUrl()`
  and displays the current saved page in an iframe.

Available viewport modes:

- **Desktop** — fills the preview panel width.
- **Tablet** — constrains the iframe to a tablet-width frame.
- **Mobile** — constrains the iframe to a phone-width frame.

The preview status shows whether the iframe matches the last saved snapshot. Any
local edit marks it as outdated; manual save and autosave refresh the signed URL and
mark the preview current again. Editors can also refresh the iframe manually or open
the same preview URL in a new tab from the panel.

### Standalone Preview

Click **Preview** in the toolbar or the open icon in the preview panel to open the
signed page preview in a new browser tab.

This renders only active sections and blocks, without the admin sidebar.

---

## Data Flow & Persistence

### How changes are saved

1. User edits a section or block → `useBuilderState` updates local React state.
2. User clicks **Save** → `router.put('/admin/cms/pages/{id}/builder', { snapshot })`.
3. `UpdatePageBuilderRequest` delegates to `PageBuilderSnapshotValidator`.
4. The validator checks section types, block types, block configuration schemas,
   relation contracts, relation model existence, payload limits, and sanitizes
   rich HTML fields.
5. `PageBuilderController::update()` opens a database transaction, locks the page row
   with `lockForUpdate()`, checks `expected_version`, then passes the sanitized
   snapshot to `PageBuilderSyncService::sync()`.
6. After a successful sync, the page `version` is incremented and a `PageVersion`
   record is created with `source` metadata (`manual`, `autosave`, or `import`).
7. Inertia redirects back → page refreshes with fresh server data.

### Important: Delete-and-recreate pattern

The save operation **deletes all sections and blocks** and recreates them from scratch.
This means:
- Block `id` values change on every save.
- Relations are also recreated.
- `reusable_block_id` is preserved in the save payload so global links survive.
- The delete/recreate work runs inside the same transaction as version increment and
  version snapshot creation, so a failed sync rolls back to the previous page tree.

### Auto-save

The builder runs a debounced silent autosave whenever `localSections` changes. The
preview iframe URL is refreshed after successful autosave. No toast is shown for
auto-saves.

### Shared snapshot validation

Manual save, autosave, JSON import, reusable blocks, and section templates all use the
same Page Builder validation services:

- `App\Services\PageBuilder\BlockConfigurationValidator`
- `App\Services\PageBuilder\PageBuilderSnapshotValidator`
- `App\Services\CssSanitizerService` for `custom_html.css`

Relations must use the persisted contract:

```json
{
  "relation_type": "product",
  "relation_id": 123,
  "relation_key": "products",
  "position": 0,
  "metadata": null
}
```
