# Page Builder — Audyt architektoniczny i system wdrożeniowy

Data: 2026-06-15
Rewizja: 2 (korekta architektoniczna — Principal Engineer review)

## Cel dokumentu

Audyt architektoniczny istniejącego Page Buildera CMS (storefront ecommerce) wraz z **korektą błędnych założeń**, definicją **brakujących warstw systemowych** oraz roadmapą przekształconą w **spójny system wdrożeniowy (Layer 0–6)**.

**Ten dokument nie implementuje kodu** — jest kontraktem architektonicznym i źródłem prawdy przy planowaniu. Nie zmienia struktury plików repozytorium; opisuje docelowy model warstw, które mają zostać wprowadzone addytywnie.

**Priorytet:** storefront ecommerce (landing, kategorie, produkty, kolekcje, marketing, blog). Strony osobiste / portfolio — poza zakresem rozwoju.

**Powiązane dokumenty:**

- `docs/plans/design-system-theme-page-builder-final-plan.md` — architektura DS + Theme System
- `docs/page-builder.md` — developer guide (jak dodać blok)
- `.ai/context.md` — deep context page buildera

---

## Część I — Diagnoza: trzy problemy krytyczne

Poprzednia wersja audytu (rewizja 1) traktowała braki jako **listę brakujących bloków i drobnych driftów**. To była błędna rama. Braki funkcjonalne są **objawem**, nie chorobą. Choroba jest architektoniczna: w systemie nie istnieją trzy warstwy fundamentalne, bez których każdy nowy blok pogłębia dług.

### Problem 1 — Brak Block Runtime Contract Layer

Definicja bloku jest dziś **rozproszona po 8 miejscach** (`PageBlockTypeEnum`, `config/blocks.php`, `client/types/api.ts`, `block-renderer.tsx`, komponent renderera, `canvas-block-preview.tsx`, walidatory, testy) i **nigdzie nie jest spięta w jeden kontrakt**. Skutek: drift schema ↔ render nie jest błędem przypadkowym, lecz **stanem domyślnym** — `featured_products` czyta `columns`, a schema deklaruje `items_per_row`, bo nic nie wymusza zgodności. System nie ma pojęcia "kontraktu bloku" jako bytu pierwszej klasy.

### Problem 2 — Brak unified data-fetch strategy per block

Każdy blok pobiera dane **ad hoc i niespójnie**. `featured_products` w trybie `manual` używa relacji hydratowanych po stronie serwera (strategia "none"/SSR), a w trybie `featured` robi `useEffect` + `apiGetPage` po stronie klienta (strategia "client") — **w obrębie jednego bloku, bez żadnej deklaracji**. Nie istnieje pojęcie strategii danych jako pola kontraktu. Konsekwencje: nieprzewidywalny LCP, brak SEO dla treści ładowanej klientem, brak zdefiniowanych granic cache, duplikacja logiki fetchowania w każdym komponencie.

### Problem 3 — Brak globalnego ecommerce context (Product Intelligence Layer)

Bloki nie mają dostępu do **runtime'owego kontekstu strony** (jaki produkt/kategoria/kolekcja, stan koszyka, segment użytkownika). Każdy blok, który potrzebuje "bieżącego produktu" (recommendations, spotlight, reviews, recently viewed), musiałby dziś dostać go przez ręcznie wpiętą relację lub własny fetch. To prowadzi do **duplikacji logiki produktowej** i uniemożliwia personalizację oraz spójne cross-sell/upsell.

> **Wniosek Principal Engineera:** nie wolno dodawać kolejnych 15 bloków na obecny fundament. Najpierw trzeba postawić trzy brakujące warstwy (Contract, Data Strategy, Context) + dwie wspierające (Query Abstraction, Layout Constraints). Dopiero one zamieniają "kolekcję komponentów React" w **silnik bloków**.

---

## Część II — Nowe warstwy architektoniczne (A–E)

### A. Block Runtime Contract Layer (NOWY CORE SYSTEM)

Wprowadza **jeden, formalny kontrakt na typ bloku** — pojedyncze źródło prawdy, z którego derywowane są wszystkie pozostałe artefakty (TS, walidacja, renderer, preview). Kontrakt jest definiowany po stronie PHP (`config/blocks.php` pozostaje fizycznym nośnikiem) i **eksportowany** do warstwy klienta, zamiast być duplikowany ręcznie.

#### Każdy blok MUSI mieć (sześć członów kontraktu)

| Człon | Nośnik (dziś) | Nośnik (docelowo) |
|-------|---------------|-------------------|
| **Schema definition** (PHP) | `config/blocks.php → schema` | bez zmian (source of truth) |
| **TypeScript type** | ręcznie w `client/types/api.ts` + `*.types.ts` | **generowany** z eksportu schematu (artisan → JSON Schema → typy) |
| **Renderer mapping** | `switch` w `block-renderer.tsx` | **rejestr** (`BlockRegistry`) zamiast `switch`; brak typu w rejestrze = błąd buildu |
| **Validation contract** | `BlockConfigurationValidator` | bez zmian, ale zasilany tym samym schematem |
| **Allowed relations contract** | `allowed_relations` w `blocks.php` | bez zmian (już istnieje, dobrze) |
| **Data strategy definition** | ⛔ brak | **NOWE pole** `data_strategy` w schemacie (patrz warstwa B) |

#### Lifecycle bloku (docelowy)

```
1. DEFINICJA      blocks.php → block contract (schema + relations + data_strategy + allowed_children)
2. EKSPORT        artisan blocks:export → artefakt JSON Schema (CI gate)
3. DERYWACJA      JSON Schema → TS types + renderer registry keys + walidatory
4. AUTHORING      Admin DynamicBlockForm renderuje formularz ze schematu (człowiek lub AI)
5. WALIDACJA      BlockConfigurationValidator (config) + PageBuilderSnapshotValidator (drzewo/relacje/depth)
6. PERSYSTENCJA   PageBuilderSyncService → builder_snapshot + page_sections/page_blocks/block_relations
7. RESOLUTION     warstwa danych (B+D) rozwiązuje dane wg data_strategy (SSR/CSR/cache)
8. RENDER         page-renderer → section-renderer → BlockRegistry[type] (zamiast switch)
9. RUNTIME STATE  blok konsumuje ProductContext (C) + rozwiązane dane; nigdy nie query DB bezpośrednio
```

#### Jak walidowany jest runtime state

- **Build-time:** test kontraktowy iteruje po `PageBlockTypeEnum` i sprawdza, że dla każdego typu istnieje: wpis w `blocks.php`, klucz w `BlockRegistry`, branch w preview, typ TS. Brak któregokolwiek = czerwony build (zamiast cichego "Unknown block type" w runtime).
- **Authoring-time:** `BlockConfigurationValidator` waliduje config względem schematu; `PageBuilderSnapshotValidator` waliduje relacje, `allowed_children` i max-depth.
- **Render-time:** każdy blok opakowany w `error-boundary` (już istnieje); brak danych → zdefiniowany empty/skeleton state wynikający z `data_strategy`, nie pusty fragment.

#### Jak unika się driftu schema ↔ render

1. **Renderer registry, nie switch** — typ bez rejestracji nie kompiluje się.
2. **Typy generowane, nie pisane** — TS pochodzi z eksportu schematu, więc render nie może czytać pola, którego nie ma w schemacie.
3. **CI gate kontraktu** — test porównuje pola czytane w rendererze z polami zadeklarowanymi w schemacie (lint/snapshot). To zamyka klasę błędów typu `featured_products.columns`.

---

### B. Data Fetch Strategy Layer (KRYTYCZNE)

Każdy blok deklaruje w kontrakcie **dokładnie jedną** strategię danych. Strategia jest atrybutem typu bloku (z możliwym per-instancję override tam, gdzie ma to sens, np. listing).

| Strategia | Kiedy dane są pobierane | Gdzie | Cache boundary | Wpływ LCP / SEO |
|-----------|-------------------------|-------|----------------|------------------|
| `none` (static) | brak — dane są w `configuration`/relacjach snapshotu | render SSR | cache strony (full) | Najlepszy LCP, pełne SEO |
| `server` (SSR) | w czasie renderu strony (RSC / API hydration) | server component / prefetch | cache strony + `revalidate` | Dobry LCP, pełne SEO |
| `client` (CSR) | po hydratacji, w przeglądarce | `use client` + fetch | brak (lub SWR client) | Gorszy LCP, **brak SEO** treści |
| `hybrid` (SSR+CSR) | SSR pierwszy paint + klient dohydratowuje interakcje | RSC shell + client island | cache shell, klient świeży | Dobry LCP, SEO na shellu |
| `cached` (edge) | SSR z agresywnym cache na brzegu | server + edge/runtime cache + tag invalidation | edge, invalidacja po tagu | Najlepszy LCP dla danych dynamicznych |

#### Zasady warstwy

1. **Treść istotna dla SEO i LCP (above-the-fold) NIE może być `client`.** `hero_banner`, `featured_products` na homepage, `featured_posts`, `categories_grid` → `none` lub `server`/`cached`.
2. **Granica cache jest deklarowana, nie domyślna.** Każda strategia `server`/`cached` deklaruje `revalidate` i `cache_tags` (np. `product:{id}`, `category:{id}`), aby invalidacja po zmianie w adminie była precyzyjna.
3. **`client` dozwolone tylko dla treści zależnej od przeglądarki/użytkownika** (recently viewed z localStorage, koszyk, treść spersonalizowana below-the-fold) — i zawsze z empty/skeleton state.
4. **Mapowanie na obecny stack:** `server` → `serverFetch()` / RSC (`lib/server-fetch.ts`), `client` → `lib/axios.ts` + SWR, `cached` → Next cache + tagi.

#### Korekta stanu obecnego (przykład)

`featured_products` łamie tę warstwę: ten sam blok jest raz `none` (manual, SSR relacje), raz `client` (featured, `useEffect`). Docelowo: blok ma jedną strategię `server` (oba tryby rozwiązywane na serwerze przez `ProductQueryService`), a `client` zostaje wyłącznie dla bloków jawnie user-scoped.

---

### C. Product Context Layer (ECOMMERCE CORE)

Globalny obiekt runtime dostarczany **raz na stronę** (server-side, z hydratacją wybranych pól na klienta), z którego bloki **konsumują** kontekst zamiast go duplikować.

```
ProductContext {
  currentProduct?:    ProductSummary | null   // PDP / strona produktu
  currentCategory?:   CategorySummary | null  // strona/landing kategorii
  currentCollection?: CollectionSummary | null// strona kolekcji
  cartState:          CartSnapshot             // liczba pozycji, wartość, waluta (klient)
  userSegment:        UserSegment              // guest|logged_in|... (future: geo, cart_value)
}
```

#### Jak bloki konsumują context

- **Dostarczanie:** `PageRenderer` (server) buduje kontekst z route + API i przekazuje go w dół. Pola statyczne (`currentProduct`, `currentCategory`) idą SSR; pola dynamiczne (`cartState`, `userSegment`) hydratowane przez provider klienta (`ProductContextProvider`, React Context — `use(ProductContext)`).
- **Konsumpcja:** blok deklaruje w kontrakcie `context_dependencies` (np. `['currentProduct']`). Renderer wstrzykuje je; blok nie zna źródła (DI). Blok, który deklaruje zależność, a kontekst jest pusty → renderuje empty state lub jest pomijany (zależnie od kontraktu).
- **Brak fan-outu zapytań:** kontekst pobiera `currentProduct` raz; pięć bloków produktowych na PDP korzysta z tego samego obiektu zamiast pięciu fetchy.

#### Jak unika się duplikacji logicznej

Dziś `recommendations`, `spotlight`, `recently viewed`, `listing` musiałyby każdy z osobna ustalać "o jaki produkt chodzi" i osobno fetchować. Z `ProductContext` + `ProductQueryService` (warstwa D):

- `currentProduct` jest **jednym** źródłem dla cross-sell/upsell/related.
- Reguły rekomendacji żyją w serwisie, nie w bloku → ta sama logika dla wszystkich bloków produktowych.

#### Wpływ na personalizację

`userSegment` jest punktem zaczepienia dla Layer 6 (segmentacja, A/B, targeting behawioralny) bez przepisywania bloków — blok już konsumuje segment z kontekstu, więc personalizacja jest zmianą **danych kontekstu**, nie kodu bloków.

---

### D. Block Data Query Abstraction Layer

Wprowadza **`ProductQueryService` / `ContentQueryService`** jako jedyną drogę bloków do danych domenowych.

#### Zasada żelazna

> **Blok NIE może bezpośrednio query DB ani składać ad-hoc URL-i API.** Blok deklaruje **query spec** (intencję), warstwa abstrakcji ją wykonuje.

```
Blok → QuerySpec (deklaratywny: source, filters, sort, limit, context_ref)
        → ProductQueryService / ContentQueryService
            → (Eloquent / Scout / cache)  [server-side]
            → znormalizowany wynik (API Resource)
```

| Serwis | Odpowiedzialność | Zasila bloki |
|--------|------------------|--------------|
| `ProductQueryService` | featured, by category/collection, bestsellers, on_sale, newest, recommendations, recently-viewed batch | `featured_products`, `product_listing`, `product_recommendations`, `recently_viewed_products`, `product_spotlight` |
| `ContentQueryService` | wpisy bloga (latest/category/related), TOC source, autorzy | `featured_posts`, `blog_post_list`, `related_posts`, `table_of_contents`, `author_bio` |

#### Korzyści

- Eliminacja N+1 i duplikacji fetchy (eager loading w jednym miejscu).
- Spójna strategia cache i tagów (współpraca z warstwą B).
- Reguły biznesowe (np. „bestseller” = ostatnie 30 dni) centralne, testowalne, niezależne od UI.
- Bloki stają się **czystymi konsumentami** — łatwe do testów jednostkowych z mockowanym wynikiem spec.

---

### E. Allowed Children / Layout Constraints System

Dla bloków layoutowych (kolumny, mosaic, przyszłe kontenery) wprowadza **formalny system ograniczeń drzewa**, żeby zagnieżdżanie nie zamieniło CMS w free-form chaos.

| Element | Opis |
|---------|------|
| `allowed_children` map | Per typ-kontener: lista typów bloków dozwolonych jako dzieci (np. `two_columns` → `[rich_text, image_gallery, trust_badges, icon_list, call_to_action]`). Lista **allowlist**, nie blocklist. |
| Constraint validation | `PageBuilderSnapshotValidator` odrzuca dziecko spoza `allowed_children` rodzica oraz relacje niedozwolone w kontekście dziecka. |
| Max-depth enforcement | Twardy limit głębokości drzewa (rekomendacja: **max 1 poziom zagnieżdżenia** w fazie 1; kontener nie może zawierać kontenera). Walidator liczy głębokość przy zapisie snapshotu. |

#### Dlaczego allowlist + max-depth

- **Stabilność renderu:** ograniczony zbiór kombinacji = przewidywalny CSS/layout, brak „blok w bloku w bloku”.
- **Spójność DS:** dziecko zawsze renderowane w znanym kontekście kolumny → tokeny i spacing pozostają poprawne.
- **Bezpieczeństwo wydajności:** brak rekurencyjnej eksplozji bloków, brak nieograniczonego fan-outu danych w głąb drzewa.

---

## Część III — Nowa definicja „dobrego bloku”

Standard akceptacji. Blok jest **valid** wyłącznie, gdy spełnia komplet:

> **A valid block MUST have:**
> 1. **explicit schema** — pełna definicja pól w `config/blocks.php` (źródło prawdy, bez pól czytanych „spoza schematu”).
> 2. **explicit renderer contract** — zarejestrowany w `BlockRegistry`; typ TS derywowany ze schematu; preview w adminie.
> 3. **defined data strategy** — dokładnie jedna z: `none | server | client | hybrid | cached`, z zadeklarowaną granicą cache, jeśli dotyczy.
> 4. **optional context dependencies** — jawna lista (`context_dependencies`), jeśli blok korzysta z `ProductContext`.
> 5. **allowed children rules** — jeśli to blok layoutowy: `allowed_children` + udział w max-depth.
> 6. **validation rules (server + client)** — walidacja configu (server) i guard renderu/empty-state (client).

Blok, który nie spełnia kompletu, **nie wchodzi do rejestru** — to kryterium Definition of Done dla każdego nowego i refaktorowanego bloku.

---

## Część IV — Architektura (stan obecny)

### Hierarchia danych

```
Page (page_type = 'blocks')
 └── PageSection[]          — kontener (layout, variant, settings)
      └── PageBlock[]       — jednostka treści (type + configuration + relations)
           └── BlockRelation[]  — media / produkty / formularze / wpisy bloga
```

Równoległy system `page_type = 'module'` obsługuje pełnostronicowe moduły (blog listing, product listing, store locator itd.) — **nie jest częścią rejestru bloków**, ale współistnieje w `PageRenderer`.

### Warstwy kodu

| Warstwa | Ścieżka | Rola |
|---------|---------|------|
| Rejestr bloków + schematy | `server/config/blocks.php` | Single source of truth (30 typów) |
| Enum | `server/app/Enums/PageBlockTypeEnum.php` | Wartości DB |
| Walidacja | `server/app/Services/PageBuilder/BlockConfigurationValidator.php`, `PageBuilderSnapshotValidator.php` | Schema + sanityzacja HTML/CSS |
| Sync | `server/app/Services/PageBuilderSyncService.php` | Transakcyjny zapis snapshot ↔ tabele |
| Admin UI | `server/resources/js/features/page-builder/` | Schema-driven `DynamicBlockForm`, canvas preview |
| Storefront | `client/components/page-builder/` | `PageRenderer → SectionRenderer → BlockRenderer` |
| Typy API | `client/types/api.ts` | `BlockType`, `PageBlock`, `PageSection` |

### Sekcje (kontenery)

Zdefiniowane w `server/config/cms/sections.php`:

| Typ | Layouty | Warianty |
|-----|---------|----------|
| `standard` | contained, full-width, flush | light, dark, muted, brand |
| `hero` | full-width, contained | centered, left-aligned, split |
| `banner` | full-width, contained | solid, gradient, outlined |
| `split` | 50-50, 60-40, 40-60, 70-30 | — |

Ustawienia sekcji (`section.settings` JSON): padding, animation (scroll), lazy_load, min_height.

### Design System (storefront)

- Tokeny CSS: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--muted`, `--container-max-width`, `--section-padding-y` itd.
- Injekcja z motywu: `client/components/theme-styles.tsx` ← `/api/v1/settings/public`
- `SectionRenderer` używa tokenów; część bloków nadal przyjmuje surowe kolory hex w konfiguracji.

### Legenda zgodności z DS

| Symbol | Znaczenie |
|--------|-----------|
| ✅ | Tokeny DS + współdzielone komponenty storefrontu |
| ⚠️ | Częściowa zgodność (hex colors, drift schema↔render, zewnętrzne embedy) |
| ⛔ | Celowo poza DS (`custom_html`) |

### Mechanizmy globalne (nie per-blok)

- Reusable blocks (`reusable_blocks` + `reusable_block_id` na `page_blocks`)
- Global slots (`global_slots` → `SlotRenderer` na storefront)
- Wersjonowanie (`page_versions` + `expected_version` przy zapisie)
- Autosave (debounced PUT)
- Signed preview iframe (desktop / tablet / mobile)
- `_custom_id`, `_custom_classes`, `_custom_css`, `_animation` na bloku (poza schematem — advanced)
- Walidacja relacji wg `allowed_relations` w `config/blocks.php`

### Znane problemy infrastrukturalne

1. **`section_presets.php`** — nieaktualne klucze konfiguracji (`cta`, `heading` zamiast `cta_text`/`title`). Presety nie działają poprawnie po dodaniu sekcji z biblioteki.
2. **Drift schema ↔ render** — `featured_products` (`columns` w render vs `items_per_row` w schema), `pricing_cards` (render oczekuje `plans[]`, schema ich nie ma). **Objaw braku warstwy A.**
3. **Duplikacja pricing** — `pricing_table` i `pricing_cards` pokrywają ten sam use case.
4. **Brak warstwy danych** — bloki fetchują ad-hoc (`featured_products` `useEffect` + `apiGetPage`). **Objaw braku warstw B i D.**

---

## Część V — Raporty bloków (30)

> Adnotacje `Data strategy` i `Context deps` poniżej to **stan docelowy** wg warstw B i C (dziś żaden blok ich nie deklaruje formalnie). Macierz zbiorcza — sekcja V.7.

### 5.1 Layout

#### `hero_banner` — Hero Banner

| Pole | Wartość |
|------|---------|
| **Kategoria** | layout |
| **Przeznaczenie** | Pełnoszerokościowy hero: nagłówek, podtytuł, do 2 CTA, tło image/video |
| **Konfiguracja** | `title`, `subtitle`, `cta_text/url/style`, `cta2_*`, `text_alignment`, `overlay_opacity`, `min_height` |
| **Relacje** | `background` (image/video), `overlay_icon` |
| **Data strategy (docelowo)** | `none` (above-the-fold — krytyczne dla LCP, nigdy `client`) |
| **Ograniczenia** | Jeden układ; brak slidera; brak wariantów split; video bez poster/fallback |
| **DS** | ✅ |
| **Use case** | Homepage, landing, kolekcje, kampanie |

#### `two_columns` — Two Columns

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Dwie kolumny RTE + opcjonalne obrazy |
| **Konfiguracja** | `left_content`, `right_content` (richtext), `ratio`, `vertical_alignment`, `reverse_on_mobile` |
| **Relacje** | `left_image`, `right_image` |
| **Layout block** | TAK — kandydat do `allowed_children` (warstwa E) |
| **Data strategy** | `none` |
| **Ograniczenia** | Brak zagnieżdżania bloków w kolumnach — tylko RTE (patrz Layer 4) |
| **DS** | ✅ |

#### `three_columns` — Three Columns

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Trzy kolumny z tytułem + RTE |
| **Konfiguracja** | `column_1..3_title/content`, `vertical_alignment` |
| **Relacje** | `column_1_image` … `column_3_image` |
| **Layout block** | TAK — `allowed_children` |
| **Data strategy** | `none` |
| **Ograniczenia** | Brak `reverse_on_mobile`; brak zagnieżdżania bloków |
| **DS** | ✅ |

#### `alert_banner` — Alert Banner

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Pasek ogłoszeń (dismissable) |
| **Konfiguracja** | `message`, `link`, `link_label`, `variant`, `dismissable` |
| **Data strategy** | `none` |
| **Ograniczenia** | Brak harmonogramu widoczności; brak sticky/top-bar slot integration |
| **DS** | ✅ |
| **Use case** | Flash sale, darmowa dostawa, info o zwrotach |

### 5.2 Content

#### `rich_text` — Rich Text

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | WYSIWYG treść (opisy, regulaminy, copy) |
| **Konfiguracja** | `content` (richtext full), `max_width` |
| **Data strategy** | `none` |
| **DS** | ✅ |

#### `accordion` — Accordion / FAQ

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | FAQ / pytania i odpowiedzi |
| **Konfiguracja** | `title`, `allow_multiple_open`, `items[]` (title, content textarea) |
| **Data strategy** | `none` |
| **Ograniczenia** | Odpowiedzi bez RTE; **brak FAQ Schema.org** (luka SEO semantic, patrz korekta 3.2 / Layer 5); brak relacji do modelu `Faq` |
| **DS** | ✅ |

#### `tabs` — Tabbed Content

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Treść w zakładkach (opis / specyfikacja / opinie) |
| **Konfiguracja** | `tabs[]` (title, content richtext) |
| **Data strategy** | `none` |
| **Ograniczenia** | Brak deep-link do zakładki; brak ikon; brak orientacji pionowej |
| **DS** | ✅ |

#### `map` — Map

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Mapa z jedną lokalizacją |
| **Konfiguracja** | `store_id`, `lat`, `lng`, `title`, `zoom`, `height` |
| **Data strategy** | `client` (embed zewnętrzny — uzasadnione) |
| **Ograniczenia** | Jeden pin; moduł `store_locator` lepszy dla wielu |
| **DS** | ⚠️ (embed zewnętrzny) |
| **Priorytet** | Niski |

#### `featured_posts` — Featured Posts

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Wpisy bloga (manual / latest / category) |
| **Konfiguracja** | `source`, `max_items`, `columns`, `display_mode`, toggles excerpt/author/date/category/read_time, `cta_text/url` |
| **Relacje** | `posts`, `category_filter` |
| **Data strategy (docelowo)** | `server` przez `ContentQueryService` (dziś: manual=relacje SSR, latest/category=brak jednolitej ścieżki) |
| **Ograniczenia** | **Brak unified content query layer** (korekta 3.2); brak SEO semantic (schema `ItemList`/author graph); `carousel` wymaga weryfikacji |
| **DS** | ✅ |

#### `timeline` — Timeline

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Oś czasu / historia marki |
| **Konfiguracja** | `layout`, `items[]` (date, title, description, icon) |
| **Data strategy** | `none` |
| **Priorytet** | Niski (strony „o nas") |

#### `team_members` — Team Members

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Karty zespołu |
| **Konfiguracja** | `columns`, `members[]` (name, role, bio, photo_url, social) |
| **Data strategy** | `none` |
| **Ograniczenia** | `photo_url` jako URL — brak MediaLibrary / responsive images |
| **DS** | ⚠️ |
| **Priorytet** | Bardzo niski |

#### `icon_list` — Icon List / Features

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Lista benefitów (dostawa, jakość, gwarancja) |
| **Konfiguracja** | `columns`, `style`, `icon_color` (hex), `items[]` |
| **Data strategy** | `none` |
| **Layout child** | kandydat na dziecko `two/three_columns` |
| **Ograniczenia** | Ikony jako string lucide; `icon_color` hex łamie theming |
| **DS** | ⚠️ |
| **Use case** | Homepage, landing, PDP (USP) |

#### `steps_process` — Steps / How It Works

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Kroki procesu (zakup, dostawa, zwrot) |
| **Konfiguracja** | `layout`, `steps[]` |
| **Data strategy** | `none` |
| **DS** | ✅ |

### 5.3 Ecommerce

#### `featured_products` — Featured Products

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Siatka / lista produktów (manual lub featured) |
| **Konfiguracja (schema)** | `filter_mode`, `title`, `display_mode`, `items_per_row`, `max_items`, `show_price`, `show_add_to_cart`, `show_badges` |
| **Konfiguracja (render)** | Czyta `columns`, `view_all_url`, `view_all_label`, `subtitle` — **nie ma ich w schemacie PHP** |
| **Relacje** | `products`, `category_filter` |
| **Data strategy (dziś)** | **NIESPÓJNA**: manual → `none` (relacje SSR); featured → `client` (`useEffect` + `apiGetPage`) |
| **Data strategy (docelowo)** | `server` jednolicie, przez `ProductQueryService` |
| **Context deps (docelowo)** | opcjonalnie `currentCategory`/`currentCollection` (filtr kontekstowy) |
| **Ograniczenia** | **Drift schema↔render** (objaw braku warstwy A); **brak query abstraction** (D); **brak product context DI** (C); `carousel`/`list` niezaimplementowane; `items_per_row` ignorowany; brak sortowania (nowości, cena, bestsellery) |
| **DS** | ⚠️ |
| **Use case** | Homepage, kategoria, kolekcja, landing |

#### `categories_grid` — Categories Grid

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Siatka kategorii produktów |
| **Konfiguracja** | `title`, `columns`, `show_labels`, `style` (square/circle/wide) |
| **Relacje** | `categories` |
| **Data strategy (docelowo)** | `server` (`ProductQueryService` — top-level + licznik) |
| **Ograniczenia** | Brak auto-źródła (top-level); brak licznika produktów |
| **DS** | ✅ |

#### `brands_slider` — Brands Slider

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Karuzela logotypów marek z katalogu |
| **Konfiguracja** | `source` (all/manual), `speed`, `logo_height`, `grayscale` |
| **Relacje** | `brands` |
| **Data strategy (docelowo)** | `server` (all) / `none` (manual) |
| **DS** | ✅ |

### 5.4 Marketing / konwersja

#### `promotional_banner` — Promotional Banner

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Baner promocyjny / wyprzedaż |
| **Konfiguracja** | `title`, `subtitle`, `badge_text`, `link_*`, `background_color`, `text_color` (hex) |
| **Relacje** | `background`, `link_product`, `link_category` |
| **Data strategy** | `none` |
| **Ograniczenia** | Surowe kolory hex zamiast tokenów DS |
| **DS** | ⚠️ |

#### `call_to_action` — Call to Action

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Sekcja CTA z 2 przyciskami |
| **Konfiguracja** | `title`, `subtitle`, `alignment`, `style`, `primary_*`, `secondary_*`, `badge_text` |
| **Relacje** | `background` |
| **Data strategy** | `none` |
| **DS** | ✅ |

#### `newsletter_signup` — Newsletter Signup

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Formularz zapisu do newslettera |
| **Konfiguracja** | `title`, `description`, `button_text`, `placeholder_text`, `success_message`, `background_color` |
| **Data strategy** | `client` (submit) / `none` (render) → `hybrid` |
| **Ograniczenia** | Hex color; brak GDPR consent w schemacie; moduł `newsletter_preferences` osobno |
| **DS** | ⚠️ |

#### `countdown_timer` — Countdown Timer

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Licznik do daty (flash sale) |
| **Konfiguracja** | `target_date` (ISO string), `show_labels`, `expired_message`, `cta_*`, `style` |
| **Data strategy** | `none` (render) + tick na kliencie |
| **Ograniczenia** | Brak date pickera w adminie; brak TZ; brak powiązania z promocją w DB |
| **DS** | ✅ |

#### `stats_counter` — Stats / Counters

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Animowane liczniki |
| **Data strategy** | `none` |
| **Priorytet** | Niski |

#### `pricing_table` — Pricing Table

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Cennik usług / subskrypcji |
| **Konfiguracja** | `plans[]` w repeaterze, `billing_toggle`, `currency_symbol` |
| **Data strategy** | `none` |
| **Ograniczenia** | Ceny jako string; słaby fit dla sklepu produktowego |
| **DS** | ✅ |
| **Status** | Kandydat do konsolidacji z `pricing_cards` |

#### `pricing_cards` — Pricing Cards

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Plany cenowe z togglem monthly/yearly |
| **Konfiguracja (schema)** | Tylko `title`, `subtitle`, `show_toggle` |
| **Konfiguracja (render)** | Oczekuje `plans[]` (`price_monthly`, `price_yearly`, `features`) — **brak w schemacie** |
| **Data strategy** | `none` |
| **DS** | ⚠️ |
| **Status** | **Drift krytyczny** (objaw braku warstwy A) — do naprawy lub konsolidacji |

#### `trust_badges` — Trust Badges

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Sygnały zaufania (dostawa, zwroty, płatności) |
| **Konfiguracja** | `style`, `badges[]` (icon, label, sublabel) |
| **Data strategy** | `none` |
| **Layout child** | kandydat na dziecko kolumn |
| **DS** | ✅ |
| **Use case** | Homepage, PDP, checkout funnel |

#### `logo_cloud` — Logo Cloud

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Siatka logo (upload media) |
| **Relacje** | `logos` |
| **Data strategy** | `none` |
| **Status** | Częściowy duplikat `brands_slider` |

### 5.5 Social proof / media

#### `testimonials` — Testimonials

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Opinie klientów (ręczne) |
| **Konfiguracja** | `display_mode`, `show_rating`, `items[]` |
| **Relacje** | `avatar` |
| **Data strategy (docelowo)** | `none` (manual) / `server` (gdy źródło `ProductReview` przez `ProductQueryService`) |
| **Ograniczenia** | Brak integracji z `ProductReview` |
| **DS** | ✅ |

#### `image_gallery` — Image Gallery

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Galeria grid/masonry/carousel + lightbox |
| **Relacje** | `gallery` |
| **Data strategy** | `none` |
| **DS** | ✅ |

#### `video_embed` — Video Embed

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | YouTube / Vimeo / self-hosted |
| **Konfiguracja** | `video_url`, autoplay, loop, controls, aspect_ratio |
| **Data strategy** | `none` + lazy facade (interakcja klienta) |
| **Ograniczenia** | Brak lazy facade (LCP); brak poster z relacji `thumbnail` |
| **DS** | ⚠️ |

### 5.6 Forms / advanced

#### `form_embed` — Form Embed

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Osadzenie formularza z modułu Forms |
| **Relacje** | `form` |
| **Data strategy** | `server` (definicja formularza) + `client` (submit) → `hybrid` |
| **DS** | ✅ |

#### `custom_html` — Custom HTML

| Pole | Wartość |
|------|---------|
| **Przeznaczenie** | Dowolny HTML/CSS (gated) |
| **Konfiguracja** | `html`, `css` — sanityzowane (`HtmlPurifier`, `CssSanitizerService`) |
| **Data strategy** | `none` |
| **Uprawnienie** | `cms.custom_html.manage`; `CMS_CUSTOM_HTML_ENABLED` |
| **DS** | ⛔ (celowo) |

### 5.7 Macierz strategii danych i kontekstu (zbiorcza, docelowo)

| Blok | Data strategy | Cache boundary | Context deps |
|------|---------------|----------------|--------------|
| `hero_banner`, `rich_text`, `two_columns`, `three_columns`, `alert_banner`, `call_to_action`, `promotional_banner`, `image_gallery`, `timeline`, `team_members`, `icon_list`, `steps_process`, `trust_badges`, `logo_cloud`, `stats_counter`, `pricing_table`, `pricing_cards`, `custom_html`, `video_embed` | `none` | cache strony | — |
| `featured_products` | `server` | strona + `product:*`/`category:*` | opc. `currentCategory`/`currentCollection` |
| `categories_grid`, `brands_slider` (all) | `server` | strona + `taxonomy` | — |
| `featured_posts`, `testimonials` (z reviews) | `server` | strona + `blog:*`/`review:*` | opc. `currentProduct` |
| `newsletter_signup`, `form_embed` | `hybrid` | shell cache | — |
| `map` | `client` | — | — |
| **(nowe) `product_recommendations`, `product_spotlight`, `product_reviews`** | `server`/`cached` | `product:{id}` (tag) | **`currentProduct`** |
| **(nowe) `recently_viewed_products`** | `client` | — | `cartState` (opc.) |
| **(nowe) `product_listing`** | `server` (1. strona) + `client` (paginacja) → `hybrid` | `category:{id}` | opc. `currentCategory` |

---

## Część VI — Moduły stron (poza rejestrem bloków)

Dla `page_type = 'module'` — `client/components/page-builder/modules/`:

| `module_name` | Komponent | Uwagi |
|---------------|-----------|-------|
| `content` | ContentModule | Prosta treść |
| `faq` | FaqClientModule | FAQ z modelu |
| `blog` | BlogModule | Listing bloga |
| `product_listing` | ProductListingModule | Listing produktów |
| `category_listing` | CategoryListingModule | Listing kategorii |
| `brand_listing` | BrandListingModule | Listing marek |
| `store_locator` | StoreLocatorModule | Wiele lokalizacji |
| `flash_sales_hub` | FlashSalesHubModule | Promocje |
| `returns_portal` | ReturnsPortalModule | Zwroty |
| `guest_order_tracker` | GuestOrderTrackerModule | Śledzenie zamówienia |
| `newsletter_preferences` | NewsletterPreferencesModule | Preferencje newslettera |

**Luka:** listingi działają jako osobne strony-moduły, ale **nie jako bloki** osadzalne w landing page. Po wprowadzeniu warstwy D (`ProductQueryService`) listing-jako-blok staje się trywialny — moduł i blok dzielą jeden serwis zapytań.

---

## Część VII — Korekty istniejącego audytu

### 7.1 `featured_products`

Poprzednia diagnoza („drift nazw pól, brak sortowania”) była **powierzchowna**. Pełna diagnoza:

- **Problem 1 — brak query abstraction layer:** blok składa URL `/products?filter[is_featured]=1...` bezpośrednio w komponencie. Łamie warstwę D. Logika „co to znaczy featured/bestseller/on_sale” nie istnieje centralnie.
- **Problem 2 — brak product context dependency injection:** blok nie ma dostępu do `currentCategory`/`currentCollection`; filtr kontekstowy niemożliwy bez ręcznej relacji.
- **Problem 3 — brak unified data strategy:** dwie różne strategie (`none` + `client`) w jednym bloku → nieprzewidywalny LCP i częściowy brak SEO (tryb featured renderuje pusto w SSR).
- Drift `columns`/`items_per_row` to **objaw** braku warstwy A, nie osobny bug.

### 7.2 `featured_posts` / blog blocks

- **Brak SEO semantic layer:** bloki blogowe nie emitują żadnej semantyki (`Article`/`ItemList`/`BreadcrumbList`, author graph, TOC z `id` nagłówków). To realna strata pozycjonowania treści, która jest filarem credibility.
- **Brak unified content query layer:** każdy wariant (`manual`/`latest`/`category`) ma inną ścieżkę danych. Wymaga `ContentQueryService` (warstwa D) i strategii `server` (warstwa B).

### 7.3 Widoczność per-device

Poprzedni audyt traktował to jako „dodać klasy `hidden md:block`”. To **błąd architektoniczny**:

- **CSS visibility ≠ CMS visibility system:** `display:none` wysyła treść do DOM (waga, a11y, czasem indeksacja) i nie jest decyzją systemową — to maskowanie. CMS potrzebuje decyzji „czy blok istnieje dla tego viewportu”.
- **Brak SSR-aware filtering:** prawdziwa widoczność per-device wymaga sygnału na serwerze (np. device hint) lub świadomej decyzji „render zawsze, ukryj CSS-em wyłącznie dla layoutu, nie dla treści dynamicznej”. Treść `server`/`cached` ukrywana CSS-em wciąż kosztuje fetch.
- **Wpływ na segmentację cache:** widoczność per-device wprowadza wariant cache (mobile/desktop) — bez tego cache strony jest albo nadmiarowy, albo niepoprawny. Decyzja o widoczności musi współgrać z warstwą B (cache boundary).

### 7.4 Nested blocks

- **Ryzyko free-form CMS explosion:** swobodne zagnieżdżanie zamienia schema-driven CMS w nieprzewidywalny edytor drzew → eksplozja kombinacji layoutu, niestabilny render, łamanie DS.
- **Konieczność `allowed_children` constraint map:** zagnieżdżanie wolno wprowadzić **tylko** z allowlistą dzieci per kontener (warstwa E).
- **Konieczność max-depth enforcement:** twardy limit głębokości (rekomendacja: 1 poziom) wymuszony w `PageBuilderSnapshotValidator` przy zapisie.

---

## Część VIII — Roadmapa jako system wdrożeniowy (Layer 0–6)

Roadmapa nie jest już listą faz funkcjonalnych. Jest **stosem warstw**: każda wyższa warstwa zakłada ukończenie niższej. Kolejność jest wymuszona zależnościami architektonicznymi, nie priorytetem biznesowym.

### Layer 0 — Schema Consistency Layer

**Cel:** doprowadzić istniejący schemat do spójności, zanim postawimy na nim kontrakt. Niski risk, natychmiastowy ROI. (To zarazem lista quick wins — sekcja X.)

- Fix drift `featured_products` (`items_per_row` ↔ `columns`; dodać `subtitle`, `view_all_url`, `view_all_label` do schematu).
- Fix `pricing_cards` (dodać `plans[]` do schematu **lub** konsolidacja z `pricing_table` + migracja danych).
- Fix enum ↔ render mismatch (audyt wszystkich 30 typów: pole czytane w rendererze, którego nie ma w schemacie).
- Unify tokens vs hex (`promotional_banner`, `newsletter_signup`, `icon_list` → warianty tokenowe zamiast hex).
- Fix `section_presets.php` (klucze `cta_text`/`title` zamiast `cta`/`heading`).
- (opc.) Dodać `spacer` jako brakujący prymityw layoutu.

**DoD:** zero znanych driftów; `make check` zielony; testy rendererów zielone.

### Layer 1 — Runtime Contract Layer (CORE FOUNDATION)

**Cel:** zamienić rozproszoną definicję bloku w jeden kontrakt (warstwa A).

- Block contract model — `data_strategy`, `context_dependencies`, `allowed_children` jako pola schematu w `blocks.php`.
- TS + PHP contract sync — komenda `artisan blocks:export` → JSON Schema; typy TS derywowane (CI gate).
- Renderer registry enforcement — zastąpić `switch` w `block-renderer.tsx` rejestrem; brak typu = błąd buildu.
- Validation pipeline unification — jeden schemat zasila `BlockConfigurationValidator`, admin form, typy i testy.
- Test kontraktowy: każdy `PageBlockTypeEnum` ma komplet (schema/registry/preview/typ).

**DoD:** dodanie pola czytanego w rendererze, którego nie ma w schemacie, **nie kompiluje się**.

### Layer 2 — Data & Query Abstraction Layer

**Cel:** odebrać blokom bezpośredni dostęp do danych (warstwy B + D).

- `ProductQueryService` — featured/by-category/collection/bestsellers/on_sale/newest/recommendations.
- `ContentQueryService` — wpisy bloga (latest/category/related), TOC, autorzy.
- Removal of direct fetch in components — `featured_products` i pozostałe bloki przechodzą na query spec + `server` strategy; znika `useEffect`+`apiGetPage`.
- Deklaracja `cache_tags` + `revalidate` per strategia.

**DoD:** żaden komponent bloku nie składa URL API ani nie query DB; wszystkie dane przez serwis.

### Layer 3 — Product Context Layer

**Cel:** wprowadzić `ProductContext` jako runtime ecommerce (warstwa C).

- `ProductContext` injection — `PageRenderer` buduje kontekst (SSR) + `ProductContextProvider` (klient dla `cartState`/`userSegment`).
- Bloki konsumują kontekst przez deklarowane `context_dependencies` (DI), nie własny fetch.
- Recommendations system foundation — `product_recommendations` na `currentProduct` + `ProductQueryService`.
- Spotlight/listing unified behavior — `product_spotlight`, `product_reviews`, `recently_viewed_products` korzystają z jednego kontekstu i jednego serwisu.

**DoD:** PDP z pięcioma blokami produktowymi pobiera `currentProduct` raz; brak duplikacji logiki rekomendacji.

### Layer 4 — Layout Engine Expansion

**Cel:** bezpiecznie rozszerzyć możliwości layoutu (warstwa E + responsywność).

- Nested blocks with constraints — `parent_block_id` (self-ref), `allowed_children` map, rekurencyjny sync, max-depth = 1.
- Per-device visibility (SSR aware) — decyzja systemowa, nie czyste CSS; uwzględnia cache segmentation (korekta 7.3).
- Hero + layout variants expansion — split/slider w `hero_banner`; video poster/lazy.

**DoD:** można wstawić `trust_badges` + `rich_text` w kolumnach (w granicach allowlisty); blok można systemowo wyłączyć na mobile bez śmieci w DOM dla treści dynamicznej.

### Layer 5 — Marketing & SEO Layer

**Cel:** semantyka i konwersja na ufundowanych warstwach.

- Schema.org blocks — `accordion` → FAQPage; `featured_posts`/blog → `Article`/`ItemList`; `product_*` → `Product`/`AggregateRating`.
- Blog semantic layer — TOC (id nagłówków), `related_posts`, `author_bio`, share buttons, author graph.
- Shoppable content — `shoppable_image` (hotspoty → produkty), `banner_grid`/mosaic.
- Promo system — `promo_code` (copy + opcjonalna integracja z `Promotion`/koszykiem).

**DoD:** strona blog post składana wyłącznie z bloków; landing z promo + shoppable image; JSON-LD na blokach.

### Layer 6 — Personalization Layer (FUTURE)

**Cel:** personalizacja jako zmiana danych kontekstu, nie kodu bloków.

- Segmentation — `userSegment` (logged_in, cart_value, geo) jako wejście do widoczności/wariantów.
- A/B testing — warianty bloku/sekcji wybierane per segment/eksperyment.
- Behavioral targeting — rekomendacje i spotlight zasilane sygnałem behawioralnym przez `ProductQueryService`.

**DoD:** ten sam blok renderuje różną treść per segment bez zmian w komponencie.

### Mapa zależności warstw

```
Layer 0  Schema consistency
   │
Layer 1  Runtime Contract  ← wymaga spójnego schematu
   │
Layer 2  Data & Query       ← wymaga data_strategy z kontraktu
   │
Layer 3  Product Context    ← wymaga query service (D) do realizacji DI
   │
Layer 4  Layout Engine      ← wymaga walidatora kontraktu (allowed_children)
   │
Layer 5  Marketing & SEO    ← wymaga context + query (recommendations, schema)
   │
Layer 6  Personalization    ← wymaga userSegment z kontekstu (C)
```

---

## Część IX — Top 10 ryzyk

| # | Ryzyko | Warstwa | Skutek, jeśli zignorowane |
|---|--------|---------|----------------------------|
| 1 | **Drift schema ↔ render jako stan domyślny** | A / Layer 1 | Każdy nowy blok dokłada cichy bug; render czyta pola spoza schematu (`featured_products`, `pricing_cards`). |
| 2 | **Bloki fetchują dane ad-hoc** (brak warstwy B/D) | B,D / Layer 2 | Nieprzewidywalny LCP, brak SEO treści `client`, N+1, duplikacja logiki w każdym komponencie. |
| 3 | **Brak `ProductContext`** | C / Layer 3 | Duplikacja logiki produktowej; brak fundamentu pod recommendations/personalizację; fan-out fetchy na PDP. |
| 4 | **Nested blocks bez constraints** | E / Layer 4 | Free-form explosion, niestabilny layout, łamanie DS, ryzyko wydajności (rekurencja). |
| 5 | **Per-device „visibility” mylona z CSS** | Layer 4 | Treść dynamiczna ukrywana CSS-em wciąż kosztuje fetch i psuje segmentację cache. |
| 6 | **Brak SEO semantic layer (blog/produkt)** | Layer 5 | Utrata pozycjonowania — blog jest filarem credibility; brak schema/TOC/author graph. |
| 7 | **`switch` zamiast registry w `block-renderer`** | A / Layer 1 | Nowy typ cicho zwraca „Unknown block” w prod (`null`) zamiast błędu buildu. |
| 8 | **Hex zamiast tokenów w blokach** | Layer 0 | Theming/dark mode łamie się; merchant nie może przemalować bloków. |
| 9 | **Cache bez tagów / granic** | B / Layer 2 | Zmiana produktu w adminie nie invaliduje strony albo invaliduje za dużo; stale content lub przeładowany cache. |
| 10 | **Dług AI-composer** — AI generuje snapshoty na niespójny kontrakt | A / Layer 1 | AI produkuje konfigurację, której renderer nie obsłuży zgodnie ze schematem (drift propaguje się masowo). |

---

## Część X — Quick wins (Layer 0)

Niski risk, brak zmian architektonicznych, natychmiastowy ROI. Można wdrożyć przed Layer 1.

| # | Quick win | Pliki |
|---|-----------|-------|
| QW1 | Fix `featured_products` drift: `items_per_row`↔`columns`, dodać `subtitle`/`view_all_url`/`view_all_label` do schematu | `server/config/blocks.php`, `featured-products.tsx(.types.ts)` |
| QW2 | Rozwiązać `pricing_cards` (dodać `plans[]` do schematu lub konsolidacja + migracja danych) | `blocks.php`, `pricing-cards.tsx`, enum/migracja |
| QW3 | Hex → tokeny: `promotional_banner`, `newsletter_signup`, `icon_list` (warianty) | `blocks.php`, odpowiednie `*.tsx` |
| QW4 | Fix `section_presets.php` (klucze `cta_text`/`title`) | `server/config/cms/section_presets.php` |
| QW5 | Audyt enum↔render mismatch dla wszystkich 30 typów (lista driftów) | `blocks.php` + renderery (read-only audyt) |
| QW6 | Dodać `spacer` (brakujący prymityw layoutu) | enum, `blocks.php`, `block-renderer`, `*.tsx`, testy |
| QW7 | A11y bloków interaktywnych (accordion `aria-expanded`, tabs roving tabindex, slider `prefers-reduced-motion`, countdown `aria-live`) | `client/components/page-builder/blocks/` |
| QW8 | `video_embed` lazy facade + poster z relacji `thumbnail` (LCP) | `video-embed.tsx` |

**DoD Layer 0:** `make check` zielony; 0 znanych driftów schema↔render; 0 bloków z hex w schemacie; pełne pokrycie testów rendererów.

---

## Część XI — Porównanie z builderami

| Wymiar | CMS Page Builder | Shopify Sections | Webflow | Framer | Elementor |
|--------|------------------|------------------|---------|--------|-----------|
| Model | Sekcje + bloki (schema) | Sections + blocks | Free canvas | Free canvas | Widgety + kolumny |
| Swoboda layoutu | Niska | Średnia | B. wysoka | B. wysoka | Wysoka |
| Responsywność per-device | ⛔ | ✅ | ✅ | ✅ | ✅ |
| Dane ecommerce dynamiczne | Częściowe (ad-hoc) | ✅ natywne | ✅ Collections | Ograniczone | Pluginy |
| Rekomendacje produktów | ⛔ | ✅ | ⛔ | ⛔ | Pluginy |
| Personalizacja / A-B | ⛔ | ✅ (apps) | ✅ | ✅ | ✅ Pro |
| Reusable / global | ✅ | ✅ | ✅ Symbols | ✅ Components | ✅ Global |
| Wersjonowanie | ✅ | ✅ | ✅ | ✅ | Revisions |
| Theming / tokeny | ✅ (mocna strona) | ✅ | ✅ | ✅ | Częściowo |
| Walidacja + sanityzacja | ✅ (mocna strona) | Liquid sandbox | — | — | — |
| **Runtime contract layer** | ⛔ (luka rdzenia) | ✅ (schema settings) | ✅ | ✅ | Częściowo |
| **Unified data strategy** | ⛔ (luka rdzenia) | ✅ | ✅ | Częściowo | Pluginy |
| **Ecommerce context** | ⛔ (luka rdzenia) | ✅ (liquid objects) | Ograniczone | ⛔ | Pluginy |
| SEO strukturalne na blokach | ⛔ | ✅ | Częściowe | Częściowe | Pluginy |

**Mocne strony:** schema-driven admin, transakcyjny zapis, walidacja, tokeny DS, reusable blocks, wersjonowanie, preview.

**Luki rdzenia (nie funkcjonalne):** brak runtime contract, brak unified data strategy, brak ecommerce context. To one — a nie liczba bloków — odróżniają system od dojrzałych builderów.

---

## Część XII — Checklist przy dodawaniu nowego bloku (zaktualizowany)

Każdy nowy blok musi spełnić **definicję dobrego bloku** (Część III) i zmienić:

1. `server/app/Enums/PageBlockTypeEnum.php`
2. `server/config/blocks.php` — schema + `allowed_relations` + **`data_strategy`** + **`context_dependencies`** + **`allowed_children`** (jeśli layout)
3. Migracja DB enum (jeśli MySQL enum)
4. `client/types/api.ts` — typ **derywowany** ze schematu (po Layer 1), nie ręczny
5. `client/components/page-builder/blocks/{name}.tsx` + `.types.ts` — konsumuje dane przez serwis (Layer 2), kontekst przez DI (Layer 3)
6. **Rejestracja w `BlockRegistry`** (po Layer 1; przed: `block-renderer.tsx`)
7. `canvas-block-preview.tsx` — preview branch
8. `client/tests/unit/page-builder-renderers.test.tsx` + test kontraktowy
9. Opcjonalnie: `PagesDemoSeeder.php`, `section_presets.php`
10. `.ai/guide.md` — sekcja Page Builder

---

## Część XIII — Metryki sukcesu

| Metryka | Cel |
|---------|-----|
| Drift schema↔render | 0 (wymuszone CI gate, Layer 1) |
| Bloki czytające dane spoza serwisu (D) | 0 po Layer 2 |
| Bloki z hex color w schema | 0 (Layer 0) |
| Pokrycie testów rendererów + kontraktu | 100% zarejestrowanych typów |
| Fetch `currentProduct` na PDP | 1 (przez `ProductContext`, nie per-blok) |
| Bloki ecommerce-specific | ≥ 8 (dziś 3) |
| Bloki z deklarowaną `data_strategy` | 100% (Layer 1) |
| Lighthouse LCP (hero+video, featured) | < 2.5s (po Layer 2 + lazy) |
| SEO: bloki z JSON-LD tam, gdzie zasadne | accordion/blog/produkt (Layer 5) |

---

*Rewizja 2 — korekta architektoniczna na podstawie audytu kodu: `server/config/blocks.php`, `client/components/page-builder/` (m.in. `block-renderer.tsx`, `blocks/featured-products.tsx`), `server/app/Services/PageBuilder/`, `server/app/Http/Resources/Api/V1/PageResource.php` (2026-06-15).*
