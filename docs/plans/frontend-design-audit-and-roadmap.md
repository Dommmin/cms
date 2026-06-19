# Frontend Design Audit — Design System, Theme, Composition, Blog, Page Builder

Data: 2026-06-16  
Rewizja: 1  
Tryb: read-only (audyt bez zmian w kodzie)

## Cel dokumentu

Ocena jakości UI/UX storefrontu Next.js (`client/`) w sześciu obszarach: Design System, Theme System, Composition, Blog, Page Builder oraz wszystkie 30 bloków. Dla każdego obszaru podano oceny UX / Visual / Consistency (1–10), listę problemów wizualnych i niespójności oraz roadmapę poprawek.

**Ten dokument nie implementuje kodu** — jest raportem audytowym i planem wdrożenia UI.

**Materiał dowodowy (live):**

| URL | Rola |
|-----|------|
| `/design-system-showcase` | Prymitywy DS + composition + shadcn |
| `/theme-showcase` | Regresja tokenów motywu kupca (custom HTML) |
| `/page-builder-showcase` | Wszystkie 30 typów bloków |

**Powiązane dokumenty:**

- `docs/design-system-showcase.md` — opis strony DS showcase
- `docs/plans/composition-integration-architecture.md` — docelowa architektura composition
- `docs/plans/composition-integration-audit.md` — audyt composition (częściowo nieaktualny — patrz sekcja Composition)
- `docs/plans/design-system-theme-page-builder-final-plan.md` — architektura DS + Theme
- `docs/plans/page-builder-audit-and-roadmap.md` — audyt architektoniczny page buildera (runtime contract, data strategy)

---

## Podsumowanie ocen

| Obszar | UX | Visual | Consistency | Komentarz |
|--------|:--:|:--:|:--:|-----------|
| **Design System** | 8 | 8 | 7 | Solidne tokeny OKLCH + shadcn/CVA; psują obraz dwa systemy przycisków i brak kilku prymitywów. |
| **Theme System** | 7 | 8 | 7 | Świetna architektura (DB→CSS vars, dark mode); showcase oparty o `custom_html` to równoległa ścieżka stylów. |
| **Composition** | 7 | 7 | 6 | Dobry SSOT w `styles.ts`, ale adopcja nierówna i brak `Stack`; dokumentacja audytu nieaktualna. |
| **Blog** | 7 | 6 | 5 | Częściowo przyjął prymitywy, ale podwójny kontener, twarde `text-4xl`, surowe `gray-*` i inline RGB. |
| **Page Builder (system)** | 7 | 6 | 6 | Mocna powłoka sekcji, ale bloki rzadko używają shadcn/composition i powielają wzorce. |
| **30 bloków (średnia)** | 7.3 | 6.8 | 6.6 | Trzon poprawny, ale emoji-ikony, surowe kolory i duplikaty psują spójność. |

---

## 1. Design System

**Oceny: UX 8 · Visual 8 · Consistency 7**

### Mocne strony

- Tailwind v4 CSS-first — tokeny w `client/app/globals.css` (OKLCH, `@theme inline`, jawny „token contract").
- `client/components/ui/` — prawdziwe shadcn (New York) + CVA (`Button`, `Badge`, `Tabs`) z `cn()`.
- Showcase kompletny: 15 grup, ~106 przykładów (`client/components/design-system-showcase/`).
- Semantyczne kolory (`bg-primary`, `text-muted-foreground`, `border-border`) konsekwentnie w prymitywach.
- Prose (`.prose`, `.prose-lg`) w `globals.css` — wspólna warstwa dla rich text, bloga i bloków.

### Kluczowe pliki

| Plik | Rola |
|------|------|
| `client/app/globals.css` | Źródło tokenów, utilities (`store-shell`, surfaces, prose) |
| `client/components/ui/*.tsx` | shadcn primitives |
| `client/components/design-system-showcase/` | Strona dokumentacji DS |
| `client/components.json` | shadcn config (`new-york`, `cssVariables`) |

### Wygląda amatorsko / niespójnie

- **Dwa systemy przycisków**: shadcn `Button` (`rounded-md`, semantic) vs `CTASection` / `hero_banner` na inline `--btn-*` CSS vars.
- **Dryf promienia**: shadcn `Card` używa `rounded-xl`; `EmptyState` / surfaces używają `--store-card-radius` (≈ `0.5rem`).
- **Dwa domyślne motywy**: `globals.css` (prawie czarny primary OKLCH) vs aktywny motyw z DB (indygo `#4f46e5` w `ThemeSeeder`) — wygląd zależy od załadowania `ThemeStyles`.
- Swatche `accent-vivid` / `accent-vivid-foreground` w sekcji Colors showcase nie renderują widocznego koloru.
- `SectionsShowcase` demo’uje wariant `accent` zamiast `brand` / `hero` zdefiniowanych w `composition/styles.ts`.

### Brak prymitywów w DS (dziura, którą bloki łatają ad-hoc)

| Nazwa | Gdzie dziś |
|-------|------------|
| `Stack` | Wzorzec `flex flex-col gap-*` w `StackLayoutsShowcase.tsx` |
| `Alert` | Wzorzec w `AlertsShowcase.tsx` + blok `alert_banner` |
| `Prose` | Klasa CSS `.prose` w `globals.css` |
| `Surface` | Utilities `.elevated-surface`, `.glass-surface` w `globals.css` |

### Komponenty do zastąpienia / uzupełnienia gotowcami

- Dodać `Alert` jako shadcn `ui/alert.tsx` (obecnie brak).
- Ujednolicić przyciski: jeden system (shadcn `Button` + opcjonalnie wariant czytający `--btn-*` z motywu).
- Wyciągnąć `Stack`, `Surface`, `Prose` jako komponenty React (nie tylko CSS/wzorce).

---

## 2. Theme System

**Oceny: UX 7 · Visual 8 · Consistency 7**

### Mocne strony

- Pipeline: DB `Theme` → API → `build-theme-css.ts` → `ThemeStyles` wstrzykuje `:root` / `.dark`.
- Whitelist kolorów: `client/lib/theme-token-keys.ts`.
- Per-page override: `cms-dynamic-page.tsx` renderuje `ThemeStyles` gdy strona ma własny motyw.
- Fonty z motywu: `ThemeFontLoader` (Google Fonts z `font_sources`).
- Dark mode bez `next-themes`: `ThemeInit` + `ThemeToggle`, pre-hydration guard w CSS.
- `theme-showcase` wizualnie czysty — typografia z `--h*-size`, przyciski z `--btn-*`, karty, kolory.

### Kluczowe pliki

| Plik | Rola |
|------|------|
| `client/lib/build-theme-css.ts` | Mapowanie pól DB → CSS vars |
| `client/components/theme-styles.tsx` | Wstrzyknięcie CSS |
| `client/components/theme-init.tsx` | Inicjalizacja `.dark` |
| `client/components/theme-toggle.tsx` | Przełącznik motywu |
| `server/database/seeders/ThemeShowcaseSeeder.php` | Strona regresji tokenów (custom HTML) |

### Niespójne / do poprawy

- `ThemeInit` obsługuje `system`, ale `ThemeToggle` jest tylko 2-stanowy (brak UI light/dark/system).
- `theme-showcase` zbudowany na `custom_html` z inline `.ts-*` CSS — **równoległa ścieżka stylowania** zamiast realnych komponentów React (ryzyko dryfu względem `design-system-showcase`).
- Geist + Playfair ładowane w `layout.tsx` niezależnie od motywu kupca (martwy ciężar, gdy motyw nadpisuje `--font-heading` / `--font-body`).
- Domyślne fonty w `globals.css`: Inter + system-ui (generyczne), podczas gdy aktywny preset używa Space Grotesk + Inter.

### Theme Showcase vs Design System Showcase

| | Theme Showcase | Design System Showcase |
|--|----------------|------------------------|
| URL | `/theme-showcase` | `/design-system-showcase` |
| Implementacja | CMS page + `custom_html` | `DesignSystemShowcasePage.tsx` |
| Cel | Regresja tokenów motywu kupca | Regresja prymitywów i composition |
| PageRenderer | Standardowy pipeline | Special-case po slugu |

---

## 3. Composition

**Oceny: UX 7 · Visual 7 · Consistency 6**

### Mocne strony

- `client/components/composition/styles.ts` — single source of truth dla wariantów sekcji, paddingu, kontenerów i gridów.
- Konsumowane przez `section-renderer.tsx` oraz część bloków (`two_columns`, `three_columns`, `call_to_action`).
- Prymitywy: `Container`, `Section`, `Grid`, `PageHeader`, `EmptyState`, `CTASection`, `AnimateOnView`.
- Token-driven: `var(--container-max-width)`, `var(--font-heading)`, `var(--block-gap)`, itd.
- `AnimateOnView` respektuje `prefers-reduced-motion`.

### Filozofia

- Płaskie komponenty funkcyjne (nie compound components).
- Mapy klas w `styles.ts` + lokalne mapy w `CTASection` / `Grid` — **bez CVA**.
- Tylko `AnimateOnView` jest `'use client'` (framer-motion).

### Niespójne / do poprawy

- **Adopcja nierówna**: z 30 bloków tylko `two_columns` / `three_columns` używają `Grid`, a `call_to_action` deleguje do `CTASection`.
- `CTASection` **nie** komponuje `<Section>` (własny `div`) — wbrew założeniom w `composition-integration-architecture.md`.
- **Brak `Stack`** mimo że showcase pokazuje „Stack Layouts" (to tylko `flex flex-col gap-*`).
- `docs/plans/composition-integration-audit.md` twierdzi „100% nieużywane" — **nieaktualne** (blog, section-renderer i bloki już importują composition).

### Mapa adopcji (blog)

| Komponent | Używany w blogu? |
|-----------|------------------|
| `Container` | ✅ post + lista |
| `Section` | ❌ |
| `Grid` | ❌ (własny grid w liście) |
| `PageHeader` | ✅ tylko `blog-module` |
| `EmptyState` | ✅ lista (pusty stan) |
| `CTASection` | ❌ |
| `AnimateOnView` | ❌ |

---

## 4. Blog

**Oceny: UX 7 · Visual 6 · Consistency 5**

### Mocne strony

- `blog-list-client.tsx`: `Container wide` + `EmptyState`.
- `blog-post-client.tsx`: `Container as="article" narrow`.
- `blog-module.tsx`: `PageHeader` (wyśrodkowany).
- Semantyczne kolory w kartach i meta (`text-muted-foreground`, `border-border`, `bg-card`).
- Treść artykułu przez `.prose` / `.prose-lg`.

### Kluczowe pliki

| Plik | Rola |
|------|------|
| `client/components/blog-list-client.tsx` | Lista postów |
| `client/components/blog-post-client.tsx` | Widok posta |
| `client/components/page-builder/modules/blog-module.tsx` | Wejście listy z page buildera |
| `client/app/_routes/blog-post-page.tsx` | Wspólna logika trasy posta |
| `client/app/blog/loading.tsx`, `app/blog/[slug]/loading.tsx` | Skeletony |

### Wygląda amatorsko / niespójnie

- **Podwójny kontener**: `blog-module` owija `max-w-7xl` (80rem) wokół `Container wide` (96rem) → zagnieżdżone powłoki i konflikt szerokości.
- **H1 posta** `text-4xl font-bold` (hardcode) ignoruje `--h1-size` i `--font-heading` → typografia odjeżdża od motywu i od `PageHeader`.
- **Lista nie używa `<Grid>`** — własny `grid ... xl:grid-cols-4`, gap `gap-6` zamiast `--block-gap`.
- **Loading states** nie używają `Container`; surowe `bg-gray-100 dark:bg-gray-800` w skeletonie TOC.
- `blog-votes.tsx`: **inline RGB** dla stanów aktywnych zamiast tokenów.
- `blog-comments.tsx`: `border-gray-200/700` w wątku odpowiedzi; pusty stan komentarzy to zwykły tekst zamiast `EmptyState`.
- Kategoria/sort/paginacja: ręczne przełączanie klas zamiast wspólnego wzorca chip/filter.

### Komponenty do zastąpienia gotowcami

- Post: `PageHeader` (lub równoważne tokeny) zamiast inline `h1`.
- Lista: `<Grid cols={...}>` zamiast ad-hoc grid.
- Loading: `<Container narrow/wide>` zamiast `max-w-3xl` / `store-wide-shell`.
- Komentarze: `EmptyState` dla braku komentarzy; tokeny zamiast `gray-*`.

---

## 5. Page Builder (system)

**Oceny: UX 7 · Visual 6 · Consistency 6**

### Mocne strony

- `section-renderer.tsx` importuje mapy z `composition/styles.ts` — wariant, padding, layout kontenera.
- Lazy loading sekcji z placeholderem w tych samych tokenach.
- `call_to_action` → `CTASection` jako wzorzec referencyjny.
- `block-registry.tsx` — 30 bloków, dynamic import, error boundary.

### Architektura renderowania

```
PageRenderer
  ├─ slug === design-system-showcase → DesignSystemShowcasePage
  ├─ page_type === module → ModuleRenderer
  └─ SectionRenderer / SectionLazyWrapper
       └─ BlockRenderer → blockRegistry[type]
```

### Problemy systemowe

- Bloki **nie** dostają `Container` / `Section` — powłoka sekcji to obsługuje; wewnątrz bloki wymyślają layout od zera.
- **shadcn prawie nieobecny w blokach** — tylko `Skeleton` w `featured_products`; moduły (`returns_portal`, `guest_order_tracker`, `faq`) używają `Button`/`Input`.
- Powielony nagłówek sekcji `text-2xl font-bold md:text-3xl` w ~20 blokach (brak `BlockHeader`).
- Trzy wzorce CTA: `hero_banner`, `promotional_banner`, `call_to_action`.

### Problemy wizualne zaobserwowane na żywo (`/page-builder-showcase`)

- **Nakładanie tekstu** na obrazach demo (`hero_banner`, `promotional_banner`, `categories_grid`) — etykiety „showcase promo/hero" nachodzą na treść (artefakt seeda / placeholderów).
- **Nadmiar pustej przestrzeni pionowej** między sekcjami (puste hero + `padding xl`) → ciemne „dziury", słaby rytm.
- `featured_brands` / `logo_cloud`: logotypy jako blady tekst (niski kontrast).

---

## 6. Wszystkie 30 bloków

Rejestr: `client/components/page-builder/block-registry.tsx`.

### Tabela ocen i adopcji DS

| # | Blok | UX | Vis | Cons | DS tokens | composition | shadcn | Główny problem |
|--:|------|:--:|:--:|:--:|:---------:|:-----------:|:------:|----------------|
| 1 | `hero_banner` | 7 | 6 | 5 | częściowo | ❌ | ❌ | inline-style CTA, twarde `text-6xl`, overlap demo |
| 2 | `rich_text` | 8 | 7 | 8 | prose | ❌ | ❌ | OK |
| 3 | `featured_products` | 8 | 8 | 8 | ✅ | ❌ | Skeleton | ad-hoc grid |
| 4 | `categories_grid` | 6 | 6 | 6 | mix | ❌ | ❌ | nakładające etykiety demo |
| 5 | `promotional_banner` | 6 | 6 | 5 | ✅ | ❌ | ❌ | duplikuje CTA/hero |
| 6 | `newsletter_signup` | 7 | 6 | 5 | ✅ | ❌ | ❌ | surowe inputy, emoji 🎉 |
| 7 | `testimonials` | 7 | 7 | 6 | ✅ | ❌ | ❌ | `text-yellow-400`, ręczne karty |
| 8 | `image_gallery` | 7 | 7 | 7 | min. | ❌ | ❌ | OK |
| 9 | `video_embed` | 7 | 7 | 7 | min. | ❌ | ❌ | OK |
| 10 | `custom_html` | — | — | — | n/d | ❌ | ❌ | z założenia bez stylu |
| 11 | `two_columns` | 8 | 7 | 8 | prose | ✅ Grid | ❌ | fallback raw grid dla 60/40 |
| 12 | `three_columns` | 8 | 7 | 8 | prose | ✅ Grid | ❌ | OK |
| 13 | `accordion` | 6 | 6 | 5 | ✅ | ❌ | ❌ | własny accordion, glyf `▾` |
| 14 | `tabs` | 6 | 6 | 5 | ✅ | ❌ | ❌ | własny tabs mimo `ui/tabs.tsx` |
| 15 | `form_embed` | 7 | 6 | 5 | ✅ | ❌ | ❌ | surowe inputy, emoji ✅ |
| 16 | `map` | 7 | 7 | 7 | ✅ | ❌ | ❌ | OK |
| 17 | `featured_posts` | 8 | 7 | 8 | ✅ | ❌ | ❌ | solidne tokeny |
| 18 | `stats_counter` | 8 | 7 | 7 | ✅ | ❌ | ❌ | twardy `text-5xl` |
| 19 | `call_to_action` | 9 | 8 | 9 | ✅ | ✅ CTA | ❌ | **wzorzec referencyjny** |
| 20 | `pricing_table` | 7 | 7 | 5 | ✅ | ❌ | ❌ | `green-600`, `bg-white`, duplikat |
| 21 | `brands_slider` | 8 | 7 | 7 | ✅ | ❌ | ❌ | dopracowany marquee |
| 22 | `logo_cloud` | 6 | 6 | 6 | ✅ | ❌ | ❌ | near-dup `brands_slider`, blade logo |
| 23 | `countdown_timer` | 8 | 7 | 7 | ✅ | ❌ | ❌ | twarde numerały |
| 24 | `timeline` | 8 | 7 | 7 | ✅ | ❌ | ❌ | `bg-white` kropka |
| 25 | `team_members` | 8 | 8 | 8 | ✅ | ❌ | Lucide | czysty |
| 26 | `icon_list` | 7 | 6 | 6 | ✅ | ❌ | ❌ | emoji-ikony, inline color |
| 27 | `steps_process` | 8 | 7 | 8 | ✅ | ❌ | ❌ | solidny |
| 28 | `trust_badges` | 7 | 6 | 6 | ✅ | ❌ | ❌ | emoji, dubluje `icon_list` |
| 29 | `alert_banner` | 8 | 8 | 8 | ✅ | ❌ | ❌ | dobre warianty semantyczne |
| 30 | `pricing_cards` | 7 | 7 | 5 | ✅ | ❌ | ❌ | `green-600`, duplikat `pricing_table` |

### Najlepsze bloki (wzorce do kopiowania)

- `call_to_action` — delegacja do `CTASection`
- `alert_banner` — semantyczne warianty (info/success/warning/danger)
- `team_members`, `featured_products`, `featured_posts`, `steps_process`

### Najsłabsze bloki

- `accordion`, `tabs` — reinwentują shadcn
- `pricing_table` + `pricing_cards` — duplikat + surowe kolory
- `newsletter_signup`, `form_embed` — formularze poniżej jakości modułów
- `logo_cloud` — niski kontrast, near-dup `brands_slider`

### Szczegóły per blok (skrót)

| Blok | Plik | Uwagi |
|------|------|-------|
| `hero_banner` | `blocks/hero-banner.tsx` | CTA przez inline `style`; gradient `from-[var(--primary)]` |
| `rich_text` | `blocks/rich-text.tsx` | `prose dark:prose-invert` — czysty |
| `featured_products` | `blocks/featured-products.tsx` | Deleguje karty do `ProductCard` |
| `categories_grid` | `blocks/categories-grid.tsx` | Overlay `from-[var(--section-dark-bg)]/80` |
| `promotional_banner` | `blocks/promotional-banner.tsx` | `style={{ backgroundColor }}` z configu |
| `newsletter_signup` | `blocks/newsletter-signup.tsx` | Raw `<input>`/`<button>` |
| `testimonials` | `blocks/testimonials.tsx` | `text-yellow-400` na gwiazdkach |
| `two_columns` / `three_columns` | `blocks/two-columns.tsx`, `three-columns.tsx` | `<Grid>` z composition |
| `accordion` | `blocks/accordion-block.tsx` | Unicode `▾` zamiast ikony |
| `tabs` | `blocks/tabs-block.tsx` | Własna implementacja pill/boxed/underline |
| `form_embed` | `blocks/form-embed.tsx` | Token-aligned inputs, ale nie shadcn |
| `call_to_action` | `blocks/call-to-action.tsx` | Thin wrapper na `CTASection` |
| `pricing_table` / `pricing_cards` | `blocks/pricing-table.tsx`, `pricing-cards.tsx` | `text-green-600`, `elevated-surface` |
| `brands_slider` / `logo_cloud` | `blocks/brands-slider.tsx`, `logo-cloud.tsx` | Grayscale + opacity hover |
| `icon_list` / `trust_badges` | `blocks/icon-list.tsx`, `trust-badges.tsx` | Emoji mapy |

### Moduły page buildera (`client/components/page-builder/modules/`)

| Moduł | Jakość UI | Uwagi |
|-------|-----------|-------|
| `faq-client-module` | Wysoka | shadcn `Input`, Lucide, framer-motion |
| `guest-order-tracker-module` | Wysoka | shadcn `Button` + `Input` |
| `returns-portal-module` | Wysoka | shadcn form controls |
| `blog-module` | Średnia | `PageHeader` OK, podwójny kontener |
| `storefront-listing-modules` | Średnia | ad-hoc `text-4xl`, `store-wide-shell` |

---

## 7. Zbiorcze listy problemów

### Miejsca wyglądające amatorsko

- Emoji jako ikony i statusy: `🎉` (newsletter), `✅` (form), emoji w `icon_list` / `trust_badges`, emoji-oko w blog view tracker.
- Unicode `▾` zamiast ikony w accordion.
- Surowe kolory poza tokenami: `text-yellow-400`, `text-green-600`, `bg-white`, `bg-gray-100/800`, inline RGB (`blog-votes`).
- Twarda skala typografii (`text-4xl/5xl/6xl`) omijająca `--h*-size` w hero, statach, countdownie, poście bloga.
- Nakładający się tekst na obrazach demo i dziury z pustej przestrzeni między sekcjami.
- Blade logotypy w `logo_cloud` / `featured_brands`.

### Miejsca niespójne

- Duplikaty bloków: `pricing_table` × `pricing_cards`, `brands_slider` × `logo_cloud`, `icon_list` × `trust_badges`, trzy wzorce CTA.
- Powielony nagłówek `text-2xl font-bold md:text-3xl` w ~20 blokach.
- shadcn w modułach, surowe inputy w blokach formularzowych.
- Promień karty: `rounded-xl` vs `--store-card-radius`.
- Blog: podwójny kontener + konflikt 80rem / 96rem.
- Dwa systemy przycisków (shadcn vs `--btn-*` inline).

### Miejsca nie wykorzystujące Design System

- Bloki budujące własne gridy zamiast `<Grid>`.
- Brak `PageHeader` / `BlockHeader` w blokach.
- Brak `Button` / `Card` / `Badge` / `Input` / `Tabs` z `ui/` w warstwie bloków.
- Post bloga ignorujący tokeny nagłówków.
- Loading states bloga bez `Container`.

### Komponenty do zastąpienia gotowcami

| Obecnie (własne) | Zastąp |
|------------------|--------|
| `accordion-block` | shadcn **Accordion** (Radix) |
| `tabs-block` | shadcn **Tabs** (`ui/tabs.tsx` już istnieje) |
| inputy w `form_embed` / `newsletter_signup` | shadcn **Input** / **Textarea** / **Label** / **Button** |
| emoji w `icon_list` / `trust_badges` / statusach | **lucide-react** |
| CTA w `hero_banner` / `promotional_banner` | **CTASection** + shadcn **Button** |
| `pricing_table` + `pricing_cards` | jeden blok na shadcn **Card** |
| gwiazdki / karty w `testimonials` | lucide **Star** + **Card** |
| ręczne karty produktów / postów | wspólny wzorzec na **Card** |

---

## 8. Roadmapa UI Improvements

### Faza 0 — Higiena (szybkie, niskie ryzyko, ~1–2 dni)

1. Wytępić surowe kolory → tokeny: `yellow-400` → accent gwiazdek, `green-600` → `--store-accent-mint` / success, `bg-white` / `gray-*` → `bg-card` / `bg-muted`, inline RGB w `blog-votes`.
2. Zamienić emoji-ikony, statusy i `▾` na `lucide-react`.
3. Naprawić blog: usunąć podwójny kontener w `blog-module`; `loading.tsx` na `Container`.
4. Zaktualizować `composition-integration-audit.md` (composition jest częściowo używane).

**Pliki:** `blog-module.tsx`, `blog-post-client.tsx`, `blog/loading.tsx`, `blog-votes.tsx`, `blog-comments.tsx`, bloki z emoji/kolorami surowymi.

### Faza 1 — Ujednolicenie prymitywów (~3–5 dni)

5. Dodać brakujące komponenty DS: `Stack`, `Alert` (shadcn), `Surface`, `Prose` (jako komponent) — pokazać w design-system-showcase.
6. Wprowadzić `BlockHeader` (eyebrow + h2 + opis na `--h*-size` / `--font-heading`) i podmienić ~20 ręcznych nagłówków w blokach.
7. Post bloga: tytuł przez `PageHeader` / tokeny; lista przez `<Grid>`.
8. Ujednolicić przyciski: jeden system (shadcn `Button` z wariantem tokenowym), wycofać inline `--btn-*` w hero/CTA tam, gdzie to możliwe bez regresji motywu.

**Pliki:** `client/components/composition/` (nowe), `client/components/ui/alert.tsx`, `design-system-showcase/groups/`, `blog-*`, `page-builder/blocks/*`.

### Faza 2 — Refactor bloków na gotowce (~5–8 dni)

9. `accordion` → shadcn Accordion; `tabs` → `ui/tabs.tsx`.
10. `form_embed` / `newsletter_signup` → shadcn pola (parytet z modułami).
11. Skonsolidować duplikaty: jeden blok pricing, jeden logo, scalić `icon_list` / `trust_badges`; CTA hero/promo → `CTASection`.
12. `testimonials` / karty produktów / postów → `Card`.

**Pliki:** `accordion-block.tsx`, `tabs-block.tsx`, `form-embed.tsx`, `newsletter-signup.tsx`, `pricing-*.tsx`, `brands-slider.tsx`, `logo-cloud.tsx`, `hero-banner.tsx`, `promotional-banner.tsx`, `testimonials.tsx`.

### Faza 3 — Polish wizualny (~2–4 dni)

13. Rytm pionowy: zrewidować `padding xl` i puste hero (mniej ciemnych dziur na showcase).
14. Poprawić dane demo (seeder): obrazy bez wtopionego tekstu, mocniejsze logotypy → usunąć efekt „overlap".
15. `ThemeToggle` 3-stanowy (light/dark/system); naprawić swatche `accent-vivid`; ujednolicić promień (`Card` ↔ `--store-card-radius`).
16. A11y / visual QA przez `/design-system-showcase` jako regresja po każdej zmianie.

**Pliki:** `PageBuilderShowcaseSeeder.php`, `ThemeShowcaseSeeder.php`, `theme-toggle.tsx`, `globals.css`, `ui/card.tsx`, sekcje showcase.

### Sekwencja zależności

```
Faza 0 (higiena kolorów/ikon/blog shell)
    ↓
Faza 1 (prymitywy BlockHeader, Stack, Alert — muszą istnieć przed refaktorem bloków)
    ↓
Faza 2 (bloki na shadcn + konsolidacja duplikatów)
    ↓
Faza 3 (polish + seed + theme toggle)
```

**Wzorce referencyjne:** `call_to_action` + `alert_banner` + moduły z shadcn (`faq`, `returns_portal`, `guest_order_tracker`).

---

## 9. Kryteria „done" dla roadmapy

- [ ] Zero użyć `text-yellow-400`, `text-green-600`, `bg-gray-*` w `client/components/page-builder/blocks/` i blogu (z wyjątkiem udokumentowanych).
- [ ] Wszystkie bloki z nagłówkiem sekcji używają `BlockHeader` lub `PageHeader`.
- [ ] `accordion` i `tabs` oparte o shadcn/Radix.
- [ ] `form_embed` i `newsletter_signup` używają `ui/Input` + `ui/Button`.
- [ ] Jeden blok pricing (drugi deprecated lub alias).
- [ ] Blog: jeden poziom `Container`, H1 z tokenów motywu.
- [ ] `/page-builder-showcase` bez nakładających się etykiet na obrazach demo.
- [ ] `make check` przechodzi po zmianach w `client/`.

---

## 10. Uwagi metodologiczne

- Audyt przeprowadzono na żywo w trybie **dark** (domyślny lub zapisany w `localStorage`). Oceny Visual mogą różnić się w light mode — zalecana powtórka w obu trybach przed Fazą 3.
- `composition-integration-audit.md` (2026-06-16) opisuje stan sprzed integracji — nie używać jako jedynego źródła prawdy o adopcji composition.
- Ten audyt uzupełnia (nie zastępuje) `page-builder-audit-and-roadmap.md`, który dotyczy warstw runtime contract / data strategy / product context.
