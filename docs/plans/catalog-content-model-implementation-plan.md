# Catalog & Content Model Implementation Plan

Data: 2026-06-12

## Cel

Plan ma doprowadzić aktualny kod do spójnej architektury:

- single-blog by default
- category-owned attribute schema
- product-level core attributes
- purchase-driven variants
- metafields jako extension layer
- spójny backend ↔ storefront contract
- czytelny admin UX

Plan celowo nie wdraża od razu wszystkiego naraz. Zmiany są etapowane tak, żeby ograniczyć ryzyko regresji w ecommerce i storefront.

## Zasady wykonania

1. Najpierw stabilizujemy kontrakty i model domenowy, dopiero potem UX.
2. Nie usuwamy od razu legacy warstw, jeśli istnieją zależności produkcyjne.
3. Każda faza kończy się testami i kompatybilnością wsteczną.
4. Storefront ma dostać nowy kontrakt etapowo, z warstwą przejściową.

## Phase 1 — Blog Simplification

### Cel

Ujednolicić aplikację jako single-blog bez łamania istniejących danych i endpointów.

### Zakres

- wprowadzić koncepcję default blog
- zapewnić, że każdy nowy `BlogPost` dostaje `blog_id`
- nie wymagać wyboru bloga w podstawowym admin flow
- zachować kompatybilność z istniejącymi wpisami i API
- upewnić się, że storefront używa jednego spójnego `/blog` flow

### Prace

1. Dodać serwis lub helper `DefaultBlogResolver`
2. Wybrać regułę default blog:
   - jawny `is_default`, jeśli zostanie dodany
   - albo pierwszy aktywny blog jako fallback
3. Backfill istniejących `BlogPost` z `blog_id = null`
4. Przy zapisie posta automatycznie ustawiać `blog_id`, jeśli nie przyszedł z formularza
5. Utrzymać endpointy `/api/v1/blogs/*` dla kompatybilności
6. Traktować `/api/v1/blog/posts` jako primary public feed
7. Potwierdzić, że `StorefrontPathService` i routing Next pracują na `/blog` i `/blog/{slug}`

### Testy

- create blog post bez `blog_id` ustawia default blog
- update blog post nie usuwa `blog_id`
- istniejące posty bez `blog_id` dostają default blog w migracji/backfill
- `/blog` listing działa na globalnym feedzie
- `/blog/{slug}` działa dla wpisu z default blog

### Ryzyko

- system może mieć wiele blogów aktywnych, ale bez określonego domyślnego
- integracje admin/API mogą zakładać, że `blog_id` bywa nullem

### Definition of Done

- nowe i istniejące posty mają stabilny `blog_id`
- admin nie musi wybierać bloga
- publiczny storefront jest jednoznacznie single-blog

## Phase 2 — Attribute Audit and Normalization

### Cel

Naprawić bieżący chaos wokół definicji atrybutów i przygotować grunt pod spójny model.

### Zakres

- zinwentaryzować obecne tabele i modele
- zidentyfikować pola core attribute vs variant option vs metafield
- naprawić obecne niespójności typu model/request/UI
- przygotować finalną klasyfikację danych katalogowych

### Prace

1. Zrobić inventory:
   - `attributes`
   - `attribute_values`
   - `product_type_attributes`
   - `variant_attribute_values`
   - `product_types.variant_selection_attributes`
2. Naprawić niespójność typów atrybutów między:
   - enumem
   - migracją
   - requestami
   - formularzami admina
3. Naprawić kontrakt wartości atrybutów:
   - `slug` vs `label`
   - `color_hex` vs `color_code`
4. Ustalić klasyfikację atrybutów:
   - core product attributes
   - variant selection attributes
   - candidate metafields
5. Oznaczyć duplikaty i pola, które nie powinny dalej żyć w złej warstwie
6. Przygotować spójny model walidacji per attribute type

### Testy

- atrybut może zostać utworzony i edytowany zgodnie z realnym enumem
- attribute values zapisują się w polach zgodnych z migracją i modelem
- admin formularz atrybutu nie wysyła payloadu sprzecznego z backendem

### Ryzyko

- część istniejących danych może mieć typy niezgodne z finalnym enumem
- część istniejących atrybutów może być semantycznie wariantami, nie core attributes

### Definition of Done

- obecny model atrybutów ma jeden spójny kontrakt
- zespół ma klasyfikację: attribute vs variant option vs metafield

## Phase 3 — Category Attribute Schema

### Cel

Przenieść ownership schematu atrybutów z `ProductType` na `Category`.

### Zakres

- dodać lub uporządkować przypisywanie attribute definitions do kategorii
- oznaczyć required/optional
- wspierać opcjonalne dziedziczenie schematu po parent category
- nie dziedziczyć wartości
- walidować produkt względem schematu kategorii

### Prace

1. Wprowadzić model/pivot `category_attribute_schema`
2. Zmapować istniejące `product_type_attributes` do nowego schematu kategorii
3. Dodać admin UI do zarządzania schema na kategorii
4. Ustalić regułę dziedziczenia:
   - parent schema merged by default
   - child może dodawać override lub rozszerzenie
5. Dodać warstwę walidacji produktu względem przypisanej kategorii
6. Zostawić `ProductType` tylko dla cech technicznych produktu typu:
   - `has_variants`
   - `is_shippable`
   albo zacząć jego stopniowe wygaszanie, jeśli stanie się zbędny

### Testy

- kategoria może mieć required/optional attributes
- child category może odziedziczyć schema parenta
- wartości produktu nie dziedziczą się z kategorii
- zapis produktu bez required attributes kończy się walidacją

### Ryzyko

- część obecnych produktów może mieć `product_type_id`, ale kategorie bez pełnego schema
- category forms nie obsługiwały dotąd żadnej warstwy attribute schema

### Definition of Done

- kategoria jest jednym właścicielem schema atrybutów
- produkt waliduje się względem kategorii

## Phase 4 — Product Attribute Values

### Cel

Wprowadzić product-level values dla core attributes i wystawić je spójnie przez admin, API i storefront.

### Zakres

- edycja wartości atrybutów w formularzu produktu
- walidacja wg typu
- API response dla attribute values
- rendering na storefront
- użycie w filtrach, gdy `filterable = true`

### Prace

1. Wprowadzić `ProductAttributeValue`
2. Dodać sekcję `Core Attributes` do formularza produktu
3. Ładować schema na podstawie kategorii
4. Renderować odpowiednie input types:
   - text
   - number
   - select
   - multiselect
   - boolean
   - color
5. Dodać walidację backendową per type
6. Rozszerzyć product API:
   - `attribute_values`
   - `attribute_summary`
7. Dodać rendering attribute specs na storefront detail
8. Wpiąć filterable attributes do listing filters i compare
9. W okresie przejściowym utrzymać kompatybilność z istniejącym `attribute_map`

### Testy

- admin może zapisać wartości atrybutów produktu
- select/multiselect akceptują tylko dozwolone options
- filterable attributes pojawiają się w `available_filters`
- storefront renderuje core specs z nowego payloadu

### Ryzyko

- dziś filtracja działa na atrybutach wariantów, więc trzeba przeprowadzić bezpieczną migrację logiki
- compare/listing mogą tymczasowo potrzebować danych z obu źródeł

### Definition of Done

- produkt ma product-level core attributes
- storefront i API rozumieją je jako główny model specyfikacji

## Phase 5 — Product Variants

### Cel

Zostawić warianty wyłącznie dla różnic zakupowych i uporządkować ich kontrakt.

### Zakres

- upewnić się, że warianty służą tylko purchase-affecting differences
- sprawdzić SKU/price/stock/options
- upewnić się, że cart i checkout używają wariantu tam, gdzie trzeba
- nie mieszać variant options z metafields

### Prace

1. Zdefiniować variant-option subset atrybutów
2. Dodać regułę, że produkt z wariantami ma jawne variant options
3. Odróżnić w API:
   - `attribute_values` produktu
   - `variant_options`
   - `variants`
4. Sprawdzić default variant semantics dla simple products
5. Upewnić się, że cart/wishlist/checkout/order items używają tylko `variant_id`
6. Dodać walidację unikalności kombinacji option values per product
7. Utrzymać kompatybilność z istniejącym wyborem wariantu na detail page

### Testy

- produkt prosty ma dokładnie jeden default variant
- produkt wariantowy ma poprawne kombinacje option values
- wybór wariantu na storefront prowadzi do poprawnego SKU/ceny/stocku
- add-to-cart działa na wybranym wariancie

### Ryzyko

- obecne dane mogą mieć specyfikacyjne atrybuty zapisane jako variant attributes
- część storefrontu zakłada obecny shape `variant.attributes`

### Definition of Done

- warianty mają czystą, zakupową semantykę
- product detail rozdziela core attributes od variant options

## Phase 6 — Metafields End-to-End

### Cel

Zostawić metafields jako extension layer i dopiąć je spójnie przez admin, API i storefront.

### Zakres

- edycja wartości metafields w głównych formularzach admina
- typy danych i walidacja
- `storefront_exposed` / `visibility`
- publiczne API tylko dla jawnie dozwolonych pól
- brak użycia metafields dla danych checkout-critical

### Prace

1. Rozszerzyć `metafield_definitions` o:
   - `visibility`
   - `storefront_exposed`
2. Dodać `Metafields` section do formularzy:
   - product
   - category
   - page
   - blog post
3. Podpiąć istniejący `MetafieldEditor` do realnych ekranów lub zastąpić go docelowym komponentem
4. Dodać walidację typu i definicji
5. Ograniczyć public API do jawnie publicznych definicji
6. Rozszerzyć storefront tylko tam, gdzie feature tego wymaga

### Testy

- admin może zapisać metafields dla supported owner types
- prywatne metafields nie wyciekają do public API
- publiczne metafields są renderowane tylko tam, gdzie zostały świadomie wpięte

### Ryzyko

- istniejący publiczny endpoint dziś zwraca wszystko dla danego ownera
- część istniejących danych może zostać uznana za prywatną po zaostrzeniu kontraktu

### Definition of Done

- metafields są jawnie extension layer
- public exposure jest kontrolowane
- admin ma realny UX do edycji wartości

## Cross-Cutting Workstreams

### API Contract Alignment

Równolegle przez fazy 3-6:

- ujednolicić payloady backendu i `client/types/api.ts`
- usunąć puste lub mylące pola typu `attributes: []` na product detail
- dodać contract tests dla public product/blog payloadów

### Admin UX Alignment

Równolegle przez fazy 4-6:

- produkt: osobne sekcje core attributes / variant options / metafields
- kategoria: osobna sekcja attribute schema
- blog post: uproszczony single-blog flow

### Cache / Revalidation

Równolegle przez wszystkie fazy:

- product attribute change invalidates product detail and listing filters
- variant change invalidates product detail, cart-adjacent fragments and listing pricing
- blog post change invalidates `/blog` and `/blog/{slug}`
- public metafield change invalidates owner detail page

## Suggested Delivery Order

1. Phase 1 — Blog simplification
2. Phase 2 — Attribute audit and normalization
3. Phase 3 — Category attribute schema
4. Phase 4 — Product attribute values
5. Phase 5 — Product variants
6. Phase 6 — Metafields end-to-end

Powód:

- blog można uprościć szybko i niskim kosztem
- atrybuty trzeba najpierw oczyścić, zanim przeniesie się ownership na kategorię
- product-level attribute values muszą powstać przed pełnym uporządkowaniem storefront contract
- metafields najlepiej domknąć na końcu, gdy core catalog model jest już jasny

## Minimal Safe Rollout Strategy

### Release 1

- Phase 1
- Phase 2

### Release 2

- Phase 3
- backend foundations Phase 4

### Release 3

- admin UX + storefront integration for Phase 4
- Phase 5

### Release 4

- Phase 6
- contract cleanup
- selective legacy removal

## What Not to Over-Engineer

- nie przywracać teraz pełnego multi-blog UX
- nie budować ogólnego schema engine dla wszystkich encji naraz
- nie przenosić wariantów do metafields ani odwrotnie
- nie utrzymywać `ProductType` jako równoległego właściciela schema, jeśli `Category` przejmie tę rolę
- nie wystawiać wszystkich metafields publicznie “na wszelki wypadek”
