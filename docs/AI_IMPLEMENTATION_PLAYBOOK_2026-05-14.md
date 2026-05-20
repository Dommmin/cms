# AI Implementation Playbook - Page Builder, RTE, Admin UI, Frontend

## Cel Dokumentu

Ten dokument jest instrukcją operacyjną dla AI/developera wdrażającego plan z:

- `docs/STAFF_ENGINEER_DESIGN_PLAN_2026-05-14.md`
- `docs/PAGE_BUILDER_RTE_AUDIT_2026-05-06.md`
- `docs/ADMIN_UI_AUDIT_2026-05-05.md`
- `docs/page-builder.md`

Ma prowadzić implementację krok po kroku, bez zgadywania architektury i bez mieszania wielu epików w jednym PR.

## Zasada Główna

Najpierw stabilność i bezpieczeństwo Page Buildera, potem ergonomia edytora, potem redesign publicznego frontendu.

Nie zaczynaj od wyglądu sklepu, dopóki snapshot buildera, walidacja, sanityzacja, import i zapisy nie są bezpieczne.

## Nieprzekraczalne Reguły Projektu

### Komendy

Wszystkie komendy Laravel/PHP uruchamiaj przez Docker:

```bash
docker compose exec php php artisan test --compact
docker compose exec php php artisan test --compact tests/Feature/SomeTest.php
docker compose exec php vendor/bin/pint --dirty
docker compose exec php npm run format:check
docker compose exec php npm run types
docker compose exec php npm run test:ui
docker compose exec node npx tsc
docker compose exec node npm run build
```

Nie uruchamiaj `php artisan`, `pint` ani testów Laravel bezpośrednio na hoście.

### Git

1. Na początku sprawdź `git status --short`.
2. Nie cofaj zmian, których nie zrobiłeś.
3. Commituj tylko pliki, które świadomie zmieniłeś.
4. Przed commitem sprawdź `git diff --staged`.
5. Nie commituj przy czerwonych testach.

### PHP

1. Każdy plik PHP ma mieć `declare(strict_types=1);`.
2. Używaj Form Request dla walidacji requestów.
3. Używaj serwisów dla logiki domenowej.
4. Używaj `Model::query()`, nie `DB::` dla standardowych query.
5. Przy transakcjach używaj `DB::transaction()` świadomie i lokalnie.
6. Po zmianach PHP uruchom `docker compose exec php vendor/bin/pint --dirty`.

### TypeScript

1. Nie dodawaj `interface` ani `type` w `.tsx`.
2. Typy komponentów trzymaj w `Name.types.ts`.
3. Typy API sprawdzaj w `client/types/api.ts` przed użyciem.
4. Admin Inertia routes używają Wayfinder z `@/actions/` i `@/routes/`.
5. Publiczne linki w `client/` używają `useLocalePath()` albo `lp()`.

### Dokumentacja

Po zmianie funkcji zaktualizuj:

- `docs/STAFF_ENGINEER_DESIGN_PLAN_2026-05-14.md`, jeśli zmienił się status lub zakres.
- `docs/page-builder.md`, jeśli zmienia się kontrakt buildera.
- `server/docs/USER_GUIDE.md`, jeśli zmienia się workflow redaktora.
- `server/docs/DEVELOPER_GUIDE.md`, jeśli zmienia się sposób rozszerzania.

## Standardowy Workflow Dla Każdego Zadania

### 1. Preflight

Uruchom:

```bash
git status --short
rg -n "nazwa_funkcji|klasa|route|komponent" server client docs
```

Przeczytaj aktualny kod przed edycją. Nie opieraj implementacji tylko na dokumentacji.

### 2. Zawężenie Zakresu

Przed edycją zapisz w notatkach:

- Co dokładnie zmieniasz.
- Jakie pliki są w zakresie.
- Jakie pliki są poza zakresem.
- Jakie testy potwierdzą zmianę.

Nie łącz refaktoru UI, walidacji backendu i redesignu publicznego frontendu w jednym zadaniu.

### 3. Implementacja

Wprowadzaj zmiany małymi krokami:

1. Test pokazujący brakujące zachowanie lub ryzyko.
2. Minimalna implementacja.
3. Refaktor tylko w obrębie dotkniętego modułu.
4. Dokumentacja.
5. Weryfikacja komendami.

### 4. Weryfikacja

Dobierz najwęższy sensowny zestaw:

- PHP-only: Pint + konkretne Pest tests + ewentualnie pełny backend test suite.
- Admin SPA: format/typecheck + manual review komponentu.
- Client Next.js: `npx tsc` + build + Playwright/screenshot dla UI.
- Page Builder/RTE: testy backendowe plus test interakcji lub manual browser verification, jeśli dotyczy UI.

### 5. Raport Końcowy

Raportuj:

- Co zmieniono.
- Jakie pliki są najważniejsze.
- Jakie testy uruchomiono.
- Co zostało świadomie poza zakresem.

## Kolejność Wdrażania

## Epic 0 - Stabilizacja Snapshotu Page Buildera

### Cel

Wszystkie wejścia, które zapisują snapshot Page Buildera, mają przechodzić przez jedną walidację, jedną sanityzację i jeden kontrakt danych.

### Zakres

Pliki do sprawdzenia:

- `server/app/Http/Requests/Admin/Cms/UpdatePageBuilderRequest.php`
- `server/app/Http/Controllers/Admin/Cms/PageBuilderController.php`
- `server/app/Http/Controllers/Admin/Cms/ReusableBlockController.php`
- `server/app/Http/Controllers/Admin/Cms/SectionTemplateController.php`
- `server/app/Http/Requests/Admin/Cms/StoreSectionTemplateRequest.php`
- `server/app/Services/PageBuilderSyncService.php`
- `server/app/Services/HtmlSanitizerService.php`
- `server/config/blocks.php`
- `server/config/purifier.php`

### Instrukcja Implementacji

1. Utwórz serwis `App\Services\PageBuilder\BlockConfigurationValidator`.
2. Utwórz serwis `App\Services\PageBuilder\PageBuilderSnapshotValidator`.
3. Przenieś logikę:
   - limit snapshotu,
   - limit sekcji,
   - limit bloków,
   - walidację typów bloków,
   - walidację relacji,
   - sanityzację pól richtext/html,
   - walidację `configuration` względem schema
   do wspólnych serwisów.
4. `UpdatePageBuilderRequest` ma tylko delegować do tych serwisów i zwracać poprawne błędy Laravel validation.
5. `ReusableBlockController` ma dostać Form Request:
   - `StoreReusableBlockRequest`
   - `UpdateReusableBlockRequest`
6. `SectionTemplateController::store()` ma walidować snapshot tym samym walidatorem.
7. `PageBuilderController::import()` nie może ręcznie tworzyć bloków z niezwalidowanego JSON-a.
8. Napraw odczyt rich text fields: użyj `config('blocks.block_types')`, nie `config('blocks')`.
9. Ujednolić kontrakt relacji na `relation_type`, `relation_id`, `relation_key`, `position`, `metadata`.

### Testy

Dodać Pest tests:

- `tests/Feature/Admin/Cms/PageBuilderSnapshotValidationTest.php`
- `tests/Feature/Admin/Cms/ReusableBlockValidationTest.php`
- `tests/Feature/Admin/Cms/SectionTemplateValidationTest.php`

Scenariusze:

- odrzuca nieznany block type,
- odrzuca nieznane pole w `configuration`,
- odrzuca zły typ pola,
- odrzuca wartość spoza enum,
- odrzuca relację niedozwoloną dla bloku,
- odrzuca nieistniejące `relation_id`,
- sanityzuje `<script>` w rich text,
- sanityzuje nested rich text w repeaterach,
- import JSON przechodzi przez te same reguły.

### Kryteria Akceptacji

- Nie istnieje ścieżka zapisu snapshotu bez wspólnej walidacji.
- Test XSS przechodzi dla Page Buildera, reusable blocks i templates.
- Błędy walidacji są 422 z nazwami pól użytecznymi dla UI.

## Epic 1 - Transakcyjne Zapisy i Optimistic Locking

### Cel

Zapisy buildera nie mogą częściowo skasować strony ani nadpisać pracy innego redaktora.

### Zakres

Pliki do sprawdzenia:

- `server/app/Http/Controllers/Admin/Cms/PageBuilderController.php`
- `server/app/Services/PageBuilderSyncService.php`
- `server/app/Services/PageVersionService.php`
- `server/app/Models/Page.php`
- migracje `pages`
- `server/resources/js/pages/admin/cms/pages/builder.tsx`

### Instrukcja Implementacji

1. W kontrolerze update/autosave/import użyj `DB::transaction()`.
2. W transakcji pobierz stronę przez `Page::query()->whereKey($id)->lockForUpdate()->firstOrFail()`.
3. Sprawdź `expected_version` po założeniu locka.
4. Jeśli wersja się nie zgadza, zwróć `409 Conflict` z:
   - `current_version`,
   - opcjonalnie aktualnym snapshotem,
   - komunikatem dla UI.
5. Dopiero po udanym `sync()` zrób increment wersji.
6. Twórz `PageVersion`:
   - manual save: normalna wersja,
   - autosave: wersja z flagą autosave,
   - import: wersja z typem/import note.
7. W UI rozdziel `isManualSaving` i `isAutoSaving`.
8. Dodaj kolejkę/cancel autosave:
   - jeśli trwa manual save, autosave nie startuje,
   - jeśli autosave trwa, manual save czeka albo anuluje autosave,
   - po konflikcie autosave przestaje próbować do czasu decyzji użytkownika.
9. Zastąp `window.confirm()` dialogiem w UI.

### Testy

Dodać Pest tests:

- manual save incrementuje wersję,
- autosave incrementuje wersję,
- zły `expected_version` zwraca 409,
- przy wyjątku w sync nie usuwa istniejących sekcji,
- import jest transakcyjny.

### Kryteria Akceptacji

- Delete/recreate nie może zostawić pustej strony po błędzie.
- UI pokazuje konflikt jako stan wymagający decyzji.
- Manual save i autosave nie ścigają się.

## Epic 2 - Server-Side Sanitization Dla Custom HTML/CSS

### Cel

Backend jest źródłem prawdy dla bezpieczeństwa HTML/CSS. Next.js może nadal sanitizować defensywnie, ale nie może być jedyną ochroną.

### Zakres

Pliki do sprawdzenia:

- `server/app/Services/HtmlSanitizerService.php`
- `server/config/purifier.php`
- `server/config/blocks.php`
- `client/components/page-builder/blocks/custom-html.tsx`
- `client/components/page-builder/section-renderer.tsx`

### Instrukcja Implementacji

1. Dodaj `CssSanitizerService`.
2. CSS sanitizer ma:
   - blokować `@import`,
   - blokować `expression()`,
   - blokować `javascript:`,
   - blokować `vbscript:`,
   - blokować niebezpieczne `data:` w `url()`,
   - usuwać zamykanie `<style>`,
   - limitować rozmiar pola.
3. Dodaj profile HTMLPurifier:
   - `default`,
   - `basic`,
   - `strict`,
   - `custom_html` tylko jeśli świadomie wspierane.
4. Dla `custom_html` dodaj osobne uprawnienie, np. `cms.custom_html.manage`.
5. Ukryj lub zablokuj edycję custom HTML w UI dla użytkowników bez uprawnienia.

### Testy

- CSS z `@import` jest czyszczony.
- CSS z `url(javascript:...)` jest czyszczony.
- HTML `<script>` nie zapisuje się.
- Użytkownik bez uprawnienia nie zapisuje `custom_html`.

### Kryteria Akceptacji

- Każde pole custom HTML/CSS jest sanityzowane przed zapisem.
- Publiczny renderer nie dostaje nieoczyszczonego payloadu.

## Epic 3 - Page Builder UX Reliability

### Cel

Redaktor może pracować długo, przestawiać bloki, cofać zmiany i nie tracić orientacji.

### Zakres

Pliki do sprawdzenia:

- `server/resources/js/pages/admin/cms/pages/builder.tsx`
- `server/resources/js/features/page-builder/hooks/use-builder-state.ts`
- `server/resources/js/features/page-builder/components/page-builder.tsx`
- `server/resources/js/features/page-builder/components/builder-toolbar.tsx`
- `server/resources/js/features/page-builder/components/blocks-list.tsx`
- `server/resources/js/features/page-builder/components/sortable-section.tsx`
- `server/resources/js/features/page-builder/components/block-card.tsx`

### Instrukcja Implementacji

1. Dodaj stabilne `client_id` dla nowych sekcji i bloków po stronie klienta.
2. React keys nie mogą używać samych indeksów.
3. Expanded state ma być oparty o `client_id` albo DB `id`, nie o indeks.
4. Undo/redo ma rozróżniać:
   - structural changes: add/delete/move,
   - field typing changes: debounce commit,
   - silent sync from props.
5. Clipboard:
   - zostawić namespace per page,
   - dodać timestamp,
   - dodać schema/version,
   - walidować payload przed paste.
6. Rozbić `builder-toolbar.tsx` na małe komponenty.
7. Rozbić `dynamic-block-form.tsx` na field renderers.
8. Dodać docelowo lewy navigator i prawy inspector jako osobny etap, nie w tym samym PR co stabilizacja.

### Testy

- Reorder nie resetuje expanded state.
- Delete nie rozwija złego bloku.
- Undo po pisaniu w RTE cofa sensowny krok, nie pojedynczy znak.
- Copy/paste odrzuca zły payload.

### Kryteria Akceptacji

- Klucze React są stabilne.
- Historia nie puchnie przy każdym keystroke.
- Duże komponenty są rozbite bez zmiany zachowania.

## Epic 4 - Rich Text Editor 2.0

### Cel

RTE ma być przewidywalny dla redaktora, bezpieczny dla headless API i łatwy do utrzymania.

### Zakres

Pliki do sprawdzenia:

- `server/resources/js/components/ui/rich-text-editor/`
- `server/resources/js/components/ui/rich-text-editor/lexical/Editor.tsx`
- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ToolbarPlugin.tsx`
- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/HtmlPlugin.tsx`
- `server/resources/js/components/ui/localized-field.tsx`

### Instrukcja Implementacji

1. Rozbij `ToolbarPlugin.tsx` na folder:
   - `ToolbarPlugin/index.tsx`
   - `BlockTypeDropdown.tsx`
   - `HistoryGroup.tsx`
   - `InlineFormatGroup.tsx`
   - `ListGroup.tsx`
   - `AlignmentGroup.tsx`
   - `ColorGroup.tsx`
   - `InsertGroup.tsx`
2. Wszystkie typy przenieś do `ToolbarPlugin.types.ts`.
3. Dodaj `mode="simple" | "full"` do `RichTextEditor`.
4. Page Builder rich text używa `simple` domyślnie.
5. Blog posts i long-form pages używają `full`.
6. Tooltipy i widoczny tekst idą przez `useTranslation()`.
7. Link insertion wspiera:
   - `https://`,
   - `mailto:`,
   - `tel:`,
   - `/relative`,
   - `#anchor`.
8. Dodaj internal link picker jako osobne zadanie:
   - pages,
   - products,
   - categories,
   - blog posts.
9. Zaprojektuj migrację do `content_json + content_html`, ale nie rób jej w tym samym PR co rozbicie toolbaru.

### Testy

- Wpisywanie wywołuje `onChange`.
- Debounce nie gubi ostatniej zmiany.
- Zmiana `instanceKey` resetuje edytor.
- Link relative jest dozwolony.
- Toolbar w `simple` ukrywa zaawansowane grupy.

### Kryteria Akceptacji

- Toolbar nie jest monolitem.
- RTE ma tryby dopasowane do kontekstu.
- Teksty są tłumaczalne.

## Epic 5 - Visual Builder: Navigator, Inspector, Responsive Preview

### Cel

Page Builder ma działać jak narzędzie edytorskie, nie długa lista formularzy.

### Instrukcja Implementacji

Wdrażaj w trzech PR-ach:

1. Navigator:
   - lewy panel z listą sekcji/bloków,
   - aktywny blok,
   - hide/show,
   - duplicate,
   - scroll to block.
2. Inspector:
   - prawy panel konfiguracji aktywnego section/block,
   - inline lista zostaje jako fallback tylko na czas migracji,
   - walidacja pól przy polu.
3. Responsive preview:
   - desktop/tablet/mobile,
   - iframe/canvas frame,
   - refresh po save/autosave,
   - status czy preview jest aktualny.

### Kryteria Akceptacji

- Redaktor widzi strukturę strony bez przewijania całego canvasu.
- Aktywny element ma jasny focus/outline.
- Preview mobile nie wymaga otwierania nowej karty.

## Epic 6 - Public Frontend Design System

### Cel

Publiczny frontend ma przestać wyglądać jak starter. Ma mieć spójny brand, komponenty handlowe i przewidywalny rendering bloków.

### Zakres

Pliki do sprawdzenia:

- `client/app/globals.css`
- `client/components/layout/header.tsx`
- `client/components/layout/header-client.tsx`
- `client/components/product-card.tsx`
- `client/app/products/ProductsClient.tsx`
- `client/app/products/[slug]/ProductDetailClient.tsx`
- `client/app/checkout/page.tsx`
- `client/components/page-builder/`

### Instrukcja Implementacji

1. Najpierw dodaj design tokens:
   - spacing,
   - radius,
   - elevation,
   - product image ratio,
   - focus ring,
   - section spacing,
   - content width.
2. Header:
   - zastąp hardcoded `CMS` brand slotem z konfiguracji,
   - zachowaj locale-prefixed links.
3. Product listing:
   - desktop filters sidebar,
   - mobile drawer,
   - active filter chips,
   - licznik aktywnych filtrów,
   - empty state z akcją.
4. Product detail:
   - rozbij 891 LOC na komponenty:
     - `ProductGallery`,
     - `ProductBuyBox`,
     - `VariantSelector`,
     - `DeliveryPanel`,
     - `ProductTabs`,
     - `ReviewsSection`,
     - `RelatedProducts`.
5. Checkout:
   - rozbij 922 LOC na kroki i komponenty,
   - step indicator ma pokazywać realny postęp,
   - order summary sticky desktop i collapsible mobile.
6. Page Builder blocks:
   - ujednolić spacing,
   - ujednolić typografię,
   - dopilnować mobile,
   - dodać visual regression dla top bloków.

### Testy

- `docker compose exec node npx tsc`
- `docker compose exec node npm run build`
- Playwright dla:
  - products listing mobile/desktop,
  - product detail mobile/desktop,
  - checkout happy path,
  - page builder render home page.

### Kryteria Akceptacji

- Brak poziomego scrolla na 375 px.
- CTA i przyciski mają minimum 44 px wysokości/touch target.
- Product detail i checkout są podzielone na komponenty.
- Design tokens są używane zamiast ad hoc klas tam, gdzie to praktyczne.

## Epic 7 - Content Quality, SEO, Publishing

### Cel

CMS ma pomagać redaktorowi publikować lepsze treści, a nie tylko zapisywać HTML.

### Instrukcja Implementacji

1. Page health panel:
   - brak H1,
   - więcej niż jeden H1,
   - puste CTA,
   - link bez href,
   - obraz bez alt,
   - za długi title/meta description,
   - brak OG image.
2. SEO preview:
   - Google snippet,
   - Open Graph card,
   - canonical,
   - robots.
3. Publishing:
   - kalendarz publikacji,
   - kampanie contentowe,
   - preview links z wygasaniem,
   - webhook/revalidation event po publikacji.
4. Personalizacja:
   - segment rules per block,
   - logged-in/logged-out,
   - locale/currency/country,
   - UTM/source.

### Kryteria Akceptacji

- Redaktor przed publikacją widzi ostrzeżenia jakościowe.
- Publikacja wywołuje invalidację/cache refresh.
- Preview link ma expiry i nie wymaga logowania.

## Instrukcja Dla AI - Jak Brać Następne Zadanie

Użyj tego wzoru:

```text
Weź następny niewdrożony punkt z docs/AI_IMPLEMENTATION_PLAYBOOK_2026-05-14.md.
Zacznij od Epic 0, chyba że użytkownik wskaże inny epic.
Najpierw sprawdź aktualny kod i git status.
Zaimplementuj najmniejszy spójny zakres, dodaj testy, uruchom wymagane komendy Docker, zaktualizuj dokumentację.
Nie dotykaj niepowiązanych zmian.
Na końcu opisz pliki, testy i pozostały zakres.
```

## Instrukcja Dla AI - Jak Raportować Postęp W Dokumentach

Po każdym zakończonym zadaniu dodaj krótki wpis do sekcji niżej.

Format:

```markdown
### YYYY-MM-DD - Epic X - krótki tytuł

Status: Done / Partial / Blocked
Zmiany:
- ...

Testy:
- ...

Pozostało:
- ...
```

## Log Wdrożeń

### 2026-05-20 - Epic 5 - responsive preview Page Buildera

Status: Partial

Zmiany:
- Dodano prawy panel responsive preview w Page Builderze z trybami desktop/tablet/mobile.
- Builder pobiera podpisany URL preview przez `PageBuilderController::previewUrl()` i odświeża iframe po manual save oraz autosave.
- Panel pokazuje status aktualności preview na podstawie niezapisanych zmian i pozwala ręcznie odświeżyć lub otworzyć preview w nowej karcie.
- Przy okazji ustabilizowano `NotificationBell`, żeby nie crashował, gdy endpoint zwróci payload bez tablicy `data`.

Testy:
- `docker compose exec php npm run format`
- `docker compose exec php npm run types`
- `docker compose exec php npm run format:check`

Pozostało:
- Inspector jako prawy panel konfiguracji aktywnego section/block.

### 2026-05-14 - Epic 0 - wspólna walidacja snapshotu

Status: Partial

Zmiany:
- Dodano `BlockConfigurationValidator` i `PageBuilderSnapshotValidator`.
- Podpięto wspólną walidację i sanityzację pod manual save, autosave, import JSON, reusable blocks i section templates.
- Ujednolicono kontrakt relacji na `relation_type`, `relation_id`, `relation_key`, `position`, `metadata`.
- Eksport Page Buildera zawiera teraz relacje bloków.

Testy:
- `docker compose exec php php artisan test --compact tests/Feature/Admin/Cms/PageBuilderSnapshotValidationTest.php tests/Feature/Admin/Cms/ReusableBlockValidationTest.php tests/Feature/Admin/Cms/SectionTemplateValidationTest.php`

Pozostało:
- Transakcyjne zapisy i atomowy optimistic locking z Epic 1.
- Osobny server-side CSS sanitizer i permission gate dla custom HTML/CSS z Epic 2.

### 2026-05-16 - Epic 1 - transakcyjne zapisy buildera

Status: Partial

Zmiany:
- Manual save, autosave i import działają przez `DB::transaction()`.
- Strona jest pobierana w transakcji przez `lockForUpdate()`, a `expected_version` jest sprawdzane po założeniu locka.
- Wersja strony jest inkrementowana dopiero po udanym `PageBuilderSyncService::sync()`.
- `PageVersion` dostaje metadane `is_autosave` i `source` (`manual`, `autosave`, `import`).
- Awaria w trakcie sync rollbackuje usunięte sekcje i bloki.

Testy:
- `docker compose exec php php artisan test --compact tests/Feature/Admin/Cms/PageBuilderTransactionalSaveTest.php tests/Feature/Admin/Cms/PageBuilderSnapshotValidationTest.php tests/Feature/Admin/Cms/ReusableBlockValidationTest.php tests/Feature/Admin/Cms/SectionTemplateValidationTest.php`

Pozostało:
- Długofalowo: zastąpić delete/recreate diff/upsert, żeby zachować stabilne ID.

### 2026-05-16 - Epic 2 - server-side custom HTML/CSS hardening

Status: Partial

Zmiany:
- Dodano `CssSanitizerService` dla pól `custom_html.css`.
- `custom_html.html` przechodzi przez osobny profil HTMLPurifier `custom_html`.
- Dodano profile HTMLPurifier `basic`, `strict` i `custom_html`.
- Dodano permission `cms.custom_html.manage` i blokadę zapisu custom HTML bez tego uprawnienia.
- Custom CSS usuwa `@import`, `expression()`, script URLs, unsafe `data:` URLs i `</style`.

Testy:
- `docker compose exec php php artisan test --compact tests/Feature/Admin/Cms/CustomHtmlSanitizationTest.php tests/Feature/Admin/Cms/PageBuilderTransactionalSaveTest.php tests/Feature/Admin/Cms/PageBuilderSnapshotValidationTest.php tests/Feature/Admin/Cms/ReusableBlockValidationTest.php tests/Feature/Admin/Cms/SectionTemplateValidationTest.php`

Pozostało:
- Dalsze hardening tasks z kolejnych epików.

### 2026-05-18 - Epic 5 - navigator Page Buildera

Status: Partial

Zmiany:
- Dodano desktopowy lewy navigator dla Page Buildera z listą sekcji i bloków.
- Kliknięcie pozycji w navigatorze ustawia aktywny element, rozwija go i przewija do karty w builderze.
- Sekcje i bloki mają wizualny active outline oparty o stabilne `client_id`.
- Navigator pozwala ukrywać/pokazywać oraz duplikować sekcje i bloki.
- `useBuilderState` dostał operacje `duplicateSection` i `duplicateBlock`, które tworzą nowe `client_id` i przeliczają pozycje.
- Zaktualizowano `.ai/guide.md`, `server/docs/USER_GUIDE.md` i `server/docs/DEVELOPER_GUIDE.md`.

Testy:
- Do uruchomienia po implementacji: `docker compose exec php npm run format`
- Do uruchomienia po implementacji: `docker compose exec php npm run types`
- Do uruchomienia po implementacji: `docker compose exec php npm run format:check`

Pozostało:
- Inspector jako prawy panel konfiguracji aktywnego section/block.

### 2026-05-16 - Epic 3 - stabilne identyfikatory w builderze

Status: Partial

Zmiany:
- Sekcje i bloki w admin Page Builderze dostają stabilne `client_id`.
- React keys, DnD ids i expanded state używają `client_id` zamiast indeksów.
- Usunięcie/reorder sekcji lub bloków nie powinno już rozwijać złego elementu.
- Clipboard bloków ma namespace per page, `schema`, `version`, `copied_at` i walidację payloadu przed paste.
- Debounced history dla edycji pól zapisuje stan sprzed serii zmian, żeby undo po typing miało sensowny krok.

Testy:
- `docker compose exec php npm run format`
- `docker compose exec php npm run types`
- `docker compose exec php npm run format:check`

Pozostało:
- Rozbicie `builder-toolbar.tsx` i `dynamic-block-form.tsx` na mniejsze komponenty.
- Osobny etap dla navigatora i inspectora.

### 2026-05-16 - Epic 3 - podział dużych komponentów buildera

Status: Done

Zmiany:
- `builder-toolbar.tsx` został sprowadzony do orkiestratora akcji toolbara.
- Wyciągnięto osobne komponenty dla statusu zapisu, undo/redo, harmonogramu, import/export, approval workflow i zapisu szablonu.
- `dynamic-block-form.tsx` został rozdzielony na renderery pól schema-driven, repeater, sekcję relacji i helpery konwersji relacji.
- `blocks-list.tsx` został rozdzielony na modal biblioteki, header akcji, hook clipboarda i sortable list.
- Typy propsów nowych komponentów przeniesiono do plików `.types.ts`, zgodnie z regułą braku definicji typów w `.tsx`.

Testy:
- `docker compose exec php npm run format`
- `docker compose exec php npm run types`
- `docker compose exec php npm run format:check`

Pozostało:
- Osobny etap dla navigatora i inspectora.

### 2026-05-16 - Epic 1 - autosave UI i dialog nawigacji

Status: Partial

Zmiany:
- Page Builder rozdziela teraz manual save i autosave na osobne propsy/stany UI.
- Ręczny zapis czyści zaplanowane timery autosave i abortuje aktywne żądanie autosave.
- Autosave używa `AbortController` i ignoruje anulowane żądania.
- Natywny `window.confirm()` dla Inertia navigation guard został zastąpiony dialogiem UI.

Testy:
- `docker compose exec php npm run format`
- `docker compose exec php npm run types`
- `docker compose exec php npm run format:check`

Pozostało:
- Długofalowo: zastąpić delete/recreate diff/upsert, żeby zachować stabilne ID.

### 2026-05-16 - Epic 2 - Custom HTML UI gate i feature flag

Status: Done

Zmiany:
- Widok Page Buildera dostaje capability `can_manage_custom_html`.
- Użytkownicy bez `cms.custom_html.manage` nie widzą `custom_html` na liście dostępnych typów bloków.
- Dodano flagę `CMS_CUSTOM_HTML_ENABLED` przez `config('blocks.custom_html_enabled')`.
- Wyłączona flaga ukrywa Custom HTML w UI i odrzuca zapis po stronie backendu.
- Backendowa walidacja uprawnień pozostaje twardą blokadą zapisu Custom HTML.

Testy:
- `docker compose exec php vendor/bin/pint --dirty`
- `docker compose exec php php artisan test --compact tests/Feature/Admin/Cms/CustomHtmlSanitizationTest.php`
- `docker compose exec php npm run format`
- `docker compose exec php npm run types`
- `docker compose exec php npm run format:check`

Pozostało:
- Dalsze hardening tasks z kolejnych epików.

### 2026-05-16 - Epic 4 - tryby Rich Text Editor

Status: Partial

Zmiany:
- `RichTextEditor` i Lexical `Editor` przyjmują teraz `mode="simple" | "full"`.
- Domyślny tryb pozostaje `full`, żeby nie zmieniać long-form editorów.
- Page Builder używa `mode="simple"` dla pól rich text w blokach.
- Prosty toolbar ukrywa zaawansowane grupy: code language, inline code, sub/superscript, highlight, font size/family/color, spellcheck, alignment i insert menu.
- Typy propsów toolbara zostały przeniesione do `ToolbarPlugin.types.ts`.
- Stałe toolbara zostały wydzielone do `ToolbarPlugin.constants.tsx`.
- Bazowe kontrolki toolbara zostały wydzielone do `ToolbarPlugin.controls.tsx`.
- Dialogi wstawiania YouTube, tabeli, emoji i znaków specjalnych zostały wydzielone do `ToolbarPlugin.dialogs.tsx`.
- Menu typu bloku i menu wstawiania zostały wydzielone do `ToolbarPlugin.menus.tsx`.
- Grupy historii, formatowania inline, fontów/koloru, wyrównania i linku zostały wydzielone do `ToolbarPlugin.groups.tsx`.
- Widoczne teksty toolbara i dialogów RTE używają `useTranslation()` z angielskimi fallbackami.
- Link insertion używa dialogu z walidacją `https://`, `mailto:`, `tel:`, `/relative` i `#anchor`.
- Walidacja linków została ujednolicona w `lexical/link-url.ts` dla `LinkPlugin`, toolbara i floating link editora.
- Toolbar został przeniesiony do folderu `ToolbarPlugin/index.tsx` z lokalnymi plikami `constants`, `controls`, `dialogs`, `groups`, `menus`, `types`.
- Dodano Vitest + Testing Library dla admin SPA oraz testy URL linków i widoczności kontrolek toolbara w trybach `simple`/`full`.

Testy:
- `docker compose exec php npm run format`
- `docker compose exec php npm run types`
- `docker compose exec php npm run format:check`
- `docker compose exec php npm run test:ui`

Pozostało:
- Dalsze hardening tasks z kolejnych epików.
