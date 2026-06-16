# Audyt integracji: Theme System / Blog / Page Builder ↔ `components/composition`

Data: 2026-06-16

## Cel dokumentu

Ustalić, czy katalog `client/components/composition/` jest rzeczywiście używany w storefrontzie — oraz zidentyfikować martwe komponenty, duplikaty layout primitives i kandydatów do unifikacji.

**Ten dokument nie implementuje kodu** — jest raportem audytowym i źródłem prawdy przy planowaniu refaktoryzacji lub usunięcia composition layer.

**Powiązane dokumenty:**

- `docs/plans/design-system-theme-page-builder-final-plan.md` — architektura DS + Theme System (composition wymieniony jako docelowa warstwa)
- `docs/plans/page-builder-audit-and-roadmap.md` — audyt architektoniczny page buildera
- `.ai/guide.md` — sekcja B10 Design System Tokens (wspomina `client/components/composition/`)

---

## Wniosek główny

**`client/components/composition/` nie jest używany — to martwy kod w 100%.**

Żaden plik aplikacji (page builder, blog, theme, layouty, testy) nie importuje ani jednego komponentu z tego katalogu. Wszystkie 6 plików `.tsx` figuruje w `git status` jako `??` (untracked) — zostały utworzone, ale nigdy podłączone do renderera ani tras bloga.

| Metoda weryfikacji | Wynik |
|---|---|
| `rg "@/components/composition"` w całym repo | **0 trafień** |
| `rg "components/composition"` | 1 trafienie — wyłącznie `.ai/guide.md` (dokumentacja) |
| Dopasowania nazw (`Section`, `Container`) poza katalogiem | Komentarze JSX (`maintenance.tsx`, `faq-client-module.tsx`) i komentarze w `globals.css` — **nie importy** |
| Plik `index.ts` (barrel re-export) | **Brak** |

---

## 1. Eksporty z `components/composition`

Katalog zawiera 12 plików (6 komponentów + 6 plików typów). Brak barrel file (`index.ts`).

| Komponent | Plik | Zależności wewnętrzne | Charakter |
|---|---|---|---|
| `Container` | `Container.tsx` | — | Layout primitive — max-width z tokenów CSS (`--container-max-width`, `--container-narrow-width`, `--store-wide-shell-width`) |
| `Section` | `Section.tsx` | `Container` | Sekcja strony — wariant tła (`light` / `dark` / `muted` / `brand`) + padding (`none`–`xl`) |
| `PageHeader` | `PageHeader.tsx` | — | Nagłówek strony — title, eyebrow, description, align |
| `CTASection` | `CTASection.tsx` | `Section` | Sekcja call-to-action — primary/secondary link, wariant `brand` |
| `EmptyState` | `EmptyState.tsx` | — | Pusty stan — title, description, opcjonalna akcja |
| `AnimateOnView` | `AnimateOnView.tsx` | `page-builder/animated-section` | Client wrapper nad `AnimatedSection` (passthrough) |

### Wewnętrzny graf zależności

```
CTASection → Section → Container
AnimateOnView → AnimatedSection (page-builder)
PageHeader, EmptyState — standalone
```

Graf jest spójny wewnętrznie, ale **zamknięty** — żaden plik z zewnątrz nie wchodzi do tego grafu.

### Integracja z Theme System (tokeny CSS)

Composition jest poprawnie zaprojektowany pod Theme System — czyta te same tokeny, które wstrzykują `ThemeStyles` / `HandleAppearance`:

| Token | Użycie w composition |
|---|---|
| `--container-max-width` | `Container` (domyślny) |
| `--container-narrow-width` | `Container` (`narrow`) |
| `--store-wide-shell-width` | `Container` (`wide`) |
| `--container-content-width` | `PageHeader`, `CTASection` |
| `--section-padding-y` | `Section` (`padding="lg"`) |
| `--section-dark-bg`, `--section-dark-text` | `Section` (`variant="dark"`) |
| `--font-heading`, `--h1-size`, `--h2-size`, `--h3-size` | `PageHeader`, `CTASection`, `EmptyState` |
| `--btn-radius`, `--btn-padding-x/y` | `CTASection` |
| `--btn-secondary-radius`, `--btn-secondary-padding-x/y` | `CTASection` |
| `--store-card-radius`, `--store-shadow-soft` | `EmptyState` |
| `--block-gap` | `PageHeader` |

---

## 2. Importy komponentów composition

**Brak importów w całym repozytorium** (`client/` i `server/`).

Sprawdzone wzorce:

- `@/components/composition`
- `components/composition/`
- Relatywne importy `../composition`, `./composition`
- Dynamiczne importy (`import()`)
- Testy E2E i unit (`client/tests/`, `server/tests/`)

Jedyna wzmianka poza samym katalogiem:

```text
.ai/guide.md — sekcja B10:
"storefront composition primitives in client/components/composition/"
```

---

## 3. Page Builder — użycie composition

**Żaden plik page buildera nie używa composition.**

Page builder renderuje layout **inline** we własnych plikach:

| Plik | Rola | Layout |
|---|---|---|
| `page-builder/page-renderer.tsx` | Główny renderer stron CMS | Deleguje do `SectionLazyWrapper` |
| `page-builder/section-renderer.tsx` | Renderer sekcji | Własne mapy `variantStyles`, `sectionPaddingStyles`, `layoutContainerStyles` |
| `page-builder/block-renderer.tsx` | Dispatch bloków | Brak composition |
| `page-builder/animated-section.tsx` | Animacje scroll | Używany bezpośrednio przez `section-renderer`, nie przez `AnimateOnView` |
| `page-builder/blocks/*.tsx` (30 bloków) | Komponenty bloków | Własny layout inline |
| `page-builder/modules/*.tsx` (9 modułów) | Moduły (blog, FAQ, store locator…) | Własny layout inline |

### Kluczowy duplikat: `section-renderer.tsx`

`section-renderer.tsx` implementuje te same abstrakcje co `Section` + `Container`:

```text
section-renderer.tsx              composition/
────────────────────────────────  ────────────────────────────────
variantStyles (light/dark/muted/   Section.variantClasses
  brand/hero)
sectionPaddingStyles (none–xl)      Section.paddingClasses
layoutContainerStyles.contained     Container (domyślny)
  mx-auto max-w-[var(--container-
  max-width,80rem)] px-4 sm:px-6
  lg:px-8
AnimatedSection (bezpośrednio)      AnimateOnView (passthrough)
```

### Bloki z duplikatami funkcjonalności composition

| Blok page buildera | Duplikat composition |
|---|---|
| `blocks/call-to-action.tsx` | `CTASection` — gradient/dark/brand warianty, tokeny przycisków |
| `blocks/hero-banner.tsx` | `PageHeader` + `Section` — nagłówek + sekcja hero |
| `blocks/promotional-banner.tsx` | `Section` — wariant tła + padding |

---

## 4. Blog — użycie composition

**Żaden plik bloga nie używa composition.**

| Plik | Rola | Layout (inline) |
|---|---|---|
| `app/_routes/blog-post-page.tsx` | Server route — fetch + render | Deleguje do `BlogPostClient` |
| `app/blog/[slug]/page.tsx` | Default-locale route | Wrapper na `SharedBlogPostPage` |
| `app/[locale]/blog/[slug]/page.tsx` | Locale-prefixed route | Wrapper na `SharedBlogPostPage` |
| `components/blog-post-client.tsx` | Render pojedynczego posta | `mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8` |
| `components/blog-list-client.tsx` | Lista postów | `store-wide-shell mx-auto w-full px-4 py-12 sm:px-6 lg:px-8` |
| `components/blog-comments.tsx` | Komentarze | Własny layout |
| `components/blog-votes.tsx` | Głosowanie | Własny layout |

### Duplikaty w blogu

| Composition | Implementacja inline w blogu | Plik |
|---|---|---|
| `Container` (narrow) | `max-w-3xl px-4 py-12 sm:px-6 lg:px-8` | `blog-post-client.tsx:38` |
| `Container` (wide) | `store-wide-shell mx-auto w-full px-4 py-12 sm:px-6 lg:px-8` | `blog-list-client.tsx:40` |
| `EmptyState` | `<div className="text-muted-foreground py-24 text-center">No posts found.</div>` | `blog-list-client.tsx:94-95` |
| `PageHeader` | Brak dedykowanego komponentu — nagłówki inline w `blog-list-client.tsx` | — |

Blog jest podłączony do Theme System przez `ThemeStyles` w layoutach CMS, ale **nie korzysta z warstwy composition**.

---

## 5. Komponenty martwe

Wszystkie 6 komponentów + ich pliki typów są martwe (zero importów z zewnątrz):

| Status | Pliki |
|---|---|
| **Martwe (unused)** | `Container.tsx`, `Container.types.ts` |
| **Martwe (unused)** | `Section.tsx`, `Section.types.ts` |
| **Martwe (unused)** | `PageHeader.tsx`, `PageHeader.types.ts` |
| **Martwe (unused)** | `CTASection.tsx`, `CTASection.types.ts` |
| **Martwe (unused)** | `EmptyState.tsx`, `EmptyState.types.ts` |
| **Martwe (unused)** | `AnimateOnView.tsx`, `AnimateOnView.types.ts` |

---

## 6. Duplikaty layout primitives

Funkcjonalność composition jest już zaimplementowana inline w wielu miejscach produkcyjnych.

### Mapa duplikatów

| Composition | Duplikat produkcyjny | Lokalizacja | Stopień pokrycia |
|---|---|---|---|
| `Section` (`variantClasses`, `paddingClasses`) | `variantStyles` + `sectionPaddingStyles` | `page-builder/section-renderer.tsx:22-47` | **Pełny** — identyczne warianty i paddingi (+ dodatkowy `hero`) |
| `Container` (contained) | `layoutContainerStyles.contained` | `page-builder/section-renderer.tsx:30-32` | **Pełny** — ten sam max-width i padding |
| `Container` (narrow) | `max-w-3xl px-4 sm:px-6 lg:px-8` | `blog-post-client.tsx:38` | **Częściowy** — brak prop `narrow`, hardcoded `max-w-3xl` |
| `Container` (wide) | `store-wide-shell` utility class | `blog-list-client.tsx:40`, `globals.css` | **Częściowy** — CSS utility zamiast komponentu |
| `CTASection` | `CallToActionBlock` | `blocks/call-to-action.tsx` | **Rozszerzony** — więcej wariantów (gradient, image, alignment) |
| `PageHeader` | Inline nagłówki | `blog-list-client.tsx`, bloki hero | **Brak wspólnego API** — każde miejsce ma własny markup |
| `EmptyState` | Inline empty state | `blog-list-client.tsx:94-95` | **Minimalny** — sam tekst, bez karty/stylu |
| `AnimateOnView` | `AnimatedSection` | `section-renderer.tsx:5,169` | **Redundantny** — `AnimateOnView` to cienki passthrough |

### Tokeny CSS — wspólna podstawa

Mimo duplikacji komponentów, **tokeny CSS są współdzielone** — zarówno composition, jak i page builder / blog czytają te same zmienne z Theme System:

```text
--container-max-width, --container-narrow-width, --store-wide-shell-width
--section-padding-y, --section-dark-bg, --section-dark-text
--font-heading, --h1-size, --h2-size, --h3-size
--btn-radius, --btn-padding-x, --btn-padding-y
--block-gap, --store-card-radius, --store-shadow-soft
```

To oznacza, że unifikacja na composition **nie wymaga zmian w Theme System** — wymaga jedynie podmiany inline layout na komponenty.

---

## 7. Podsumowanie tabelaryczne

### Used

Komponenty z `components/composition/` używane w aplikacji:

| Komponent | Konsumenci |
|---|---|
| — | **Brak** |

### Unused

| Komponent | Pliki | Uwagi |
|---|---|---|
| `Container` | `Container.tsx`, `Container.types.ts` | Zero importów |
| `Section` | `Section.tsx`, `Section.types.ts` | Zero importów |
| `PageHeader` | `PageHeader.tsx`, `PageHeader.types.ts` | Zero importów |
| `CTASection` | `CTASection.tsx`, `CTASection.types.ts` | Zero importów |
| `EmptyState` | `EmptyState.tsx`, `EmptyState.types.ts` | Zero importów |
| `AnimateOnView` | `AnimateOnView.tsx`, `AnimateOnView.types.ts` | Zero importów; passthrough do `AnimatedSection` |

### Duplicate

| Composition | Duplikat | Plik(i) |
|---|---|---|
| `Section` | `variantStyles` + `sectionPaddingStyles` | `section-renderer.tsx` |
| `Container` | `layoutContainerStyles` | `section-renderer.tsx` |
| `Container` (narrow) | `max-w-3xl` inline | `blog-post-client.tsx` |
| `Container` (wide) | `store-wide-shell` | `blog-list-client.tsx`, `globals.css` |
| `CTASection` | `CallToActionBlock` | `blocks/call-to-action.tsx` |
| `EmptyState` | inline „No posts found." | `blog-list-client.tsx` |
| `AnimateOnView` | `AnimatedSection` | `section-renderer.tsx` |

### Candidate for unification

| Priorytet | Cel | Pliki do migracji | Korzyść |
|---|---|---|---|
| **P0** | `section-renderer.tsx` → `Section` + `Container` | `section-renderer.tsx` | Eliminacja zduplikowanych map wariantów/paddingów/containers; jeden punkt zmiany przy nowych wariantach sekcji |
| **P1** | `call-to-action.tsx` → `CTASection` (lub rozszerzenie `CTASection`) | `blocks/call-to-action.tsx` | Wspólne API CTA; blok PB dostaje warianty z composition, composition dostaje gradient/image z bloku |
| **P2** | Blog layout → `Container` + `EmptyState` | `blog-post-client.tsx`, `blog-list-client.tsx` | Spójny layout bloga z resztą storefrontu; `EmptyState` zamiast inline tekstu |
| **P3** | Blog / bloki hero → `PageHeader` | `blog-list-client.tsx`, `blocks/hero-banner.tsx` | Wspólne API nagłówków (eyebrow, title, description, align) |
| **P4** | Usunąć `AnimateOnView` lub uczynić jedynym publicznym API animacji | `AnimateOnView.tsx`, `section-renderer.tsx` | Eliminacja redundantnego passthrough; jeden punkt wejścia do animacji scroll |

---

## 8. Rekomendacja

Stan obecny — **równoległe layout primitives bez integracji** — jest najgorszą z opcji: utrzymujesz dwie implementacje tej samej abstrakcji, a composition (untracked) nie wnosi żadnej wartości.

### Opcja A — Integracja (rekomendowana)

Podłączyć composition do istniejących rendererów, eliminując duplikaty:

1. `section-renderer.tsx` buduje sekcje przez `<Section>` + `<Container>` zamiast inline class maps.
2. `call-to-action.tsx` deleguje do `<CTASection>` (lub `CTASection` zostaje rozszerzony o warianty bloku).
3. Blog (`blog-post-client`, `blog-list-client`) używa `<Container narrow>` / `<Container wide>` + `<EmptyState>`.
4. `AnimateOnView` — usunąć (redundantny) lub uczynić jedynym API animacji.
5. Dodać `index.ts` barrel + testy smoke (render z tokenami Theme System).

**Szacowany zakres:** 4–6 plików, bez zmian w Theme System ani backendzie.

### Opcja B — Usunięcie

Usunąć cały katalog `client/components/composition/` jako martwy kod:

- Usunąć 12 plików z `client/components/composition/`.
- Zaktualizować `.ai/guide.md` (sekcja B10) — usunąć wzmiankę o composition.
- Zaktualizować `docs/plans/design-system-theme-page-builder-final-plan.md` — usunąć composition z docelowej architektury.

**Ryzyko:** duplikaty w `section-renderer.tsx` i blogu pozostają; kolejna próba wprowadzenia warstwy composition wymaga pracy od zera.

### Opcja C — Status quo (odradzana)

Pozostawić composition jako untracked martwy kod. Brak korzyści; rośnie ryzyko driftu między composition a inline implementacjami.

---

## 9. Metodologia audytu

| Krok | Metoda | Zakres |
|---|---|---|
| 1 | `Glob **/composition/**` | Inwentaryzacja plików w katalogu |
| 2 | Odczyt wszystkich 6 komponentów `.tsx` + `.types.ts` | Eksporty, zależności wewnętrzne, tokeny CSS |
| 3 | `rg "@/components/composition"` + `rg "components/composition"` | Importy w całym repo |
| 4 | `rg` po nazwach komponentów (`Section`, `Container`, `PageHeader`, `CTASection`, `EmptyState`, `AnimateOnView`) z wykluczeniem katalogu composition | Fałszywe trafienia vs rzeczywiste importy |
| 5 | Przegląd `page-builder/` (46 plików) | Użycie composition w rendererach i blokach |
| 6 | Przegląd bloga (`app/blog/`, `app/_routes/blog-post-page.tsx`, `components/blog-*.tsx`) | Użycie composition w trasach i komponentach bloga |
| 7 | Porównanie `section-renderer.tsx` z `Section.tsx` + `Container.tsx` | Mapa duplikatów layout primitives |
| 8 | Porównanie `call-to-action.tsx` z `CTASection.tsx` | Mapa duplikatów CTA |
| 9 | Porównanie blog layout z `Container` + `EmptyState` | Mapa duplikatów bloga |

**Data audytu:** 2026-06-16
**Zmiany w kodzie:** brak (audyt read-only)
