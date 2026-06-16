# Design System, Theme System & Page Builder — Final Implementation Plan

Data: 2026-06-15

## Cel

Plan wdrożenia na podstawie audytu UX/UI Blog (dominik-dev.pl) ↔ CMS (storefront + admin). Określa finalną architekturę Design System, Page Builder, Theme System oraz listę migracji i refaktoryzacji podzielonych na małe, samodzielne etapy.

**Ten dokument nie implementuje zmian** — służy jako źródło prawdy przy wdrażaniu.

## Założenia (zamknięte)

| # | Założenie | Konsekwencja |
|---|-----------|--------------|
| D1 | Blog jest wzorcem UX/UI **tylko dla części publicznej** | Jakość Bloga = domyślny motyw storefrontu, nie hardcode |
| D2 | Panel administracyjny **nie jest wzorcem** i nie będzie kopiowany z Bloga | Admin zachowuje własną tożsamość (teal/glass); współdzielone tylko prymitywy shadcn + `cn()` |
| D3 | CMS jest produktem ecommerce — storefront **musi pozostać themeable** | Merchant zmienia kolory, fonty, branding przez `themes` + settings |
| D4 | Zachowujemy page builder, storefront, wielosklepowość, obecny model danych | Brak nowych tabel tenancy; rozszerzamy istniejące addytywnie |
| D5 | **Zero generowania kodu przez AI** | AI buduje strony wyłącznie przez konfigurację bloków page buildera (`builder_snapshot` JSON) |

## Kontekst z audytu

Audyt wykazał **trzy oddzielne systemy tokenów**:

| Powierzchnia | Primary | Fonty | Charakter |
|--------------|---------|-------|-----------|
| Blog (wzorzec) | indigo | Inter + Space Grotesk | płaski, minimalny |
| CMS Admin | teal | Instrument Sans | glassmorphism, orb background |
| CMS Storefront | near-black | Geist + Playfair | własne `--store-*`, glass |

**~80% różnic to tokeny i typografia**, nie architektura komponentów. Prymitywy shadcn (`button`, `input`, `card`…) mają praktycznie identyczne API — różni je snapshot generacji i wartości tokenów.

**Kluczowe odkrycie w kodzie:** system motywów **już istnieje**:

- tabela `themes` (tokens, typography, spacing, buttons, containers)
- `/api/v1/settings/public` → `client/components/theme-styles.tsx` wstrzykuje CSS variables do `:root`
- admin: `active-theme-sync.tsx` + `ThemeController`
- `pages.theme_id` istnieje w DB, ale **nie jest podłączone** do storefront renderera
- `stores` = lokalizacje fizyczne (store locator), **nie** SaaS tenancy

Plan skupia się na **dokończeniu i utwardzeniu** istniejącego Theme System, nie budowaniu od zera.

## Powiązane pliki (mapa referencyjna)

### Storefront (Next.js, `client/`)

| Plik | Rola |
|------|------|
| `client/app/globals.css` | Tokeny, `--store-*`, `@theme inline`, utilities |
| `client/app/layout.tsx` | `getPublicSettings()` → `<ThemeStyles>` |
| `client/components/theme-styles.tsx` | Injekcja tokenów z DB do `:root` |
| `client/components/layout/theme-init.tsx` | Dark mode (`localStorage`, `.dark` na `<html>`) |
| `client/components/page-builder/page-renderer.tsx` | Renderer stron |
| `client/components/page-builder/block-renderer.tsx` | Dispatch 30 typów bloków |
| `client/components/page-builder/section-renderer.tsx` | Warianty sekcji (token-driven) |

### Backend (`server/`)

| Plik | Rola |
|------|------|
| `server/config/blocks.php` | Rejestr 30 typów bloków + schematy |
| `server/app/Enums/PageBlockTypeEnum.php` | Enum typów bloków |
| `server/app/Services/PageBuilderSyncService.php` | Sync snapshot ↔ tabele relacyjne |
| `server/app/Services/PageBuilder/BlockConfigurationValidator.php` | Walidacja configu bloku |
| `server/app/Services/PageBuilder/PageBuilderSnapshotValidator.php` | Walidacja całego snapshotu |
| `server/app/Http/Controllers/Admin/ThemeController.php` | CRUD motywów |
| `server/resources/js/features/page-builder/` | Admin builder UI |

### Blog (referencja, osobne repo)

| Plik | Rola |
|------|------|
| `blog/resources/css/app.css` | Wzorzec tokenów (indigo, Inter, Space Grotesk, radius .375) |
| `blog/resources/js/components/public/*` | Wzorce kompozycyjne (Container, Section, PageHeader…) |

---

## 1. Finalna architektura Design System

Trójwarstwowa, z **wyraźnym rozdziałem storefront vs admin**.

```
WARSTWA 1 — KONTRAKT TOKENÓW
  client/app/globals.css
    → deklaracje zmiennych (kontrakt) + @theme inline bridge + utilities + base
    → każda wartość "markowalna" MUSI istnieć jako token

  Kontrakt obejmuje:
    --background, --foreground, --primary, --secondary, --muted, --accent,
    --destructive, --border, --input, --ring, --radius,
    --font-heading, --font-body, --font-mono,
    --container-*, --btn-*, --store-* (layout), --section-*,
    zestaw dark (przez themes.dark_tokens)

WARSTWA 2 — PRYMITYWY (shadcn new-york, jeden snapshot, prywatny registry)
  button, input, label, select, card, dialog, dropdown, tooltip, tabs, badge,
  checkbox, switch, separator, sheet, popover, table, skeleton
  → współdzielone storefront ↔ admin (te same API), różnią się tylko tokeny
  → Blog (osobne repo) pozostaje nietknięty jako referencja

WARSTWA 3 — WZORCE KOMPOZYCYJNE (rozdzielone per-runtime)
  STOREFRONT (Next):  Container, Section, PageHeader, CTASection, EmptyState, AnimateOnView
                      — portowane z jakości Bloga, czytające tokeny z DB theme
  ADMIN (Inertia):    zostaje jak jest (AppShell, PageHeader, StickyFormActions…)

WARSTWA 4 — KOMPONENTY DOMENOWE (nie współdzielone)
  Storefront: page-builder/blocks/*, cart, checkout, chat, header, footer
  Admin:      rich-text-editor (Lexical), data-table, metafield-editor, localized-field
```

**Zasada nadrzędna storefrontu:** żaden komponent storefrontu ani blok nie zawiera zahardkodowanego koloru/fontu — wszystko przez tokeny.

**Dystrybucja (3 osobne runtime):** kopia wartości tokenów + prywatny shadcn registry, nie monorepo-package importowany runtime'owo.

---

## 2. Finalna architektura Page Builder

Obecny znormalizowany model zostaje. Kluczowa zmiana: **page builder staje się jedyną drogą budowy stron, a jego schemat bloków = formalny kontrakt maszynowy dla AI**.

```
ŹRÓDŁO PRAWDY SCHEMATU
  server/config/blocks.php (30 typów + relation_types)
  App\Enums\PageBlockTypeEnum
        │
        ├─(artisan export)→ JSON Schema bloków (artefakt build-owany)
        │                         │
        │        ┌────────────────┼─────────────────────┐
        │        ▼                ▼                     ▼
        │   Admin builder    AI block-composer      Storefront typy
        │   (formularze)     (config-only)          (client/types)
        ▼
WALIDACJA (bramki, ten sam kod dla człowieka i AI)
  BlockConfigurationValidator   → config bloku vs schema
  PageBuilderSnapshotValidator  → cały snapshot (sekcje/bloki/relacje, limity)
  PageBuilderRulesService       → reguły biznesowe (DO NAPRAWY: klucze = section_type, nie block_type)
        ▼
PERSYSTENCJA
  PageBuilderSyncService → pages.builder_snapshot (JSON) + page_sections/page_blocks/block_relations
  page_versions (historia, autosave, źródło: human|ai)
        ▼
RENDER
  page-renderer → section-renderer → block-renderer
  ⇒ wszystkie bloki token-driven
```

### 30 typów bloków (kanoniczna lista)

`hero_banner`, `rich_text`, `featured_products`, `categories_grid`, `promotional_banner`, `newsletter_signup`, `testimonials`, `image_gallery`, `video_embed`, `custom_html`, `two_columns`, `three_columns`, `accordion`, `tabs`, `form_embed`, `map`, `featured_posts`, `stats_counter`, `call_to_action`, `pricing_table`, `brands_slider`, `logo_cloud`, `countdown_timer`, `timeline`, `team_members`, `icon_list`, `steps_process`, `trust_badges`, `alert_banner`, `pricing_cards`

### Moduły stron (page_type = module, osobno od bloków)

`content`, `faq`, `blog`, `returns_portal`, `product_listing`, `category_listing`, `brand_listing`, `store_locator`, `flash_sales_hub`, `guest_order_tracker`, `newsletter_preferences`

### Przepływ AI (D5)

```
intencja strony
  → AI dostaje JSON Schema bloków
  → zwraca builder_snapshot JSON
  → te same walidatory co dla człowieka
  → PageBuilderSyncService zapisuje
  → page_versions.source = 'ai'
```

AI **nigdy** nie dotyka komponentów ani CSS.

### Tabele DB (bez zmian modelu, tylko rozszerzenia)

| Tabela | Kluczowe kolumny |
|--------|------------------|
| `pages` | `builder_snapshot`, `page_type`, `module_name`, `theme_id`, `layout` |
| `page_sections` | `section_type`, `layout`, `variant`, `settings`, `position` |
| `page_blocks` | `type`, `configuration`, `position`, `reusable_block_id` |
| `block_relations` | `relation_type`, `relation_id`, `relation_key` |
| `page_versions` | `snapshot`, `is_autosave`, `source` |
| `reusable_blocks` | `type`, `configuration`, `relations_config` |
| `global_slots` | `location`, `reusable_block_id` |

---

## 3. Finalna architektura Theme System

```
WARSTWA KONTRAKTU (kod)
  globals.css = lista zmiennych = "co merchant może nadpisać"
  whitelist kluczy w theme-styles.tsx = bramka bezpieczeństwa

WARSTWA WARTOŚCI (DB, edytowalne przez merchanta)
  themes:
    tokens (light) | dark_tokens (NOWE) | typography + font_sources (NOWE) |
    spacing | buttons | containers | branding (NOWE) | is_active
  DEFAULT seed = wartości jakości Bloga (indigo, Inter + Space Grotesk, flat, radius .375)

WARSTWA INJEKCJI (runtime)
  Storefront (Next, SSR):
    layout.tsx → getPublicSettings() → <ThemeStyles> wstrzykuje :root + .dark
    + dynamiczny loader fontów (z theme.font_sources)
    + branding (logo/favicon) do header/footer
  Admin (Inertia):
    active-theme-sync zostaje z WŁASNYM domyślnym motywem admina (nie Blog)

WARSTWA ZAKRESU (scope)
  Globalny aktywny motyw (is_active) = obecne zachowanie
  + opcjonalny per-page override: pages.theme_id (kolumna istnieje, dziś ignorowana)
  Wielosklepowość: stores = lokalizacje fizyczne (bez zmian). Brak tenancy → motyw globalny.
```

### Znane luki do zamknięcia

1. `pages.theme_id` w DB/cache, ale nie w `PageResource` ani Next.js rendererze
2. `site_logo` w settings/onboarding, ale header renderuje tylko tekst `siteName`
3. Theme typography ustawia nazwy fontów bez ładowania ich na storefront
4. `SectionValidationService` i `PageBuilderRulesService` — wiring niekompletny/nieużywany

---

## 4. Lista wszystkich wymaganych migracji

Wszystkie **addytywne**. Każda osobno wdrażalna i odwracalna.

| # | Migracja | Cel | Ryzyko |
|---|----------|-----|--------|
| M1 | `themes.dark_tokens` (JSON, nullable) | osobny zestaw tokenów dla dark mode per-motyw | niskie |
| M2 | `themes.font_sources` (JSON, nullable) | definicja fontów merchanta (rodzina, źródło google/system/custom, wagi) | niskie |
| M3 | `themes.branding` (JSON, nullable) | logo, favicon, kolory marki per-motyw | niskie |
| M4 | `themes.draft_tokens` (JSON, nullable) | bufor live-preview motywu bez publikacji | niskie |
| M5 | FK + index na `pages.theme_id` → `themes.id` (`nullOnDelete`) | bezpieczne podłączenie per-page override | niskie |
| M6 | `page_blocks.schema_version` (unsigned small, default 1) | wersjonowanie configu bloków | niskie |
| M7 | `page_versions.source` rozszerzony o `ai` | rozróżnienie stron tworzonych przez AI vs człowieka | niskie |

> Backfill danych (naprawa bloków z hardcoded kolorami, domyślny motyw) = komendy artisan / seedery, nie migracje schematu.

---

## 5. Lista wszystkich wymaganych refaktoryzacji

### A. Tokeny / kontrakt (storefront)

| ID | Refaktoryzacja |
|----|----------------|
| R1 | Wydzielić w `globals.css` kontrakt (deklaracje zmiennych) od wartości |
| R2 | Skonsolidować zdublowane skale: `--store-shell-width` ↔ `--container-max-width`, `--store-card-radius` ↔ `--radius-*` |
| R3 | Rozszerzyć whitelist kluczy w `theme-styles.tsx` + walidacja wejścia |

### B. Default theme = jakość Bloga

| ID | Refaktoryzacja |
|----|----------------|
| R4 | Seeder domyślnego motywu storefrontu z wartościami Bloga |
| R5 | Port wzorców kompozycyjnych Bloga do storefrontu (czytające tokeny) |

### C. Bloki 100% token-driven

| ID | Refaktoryzacja |
|----|----------------|
| R6 | Audyt i naprawa bloków z hardcoded kolorami (`promotional-banner`, hero overlay, `text-white` na tłach) |
| R7 | `section-renderer` — wszystkie warianty sekcji na tokenach |

### D. Fonty i branding

| ID | Refaktoryzacja |
|----|----------------|
| R8 | Dynamiczny loader fontów z `theme.font_sources` |
| R9 | Podłączyć logo/favicon do `header.tsx`/`footer.tsx` |

### E. Page builder jako kontrakt dla AI

| ID | Refaktoryzacja |
|----|----------------|
| R10 | Komenda artisan eksportująca JSON Schema z `blocks.php` |
| R11 | Naprawić `PageBuilderRulesService` (klucze = `block_type`); usunąć/oznaczyć nieużywany `SectionValidationService` |
| R12 | `PageResource` — eksponować `theme`; warstwa AI composer (config-only) |

### F. Admin (minimalny zakres, zgodnie z D2)

| ID | Refaktoryzacja |
|----|----------------|
| R13 | Ujednolicić `components.json` i prymitywy shadcn (registry) — **bez** zmiany tokenów admina |
| R14 | Współdzielony `cn()` util |

### G. Higiena (opcjonalne)

| ID | Refaktoryzacja |
|----|----------------|
| R15 | Storefront skip-link + wzorce a11y (aria-current, live regions) |
| R16 | Ujednolicić animacje storefrontu i `prefers-reduced-motion` |

---

## 6. Etapy wdrożenia

Każdy etap: samodzielny, testowalny, odwracalny. Kolejność: kontrakt → wartości → bloki → theming → AI → admin → higiena.

### Faza 1 — Kontrakt tokenów (storefront), zero zmian wizualnych

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E1.1 | R1: rozdzielić kontrakt od wartości w `globals.css` | Wizualnie 1:1 (regression screenshoty home/produkt/kategoria) |
| E1.2 | R2: skonsolidować zdublowane skale tokenów | Brak różnic wizualnych, mniej zmiennych |
| E1.3 | R3 + M1: `dark_tokens` i whitelist | Dark mode czyta tokeny z DB, brak FOUC |

### Faza 2 — Default theme = jakość Bloga

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E2.1 | R4: seeder domyślnego motywu | Świeża instalacja wygląda jak wzorzec Bloga |
| E2.2 | R5: porty wzorców kompozycyjnych | Sekcje spójne typograficznie/odstępowo z Blogiem |

### Faza 3 — Bloki token-driven (warunek themingu)

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E3.1 | R6: backfill configów + naprawa komponentów | Zmiana `--primary` przemalowuje wszystkie bloki |
| E3.2 | R7: warianty `section-renderer` na tokenach | Każdy wariant reaguje na motyw |

### Faza 4 — Branding i fonty merchanta

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E4.1 | M2 + R8: model i loader fontów | Merchant zmienia font → storefront ładuje i stosuje |
| E4.2 | M3 + R9: branding per-motyw + header/footer | Logo merchanta widoczne, favicon działa |
| E4.3 | M4 + live preview w `pages/admin/themes/edit` | Merchant widzi podgląd przed publikacją |

### Faza 5 — Page builder jako kontrakt (pod AI)

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E5.1 | R10: eksport JSON Schema z `blocks.php` | Artefakt schematu generowany komendą, w CI |
| E5.2 | R11: naprawa/oczyszczenie reguł walidacji | Reguły działają na `block_type`; martwy kod usunięty |
| E5.3 | M6 + M7: wersjonowanie configu + `source=ai` | Migracje configów bezpieczne, strony AI rozróżnialne |
| E5.4 | R12 + AI composer (config-only) | AI tworzy stronę jako `builder_snapshot`; zero generowanego kodu |

### Faza 6 — Per-page theme override (opcjonalne)

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E6.1 | M5: FK `pages.theme_id` | Spójność referencyjna |
| E6.2 | R12 + render override w `cms-dynamic-page` | Strona może nadpisać motyw globalny |

### Faza 7 — Admin (minimalny, zgodnie z D2)

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E7.1 | R14: wspólny `cn()` | Jeden util, brak driftu |
| E7.2 | R13: ujednolicony registry/prymitywy shadcn | Admin nadal teal/glass, prymitywy = jedno źródło |

### Faza 8 — Higiena i dokumentacja

| Etap | Zakres | Definition of Done |
|------|--------|-------------------|
| E8.1 | R15/R16: a11y + animacje storefrontu | Skip-link, spójny observer, `prefers-reduced-motion` |
| E8.2 | Strona `/design-system` + aktualizacja `.ai/guide.md` | Dokumentacja zgodna z kodem |

---

## 7. Różnice vs pierwotny audyt

1. **Admin wypadł z unifikacji** — etapy „podmień tokeny admina na Blog" usunięte; admin współdzieli tylko prymitywy/util.
2. **Storefront nie jest malowany na Blog na sztywno** — jakość Bloga = domyślny, w pełni nadpisywalny motyw w `themes`.
3. **Theming już istnieje** — dokładamy brakujące 20% (dark per-motyw, fonty, branding, preview, per-page).
4. **AI = wyłącznie konfiguracja bloków** — schemat `blocks.php` = kontrakt maszynowy; te same walidatory dla człowieka i AI.

---

## 8. Zasady wykonania

1. Każda faza kończy się testami i wizualnym regression checkiem kluczowych ekranów.
2. Nie usuwamy legacy warstw bez kompatybilności wstecznej (snapshot + relacje działają równolegle).
3. Admin pozostaje niezależny wizualnie — zmiany tokenów admina poza scope.
4. AI nigdy nie generuje plików źródłowych — tylko JSON walidowany schematem.
5. Przed commitem: `make fix && make check` (zgodnie z regułami repo).

---

## Powiązane dokumenty

- `docs/plans/page-builder-audit-and-roadmap.md` — audyt 30 bloków, porównanie z builderami, roadmapa ecommerce ze zadaniami technicznymi
- Audyt UX/UI: sesja [Design System audyt blog↔CMS](67f16218-9adc-44bb-805e-82071ba885ad)
- `page-builder-blocks-remediation-plan.md`
- `.ai/guide.md` — feature map (sekcja page builder, themes)
- `.ai/context.md` — deep context (page builder, i18n, payments)
- `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md` — szerszy audyt platformy
