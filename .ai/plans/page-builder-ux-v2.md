# Page Builder UX v2 — Plan wyniesienia na poziom Shopify/Gutenberg

> Status: **do review** | Created: 2026-05-22

---

## Diagnoza obecnego stanu

Obecny Page Builder jest **technicznie solidny** (schema-driven blocks, Lexical RTE, auto-save,
versioning, approval), ale **UX jest 1-2 generacje za Shopify/Gutenberg**:

- Edycja odbywa się w sidebarze, nie inline na stronie
- Nie widać efektu edycji bez klikania "Preview" → iframe
- Sekcje/bloki to karteczki z formularzami, nie renderowana treść
- Style section/block są hardcodowane (Tailwind klasy), nie korzystają z theme tokens
- Brak edycji obrazków (crop/resize)
- Brak global design systemu (kolory, typografia, spacing wspólne dla wszystkich stron)

**Co już mamy (fundament):**
- Theme model z `tokens` JSON (21 pól CSS variables)
- `HandleAppearance` middleware wstrzykujący CSS variables do `:root`
- 73 allowlistowanych tokenów w middleware
- `MediaService` z generowaniem wariantów 300/800/1200px
- Spatie MediaLibrary z conversions, responsive images, optimizerami
- `focalPoint` w typach `RteMediaAsset` (nieużywany)
- 30 komponentów bloków w `client/components/page-builder/blocks/`
- Section renderer z mapami `variantStyles` / `layoutContainerStyles`

---

## Phase 1: Global Design System — MUST HAVE

**Cel:** Bloki i sekcje dziedziczą style z theme'a, a nie używają hardcodowanych klas.
Użytkownik definiuje design raz (kolory, typografia, spacing, button style, container width),
a wszystkie strony go dziedziczą.

### 1.1 Rozszerzenie Theme modelu

**Plik:** `server/database/migrations/` (nowa migracja)

Dodaj kolumny do `themes`:
```php
$table->json('typography')->nullable();   // heading_font, body_font, scale, base_size
$table->json('spacing')->nullable();      // section_padding, block_gap, container_padding
$table->json('buttons')->nullable();      // primary/secondary/outline styles (radius, padding, shadow)
$table->json('containers')->nullable();   // max_width, content_width, narrow_width
$table->string('preview_image')->nullable()->change(); // już istnieje
```

Defaultowe wartości theme'u w seederze (odpowiadające obecnym hardcodowanym wartościom).

### 1.2 Theme Editor w Admin Panelu

**Pliki:** `server/resources/js/pages/admin/themes/edit.tsx`

Rozszerz istniejący theme editor o nowe sekcje:

```
┌─ Theme Editor ──────────────────────────────────────┐
│ ┌─ Colors ─────────────────────────────────────────┐│
│ │ Primary:    [########]  Secondary: [########]     ││
│ │ Background: [########]  Text:      [########]     ││
│ │ Muted:      [########]  Accent:    [########]     ││
│ │ Border:     [########]  Ring:      [########]     ││
│ └──────────────────────────────────────────────────┘│
│ ┌─ Typography ─────────────────────────────────────┐│
│ │ Heading font: [Inter ▼]  Body font: [Inter ▼]     ││
│ │ Base size:    [16px ▼]   Scale:     [1.25 ▼]     ││
│ │ H1: 2.5rem  H2: 2rem  H3: 1.5rem  H4: 1.25rem   ││
│ └──────────────────────────────────────────────────┘│
│ ┌─ Spacing & Layout ───────────────────────────────┐│
│ │ Section padding: [lg ▼]  Block gap: [md ▼]        ││
│ │ Container max-width: [1280px]                      ││
│ └──────────────────────────────────────────────────┘│
│ ┌─ Buttons ────────────────────────────────────────┐│
│ │ Primary:  [radius: 8px] [padding: 12/24]          ││
│ │ Secondary:[radius: 8px] [padding: 12/24]          ││
│ └──────────────────────────────────────────────────┘│
│ ┌─ Live Preview (po prawej) ───────────────────────┐│
│ │ [Minipreview z przykładowymi blokami]             ││
│ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 1.3 CSS Variables z Theme Tokenów

**Plik:** `server/app/Http/Middleware/HandleAppearance.php`

Rozszerz generowanie CSS variables:

```php
// Obecnie — tylko kolory shadcn
'--background' => $tokens['background'],
'--primary' => $tokens['primary'],
// ...

// Nowe:
'--font-heading' => $typography['heading_font'],
'--font-body' => $typography['body_font'],
'--text-base' => $typography['base_size'],
'--text-scale' => $typography['scale'],
'--section-padding-y' => $spacing['section_padding'],
'--block-gap' => $spacing['block_gap'],
'--container-max-width' => $containers['max_width'],
'--btn-radius' => $buttons['primary_border_radius'],
'--btn-padding-x' => $buttons['primary_padding_x'],
'--btn-padding-y' => $buttons['primary_padding_y'],
```

### 1.4 Refactor Section Renderer — użycie CSS Variables

**Plik:** `client/components/page-builder/section-renderer.tsx`

Zamiast hardcodowanych `variantStyles`:

```tsx
// PRZED:
const variantStyles = {
    light: 'bg-background text-foreground',          // shadcn token
    dark: 'bg-gray-950 text-white dark:bg-slate-900', // hardcoded!
    brand: 'bg-primary text-primary-foreground',       // shadcn token
};

// PO:
const variantStyles = {
    light: 'bg-[var(--background)] text-[var(--foreground)]',
    dark: 'bg-[var(--section-dark-bg)] text-[var(--section-dark-text)]',
    brand: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    muted: 'bg-[var(--muted)] text-[var(--foreground)]',
};
```

Każda sekcja i blok czyta swoje kolory/spacing z CSS variables odziedziczonych z theme'a.
Użytkownik zmienia theme → wszystkie strony się aktualizują.

### 1.5 Per-Page Theme Override

**Plik:** Nowa relacja w `Page` modelu

Dodaj możliwość nadpisania theme'u per-strona (już jest `theme_id` w `pages`):

```php
// Page może mieć własny theme (theme_id) — jeśli null, dziedziczy active theme
// Dodaj przycisk "Customize theme for this page" w builder toolbar
```

### 1.6 Bloki dziedziczą style z theme'a

Każdy blok (CTA, hero, pricing, etc.) zamiast hardcodowanych klas Tailwind używa CSS variables:

```tsx
// PRZED (call-to-action.tsx):
className="bg-primary text-primary-foreground"

// PO:
className="bg-[var(--block-cta-bg,var(--primary))] text-[var(--block-cta-text,var(--primary-foreground))]"
```

Z `var(--fallback)` — blok ma domyślny styl z theme'a, ale może być nadpisany per-block
przez `_custom_css` (już istnieje).

### Szacunkowy effort: 5-7 dni

---

## Phase 2: Image Editing — MUST HAVE

**Cel:** Crop/resize/focal-point dla obrazków w MediaPickerze i RTE.

### 2.1 Image Crop Modal

**Plik:** `server/resources/js/components/image-editor-modal.tsx` (nowy)

Funkcjonalności:
- **Aspect ratio presety**: Freeform, 1:1, 4:3, 16:9, 3:2, 2:3, 9:16
- **Drag to crop**: React-image-crop lub własny canvas
- **Focal point picker**: Kliknij na obrazku, żeby ustawić punkt fokalny (już w typach `focalPoint`)
- **Zoom**: Slider/pinch-to-zoom
- **Rotate**: Przyciski 90° left/right
- **Preview**: Before/after

Biblioteka: `react-image-crop` (lekka, 40KB, dobrze utrzymywana)
Alternatywnie: `react-easy-crop` (lepsze UX, pinch-zoom)

### 2.2 Integracja z MediaPickerModal

**Plik:** `server/resources/js/components/media-picker-modal.tsx`

Dodaj przycisk "Edit" przy każdym obrazku, otwierający `ImageEditorModal`.
Po zapisaniu cropu:
1. Wyślij crop params (x, y, width, height, rotate) na backend
2. Backend generuje nowy wariant obrazka z cropem (używając `spatie/image`)
3. Zwróć URL nowego wariantu
4. Zaktualizuj `focalPoint` w metadanych media

### 2.3 Backend: Crop Endpoint

**Plik:** `server/app/Http/Controllers/Admin/MediaController.php`

Nowa metoda `crop(Media $media, MediaCropRequest $request)`:

```php
POST /admin/media/{media}/crop
{
    "x": 0, "y": 0, "width": 800, "height": 600,
    "aspect_ratio": "16:9",
    "rotate": 0,
    "focal_point": { "x": 50, "y": 50 }
}
```

Użyj `spatie/image` do wygenerowania przyciętego wariantu.
Zapisz jako nową konwersję w MediaLibrary (`crop_16_9`, `crop_1_1`, etc.).

### 2.4 RTE Image Node — użycie crop variants

**Plik:** `server/resources/js/components/ui/rich-text-editor/image-node.tsx`

W panelu metadanych obrazka dodaj:
- Select z dostępnymi crop variants (original, 16:9, 1:1, etc.)
- Podgląd wybranego wariantu
- Focal point display/editor

### Szacunkowy effort: 4-5 dni

---

## Phase 3: Inline Editing — SHOULD HAVE

**Cel:** Bloki renderują się w edytorze jako podgląd, proste pola są edytowalne inline,
skomplikowane nadal w sidebarze.

### 3.1 Hybrid Inline + Sidebar

```
┌─ Page Builder (nowy layout) ──────────────────────────────────────────┐
│ ┌─ Toolbar ──────────────────────────────────────────────────────────┐│
│ │ [← Back] [Title: Homepage] [Save] [Undo] [Redo] [Preview] [▼More] ││
│ └────────────────────────────────────────────────────────────────────┘│
│ ┌─ Navigator (lewy, 220px) ─┬─ Canvas (środek, flex) ───────────────┐│
│ │                           │                                         ││
│ │ 📄 Sections               │ ┌─ Hero Banner ───────────────────┐    ││
│ │  ├─ 🖼️ Hero Banner        │ │ [Click to edit heading]         │    ││
│ │  ├─ 📝 Rich Text          │ │ [Click to edit subtitle]        │    ││
│ │  └─ 🎯 CTA                │ │ [Primary CTA ▾] [Secondary ▾]   │    ││
│ │                           │ │ 🖼️ [Background image][Edit]     │    ││
│ │ Add section [+ ]          │ └─────────────────────────────────┘    ││
│ │                           │                                         ││
│ │                           │ ┌─ Rich Text ──────────────────────┐    ││
│ │                           │ │ Lorem ipsum dolor sit amet...     │    ││
│ │                           │ │ [Click to edit text inline]       │    ││
│ │                           │ └──────────────────────────────────┘    ││
│ │                           │                                         ││
│ │                           │ ┌─ CTA ────────────────────────────┐    ││
│ │                           │ │  Ready to get started?           │    ││
│ │                           │ │  [Get Started]  [Learn More]     │    ││
│ │                           │ └──────────────────────────────────┘    ││
│ │                           │                                         ││
│ │                           │ Add block [+ ]                         ││
│ └───────────────────────────┴────────────────────────────────────────┘│
│                                                                        │
│ ┌─ Inspector (prawy, 300px — pojawia się po kliknięciu bloku) ───────┐│
│ │ ⚙ Block: Hero Banner                                   [× close]  ││
│ │ ┌─ Content ────────────────────────────────────────────────────────┐││
│ │ │ Heading:    [Build amazing sites_____]                           │││
│ │ │ Subtitle:   [With our platform you...]                           │││
│ │ │ Primary CTA:[Get Started____]  URL: [/register_______]           │││
│ │ │ Secondary:  [Learn More_____]  URL: [/about__________]           │││
│ │ └──────────────────────────────────────────────────────────────────┘││
│ │ ┌─ Media ──────────────────────────────────────────────────────────┐││
│ │ │ Background: [🖼️ hero-bg.jpg] [Change] [Edit crop]                │││
│ │ │ Overlay:    [########────] 60%                                    │││
│ │ └──────────────────────────────────────────────────────────────────┘││
│ │ ┌─ Layout ─────────────────────────────────────────────────────────┐││
│ │ │ Min height: [500px ▼]  Alignment: [center ▼]                     │││
│ │ └──────────────────────────────────────────────────────────────────┘││
│ │ ┌─ Advanced ───────────────────────────────────────────────────────┐││
│ │ │ Animation: [none ▼]  CSS class: [___________]                    │││
│ │ │ Lock: ☐                                                        │││
│ │ └──────────────────────────────────────────────────────────────────┘││
│ └────────────────────────────────────────────────────────────────────┘│
│ ┌─ Health Panel (toggle) ────────────────────────────────────────────┐│
│ │ ⚠ CTA "Get Started" has no URL                                     ││
│ │ ⚠ Image "hero-bg.jpg" missing alt text                              ││
│ └────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Jak to osiągnąć

**a) Renderuj bloki w canvas zamiast karteczek**

Canvas używa tych samych komponentów co frontend (`client/components/page-builder/blocks/*.tsx`),
ale w trybie `editable`:

```tsx
<HeroBannerBlock block={block} mode="editable" onEdit={(field, value) => updateBlock(...)} />
```

Każdy blok w trybie `editable` dodaje:
- Obramowanie po hover (`outline-2 outline-primary/30`)
- Przycisk `[Edit]` po najechaniu → otwiera sidebar inspector
- Dla pól tekstowych: `contentEditable` z debounced onChange
- Dla mediów: kliknięcie otwiera MediaPicker
- Drag handle do przeciągania bloków między sekcjami

**b) Inline editing dla prostych pól**

```tsx
// W komponencie bloku, dla pól tekstowych:
<span
    contentEditable={mode === 'editable'}
    suppressContentEditableWarning
    onBlur={(e) => onEdit?.('heading', e.currentTarget.textContent)}
>
    {block.configuration.heading}
</span>
```

**c) Sidebar inspector dla złożonej konfiguracji**

Zachowaj obecny `DynamicBlockForm` jako sidebar inspector — otwiera się po:
1. Kliknięciu `[Edit]` na bloku
2. Kliknięciu bloku w nawigatorze
3. Podwójnym kliknięciu bloku w canvas

**d) Sekcje jako wizualne kontenery**

Sekcje renderują się z tłem/paddingiem (jak na frontendzie), a bloki są w ich wnętrzu.

```tsx
<section className={sectionClasses} style={{ minHeight: '100px' }}>
    {/* Bloki wewnątrz sekcji */}
</section>
```

### 3.3 Przebudowa layoutu buildera

**Plik:** `server/resources/js/features/page-builder/components/page-builder.tsx`

Zmiana z 3-kolumnowego layoutu (navigator | karty | inspector) na:
**Navigator | Canvas + Floating Inspector**

- Navigator (lewy, stały, 220px) — drzewko sekcji/bloków (jak obecnie)
- Canvas (środek, scrollowalny) — renderowane bloki w trybie `editable`
- Inspector (prawy, sliding panel, 320px) — pojawia się/chowa po kliknięciu bloku

### 3.4 Tryb "Simple" vs "Advanced"

Dodaj toggle w toolbarze:
- **Simple mode**: Tylko canvas z inline editingiem. Sidebar pokazuje tylko podstawowe pola.
- **Advanced mode**: Obecne zachowanie + canvas podgląd. Pełny sidebar inspector.

### Szacunkowy effort: 8-12 dni

---

## Phase 4: Quick UX Wins — SHOULD HAVE

### 4.1 Quick Add Block (pomiń wymóg sekcji)

**Plik:** `server/resources/js/features/page-builder/hooks/use-builder-state.ts`

```ts
// Nowa akcja: addQuickBlock(type)
// Jeśli nie ma żadnej sekcji → automatycznie tworzy sekcję 'standard'
// Jeśli jest ostatnia sekcja → dodaje blok do niej
// Jeśli ostatnia sekcja jest 'hero' → tworzy nową sekcję i dodaje blok
```

Toolbar dostaje przycisk `[+ Add Block]` obok `[+ Add Section]`.

### 4.2 Drag & drop bloków między sekcjami

Obecnie bloki można przeciągać tylko wewnątrz sekcji. Dodaj możliwość przenoszenia między sekcjami:

```tsx
// Użyj DndContext na poziomie całego buildera z wieloma droppable areas
```

### 4.3 Skróty klawiszowe

```
Ctrl+S      → Save (już jest przez przeglądarkę? Nie — dodaj)
Ctrl+Z      → Undo (jest)
Ctrl+Shift+Z → Redo (jest)
Ctrl+D      → Duplicate selected block/section
Delete      → Delete selected block/section (z confirm)
Esc         → Deselect / close inspector
/           → Quick add block (command palette)
```

### 4.4 Block patterns / Page templates

**Plik:** `server/config/cms/block_patterns.php` (nowy)

Predefiniowane zestawy bloków, które można wstawić jednym kliknięciem:

```php
'patterns' => [
    'hero-with-cta' => [
        'name' => 'Hero + CTA',
        'blocks' => [
            ['type' => 'hero_banner', 'configuration' => [...]],
            ['type' => 'call_to_action', 'configuration' => [...]],
        ],
    ],
    'features-three-col' => [...],
    'pricing-with-faq' => [...],
    'testimonials-with-stats' => [...],
    'blog-with-newsletter' => [...],
]
```

W toolbarze: `[+ Insert Pattern]` → modal z kategoriami → podgląd → insert.

To już istnieje jako `section_templates` — rozszerz o wzorce wielosekcyjne.

### Szacunkowy effort: 3-4 dni

---

## Phase 5: Performance — SHOULD HAVE

### 5.1 Lazy Loading Sekcji

**Plik:** `client/components/page-builder/section-renderer.tsx`

Zamiast renderować wszystkie sekcje naraz, użyj `IntersectionObserver`:

```tsx
// Dodaj SectionLazyWrapper który:
// 1. Renderuje placeholder o wysokości sekcji (z section.settings.minHeight)
// 2. Gdy sekcja wchodzi w viewport → renderuje pełną zawartość
// 3. Opcjonalnie: SSR wszystkie, client-side lazy (dla SEO)
```

Konfiguracja per-sekcja: `lazy_load` (boolean) w settings.

### 5.2 Code Splitting Bloków

**Plik:** `client/components/page-builder/block-renderer.tsx`

30 bloków w jednym switchu = jeden duży bundle. Użyj `dynamic()` / `lazy()`:

```tsx
const HeroBannerBlock = dynamic(() => import('./blocks/hero-banner'));
const RichTextBlock = dynamic(() => import('./blocks/rich-text'));
// ...
```

Next.js automatycznie rozbije na osobne chunki. Blok ładuje się dopiero gdy jest potrzebny.

### Szacunkowy effort: 1-2 dni

---

## Phase 6: RTE Full Mode dla RichText Block — SHOULD HAVE

**Problem:** W `DynamicBlockForm` pola `format: 'richtext'` używają trybu `simple` (bez fontów, kolorów, tabel, kolumn). Blok `rich_text` nie ma dostępu do pełnych możliwości Lexicala.

### 6.1 Tryb edytora per-block

**Plik:** `server/resources/js/features/page-builder/components/dynamic-block-form/string-field.tsx`

```tsx
// Obecnie wszystkie pola richtext → mode='simple'
// Zmiana:
if (format === 'richtext' && blockType === 'rich_text') {
    return <RichTextEditor mode="full" ... />;
}
if (format === 'richtext') {
    return <RichTextEditor mode="simple" ... />;
}
```

### 6.2 Dodaj opcję toolbar mode w schemacie bloku

**Plik:** `server/config/blocks.php`

```php
'rich_text' => [
    'schema' => [
        'content' => [
            'type' => 'string',
            'format' => 'richtext',
            'editor_mode' => 'full',  // 'simple' | 'full'
        ],
    ],
],
```

### Szacunkowy effort: 0.5 dnia

---

## Phase 7: Testy

### 7.1 Backend

- `ThemeDesignTokenTest` — testy generowania CSS variables z theme tokens
- `ImageCropTest` — testy endpointu crop (walidacja parametrów, generowanie wariantów)
- `BlockPatternTest` — testy insertowania patterns
- Rozszerzenie `PageBuilderSnapshotValidationTest` o nowe pola

### 7.2 Frontend

- Snapshot testy dla każdego z 30 bloków z minimalną konfiguracją
- Testy integracyjne `BlockRenderer` — renderuje każdy typ bloku bez crashu
- Testy `SectionRenderer` z różnymi variant/layout kombinacjami
- Testy `ThemeTokenInheritance` — bloki czytają poprawne CSS variables

### Szacunkowy effort: 3-4 dni

---

## Harmonogram i priorytety

| Faza | Opis | Effort | Priorytet |
|------|------|--------|-----------|
| **Phase 1** | Global Design System | 5-7 dni | **Must have** |
| **Phase 2** | Image Editing (crop/resize/focal point) | 4-5 dni | **Must have** |
| **Phase 3** | Inline Editing | 8-12 dni | Should have |
| **Phase 4** | Quick UX Wins (quick add, drag between, shortcuts, patterns) | 3-4 dni | Should have |
| **Phase 5** | Performance (lazy sections, code splitting) | 1-2 dni | Should have |
| **Phase 6** | RTE Full Mode dla RichText | 0.5 dnia | Should have |
| **Phase 7** | Testy | 3-4 dni | Should have |
| **Razem** | | **25-35 dni** | |

---

## Kolejność implementacji

```
Phase 1 (Design System) → Phase 2 (Image Editing) → Phase 6 (RTE Full)
     ↓
Phase 3 (Inline Editing) → Phase 4 (Quick Wins) → Phase 5 (Performance)
     ↓
Phase 7 (Testy) — równolegle z każdą fazą
```

**Dlaczego ta kolejność:**
1. Design System jako pierwszy — bo potem wszystkie nowe komponenty (inline editing, image editor) będą już korzystać z theme tokens
2. Image Editing jako drugi — niezależne od reszty, duży impact wizualny
3. Inline Editing dopiero po Design Systemie — bo canvas będzie renderował bloki z theme'u
4. Quick Wins i Performance na końcu — bo są dodatkami do już działającego inline editora

---

## Dyskusja: Live Preview

Kwestia do przegadania.

**Obecnie:** iframe z frontendem przez preview token.
**Z inline editingiem:** canvas = live preview. To co widzisz w edytorze to renderowana strona.

Czy nadal potrzebny iframe preview?

**Argumenty za zachowaniem iframe:**
- Podgląd na różnych urządzeniach (desktop/tablet/mobile) — `ResponsivePreviewPanel` już to ma
- Podgląd "prawdziwego" frontendu (z header/footer, nawigacją) — czego canvas może nie mieć
- Sprawdzenie SEO/JSON-LD — tylko na rzeczywistym frontendzie

**Rekomendacja:** Zachowaj iframe preview jako dodatkową opcję (otwiera się w nowej karcie lub
jako panel w builderze), ale canvas z inline editingiem jest podstawowym widokiem edycji.
Dodaj toggle: `Canvas View` ↔ `Preview (iframe)` w toolbarze.
