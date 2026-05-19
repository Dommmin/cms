# RTE Enterprise Implementation Plan - 2026-05-18

## Cel

Rich Text Editor ma działać jak edytor klasy enterprise dla redaktorów CMS: stabilne pisanie, bezpieczny output, przewidywalne media, galerie, załączniki, paste cleanup, a11y checks i testy interakcji. Ten plan jest osobnym backlogiem RTE, bo obecne problemy z obrazami, resize i tekstem obok zdjęcia wymagają kontraktu edytora, node'ów i HTML outputu, nie tylko poprawki UI.

## Stan Obecny

### Co Już Jest

- Lexical RTE w `server/resources/js/components/ui/rich-text-editor/`.
- Tryby `simple` i `full` dla toolbara.
- Toolbar z blokami, formatowaniem inline, linkami, tabelą, YouTube, kolumnami, collapsible, emoji i special chars.
- `ImageNode` z `src`, `altText`, `width`, `align` oraz prostym resize handle.
- `ImageGalleryNode` istnieje i obsługuje `images` + `columns`, ale nie jest podłączony do Insert menu.
- `MediaPickerModal` obsługuje upload, wyszukiwanie, filtrowanie rozszerzeń i wybór plików.
- `HtmlPlugin` serializuje/deserializuje HTML.
- Vitest + Testing Library dla admin SPA.

### Najważniejsze Braki

- Obraz nie ma pełnego modelu: `caption`, `mediaId`, `focalPoint`, `aspectRatio`, `linkUrl`, `loading`, `decorative`, `credit`, `sizePreset`.
- Resize działa tylko jako lokalny drag handle; brakuje ograniczeń, keyboard support, responsywnego modelu szerokości i stabilnej selekcji.
- Pisanie obok zdjęcia opiera się o `float`, ale nie ma przewidywalnych layout presets ani jasnego zachowania mobile.
- Brak edycji alt/caption po wstawieniu obrazu.
- Brak trybu “inline image”, “block image”, “text wrap left/right”, “wide/full width”.
- Galeria jest node'em, ale nie ma entry pointu: `Insert -> Gallery`, slash command, testów, ani finalnego HTML kontraktu.
- Media picker nie rozróżnia kontekstów: obraz pojedynczy, galeria, plik/załącznik, video.
- Brak `AttachmentNode` dla PDF/DOC/XLS/ZIP itp.
- Paste pipeline jest zbyt podstawowy: brak czyszczenia Word/Google Docs, brak normalizacji obrazów i linków.
- Brak canonical Lexical JSON jako źródła prawdy. Aktualnie dominują HTML round-tripy.
- Brak testów dla image resize, gallery, attachments, paste i serializacji node'ów.

## Docelowy Zakres Enterprise RTE

### 1. Document Model

RTE powinien mieć dwa outputy:

- `content_json` - canonical Lexical editor state.
- `content_html` - sanityzowany HTML do publicznego renderingu i API.

Migracja powinna być etapowa:

1. Obecne pola HTML zostają wspierane.
2. Nowe edycje zapisują HTML + JSON.
3. Backend waliduje i sanityzuje HTML output.
4. Publiczny frontend renderuje HTML, a admin używa JSON, jeśli istnieje.
5. Wersjonowanie i diff docelowo porównują JSON, nie surowy HTML.

### 2. Media Model

Wspólny kontrakt media node'ów:

```ts
type RteMediaAsset = {
    mediaId: number | null;
    src: string;
    alt: string;
    caption: string | null;
    credit: string | null;
    mimeType: string;
    width: number | null;
    height: number | null;
    focalPoint: { x: number; y: number } | null;
};
```

Ten model powinien pochodzić z media library, ale pozwalać na zewnętrzny URL tylko tam, gdzie polityka CMS na to pozwoli.

### 3. Image Node 2.0

Pojedynczy obraz powinien obsługiwać:

- wybór z Media Library i upload bez opuszczania edytora,
- alt text wymagany dla obrazów informacyjnych,
- `decorative=true` jako świadome pominięcie alt,
- caption pod obrazem,
- credit/byline,
- linkowanie obrazu,
- alignment: `none`, `center`, `left`, `right`,
- layout: `inline`, `block`, `wide`, `full`,
- text wrap: `none`, `wrap-left`, `wrap-right`,
- size preset: `small`, `medium`, `large`, `full`, `custom`,
- resize myszą i klawiaturą,
- aspect ratio lock,
- focal point,
- lazy/eager loading hint,
- responsive output bez poziomego scrolla.

Minimalny UX po kliknięciu obrazu:

- floating image toolbar: align, wrap, size, link, alt/caption, replace, remove,
- resize handles po bokach,
- panel metadata dla alt/caption/focal point,
- stan błędu, jeśli alt jest pusty i obraz nie jest decorative.

### 4. Text Beside Image

Pisanie obok zdjęcia powinno mieć kontrolowane warianty zamiast losowego `float`:

- `Image left + text wrap`
- `Image right + text wrap`
- `Image centered`
- `Image wide`
- `Media + text two-column layout`

Desktop:
- wrap może używać float albo layout container, ale output musi być deterministyczny.

Mobile:
- obraz zawsze przechodzi nad tekst albo pod tekst, bez horyzontalnego scrolla.

### 5. Gallery Node

`Insert -> Gallery` powinno tworzyć galerię w gridzie.

Funkcje:

- multi-select z Media Library,
- upload wielu zdjęć,
- drag reorder,
- columns: 2/3/4,
- mobile columns: 1/2,
- gap presets,
- aspect ratio: square, 4:3, 16:9, natural,
- captions per image,
- alt per image,
- focal point per image,
- lightbox toggle,
- masonry jako późniejszy wariant, nie MVP,
- HTML export z `figure`, `figcaption`, `data-gallery`, `data-columns`,
- importDOM zachowujący obrazy i captions.

MVP:

- Insert menu item,
- slash command `/gallery`,
- multi-select media picker,
- columns 2/3/4,
- reorder,
- remove,
- HTML export/import,
- tests.

### 6. Attachment Node

Enterprise CMS powinien pozwalać redaktorowi załączać pliki, ale kontrolowanie:

- PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP,
- nazwa publiczna,
- opis,
- rozmiar pliku,
- mime icon,
- download/open behavior,
- optional “requires login” w przyszłości,
- antywirus/scan hook w przyszłości,
- publiczny output jako bezpieczny link do media library.

MVP:

- `Insert -> File`
- slash command `/file`
- `AttachmentNode`
- MediaPickerModal w trybie non-image
- HTML export jako `<a data-rte-attachment ...>`.

### 7. Media Picker Modes

`MediaPickerModal` powinien dostać jawny tryb:

```ts
type MediaPickerMode = 'image' | 'gallery' | 'file' | 'video' | 'any';
```

Wymagania:

- `image`: tylko obrazy, single select.
- `gallery`: tylko obrazy, multi select, selected rail, reorder.
- `file`: PDF/documents/archive, single select.
- `video`: video files, single select.
- `any`: obecne zachowanie dla ogólnego panelu Media.

Media picker powinien zwracać pełniejsze dane: `id`, `url`, `name`, `file_name`, `mime_type`, `size`, `alt`, `caption`, `width`, `height`, `thumb_url`.

### 8. Paste Pipeline

Paste powinien mieć osobny plugin:

- czyszczenie HTML z Word/Google Docs,
- usunięcie `style`, `class`, `mso-*`, zbędnych spanów,
- mapowanie headingów,
- normalizacja list,
- konwersja bezpiecznych obrazów do `ImageNode`,
- blokowanie `data:` image bez explicit allow,
- konwersja tabel,
- walidacja linków przez istniejący `link-url.ts`,
- paste plain text fallback.

### 9. Link Picker

Obecny URL dialog jest dobry jako low-level fallback. Enterprise workflow powinien dodać:

- internal link picker: pages, products, categories, blog posts,
- search,
- locale-aware URLs,
- preview targetu,
- external link policy,
- target/rel controls,
- broken-link check w content health.

### 10. A11y + Content Health

RTE powinien pokazywać lokalne warnings:

- obraz bez alt i nie decorative,
- puste linki,
- link `target=_blank` bez `rel`,
- zła kolejność headingów,
- więcej niż jeden H1 w polu, gdzie H1 nie jest dozwolony,
- tabela bez headerów,
- za długie akapity,
- za dużo inline styles,
- plik bez opisowej nazwy linku.

### 11. Permissions + Security

Potrzebne capability gates:

- upload media,
- insert external image URL,
- insert file attachment,
- insert custom embed,
- use raw/custom HTML.

Backend musi zachować źródło prawdy:

- sanityzacja HTML output,
- allowlista tagów/atrybutów dla `figure`, `img`, `figcaption`, `a`, `table`,
- blokada `javascript:`, niebezpiecznych `data:`, inline event handlers,
- maksymalny rozmiar uploadu zależny od typu.

## Plan Implementacji

### Epic RTE-0 - Audyt i Kontrakt

Status: Implemented 2026-05-18

Zmiany:

- Spisać obecne node'y i HTML output.
- Zdefiniować `RteMediaAsset`, `ImageNodeV2`, `GalleryNode`, `AttachmentNode`.
- Ustalić backend allowlist dla HTML RTE.
- Ustalić mapowanie Media Library -> RTE media DTO.

Testy:

- snapshot obecnego HTML export/import dla paragraph/link/image/table/youtube/gallery,
- unit tests dla URL/link policy,
- regression test, że stary HTML nadal importuje się bez crasha.

### Epic RTE-1 - Media Picker Modes

Status: Implemented 2026-05-18

Zmiany:

- Dodać `mode`, `multiple`, `acceptedMimeTypes`, `selectedItems`.
- Uporządkować typy w `media-picker-modal.types.ts`.
- Dodać alt/caption/metadata do `MediaItem`.
- Dla `gallery` włączyć prawdziwy multi-select i selected rail.

Testy:

- Vitest: filtr `image` pokazuje tylko obrazy.
- Vitest: `gallery` pozwala wybrać wiele obrazów i reorder.
- Vitest: `file` pokazuje PDF/DOC i nie pokazuje obrazów, jeśli mode tego wymaga.
- Feature/Pest: media search API zwraca wymagane pola metadata.

### Epic RTE-2 - Image Node 2.0

Status: Implemented 2026-05-18

Zmiany:

- Rozszerzyć `ImageNode` o `mediaId`, `caption`, `credit`, `layout`, `wrap`, `sizePreset`, `focalPoint`, `decorative`, `linkUrl`.
- Przenieść UI obrazu do mniejszych plików: `image-node/ImageComponent.tsx`, `ImageToolbar.tsx`, `ImageMetadataDialog.tsx`, `image-node.types.ts`.
- Dodać toolbar obrazu: align, wrap, size, caption, alt, replace, remove.
- Poprawić resize: min/max, snap presets, keyboard resize, aspect lock.
- Ustabilizować mobile output.

Testy:

- Vitest: insert image z media picker tworzy node z `mediaId`, `src`, `alt`.
- Vitest: resize zapisuje width/sizePreset do JSON i HTML.
- Vitest: align/wrap zapisuje właściwe atrybuty i klasy.
- Vitest: decorative image pozwala na pusty alt, non-decorative pokazuje warning.
- Browser/manual: można pisać tekst obok obrazu i mobile nie ma poziomego scrolla.

### Epic RTE-3 - Gallery Insert

Status: Implemented 2026-05-18

Zmiany:

- Dodać `Insert -> Gallery`.
- Dodać slash command `/gallery`.
- Przebudować `ImageGalleryNode` do kontraktu z `RteMediaAsset[]`.
- Dodać multi-select, reorder, columns, mobile columns, captions.
- Dodać HTML export/import z `figure`/`figcaption`.

Testy:

- Vitest: insert gallery otwiera media picker w trybie `gallery`.
- Vitest: wybór 3 obrazów tworzy gallery node.
- Vitest: zmiana columns zapisuje JSON i HTML.
- Vitest: reorder aktualizuje kolejność obrazów.
- Vitest: remove usuwa obraz z galerii.
- Browser/manual: galeria renderuje grid i jest czytelna na desktop/mobile.

### Epic RTE-4 - Attachment Node

Status: Implemented 2026-05-18

Zmiany:

- Dodać `AttachmentNode`.
- Dodać `Insert -> File`.
- Dodać slash command `/file`.
- Użyć MediaPickerModal `mode="file"`.
- HTML export jako bezpieczny link z ikoną, nazwą, mime i rozmiarem.

Testy:

- Vitest: file picker tworzy attachment node.
- Vitest: HTML output nie pozwala na `javascript:` i używa bezpiecznego URL.
- Vitest: attachment pokazuje nazwę i rozmiar.
- Feature/Pest: upload dokumentu przechodzi przez media endpoint i walidację rozmiaru/mime.

### Epic RTE-5 - Paste Cleanup

Status: Implemented 2026-05-18

Zmiany:

- Dodać `PasteSanitizerPlugin`.
- Dodać helper `sanitizePastedHtml`.
- Normalizować Word/Google Docs HTML.
- Konwertować bezpieczne obrazy/tabele/linki.
- Dodać paste plain text fallback.

Testy:

- Vitest: Word HTML usuwa `mso-*`, zbędne `span`, inline garbage.
- Vitest: Google Docs listy zostają listami.
- Vitest: niedozwolony link zostaje plain text albo jest odrzucony.
- Vitest: tabela z paste importuje się jako Lexical table.
- Browser/manual: paste z Google Docs tworzy czysty dokument.

### Epic RTE-6 - Link Picker

Status: Implemented 2026-05-18

Zmiany:

- Dodać internal link search API albo wykorzystać istniejący admin search.
- Rozszerzyć LinkDialog o tabs: URL, Page, Product, Category, Blog Post.
- Locale-aware URL generation.
- Link metadata preview.

Testy:

- Vitest: wybór strony generuje właściwy internal URL.
- Vitest: external URL nadal przechodzi przez allowlist.
- Pest: search endpoint respektuje permissions i zwraca tylko dozwolone typy.

### Epic RTE-7 - Content Health Panel

Status: Implemented 2026-05-18

Zmiany:

- Dodać plugin analizujący editor state.
- Pokazać warnings w footerze RTE albo panelu bocznym.
- Zintegrować z Page Builder health w późniejszym kroku.

Testy:

- Vitest: image bez alt daje warning.
- Vitest: puste linki dają warning.
- Vitest: heading jump H2 -> H4 daje warning.
- Vitest: table bez headerów daje warning.

### Epic RTE-8 - Canonical JSON Persistence

Status: Implemented 2026-05-18 for BlogPost rich text source; broader Page Builder JSON diff/versioning remains future work

Zmiany:

- Dodać pola `content_json` tam, gdzie RTE jest źródłem długiej treści.
- Zapisywać HTML + JSON.
- Dodać migrację/adapter dla starych HTML treści.
- Użyć JSON do diff/version history.

Testy:

- Pest: zapis blog post/page block zapisuje HTML i JSON.
- Pest: stary rekord HTML-only nadal otwiera się w edytorze.
- Pest: API zwraca sanityzowany HTML, nie surowy JSON.

## Priorytet MVP

Najpierw wdrożyć:

1. MediaPicker modes.
2. Image Node 2.0: alt/caption/wrap/resize.
3. Insert Gallery.
4. Attachment Node.
5. Paste cleanup.

To bezpośrednio odpowiada problemom redaktora: zdjęcia, tekst obok zdjęcia, galerie i pliki.

## Definition of Done

- Każdy nowy node ma `importJSON`, `exportJSON`, `importDOM`, `exportDOM`.
- Każdy node ma test serializacji JSON i HTML.
- Każda akcja Insert ma test UI.
- Obraz i galeria działają na desktop oraz mobile.
- Brak poziomego scrolla przy 375px.
- Upload i wybór plików działają bez opuszczania edytora.
- A11y warning pojawia się dla obrazu bez alt.
- `npm run types`, `npm run format:check`, `npm run test:ui` przechodzą.
- Dla backendowych zmian przechodzą odpowiednie Pest tests.

## Komendy Walidacyjne

```bash
docker compose exec php npm run format
docker compose exec php npm run types
docker compose exec php npm run format:check
docker compose exec php npm run test:ui
docker compose exec php php artisan test --compact tests/Feature/Admin/MediaControllerTest.php
docker compose exec php php artisan test --compact tests/Feature/Admin/Cms
```

Przed commitem nadal obowiązuje:

```bash
make fix
make check
```

Jeśli Larastan/PHPStan ponownie zawiesi się lub wywali na `vendor/phpstan/phpstan/phpstan.phar`, traktować to jako blocker środowiskowy i odnotować w raporcie commita.
