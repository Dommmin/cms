# Mobile 1:1 Parity z `client/` — prompty dla GEMINI / innego agenta

> Status: **draft** | Created: 2026-06-11

## Jak używać

- Uruchamiaj prompty po kolei.
- Nie łącz 2-3 etapów w jeden duży diff.
- Po każdym kroku agent ma:
  - wykonać tylko swój zakres,
  - zachować minimalny diff,
  - zaktualizować status parity w dokumencie planu,
  - opisać, czego nie zrobił i dlaczego.

## Stały preambuła do każdego promptu

Wklej ten fragment na początek każdego zadania:

```text
Pracujesz w repo /Users/domin/projects/laravel/cms.

Cel: rozwijać mobile/ jako funkcjonalne odwzorowanie client/ 1:1 na poziomie capabilities i flow biznesowych, ale z natywną implementacją Expo / React Native tam, gdzie webowe rozwiązanie nie ma sensu literalnie.

Zasady:
- Najpierw przeczytaj root AGENTS.md, .ai/routing.md, .ai/rules.md, client/AGENTS.md oraz plan: .ai/plans/mobile-1to1-parity-plan.md.
- Traktuj client/ jako source of truth dla zakresu funkcji.
- Zachowaj minimalny diff. Bez drive-by refaktorów.
- Nie twórz branchy, commitów ani pushy.
- Nie dodawaj nowych top-level katalogów bez potrzeby.
- Jeśli coś jest web-only, oznacz to jawnie jako not applicable zamiast próbować kopiować 1:1.
- Zanim zaczniesz pisać kod, przeczytaj 2-3 podobne pliki z client/ i istniejące odpowiedniki z mobile/.
- Po implementacji zaktualizuj odpowiedni fragment parity status w .ai/plans/mobile-1to1-parity-plan.md.
- Jeśli nie możesz bezpiecznie zweryfikować danego kroku w obecnym setupie, opisz blocker zamiast zgadywać.

Format odpowiedzi końcowej:
- co zostało zrobione,
- jakie pliki zmieniono,
- jak zweryfikowano,
- jakie luki / ryzyka pozostały.
```

## Prompt 1. Foundation audit i parity matrix

```text
Wykonaj foundation audit dla mobile/ względem client/ i przygotuj brakujący foundation do dalszej pracy.

Zakres:
- dodaj mobile/AGENTS.md, jeśli go brakuje,
- uporządkuj bootstrapowe artefakty Expo, jeśli przeszkadzają w pracy,
- dopisz do .ai/plans/mobile-1to1-parity-plan.md sekcję parity status z tabelą lub checklistą feature-by-feature,
- sklasyfikuj feature'y na:
  - implement now,
  - native adaptation,
  - not applicable,
  - deferred.

Nie implementuj jeszcze dużych feature'ów biznesowych. Ten krok ma przygotować grunt i dokumentację.
```

## Prompt 2. Shared mobile foundation

```text
Uporządkuj shared foundation w mobile/ tak, aby kolejne ekrany nie duplikowały fetch/mutation/state boilerplate.

Zakres:
- przejrzyj mobile/src/api/client.ts, providers, hooks, lib i components/ui,
- wydziel brakujące shared primitives dla loading/error/empty/form sections/action rows,
- uporządkuj query keys, auth lifecycle, locale handling i storage conventions,
- zostaw minimalne, spójne API do budowy kolejnych ekranów.

Nie ruszaj jeszcze page builder parity ani dużych ekranów contentowych, chyba że drobna zmiana jest wymagana przez foundation.
```

## Prompt 3. Route parity i nawigacja

```text
Doprowadź mobile/src/app do sensownej route parity względem client/app.

Zakres:
- przygotuj brakujące entry points i screen scaffolding dla:
  - auth/login
  - auth/register
  - auth/social-callback
  - account/profile
  - account/notifications
  - account/notifications/preferences
  - account/returns
  - account/returns/[reference]
  - checkout/options
  - checkout/success
  - newsletter/confirm
  - newsletter/unsubscribe
  - cart/shared/[token]
  - flash-sales
- odchudź obecny account tab tak, aby był hubem, a nie jednym przeładowanym ekranem.

Na tym etapie możesz użyć placeholderów, ale routing i nawigacja mają być spójne.
```

## Prompt 4. API parity

```text
Rozszerz mobile/src/api tak, aby pokrywał brakujące capabilities znane z client/api.

Zakres:
- dodaj brakujące klienty API:
  - shared-cart
  - notifications
  - notification-preferences
  - translations
  - settings
  - chat
  - forms
- trzymaj naming i kontrakty możliwie blisko client/api,
- jeśli mobile potrzebuje wspólnego typu, dodaj lub rozszerz mobile/src/types/api.ts bez łamania istniejących kontraktów.

Nie buduj jeszcze pełnych ekranów zużywających wszystkie te API, jeśli nie są częścią tego kroku.
```

## Prompt 5. Hook parity

```text
Wydziel brakujące hooki w mobile/ na wzór capability z client/hooks.

Zakres:
- dodaj odpowiedniki dla use-auth, use-products, use-search, use-checkout, use-orders, use-profile, use-cms, use-blog, use-payment-status, use-notifications, use-notification-preferences, use-shared-cart, use-translation i use-pickup-points,
- przenieś logikę z ekranów do hooków tam, gdzie to poprawi spójność,
- zachowaj query cache semantics zgodne z mobile foundation.

Nie rób dużego UI polish. Priorytetem jest architektura stanu i fetch flow.
```

## Prompt 6. Commerce parity: listing, PDP, compare, wishlist

```text
Doprowadź podstawowy commerce browsing do parity z client/.

Zakres:
- listing produktów,
- search z facetami,
- product detail,
- compare,
- wishlist,
- recently viewed, jeśli brakuje kluczowych zachowań.

Porównaj konkretne ekrany z client/app/search, client/app/products/[slug], client/app/compare, client/app/wishlist oraz powiązanymi hooks/components.
Skup się na funkcjonalności i spójności danych, nie na piksel-perfect kopiowaniu UI.
```

## Prompt 7. Commerce parity: cart, shared cart, checkout

```text
Doprowadź cart i checkout w mobile/ do parity funkcjonalnej z client/.

Zakres:
- cart,
- shared cart,
- checkout options,
- checkout main flow,
- payment pending,
- checkout success,
- payment status recovery,
- pickup point handling na możliwie sensownym poziomie natywnym.

Porównaj z client/app/cart, client/app/cart/shared/[token], client/app/checkout/** i powiązanymi api/hooks/components.
Jeśli część webowego UX trzeba zastąpić natywnie, zrób to świadomie i odnotuj w planie.
```

## Prompt 8. Account parity

```text
Doprowadź account area w mobile/ do parity z client/.

Zakres:
- login,
- register,
- profile,
- password change,
- addresses,
- orders list + detail,
- consent / export / processing restriction / account deletion,
- social auth callback handling.

Rozdziel odpowiedzialności między osobne ekrany zamiast upychać wszystko w jednym widoku.
```

## Prompt 9. Notifications parity

```text
Wdróż notifications i notification preferences w mobile/ jako natywny odpowiednik tego, co istnieje w client/.

Zakres:
- lista powiadomień,
- status read/unread, jeśli wspierany,
- ekran preferencji powiadomień,
- spójne API + hooki + routing,
- jeśli to ma sens, przygotuj punkt integracji pod push notifications.

Nie implementuj pełnego push stacku, jeśli backend lub setup nie są gotowe, ale zostaw dobrą strukturę i jawnie opisz granice obecnego kroku.
```

## Prompt 10. Returns / complaints parity

```text
Wdróż returns / complaints parity w mobile/ względem client account area i system pages.

Zakres:
- account/returns list,
- account/returns detail,
- integracja z zamówieniami, jeśli jest potrzebna do nawigacji,
- jeśli client ma guest/system-page flow powiązany z returns portal, uwzględnij to w architekturze mobile nawet jeśli pełne UI powstanie później.

Ten krok ma domknąć account-side parity dla posprzedażowych flow.
```

## Prompt 11. CMS dynamic routing parity

```text
Ułóż w mobile/ porządną warstwę rozpoznawania i renderowania dynamicznych stron CMS na wzór client/app/[...slug] i client/app/_routes/*.

Zakres:
- rozdziel route resolving od renderowania contentu,
- obsłuż typy stron i fallbacki w sposób jawny,
- nie opieraj całej logiki o pojedynczy screen pages/[...slug].

Na tym etapie priorytetem jest architektura resolvera, nie pełna implementacja wszystkich bloków page buildera.
```

## Prompt 12. Page builder parity: foundation

```text
Przebuduj mobile page builder foundation tak, aby nie był pojedynczym MVP rendererem.

Zakres:
- zaprojektuj mobile odpowiedniki warstw:
  - page renderer,
  - section renderer,
  - block renderer,
  - module renderer,
- zachowaj strukturę zbliżoną do client/components/page-builder/**,
- przenieś istniejącą logikę z mobile-page-renderer.tsx do bardziej skalowalnego układu.

Nie musisz w tym kroku zaimplementować wszystkich bloków, ale foundation ma być gotowy pod kolejne iteracje.
```

## Prompt 13. Page builder parity: blocks

```text
Rozszerz mobile page builder o block parity względem client/components/page-builder/blocks.

Priorytetowe bloki:
- hero-banner,
- call-to-action,
- rich-text,
- image-gallery,
- featured-products,
- featured-posts,
- newsletter-signup,
- accordion,
- tabs,
- stats-counter,
- testimonials,
- map-block,
- video-embed,
- pricing-cards / pricing-table,
- trust-badges,
- categories-grid,
- logo-cloud,
- brands-slider,
- team-members,
- steps-process / timeline,
- two-columns / three-columns.

Każdy blok adaptuj natywnie, ale trzymaj parity danych i intentu.
```

## Prompt 14. Page builder parity: modules

```text
Wdróż module parity względem client/components/page-builder/modules.

Zakres:
- blog-module,
- faq-client-module,
- flash-sales-hub-module,
- guest-order-tracker-module,
- newsletter-preferences-module,
- returns-portal-module,
- store-locator-module,
- storefront-listing-modules.

Skup się na tym, żeby mobile potrafił renderować te same typy modułów i konsumować te same dane, nawet jeśli prezentacja jest natywnie uproszczona.
```

## Prompt 15. Blog parity

```text
Doprowadź blog flow w mobile/ do parity z client/.

Zakres:
- blog list,
- blog categories,
- blog detail,
- comments,
- votes / helpfulness,
- ewentualne CTA/powiązania z page builder contentem.

Pomiń dosłowne SEO/web artifacts, ale zachowaj pełny content flow użytkownika.
```

## Prompt 16. Stores, maps, newsletter i native integrations

```text
Domknij parity dla stores, newsletter i natywnych integracji.

Zakres:
- stores flow,
- map intents i preview,
- newsletter confirm / unsubscribe,
- external links, tel, mailto, share,
- deep links z płatności, maili lub innych kampanii, jeśli istnieją punkty wejścia.

Efekt ma być produkcyjny z perspektywy użytkownika mobilnego, nie tylko "technicznie istniejący".
```

## Prompt 17. QA audit końcowy

```text
Przeprowadź końcowy parity audit mobile/ względem client/.

Zakres:
- przejrzyj feature-by-feature cały plan,
- oznacz każde capability jako done / partial / deferred / not applicable,
- wskaż największe luki,
- popraw drobne niespójności, które blokują sensowny release candidate,
- zaktualizuj .ai/plans/mobile-1to1-parity-plan.md o finalny status i rekomendacje dalszych kroków.

Nie rób dużych refaktorów bez potrzeby. Ten krok ma zamknąć rollout i wskazać realny stan gotowości.
```
