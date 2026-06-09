# Admin UI Audit & Improvements

**Data:** 2026-05-05
**Status:** Backlog — do realizacji etapami
**Kontekst:** Po wdrożeniu nowej palety kolorów (indigo/dark sidebar) + 6 custom themes użytkownik zgłosił szereg problemów wizualnych i funkcjonalnych w panelu admina.

## Review Status — 2026-06-09

Ten plik **też nie nadaje się jeszcze do usunięcia**, ale część punktów została już wdrożona.

### Status zbiorczy

| Obszar | Status | Uwagi |
|---|---|---|
| Scrollbar sidebara | wdrożone | Custom scrollbar jest już w `server/resources/css/app.css` |
| Border/shadow sidebara | wdrożone | Został miękki shadow bez opisanego wcześniej obcego borderu |
| `cursor-pointer` w bazowym `Button` | wdrożone | Jest w `server/resources/js/components/ui/button.tsx` |
| Motyw glassmorphism | wdrożone | Preset istnieje w `ThemeSeeder`, `data-theme-slug` też jest obsługiwany |
| Locale-specific slugs / translatable slug | wdrożone | `Page.slug` jest translatable, UI pracuje na lokalizowanych slugach |
| Admin translation sync workflow | wdrożone | Jest `admin:sync-translations` i route `translations.sync` |
| Część brakujących tłumaczeń | wdrożone | Klucz `blog_post_unpublished` i parametryzacja `dialog.delete_confirm` wdrożone |
| Page-by-page admin UX cleanup | otwarte | Nadal brak dowodu, że cały audyt ekran po ekranie został domknięty |
| Spójność ikon, loading/empty/error states | otwarte | To nadal wygląda na żywy backlog |
| Paste Block / template workflow cleanup | częściowo | Clipboard + templates istnieją, ale audytowy workflow nie jest jednoznacznie zamknięty |
| Audyt `page type` / `layout` / `container type` | wdrożone | Zbadano `layout` i `page type` — zaktualizowano dokumentację, zachowano kompatybilność wsteczną |
| Podwójna notyfikacja unpublish bloga | wdrożone | Toast notification i tłumaczenia są poprawne |

### Co zostało potwierdzone w kodzie

- Scrollbar i sidebar polish: `server/resources/css/app.css`
- `cursor-pointer` w przyciskach: `server/resources/js/components/ui/button.tsx`
- `data-theme-slug`: `server/resources/js/components/active-theme-sync.tsx`, `server/resources/views/app.blade.php`
- Motyw `glassmorphism`: `server/database/seeders/ThemeSeeder.php`
- Translatable slugs: `server/app/Models/Page.php`, `server/resources/js/pages/admin/cms/pages/edit.tsx`
- Sync tłumaczeń: `server/app/Console/Commands/SyncAdminTranslations.php`, `server/routes/admin.php`
- Klucz tłumaczenia unpublish bloga: `server/lang/en/admin.php`, `server/lang/pl/admin.php`

### Decyzja

- **Nie usuwać**.
- Traktować jako **aktywny backlog UI/UX dla admina**, a nie jako zakończony plan.
- Gdyby celem było porządkowanie, można go później skrócić do listy wyłącznie nadal otwartych punktów.

---

## Etap 1 — Szybkie poprawki wizualne (CSS / komponenty)

### 1.1 Scrollbar w sidebar [P1]
**Problem:** Scrollbar w sidebar jest za bardzo widoczny — wokół samego paska widać tło, co wizualnie psuje ciemny sidebar.

**Lokalizacja:** `server/resources/css/app.css` lub komponent sidebara (`server/resources/js/components/ui/sidebar.tsx`)

**Proponowane rozwiązanie:**
- Dodać CSS scrollbar styling: `scrollbar-width: thin` + `scrollbar-color: var(--sidebar-border) transparent`
- Dla WebKit: `::-webkit-scrollbar` z szerokością 6px, transparent track, kolor thumb pasujący do `--sidebar-border` z hover na `--sidebar-accent`
- Sprawdzić czy `[data-sidebar='content']` ma overflow ustawione i tam zaaplikować custom scrollbar

### 1.2 Border sidebara w custom themes [P1]
**Problem:** Po włączeniu custom theme sidebar dostaje dodatkowy border + box-shadow, który wygląda obco.

**Lokalizacja:** `server/resources/css/app.css` linie 172-175:
```css
html[data-theme-active='1'] [data-sidebar='sidebar'] {
    border: 1px solid var(--sidebar-border);
    box-shadow: 0 16px 40px rgb(0 0 0 / 0.2);
}
```

**Proponowane rozwiązanie:** Usunąć border zupełnie (sidebar już ma natywny border od shadcn). Box-shadow można zostawić, ale zmiękczyć (`0 8px 24px rgb(0 0 0 / 0.12)`).

### 1.3 Audyt custom themes [P1]
**Problem:** Nowo zdefiniowane motywy mogą mieć inne problemy poza borderem — gradient tła, overlay buttonów, kontrast tekstu.

**Lokalizacja:**
- `server/resources/css/app.css` linie 147-184 (`html[data-theme-active='1'] ...`)
- `server/resources/js/components/active-theme-sync.tsx`

**Co sprawdzić:**
- Czy gradient tła (`radial-gradient` z primary/accent) działa dobrze z każdym z 6 motywów
- Czy `[data-slot='button'][data-variant='default']` z box-shadow nie psuje przycisków w light themes
- Czy `[data-slot='sidebar-wrapper']` z linear-gradient ma sens przy ciemnych sidebarach

### 1.4 Nowy motyw: Glassmorphism [P2]
**Problem:** Brak motywu z efektem szkła (translucent, backdrop-blur).

**Lokalizacja:** `server/database/seeders/ThemeSeeder.php` (dodać 7. preset) + dodatkowy CSS w `app.css` z selektorem na slug motywu.

**Proponowane rozwiązanie:**
- Tokeny: półprzezroczyste tła (rgba), high-blur na kartach
- CSS: `html[data-theme-slug='glassmorphism'] [data-slot='card'] { backdrop-filter: blur(20px); background: rgba(255,255,255,0.6); }`
- Wymagałoby dodania `data-theme-slug` do `<html>` w `ActiveThemeSync` (obecnie jest tylko `data-theme-active`)
- Sidebar też powinien być translucent + blur

---

## Etap 2 — Page Builder / komponenty edytorskie

### 2.1 Przycisk "Paste Block" [P2]
**Problem:** Użytkownik nie będzie wklejał JSON-a ręcznie. Funkcja działa tylko jako copy-paste *w obrębie tej samej sesji* (clipboard `localStorage`), więc UI jest mylący.

**Lokalizacja:** `server/resources/js/components/page-builder/blocks-list.tsx` (lub podobny — `BlocksList`)

**Opcje:**
- **A)** Ukryć przycisk całkowicie, zostawić tylko ikonkę "Copy" przy bloku, paste jako submenu w "+ Add block"
- **B)** Przepisać na pełen workflow "Save as template" → biblioteka template'ów (już istnieje `SectionTemplate`!) — i połączyć z istniejącymi templatami
- **C)** Zostawić, ale pokazywać tylko gdy w clipboardzie coś jest

Rekomendacja: **B** (wykorzystać `SectionTemplateSeeder`/Section templates które już są w DB).

### 2.2 Container Type, Page type, Layout strony — audyt [P1]
**Problem:** Te selecty są w UI, ale niejasne czy faktycznie wpływają na rendering.

**Co sprawdzić:**

| Pole | Lokalizacja edycji | Czy używane na froncie? | Akcja |
|------|---------------------|-------------------------|-------|
| **Page → Layout** | `pages` table, `layout` column | grep `layout` w `client/app/[...slug]/` i resolverze stron | jeśli nieużywane → usunąć kolumnę + pole |
| **Page → Page Type** | `pages` table, `type` column | jeśli używane tylko przy tworzeniu (np. landing/standard) — udokumentować | dodać tooltip lub usunąć |
| **Page Builder Block → Container Type** | `page_blocks.settings` JSON | sprawdzić w `client/components/page-builder/renderer/` czy jest case na `container_type` | jeśli nie renderuje → usunąć z formularza |

**Lokalizacja kodu (do sprawdzenia):**
- `server/app/Models/Page.php`
- `server/app/Http/Resources/PageResource.php`
- `client/app/[...slug]/page.tsx` lub `client/components/page-builder/`
- `server/database/migrations/*pages*.php`

### 2.3 Locale-specific slugs [P2]
**Problem:** Pole "locale-specific slugs" sugeruje osobne pole na slug per język, ale logiczniej byłoby mieć **jeden** `slug` pole jako translatable (jak `title`).

**Co sprawdzić:**
- Jak obecnie są przechowywane slugi — `pages.slug` (JSON translatable?) czy osobna tabela `page_slugs`?
- `server/app/Models/Page.php` — czy `slug` jest w `$translatable` array
- Frontend `client/app/[...slug]/page.tsx` — jak rozwiązuje slug → page (czy szuka w obecnym locale czy default)

**Decyzja zależy od audytu:**
- **Jeśli `slug` jest już translatable:** usunąć osobne pole "locale-specific slugs", zamiast tego pokazać tabs PL/EN nad inputem `slug` (jak przy `title`)
- **Jeśli nie:** dodać translatable do migration + przebudować formularz

---

## Etap 3 — Notyfikacje i tłumaczenia

### 3.1 Podwójna notyfikacja przy unpublish bloga [P0]
**Problem:** Przy cofnięciu publikacji wpisu blogowego pojawiają się 2 toaste:
1. "Blog post unpublished successfully" (EN)
2. "Post unpublished" (EN)

**Lokalizacja (do znalezienia):**
- `server/resources/js/pages/admin/blog/` — komponenty edycji bloga
- `server/app/Http/Controllers/Admin/BlogPostController.php` — flash messages
- Możliwe że jeden toast jest `useToast()` w komponencie, drugi z `usePage().props.flash`

**Akcja:**
- Zostawić tylko 1 toast (preferencja: flash z backendu)
- Przetłumaczyć na PL: "Wpis został wycofany z publikacji"

### 3.2 Brakujące tłumaczenia PL [P0]
**Konkretne kluce do dodania:**

| Klucz angielski | Tłumaczenie PL |
|-----------------|----------------|
| `Delete :item` (pokazuje się jako "Usuń :item") | `Usuń :item` z poprawnym placeholderem |
| `Are you sure? This action cannot be undone.` | `Czy na pewno? Tej akcji nie można cofnąć.` |
| `Define locale-specific slugs. Leave blank to use the default slug.` | (do usunięcia — zob. 2.3) |
| `Blog post unpublished successfully` | `Wpis został wycofany z publikacji` |

**Problem dodatkowy:** Placeholder `:item` nie jest podmieniany — sprawdzić jak `lang.delete` jest wywoływane (powinno być `t('common.delete', { item: post.title })` lub podobnie).

**Lokalizacja:**
- `server/database/seeders/TranslationSeeder.php`
- Po dodaniu kluczy: `make sync-translations`

### 3.3 Audyt kompletności tłumaczeń [P1]
**Akcja:** Przejść każdy ekran admina po PL i znaleźć teksty hardcodowane po angielsku. Generycznie:
- `git grep -E '"[A-Z][a-z]+ [a-z]+' server/resources/js/pages/admin/` — heurystyka na hardcoded EN strings
- Wszystkie `confirm()` dialogi
- Wszystkie tytuły `breadcrumbs`
- Wszystkie placeholdery inputów

---

## Etap 4 — Konsystencja UI (przyciski, ikony)

### 4.1 Audyt przycisków [P1]
**Problem:** Nie wszystkie przyciski są spójne — kolor, ikona, cursor on hover.

**Co audytować:**
- Wszystkie miejsca gdzie używany jest `<Button>` w admin SPA
- Sprawdzić wariant (`default` / `outline` / `ghost` / `destructive`) — czy jest spójny z funkcją (np. usuwanie zawsze `destructive`)
- Sprawdzić czy każdy przycisk ma `cursor-pointer` (shadcn nie ma domyślnie!)
- Sprawdzić czy przyciski akcji w toolbar mają ikony (Lucide), te do potwierdzenia formularzy też
- Loading state — czy każdy form button ma `disabled={processing}` + ikona spinnera

**Lokalizacja:**
- `server/resources/js/components/ui/button.tsx` — sprawdzić defaultowe klasy
- Cała `server/resources/js/pages/admin/` — review wszystkich `<Button>`

**Akcja generyczna:** Dodać do `button.tsx` `cursor-pointer` jako klasa bazowa.

### 4.2 Audyt ikon [P2]
**Problem:** Niektóre akcje mają ikony, inne nie. Brak konsystencji.

**Standard do ustalenia:**
- Edycja → `Pencil` / `Edit2`
- Usuwanie → `Trash2`
- Dodawanie → `Plus`
- Eksport → `Download`
- Publikacja → `Send` lub `Globe`
- Cofnięcie publikacji → `EyeOff` lub `Archive`
- Duplikuj → `Copy`
- Podgląd → `Eye`

---

## Etap 5 — Pełny audyt frontendowy admina (agent)

### 5.1 Audyt strona-po-stronie [P1]
**Akcja:** Spawnować agenta `ui-ux` z zadaniem przejścia każdej strony admina (`/admin/*`) i wynotowania:
- Hardcoded EN stringi
- Niespójne style przycisków
- Brakujące loading/empty/error states
- Niedostępne formy (a11y — focus, aria-labels)
- Mobile UX (czy działa na 375px)
- Nieoptymalne layouty (zbyt szerokie tabele, ucięte teksty)

**Output:** Lista issue per strona w formacie:
```
/admin/products
- [ ] Search input bez ikony lupy
- [ ] Pagination bez tłumaczenia
- [ ] Brak empty state gdy brak produktów
```

### 5.2 Audyt accessibility [P2]
**Akcja:** Spawnować agenta `accessibility` z WCAG 2.2 AA checklist:
- Kontrast tekstu (po nowej palecie!)
- Focus rings na wszystkich interaktywnych elementach
- Keyboard navigation (TAB order, ESC dla modali)
- Screen reader labels

---

## Priorytety realizacji (proponowana kolejność)

1. **P0 — bugi blokujące:**
   - 3.1 Podwójna notyfikacja
   - 3.2 Brakujące tłumaczenia (najczęściej widoczne)

2. **P1 — wizualne i funkcjonalne quick wins:**
   - 1.1 Scrollbar
   - 1.2 Border sidebara
   - 1.3 Audyt custom themes (sprawdzenie + naprawa)
   - 4.1 Audyt przycisków + dodanie `cursor-pointer`
   - 2.2 Container/Page Type/Layout — investigation
   - 5.1 Spawnowanie agenta audytowego (równolegle)

3. **P2 — improvementy:**
   - 1.4 Glassmorphism theme
   - 2.1 Paste Block → SectionTemplate workflow
   - 2.3 Locale slugs refactor
   - 3.3 Pełny audyt tłumaczeń
   - 4.2 Audyt ikon
   - 5.2 A11y audit

---

## Notatki techniczne

- **Po zmianach CSS:** `cd /var/www/html && npm run build` (w PHP container — server SPA, NIE node container który buduje Next.js client)
- **Po zmianach w seederach:** `docker compose exec php php artisan db:seed --class=ThemeSeeder` (lub `TranslationSeeder`)
- **Po zmianach Inertia route:** `docker compose exec php php artisan wayfinder:generate` jeśli backend route zmieniony
- **Po dodaniu translacji:** `make sync-translations`

---

## Zmiany już zrealizowane (referencja)

✅ **2026-05-05** — Nowa paleta bazowa (indigo + dark sidebar) — `app.css`
✅ **2026-05-05** — 6 nowych custom themes (Slate Pro, Emerald SaaS, Violet Studio, Midnight Blue, Amber Commerce, Rose Admin) — `ThemeSeeder.php`
