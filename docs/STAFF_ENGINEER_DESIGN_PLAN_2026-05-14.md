# Staff Engineer & Design Specialist Plan — 2026-05-14

## Cel

Ten dokument jest planem technicznym i produktowo-designerskim dla monorepo CMS:

- `server/` — Laravel backend, REST API, Inertia admin SPA.
- `client/` — publiczny frontend Next.js.

Najważniejszy kierunek: zbudować z tego stabilny headless CMS/e-commerce, w którym redaktor może bezpiecznie składać strony bez pomocy developera, a publiczny frontend wygląda jak dopracowany sklep/marka, nie jak generyczny demo layout.

## Szybka Ocena

Projekt ma solidną bazę:

- Page Builder ma sekcje, bloki, relacje do modeli, reusable blocks, templates, autosave, preview, approval flow i harmonogram publikacji.
- Publiczny Next.js ma renderer bloków, e-commerce flows, locale-prefixed URLs, wishlist, compare, checkout i podstawowe rich content rendering.
- Backend ma już globalną sanityzację HTML dla modeli translatable przez `HtmlSanitizerService` i `mews/purifier`.
- Jest dużo infrastruktury jakości: Docker, Pest, Pint, Wayfinder, typy API, dokumentacja, deployment docs.

Ale jako Staff Engineer najpierw zatrzymałbym rozbudowę funkcji i domknąłbym fundamenty bezpieczeństwa, spójności danych i UX edytora. Page Builder dotyka publicznego HTML-a, więc błędy tutaj są multiplikowane na wszystkie strony.

## P0 — Rzeczy Do Zrobienia Najpierw

### 1. Domknąć walidację i sanityzację Page Buildera

Obecny `UpdatePageBuilderRequest` ma dobre intencje, ale wymaga poprawy:

- `richTextConfigKeys()` czyta `config('blocks')`, a realne definicje bloków są pod `config('blocks.block_types')`. Efekt: sanityzacja konfiguracji bloków może nie obejmować pól `format: richtext/html`.
- Reguły relacji walidują `relations.*.type` i `relations.*.id`, a zapis w `PageBuilderSyncService` używa `relation_type` i `relation_id`.
- `configuration` nie jest walidowane względem schematu bloku, więc nieznane pola i złe typy przechodzą do bazy.
- Import JSON w `PageBuilderController::import()` omija `UpdatePageBuilderRequest`, sanityzację i walidację relacji.
- `ReusableBlockController` używa inline validation, bez Form Request, sanityzacji i walidacji schematu.
- `StoreSectionTemplateRequest` sprawdza tylko, że `snapshot` jest tablicą.

Plan wdrożenia:

1. Dodać `BlockConfigurationValidator`, który waliduje `configuration` względem `config/blocks.php`: typ, enum, min/max, maxLength, format `url/email/color/code/richtext/html`, wymagane pola, nieznane pola.
2. Dodać `PageBuilderSnapshotValidator` jako wspólny serwis dla update, autosave, import, reusable blocks i section templates.
3. Naprawić wykrywanie rich text fields: `config('blocks.block_types')`.
4. Walidować relacje po realnym kontrakcie: `relation_type`, `relation_id`, `relation_key`, `position`, `metadata`.
5. Dla każdej relacji sprawdzać, czy `relation_type` jest dozwolony dla danego bloku i czy `relation_id` istnieje w tabeli modelu z `config('blocks.relation_types')`.
6. Import JSON przepuścić przez ten sam validator/sanitizer co autosave i manual save.
7. Dodać Pest tests dla XSS w `rich_text`, `custom_html`, nested repeaters, reusable block i template import.

### 2. Zapisy buildera muszą być transakcyjne i atomowe

`PageBuilderSyncService::sync()` usuwa wszystkie sekcje/bloki i tworzy je od nowa. Bez transakcji awaria w połowie zapisu może zostawić stronę częściowo skasowaną. Dodatkowo optimistic locking w kontrolerze jest check-then-write, nie atomowy.

Plan wdrożenia:

1. Owinąć `sync + version increment + PageVersion snapshot` w `DB::transaction()`.
2. Pobierać stronę z `lockForUpdate()` przy update/autosave/import.
3. Porównywać `expected_version` wewnątrz transakcji.
4. Dopiero po pełnym sync robić increment wersji.
5. Tworzyć `PageVersion` dla manual save/import i osobny autosave snapshot z flagą `is_autosave`.
6. Długofalowo zastąpić delete/recreate algorytmem diff/upsert, żeby zachować stabilne ID sekcji/bloków, historię i komentarze.

### 3. Zabezpieczyć custom HTML/CSS na serwerze

Publiczny renderer nadal ma lokalny `sanitizeCss()` w Next.js. To jest defense-in-depth, ale źródłem prawdy musi być backend.

Plan wdrożenia:

1. Dodać server-side CSS sanitizer z whitelistą właściwości i limitem rozmiaru.
2. Zablokować `@import`, `expression()`, `javascript:`, `vbscript:`, niebezpieczne `data:` i zamykanie tagu `<style>`.
3. Ograniczyć `custom_html` do ról z uprawnieniem typu `cms.custom_html.manage`.
4. Dodać flagę per site: custom HTML enabled/disabled.

## P1 — Page Builder Jako Produkt Edytorski

### Docelowy UX

Page Builder powinien mieć trzy stabilne obszary:

- Lewy panel: drzewo strony, sekcje, bloki, statusy, szybkie wyszukiwanie.
- Środek: canvas z realnym podglądem i selectable overlays.
- Prawy panel: inspector aktywnego section/block z polami, relacjami, design settings i walidacją.

Obecny układ jest bardziej formularzem sekcji niż builderem wizualnym. To działa technicznie, ale przy większej liczbie bloków redaktor traci orientację.

### Priorytety UX

1. Wprowadzić stabilne `client_id` dla nowych sekcji/bloków, a w React keys nie używać indeksów. Reorder/delete nie powinny resetować rozwiniętych paneli ani historii.
2. Dodać outline/navigator strony z drag-and-drop, collapse all, expand active, duplicate, hide/show.
3. Dodać inspector block/section zamiast rozwijania wszystkiego inline.
4. Dodać responsive preview: desktop/tablet/mobile, z informacją które pola są responsive.
5. Dodać status health dla strony: brak alt textu, puste CTA URL, zbyt długi nagłówek, brak głównego H1, ciężkie obrazy, niedozwolony HTML.
6. Dodać konflikt zapisu jako dialog z decyzją: odśwież, zapisz kopię, porównaj zmiany.
7. Dodać version history diff: sekcje/bloki dodane, usunięte, zmienione.
8. Dodać autosave queue/cancel, żeby manual save i autosave nie ścigały się między sobą.
9. Zastąpić `window.confirm()` własnym dialogiem Inertia/shadcn, spójnym z panelem.
10. Dopiąć template workflow: zapis fragmentu, kategorie, preview miniatury, usage count, ownership.

### Edytor Bloków

`builder-toolbar.tsx` ma 676 LOC, `dynamic-block-form.tsx` 511 LOC, `blocks-list.tsx` 439 LOC, a `ToolbarPlugin.tsx` w RTE 1006 LOC. To są kandydaci do rozbicia.

Plan refaktoru:

- `builder-toolbar/HistoryGroup.tsx`
- `builder-toolbar/SaveStatus.tsx`
- `builder-toolbar/SchedulePopover.tsx`
- `builder-toolbar/ImportExportGroup.tsx`
- `builder-toolbar/ApprovalGroup.tsx`
- `dynamic-block-form/fields/StringField.tsx`
- `dynamic-block-form/fields/RichTextField.tsx`
- `dynamic-block-form/fields/RepeaterField.tsx`
- `dynamic-block-form/fields/RelationField.tsx`
- `dynamic-block-form/schema-defaults.ts`
- `dynamic-block-form/schema-validation.ts`

## P1 — Rich Text Editor

### Kierunek Architektoniczny

Rich Text Editor powinien przechowywać kanoniczny dokument edytora oraz generować sanityzowany HTML jako output dla headless API.

Rekomendacja:

- `content_json` jako źródło prawdy dla Lexical.
- `content_html` jako sanityzowany, cache'owany output dla klientów.
- Migracja etapowa: obecne HTML zostaje wspierane, nowe edycje zapisują oba formaty.

To daje stabilniejszy import/export, diff, wersjonowanie, komentarze i mniej strat przy round-trip HTML -> Lexical -> HTML.

### UX RTE

1. Rozbić toolbar na grupy: undo, headings, inline, lists, alignment, media, insert, advanced.
2. Dodać tryb prosty i zaawansowany. W blokach Page Buildera domyślnie prosty toolbar; w blogu pełny.
3. Uporządkować slash command menu: content, layout, media, embeds.
4. Zintegrować link picker z wewnętrznymi zasobami: products, categories, pages, posts.
5. Zintegrować image/media picker z focal point, alt text, caption i lazy-loading hints.
6. Dodać paste pipeline: czyszczenie HTML z Word/Google Docs, normalizacja headingów, usuwanie inline śmieci.
7. Dodać a11y checks: kolejność nagłówków, puste linki, obraz bez alt, link `target=_blank` bez rel.
8. Przetłumaczyć tooltipy i etykiety toolbaru.
9. Dodać testy interakcji RTE: typing, link, paste, table, image, locale switch, undo/redo.

## P1 — Publiczny Frontend

### Design Direction

Publiczny frontend jest funkcjonalny, ale wizualnie za generyczny. Logo `CMS`, dominanta indigo i standardowe karty sprawiają wrażenie startera. Trzeba przejść z "działa" do "ma charakter sklepu".

Rekomendacja design:

- Zdefiniować brand layer: logo, voice, primary/secondary palette, typografia, zdjęcia produktowe, styl ikon, motion.
- Ograniczyć dominację indigo. Dla e-commerce lepszy jest neutralny foundation plus jeden handlowy akcent i jeden editorial accent.
- Ustalić tokeny: spacing, radius, elevation, borders, focus, surface, product image ratio.
- Usunąć negatywny letter spacing z globalnych utility (`hero-heading`, `section-heading`) albo ograniczyć go do brand-approved display styles.
- Ujednolicić radius kart i przycisków. Obecne UI miesza `rounded-md`, `rounded-lg`, `rounded-xl` bez jasnej hierarchii.
- Każdy blok Page Buildera powinien renderować się z tych samych tokenów, nie z własnych ad hoc klas.

### E-commerce UX

1. Header: zastąpić `CMS` realnym brand slotem i dodać konfigurację brandingu z panelu.
2. Product listing: filtry jako desktop sidebar + mobile drawer, aktywne filter chips nad listą, licznik aktywnych filtrów.
3. Product card: ujednolicić badges, quick actions, wishlist/compare labels, skeletony i disabled states.
4. Product detail: rozbić komponent 891 LOC na gallery, buy box, variant selector, delivery panel, reviews, related products. Dodać sticky buy box na desktopie i sticky CTA na mobile.
5. Checkout: 922 LOC rozbić na kroki; step indicator ma pokazywać realny stan, nie każdy krok jako `current`.
6. Checkout: podsumowanie zamówienia sticky na desktopie, collapsed summary na mobile.
7. Waluta: sprawdzić widoczne symbole `€` w filtrach ceny względem PLN/base currency.
8. Trust: dopracować dostawa/zwroty/płatności jako stałe komponenty contentowe, nie jednorazowe fragmenty.
9. Empty/error states: pełne komunikaty, akcja następnego kroku, nie tylko tekst.
10. Motion: ograniczyć dekoracyjne animacje, zostawić feedback i transition states; dodać `prefers-reduced-motion`.

### Page Builder Rendering

1. Dodać preview parity test: ten sam snapshot renderowany w admin preview i publicznym Next.js.
2. Dodać visual regression dla podstawowych bloków: hero, rich text, products, categories, CTA, gallery, tabs, accordion.
3. Bloki powinny mieć stabilne spacing contracts: section padding, container width, text width, media ratio.
4. Custom classes/CSS powinny być wyjątkiem, nie normalnym mechanizmem stylowania.
5. Dodać design presets na poziomie bloku: `minimal`, `editorial`, `commerce`, `brand`, zamiast dowolnego CSS.

## P1 — Admin UI

1. Ustalić admin design system: button variants, icon policy, table density, form layout, empty states, destructive confirmations.
2. Dokończyć tłumaczenia PL/EN. W repo nadal są TSX-y z hardcoded stringami i lokalnymi typami w plikach `.tsx`.
3. Przenieść typy z `.tsx` do `*.types.ts`, zgodnie z regułą projektu. Przykłady: role pages, `dynamic-block-form.tsx`, `block-relation-manager.tsx`, część komponentów client.
4. Dodać globalne loading/error/empty patterns dla tabel i formularzy.
5. Przejść klawiaturą przez Page Builder, RTE, modale, selecty i DnD. Drag-and-drop musi mieć alternatywę keyboard.
6. Dodać command palette actions dla redaktora: "Add hero", "Open media", "Preview mobile", "Save template".

## P2 — Funkcjonalności, Które Najbardziej Podniosą Wartość

### Content Operations

- Kalendarz publikacji stron/postów/promocji.
- Kampanie contentowe: grupa zmian publikowana razem.
- Draft preview links z wygasaniem i audytem dostępu.
- Komentarze/redline na blokach.
- Ownership i approval per sekcja/blok.
- Bulk operations dla stron: clone, export, schedule, archive.

### Personalizacja

- Segmentowane bloki: pokaż blok dla segmentu klienta, kraju, waluty, UTM, logged-in/out.
- A/B testy bloków z prostymi metrykami.
- Dynamic blocks: bestsellery, ostatnio oglądane, promocje, rekomendacje.
- Ujednolicony cache invalidation/webhook po publikacji.

### SEO / Content Quality

- SEO panel w Page Builderze z live checks: H1, title length, meta description, canonical, OG image, structured data.
- Automatyczne alt text hints dla mediów.
- Sitemap/indexability status przy stronie.
- Open Graph preview.
- Content lint: zbyt długie akapity, puste CTA, duplikaty nagłówków.

## P2 — Engineering Quality

### Testy

Dodać minimalny zestaw testów jako quality gate:

- Pest: Page Builder update/autosave/import, malicious HTML, invalid relation, schema mismatch, version conflict.
- Pest: ReusableBlock store/update sync i sanityzacja.
- Pest: SectionTemplate snapshot validation.
- React tests: RTE paste/link/locale switch, Page Builder undo/redo, block copy/paste, unsaved changes.
- Playwright: public render podstawowych bloków, product listing, product detail, checkout happy path.
- Visual regression: krytyczne bloki i checkout na 375, 768, 1440 px.

### CI / Gates

- PHP: `docker compose exec php vendor/bin/pint --dirty`.
- PHP tests: `docker compose exec php php artisan test --compact`.
- Admin SPA: `docker compose exec php npm run format:check`, `docker compose exec php npm run types`.
- Client: `docker compose exec node npx tsc`, `docker compose exec node npm run build`.
- Dodać smoke test, który renderuje Page Builder snapshot i sprawdza brak błędów dla każdego typu bloku.

### Architektura

1. Wydzielić kontrakt Page Buildera do wersjonowanego schema package po stronie `server`, eksportowanego do TS typów.
2. Zmniejszyć liczbę ręcznie utrzymywanych switchy między PHP enum, `config/blocks.php`, admin form i Next rendererem.
3. Dodać schema version do snapshotów i migratory snapshotów.
4. Dodać eventy domenowe: `PageBuilderUpdated`, `PagePublished`, `ReusableBlockUpdated`.
5. Invalidation: Next revalidate tags, webhooki, cache purge.

## Roadmapa

### Sprint 0 — Stabilizacja P0

Zakres:

- Snapshot validator.
- Poprawka sanityzacji bloków.
- Walidacja relacji.
- Import/reusable/template przez wspólną walidację.
- Transakcje i atomowy optimistic locking.
- Testy bezpieczeństwa i konfliktów.

Efekt: można bezpiecznie rozwijać builder bez ryzyka XSS i korupcji danych.

### Sprint 1 — Editor Reliability

Zakres:

- Stable client IDs.
- Autosave queue/cancel.
- Conflict dialog.
- Version snapshots.
- Undo/redo cleanup.
- Podział największych komponentów buildera.

Efekt: redaktor może pracować dłużej bez utraty stanu i bez chaosu w historii.

### Sprint 2 — RTE 2.0

Zakres:

- Rozbicie toolbaru.
- Tryb prosty/advanced.
- Link picker i media picker.
- Paste cleanup.
- Canonical Lexical JSON + HTML output plan migracji.
- Testy RTE.

Efekt: treści blog/page/product są edytowalne przewidywalnie i bez regresji formatowania.

### Sprint 3 — Visual Builder UX

Zakres:

- Lewy navigator.
- Prawy inspector.
- Responsive preview.
- Block health checks.
- Template library z preview.

Efekt: Page Builder zaczyna zachowywać się jak narzędzie edytorskie, nie jak długa lista formularzy.

### Sprint 4 — Public Frontend Polish

Zakres:

- Brand layer.
- Product listing redesign.
- Product detail split/redesign.
- Checkout split/redesign.
- Design tokens dla bloków.
- Visual regression.

Efekt: sklep wygląda spójnie, szybciej się skanuje i lepiej wspiera zakup.

### Sprint 5 — Growth Features

Zakres:

- SEO/content quality panel.
- Campaign publishing.
- Segmentowane bloki.
- Preview share links.
- Revalidation/webhooks.

Efekt: CMS zaczyna wspierać realną pracę marketingu i content ops.

## Definition Of Done

Każdy większy obszar powinien spełniać:

- Serwer waliduje i sanityzuje dane, klient tylko pomaga UX-em.
- Snapshoty mają wersję i testy migracji.
- Każda mutacja ma Pest coverage.
- Każdy krytyczny flow ma Playwright smoke.
- Publiczny frontend ma test na desktop i mobile.
- UI ma loading, empty, error i conflict state.
- Teksty idą przez i18n.
- Typy nie żyją w `.tsx`, tylko w `*.types.ts`.
- Dokumentacja w `docs/`, `server/docs/USER_GUIDE.md`, `server/docs/DEVELOPER_GUIDE.md` jest aktualna przy zmianie funkcji.

## Moja Rekomendacja Kolejności

Nie zaczynałbym od redesignu publicznego frontendu. Najpierw P0 dla Page Buildera, bo publiczny frontend renderuje to, co builder zapisze. Potem RTE i stabilność edytora, bo to jest najczęstsza powierzchnia pracy redaktora. Dopiero potem pełny visual polish sklepu, bo wtedy design system i bloki będą miały stabilny kontrakt.

Największy zwrot z inwestycji:

1. Snapshot validator + transakcyjne zapisy.
2. Inspector/navigator w Page Builderze.
3. RTE toolbar + paste/link/media workflows.
4. Product detail i checkout redesign.
5. Visual regression dla bloków.
