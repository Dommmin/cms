# Mobile 1:1 Parity z `client/` — plan wdrożenia

> Status: **draft** | Created: 2026-06-11

## Cel

Zbudować `mobile/` jako mobilne odwzorowanie `client/` w modelu:

- 1:1 na poziomie capabilities, danych i flow biznesowych,
- nie 1:1 na poziomie technologii webowej,
- z natywnym UX tam, gdzie webowe odpowiedniki nie mają sensu w Expo / React Native.

To oznacza:

- ten sam zakres funkcji commerce + CMS + account,
- te same kontrakty API i ta sama logika biznesowa po stronie backendu,
- brak prób kopiowania elementów wyłącznie webowych takich jak `robots`, `sitemap`, `manifest`, `opengraph-image`, service worker czy SEO metadata jako literalnych feature'ów mobilnych.

## Stan obecny

## Co już istnieje w `mobile/`

- fundament Expo Router + React Query + auth provider + API client,
- podstawowe flow:
  - home / listing / product detail,
  - cart,
  - checkout + payment pending,
  - search,
  - compare,
  - wishlist,
  - account,
  - orders,
  - blog list + detail,
  - stores,
  - newsletter,
  - CMS pages `pages/[...slug]`,
- uproszczony renderer CMS: [mobile-page-renderer.tsx](/Users/domin/projects/laravel/cms/mobile/src/components/cms/mobile-page-renderer.tsx),
- część API already mirrored:
  - `auth`, `cart`, `checkout`, `cms`, `orders`, `payments`, `products`, `profile`, `search`, `stores`, `wishlist`.

## Najważniejsze luki względem `client/`

### 1. Brak pełnej parytetowości tras i ekranów

W `client/app` istnieją dodatkowo m.in.:

- login,
- register,
- social callback,
- account profile jako osobny ekran,
- account notifications,
- account notification preferences,
- account returns list + detail,
- checkout options,
- checkout success,
- newsletter confirm,
- newsletter unsubscribe,
- shared cart,
- flash sales,
- osobne warianty locale routes,
- część specjalnych route resolverów dla dynamic pages.

### 2. Brak pełnej parytetowości warstwy API

Brakuje odpowiedników z `client/api/`:

- `chat.ts`,
- `forms.ts`,
- `notification-preferences.ts`,
- `notifications.ts`,
- `settings.ts`,
- `shared-cart.ts`,
- `translations.ts`.

### 3. Brak pełnej parytetowości hooków / state flows

Brakuje odpowiedników z `client/hooks/` dla:

- auth split na dedykowane hooki,
- CMS hooks,
- blog hooks,
- orders/profile/search/checkout abstractions,
- notifications,
- payment status,
- pickup points,
- promotions / live counters,
- translations / locale helperów,
- shared cart.

### 4. Renderer CMS w `mobile/` jest tylko częściowym MVP

`client/` ma rozbudowany page builder:

- `page-renderer`,
- `section-renderer`,
- `block-renderer`,
- `module-renderer`,
- dedykowane bloki i moduły storefrontowe.

`mobile/` ma pojedynczy renderer, który:

- renderuje tylko część bloków,
- robi uproszczenia treści,
- nie ma pełnego module layer parity,
- nie implementuje wszystkich zachowań commerce/content z `client/components/page-builder/**`.

### 5. Brak mobilnych odpowiedników dla części ważnych flow storefrontu

Szczególnie istotne:

- returns / complaints,
- notifications + notification preferences,
- shared cart,
- flash sales hub,
- store locator parity z page-builder module,
- guest trackers / system pages,
- auth/register/login jako kompletna ścieżka,
- social auth callback,
- checkout success / recoverable payment states.

### 6. Brak wyraźnego kontraktu “co znaczy 1:1” dla mobile

Przed implementacją trzeba ustalić kategorie:

- `must mirror exactly`,
- `mirror biznesowo, ale natywnie`,
- `web-only, więc świadomie pomijane`,
- `defer to later`.

Bez tego powstaną spory o to, czy np. SEO albo PWA są “brakiem parity”.

## Zasada parity

## Kategoria A: musi być 1:1 biznesowo i funkcjonalnie

- auth,
- catalog,
- search,
- product detail,
- cart,
- checkout,
- orders,
- wishlist,
- compare,
- newsletter,
- stores,
- blog,
- CMS pages,
- account area,
- returns / complaints,
- shared cart,
- notifications,
- dynamic modules wykorzystywane na storefrontie.

## Kategoria B: musi być 1:1 semantycznie, ale nie literalnie technicznie

- locale routing,
- CMS dynamic routing,
- payment redirects / pending / success,
- maps,
- pickup points,
- push notifications jako mobilny odpowiednik web notifications,
- analytics hooks.

## Kategoria C: web-only, nie kopiujemy literalnie

- `robots.ts`,
- `sitemap.ts`,
- `manifest.ts`,
- `feed.xml`,
- `rss.xml`,
- `opengraph-image`,
- service worker,
- `offline/page.tsx`,
- SEO metadata / JSON-LD / GTM w formie web-only.

Tu plan ma wymagać świadomego “not applicable”, a nie cichego ignorowania.

## Główne ryzyka

### 1. `mobile/` nie ma jeszcze pełnego foundation projectowego

Repo ma mocne reguły dla `server/` i `client/`, ale `mobile/` wygląda nadal jak projekt po bootstrapie Expo:

- generyczny `README`,
- brak mobile-specific `AGENTS.md`,
- brak spójnego verification workflow opisanego na poziomie repo.

Pierwszy etap musi uporządkować foundation, inaczej kolejne iteracje będą niespójne.

### 2. Zbyt wczesne przepisywanie UI bez ustalenia shared contracts

Jeśli agent zacznie od przypadkowych ekranów:

- rozjadą się patterny formularzy,
- rozjadą się query keys,
- rozjadą się modele filtrów,
- renderer CMS stanie się zbiorem wyjątków.

### 3. “1:1” może zostać błędnie zrozumiane jako kopiowanie weba

Mobile powinno reużywać:

- kontrakty API,
- układ danych,
- nazwy capability,
- flow użytkownika.

Nie powinno kopiować webowych technikaliów, jeśli natywny odpowiednik jest inny.

### 4. Brak fazy integracyjnej dla page builder parity

Największy dług jest w `client/components/page-builder/**`.
Bez osobnego etapu dla block/module parity powstanie aplikacja z działającym commerce, ale bez prawdziwego odwzorowania CMS storefrontu.

## Docelowy podział prac

## Faza 0. Ustalenie kontraktu parity i foundation `mobile/`

### Zakres

- zdefiniować “parity matrix” feature po feature,
- dodać `mobile/AGENTS.md`,
- dopisać mobile do dokumentacji `.ai/`,
- ustalić komendy weryfikacyjne dla `mobile/`,
- oczyścić bootstrapowe pozostałości Expo.

### Deliverables

- dokument parity matrix,
- mobile-specific working agreement,
- lista feature flags / braków świadomie odłożonych,
- techniczny backlog bez mieszania web-only i native-only zakresów.

### Done when

- każdy feature z `client/` jest przypisany do jednej z kategorii: implementować, adaptować natywnie, nie dotyczy,
- jest jasne, jak weryfikować `mobile/`.

## Faza 1. Shared foundation i architecture alignment

### Zakres

- ujednolicić API client, query keys, storage, auth lifecycle,
- wydzielić dedykowane hooki zamiast logiki osadzonej per screen,
- przygotować shared screen primitives:
  - forms,
  - list states,
  - empty/error/loading,
  - CTA rows,
  - sheets/modals,
  - confirmation patterns,
- ustandaryzować locale handling i deep links.

### Priorytetowe pliki

- `mobile/src/api/client.ts`
- `mobile/src/providers/*`
- `mobile/src/hooks/*`
- `mobile/src/components/ui/*`
- `mobile/src/lib/*`

### Done when

- nowe ekrany nie duplikują fetch / mutation boilerplate,
- auth/cart/locale zachowują się spójnie,
- jest spójny zestaw mobilnych primitives.

## Faza 2. Route parity i shell aplikacji

### Zakres

- doprowadzić drzewo `mobile/src/app/**` do pokrycia odpowiedników z `client/app/**`,
- rozdzielić account na osobne flows zamiast jednego przeładowanego taba,
- dodać brakujące ekrany:
  - `auth/login`,
  - `auth/register`,
  - `auth/social-callback`,
  - `account/profile`,
  - `account/notifications`,
  - `account/notifications/preferences`,
  - `account/returns`,
  - `account/returns/[reference]`,
  - `checkout/options`,
  - `checkout/success`,
  - `newsletter/confirm`,
  - `newsletter/unsubscribe`,
  - `cart/shared/[token]`,
  - `flash-sales`.

### Zasada

Najpierw route parity i nawigacja, dopiero potem deep UI polish. Inaczej agent będzie przepisywał ekrany bez stabilnego IA.

## Faza 3. API parity

### Zakres

Dodać brakujące klienty API:

- `shared-cart`,
- `notifications`,
- `notification-preferences`,
- `translations`,
- `settings`,
- `chat`,
- `forms`.

### Efekt

`mobile/src/api/**` ma odzwierciedlać zakres capability `client/api/**`, nawet jeśli część implementacji jest później zużywana etapami.

## Faza 4. Hook parity

### Zakres

Wydzielić i uporządkować odpowiedniki dla:

- `use-auth`,
- `use-products`,
- `use-search`,
- `use-checkout`,
- `use-orders`,
- `use-profile`,
- `use-cms`,
- `use-blog`,
- `use-payment-status`,
- `use-notifications`,
- `use-notification-preferences`,
- `use-shared-cart`,
- `use-translation`,
- `use-pickup-points`.

### Cel

Komponenty ekranów mają być cienkie.
Logika pobierania, mutacji i cache ma mieszkać w hookach, tak jak w `client/`.

## Faza 5. Commerce parity

### Zakres

- listing produktów,
- search z facetami,
- product detail,
- compare,
- wishlist,
- cart,
- shared cart,
- checkout:
  - options,
  - address,
  - shipping,
  - pickup points,
  - payment methods,
  - pending,
  - success,
- payment recovery / poll status,
- flash sales.

### Uwaga

To jest największy obszar wpływu biznesowego, więc po foundation powinien dostać najwyższy priorytet.

## Faza 6. Account parity

### Zakres

- osobny login i register flow,
- profile,
- password change,
- addresses,
- orders list + detail,
- notifications,
- notification preferences,
- returns / complaints,
- GDPR / consent / export / restriction / account deletion,
- social auth callback handling.

### Uwaga

Obecny `mobile/src/app/(tabs)/account.tsx` miesza zbyt dużo odpowiedzialności. Docelowo ten tab powinien być hubem, a nie wszystkimi ekranami naraz.

## Faza 7. CMS + dynamic routes parity

### Zakres

- odwzorować routing dynamic pages i page resolution z `client/app/[...slug]` oraz `_routes/*`,
- rozdzielić CMS route resolving od samego renderowania,
- przygotować mapping typów stron:
  - homepage,
  - page builder pages,
  - category pages,
  - brand pages,
  - product pages,
  - blog routes,
  - system pages.

### Done when

- mobile potrafi rozpoznać i wyrenderować ten sam content topology co storefront web,
- route resolution nie jest oparta o pojedynczy fallback screen.

## Faza 8. Page builder parity

### Zakres

Najpierw blok-level parity:

- hero,
- CTA,
- rich text,
- galleries,
- featured products,
- featured posts,
- newsletter signup,
- tabs,
- accordion,
- stats,
- testimonials,
- maps,
- video,
- pricing,
- trust badges,
- categories grid,
- logo cloud,
- brands slider,
- team members,
- process/timeline,
- columns.

Następnie module-level parity:

- `blog-module`,
- `faq-client-module`,
- `flash-sales-hub-module`,
- `guest-order-tracker-module`,
- `newsletter-preferences-module`,
- `returns-portal-module`,
- `store-locator-module`,
- storefront listing modules.

### Zasada

Nie implementować tego ad hoc w jednym pliku.
Potrzebny jest mobile odpowiednik warstw:

- page renderer,
- section renderer,
- block renderer,
- module renderer,
- shared block primitives.

## Faza 9. Blog / content parity

### Zakres

- blog list,
- blog categories,
- blog detail,
- comments,
- votes / helpfulness,
- powiązane listingi / CTA z page buildera.

### Uwaga

SEO-specific rzeczy z `client/` nie przechodzą 1:1, ale sam content flow już tak.

## Faza 10. Notifications, integrations, native adaptations

### Zakres

- push notifications jako odpowiednik web notifications,
- natywne share APIs jako odpowiednik części web share flows,
- map intents,
- mail / tel / external auth redirects,
- deep links z emaili i płatności.

### Efekt

Parity ma być odczuwalne dla użytkownika, nie tylko widoczne w strukturze katalogów.

## Faza 11. QA, parity audit i hardening

### Zakres

- feature-by-feature audit względem `client/`,
- smoke checklist dla wszystkich głównych ścieżek,
- test plan manualny dla iOS / Android / web Expo,
- usunięcie bootstrap leftovers,
- dokumentacja statusu: done / partial / deferred / not applicable.

### Końcowy artefakt

Tabela parity z kolumnami:

- feature,
- client source,
- mobile target,
- status,
- blocker,
- notes.

## Proponowana kolejność wdrożenia

1. Faza 0: foundation kontraktowy.
2. Faza 1: shared foundation techniczny.
3. Faza 2: route parity.
4. Faza 3-4: API + hooks parity.
5. Faza 5: commerce core.
6. Faza 6: account core.
7. Faza 7-8: CMS + page builder parity.
8. Faza 9-10: blog + notifications + native integrations.
9. Faza 11: audit końcowy.

## Minimalne milestone'y wykonawcze

### Milestone A: foundation ready

- `mobile/` ma własne zasady pracy,
- route map i parity matrix istnieją,
- shared hooks i API foundation są gotowe.

### Milestone B: commerce parity ready

- katalog, produkt, search, cart, wishlist, compare, checkout, shared cart działają end-to-end.

### Milestone C: account parity ready

- auth, profile, orders, returns, notifications, consent działają end-to-end.

### Milestone D: CMS parity ready

- dynamic pages i page builder renderują główne typy contentu storefrontu.

### Milestone E: release candidate

- parity audit zamknięty,
- wszystkie luki są sklasyfikowane jako done / deferred / not applicable.

## Rekomendacja wykonawcza

Nie wdrażać tego jako jednego dużego diffu.

Najlepszy model to iteracje:

- 1 prompt = 1 zamknięty pion,
- po każdej iteracji:
  - update parity matrix,
  - targeted verification,
  - krótki audit regresji,
  - dopiero potem następny pion.

Powód jest prosty:

- `client/` jest już dojrzałym storefrontem,
- `mobile/` jest jeszcze foundation + MVP,
- więc największe ryzyko to chaos architektoniczny, a nie sama liczba ekranów.
