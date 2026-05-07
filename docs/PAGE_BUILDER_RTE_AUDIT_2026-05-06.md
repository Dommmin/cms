# Audyt: Page Builder, Edycja stron, Rich Text Editor — 2026-05-06

> **Architektura: HEADLESS** — backend Laravel obsługuje wielu konsumentów (Next.js client, panel Inertia, REST `/api/v1/*`, ewentualnie kolejne klienty: mobile, RSS, feed Google Merchant, integracje webhookowe).
> **Konsekwencja:** każda walidacja, sanityzacja i normalizacja musi żyć **po stronie serwera**. Klient ma prawo dodawać warstwy obronne, ale nigdy ich zastępować. Nie zakładamy, że jedyny renderer HTML to obecny Next.js.

---

## P0 — Bezpieczeństwo (XSS) ⚠️ produkcyjne ryzyko

### 1. Brak sanityzacji HTML po stronie serwera

Dziś sanityzacja (`DOMPurify`) odbywa się tylko w `client/lib/sanitize.ts`. Treści wchodzą do bazy w postaci surowego HTML z RTE. Każdy nowy konsument (mobile, RSS, e-mail) który nie wykona `sanitizeHtml()` ma XSS.

**Do zrobienia:**
- Dodać pakiet [`mews/purifier`](https://github.com/mewebstudio/Purifier) (Laravel wrapper na HTMLPurifier).
- Skonfigurować profile w `config/purifier.php`:
  - `default` — pełny zestaw tagów dla artykułów blog/produktów/page rich_content.
  - `basic` — tylko `b, i, u, em, strong, a, p, br, ul, ol, li` (np. opisy w sekcjach builderze).
  - `strict` — tylko tekst z `<br>` (excerpt, meta_description).
  - Whitelist atrybutów `style` ograniczona do `color, background-color, text-align, font-size, font-family`.
  - Whitelist `class` ograniczona prefiksami (`prose-*`, `editor-*`).
  - `URI.AllowedSchemes` = `http, https, mailto` + ścieżki względne.
- Sanityzować w mutatorach modeli (jedno źródło prawdy):
  - `Product::setDescriptionAttribute`, `setShortDescriptionAttribute` (z uwzględnieniem `HasTranslations` — sanityzować każdą lokalizację).
  - `BlogPost::setContentAttribute`, `setExcerptAttribute`.
  - `Page::setContentAttribute`, `setRichContentAttribute`.
- Sanityzować JSON `configuration` bloków page-buildera w warstwie request:
  - `UpdatePageBuilderRequest::passedValidation()` — przejść po `snapshot.sections.*.blocks.*.configuration.*` i dla każdego pola, którego schema (`config/blocks.php`) deklaruje `format: richtext` lub `format: html`, przepuścić wartość przez `Purifier::clean(..., 'default')`.
  - To samo dla `ReusableBlock` (Global Block Library) — `StoreReusableBlockRequest`/`UpdateReusableBlockRequest`.
- Dodać Pest test wstrzykujący `<script>alert(1)</script>` przez API i sprawdzający, że w bazie zapisał się tekst bez `<script>`.
- Klient zachowuje `sanitizeHtml()` jako defense-in-depth (drugi pas) — usuwać dopiero po pełnym wdrożeniu serverside.

### 2. Brak sanityzacji w admin accordion

`server/resources/js/components/blocks/accordion.tsx:24` renderuje `it.content` przez `dangerouslySetInnerHTML` bez sanityzacji. Po wdrożeniu pkt. 1 problem znika u źródła, ale do czasu wdrożenia: tymczasowo dodać `sanitizeHtml`.

### 3. Brak sanityzacji w `ProductDetailClient`

`client/app/products/[slug]/ProductDetailClient.tsx:588` renderuje `product.description` raw — niespójnie z resztą kodu. Po wdrożeniu pkt. 1 problem znika u źródła; do czasu wdrożenia użyć `sanitizeHtml`.

### 4. Sanityzacja CSS w blokach `custom-html` / `_custom_css`

`custom-html.tsx` i `section-renderer.tsx` używają lokalnego `sanitizeCss`. Przenieść walidację CSS na serwer:
- Whitelist właściwości CSS (np. `color, background, padding, margin, display, flex, grid, font-*, border-*`).
- Odrzucenie `expression()`, `url(javascript:...)`, `@import`.
- Limit długości pola (np. 8 KB).

---

## P0/P1 — Walidacja Page Builder (server-side)

`server/app/Http/Requests/Admin/Cms/UpdatePageBuilderRequest.php` ma luki:

**Do zrobienia:**
- Dodać reguły dla pominiętych pól:
  - `snapshot.sections.*.layout` — string, in: layouty z `config/cms.sections.*.layouts`.
  - `snapshot.sections.*.variant` — string, in: warianty z `config/cms.sections.*.variants` (nullable).
  - `snapshot.sections.*.is_active` — boolean.
  - `snapshot.sections.*.blocks.*.is_active` — boolean.
  - `snapshot.sections.*.blocks.*.relations` — array.
  - `snapshot.sections.*.blocks.*.relations.*.type` — required, string, in: typy z `config/blocks`.
  - `snapshot.sections.*.blocks.*.relations.*.id` — required, integer, exists: tabela zależna od `type`.
  - `snapshot.sections.*.blocks.*.reusable_block_id` — nullable, integer, exists:reusable_blocks,id.
  - `snapshot.sections.*.blocks.*.reusable_block_name` — nullable, string, max:255.
- Dodać globalne limity (DoS):
  - Maks. 100 sekcji na stronę.
  - Maks. 100 bloków na sekcję.
  - Maks. rozmiar całego payloadu `snapshot` 1 MB (obecnie 64 KB **per blok**, czyli 50 bloków × 64 KB = 3.2 MB).
- Walidować `configuration` względem schematu blocku z `config/blocks.php`:
  - Stworzyć `BlockConfigurationValidator` service.
  - Dla każdego pola sprawdzać typ (`string|number|boolean|array`), `format` (richtext, color, url, email, code), enum, min/max.
  - Pola nieznane w schemacie odrzucać (whitelist).
- Dodać reguły dla `ReusableBlockController::store/update` — analogicznie.
- Dodać reguły dla `SectionTemplateController::store` — walidować `snapshot` rekurencyjnie tymi samymi regułami co `UpdatePageBuilderRequest`.

---

## P1 — Optimistic locking (HEADLESS = wielu klientów / wielu redaktorów)

Brak ochrony przed nadpisaniem. Dwóch redaktorów otwiera tę samą stronę — ostatni zapis wygrywa, drugi traci pracę bez ostrzeżenia.

**Do zrobienia (server-side):**
- Dodać kolumnę `version` (integer, default 0) do tabeli `pages`.
- W `PageBuilderController::update`:
  - Sprawdzić nagłówek `If-Match: <version>` lub pole `expected_version` w body.
  - Jeśli wartość != bieżąca → 409 Conflict z aktualnym snapshotem.
  - Po sukcesie: `$page->increment('version')`.
- Frontend: w stanie buildera trzymać `version`, dołączać do każdego PUT, na 409 pokazać dialog "Strona została zmodyfikowana przez inny edytor — zapisz jako kopię / odrzuć / pobierz nową wersję".
- To samo dla `ReusableBlock` (globalne bloki edytowane przez wielu).
- Wpiąć w `PageVersion` (już istnieje) — każdy zapis buildera tworzy snapshot wersji historycznej (jest, ale upewnić się że również auto-save).

---

## P1 — Auto-save jest złamany logicznie

`server/resources/js/pages/admin/cms/pages/builder.tsx:91-118`: `setTimeout(30s)` jest **resetowany** na każdej zmianie. Dopóki użytkownik pisze — nie zapisze się **nigdy**.

Dodatkowo `router.put` (Inertia visit) zamiast cichego JSON requesta — generuje race conditions z innymi visitami.

**Do zrobienia:**
- Server-side:
  - Dedykowany endpoint `PUT /admin/pages/{page}/builder/autosave` (oddzielny od `update`) — odpowiedź JSON, nie Inertia.
  - Akceptuje `version` (optimistic locking — zob. wyżej).
  - Rate-limit `throttle:60,1` (60/min na user+page).
  - Zapisuje do `PageVersion` z flagą `is_autosave = true`.
- Frontend:
  - Debounce 5s + `maxWait: 60s` (lodash `debounce`).
  - `axios.put(...)` zamiast `router.put`.
  - `beforeunload` listener gdy `hasUnsavedChanges`.
  - `router.on('before', ...)` (Inertia) — blokować nawigację SPA gdy nie zapisane.
  - Wyświetlać status: "Zapisywanie...", "Zapisano X min temu", "Konflikt — odśwież".

---

## P1 — Usunięcie zduplikowanego edytora (~3000 LOC dead code)

Istnieją **dwa** edytory Lexical:
- `server/resources/js/components/editor/` — 60+ plików (~3000 LOC), używany **tylko** przez demo route `/admin/editor`.
- `server/resources/js/components/ui/rich-text-editor/` — używany realnie (products, blog, page builder, localized-field).

**Do zrobienia:**
- Usunąć katalog `server/resources/js/components/editor/` (60+ plików).
- Usunąć route demo `server/routes/admin.php:245`.
- Usunąć `server/resources/js/pages/admin/editor.tsx` lub przepiąć na produkcyjny `RichTextEditor`.
- Usunąć link z menu admina (jeśli istnieje).

---

## P1 — Bug w tytule karty buildera

`builder.tsx:279`: `<Head title={\`Builder - ${page.title}\`} />` — `page.title` to teraz `Record<string, string>` (translatable). Renderuje się `Builder - [object Object]`. To samo w breadcrumbach (`builder.tsx:44`).

**Do zrobienia:**
- Wyekstrahować helper `displayTitle(value: string | Record<string, string>, defaultLocale: string): string` do `server/resources/js/lib/i18n.ts`.
- Użyć w `builder.tsx` (Head + breadcrumbs) i przepiąć `edit.tsx:71` na ten sam helper.

---

## P1 — Brak edycji `content` / `rich_content` w `edit.tsx`

`Page` ma `translatable = ['title', 'excerpt', 'content', 'rich_content']`, ale UI edycji strony pokazuje tylko title + excerpt. Strony typu `module=content` mają nieosiągalną treść — można ją edytować tylko bezpośrednio w bazie.

**Do zrobienia:**
- W `edit.tsx` dodać sekcję "Treść" widoczną gdy `pageType === 'module' && moduleName === 'content'`.
- Pole `rich_content` przez `LocalizedField` + `RichTextEditor`.
- Pole `content` (plain text fallback dla starszych klientów REST) — `LocalizedField` + `Textarea`.
- W `UpdatePageRequest`:
  - `content` — array, `content.*` — nullable, string, max:65535.
  - `rich_content` — array, `rich_content.*` — nullable, string, max:262144 (256 KB), sanityzowane przez Purifier.

---

## P1 — Headless: spójność między wszystkimi konsumentami

Dziś niektóre rzeczy są poprawiane *tylko* w panelu Inertia (admin SPA) lub *tylko* w Next.js. Trzeba ujednolicić.

**Do zrobienia:**
- Walidacja:
  - Wszystkie reguły w `FormRequest` po stronie serwera (już jest).
  - Klienci dostają identyczne błędy 422 z polami w strukturze Laravel — `lib/api.ts` musi wystawiać typowe `ApiValidationError`.
- Sanityzacja: zob. P0 — wyłącznie server-side.
- Normalizacja:
  - Strony i bloki zawsze zwracane z polem `version` (etag).
  - Daty zawsze ISO 8601 UTC (już jest? — sprawdzić w `BlogPost`, `Page`, `Product` zasobach).
- Polityka cache:
  - `PageBuilderController` zwraca `ETag` na GET — Next.js ISR może go wykorzystać.
  - Endpoint `GET /api/v1/pages/{slug}` ma `Cache-Control: public, max-age=60, stale-while-revalidate=300` (już jest? sprawdzić).
- Webhook on-publish:
  - Przy publikacji strony / produktu / posta wysyłać webhook do dowolnego klienta (revalidation tag w Next.js, push do CDN, invalidacja cache).
  - Już istnieje `WebhookEndpoint` model? Potwierdzić i dopiąć eventy `PagePublished`, `ProductPublished`, `BlogPostPublished`.

---

## P2 — Rich Text Editor (drobne)

### Walidacja URL — relatywne linki
`server/resources/js/components/ui/rich-text-editor/lexical/Editor.tsx:81`:

```ts
validateUrl={(url) => /^https?:\/\//.test(url) || /^mailto:/.test(url)}
```

Odrzuca `/products/abc`, `#section`, `tel:+48...`. Powinno być:

```ts
validateUrl={(url) => /^(https?:\/\/|mailto:|tel:|\/|#)/.test(url)}
```

### Toolbar nieprzetłumaczony
`ToolbarPlugin.tsx` — wszystkie tooltipy hardcoded EN ("Bold (Ctrl+B)", "Align center"). Niespójne z resztą admina, która używa `useTranslation()`.

**Do zrobienia:** zamienić wszystkie literały na `__('rte.bold', 'Bold')` itp. Klucze pod prefiksem `rte.*`.

### `HtmlPlugin` race condition
`HtmlPlugin.tsx`: `lastSyncedValue.current` aktualizuje się tylko przy lokalnej edycji. Jeśli `value` zmienia się z zewnątrz w trakcie pisania (np. switch lokalizacji w `LocalizedField`) — edytor czyści root i traci stan kursora/historii.

**Do zrobienia:**
- Nie odświeżać gdy edytor ma focus (chyba że `value` jawnie reset = pusty / inny ID).
- Dodać prop `instanceKey` — gdy się zmienia, robić `editor.dispatchCommand(CLEAR_HISTORY)` + reset.

### Brak debounce na `OnChangePlugin`
Każdy keystroke generuje `$generateHtmlFromNodes` + parent `setState`. Dla długich artykułów koszt znaczący.

**Do zrobienia:** debounce 200ms na `onChange` w `HtmlPlugin`.

### Walidacja po stronie serwera również dla `<a target="_blank">`
Jeśli RTE pozwala wstawić `target="_blank"`, server-side Purifier musi forsować `rel="noopener noreferrer"` (HTMLPurifier ma `HTML.TargetBlank` / `HTML.Nofollow`).

---

## P2 — Page Builder UX

- **Historia undo/redo zapełnia się przy pisaniu**. `use-builder-state.ts` dispatchuje `SET` przy każdej zmianie konfiguracji — w polu RTE = co keystroke. Debounce 500ms na `pushHistory`.
- **`localStorage['pb_clipboard']`** — namespace per-page (`pb_clipboard:${pageId}`) lub globalny ale z walidacją wieku/rozmiaru. Limit 1 MB + try/catch.
- **Brak ostrzeżenia "Niezapisane zmiany"** przy nawigacji w SPA. Dodać hook na `router.on('before')`.
- **God Components** do podziału:
  - `builder-toolbar.tsx` (676 LOC) → `HistoryGroup`, `SaveGroup`, `ScheduleDialog`, `TemplateDialog`, `ApprovalActions`.
  - `ToolbarPlugin.tsx` (1006 LOC) → folder `ToolbarPlugin/` z `BlockTypeDropdown`, `FontGroup`, `ColorPickers`, `InsertGroup`, `EmojiPicker`, `SpecialCharsPicker`, `LayoutInsert`, `MediaInsert`.
  - `block-form.tsx` (571) i `dynamic-block-form.tsx` (511) → wydzielić `Field*` rendery do `dynamic-block-form/fields/{StringField,NumberField,BooleanField,ArrayField,ColorField,RichTextField}.tsx`.

---

## P3 — Drobiazgi

- `BlockForm` re-grupuje `availableBlockTypes` na każdym renderze → `useMemo`.
- `LibraryModal` (`blocks-list.tsx`) fetchuje za każdym otwarciem → cachować TanStack Query.
- `handlePreview` w `builder.tsx` — `meta[name="csrf-token"]?.content` bez guarda → silent fail. Dodać sprawdzenie + komunikat.
- Brak testów Pest dla `PageBuilderController::update` z payloadem na granicy walidacji (size, malicious html, deep nesting). Dopisać.
- Brak testów dla `RichTextEditor` — minimalne testy interakcji (RTL + keyboard).

---

## Plan wdrożenia (kolejność i estymacje)

| # | Zakres | Estymata | PR |
|---|--------|----------|-----|
| 1 | **P0 sanityzacja server-side** — Purifier + mutatory + walidacja `configuration` + testy XSS | 1d | `feat: server-side HTML sanitization (HEADLESS)` |
| 2 | **P0/P1 walidacja Page Builder** — domknięcie reguł, limity DoS, walidacja schematu konfiguracji | 0.5d | `feat: tighten page builder validation` |
| 3 | **P1 optimistic locking** — `version` na `pages` + `If-Match` + UI conflict | 0.5d | `feat: optimistic locking for pages` |
| 4 | **P1 auto-save fix** — debounce 5s/maxWait 60s + axios + beforeunload + endpoint | 0.5d | `fix: auto-save reliability + headless endpoint` |
| 5 | **P1 dead code RTE** — usunięcie `components/editor/` + demo route | 0.25d | `chore: remove legacy lexical playground editor` |
| 6 | **P1 bug `[object Object]` + `rich_content` w edit** — helper `displayTitle` + sekcja Treść | 0.5d | `fix: page edit translatable title + rich_content fields` |
| 7 | **P1 headless spójność** — ETag, webhook on-publish, normalizacja dat | 1d | `feat: headless content delivery (ETag + webhooks)` |
| 8 | **P2 RTE poprawki** — relatywne URL, i18n toolbar, HtmlPlugin race, debounce onChange | 0.5d | `fix: RTE polish (i18n + URL + race conditions)` |
| 9 | **P2 Page Builder UX** — undo/redo debounce, beforeunload, podział God Components | 1d | `refactor: split toolbars and dynamic-block-form` |
| 10 | **P3 drobiazgi + testy** | 0.5d | `chore: tests + memoization for page builder` |

**Razem:** ok. 6 dni roboczych.
**Krytyczna ścieżka (P0+P1):** ok. 3.5 dnia.

---

## Dlaczego HEADLESS wymaga server-side

- **Wielu klientów** — Next.js dziś, jutro mobile, PWA, integracja, mailing, RSS, AMP. Każdy klient niezależnie sanityzujący = N kopii reguł, N miejsc na zapomnienie.
- **REST `/api/v1/*`** jest publiczny — odbiorca trzeci (partner, agregator, scraper) dostaje surowy HTML i go wstawia gdziekolwiek. Jeśli zaufanie do treści jest utrzymane na serwerze, ryzyko nie istnieje.
- **Caching/CDN** — sanityzowana raz na zapisie treść jest cachowana. Sanityzacja per-render w kliencie to praca *N×* razy dla N odwiedzających. Wydajność.
- **Spójność** — feed Google Merchant i sitemap nie korzystają z `lib/sanitize.ts`. Dziś używają `strip_tags` (gubi formatowanie). Po wdrożeniu: można zwrócić sanityzowany pełny HTML i pozwolić odbiorcy decydować.
- **Audyt** — łatwiej przeprowadzić review polityki bezpieczeństwa w *jednym* config/purifier.php niż polować po klientach.

---

_Plik utworzony: 2026-05-06. Autor: audyt Page Builder + RTE (HEADLESS standards)._
