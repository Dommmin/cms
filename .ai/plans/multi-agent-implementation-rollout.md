# Plan: multi-agent rollout dla dynamic CMS + commerce

Data: 2026-06-03
Status: plan wykonawczy przed implementacją

## Cel

Celem jest wdrożenie opisanych wcześniej zmian w modelu:

- jeden wspólny foundation dla dynamicznych modułów i system pages,
- równoległa implementacja rozłącznych pionów przez mniejszych agentów,
- końcowa integracja i review wykonywane centralnie.

To nie może być "wszyscy ruszają wszystko naraz". Najpierw trzeba ustalić kontrakty i punkty styku, a dopiero potem odpalać równoległych wykonawców.

## Dokumenty bazowe

Ten rollout bazuje na istniejących planach szczegółowych:

- [platform-gap-analysis-master.md](/Users/domin/projects/laravel/cms/.ai/plans/platform-gap-analysis-master.md)
- [dynamic-page-modules-audit.md](/Users/domin/projects/laravel/cms/.ai/plans/dynamic-page-modules-audit.md)
- [legal-system-pages-audit.md](/Users/domin/projects/laravel/cms/.ai/plans/legal-system-pages-audit.md)
- [returns-complaints-portal-plan.md](/Users/domin/projects/laravel/cms/.ai/plans/returns-complaints-portal-plan.md)
- [returns-complaints-workflow-enterprise.md](/Users/domin/projects/laravel/cms/.ai/plans/returns-complaints-workflow-enterprise.md)

## Zasada podziału

Mniejsi agenci typu `gpt-5.4-mini` dostają tylko:

- zamknięty zakres odpowiedzialności,
- rozłączne pliki do edycji,
- konkretne kryteria ukończenia,
- zakaz ruszania foundation poza przypisanym kontraktem.

Centralnie musi zostać:

- architektura foundation,
- decyzje o modelu danych,
- decyzje o namingach i kontraktach,
- integracja końcowa,
- review całego diffu.

## Warstwy foundation, które nie mogą się rozjechać

Te elementy muszą być ustalone centralnie przed szeroką równoległością:

1. `cms.modules` jako source of truth dla modułów dynamicznych.
2. `system_page_key` i registry ról stron systemowych.
3. kontrakt strony:
   - `page_type`
   - `module_name`
   - `system_page_key`
   - `module_config`
4. route resolver storefrontu jako jedno źródło prawdy.
5. kontrakt workflow dla `returns / complaints / exchange`:
   - typ
   - status
   - transition rules
   - permissions

## Proponowany podział na etapy

### Etap 1. Foundation lokalnie

Właściciel: główny agent

Zakres:

- przygotowanie foundation dla `system_page_key`
- uporządkowanie registry modułów
- przygotowanie podstaw pod route resolver
- ustalenie kontraktów dla nowych modułów
- wyznaczenie, które typy stron są zwykłymi pages, a które pages z rolą systemową

Docelowe write sety:

- `server/config/cms/*`
- `server/app/Models/Page.php`
- `server/app/Http/Requests/Admin/Cms/*`
- `server/app/Http/Controllers/Admin/Cms/PageController.php`
- `server/app/Http/Resources/Api/V1/PageResource.php`
- wybrane migracje i testy foundation

To jest etap blokujący dla reszty.

### Etap 2. Dynamic modules piony

Po ustaleniu foundation można odpalić równolegle 3 piony:

#### Agent A: `products/categories/brands` page modules

Model: `gpt-5.4-mini`

Zakres:

- dodać brakujące moduły do runtime po stronie storefrontu
- spiąć renderery i resolver dla listing pages
- usunąć najbardziej oczywiste hardcoded fallbacki tylko w swoim pionie

Write set:

- `client/components/page-builder/modules/*`
- `client/components/page-builder/module-renderer*`
- `client/app/_routes/*` tylko pliki związane z listingami commerce
- `client/api/*` i `client/types/api.ts` wyłącznie jeśli wymagane przez listing contract

Zakaz:

- brak zmian w `returns`
- brak zmian w admin page forms
- brak zmian w workflow RMA

#### Agent B: `system pages` i legal/content linking

Model: `gpt-5.4-mini`

Zakres:

- spiąć legal/system pages z frontendem i linkowaniem
- zredukować hardcoded URL-e w footerze, checkout, consent i powiązanych miejscach

Write set:

- `client/components/layout/*`
- `client/app/checkout/*`
- `client/app/*` tylko pliki odwołujące się do polityk/system pages
- wybrane API helpery po stronie klienta

Zakaz:

- brak zmian w module registry
- brak zmian w admin CMS pages
- brak zmian w returns workflow

#### Agent C: admin `Zwroty i reklamacje`

Model: `gpt-5.4-mini`

Zakres:

- zmiana nazewnictwa z `Zwroty` na `Zwroty i reklamacje`
- poprawa listy, filtrów i etykiet typu sprawy
- przygotowanie miejsca pod osobne permissions `returns.*`

Write set:

- `server/resources/js/components/app-sidebar.tsx`
- `server/resources/js/pages/admin/ecommerce/returns/*`
- `server/app/Policies/ReturnPolicy.php`
- `server/app/Queries/Admin/ReturnRequestIndexQuery.php`
- ewentualnie wybrane kontrolery/admin requests tylko w obrębie RMA admin

Zakaz:

- brak zmian w storefront guest portal
- brak zmian w CMS page builder
- brak zmian w foundation pages

### Etap 3. Customer-facing returns

Po ustaleniu foundation i po wstępnej stabilizacji admina można odpalić 2 kolejne piony:

#### Agent D: publiczny portal `returns_portal`

Model: `gpt-5.4-mini`

Zakres:

- renderer modułu `returns_portal`
- guest lookup flow
- formularz zgłoszenia dla niezalogowanego użytkownika

Write set:

- `client/components/page-builder/modules/returns-*`
- `client/app/_routes/*` tylko jeśli potrzebne dla portalu
- `client/api/*` dotyczące returns guest flow
- `client/components/*` dotyczące formularzy RMA

Zakaz:

- brak zmian w `/account/returns`
- brak zmian w admin returns
- brak zmian w module registry poza odczytem z kontraktu

#### Agent E: konto klienta `/account/returns`

Model: `gpt-5.4-mini`

Zakres:

- lista wszystkich zgłoszeń klienta
- widok szczegółu sprawy
- powiązanie z zamówieniem i statusem

Write set:

- `client/app/account/returns/*`
- `client/app/account/orders/*` tylko miejsca integracyjne
- `client/components/account/*` jeśli potrzebne
- `client/api/*` wyłącznie dla authenticated returns flow

Zakaz:

- brak zmian w guest portal
- brak zmian w admin returns
- brak zmian w foundation pages

### Etap 4. Workflow enterprise i integracja

Właściciel: główny agent

Zakres:

- scalenie portalu, konta klienta i admin workflow
- status matrix
- transition rules
- event log / notyfikacje / SLA foundation
- testy integracyjne i porządki architektoniczne

## Kolejność odpalania agentów

1. Główny agent robi foundation.
2. Po ustabilizowaniu kontraktów:
   - Agent A
   - Agent B
   - Agent C
3. Po wpięciu `returns_portal` do kontraktu modułów:
   - Agent D
   - Agent E
4. Na końcu główny agent:
   - scala wyniki
   - poprawia miejsca styku
   - robi review
   - uruchamia właściwe testy dla dotkniętych obszarów

## Kryteria jakości dla wszystkich agentów

Każdy agent musi:

- pracować tylko w przypisanym write secie,
- nie cofać zmian innych agentów,
- dostarczyć listę zmienionych plików,
- opisać założenia i miejsca ryzyka,
- nie wprowadzać nowych hardcoded URL-i jako "tymczasowego fixu",
- nie dodawać osobnych wyjątków, jeśli istnieje już foundation contract.

## Kryteria akceptacji rolloutu

Rollout uznajemy za poprawny dopiero wtedy, gdy jednocześnie:

- products/categories/brands mogą działać jako moduły przypisane do stron CMS,
- legal/system pages są rozwiązywane po roli systemowej, nie po slugach,
- `returns_portal` działa pod dowolnym slugiem strony CMS,
- klient zalogowany ma osobny obszar `/account/returns`,
- admin ma spójny obszar `Zwroty i reklamacje`,
- workflow nie opiera się już semantycznie na samych `orders.*`,
- storefront ma mniej wyjątków hardcoded w routingu niż przed wdrożeniem.

## Ryzyka

Największe ryzyka rolloutu:

- zbyt wczesne odpalenie agentów przed ustaleniem kontraktu foundation,
- konflikt na `client/app/_routes/*`,
- konflikt na `client/types/api.ts`,
- rozjechanie nazewnictwa statusów i permissionów,
- częściowe wdrożenie modułów bez usunięcia starych hardcoded fallbacków.

## Rekomendacja wykonawcza

Technicznie to zadanie da się rozbić na mniejszych agentów i zyskać na tokenach oraz czasie, ale tylko przy modelu:

- foundation centralnie,
- piony rozłącznie,
- integracja i review centralnie.

To jest rekomendowany tryb wdrożenia dla tej serii zmian.
