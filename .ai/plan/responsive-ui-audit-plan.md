# Responsive UI Audit & Implementation Plan

## 1. Executive summary

Ogólny stan responsywności jest lepszy niż przeciętny: na reprezentatywnych trasach nie wykryłem globalnego horizontal overflow na viewportach `390x844`, `430x932`, `768x1024`, `1024x768`, `1280x800`, `1440x900`, `1920x1080`.

Największe problemy nie są dziś „czystym overflow”, tylko niespójnym doborem wzorców RWD:

- admin ma już mobile fallback dla wielu list, ale część ekranów traci zbyt dużo density albo używa wzorca niezgodnego z typem danych,
- formularze admina mają lokalne punkty przeciążenia w headerach, tabsach i przełącznikach locale,
- storefront ma krytyczny problem z fixed overlays: cookie consent zasłania CTA, grid i dolną część widoku na mobile i tablet/landscape,
- tabletowe widoki danych w adminie nadal opierają się o szerokie tabele, ale bez wyraźnie zaprojektowanej strategii „comparison-table with horizontal scroll”.

Audyt wykonałem lokalnie na działającym `http://localhost` i `http://localhost:3000`, z przejściem kluczowych widoków admina i storefrontu oraz screenshotami roboczymi przez browser automation / Playwright. Tymczasowy lokalny bypass admin auth był użyty tylko do audytu i został cofnięty.

## 2. Design policy

- Admin ma pozostać compact, dense, scannable, data-management oriented.
- Storefront ma być visual, spacious, conversion oriented.
- Tabele nie są automatycznie zamieniane na duże karty mobile.
- Dla `comparison-table` preferujemy: desktop tabela, tablet/mobile tabela w kontenerze `overflow-x-auto`, sensowny `min-width`, ukrywanie tylko wtórnych kolumn, primary identifier zawsze widoczny.
- Dla `compact-management-list` preferujemy: desktop tabela/lista, mobile zwarty row/list layout, bez wielkich kart, status w badge, akcje w dropdown.
- Dla formularzy: mobile jedna kolumna, desktop dwie tylko tam, gdzie to naprawdę skraca skanowanie.
- Dla admina ważniejsza jest przewidywalność i szybkość skanowania niż „marketingowy” mobile polish.
- Dla storefrontu ważniejsze są CTA, hierarchy, readability i niezasłanianie treści przez fixed UI.

## 3. View classification

| Route / screen | Area | Current layout | Recommended pattern | Reason | Priority |
|---|---|---|---|---|---|
| `/panel` Dashboard | Admin | dashboard cards + dense top actions | `dashboard-layout` | Shell jest mobilny, ale pierwszy fold jest zbyt zatłoczony akcjami i statusami | Important |
| `/panel/cms/pages` | Admin | desktop table, mobile compact cards | `compact-management-list` | To dobry typ dla stron CMS; wymaga dopracowania tablet strategy i akcji | Important |
| `/panel/ecommerce/orders` | Admin | desktop table, mobile compact cards | `comparison-table` | Zamówienia wymagają porównywania rekordów; mobile cards są zbyt uproszczone | Critical |
| `/panel/ecommerce/products` | Admin | data listing | `compact-management-list` | Lista produktowa powinna zostać kompaktowa, nie kartowa w stylu storefrontu | Important |
| `/panel/ecommerce/products/create` | Admin | long tabbed form | `form-layout` | Tabs i locale chips przeciążają mobile header formularza | Critical |
| `/panel/media` | Admin | visual media list/grid | `visual-card-grid` | Widok wizualny; warto utrzymać grid i pilnować proporcji/thumb density | Important |
| `/panel/analytics/inventory` | Admin | reports/widgets/table mix | `dashboard-layout` + `comparison-table` | Raport i tabela muszą wspierać porównywanie bez psucia tabletu | Important |
| `/panel/cms/pages/{page}/builder` | Admin | editor workspace | `content-editor-layout` | Najwyższe ryzyko na mobile/tablet; wymaga dedykowanej strategii stacked/drawer | Critical |
| `/` | Storefront | hero landing + modular sections | `visual-card-grid` / visual landing | Layout ogólnie trzyma się, ale fixed overlays zasłaniają treść | Important |
| `/shop` | Storefront | listing + filters sidebar/toolbar + cards | `visual-card-grid` | Dobre podstawy, ale fixed elements zabierają przestrzeń i obniżają browsing comfort | Critical |
| `/shop/[slug]` product detail | Storefront | media + CTA + sticky/fixed utility UI | `visual-card-grid` + product detail | Cookie banner zasłania CTA i część contentu | Critical |
| `/cart` | Storefront | empty/full cart + newsletter + footer | `form-layout` / conversion flow | Dół widoku jest przeciążony przez cookie layer i utility widgets | Important |
| `/checkout` | Storefront | multi-step form | `form-layout` | Nie auditowany dynamicznie end-to-end w tym przebiegu, ale powinien dostać dedykowany pass | Important |

## 4. Issues found

### Global layout

- Nie wykryto globalnego document-level horizontal overflow na reprezentatywnych trasach w testowanych viewportach.
- To nie znaczy, że layout jest gotowy: część problemów siedzi wewnątrz komponentów i kontenerów, które chowają szerokość zamiast projektować sensowny wzorzec RWD.

### Sidebar/header

- Admin mobile shell działa jako drawer/sheet, ale pierwszy fold dashboardu i części list jest zbyt zatłoczony: language switcher, search, powiadomienia, status badge i page actions rywalizują o tę samą przestrzeń.
- Na dashboardzie mobile top action area (`active widgets`, `Add widget`, `Restore defaults`) obniża scanability i spycha KPI za nisko.
- Header storefrontu jest lekki, ale na mobile konkuruje z kilkoma fixed warstwami niżej na ekranie.

### Tables/data views

- `/panel/ecommerce/orders` łamie założenie dla `comparison-table`: na mobile przechodzi w uproszczone karty zamiast w przewijalną tabelę z priorytetowymi kolumnami.
- `/panel/cms/pages` na mobile działa jako kompaktowa lista i to jest kierunek poprawny, ale tablet/landscape nadal korzysta z szerokiej tabeli bez wyraźnej strategii redukcji kolumn i actions.
- Na `768x1024` i `1024x768` tabele w `pages` i `orders` mieszczą się bez global overflow, ale pozostają realnie zbyt szerokie względem content area, co oznacza brak świadomego tablet patternu.
- `/panel/ecommerce/orders` w mobile renderuje `#undefined` jako primary identifier w kompaktowym widoku. To psuje skanowanie i podważa usefulness mobile summary row.

### Forms

- `/panel/ecommerce/products/create` ma krytyczny problem mobile: tabs (`General`, `Pricing & Stock`, `Media`, `SEO`) są zbyt ciasne, wizualnie zderzają się ze sobą i degradowane są etykiety.
- Ten sam ekran ma lokalne przeciążenie w wierszach pól z locale chips (`EN` / `PL`), szczególnie przy dłuższych labelach i rich text sections.
- Formularz jest zasadniczo jedną kolumną na mobile, co jest poprawne, ale wymaga uproszczenia sekcji sterujących i headera.

### Modals/drawers

- Admin shell wykorzystuje mobile sidebar poprawnie, ale nie ma jeszcze udokumentowanej, współdzielonej strategii dla filters drawer, actions overflow i editor side panels.
- Dla page buildera należy założyć, że obecny desktop mental model nie przeniesie się 1:1 na mobile.

### Dashboard/widgets

- Dashboard cards same w sobie nie wychodzą poza ekran, ale density pierwszego widoku jest zbyt niska produkcyjnie: za dużo utility controls, za mało KPI na pierwszym scrollu.
- Warto rozdzielić mobile dashboard od desktopowego „toolbar first”.

### Storefront

- Najpoważniejszy problem storefrontu: `cookie-consent` jest fixed i zasłania krytyczne obszary treści i CTA.
- Problem widać na `/`, `/shop`, `/shop/[slug]`, `/cart` i utrzymuje się nie tylko na `390x844` i `430x932`, ale też na tablet/landscape i desktopowych szerokościach po obniżeniu wysokości viewportu.
- Na PDP cookie banner nachodzi na strefę zakupu i obniża conversion clarity.
- Na `/shop` fixed cookie banner + fixed utility widgets redukują widoczną powierzchnię gridu i filtrów.
- Na `/cart` dolna część strony jest przeciążona przez newsletter, cookie layer i dodatkowe floating UI.

### Accessibility/touch targets

- Cookie consent tworzy problem nie tylko layoutowy, ale też interakcyjny: konkuruje z docelowymi touch targets.
- Admin tabs na formularzu produktu są zbyt ciasne na mobile i osłabiają target size / readability.
- W adminie należy dopilnować, by overflow actions i filters używały jednego współdzielonego wzorca z poprawnym focus flow i większym hit area.

## 5. Implementation plan

### Phase 1: Global layout shell

Cel:
- ustabilizować wspólny shell admina i fixed layers storefrontu.

Pliki/komponenty do sprawdzenia:
- `server/resources/js/layouts/app-layout.tsx`
- `server/resources/js/layouts/app/app-sidebar-layout.tsx`
- `server/resources/js/components/app-sidebar.tsx`
- `server/resources/js/components/app-sidebar-header.tsx`
- `server/resources/js/components/app-header.tsx`
- `server/resources/js/hooks/use-mobile-navigation.ts`
- `client/components/layout/header.tsx`
- `client/components/layout/mobile-menu.tsx`
- `client/components/layout/mobile-bottom-nav.tsx`
- `client/components/cookie-consent.tsx`

Konkretne zmiany:
- uprościć mobile/top shell admina i ograniczyć liczbę równorzędnych akcji w pierwszym foldzie,
- zdefiniować jeden wzorzec drawer/sheet dla sidebaru, filtrów i secondary actions,
- przebudować `cookie-consent`, żeby nie zasłaniał CTA, kart produktów ani stref koszyka,
- uporządkować nakładanie się fixed bottom nav, cookie layer i floating widgets na storefront.

Ryzyka:
- łatwo naprawić sam wygląd, ale zepsuć focus order i stacking context,
- fixed layers mogą kolidować z existing chat/widget scripts.

Kryteria akceptacji:
- żaden fixed overlay nie zasłania primary CTA ani głównego contentu na mobile,
- mobile admin shell pokazuje navigation i primary page title bez ścisku,
- sidebar admina działa jako przewidywalny drawer.

### Phase 2: Data display patterns

Cel:
- rozdzielić świadomie `comparison-table` od `compact-management-list`.

Pliki/komponenty do sprawdzenia:
- `server/resources/js/components/data-table.tsx`
- `server/resources/js/components/page-header.tsx`
- `server/resources/js/components/wrapper.tsx`
- `server/resources/js/pages/admin/ecommerce/orders/index.tsx`
- `server/resources/js/pages/admin/cms/pages/index.tsx`
- `server/resources/js/pages/admin/ecommerce/products/index.tsx`

Konkretne zmiany:
- dla `orders` utrzymać tabelę na tablet/mobile w kontenerze `overflow-x-auto` z sensownym `min-width`,
- zachować primary identifier, customer, status i total jako kolumny obowiązkowe,
- przenieść secondary actions do dropdown,
- dla `pages` i `products` dopracować kompaktowy list-row layout na mobile zamiast ciężkich cards,
- naprawić mobile identifier bug typu `#undefined`.

Ryzyka:
- zbyt agresywne ukrywanie kolumn zabije użyteczność comparison views,
- zbyt ogólny refactor `DataTable` może naruszyć kilkanaście ekranów naraz.

Kryteria akceptacji:
- `comparison-table` nie zamienia się w duże karty,
- `compact-management-list` pozostaje gęsty i szybki do skanowania,
- tablet ma przewidywalny wzorzec dla szerokich danych.

### Phase 3: Forms and actions

Cel:
- odciążyć formularze create/edit/settings na mobile.

Pliki/komponenty do sprawdzenia:
- `server/resources/js/pages/admin/ecommerce/products/create.tsx`
- `server/resources/js/pages/admin/cms/pages/create.tsx`
- `server/resources/js/components/page-header.tsx`
- ewentualne współdzielone tabs/locale switch rows w formularzach admina

Konkretne zmiany:
- przebudować mobile tabs na scrollable tabs, segmented control albo overflow menu,
- przenieść locale chips do przewidywalnego row/panelu, który nie wypycha labeli,
- ustandaryzować sticky/floating action area dla create/edit,
- pilnować pełnej szerokości inputów na mobile i redukcji header noise.

Ryzyka:
- formularze wielojęzyczne łatwo pękają na długich labelach i sekundarnych kontrolkach,
- zły sticky action bar może zakryć pola lub klawiaturę mobilną.

Kryteria akceptacji:
- formularze nie mają zderzeń tabs/locale chips,
- inputy są czytelne i pełnoszerokie na mobile,
- primary action jest łatwo dostępna bez chaosu w headerze.

### Phase 4: Storefront responsive fixes

Cel:
- poprawić browsing i conversion comfort bez utraty visual quality.

Pliki/komponenty do sprawdzenia:
- `client/app/page.tsx`
- `client/app/_routes/product-detail-page.tsx`
- `client/app/cart/page.tsx`
- `client/app/search/page.tsx`
- `client/components/product-card.tsx`
- `client/components/product-list-item.tsx`
- `client/components/cookie-consent.tsx`
- `client/components/layout/footer.tsx`
- `client/components/layout/newsletter-form.tsx`

Konkretne zmiany:
- przebudować cookie consent na mniej inwazyjny responsive variant,
- dopilnować, żeby PDP CTA i quantity controls nie były zasłaniane,
- uspokoić dół viewportu na shop/cart przez lepszą hierarchię fixed elements,
- dopracować tablet/landscape listing layout i relację filters vs grid.

Ryzyka:
- zbyt „lekki” cookie banner może osłabić zgodność UX/consent expectations,
- poprawki PDP i listingów muszą zachować existing theme system.

Kryteria akceptacji:
- primary CTA na PDP jest zawsze widoczne,
- shop grid nie jest przykrywany przez consent layer,
- cart i listing zachowują komfort scrollowania na mobile.

### Phase 5: Playwright responsive checks

Cel:
- zamienić obecny ręczny pass w powtarzalne smoke checks.

Pliki/komponenty do sprawdzenia:
- `client/playwright.config.ts`
- istniejące `client/tests/e2e/*`
- ewentualnie dedykowane testy smoke dla admina i storefrontu

Konkretne zmiany:
- dodać responsive smoke scenarios dla kluczowych tras,
- sprawdzać brak document-level overflow,
- sprawdzać obecność primary CTA / header / drawer trigger,
- dodawać screenshot assertions tylko tam, gdzie stabilność danych na to pozwala.

Ryzyka:
- seeded demo data bywa zmienne, więc testy screenshotowe muszą być selektywne,
- admin auth bypass do testów musi być lokalny/tymczasowy i obowiązkowo usuwany przed commitem.

Kryteria akceptacji:
- szybki zestaw smoke tests przechodzi na wybranych viewportach,
- łatwo odtworzyć regresję po zmianach shell/data/form/storefront.

### Phase 6: QA and final verification

Cel:
- domknąć wdrożenie bez zostawiania lokalnych obejść i bez regresji toolchainu.

Pliki/komponenty do sprawdzenia:
- wszystkie dotknięte współdzielone komponenty
- końcowo: repo-wide targeted checks + przed releasem `make fix && make check`

Konkretne zmiany:
- usunąć tymczasowy bypass admin auth przed commitem,
- przejść finalny manual pass na tych samych viewportach,
- uruchomić targeted lint/type/tests dla dotkniętych obszarów.

Ryzyka:
- łatwo zostawić lokalny bypass lub debug-only ślady,
- shared component refactor może rozlać się na nieprzetestowane ekrany.

Kryteria akceptacji:
- brak auth bypass w finalnym diffie,
- smoke tests i targeted checks są zielone,
- finalny manual pass potwierdza brak regresji.

## 6. Components/patterns to standardize

- `AppShell`
  - jeden kontrakt dla content width, header zones, sticky regions i mobile drawer behavior.
- `Sidebar`
  - jeden responsive model: desktop persistent, tablet collapsible, mobile drawer.
- `Header`
  - jasny podział na primary title, primary action i secondary utility actions.
- `DataTable`
  - jawne tryby: `comparison-table` oraz `compact-management-list`.
- `CompactManagementList`
  - współdzielony mobile row pattern dla pages/products/customers/campaigns.
- `ResponsiveFormLayout`
  - wspólny wzorzec sekcji, kolumn, tabs, locale controls i sticky actions.
- `PageHeader`
  - stack mobile, compact desktop, overflow menu dla secondary actions.
- `ActionDropdown`
  - standard dla akcji w listach i nagłówkach.
- `MobileFiltersDrawer`
  - jeden wzorzec dla admina i storefrontu tam, gdzie inline filters nie mieszczą się sensownie.

## 7. Acceptance criteria

- brak horizontal overflow na wskazanych viewportach dla kluczowych tras admina i storefrontu,
- `comparison-table` nie są zamienione na duże karty mobile,
- admin zachowuje compact density i szybkie skanowanie,
- primary i secondary akcje są dostępne na mobile bez ścisku,
- formularze nie wychodzą poza ekran i nie mają konfliktów tabs/locale controls,
- sidebar admina działa jako drawer na mobile,
- cookie consent nie zasłania CTA, gridów ani koszyka,
- fixed overlays storefrontu nie konkurują ze sobą na dole viewportu,
- Playwright smoke checks obejmują kluczowe trasy i viewporty,
- lint / typecheck / testy przechodzą po wdrożeniu,
- tymczasowy bypass admin auth jest usunięty przed commitem.

## 8. Follow-up implementation prompt

```text
Jesteś Senior Frontend/UX Engineer dla tego repo.

Zaimplementuj plan z pliku `.ai/plan/responsive-ui-audit-plan.md`.

Zasady:
- zacznij od shared primitives i shella, nie od losowych per-screen hacków,
- admin ma być compact, dense, scannable,
- storefront ma być visual i conversion-oriented,
- nie zamieniaj comparison-table na duże karty mobile,
- używaj istniejących wzorców Tailwind/shadcn/ui i komponentów repo,
- nie dodawaj nowych bibliotek bez mocnego uzasadnienia,
- nie używaj `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@phpstan-ignore-*`,
- nie zostawiaj tymczasowego bypassu auth w finalnym diffie,
- po każdej większej fazie uruchamiaj targeted verification,
- na końcu wykonaj manual responsive pass dla viewportów:
  - 390x844
  - 430x932
  - 768x1024
  - 1024x768
  - 1280x800
  - 1440x900
  - 1920x1080

Kolejność prac:
1. Phase 1: Global layout shell
2. Phase 2: Data display patterns
3. Phase 3: Forms and actions
4. Phase 4: Storefront responsive fixes
5. Phase 5: Playwright responsive checks
6. Phase 6: QA and final verification

Najpierw wypisz krótki plan wykonania, potem wprowadzaj zmiany etapami.
```
