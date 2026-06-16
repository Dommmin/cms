# Docelowa architektura: unifikacja `composition` (Opcja A — Integracja)

Data: 2026-06-16
Status: projekt architektury (do akceptacji przed implementacją)
Bazuje na: `docs/plans/composition-integration-audit.md`

## Cel

Domknąć stan z audytu (równoległe layout primitives bez integracji) realizując **Opcję A**: podłączyć `client/components/composition/` jako jedyną warstwę layout primitives, z której korzystają **page builder i blog**, eliminując duplikaty `Container` / `Section` / `Grid` — **bez breaking changes dla istniejących bloków**.

### Założenia projektowe

| Założenie | Decyzja architektoniczna |
|---|---|
| Jeden wspólny Design System | DS = `components/ui/` (atomy shadcn: button, input…) **+** `components/composition/` (layout & section primitives). Te dwie warstwy razem są "Design Systemem"; tokeny CSS z Theme System to ich podstawa. |
| Jeden folder `composition` | Cała logika layoutu konsoliduje się w `client/components/composition/`. Page builder i blog **importują**, nie reimplementują. |
| Blog i page builder z tych samych prymitywów | `Container`, `Section`, `Grid`, `PageHeader`, `EmptyState`, `CTASection`, `AnimateOnView` mają jedno źródło prawdy. |
| Brak duplikacji `Container/Section/Grid` | Mapy klas (`variant`, `padding`, `container`, `grid`) istnieją **raz** w `composition` i są konsumowane zarówno przez komponenty, jak i przez `section-renderer.tsx`. |
| Brak breaking changes dla bloków | `block-registry`, publiczne API bloków i kontrakty `configuration` pozostają nietknięte. Bloki delegują layout do prymitywów **wewnętrznie**. |

### Kluczowa decyzja: "single source of truth" zamiast "rewrite"

`section-renderer.tsx` to `'use client'` orchestrator z nietrywialną logiką (lazy-load, sanitizacja custom CSS, atrybuty `data-animation`, custom id/classes). **Nie przepisujemy go na `<Section>`** — zamiast tego wyciągamy z niego mapy klas do `composition/styles.ts` i renderer konsumuje te same mapy co komponent `<Section>`. To zabija duplikację, a nie dotyka ryzykownej logiki renderera.

---

## 1. Target folder structure

```
client/components/
├── ui/                              # DS — atomy (shadcn) — bez zmian
│   ├── button.tsx
│   ├── input.tsx
│   └── …
│
├── composition/                     # DS — layout & section primitives (JEDYNE źródło)
│   ├── index.ts                     # [NOWE] barrel — publiczne API warstwy
│   ├── styles.ts                    # [NOWE] współdzielone mapy klas + typy unii
│   │                                #   sectionVariantClasses, sectionPaddingClasses,
│   │                                #   containerClasses, gridClasses
│   ├── primitives/                  # czyste prymitywy (zero logiki domenowej)
│   │   ├── Container.tsx            # [MIGRACJA] + obsługa narrow/wide/full-width
│   │   ├── Container.types.ts
│   │   ├── Section.tsx              # [MIGRACJA] konsumuje styles.ts, + variant 'hero'
│   │   ├── Section.types.ts
│   │   ├── Grid.tsx                 # [NOWE] cols 2/3/4, gap z tokenu --block-gap
│   │   ├── Grid.types.ts            # [NOWE]
│   │   ├── AnimateOnView.tsx        # [MIGRACJA] kanoniczne API animacji scroll
│   │   └── AnimateOnView.types.ts
│   └── patterns/                    # wzorce złożone z prymitywów
│       ├── PageHeader.tsx           # [MIGRACJA] eyebrow/title/description/align/actions
│       ├── PageHeader.types.ts
│       ├── CTASection.tsx           # [MIGRACJA] rozszerzony: style + alignment + bg image
│       ├── CTASection.types.ts
│       ├── EmptyState.tsx           # [MIGRACJA]
│       └── EmptyState.types.ts
│
├── page-builder/                    # konsument composition
│   ├── section-renderer.tsx         # [ZMIANA] importuje mapy z composition/styles.ts
│   ├── animated-section.tsx         # [ZMIANA] cienki re-export → composition (back-compat)
│   └── blocks/                      # bloki delegują layout, API bez zmian
│       ├── call-to-action.tsx       # [ZMIANA] deleguje do <CTASection>
│       ├── hero-banner.tsx          # [ZMIANA] <PageHeader> + <Section>
│       ├── two-columns.tsx          # [ZMIANA] <Grid cols={2}>
│       └── three-columns.tsx        # [ZMIANA] <Grid cols={3}>
│
└── blog-*.tsx                       # konsument composition
    ├── blog-post-client.tsx         # [ZMIANA] <Container narrow>
    └── blog-list-client.tsx         # [ZMIANA] <Container wide> + <EmptyState> + <PageHeader>
```

Uwagi:
- Podział `primitives/` vs `patterns/` jest opcjonalny, ale zalecany (czytelność, kierunek zależności: `patterns → primitives`, nigdy odwrotnie). Jeśli zespół woli płaską strukturę — pliki zostają w `composition/` bez podfolderów; reszta planu bez zmian.
- `store-wide-shell` (utility w `globals.css`) **zostaje** — jest używany w 5+ miejscach (`search`, `products`, `storefront-listing-modules`, `blog/loading`). `Container wide` to jego odpowiednik komponentowy; oba czytają `--store-wide-shell-width`. Nie usuwamy utility.
- `ui/` (shadcn) pozostaje osobną podwarstwą DS — `composition` może z niego korzystać (np. `CTASection`/`EmptyState` → `<Button>`), nie odwrotnie.

### Kierunek zależności (docelowy)

```
Theme System (tokeny CSS)
        ↑ czyta
   composition/styles.ts  ──────┐
        ↑                       ↑
   primitives/  ← patterns/     │ (te same mapy)
        ↑              ↑        │
   page-builder ───────┴────────┘   blog
   (section-renderer, blocks)        (blog-*-client)
```

---

## 2. Migration order

Każdy krok jest **niezależnie weryfikowalny** (types + lint + wizualna parytetowość) i nie wprowadza breaking changes. Kolejność: od fundamentu, przez najtańsze/najpewniejsze, do najbardziej ryzykownego (CTA) na końcu.

| # | Krok | Zakres | Ryzyko | Weryfikacja |
|---|---|---|---|---|
| **0** | **Fundament** — `index.ts`, `styles.ts` (wyciągnięte mapy), `Grid`, rozszerzenie `Section` (`hero`) i `Container` (`full-width`); ujęcie plików w git | composition/ | minimalne (brak konsumentów) | `npm run types`, lint; nic nie renderuje inaczej |
| **1** | **P0** — `section-renderer.tsx` konsumuje `composition/styles.ts` (usunięcie `variantStyles` / `sectionPaddingStyles` / `layoutContainerStyles`) | page-builder | średnie | wizualny parytet stron CMS (sekcje light/dark/muted/brand/hero, layouty contained/full-width/flush/two-col/three-col, padding, lazy-load) |
| **2** | **P4** — unifikacja animacji: kanoniczny `AnimateOnView` w composition; `page-builder/animated-section.tsx` → re-export | page-builder, composition | niskie | animacje scroll działają jak wcześniej (fade-up/in/left/right/zoom) |
| **3** | **P2** — blog: `<Container narrow>` (post) + `<Container wide>` + `<EmptyState>` (lista) | blog | niskie | parytet layoutu bloga |
| **4** | **P3** — `PageHeader` w `blog-list-client.tsx` i `blocks/hero-banner.tsx` | blog, page-builder | niskie–średnie | nagłówki renderują się identycznie |
| **5** | **Grid adoption** — `two-columns.tsx` / `three-columns.tsx` → `<Grid>` | page-builder | niskie | parytet siatek |
| **6** | **P1** — `CTASection` rozszerzony (style: plain/gradient/dark/brand/image, alignment, badge, bg image); `blocks/call-to-action.tsx` deleguje | page-builder, composition | **najwyższe** | parytet wszystkich wariantów bloku CTA |
| **7** | **Dokumentacja + testy** — `.ai/guide.md` B10, final-plan, smoke testy prymitywów | docs, tests | niskie | `make check` zielony |

Zasada: po każdym kroku stan jest spójny i mergowalny (atomowe commity per krok).

---

## 3. Lista plików do zmiany

### NOWE

| Plik | Rola |
|---|---|
| `client/components/composition/index.ts` | Barrel — publiczne API warstwy (jeden punkt importu) |
| `client/components/composition/styles.ts` | Jedyne źródło map klas: `sectionVariantClasses`, `sectionPaddingClasses`, `containerClasses`, `gridClasses` + typy unii (`SectionVariant`, `SectionPadding`, `ContainerWidth`, `GridCols`) |
| `client/components/composition/primitives/Grid.tsx` | Prymityw siatki (2/3/4 kolumny, gap z `--block-gap`) |
| `client/components/composition/primitives/Grid.types.ts` | Typy `GridProps` |
| `client/tests/composition/primitives.spec.ts(x)` *(lub render-test wg konwencji)* | Smoke: render prymitywów z tokenami Theme System |

### MODYFIKOWANE — composition (przeniesienie do `primitives/` + `patterns/` i refaktor)

| Plik | Zmiana |
|---|---|
| `Container.tsx` / `.types.ts` | Konsumuje `containerClasses` ze `styles.ts`; dodać `full-width`; warianty: `narrow`/`wide`/default (bez breaking — propy zostają) |
| `Section.tsx` / `.types.ts` | Konsumuje `sectionVariantClasses` + `sectionPaddingClasses`; dodać wariant `hero` (parytet z rendererem) |
| `CTASection.tsx` / `.types.ts` | Rozszerzyć o `style` (plain/gradient/dark/brand/image), `align`, `badge`, opcjonalny `backgroundImage`; zachować dotychczasowe propy |
| `PageHeader.tsx` / `.types.ts` | Upewnić, że API pokrywa blog + hero (eyebrow, title, description, align, opcjonalne `actions`) |
| `EmptyState.tsx` / `.types.ts` | Bez zmian API; ewentualnie `<Button>` z `ui/` w akcji |
| `AnimateOnView.tsx` / `.types.ts` | Kanoniczne API animacji (impl framer-motion lub delegacja); jeden punkt wejścia |

### MODYFIKOWANE — page-builder

| Plik | Zmiana |
|---|---|
| `section-renderer.tsx` | Import map z `composition/styles.ts`; usunięcie lokalnych `variantStyles` / `sectionPaddingStyles` / `layoutContainerStyles`; logika lazy-load/CSS/animacji **bez zmian** |
| `animated-section.tsx` | Re-export z `composition` (back-compat dla istniejących importów) |
| `blocks/call-to-action.tsx` | Deleguje do `<CTASection>`; mapowanie `configuration` → propy; `configuration`-kontrakt bez zmian |
| `blocks/hero-banner.tsx` | `<PageHeader>` + `<Section>` |
| `blocks/two-columns.tsx`, `blocks/three-columns.tsx` | `<Grid>` |
| `blocks/promotional-banner.tsx` *(opcjonalnie, niższy priorytet)* | `<Section>` |

### MODYFIKOWANE — blog

| Plik | Zmiana |
|---|---|
| `blog-post-client.tsx` | `<Container narrow>` zamiast `max-w-3xl …` |
| `blog-list-client.tsx` | `<Container wide>` + `<EmptyState>` + `<PageHeader>` |

### MODYFIKOWANE — dokumentacja

| Plik | Zmiana |
|---|---|
| `.ai/guide.md` (B10) | Aktualizacja opisu warstwy composition (już zintegrowana, struktura primitives/patterns, barrel) |
| `docs/plans/design-system-theme-page-builder-final-plan.md` | Doprecyzowanie composition jako warstwy zrealizowanej |
| `docs/plans/composition-integration-architecture.md` | Ten dokument |

**Nie ruszamy:** `block-registry.tsx`, `block-renderer.tsx`, `module-renderer.tsx`, kontraktów `*.types.ts` bloków (publiczne API), backendu, Theme System, `globals.css` (`store-wide-shell` zostaje).

Szacunek: ~6 nowych/przeniesionych plików composition + ~8 plików konsumentów + 3 docs. Bez zmian w backendzie i Theme System.

---

## 4. Ryzyka

| # | Ryzyko | Prawdopodobieństwo / Wpływ | Mitigacja |
|---|---|---|---|
| R1 | Regresja wizualna w `section-renderer` (mapy mają subtelne różnice fallbacków `var(...)`) | śr. / wys. | Wyciągamy mapy **1:1** ze `styles.ts`; przed/po — screenshoty stron CMS; parytet fallbacków tokenów |
| R2 | `CTASection` (P1) — najbogatszy wariantowo blok; ryzyko zmiany wyglądu istniejących CTA | śr. / wys. | Rozszerzamy `CTASection` o **wszystkie** style bloku (gradient/image/badge/align); blok zachowuje kontrakt `configuration`; wizualny diff per wariant; krok ostatni |
| R3 | `hero` variant istnieje tylko w rendererze — pominięcie = utrata wyglądu hero | niskie / śr. | Dodać `hero` do unii `SectionVariant` w `styles.ts` w kroku 0 |
| R4 | Section komponent zawsze owija w `Container` i `<section>`; renderer potrzebuje `full-width`/`flush`/grid/no-container | śr. / śr. | Renderer **nie** używa `<Section>` bezpośrednio — konsumuje tylko mapy; elastyczność layoutów zachowana |
| R5 | Dwie implementacje animacji (framer-motion) → rozjazd przy re-eksporcie | niskie / śr. | Jedna impl, druga to cienki re-export; `'use client'` zachowane; brak zmian w importach |
| R6 | `store-wide-shell` usunięty przez pomyłkę (używany w 5+ miejscach) | niskie / wys. | Jawnie **zostawiamy** utility; `Container wide` to dodatek, nie zamiennik utility |
| R7 | Barrel `index.ts` → koszt importu / tree-shaking (reguła Vercel) | niskie / niskie | Warstwa malutka; brak barrel-re-export ciężkich bibliotek; ewentualnie importy bezpośrednie |
| R8 | Pliki composition są untracked (`git ??`) — łatwo zgubić przy refaktorze | śr. / śr. | Krok 0: ująć w git (po zgodzie); od tego momentu śledzone |
| R9 | Złamanie reguły "typy poza `.tsx`" / dodanie `eslint-disable`/`ts-ignore` | niskie / śr. | Wszystkie typy w `*.types.ts`; zero silencingu; `make check` jako bramka |
| R10 | Rozjazd między blokiem CTA a `CTASection` po migracji (drift) | śr. / śr. | Po P1 blok = cienka adaptacja `configuration→props`; jeden komponent prezentacyjny |

---

## 5. Definition of Done

- [ ] **Zero duplikatów map**: `variantStyles`, `sectionPaddingStyles`, `layoutContainerStyles` usunięte z `section-renderer.tsx`; jedyne źródło to `composition/styles.ts`.
- [ ] `Container`, `Section`, `Grid` zdefiniowane **raz**; blog i page builder importują z `@/components/composition`.
- [ ] **Brak breaking changes**: `block-registry`, publiczne API bloków i kontrakty `configuration` nietknięte; istniejące strony CMS renderują się identycznie.
- [ ] `composition/index.ts` (barrel) istnieje; katalog `composition/` **śledzony w git** (brak `??`).
- [ ] Blog: `blog-post-client` używa `<Container narrow>`, `blog-list-client` używa `<Container wide>` + `<EmptyState>` + `<PageHeader>`.
- [ ] Page builder: `call-to-action` deleguje do `<CTASection>`, `hero-banner` używa `<PageHeader>`+`<Section>`, `two/three-columns` używają `<Grid>`.
- [ ] Animacje: jedno publiczne API (`AnimateOnView`); `page-builder/animated-section` to re-export; brak regresji animacji scroll.
- [ ] `store-wide-shell` w `globals.css` nadal istnieje i działa we wszystkich dotychczasowych miejscach.
- [ ] **Parytet wizualny zweryfikowany** (screenshoty/Playwright) dla: strony CMS z sekcjami (warianty + layouty + padding + lazy-load), blok CTA (każdy `style`), blok hero, lista bloga (w tym empty state), pojedynczy post.
- [ ] Smoke testy renderują prymitywy z tokenami Theme System (zielone).
- [ ] `docker compose exec node npm run types` + lint przechodzą; `make check` zielony.
- [ ] Zero nowych `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; typy w plikach `*.types.ts`.
- [ ] `.ai/guide.md` (B10) i `design-system-theme-page-builder-final-plan.md` zaktualizowane do stanu zintegrowanego.
- [ ] Commity atomowe per krok migracji (jeden problem na commit).
```
