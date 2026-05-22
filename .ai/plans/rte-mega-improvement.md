# RTE Mega Improvement Plan — Lexical Editor na poziom światowy

> Status: **do review** | Created: 2026-05-22

---

## Diagnoza obecnego stanu

Lexical jest już świetnie zintegrowany, ale ma luki:
- **Tryb `simple`** (używany w blockach page buildera i product descriptions) jest zbyt ubogi — brak image, tabel, kolumn, fontów
- **Brak kolorów tła** — tylko kolor tekstu, bez podświetlania
- **Brak Callout/Info/Warning boxów** — kluczowe dla opisów produktów
- **Tabele są podstawowe** — brak resize kolumn, styli nagłówków, zebra stripes
- **Brak embedów social media** — tylko YouTube
- **Brak find & replace** — dla długich treści
- **ImageNode zaawansowany, ale brak filtrów** — brightness, contrast

---

## Phase R1: Product Description Ready — MUST HAVE (3-4 dni)

### R1.1 Tryb `standard` — złoty środek między simple a full

**Problem:** `simple` nie ma image/tabel/kolumn. `full` ma za dużo (alignment, fonty) dla małych pól w blockach.

**Rozwiązanie:** Nowy tryb `standard` = simple + insert media/tabele/kolumny:

```
Tryb     | History | BlockType | Bold/Italic | Link | Font/Align | Insert menu
---------|---------|-----------|-------------|------|------------|------------
simple   | ✓       | ✓         | ✓           | ✓    | ✗          | ✗
standard | ✓       | ✓         | ✓           | ✓    | ✗          | ✓ (nowy!)
full     | ✓       | ✓         | ✓           | ✓    | ✓          | ✓
```

**Plik:** `server/resources/js/components/ui/rich-text-editor/lexical/Editor.tsx`

```tsx
// Dodaj mode='standard' — Insert menu dostępne, Font/Align niedostępne
```

**Użycie:** Product descriptions → `standard`, Block richtext fields → `standard` lub `full`

### R1.2 Background Color / Text Highlight

**Plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ToolbarPlugin/groups.tsx`

Dodaj drugi kolor (background) obok istniejącego text color:

```tsx
// Obecnie: FontStyleGroup ma tylko fontColor (tekst)
// Dodaj: highlightColor (tło tekstu) — Lexical natywnie obsługuje 'highlight' format

const onHighlightColorChange = (color: string) => {
    applyStyleText({ 'background-color': color });
};
```

Dodaj do `applyStyleText`:
```ts
// Obecnie tylko fontSize, fontFamily, color
// Dodaj: backgroundColor
```

Przycisk obok text color: ikona markera/podświetlenia + color picker.

### R1.3 Callout / Info / Warning Box

Nowy custom node dla styled bloków informacyjnych:

**Nowy plik:** `server/resources/js/components/ui/rich-text-editor/callout-node.tsx`

```
┌─────────────────────────────────────────┐
│ ℹ️  To jest informacja                  │
│     Treść z formatowaniem...            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠️  Uwaga! Ważna informacja             │
│     Treść z formatowaniem...            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✅  Sukces / Tip                        │
│     Treść z formatowaniem...            │
└─────────────────────────────────────────┘
```

**Typy:** `info` (niebieski), `warning` (żółty/pomarańczowy), `success` (zielony), `danger` (czerwony)

**Implementacja:** `ElementNode` z dwójką dzieci: ikona + content (ParagraphNode).
Wstawiany przez slash command `/callout` lub Insert menu.

**Serializacja:** `<div class="callout callout-info">...</div>` → odwzorowane w tailwind na froncie.

### R1.4 Lepsze Tabele

**Plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/TableActionMenuPlugin.tsx`

Rozszerz istniejący plugin o:

**a) Column resize** — przeciąganie krawędzi kolumn:
```tsx
// Dodaj resize handles na nagłówkach kolumn
// Użyj pointer events do zmiany szerokości
// Zapisz szerokości w atrybutach komórek
```

**b) Header row styling:**
```tsx
// Toggle: pierwszy wiersz jako header (<thead>)
// Stylizacja: bold, ciemniejsze tło
// Już jest includeHeaders w INSERT_TABLE_COMMAND, ale brak wizualnego toggle
```

**c) Striped rows / Border style presets:**
```
Style: [Default ▼] → Default, Striped, Bordered, Borderless
```

Wstawiane jako `data-table-style` na table node.

**d) Dodaj tabelę do trybu `standard`:**

Insert menu z tabelami dostępne w standard mode.

### Szacunkowy effort: 3-4 dni

---

## Phase R2: Zaawansowane media i embedy — SHOULD HAVE (2-3 dni)

### R2.1 Embed Social Media

Rozszerz istniejący `YouTubeNode` na generyczny `EmbedNode`:

```tsx
// PRZED: YouTubeNode obsługuje tylko youtube.com
// PO: EmbedNode obsługuje wiele platform
```

Obsługiwane platformy:
- **YouTube** — już jest
- **Vimeo** — `vimeo.com/*`
- **TikTok** — `tiktok.com/@*` (embed via oEmbed)
- **Twitter/X** — `twitter.com/*/status/*`, `x.com/*/status/*`
- **Instagram** — `instagram.com/p/*`
- **Spotify** — `spotify.com/embed/*`
- **Loom** — `loom.com/share/*`

**Implementacja:**
- Wykrywanie URL → automatyczne wykrywanie platformy
- Backend proxy dla oEmbed (Instagram, TikTok wymagają server-side)
- Komponent renderujący `<iframe>` z sandbox

**Backend:**
```php
// server/app/Http/Controllers/Admin/EmbedController.php
GET /admin/embed/oembed?url=https://...
→ zwraca HTML z oEmbed API (z cachowaniem 24h)
```

### R2.2 Paste/Clipboard Image

**Problem:** Użytkownik nie może wkleić obrazka ze schowka (screenshot).

**Plik:** Dodaj `ClipboardImagePlugin`:

```tsx
// Nasłuchuj zdarzenia 'paste'
// Jeśli w schowku jest obraz → wyślij na backend → wstaw ImageNode
```

```php
// Upload image z base64:
POST /admin/media/upload-clipboard
```

### R2.3 Image Filters w RTE

**Plik:** `server/resources/js/components/ui/rich-text-editor/image-node.tsx`

Dodaj do panelu metadanych obrazka:
```
Filters:
  Brightness: [────────────] 100%
  Contrast:   [────────────] 100%
  Saturation: [────────────] 100%
  Blur:       [───────] 0px
```

Zapisane jako CSS filter w serializacji:
```html
<img style="filter: brightness(1.1) contrast(1.05)" />
```

### Szacunkowy effort: 2-3 dni

---

## Phase R3: UX i produktywność — SHOULD HAVE (2-3 dni)

### R3.1 Find & Replace

**Nowy plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/FindReplacePlugin.tsx`

```
┌─ Find & Replace ──────────────────────────────────────┐
│ Find:    [__________] [↑ 3 matches]                    │
│ Replace: [__________] [Replace] [Replace All]          │
│ ☐ Match case  ☐ Whole words                           │
└───────────────────────────────────────────────────────┘
```

Ctrl+F → otwiera panel find & replace (jak w VS Code).
Ctrl+H → otwiera od razu z polem replace.

### R3.2 Keyboard Shortcuts Cheatsheet

**Nowy plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/ShortcutsDialog.tsx`

Modal z listą wszystkich skrótów, dostępny z toolbaru (`?` icon):

```
Formatting:
  Ctrl+B → Bold
  Ctrl+I → Italic
  Ctrl+U → Underline
  ...

Blocks:
  # + Space → Heading 1
  ## + Space → Heading 2
  > + Space → Quote
  ``` + Space → Code

Insert:
  /image → Insert image
  /table → Insert table
  /youtube → Embed YouTube
  /callout → Info box

Selection:
  Ctrl+A → Select all
  Escape → Exit block
```

### R3.3 Slash Command Menu — więcej komend

**Plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/SlashCommandPlugin.tsx`

Dodaj brakujące komendy:
```
/image → Insert image (otwiera MediaPicker)
/youtube → Embed YouTube
/callout → Callout box
/hr → Horizontal rule
/emoji → Emoji picker
/columns-2 → 2 columns
/columns-3 → 3 columns
/collapse → Collapsible section
/attachment → File attachment
```

### R3.4 Word Count + Reading Time

**Plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/WordCountPlugin.tsx`

Rozszerz istniejący (jest już `WordCountPlugin`):
```
Words: 342 | Characters: 2,184 | Reading time: ~2 min
```

### R3.5 Template Snippets

**Plik:** `server/resources/js/components/ui/rich-text-editor/lexical/plugins/SnippetsPlugin.tsx`

Użytkownik może zapisać zaznaczony fragment jako szablon i wstawić go później:

```
Insert → Snippets → [Size Chart ▼]
                     [Specs Table ▼]
                     [Feature Comparison ▼]
```

Snippety zapisywane w localStorage (na start) lub w DB (dla zalogowanych).

### Szacunkowy effort: 2-3 dni

---

## Phase R4: Linkowanie wewnętrzne i SEO — NICE TO HAVE (1-2 dni)

### R4.1 Internal Link Autocomplete — ulepszenie

**Problem:** Obecny dialog linku ma zakładkę "Internal" z wyszukiwarką, ale nie pokazuje URL-i produktów/stron podczas pisania.

**Rozwiązanie:** Autocomplete podczas wpisywania w polu URL:

```
Link URL: [produkt_____                    ]
          ┌────────────────────────────────┐
          │ 🔗 /products/nike-air-max      │
          │ 📄 /pages/shipping             │
          │ 📝 /blog/how-to-choose-shoes   │
          └────────────────────────────────┘
```

Wyszukuje w czasie rzeczywistym produkty, kategorie, strony, blog posty.

### R4.2 Link validation & health

**Plik:** Rozszerz `link-url.ts`

- Walidacja czy URL jest osiągalny (HEAD request przy zapisie)
- Wykrywanie 404 linków do wewnętrznych stron
- Wizualna sygnalizacja broken links (czerwony podkreślnik)

### Szacunkowy effort: 1-2 dni

---

## Phase R5: Mobile / Touch — NICE TO HAVE (1-2 dni)

### R5.1 Touch-friendly resize w ImageNode

**Plik:** `server/resources/js/components/ui/rich-text-editor/image-node.tsx`

Obecnie resize używa `mousemove`/`mouseup`. Dodaj `pointermove`/`pointerup`.

### R5.2 Mobile toolbar

Adaptacja toolbaru na małe ekrany:
- Toolbar scrolluje się poziomo na mobile
- Floating toolbar pokazuje się na selekcję (już jest FloatingTextFormatPlugin)
- Insert menu jako full-screen modal na mobile

### R5.3 Pinch-to-zoom w ImageNode

Wykorzystaj `touchmove` z dwoma palcami do pinch-zoom na obrazku w RTE.

### Szacunkowy effort: 1-2 dni

---

## Phase R6: Export / Import — NICE TO HAVE (0.5 dnia)

### R6.1 Markdown Export

**Nowy plik:** Dodaj przycisk eksportu do markdown.

Lexical ma `$convertToMarkdownString` (z transformera), ale nie jest w pełni zaimplementowane. Użyj `@lexical/markdown`:

```tsx
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';

function exportToMarkdown() {
    editor.update(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        // download as .md file
    });
}
```

### R6.2 Export do Plain Text

```tsx
import { $getRoot, $isElementNode } from 'lexical';

function exportPlainText() {
    editor.getEditorState().read(() => {
        const text = $getRoot().getTextContent();
        return text;
    });
}
```

### Szacunkowy effort: 0.5 dnia

---

## Backlog / Przyszłość

| Feature | Opis | Kiedy |
|---------|------|-------|
| AI Writing Assistant | Generowanie/ulepszanie treści przez AI | Po integracji AI |
| Real-time Collaboration | Współdzielona edycja (yjs już zainstalowany!) | Kiedy potrzebny |
| Track Changes | Śledzenie zmian, sugerowanie edycji | Po inline editing |
| Table of Contents | Auto-generacja spisu treści z nagłówków | Po R1 |
| Custom Fonts | Upload własnych fontów do theme | Z Phase 1 Design System |
| Version Diff | Porównywanie wersji treści | Z Page Versioning |
| Grammarly/Spellcheck | Integracja zewnętrznego spellcheckera | Po R1 |

---

## Harmonogram RTE

| Faza | Opis | Effort | Priorytet |
|------|------|--------|-----------|
| **R1** | Product Description Ready (standard mode, highlight, callout, lepsze tabele) | 3-4 dni | **Must have** |
| **R2** | Social embedy, clipboard image, filtry obrazków | 2-3 dni | Should have |
| **R3** | Find & replace, shortcuts, slash commands, word count, snippets | 2-3 dni | Should have |
| **R4** | Link autocomplete, link health | 1-2 dni | Nice to have |
| **R5** | Mobile/touch support | 1-2 dni | Nice to have |
| **R6** | Markdown/plain text export | 0.5 dnia | Nice to have |
| **Razem** | | **10-15 dni** | |

---

## Integracja z planem Page Builder UX v2

```
Phase 1 (Design System) → Phase 2 (Image Editing) ...
                              ↓
                         R1 (RTE Product Ready) — równolegle!
                              ↓
                         R2 (Embeds) → R3 (Productivity)
                              ↓
Phase 3 (Inline Editing) → RTE tryb edycji inline
```

**Kluczowe zależności:**
- R1.2 (background color/callout) nie zależy od niczego — można robić od razu
- R1.1 (standard mode) jest potrzebny dla Phase 3 (Inline Editing) — bloki richtext będą używać standard mode
- R2.2 (clipboard image) wymaga backend upload endpointu
- R5 (mobile) zależy od Phase 3 — przy inline editing touch staje się ważniejszy

**Proponowana kolejność startowa:**
1. R1.2 Background color + R1.3 Callout box — 1.5 dnia
2. R1.1 Standard mode — 1 dzień
3. R1.4 Lepsze tabele — 1 dzień
4. R2.1 Embedy social media — 1.5 dnia
5. R3 Find & replace + shortcuts + slash commands — 2 dni
