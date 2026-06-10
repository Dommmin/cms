# Admin Panel PWA + RWD — Plan wdrożenia

> Status: **draft** | Created: 2026-06-10

---

## Tymczasowy test bypass

- Na czas wdrożenia UI w local można tymczasowo włączyć `ADMIN_AUTH_BYPASS=true`.
- Bypass ma działać wyłącznie w `local` i służy tylko do testów `/panel` bez ręcznego logowania.
- **MUST REVERT:** przed zakończeniem zadania trzeba usunąć bypass z kodu i lokalnego `.env`.
- Status: bypass został usunięty po zakończeniu testów lokalnych.

## Cel

Doprowadzić panel admina (`server/` Inertia React SPA) do stanu, w którym:

- działa wygodnie na `mobile`, `tablet` i `desktop`,
- ma spójny, współdzielony system responsywnych wzorców UI,
- może być instalowany jako lekkie PWA,
- nie wprowadza ryzykownego offline-first dla operacji administracyjnych,
- jest rozwijany etapami przez shared primitives, a nie przypadkowe poprawki per ekran.

## Założenia

### Co już istnieje

- wspólny shell admina oparty o `AppLayout`, sidebar i header,
- współdzielone komponenty typu `PageHeader`, `DataTable`, `Wrapper`,
- hooki i elementy pod zachowania mobilne,
- duża liczba ekranów CRUD, list, formularzy i widoków analitycznych,
- storefront ma już własne PWA, więc można reuse'ować część podejścia, ale nie kopiować 1:1.

### Czego nie robimy w v1

- pełnego offline editing,
- kolejkowania mutacji offline,
- rozwiązywania konfliktów synchronizacji,
- szerokiego refaktoru całego admina jednocześnie,
- osobnych, niestandardowych rozwiązań RWD dla każdego modułu.

### Zasada wdrożeniowa

Najpierw naprawiamy i rozszerzamy **foundation**:

- shell,
- navigation,
- page actions,
- tables,
- forms,
- drawers/sheets,
- sticky patterns.

Dopiero potem wdrażamy fale ekranów.

---

## Diagnoza obecnego stanu

### 1. Admin ma już dobry punkt wejścia do shared refaktoru

Najważniejsze ekrany używają wspólnego layoutu:

- `server/resources/js/layouts/app/app-sidebar-layout.tsx`
- `server/resources/js/components/app-sidebar-header.tsx`
- `server/resources/js/layouts/app-layout.tsx`

To oznacza, że poprawa shellu da szeroki efekt bez przepisywania całego UI.

### 2. Wspólne komponenty są gotowe do wyniesienia na poziom systemu

Największą dźwignię da praca w:

- `server/resources/js/components/page-header.tsx`
- `server/resources/js/components/data-table.tsx`
- `server/resources/js/components/wrapper.tsx`

Te komponenty pojawiają się w wielu ekranach list i formularzy.

### 3. Największe ryzyko UX jest w tabelach i ciężkich formularzach

Admin zawiera dużo ekranów typu:

- index/list z filtrami,
- create/edit z długimi formularzami,
- show/detail z sekcjami i tabelami zależnymi,
- dashboard z widgetami,
- media i bardziej specjalistyczne ekrany.

Na mobile największy koszt będą generować:

- szerokie tabele,
- przeładowane nagłówki akcji,
- filtry inline,
- formularze wielokolumnowe,
- zbyt duże pionowe koszty przewijania.

### 4. PWA dla admina nie powinno być traktowane jak storefrontowe offline experience

Storefront może cache'ować więcej i tolerować stale data.
Admin ma operacje wrażliwe:

- zamówienia,
- klienci,
- płatności,
- stany magazynowe,
- publikacja treści,
- ustawienia.

Dlatego admin PWA v1 powinno być:

- instalowalne,
- szybkie,
- czytelne przy utracie połączenia,
- bezpieczne względem cache boundary.

---

## Kontrakt RWD

## Breakpointy

- `mobile`: `360-767`
- `tablet`: `768-1023`
- `desktop`: `1024+`

## Globalne zasady

### Navigation

- Mobile:
  - sidebar jako pełnoekranowy `Sheet` lub drawer,
  - pojedynczy główny trigger menu,
  - skrócone breadcrumbs,
  - elementy drugorzędne schowane do overflow.
- Tablet:
  - sidebar zwijany,
  - większy nacisk na szerokość contentu niż na stałą obecność pełnej nawigacji.
- Desktop:
  - obecny model sidebar-first może pozostać bazą.

### Page header i actions

- Mobile:
  - tytuł i opis w stacku,
  - primary CTA widoczne od razu,
  - secondary actions w menu,
  - dla edycji: sticky action bar.
- Tablet:
  - częściowy układ inline, ale bez ścisku.
- Desktop:
  - pełny układ inline.

### Filtry

- Desktop: inline toolbar.
- Tablet: toolbar zwijany lub podzielony na 2 rzędy.
- Mobile: filtry w `Sheet`, wyszukiwarka full width nad listą.

### Tabele

- Desktop: pełna tabela.
- Tablet: redukcja kolumn do najważniejszych.
- Mobile:
  - card/list mode albo
  - row summary + details drawer.

### Formularze

- Mobile: 1 kolumna.
- Tablet: 2 kolumny tylko tam, gdzie pola są krótkie i logicznie sparowane.
- Desktop: obecny bardziej rozbudowany layout, jeśli jest czytelny.

### Sticky patterns

- Sticky topbar tylko tam, gdzie poprawia produktywność.
- Sticky bottom action bar dla create/edit na mobile.
- Żadnych przypadkowych sticky sekcji konkurujących ze sobą na małych viewportach.

---

## Foundation backlog

## Faza 1. Responsive app shell

### Zakres

- `server/resources/js/layouts/app/app-sidebar-layout.tsx`
- `server/resources/js/components/app-sidebar-header.tsx`
- `server/resources/js/components/app-sidebar.tsx`
- powiązane hooki mobilne

### Cele

- drawer navigation na mobile,
- poprawne touch targets,
- krótsze breadcrumbs,
- redukcja szumu w headerze,
- miejsce na status połączenia i install/update UX dla PWA.

### Efekt docelowy

Shell ma działać jak stabilna baza dla wszystkich ekranów bez osobnych obejść.

## Faza 2. Shared responsive primitives

### `PageHeader`

Do wdrożenia:

- stack na mobile,
- responsywne `PageHeaderActions`,
- overflow menu dla akcji pomocniczych,
- sticky action region dla ekranów create/edit.

### `DataTable`

Do wdrożenia:

- wariant desktopowy bez regresji,
- możliwość ukrywania lub priorytetyzacji kolumn,
- mobile list/cards mode,
- details drawer dla wiersza,
- lepsze zachowanie search + pagination na małych ekranach.

### `Wrapper`

Do wdrożenia:

- spójne maksymalne szerokości,
- lepsze paddingi per breakpoint,
- bez ręcznego poprawiania spacingu w każdym ekranie.

### Filtry i toolbary

Warto wydzielić wspólny wzorzec:

- search input,
- filter sheet,
- quick filters,
- count aktywnych filtrów,
- reset filters.

### Formularze

Warto wydzielić wspólny wzorzec:

- sekcje jako cards,
- mobile-first spacing,
- sticky save bar,
- lepsza hierarchia pól i opisów.

---

## Fale wdrożeniowe ekranów

## Fala 1. Największy zwrot z inwestycji

### Dashboard

Plik bazowy:

- `server/resources/js/pages/admin/dashboard.tsx`

Zakres:

- widgety 1 kolumna mobile,
- 2 kolumny tablet,
- 4 kolumny desktop,
- onboarding jako czytelny stack lub accordion,
- mniej poziomego ścisku w kartach i akcjach.

### Typowe listy CRUD

Przykład referencyjny:

- `server/resources/js/pages/admin/ecommerce/products/index.tsx`

Zakres:

- page header,
- wyszukiwarka,
- filtry,
- tabela,
- paginacja,
- akcje typu import/export/add.

Po dopracowaniu tego wzorca można go propagować na:

- customers,
- reports,
- forms,
- notifications,
- taxes,
- flags,
- brands,
- discounts,
- flash sales,
- inne indeksy CRUD.

## Fala 2. Show/detail pages

Zakres:

- widoki szczegółów klientów,
- zamówienia,
- zwroty,
- formularze i submission details,
- inne ekrany z sekcjami bocznymi i tabelami zależnymi.

Wzorce:

- metadata summary jako stack,
- relacje jako karty,
- tabele zależne skrócone na mobile,
- akcje globalne zawsze łatwo dostępne.

## Fala 3. Create/edit forms

Priorytetowe obszary:

- products,
- orders/draft order,
- forms,
- blogs,
- themes,
- stores,
- shipping methods,
- taxes,
- notifications.

Wzorce:

- logiczne grupowanie sekcji,
- prostsza nawigacja po formularzu,
- sticky save bar,
- ewentualnie sekcje accordion na mobile.

## Fala 4. Ekrany specjalistyczne

Zakres:

- media,
- analytics,
- onboarding,
- page builder i jego panele poboczne,
- SEO preview i inne ekrany narzędziowe.

To powinno wejść po ustabilizowaniu shared foundation, bo te widoki są bardziej niestandardowe.

---

## Plan PWA v1 dla admina

## Cel

Admin ma zachowywać się jak instalowalna aplikacja robocza, ale bez udawania pełnego offline systemu.

## Zakres

### 1. Manifest

Do dodania:

- nazwa admina,
- ikony,
- `display` typu app-like,
- theme/background color zgodne z admin shell.

### 2. Install flow

Do dodania:

- obsługa `beforeinstallprompt`,
- dyskretna zachęta do instalacji,
- ukrywanie prompta po odrzuceniu,
- możliwość ponownego uruchomienia z ustawień lub headera.

### 3. Service worker

Dozwolone cache:

- statyczne assety,
- bezpieczne assety shellowe,
- ewentualnie wybrane GET-y tylko jeśli nie niosą ryzyka nieaktualnych danych.

Strategia:

- `network-first` dla nawigacji,
- `cache-first` dla assetów,
- bardzo ostrożne `stale-while-revalidate` tylko tam, gdzie dane nie są krytyczne.

### 4. Offline state

Do dodania:

- wskaźnik online/offline w shellu,
- offline fallback,
- czytelny komunikat przy braku połączenia,
- blokada mylących akcji, jeśli backend jest niedostępny.

### 5. Update flow

Do dodania:

- wykrycie nowej wersji,
- toast lub banner z przeładowaniem,
- przewidywalne zachowanie po deployu.

## Czego świadomie nie wspieramy

- offline save,
- offline queue,
- edycji zamówień lub klientów bez połączenia,
- cachowania wrażliwych ekranów w sposób mogący pokazać stare dane jako aktualne.

---

## Architektura wdrożenia

## Zasady

### 1. Shared-first

Jeśli problem da się rozwiązać w komponencie współdzielonym, nie naprawiamy go lokalnie per ekran.

### 2. Minimal diff

Nie przebudowujemy ekranów tylko dlatego, że "przy okazji można". Każda fala ma własny zakres.

### 3. Bez nowego systemu projektowego od zera

Trzymamy się istniejącego języka UI, shadcn/radix i wzorców repo, zamiast robić równoległy design system.

### 4. Safety-first dla PWA

Instalowalność i szybkość są ważne, ale poprawność danych w adminie jest ważniejsza od agresywnego cache.

---

## Weryfikacja

## Viewport matrix

Minimalny zestaw testowy:

- `360x800`
- `390x844`
- `768x1024`
- `1024x1366`

## Scenariusze krytyczne

### Shell

- logowanie,
- otwarcie i zamknięcie menu,
- przejście między głównymi sekcjami,
- przełączenie locale i motywu,
- obsługa notifications i command palette.

### Listy

- wyszukiwanie,
- filtrowanie,
- paginacja,
- akcje primary/secondary,
- zachowanie tabeli na mobile i tablecie.

### Formularze

- create/edit,
- walidacja,
- zapis,
- powrót po błędzie,
- sticky action bar,
- focus i keyboard navigation.

### Media i narzędzia

- upload,
- otwieranie modali,
- zamykanie sheetów i dialogów,
- touch ergonomics.

### PWA

- install prompt,
- wejście do aplikacji z ikony,
- offline fallback,
- powrót po odzyskaniu sieci,
- update notification po nowym deployu.

## Techniczne verifiery

Po zmianach w `server/resources/js/**`:

```bash
rtk docker compose exec php npm run types
```

Opcjonalnie po większych etapach:

```bash
rtk docker compose exec -T php npx eslint server/resources/js/components server/resources/js/pages --max-warnings=0
```

Dynamiczna weryfikacja:

- Browser / webapp-testing dla krytycznych flow po większych etapach.

---

## Kolejność realizacji

## Etap 0. Kontrakt i audit

- spisać finalny kontrakt breakpointów i zachowań,
- potwierdzić zakres PWA v1,
- wybrać 5 ekranów pilotażowych.

## Etap 1. Shell

- sidebar,
- header,
- mobile navigation,
- overflow actions,
- miejsce na online/offline + install/update UX.

## Etap 2. Shared primitives

- `PageHeader`,
- `DataTable`,
- `Wrapper`,
- filtry,
- formularzowe action patterns.

## Etap 3. Fala 1 ekranów

- dashboard,
- produkty index,
- 2-3 kolejne listy CRUD o podobnym wzorcu.

## Etap 4. Fala 2 ekranów

- details/show pages,
- najczęściej używane formularze create/edit.

## Etap 5. PWA shell

- manifest,
- install flow,
- service worker,
- offline state,
- update flow.

## Etap 6. Specjalistyczne widoki

- media,
- analytics,
- onboarding,
- page builder.

---

## Kryteria akceptacji

Plan można uznać za zrealizowany, gdy:

- admin shell działa przewidywalnie na mobile i tablecie,
- typowe listy CRUD nie wymagają poziomego scrolla jako jedynej formy użycia,
- create/edit są używalne jedną ręką na telefonie i sensownie na tablecie,
- PWA da się zainstalować i uruchomić,
- utrata sieci jest czytelnie komunikowana,
- nie ma offline flow, które mogłyby zafałszować stan krytycznych danych,
- shared primitives redukują potrzebę indywidualnych poprawek w każdym module.

---

## Rekomendacja implementacyjna

Najbezpieczniejszy kierunek to:

1. zrobić `RWD foundation` dla całego admina,
2. wdrożyć nim fale ekranów o najwyższym reuse,
3. dopiero potem domknąć `PWA shell`.

Odwrotna kolejność dałaby instalowalną aplikację, która nadal byłaby niewygodna na mobile, co nie rozwiązuje właściwego problemu.
