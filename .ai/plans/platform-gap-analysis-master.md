# Master Gap Analysis: dynamiczny CMS + commerce + system pages

Data: 2026-06-03
Status: dokument nadrzędny po audytach cząstkowych

## Cel

Ten dokument scala wcześniejsze audyty i wskazuje, czego nadal brakuje, aby platforma działała bardziej jak nowoczesny CMS/e-commerce w stylu Shopify, WordPress i systemów enterprise:

- wszystkie publiczne byty są obsługiwane dynamicznie,
- strony systemowe mają semantyczne role zamiast hardcoded URL-i,
- operacyjne obszary commerce mają pełne workflow i self-service,
- SEO, routing, menu i polityki korzystają z jednego źródła prawdy,
- admin ma czytelne uprawnienia i przewidywalne ekrany zarządzania.

## Dokumenty źródłowe

Ten dokument nie zastępuje planów szczegółowych. One są wystarczające i pozostają źródłem wykonawczym dla swoich obszarów:

- [dynamic-page-modules-audit.md](/Users/domin/projects/laravel/cms/.ai/plans/dynamic-page-modules-audit.md)
- [legal-system-pages-audit.md](/Users/domin/projects/laravel/cms/.ai/plans/legal-system-pages-audit.md)
- [returns-complaints-portal-plan.md](/Users/domin/projects/laravel/cms/.ai/plans/returns-complaints-portal-plan.md)
- [returns-complaints-workflow-enterprise.md](/Users/domin/projects/laravel/cms/.ai/plans/returns-complaints-workflow-enterprise.md)

## Najważniejszy wniosek

Największy problem nie polega na pojedynczych brakujących stronach lub modułach. Problemem jest brak 4 wspólnych mechanizmów platformowych:

1. rejestru i kontraktu modułów,
2. ról stron systemowych,
3. silnika typów stron i template/rendering engine,
4. workflow engine dla obszarów operacyjnych commerce.

Dopóki te 4 warstwy nie będą domknięte, kolejne funkcje będą wpadały w ten sam antywzorzec:

- część działa dynamicznie,
- część jest seedowana jakby była dynamiczna,
- runtime nadal ma hardcoded route, URL albo osobny wyjątek w UI.

## Zakres braków do wdrożenia

### 1. Dynamic modules dla wszystkich publicznych bytów

To jest warstwa podstawowa. Należy domknąć przejście z modelu:

- hardcoded route + osobny widok

na model:

- CMS page + assigned module + renderer + route resolver.

Obszary obowiązkowe:

- blog,
- produkty,
- kategorie,
- marki,
- portal zwrotów i reklamacji,
- ewentualne kolejne listingi lub landing pages domenowe.

Status:

- szczegółowy plan istnieje w `dynamic-page-modules-audit.md`

### 2. System pages i semantic page roles

To jest brakujący odpowiednik:

- Shopify store policies,
- WordPress page assignment, np. Privacy Policy page.

Należy wdrożyć:

- przypisanie zwykłej strony CMS do roli systemowej,
- odwołania po `system_page_key`, nie po slugach i nie po `*_url`,
- wsparcie dla locale i publikacji,
- fallbacki tylko kontrolowane, nie przypadkowe.

Minimalny zestaw ról:

- `privacy_policy`
- `cookie_policy`
- `terms_of_service`
- `shipping_policy`
- `return_policy`
- `legal_notice`
- `returns_portal`
- `contact_page`
- `faq_page`
- `product_listing`
- `category_listing`
- `brand_listing`
- `blog_listing`
- `search_results`
- `not_found_page`

Status:

- szczegółowy plan istnieje w `legal-system-pages-audit.md`

### 3. Page types, templates i renderer contract

To jest luka, której poprzednie plany dotykają pośrednio, ale warto ją nazwać wprost.

Sama strona CMS i sam moduł nie wystarczą. Potrzebna jest jeszcze warstwa określająca:

- czym dana strona jest funkcjonalnie,
- jak ma być renderowana,
- jaki layout i jakie SEO ma odziedziczyć.

Należy wprowadzić spójny model:

- `page_type`
- `module_name`
- `view_type` albo `template_key`
- `layout_key`
- `detail/list/archive/portal/system` jako jawne tryby strony

Przykłady:

- `blog_listing`
- `product_listing`
- `category_listing`
- `brand_listing`
- `returns_portal`
- `legal_content_page`
- `search_results`
- `404_page`

Bez tego będą wracały pytania:

- czy to jest zwykła strona,
- czy listing,
- czy detail route,
- czy strona systemowa,
- czy specjalny portal.

### 4. Route resolution jako jedno źródło prawdy

Routing storefrontu nadal jest hybrydowy. Trzeba go przepiąć na jeden resolver, który umie:

- rozpoznać zwykłą stronę CMS,
- rozpoznać listing przypisany do roli systemowej,
- rozpoznać detail route wynikający z modułu,
- obsłużyć locale,
- oddać dane potrzebne SEO, breadcrumbs, sitemap i navigation.

To powinno eliminować:

- ręczne `/products`,
- ręczne `/blog`,
- `?category=...` jako substytut strony kategorii,
- losowe fallbacki w komponentach i route files.

### 5. Enterprise workflow dla zwrotów i reklamacji

To jest najważniejsza luka operacyjna w commerce.

Docelowo potrzebne są jednocześnie:

- dynamiczny portal CMS,
- customer self-service,
- guest lookup,
- pełna lista spraw w koncie klienta,
- wspólny model danych,
- workflow per typ zgłoszenia,
- statusy, SLA, event log, notyfikacje, refund/exchange handling.

Status:

- plan portalu istnieje w `returns-complaints-portal-plan.md`
- plan workflow istnieje w `returns-complaints-workflow-enterprise.md`

### 6. Return rules i eligibility engine

To jest obszar, który nie ma jeszcze osobnego planu, ale powinien wejść do roadmapy jako osobny etap po portalu i workflow.

Należy wdrożyć reguły typu:

- okno zwrotu per produkt / kategoria / marka / kanał,
- produkty wykluczone z prawa zwrotu,
- `final sale`,
- restocking fee,
- osobne zasady dla zwrotu, reklamacji i wymiany,
- refund method:
  - original payment,
  - store credit,
  - replacement,
- kwalifikacja po kraju, magazynie, dostawie, fulfillment source.

To jest bardzo zgodne z kierunkiem Shopify i enterprise OMS/RMA.

### 7. Privacy/GDPR operations

WordPress poza stroną polityki prywatności ma też narzędzia operacyjne do privacy requests. U Was ten obszar nadal jest za płytki.

Należy rozważyć:

- request eksportu danych,
- request usunięcia lub anonimizacji danych,
- panel admina do obsługi requestów,
- potwierdzenia email dla requestów,
- audit trail dla requestów,
- powiązanie polityk i zgód z wersjami dokumentów.

To nie jest tylko compliance add-on. To powinno być elementem system pages + customer privacy + admin workflow.

### 8. Versioning treści prawnych i zgód

System stron prawnych bez wersjonowania będzie problematyczny operacyjnie i prawnie.

Do wdrożenia:

- draft / scheduled / published / archived,
- `effective_from`,
- wersja dokumentu,
- historia zmian,
- zapis akceptacji klienta względem konkretnej wersji,
- powiązanie z checkoutem i cookie consent.

### 9. Dynamiczne SEO i information architecture

Jeśli routing i strony stają się dynamiczne, SEO też musi stać się dynamiczne.

Należy ujednolicić:

- canonical,
- robots,
- title,
- description,
- Open Graph,
- structured data,
- breadcrumbs,
- hreflang,
- sitemap per page/module type,
- noindex dla flow technicznych lub prywatnych.

Szczególnie ważne:

- listing produktów,
- listing kategorii,
- listing marek,
- blog archive i blog detail,
- strony prawne,
- portal zwrotów i reklamacji,
- search results.

### 10. Navigation i linkowanie systemowe

WordPress Site Editor i Shopify navigation pokazują, że edycja stron bez spójnego linkowania daje tylko połowę rozwiązania.

Należy dopiąć:

- menu oparte o `page_id` lub role systemowe, nie o surowe URL,
- legal footer zasilany przez system pages,
- walidację brakujących stron systemowych,
- podpowiedzi w panelu menu buildera,
- automatyczne linkowanie do przypisanych listing pages tam, gdzie dziś są route hardcoded.

### 11. Permissions i capability model

Uprawnienia powinny odzwierciedlać rzeczywiste obszary produktu, a nie przypadkowe zależności.

Należy rozdzielić co najmniej:

- `pages.*`
- `system_pages.*`
- `page_templates.*`
- `navigation.*`
- `seo.*`
- `returns.*`
- `complaints.*` albo wspólnie `cases.*`
- `policy_documents.*`
- `privacy_requests.*`

Obecne zależności typu `returns` podpięte pod `orders.*` trzeba docelowo usunąć.

### 12. Multi-locale i multi-store readiness

Jeżeli platforma ma iść w kierunku enterprise, trzeba od razu uwzględnić:

- różne strony systemowe per locale,
- różne polityki per rynek,
- różne return rules per rynek,
- różne menu per locale,
- różne listing pages per storefront,
- fallback strategy dla brakujących tłumaczeń i przypisań.

## Priorytety

### Must-have

- domknięcie `dynamic modules` dla blog/products/categories/brands
- wdrożenie `system pages`
- jeden route resolver dla storefrontu
- moduł `Zwroty i reklamacje` jako dynamic portal
- osobne konto klienta dla spraw zwrotowych i reklamacyjnych
- dedykowane permissions zamiast zależności od `orders.*`
- dynamiczne SEO/sitemap/breadcrumbs dla nowych resolverów

### Should-have

- page type / template engine
- return rules i eligibility engine
- policy versioning
- lepsze navigation linking i admin validations
- rich notifications i SLA dla RMA

### Enterprise-later

- privacy request workflow
- multi-market policy and rules matrix
- bardziej zaawansowane automation triggers
- integracje z zewnętrznym RMA/OMS/WMS
- store credit / exchange credit ledger

## Zależności między obszarami

1. `system pages` zależą od porządnego modelu `pages` i route resolution.
2. `dynamic SEO` zależy od route resolvera i page roles.
3. `returns portal` zależy od dynamic modules i system pages.
4. `returns workflow enterprise` może być rozwijany równolegle, ale pełną wartość daje dopiero po uruchomieniu portalu klienta.
5. `return rules` powinny wejść po ustabilizowaniu workflow i customer portal.
6. `privacy/GDPR operations` powinny bazować na system pages, versioningu i capability modelu.

## Proponowana kolejność wdrożenia

### Faza 1. Platform foundation

- rozszerzyć rejestr modułów
- wdrożyć `system_page_key` lub tabelę przypisań
- zbudować jeden route resolver
- usunąć najważniejsze hardcoded URL i slugi

### Faza 2. Commerce pages

- produkty jako dynamic module
- kategorie jako dynamic module
- marki jako dynamic module
- domknięcie bloga do tego samego modelu
- przepięcie sitemap, breadcrumbs, canonicali i linkowania

### Faza 3. Returns and complaints

- dynamiczny portal CMS
- konto klienta `/account/returns`
- guest lookup
- zmiana nazewnictwa admina na `Zwroty i reklamacje`
- dedykowane permissions

### Faza 4. Enterprise operations

- state machine
- event log
- SLA
- notyfikacje
- refund/exchange orchestration
- return rules

### Faza 5. Compliance and scale

- policy versioning
- consent version tracking
- privacy request workflow
- multi-locale / multi-market expansion

## Kryteria ukończenia audytu docelowego

Można uznać, że ten obszar został domknięty dopiero wtedy, gdy:

- nie ma publicznych hardcoded route jako jedynego źródła prawdy dla commerce i content,
- każda strona specjalna jest zwykłą CMS page albo CMS page z rolą systemową,
- admin może przypisać produkty, kategorie, marki i portal zwrotów do dowolnej strony,
- klient zalogowany i niezalogowany mają pełny, przewidywalny flow zwrotów i reklamacji,
- SEO, sitemap i navigation korzystają z jednego resolvera stron,
- uprawnienia nie są przypadkowo dziedziczone z innych domen,
- polityki i zgody mają wersjonowanie oraz spójną semantykę systemową.

## Rekomendacja końcowa

Nie doklejać kolejnych wyjątków per feature.

Każdy nowy publiczny lub operacyjny obszar powinien przechodzić przez wspólny kontrakt platformowy:

- page
- module
- system role, jeśli dotyczy
- route resolver
- SEO/navigation integration
- permission model
- workflow model, jeśli jest to obszar operacyjny

To jest najkrótsza droga do tego, żeby projekt przestał być hybrydą i stał się spójną platformą CMS + commerce.
