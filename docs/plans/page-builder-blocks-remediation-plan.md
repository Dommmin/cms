# Page Builder Blocks — Plan naprawy (post-audit)

Data: 2026-06-15  
Rewizja: 1

## Cel

Uporządkować **5 bloków z naruszeniami** wykrytymi w audycie kontraktu danych (2026-06-15) i doprowadzić implementację do zgodności z deklarowanym `data_strategy` / `context_dependencies`. Pozostałe **27 bloków** przechodzą audyt bez zmian w tym planie.

**Ten dokument nie implementuje kodu** — opisuje kolejność prac, pliki, testy i kryteria ukończenia.

## Powiązane dokumenty

- `docs/plans/page-builder-audit-and-roadmap.md` — warstwy Contract, Data Strategy, Product Context (Layer 0–6)
- `docs/page-builder.md` — developer guide (dodawanie bloku)
- `.ai/context.md` — deep context page buildera

## Wynik audytu (skrót)

| Metryka | Wynik |
|---------|-------|
| Bloki w rejestrze | 30 |
| Brak `data_strategy` w `blocks.php` | 0 |
| Brak `context_dependencies` w `blocks.php` | 0 |
| Fetch w `useEffect` (storefront renderer) | 1 (`map`) |
| Direct API w komponencie bloku | 3 (`map`, `newsletter_signup`, `form_embed`) |
| Bloki czyste | 27 |

## Macierz priorytetów

| Priorytet | Blok | Severity | Problem |
|-----------|------|----------|---------|
| **P0** | `map` | HIGH | `fetch()` w `useEffect`; raw HTTP zamiast warstwy API / SSR |
| **P1** | `brands_slider` | HIGH | `data_strategy: server`, brak resolution dla `source: all` |
| **P1** | `featured_products` | HIGH | `context_dependencies` zadeklarowane, brak runtime DI i filtrowania w `PageResource` |
| **P2** | `newsletter_signup` | MEDIUM | Direct `@/api/newsletter` w rendererze |
| **P2** | `form_embed` | MEDIUM | Direct `@/api/forms` w rendererze |
| **P3** | `testimonials` | LOW | `data_strategy: server` przy danych wyłącznie w `configuration` — powinno być `none` |

---

## Zasady wykonania

1. **Jedna faza = jeden merge concern** — zgodnie z `.ai/commit-rules.md`.
2. **Server resolution przed client fetch** — bloki SEO/LCP nie mogą polegać na `useEffect` + fetch.
3. **Kontrakt first** — po każdej zmianie strategii: `php artisan blocks:export`, regeneracja typów, `make check`.
4. **Testy obowiązkowe** — Pest dla PHP, Vitest dla storefrontu tam, gdzie dotykamy renderera.
5. **Nie rozszerzać scope** — Product Context Layer wdrażamy minimalnie (tylko pola wymagane przez `featured_products`), pełny model z roadmapy Layer 2–3 osobno.

---

## Phase 0 — Baseline (przed kodem)

### Cel

Upewnić się, że stan kontraktu jest zielony i audyt jest powtarzalny.

### Prace

1. Uruchomić `scripts/check-blocks-contract.sh` (lub `make check` przed release).
2. Zapisać snapshot strategii per blok (referencja: `server/tests/Unit/PageBuilder/snapshots/blocks.schema.json`).
3. Potwierdzić listę plików renderera storefront: `client/components/page-builder/blocks/*.tsx`.

### Definition of Done

- CI gate kontraktu przechodzi.
- Brak regresji w `BlockContractTest` / `BlockSchemaExportTest`.

---

## Phase 1 (P0) — `map`: SSR resolution, usunięcie fetch z `useEffect`

### Cel

Mapa ze sklepem ma być dostępna w HTML (SEO, LCP). Renderer nie wykonuje sieciowego fetch przy mount.

### Diagnoza

- Kontrakt: `data_strategy: client` — zachowanie zgodne z „client fetch”, ale antywzorzec (fetch w `useEffect`, raw URL).
- Plik: `client/components/page-builder/blocks/map-block.tsx` — `fetch(\`${NEXT_PUBLIC_API_URL}/stores/${id}\`)` w `useEffect`.
- Istnieje `client/api/stores.ts` (`getStore`) oparty o `serverFetch` — nieużywany przez blok.

### Docelowy model

| Wariant config | Resolution |
|----------------|------------|
| `store_id` ustawione | SSR: `Store` w `block.relations` lub dedykowanym polu `resolved_store` w API page |
| tylko `lat` / `lng` | `data_strategy: none` — fallback z config, bez API |
| brak danych | empty state (już istnieje) |

### Prace

1. **PHP — `PageResource`**
   - Dodać `resolveMapBlockStores()` analogicznie do `resolveAutoSourcePosts`.
   - Dla bloków `type === 'map'` z `store_id`: eager-load `Store`, serializacja do relacji `stores` (klucz np. `location`) lub inline w `configuration._resolved` (preferowane: relacja, spójnie z innymi blokami).
2. **Kontrakt — `blocks.php`**
   - Zmienić `data_strategy` z `client` na `server` (gdy `store_id`) lub `none` (tylko współrzędne).
   - Opcja prostsza na start: **`server`** dla całego typu `map` + resolution store po stronie API; współrzędne bez `store_id` nadal z config.
   - Dodać `allowed_relations` dla `store` jeśli używamy relacji (sprawdzić `relation_types` w `blocks.php`).
3. **Storefront — `map-block.tsx`**
   - Usunąć `useEffect` + `fetch`.
   - Czytać `Store` z `block.relations` (jak `categories_grid`).
   - Zachować fallback lat/lng z config bez sieci.
   - Usunąć `'use client'` jeśli komponent nie wymaga już hooków (opcjonalnie zostawić client tylko dla `StoreMap` — wtedy shell RSC + client island dla mapy Leaflet).
4. **Typy**
   - Zregenerować `blocks.generated.ts` (client + admin).
5. **Admin preview**
   - Zaktualizować branch `map` w `canvas-block-preview.tsx` jeśli preview zakłada client fetch.

### Testy

- **Pest:** `tests/Feature/Api/PageMapBlockTest.php` — strona z blokiem `map` + `store_id` zwraca zhydratowany store w relations; brak pustego `relations` gdy store istnieje.
- **Vitest:** `client/tests/unit/map-block.test.tsx` — renderer nie woła `fetch`; render z mock relations.
- **Regresja:** istniejące testy page API.

### Ryzyko

- `StoreMap` wymaga `"use client"` (Leaflet) — rozdzielić na `MapBlock` (RSC) + `MapBlockClient` (map widget).
- Preview w adminie może nie mieć pełnego API page — mock/store w preview.

### Definition of Done

- Brak `fetch` / `useEffect` z siecią w `map-block.tsx`.
- Strona z `store_id` zwraca dane sklepu w payloadzie SSR.
- `data_strategy` w kontrakcie odzwierciedla faktyczne zachowanie.
- Testy Phase 1 zielone.

---

## Phase 2 (P1) — `brands_slider`: server resolution dla `source: all`

### Cel

Domyślny tryb (`source: all`) pokazuje wszystkie aktywne marki bez ręcznego linkowania relacji.

### Diagnoza

- Kontrakt: `data_strategy: server`.
- Schema: `source` enum `all` | `manual`, default `all`.
- `PageResource::buildBlockRelations` — brak gałęzi dla `brands_slider` + `source=all` (w przeciwieństwie do `featured_posts` + `latest`).
- Renderer: `brands-slider.tsx` czyta tylko `block.relations` — przy `all` i braku relacji zwraca `null`.

### Prace

1. **PHP — `PageResource`**
   - Dodać `resolveAutoSourceBrands()` — dla bloków `brands_slider` z `source !== 'manual'` (lub `all`): `Brand::query()` aktywne, limit rozsądny (np. 50), serializacja jak w `resolveBlockRelationLookup` (logo_url, public_url).
   - W `buildBlockRelations`: gałąź `brands_slider` + auto brands → `relation_key: brands`.
2. **Storefront**
   - Bez zmian w fetch; ewentualnie obsłużyć `cfg.source === 'manual'` vs auto (tylko relations).
3. **Testy**
   - **Pest:** `tests/Feature/Api/PageBrandsSliderBlockTest.php` — strona z `brands_slider` / `source: all` zwraca N marek w relations bez ręcznych `block_relations`.
   - **Vitest:** istniejący / nowy test — brands z relations renderują slider.

### Ryzyko

- Duża liczba marek — rozważyć limit + dokumentacja w schema (`max_items` w przyszłości).

### Definition of Done

- Demo / seed z `brands_slider` + `source: all` renderuje logotypy na storefront.
- Brak client-side fetch dla marek.
- Test feature API zielony.

---

## Phase 3 (P1) — `featured_products`: Product Context + server filtering

### Cel

Zrealizować deklarację `context_dependencies: ['currentCategory', 'currentCollection']` i spójne server-side resolution dla obu trybów `filter_mode`.

### Diagnoza

- Kontrakt OK (`data_strategy: server`, context zadeklarowany).
- `PageResource::resolveAutoSourceFeaturedProducts` — globalne `is_featured`, ignoruje kategorię/kolekcję strony i relację `category_filter`.
- Brak `ProductContext` / providera na storefront — renderer nie dostaje kontekstu.
- Drift schema ↔ renderer: schema `items_per_row`, renderer/types `columns` (osobny ticket w Layer 1 Contract, ale naprawić w tej fazie jeśli dotykamy pliku).

### Docelowy model (minimalny MVP)

```
PageRenderer (server)
  → buduje PageContext { currentCategory?, currentCollection? } z route + page_type
  → PageResource dostaje context (request attribute lub parametr serwisu)
  → resolveAutoSourceFeaturedProducts filtruje wg:
       - filter_mode=featured + category_filter relation
       - filter_mode=featured + currentCategory z kontekstu (landing kategorii)
       - filter_mode=manual → relations (bez zmian)
```

### Prace

1. **PHP — context injection (minimal)**
   - Serwis `App\Services\PageBuilder\PageRenderContext` (DTO: `?CategorySummary`, `?CollectionSummary`).
   - W API page controller / resource: ustawianie kontekstu z route (np. strona typu category) — bez pełnego koszyka/segmentu (to Layer 3 roadmapy).
2. **PHP — `PageResource`**
   - Rozszerzyć `resolveAutoSourceFeaturedProducts` o filtry category/collection.
   - Respektować `category_filter` relation gdy ustawiona.
3. **Storefront**
   - Opcjonalnie `ProductContextProvider` — tylko jeśli blok ma czytać context po stronie klienta; preferowane: **wszystko w relations z API** (bez context w React na MVP).
   - Naprawić `featured-products.types.ts` / renderer: `items_per_row` zgodnie ze schema (usuń `columns` drift).
4. **Kontrakt**
   - Jeśli context jest wyłącznie server-side w API: rozważyć komentarz w `blocks.php` że dependencies są resolved at PageResource, nie w React.
5. **Testy**
   - Rozszerzyć `tests/Feature/Api/PageFeaturedProductsBlockTest.php`:
     - `filter_mode=featured` na stronie kategorii → produkty z tej kategorii (lub featured w scope).
     - `category_filter` relation nadpisuje / precyzuje filtr.
   - Vitest: `featured-products-block.test.tsx` — pola schema.

### Ryzyko

- Semantyka „featured on category page” wymaga decyzji produktowej (tylko featured vs wszystkie z kategorii).
- Kolekcje mogą nie mieć jeszcze pełnego modelu strony — `currentCollection` może być no-op do czasu modułu kolekcji.

### Definition of Done

- `context_dependencies` mają odpowiednik w resolution (PageResource), nie tylko w JSON kontraktu.
- Brak client fetch dla produktów w `featured_products`.
- Schema ↔ renderer zgodne dla `items_per_row`.
- Testy API rozszerzone i zielone.

---

## Phase 4 (P2) — Mutacje formularzy: `newsletter_signup` + `form_embed`

### Cel

Zachować `data_strategy: hybrid` (SSR shell + interakcja klienta), ale usunąć bezpośrednie importy `@/api/*` z komponentów bloków.

### Diagnoza

- `newsletter-signup.tsx` → `subscribe()` z `@/api/newsletter` w `handleSubmit`.
- `form-embed.tsx` → `submitForm()` z `@/api/forms` w `handleSubmit`.
- To **nie** jest fetch w `useEffect` — severity MEDIUM; akceptowalne jako user-initiated mutation, ale łamie zasadę „renderer nie zna transportu”.

### Docelowy model

```
Block mutation hook (client/hooks/use-block-mutation.ts lub per-domain)
  newsletter_signup → useNewsletterSubscribe()
  form_embed        → useFormSubmit(formId)
Renderer bloku      → wywołuje hook, nie importuje api/*
```

Alternatywa lżejsza: thin wrapper w `client/components/page-builder/mutations/` importowany przez bloki — bez pełnego context provider.

### Prace

1. Utworzyć `client/components/page-builder/mutations/newsletter.ts` i `forms.ts` (lub `hooks/use-block-newsletter.ts`).
2. Przenieść wywołania API z bloków do mutacji.
3. Bloki: import tylko z warstwy mutations/hooks.
4. **Testy Vitest** — mock mutacji, assert że blok nie importuje `@/api/newsletter` / `@/api/forms` (opcjonalnie reguła eslint `no-restricted-imports` w `blocks/`).

### Ryzyko

- Over-engineering — trzymać warstwę cienką (pass-through do istniejących funkcji api).

### Definition of Done

- Brak importów `@/api/*` w plikach `client/components/page-builder/blocks/*.tsx`.
- Submit newsletter i form nadal działają (E2E lub Vitest integration).
- Kontrakt `hybrid` bez zmian.

---

## Phase 5 (P3) — Porządki kontraktu i obserwowalność

### Cel

Domknąć niespójności poza krytyczną ścieżką i zapobiec regresji.

### Prace

1. **`testimonials`**: zmienić `data_strategy` z `server` na `none` (dane w `configuration.items`).
2. **CI lint (opcjonalnie, Layer 1 roadmapy)**
   - Skrypt grep/ast: bloki ze `data_strategy: server|none` nie mogą zawierać `fetch(` ani importów `@/api/`.
   - Wyjątek: `hybrid` — tylko przez warstwę mutations (Phase 4).
3. **`.ai/guide.md`**
   - Sekcja page builder: wymóg resolution w `PageResource` dla `server`, zakaz fetch w rendererze.
4. **Dokumentacja**
   - Cross-link z `docs/page-builder.md` do tego planu i roadmapy.

### Definition of Done

- Snapshot `blocks.schema.json` zaktualizowany (`testimonials` → `none`).
- Opcjonalny check w `scripts/check-blocks-contract.sh` rozszerzony o regułę anty-fetch (jeśli zaimplementowany).

---

## Harmonogram sugerowany

| Tydzień | Faza | Blok(i) | Szacunek |
|---------|------|---------|----------|
| 1 | Phase 1 | `map` | 1–2 dni |
| 1–2 | Phase 2 | `brands_slider` | 0.5–1 dzień |
| 2–3 | Phase 3 | `featured_products` + context MVP | 2–3 dni |
| 3 | Phase 4 | `newsletter_signup`, `form_embed` | 1 dzień |
| 4 | Phase 5 | porządki + CI | 0.5 dnia |

Fazy 2 i 3 mogą iść równolegle po Phase 1, jeśli ten sam developer nie dotyka `PageResource` w konflikcie — preferowana kolejność linearna: **1 → 2 → 3 → 4 → 5**.

---

## Checklist przed zamknięciem epiku

- [ ] Wszystkie fazy P0–P2 z Definition of Done spełnione
- [ ] `make fix && make check` przed merge każdej fazy
- [ ] Brak `fetch` w `useEffect` w `client/components/page-builder/blocks/`
- [ ] Bloki `server` mają resolution w `PageResource` (map, brands_slider, featured_products)
- [ ] `featured_products` — `context_dependencies` egzekwowane w PHP
- [ ] Aktualizacja `.ai/guide.md` po Phase 5
- [ ] Audyt powtórzony — 30/30 bloków bez HIGH violations

---

## Załącznik A — Bloki bez zmian (27)

`accordion`, `alert_banner`, `call_to_action`, `categories_grid`, `countdown_timer`, `custom_html`, `featured_posts`, `hero_banner`, `icon_list`, `image_gallery`, `logo_cloud`, `pricing_cards`, `pricing_table`, `promotional_banner`, `rich_text`, `stats_counter`, `steps_process`, `tabs`, `team_members`, `three_columns`, `timeline`, `trust_badges`, `two_columns`, `video_embed`

**Uwaga:** `featured_posts` już ma wzorzec auto-resolution (`source: latest`) — użyć jako template dla Phase 2 i części Phase 3.

## Załącznik B — Mapa plików (touch list)

| Obszar | Pliki |
|--------|-------|
| Kontrakt | `server/config/blocks.php` |
| Server resolution | `server/app/Http/Resources/Api/V1/PageResource.php` |
| Context (nowy) | `server/app/Services/PageBuilder/PageRenderContext.php` (proponowany) |
| Storefront renderers | `client/components/page-builder/blocks/map-block.tsx`, `brands-slider.tsx`, `featured-products.tsx`, `newsletter-signup.tsx`, `form-embed.tsx` |
| Mutations (nowe) | `client/components/page-builder/mutations/*.ts` |
| Admin preview | `server/resources/js/features/page-builder/components/canvas-block-preview.tsx` |
| Testy | `server/tests/Feature/Api/Page*BlockTest.php`, `client/tests/unit/*-block.test.tsx` |
| CI | `scripts/check-blocks-contract.sh`, snapshot `blocks.schema.json` |
