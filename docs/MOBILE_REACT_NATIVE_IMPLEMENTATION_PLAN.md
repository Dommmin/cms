# Mobile React Native Implementation Plan

> Cel: zbudowac aplikacje mobilna jako mozliwie wierne odwzorowanie publicznego storefrontu `client/`, przy zachowaniu mobilnych wzorcow UX, kontraktow API Laravel i obecnych zasad monorepo.

## Decyzja: PWA czy aplikacja mobilna?

### Rekomendacja

Najpierw wdrozyc **porzadne PWA w `client/`**, a nastepnie budowac **React Native + Expo w `mobile/`**, jezeli produkt faktycznie potrzebuje funkcji natywnych albo dystrybucji przez App Store / Google Play.

Praktyczna kolejnosc:

1. **PWA jako etap 1** - szybciej, taniej, wspolny kod z Next.js, natychmiastowa wartosc dla klientow mobilnych.
2. **React Native + Expo jako etap 2** - gdy potrzebne sa push notifications, natywne logowanie, glebsza integracja z urzadzeniem, stabilniejszy koszyk offline, skanowanie kodow, geolokalizacja sklepow, aplikacyjne kampanie retencyjne lub obecnosc w sklepach.

### Kiedy wystarczy PWA

PWA wystarczy, jezeli aplikacja ma byc glownie mobilna wersja sklepu:

- przegladanie produktow, kategorii, bloga i stron CMS,
- koszyk i checkout przez istniejace API,
- konto klienta,
- podstawowe cache'owanie i szybszy start,
- instalacja ikony na ekranie telefonu,
- brak koniecznosci App Store / Google Play na start.

### Kiedy potrzebna aplikacja React Native

React Native ma sens, jezeli zakladamy:

- push notifications dla promocji, statusu zamowienia i porzuconego koszyka,
- lepsza retencje niz web/PWA,
- natywne deep linki i kampanie app-only,
- logowanie biometryczne / secure storage tokenow,
- skaner kodow kreskowych lub QR,
- geolokalizacje i mapy sklepow z natywnym UX,
- integracje z Apple/Google Pay na poziomie natywnym,
- niezalezny release mobile i publikacje w sklepach.

## Docelowa architektura

Dodac trzeci projekt w monorepo:

```text
server/   Laravel API + admin
client/   Next.js storefront + PWA
mobile/   Expo React Native app
```

`mobile/` powinien korzystac z tego samego REST API `/api/v1/*`, tych samych zasad domenowych i mozliwie tych samych nazw typow co `client/types/api.ts`.

Nie kopiowac bezrefleksyjnie komponentow webowych. Odwzorowac funkcje i kontrakty, ale UI zbudowac pod mobile:

- listy produktow jako natywne listy,
- filtry jako bottom sheet,
- koszyk jako ekran z dolnym podsumowaniem,
- checkout jako kroki z czytelnym postepem,
- konto jako stack ekranow,
- CMS/blog jako uproszczony renderer treści.

## Etap 0: Audyt klienta Next.js

Przed scaffoldem `mobile/` AI musi przejrzec:

- `client/types/api.ts`
- `client/api/`
- `client/hooks/`
- `client/lib/axios.ts`
- `client/lib/i18n.ts`
- `client/app/[locale]/products/`
- `client/app/[locale]/cart/`
- `client/app/[locale]/checkout/`
- `client/app/[locale]/account/`
- `client/components/page-builder/`

Wynikiem audytu ma byc tabela:

| Obszar | Ekrany w `client/` | API | Priorytet mobile | Uwagi |
|--------|---------------------|-----|------------------|-------|
| Produkty | listing, detail | products, categories | P0 | filtry jako sheet |
| Koszyk | cart | cart | P0 | token guest cart |
| Checkout | checkout steps | checkout, payments | P0 | idempotency keys |
| Konto | profile, orders | profile, orders | P1 | auth Sanctum |
| CMS | dynamic pages | pages | P1 | renderer blokow MVP |
| Blog | list, post | blogs/posts | P2 | po checkout/product |

Prompt:

```text
Przejrzyj publiczny frontend w `client/` i przygotuj mapowanie funkcji do aplikacji mobilnej Expo.
Zacznij od `client/types/api.ts`, `client/api/`, `client/hooks/` oraz tras w `client/app/[locale]/`.
Nie implementuj jeszcze kodu. Zwróć tabele: ekran webowy, wymagane endpointy API, typy danych, priorytet P0/P1/P2, ryzyka i zaleznosci.
Uwzglednij, ze mobile ma odwzorowac funkcje storefrontu, ale uzyc natywnych wzorcow UX.
```

## Etap 1: PWA w `client/`

Ten etap jest rekomendowany niezaleznie od decyzji o React Native, bo poprawia mobilny web i moze byc szybkim MVP.

Zakres:

1. Dodac manifest PWA:
   - nazwa aplikacji,
   - short name,
   - ikony 192/512,
   - theme color,
   - display standalone,
   - start URL z domyslnym locale.
2. Dodac service worker lub sprawdzony plugin Next.js zgodny z aktualna wersja projektu.
3. Cache'owac ostroznie:
   - shell aplikacji,
   - statyczne assety,
   - wybrane GET-y publiczne,
   - nie cache'owac checkoutu, platnosci, profilu i endpointow auth bez jasnej strategii.
4. Dodac offline fallback dla podstawowych ekranow.
5. Zweryfikowac mobile UX:
   - header,
   - filtry produktow,
   - koszyk,
   - checkout,
   - cookie consent,
   - account/profile.
6. Dodac testy/QA:
   - Lighthouse PWA,
   - Playwright mobile viewport,
   - reczny test instalacji na Android/iOS.

Prompt:

```text
Wdroż PWA dla `client/` w Next.js bez ruszania backendu.
Najpierw sprawdz aktualna konfiguracje Next.js, middleware locale i routing.
Dodaj manifest, ikony, strategię cache oraz offline fallback.
Nie cache'uj checkoutu, platnosci, profilu ani endpointow auth.
Po zmianach uruchom przez Docker: `docker compose exec -T node npm run types`, `docker compose exec -T node npm run lint`, `docker compose exec -T node npm run build`.
```

## Etap 2: Scaffold `mobile/`

Technologia:

- Expo,
- React Native,
- TypeScript,
- Expo Router,
- TanStack Query,
- Axios lub fetch wrapper zgodny z `client/lib/axios.ts`,
- Zod tylko tam, gdzie potrzebna walidacja runtime,
- SecureStore dla tokenow,
- MMKV albo AsyncStorage dla lekkiego cache/local state.

Proponowana struktura:

```text
mobile/
  app/
    _layout.tsx
    (tabs)/
      index.tsx
      categories.tsx
      cart.tsx
      account.tsx
    products/
      [slug].tsx
    checkout/
      index.tsx
      pending.tsx
    blog/
      index.tsx
      [slug].tsx
    pages/
      [...slug].tsx
  api/
    client.ts
    products.ts
    cart.ts
    checkout.ts
    auth.ts
    cms.ts
    blog.ts
  components/
    ui/
    layout/
    product/
    cart/
    checkout/
    cms/
  hooks/
  lib/
    format.ts
    i18n.ts
    idempotency.ts
  providers/
    api-provider.tsx
    auth-provider.tsx
    cart-provider.tsx
  types/
    api.ts
  tests/
```

Zasady:

- `mobile/types/api.ts` zaczyna jako kopia logiczna `client/types/api.ts`, ale bez typow stricte webowych.
- Nazwy pol API musza zostac zgodne z backendem: np. `unit_price`, `subtotal`, `featured_image`, `attributes`.
- Nie zakladac wrappera `{ data: T }` dla pojedynczych zasobow, bo API ma globalne `JsonResource::withoutWrapping()`.
- Wszystkie mutacje checkout/cart maja uzywac idempotency keys.
- Auth przez Sanctum bearer token, nie cookie session.
- Locale musi byc jawnie obslugiwane w requestach i linkach.

Prompt:

```text
Utworz `mobile/` jako aplikacje Expo React Native z TypeScript i Expo Router.
Zachowaj monorepo obok `server/` i `client/`.
Przed implementacja przeczytaj `client/types/api.ts`, `client/api/` i `docs/MOBILE_REACT_NATIVE_IMPLEMENTATION_PLAN.md`.
Dodaj podstawowa strukture folderow, konfiguracje env dla API URL, klienta API, QueryClientProvider, AuthProvider i ekran startowy.
Nie implementuj jeszcze pelnego checkoutu ani platnosci.
Po scaffoldzie uruchom dostepne komendy walidacyjne Expo/TypeScript.
```

## Etap 3: Warstwa API i typy

Kolejnosc:

1. Skopiowac istotne typy API z `client/types/api.ts` do `mobile/types/api.ts`.
2. Stworzyc `mobile/api/client.ts`:
   - base URL z env,
   - naglowek `Accept: application/json`,
   - locale header/query zgodny z backendiem,
   - bearer token z SecureStore,
   - obsluga 401.
3. Stworzyc moduly:
   - `products.ts`,
   - `categories.ts`,
   - `cart.ts`,
   - `checkout.ts`,
   - `auth.ts`,
   - `profile.ts`,
   - `cms.ts`,
   - `blog.ts`.
4. Dla mutacji cart/checkout dodac `Idempotency-Key`.
5. Dodac testy jednostkowe dla klienta API, jezeli projekt testowy jest skonfigurowany.

Prompt:

```text
Zaimplementuj warstwe API w `mobile/api/`, odwzorowujac kontrakty z `client/api/` i `client/types/api.ts`.
Nie zmieniaj backendu, chyba ze znajdziesz brak endpointu krytyczny dla mobile. Wtedy najpierw opisz brak i zaproponuj minimalny endpoint.
Pamietaj o Sanctum bearer token, locale, guest cart token i idempotency keys dla cart/checkout.
```

## Etap 4: Nawigacja i szkielet UX

Główne zakladki:

- Home,
- Kategorie / Produkty,
- Koszyk,
- Konto.

Stos ekranow:

- product detail,
- search,
- checkout,
- payment pending,
- blog post,
- CMS page,
- order detail,
- settings.

Zasady UX:

- mobile-first, bez kopiowania desktopowego ukladu,
- filtry produktow w bottom sheet,
- stale CTA przy koszyku i product detail,
- koszyk dostepny z glownej nawigacji,
- brak tekstow instrukcyjnych opisujacych UI,
- dobre empty states,
- stany loading/error/retry na kazdym ekranie z API.

Prompt:

```text
Zbuduj szkielet nawigacji Expo Router dla aplikacji mobile.
Odwzoruj glowna architekture storefrontu `client/`, ale zastosuj natywne wzorce: tabs, stack screens, bottom sheets dla filtrow.
Dodaj placeholdery ekranow tylko tam, gdzie od razu beda podlaczone do API w kolejnych krokach.
```

## Etap 5: Produkty, kategorie, wyszukiwanie

Zakres P0:

- lista produktow,
- kategorie,
- wyszukiwarka,
- filtry,
- sortowanie,
- szczegoly produktu,
- warianty,
- galeria,
- cena/promocja,
- opinie,
- dodanie do koszyka,
- recently viewed,
- porownanie produktow jako P1/P2.

AI ma najpierw sprawdzic:

- `client/app/[locale]/products/`,
- `client/components/product*`,
- `client/hooks/use-recently-viewed.ts`,
- `client/hooks/use-comparison.ts`,
- `client/types/api.ts`.

Prompt:

```text
Zaimplementuj ekrany produktowe w `mobile/`: listing, filtrowanie, sortowanie, search i product detail.
Najpierw przeczytaj implementacje webowa w `client/app/[locale]/products/` oraz typy w `client/types/api.ts`.
UI ma byc natywny dla mobile: FlatList/FlashList, bottom sheet filters, sticky add-to-cart na detailu.
Nie zmieniaj API bez koniecznosci.
```

## Etap 6: Koszyk

Zakres:

- guest cart token,
- lista pozycji,
- zmiana ilosci,
- usuwanie pozycji,
- kupony/promocje, jezeli wspierane w API,
- podsumowanie,
- przejscie do checkoutu,
- synchronizacja po logowaniu.

Zasady:

- uzywac integer cents/grosze, nigdy floatow do obliczen cen,
- `CartItem.product` jest bezposrednie, nie `variant.product`,
- pola cen: `unit_price`, `subtotal`,
- mutacje z idempotency key.

Prompt:

```text
Zaimplementuj koszyk mobile zgodnie z kontraktem API i `client/types/api.ts`.
Uwzglednij guest cart token, idempotency keys, zmiane ilosci, usuwanie pozycji i podsumowanie.
Nie licz cen na floatach. Formatowanie ceny zrob w helperze.
```

## Etap 7: Auth i konto klienta

Zakres:

- login,
- register,
- logout,
- forgot/reset password, jezeli API wspiera,
- profil,
- adresy,
- zamowienia,
- szczegoly zamowienia,
- wishlist,
- GDPR: export danych, restriction, delete/anonymization flow, consent management.

Zasady:

- tokeny w SecureStore,
- obsluga 401 globalnie,
- brak sesyjnych endpointow admin/Fortify,
- tylko REST API `/api/v1/*`.

Prompt:

```text
Zaimplementuj auth i konto klienta w mobile przez REST API Sanctum bearer token.
Nie uzywaj endpointow admin ani cookie session.
Token przechowuj w SecureStore, dodaj globalna obsluge 401, logout i odswiezenie danych profilu.
Odwzoruj funkcje konta z `client/app/[locale]/account/`.
```

## Etap 8: Checkout i platnosci

Zakres P0:

- dane kontaktowe,
- adres dostawy,
- metoda dostawy,
- metoda platnosci,
- podsumowanie,
- zgody prawne,
- utworzenie zamowienia,
- status platnosci,
- ekran pending/success/failure.

Szczegolna ostroznosc:

- idempotency key dla submitu checkoutu,
- regulaminy i 14-dniowe odstapienie zgodne z webem,
- PayU/P24 moga wymagac WebView albo redirect do przegladarki,
- Apple Pay / Google Pay nie implementowac natywnie bez osobnej decyzji i testow providerow.

Prompt:

```text
Zaimplementuj checkout mobile etapami, odwzorowujac `client/app/[locale]/checkout/`.
Zachowaj idempotency keys, walidacje wymaganych zgod prawnych i polling statusu platnosci.
Platnosci PayU/P24 obsluz jako redirect/WebView MVP, bez natywnego Apple Pay/Google Pay, chyba ze backend i provider sa gotowe.
```

## Etap 9: CMS pages i Page Builder renderer

Cel: renderowac najwazniejsze strony CMS z API.

Strategia MVP:

1. Wspierac tylko najczesciej uzywane bloki:
   - hero,
   - rich text,
   - image,
   - gallery,
   - CTA,
   - featured products,
   - FAQ,
   - testimonials,
   - pricing cards,
   - alert banner.
2. Dla nieznanych blokow pokazac bezpieczny fallback albo pominac z logowaniem developerskim.
3. Nie renderowac surowego HTML bez sanitizacji.
4. Mapowac theme tokens na mobilny design system, ale nie kopiowac CSS z weba.

Prompt:

```text
Zaimplementuj MVP renderera CMS Page Builder w React Native.
Najpierw przeczytaj `client/components/page-builder/` i typy CMS w `client/types/api.ts`.
Wspieraj tylko najwazniejsze bloki, dodaj bezpieczny fallback dla nieznanych.
Nie wstrzykuj niesprawdzonego HTML. Dla rich text uzyj kontrolowanego renderera lub sprawdzonej biblioteki.
```

## Etap 10: Blog, stores, newsletter

P1/P2 po stabilizacji commerce:

- blog list,
- blog post,
- RSS nie jest potrzebny w appce,
- stores locator z mapa,
- newsletter subscribe,
- tagi i kategorie blogowe.

Prompt:

```text
Dodaj ekrany bloga, stores locator i newsletter do mobile.
Odwzoruj funkcje z `client/app/[locale]/blog/`, `client/app/[locale]/stores/` i `client/app/[locale]/newsletter/`.
Nie przenos SEO-only elementow, RSS ani webowych metadanych do mobile.
```

## Etap 11: Push notifications i deep links

Wdrozyc dopiero po MVP commerce.

Zakres:

- Expo Notifications,
- device token zapisany przez API,
- zgody uzytkownika,
- segmentacja marketingowa zgodna z consent management,
- deep linki do produktu, kategorii, zamowienia, koszyka, blog postu,
- kampanie porzuconego koszyka.

Backend moze wymagac nowych endpointow:

- `POST /api/v1/devices`
- `DELETE /api/v1/devices/{token}`
- preferencje powiadomien w profilu.

Prompt:

```text
Zaprojektuj i wdroz push notifications dla mobile.
Najpierw sprawdz istniejace consent management i newsletter/campaigns w backendzie.
Nie wysylaj marketingowych pushy bez jawnej zgody.
Dodaj minimalne endpointy device tokenow, FormRequest, Resource, rate limiter i testy Pest.
```

## Etap 12: Testy i jakosc

Minimum:

- TypeScript check,
- lint/format,
- testy jednostkowe API helpers,
- testy hookow koszyka/auth,
- smoke testy ekranow,
- reczne testy na iOS i Android,
- test checkoutu na sandboxach PayU/P24.

Docelowo:

- Maestro albo Detox dla flow:
  - product listing -> detail -> add to cart,
  - cart -> checkout -> payment pending,
  - login -> order history,
  - CMS page render.

Prompt:

```text
Dodaj testy mobile dla krytycznych flow: product listing, product detail, cart, checkout submit i auth.
Dobierz narzedzia pasujace do Expo. Nie tworz testow kruchych na tekstach marketingowych.
Po zmianach uruchom typy, lint i dostepne testy.
```

## Etap 13: CI/CD i release

Zakres:

- dodac `mobile` do CI,
- cache dependencies,
- TypeScript/lint/test,
- EAS Build dla iOS/Android,
- profile: development, preview, production,
- env: API URL, Sentry DSN, feature flags,
- release notes,
- wersjonowanie appki.

Prompt:

```text
Dodaj CI dla `mobile/` bez naruszania obecnych checkow `server/` i `client/`.
Uruchamiaj typy, lint i testy mobile. Przygotuj EAS Build profiles dla development, preview i production.
Sekrety i API URL maja isc przez env, nie hardcoded config.
```

## Backend gaps do sprawdzenia

## Aktualny status parity mobile vs client

Stan po ostatniej rundzie prac: `mobile/` nie powinno byc traktowane jako "100% parity" z `client/`. Jest to dzialajacy commerce MVP z rosnaca warstwa UX, ale nadal wymaga domkniecia kilku obszarow przed oznaczeniem jako storefront-ready.

| Obszar | Mobile status | Parity z `client/` | Priorytet | Braki / nastepny krok |
|--------|---------------|--------------------|-----------|------------------------|
| Home | Sekcja hero, quick links, nowosci, recently viewed | Czesciowe | P1 | Podpiac realne sekcje CMS/home modules zamiast statycznego hero copy |
| Produkty listing | Kategorie, search po nazwie, sort, in-stock, brand facets, active chips | Dobre MVP | P0 | Dodac price range i attribute facets z `available_filters.attributes` |
| Search | Osobny ekran `/search`, endpoint `/search`, facets, did-you-mean | Dobre MVP | P0 | Dodac autocomplete i paginacje/infinite scroll |
| Product detail | Galeria MVP, warianty, opinie, wishlist, sticky add-to-cart | Czesciowe | P0 | Rozbudowac galerie, delivery panel, powiazane produkty, pelniejsze promocje |
| Cart | Guest cart, quantity, remove, discount code, summary | Dobre MVP | P0 | Lepsze bledy mutacji i synchronizacja po logowaniu do przetestowania |
| Checkout | Kontakt, adres, dostawa, platnosc, zgody prawne, redirect payment | MVP | P0 | Rozbic na bardziej ergonomiczne kroki, dodac pickup points/InPost, success/failure states |
| Account | Login/register/profile, recent orders, order detail, wishlist | MVP | P1 | Forgot/reset password, pelna lista zamowien, GDPR export/restriction/consents |
| CMS pages | MVP renderer | Niskie/czesciowe | P1 | Zweryfikowac pokrycie blokow vs `client/components/page-builder/` |
| Blog/stores/newsletter | Ekrany istnieja | Czesciowe | P2 | Dopracowac UI, filtry/kategorie bloga, stores map UX |
| Compare | Brak | Brak | P2 | Mobile-native comparison albo swiadoma rezygnacja |
| Push/deep links | Brak | Mobile-only future | P2 | Expo Notifications + device-token API po stabilizacji commerce |
| QA/CI | Lokalne `types` i `lint`; brak Docker/CI dla mobile | Niskie | P0 | Dodac mobile do compose/CI albo osobny workflow npm ci/types/lint/test |

Zmiany wykonane w tej rundzie:

- dodano storefrontowe tokeny mobile (`Storefront`) i odswiezono shell/tabs/header,
- poprawiono home, product listing, product detail, cart i checkout pod mobile UX,
- dodano ekran `/search` korzystajacy z API `/search`,
- rozszerzono listing produktow o brand facets i aktywne filtry,
- dodano ekran `/account/wishlist`,
- usunieto widoczne pozostalosci Expo startera z webowego tabbara.

AI powinno zweryfikowac przed implementacja mobile:

- czy wszystkie endpointy publicznego storefrontu sa dostepne przez `/api/v1/*`,
- czy auth klienta ma komplet endpointow dla mobile,
- czy guest cart token moze byc bezpiecznie trzymany w mobile,
- czy checkout nie zalezy od web-only cookies,
- czy payment redirect/WebView ma poprawne return URLs dla app deep links,
- czy consent management rozroznia web cookies i mobile push/marketing consent,
- czy media URLs sa absolutne i dostepne z aplikacji.

## Zasady dla AI przy implementacji

- Zawsze zaczynaj od przeczytania `.ai/guide.md`, `docs/frontend.md` i tego dokumentu.
- Zanim napiszesz kod mobile, znajdz odpowiednik w `client/`.
- Nie zmieniaj backendu bez potwierdzenia, ze brakuje kontraktu API.
- Jezeli dodajesz backend endpoint, przestrzegaj zasad Laravel z `AGENTS.md`: FormRequest, Resource, rate limiter, test Pest.
- Nie hardcoduj URL-i API, locale ani walut.
- Nie uzywaj floatow do cen.
- Nie kopiuj webowego CSS do React Native.
- Nie implementuj natywnych platnosci bez osobnej decyzji.
- Po zmianach w PHP uruchom `docker compose exec php vendor/bin/pint --dirty`.
- Po zmianach w `client/` uruchom komendy przez Docker.
- Dla `mobile/` dodaj analogiczne skrypty walidacyjne i uruchamiaj je przed zakonczeniem pracy.

## Proponowany MVP

MVP mobile powinno obejmowac:

1. Home z podstawowa zawartoscia CMS albo sekcjami produktow.
2. Produkty: listing, search, filters, detail, variants.
3. Koszyk: guest cart, update quantity, remove, summary.
4. Checkout: podstawowy flow + redirect/WebView payment.
5. Auth: login/register/logout/profile.
6. Konto: order history.
7. CMS page renderer MVP.
8. Blog jako P2, jezeli commerce jest stabilne.

## Decyzja koncowa

Nie traktowac PWA i React Native jako alternatyw absolutnych. Najrozsadniejsza sciezka dla tego projektu:

1. Najpierw dopracowac mobile web i PWA w `client/`.
2. Rownolegle przygotowac kontrakty i mapowanie funkcji.
3. Dopiero potem scaffold `mobile/` w Expo.
4. Budowac mobile etapami, zaczynajac od commerce P0.
