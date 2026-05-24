# Page Builder + RTE — Remaining Work

> Status: **todo**  
> Created: 2026-05-24  
> Scope: domknięcie planów `page-builder-ux-v2.md` i `rte-mega-improvement.md` po stanie HEAD `19f3634`.

Ten plik jest instrukcją dla kolejnego AI/agenta. Nie zakładaj, że stare plany są w 100% aktualne:
część funkcji już istnieje, część jest tylko częściowa, a część nadal nie została wdrożona.

## Zasady Pracy

1. Najpierw sprawdź aktualny kod, nie tylko dokumentację.
2. Pracuj małymi, atomowymi zmianami.
3. Nie ruszaj istniejących funkcji, jeśli nie są potrzebne do domknięcia konkretnego punktu.
4. Po zmianach PHP uruchom `docker compose exec -T php vendor/bin/pint --dirty`.
5. Testy uruchamiaj w Dockerze:
   - Admin/Laravel/Inertia: `docker compose exec -T php ...`
   - Storefront Next.js: `docker compose exec -T node ...`
6. Nie commituj bez osobnej zgody użytkownika.
7. Po wdrożeniu funkcji zaktualizuj:
   - `.ai/guide.md`
   - właściwy plan w `.ai/plans/`
   - `docs/backend.md` lub `docs/frontend.md`, jeśli zmienia się architektura
   - `server/docs/USER_GUIDE.md` i `server/docs/DEVELOPER_GUIDE.md`, jeśli zmienia się zachowanie edytora/admina

## Aktualny Stan W Skrócie

### Już Jest

- Theme design tokens: `typography`, `spacing`, `buttons`, `containers`.
- CSS variables z theme po stronie Laravel i Next.js.
- Image crop modal + backend crop endpoint + focal point.
- Page Builder `CanvasView`, ale tylko jako uproszczony podgląd/placeholder.
- Quick add block, skróty klawiszowe, block patterns.
- Lazy loading sekcji i code splitting bloków.
- RTE `standard` mode, `full` dla `rich_text`.
- RTE Callout, background/highlight color, table action menu, table presets.
- RTE Find & Replace, Shortcuts dialog, Clipboard image paste, image filters.
- RTE EmbedNode dla YouTube, Vimeo, Spotify, Loom, TikTok.
- RTE export HTML + plain text.

### Nadal Brakuje / Jest Częściowe

- Prawdziwy visual canvas z renderowaniem bloków, a nie placeholderów.
- Inline editing prostych pól w Page Builderze.
- Tryb Simple/Advanced w builderze.
- Pełne testy dla page builder block renderingu, theme tokens i crop endpointu.
- Pełny image editing UX: zoom, lepszy focal-point workflow, crop variants w RTE ImageNode.
- RTE embeds dla Instagram i Twitter/X przez backend oEmbed/proxy.
- RTE snippets.
- Link autocomplete w URL input + broken-link validation/health.
- Mobile/touch support dla RTE image resize.
- Markdown export.

## Priorytet 1 — Page Builder Visual Canvas

Status 2026-05-24: **częściowo wdrożone**. Adminowy Canvas renderuje realne preview dla `hero_banner`, `rich_text`, `call_to_action`, `image_gallery` i `featured_products`; kliknięcie wybiera blok, double-click/Edit otwiera inspector, a inline edit obsługuje proste pola tekstowe (`title`, `heading`, `subtitle`, `description`, `primary_label`, `secondary_label`) przez `useBuilderState.updateBlockConfigurationField()`. Cards view pozostaje fallbackiem. Do domknięcia nadal zostało rozszerzenie preview na pozostałe bloki i pełniejsza zgodność wizualna ze storefrontem.

To jest najważniejsza luka UX. Obecny `CanvasView` renderuje sekcje i placeholdery bloków, ale nie renderuje prawdziwych komponentów bloków. Celem jest zbliżenie do Shopify/Gutenberg.

### Cel

W trybie Canvas użytkownik widzi stronę jako realny preview:

- sekcje mają prawdziwe tła, paddingi i layout,
- bloki renderują się możliwie tak jak na storefront,
- kliknięcie wybiera blok,
- double-click lub przycisk Edit otwiera inspector,
- proste pola tekstowe mogą być edytowane inline.

### Pliki Startowe

- `server/resources/js/features/page-builder/components/canvas-view.tsx`
- `server/resources/js/features/page-builder/components/page-builder.tsx`
- `server/resources/js/features/page-builder/components/page-inspector.tsx`
- `server/resources/js/features/page-builder/components/dynamic-block-form/`
- `client/components/page-builder/block-renderer.tsx`
- `client/components/page-builder/section-renderer.tsx`
- `client/components/page-builder/blocks/`

### Instrukcje Implementacyjne

1. Nie kopiuj ślepo komponentów z `client/`, jeśli importy Next.js nie działają w adminie. Najpierw sprawdź zależności.
2. Najlepsza ścieżka:
   - wydziel wspólny, framework-agnostic renderer bloków, jeśli obecny `client/components/page-builder/block-renderer.tsx` ma zależności Next.js,
   - albo zbuduj adminowy `CanvasBlockPreview` z mapą najważniejszych typów bloków jako pierwszy krok.
3. Zacznij od 5 najważniejszych bloków:
   - `hero_banner`
   - `rich_text`
   - `call_to_action`
   - `image_gallery`
   - `featured_products` jako placeholder danych, jeśli relacje są trudne
4. Dopiero potem rozszerz na pozostałe bloki.
5. Zachowaj obecny Cards view jako fallback.

### Inline Editing

Dodaj inline editing tylko dla prostych pól tekstowych:

- `title`
- `heading`
- `subtitle`
- `description`
- `primary_label`
- `secondary_label`

Nie próbuj inline edytować repeaterów, relacji, obrazów ani rich text w pierwszym kroku.

Minimalny kontrakt:

```tsx
onInlineEdit(sectionIndex, blockIndex, field, value)
```

W `use-builder-state.ts` dodaj akcję aktualizującą `block.configuration[field]`.

### Akceptacja

- [x] Canvas renderuje realną treść dla minimum 5 typów bloków.
- [x] Kliknięcie bloku wybiera go i synchronizuje z inspectorem.
- [x] Double-click otwiera inspector.
- [x] Inline edit aktualizuje konfigurację i ustawia unsaved state.
- [x] Cards view nadal działa.

## Priorytet 2 — Page Builder Simple / Advanced Mode

Status 2026-05-24: **wdrożone**. Toolbar ma przełącznik `Simple` / `Advanced`. Simple mode przełącza builder do Canvas, zostawia inline editing, ogranicza formularze do podstawowych pól scalar i relacji media, ukrywa sekcję Advanced bloków oraz scroll animation sekcji bez usuwania danych z konfiguracji. Advanced mode pokazuje pełny schema-driven formularz.

### Cel

Użytkownik może przełączyć tryb pracy:

- **Simple**: canvas + inline editing + podstawowe pola w inspectorze.
- **Advanced**: obecny pełny formularz + zaawansowane opcje.

### Pliki Startowe

- `server/resources/js/features/page-builder/components/builder-toolbar.tsx`
- `server/resources/js/features/page-builder/components/page-builder.tsx`
- `server/resources/js/features/page-builder/components/page-inspector.tsx`
- `server/resources/js/features/page-builder/components/dynamic-block-form/`

### Instrukcje

1. Dodaj state `editorMode: 'simple' | 'advanced'`.
2. Toolbar dostaje segmented control.
3. W Simple mode ukryj sekcje Advanced/CSS/animation/lock, chyba że blok jest zablokowany.
4. Nie usuwaj pól z danych. Ukrycie dotyczy tylko UI.

### Akceptacja

- [x] Przełącznik działa bez utraty danych.
- [x] Simple mode pokazuje mniej pól.
- [x] Advanced mode pokazuje pełny obecny formularz.

## Priorytet 3 — Image Editing Domknięcie

Obecnie istnieje crop modal i backend endpoint, ale UX nie jest pełny.

Status 2026-05-24: **wdrożone w pierwszym pełnym zakresie**. Crop modal ma zoom slider, focal point można ustawić kliknięciem obrazu, a frontend wysyła crop coordinates przeliczone do naturalnych pikseli obrazu. Backend odrzuca nie-obrazy, używa `manualCrop()`, zapisuje `crop_of`, `crop_params`, `crop_variant`, wymiary i focal point metadata oraz zwraca je w odpowiedzi. Media search wystawia `crop_variants`, a RTE `ImageNode` zapisuje i eksportuje crop variant metadata oraz pozwala wybrać dostępny wariant w panelu metadanych obrazu. Dodano `ImageCropTest`.

### Braki

- Brak zoomu w crop modal.
- Focal point jest zapisywany, ale workflow jest mylący.
- RTE ImageNode nie ma wyboru crop variants.
- Testy backend crop są niewystarczające albo brak ich w planowanym zakresie.

### Pliki Startowe

- `server/resources/js/components/image-editor-modal.tsx`
- `server/resources/js/components/media-picker-modal.tsx`
- `server/app/Http/Controllers/Admin/MediaController.php`
- `server/app/Http/Requests/Admin/MediaCropRequest.php`
- `server/resources/js/components/ui/rich-text-editor/image-node.tsx`
- `server/tests/Feature/`

### Instrukcje

1. Dodaj zoom slider w `ImageEditorModal`.
2. Upewnij się, że crop coordinates są poprawne przy rotacji i zoomie.
3. Zwracaj z backendu metadane crop variantu.
4. W `ImageNode` dodaj możliwość wyboru wariantu obrazu, jeśli media metadata go zawiera.
5. Dodaj test `ImageCropTest`:
   - walidacja parametrów,
   - odrzucenie nie-obrazów,
   - wygenerowanie nowego media,
   - zapis `crop_of` i `crop_params`,
   - zapis focal point.

### Akceptacja

- [x] Crop działa z presetami i zoomem.
- [x] RTE może użyć wariantu crop.
- [x] Test backendowy przechodzi.

## Priorytet 4 — RTE Embeds: oEmbed / Instagram / Twitter/X

Status: wdrożono bezpieczny wariant bez backendowego oEmbed. Instagram i Twitter/X są rozpoznawane przez `EmbedNode`, ale eksportują placeholder z linkiem zamiast iframe/HTML z zewnętrznego oEmbed. Dzięki temu nie wymagają tokenów i nie rozszerzają whitelisty `URI.SafeIframeRegexp`.

Obecnie `EmbedNode` obsługuje bezpieczne iframe URL-e dla:

- YouTube
- Vimeo
- Spotify
- Loom
- TikTok

Uzupełniono:

- Instagram
- Twitter/X

Nie dodano:

- backendowego oEmbed/proxy z cache, bo dla Instagram i Twitter/X stabilniejszy jest bezpieczny placeholder + link.

### Pliki Startowe

- `server/resources/js/components/ui/rich-text-editor/embed-node.tsx`
- `server/resources/js/components/ui/rich-text-editor/embed-node.test.ts`
- `server/config/purifier.php`
- `server/tests/Feature/HtmlSanitizationTest.php`
- `server/routes/admin.php`

### Instrukcje

1. Dodaj `EmbedController` tylko jeśli jest realnie potrzebny dla platformy.
2. Endpoint:

```http
GET /admin/embed/oembed?url=https://...
```

3. Cache 24h.
4. Nie zapisuj surowego HTML z zewnętrznego oEmbed bez sanitizacji.
5. Dla Twitter/X i Instagram rozważ render przez bezpieczny placeholder + link, jeśli iframe/oEmbed jest niestabilny lub wymaga tokenów.

### Akceptacja

- [x] YouTube/Vimeo/Spotify/Loom/TikTok dalej działają.
- [x] Instagram/Twitter/X nie wprowadzają unsafe HTML.
- [x] Sanitizer blokuje obce iframe.
- [x] Testy pokrywają supported i unsupported providers.

## Priorytet 5 — RTE Snippets

Status: wdrożono pierwszą iterację localStorage bez DB. `Insert > Snippets` pozwala zapisać aktualne zaznaczenie jako HTML snippet i wstawić zapisany snippet w bieżącej pozycji kursora.

### Cel

Użytkownik może zapisać zaznaczony fragment jako snippet i wstawić go później.

### Pliki Startowe

- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/`
- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ToolbarPlugin/`

### Instrukcje

1. Zacznij od localStorage.
2. Dodaj `SnippetsPlugin.tsx`.
3. Dodaj menu `Insert > Snippets`.
4. Zapisuj:
   - `id`
   - `name`
   - serialized editor fragment albo HTML
   - `createdAt`
5. Nie dodawaj DB na pierwszą iterację.

### Akceptacja

- [x] Można zapisać zaznaczenie jako snippet.
- [x] Można wstawić snippet w bieżącej pozycji kursora.
- [x] Snippety przeżywają reload przeglądarki.

## Priorytet 6 — Link Autocomplete + Broken Link Health

Status: wdrożono. Zakładka URL w `LinkDialog` pokazuje autocomplete dla wpisów bez schematu, korzystając z `admin.rte.links.search`. `ContentHealthPlugin` zbiera tylko relatywne linki wewnętrzne i waliduje je przez `admin.rte.links.validate`, bez sprawdzania zewnętrznych URL-i z przeglądarki.

### Cel

Ulepszyć linkowanie wewnętrzne i wykrywanie błędnych linków.

### Obecnie

`LinkDialog` ma zakładkę Internal z wyszukiwarką przez `admin.rte.links.search`.

### Braki

- Brak walidacji zewnętrznych URL-i. Celowo pominięte w tej iteracji, żeby uniknąć CORS i niestabilnych requestów HEAD z przeglądarki.

### Pliki Startowe

- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ToolbarPlugin/dialogs.tsx`
- `server/resources/js/components/ui/rich-text-editor/lexical/link-url.ts`
- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/content-health.ts`
- `server/app/Http/Controllers/Admin/RteLinkController.php`

### Instrukcje

1. Najpierw dodaj autocomplete dla internal URLs w URL tab.
2. Potem dodaj broken-link health tylko dla internal links.
3. Nie rób HEAD requestów do zewnętrznych URL-i z przeglądarki jako pierwszy krok, bo CORS będzie niestabilny.
4. Jeśli potrzebne zewnętrzne sprawdzanie, dodaj backendowy endpoint z rate limitingiem i cache.

### Akceptacja

- [x] Wpisanie `prod` w URL input pokazuje produkty/strony/posty.
- [x] Internal link do nieistniejącego zasobu pokazuje warning.
- [x] Zewnętrzne linki nadal przechodzą normalną walidację scheme.

## Priorytet 7 — Mobile / Touch RTE

Status: wdrożono podstawę touch/mobile. `ImageNode` używa pointer events (`pointerdown/move/up/cancel`) do resize, resize handle ma 32px touch target, a toolbar na małych ekranach przewija się poziomo zamiast łamać layout.

### Cel

Image resize i toolbar mają działać sensownie na touch devices.

### Pliki Startowe

- `server/resources/js/components/ui/rich-text-editor/image-node.tsx`
- `server/resources/css/editor.css`
- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ToolbarPlugin/`

### Instrukcje

1. Zamień mouse handlers resize na pointer events:
   - `pointerdown`
   - `pointermove`
   - `pointerup`
2. Dodaj touch target minimum 32px dla resize handles.
3. Toolbar na mobile powinien przewijać się poziomo albo zwijać w menu.
4. Pinch zoom zostaw na końcu. Najpierw pointer resize.

### Akceptacja

- [x] Resize obrazu działa myszą i dotykiem.
- [x] Toolbar nie rozwala layoutu na małej szerokości.

## Priorytet 8 — Markdown Export

Status: wdrożono. `ExportPlugin` ma przycisk `MD`, który eksportuje aktualny dokument przez `@lexical/markdown` do `content.md`.

### Obecnie

`ExportPlugin` obsługuje HTML i plain text.

### Cel

Dodać eksport Markdown.

### Pliki Startowe

- `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ExportPlugin.tsx`

### Instrukcje

Użyj `@lexical/markdown`:

```ts
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
```

Dodaj przycisk `MD`, który pobiera `content.md`.

### Akceptacja

- [x] Export HTML nadal działa.
- [x] Export TXT nadal działa.
- [x] Export MD pobiera markdown bez crasha.

## Priorytet 9 — Testy Page Buildera

To jest największy brak jakościowy.

Status 2026-05-24: **częściowo wdrożone**. `client/` ma minimalny Vitest setup (`npm run test:ui`) dla smoke testów rendererów w środowisku Node. Dodano `tests/unit/page-builder-renderers.test.tsx`, który przechodzi przez wszystkie 30 typów bloków storefront Page Buildera, mockuje zależności Next/browser/API, osobno wskazuje awarię konkretnego typu bloku oraz obejmuje `SectionRenderer` i `SectionLazyWrapper`. Nadal do zrobienia: głębsze testy variantów light/dark/brand, layoutów, theme token inheritance i crop endpointu.

### Minimalny Zakres

1. Snapshot/smoke testy dla wszystkich block components:
   - każdy blok renderuje się z minimalną konfiguracją,
   - brak crasha,
   - kluczowa treść trafia do DOM.
2. Test `SectionRenderer`:
   - variant light/dark/brand,
   - layout contained/full-width,
   - lazy loading.
3. Test theme token inheritance:
   - CSS variables są używane w rendererze,
   - fallbacki działają.
4. Test crop endpointu.

### Pliki Startowe

- `client/components/page-builder/blocks/`
- `client/components/page-builder/block-renderer.tsx`
- `client/components/page-builder/section-renderer.tsx`
- `server/tests/Feature/`

### Instrukcje

1. Najpierw sprawdź, czy klient ma skonfigurowany test runner dla React.
2. Jeśli nie, dodaj minimalny setup ostrożnie i zgodnie z istniejącym stackiem.
3. Nie mieszaj test setupu z refaktorem komponentów w jednym commicie.

### Akceptacja

- [x] Istnieje test, który przechodzi przez wszystkie typy bloków.
- [x] Awaria pojedynczego bloku jest łatwa do zlokalizowania.
- [ ] Theme token inheritance jest pokryte testem.
- [ ] Crop endpoint jest pokryty testem w planowanym zakresie.

## Kolejność Rekomendowana

1. Page Builder Visual Canvas dla 5 bloków.
2. Inline editing prostych pól.
3. Simple/Advanced mode.
4. Testy smoke dla tych 5 bloków i canvas flow.
5. Image editing domknięcie.
6. RTE oEmbed dla Instagram/Twitter/X.
7. RTE snippets.
8. Link autocomplete + broken internal links.
9. Mobile/touch RTE.
10. Markdown export.
11. Pełne testy 30 bloków.

## Kryterium Domknięcia Całości

Całość można uznać za wdrożoną dopiero gdy:

- Page Builder canvas renderuje realne bloki, nie placeholdery.
- Najczęstsze pola tekstowe są edytowalne inline.
- Inspector działa jako uzupełnienie canvasu, nie jedyny sposób edycji.
- Crop/image workflow działa od media pickera po RTE.
- RTE ma embedy, snippets, link health, markdown/plain export i touch resize.
- Istnieją testy dla page builder renderingu i krytycznych RTE nodes.
- Dokumentacja `.ai/guide.md`, user guide i developer guide opisują stan zgodny z kodem.
