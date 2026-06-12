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

## Release 1 implementation summary

### Co zostało wdrożone

- Single-blog by default został wdrożony przez automatyczne rozwiązywanie `default blog`.
- `BlogPost` utworzony bez `blog_id` dostaje domyślny blog automatycznie.
- Dodano backfill dla istniejących `blog_posts` z pustym `blog_id`.
- Zachowano kompatybilność endpointów `/api/v1/blogs/*`.
- Utrzymano `/api/v1/blog/posts` jako primary public feed bez wdrażania multi-blog routingu.
- Ujednolicono kontrakt atrybutów do wspieranego zestawu typów: `text`, `numeric`, `select`, `multiselect`, `color`.
- Dodano normalizację legacy payloadów `number -> numeric`, `label -> slug`, `color_code -> color_hex`.
- Naprawiono zapis `AttributeValue` tak, aby backend używał realnych kolumn `slug` i `color_hex`.
- Admin UI atrybutów wysyła teraz payload zgodny z backend validation i istniejącym modelem danych.
- Zachowano compatibility guardrails: bez zmian w `ProductType`, `ProductTypeAttribute`, `VariantAttributeValue`, `variant.attributes` i `attributes: []` w product detail API.

### Jakie pliki zmieniono

- `server/app/Services/DefaultBlogResolver.php`
- `server/app/Models/BlogPost.php`
- `server/database/migrations/2026_06_12_090000_backfill_default_blog_for_blog_posts.php`
- `server/app/Http/Requests/Admin/Ecommerce/Concerns/NormalizesAttributePayload.php`
- `server/app/Http/Requests/Admin/Ecommerce/StoreAttributeRequest.php`
- `server/app/Http/Requests/Admin/Ecommerce/UpdateAttributeRequest.php`
- `server/app/Http/Controllers/Admin/Ecommerce/AttributeController.php`
- `server/resources/js/pages/admin/ecommerce/attributes/create.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/create.types.ts`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.types.ts`
- `server/tests/Feature/BlogTest.php`
- `server/tests/Feature/AttributeManagementTest.php`
- `server/tests/Feature/Api/ProductAttributeFilterTest.php`

### Jakie testy dodano lub poprawiono

- Blog:
  - create bez `blog_id` przypisuje default blog,
  - update adminowy nie czyści `blog_id`,
  - migration/backfill przypisuje default blog istniejącym postom bez bloga,
  - `/api/v1/blog/posts` nadal działa jako primary feed.
- Attributes:
  - tworzenie atrybutu dla wszystkich wspieranych typów,
  - legacy `number` normalizuje się do `numeric`,
  - walidacja odrzuca niewspierane typy,
  - `AttributeValue` zapisuje `slug` i `color_hex`,
  - legacy `label` i `color_code` są mapowane do kanonicznych pól,
  - update atrybutu działa na kanonicznym admin payload.
- Compatibility:
  - filtracja storefront po variant attributes nadal działa,
  - product detail zachowuje `variants[].attributes` oraz top-level `attributes: []`.

### Jakie testy uruchomiono

- Uruchomiono Docker-backed PHP lint (`php -l`) dla wszystkich zmienionych plików backendowych:
  - `DefaultBlogResolver`
  - `NormalizesAttributePayload`
  - `BlogPost`
  - `StoreAttributeRequest`
  - `UpdateAttributeRequest`
  - `AttributeController`
  - migracja backfill
- Próbowano uruchomić:
  - releasowe backend tests przez Pest,
  - `npm run types` w kontenerze PHP.
- W tym środowisku długie `docker compose exec` dla Pest/TypeScript nie zwracały wyniku w rozsądnym czasie mimo startu procesu, więc nie zostały wiarygodnie domknięte w tej sesji.

### Co zostało celowo odłożone

- `Category Attribute Schema`
- `ProductAttributeValue`
- pełne Metafields end-to-end
- przebudowa storefront filters
- zmiany kontraktu publicznego storefrontu poza kompatybilną normalizacją backend/admin
- usuwanie legacy modeli i tabel (`ProductType`, `ProductTypeAttribute`, `VariantAttributeValue`)

### Następne kroki

- Dokończyć pełną walidację w działającym, responsywnym środowisku Docker:
  - targeted Pest suites,
  - Pint,
  - Larastan/PHPStan,
  - `npm run types`.
- Po stabilizacji quality gates przejść do Release 2:
  - projekt `Category Attribute Schema`,
  - product-level attribute values,
  - etapowe rozszerzenie API/storefront bez łamania obecnego kontraktu wariantów.

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

## Release 2 implementation summary

### Co zostało wdrożone

- Dodano backend-only `CategoryAttributeSchema` jako nowego ownera schema atrybutów po stronie kategorii.
- Dodano tabelę `category_attribute_schemas` z polami `category_id`, `attribute_id`, `is_required`, `position`.
- Dodano relacje modeli oraz helper `Category::resolvedAttributeSchemas()` dla inheritance po parent category.
- Rozszerzono admin category requests/controller o opcjonalny payload `attribute_schema` i sync schema przy zapisie kategorii.
- Dodano backfill z `product_type_attributes` przez `categories.product_type_id`, bez kasowania legacy danych.
- Kategorie bez `product_type_id` albo bez powiązanych legacy rows nie są mapowane automatycznie i wymagają późniejszego jawnego przypisania schema.

### Jak działa Category Attribute Schema

- Schema kategorii definiuje tylko, jakie atrybuty są dostępne dla produktów w danej kategorii i które z nich są required.
- Child category dziedziczy definicje schema parenta, ale nie dziedziczy żadnych wartości produktu.
- Jeśli child ma direct wpis dla tego samego atrybutu, jego definicja wygrywa nad wpisem odziedziczonym.
- Na tym etapie schema działa równolegle do legacy `ProductTypeAttribute`; storefront i produkt nadal używają dotychczasowego kontraktu.
- Dla kategorii, których nie dało się bezpiecznie zmapować przez `product_type_id`, legacy `ProductTypeAttribute` pozostaje fallbackiem przejściowym do Release 3+.

### Jakie pliki zmieniono

- `server/app/Models/Category.php`
- `server/app/Models/Attribute.php`
- `server/app/Models/CategoryAttributeSchema.php`
- `server/database/factories/CategoryAttributeSchemaFactory.php`
- `server/database/migrations/2026_06_12_130000_create_category_attribute_schemas_table.php`
- `server/app/Http/Requests/Admin/Ecommerce/StoreCategoryRequest.php`
- `server/app/Http/Requests/Admin/Ecommerce/UpdateCategoryRequest.php`
- `server/app/Http/Controllers/Admin/Ecommerce/CategoryController.php`
- `server/tests/Feature/CategoryAttributeSchemaTest.php`
- `server/tests/Feature/Api/ProductAttributeFilterTest.php`
- `docs/architecture/catalog-content-model.md`
- `docs/plans/catalog-content-model-implementation-plan.md`

### Jakie testy dodano

- kategoria może mieć przypisane attribute definitions,
- atrybut w kategorii może być required lub optional,
- `category_id + attribute_id` jest unikalne,
- child category dziedziczy schema parenta,
- wartości produktów nie są dziedziczone z kategorii,
- backfill nie usuwa legacy `ProductTypeAttribute`,
- istniejące variant filters nadal działają przy równoległym category schema.

### Jakie testy uruchomiono

- W tej sesji nie uruchamiano Docker-backed testów ani quality gates.
- Zmiany zostały przygotowane pod testy relewantne dla kategorii/produktów/atrybutów, ale runtime verification pozostaje do wykonania osobno.

### Co zostało celowo odłożone

- `ProductAttributeValue`
- pełny admin UX produktu oparty o schema kategorii
- walidacja required schema przy zapisie produktu
- storefront integration
- przebudowa storefront filters
- Metafields end-to-end

### Następne kroki

- Uruchomić relewantne testy backendowe dla kategorii/produktów/atrybutów.
- Następnie wdrożyć `ProductAttributeValue` i walidację produktu względem schema kategorii.
- Dopiero po tym przygotować admin UX produktu i bezpieczną migrację storefront filters.

### Release 3

- admin UX + storefront integration for Phase 4
- Phase 5

## Release 3 implementation summary

### Co zostało wdrożone

- Dodano `ProductAttributeValue` jako product-level storage dla core attributes.
- Produkt waliduje i zapisuje `attribute_values` względem resolved schema kategorii.
- Admin formularz produktu ma osobną sekcję `Core Attributes`.
- Product detail API zwraca `attribute_values` i `attribute_summary`.
- Typy `boolean` i `date` zostały dopuszczone w definicjach atrybutów obok typów już istniejących po Release 1.

### Jak działają product-level attributes

- Kategoria definiuje dostępne definicje przez `CategoryAttributeSchema`.
- Produkt zapisuje wyłącznie własne wartości; schema nie dziedziczy wartości.
- `select` korzysta z pojedynczego `attribute_value_id`.
- `multiselect` przechowuje listę dozwolonych option ids.
- `variant.attributes` pozostaje bez zmian i nadal obsługuje legacy/storefront variant flow.

### Jakie pliki zmieniono

- `server/app/Models/ProductAttributeValue.php`
- `server/database/migrations/2026_06_12_170000_add_boolean_and_date_types_to_attributes_table.php`
- `server/database/migrations/2026_06_12_171000_create_product_attribute_values_table.php`
- `server/database/factories/ProductAttributeValueFactory.php`
- `server/app/Models/Product.php`
- `server/app/Models/Attribute.php`
- `server/app/Enums/AttributeTypeEnum.php`
- `server/app/Http/Requests/Admin/Ecommerce/Concerns/InteractsWithProductAttributeValues.php`
- `server/app/Http/Requests/Admin/Ecommerce/StoreProductRequest.php`
- `server/app/Http/Requests/Admin/Ecommerce/UpdateProductRequest.php`
- `server/app/Services/Admin/Ecommerce/ProductService.php`
- `server/app/Http/Controllers/Admin/Ecommerce/ProductController.php`
- `server/app/Http/Controllers/Api/V1/ProductController.php`
- `server/app/Data/AdminProductData.php`
- `server/resources/js/pages/admin/ecommerce/products/create.tsx`
- `server/resources/js/pages/admin/ecommerce/products/edit.tsx`
- `server/resources/js/pages/admin/ecommerce/products/core-attributes-section.tsx`
- `server/resources/js/pages/admin/ecommerce/products/core-attributes.types.ts`
- `server/resources/js/pages/admin/ecommerce/products/core-attributes.utils.ts`
- `server/resources/js/pages/admin/ecommerce/products/create.types.ts`
- `server/resources/js/pages/admin/ecommerce/products/edit.types.ts`
- `server/resources/js/pages/admin/ecommerce/attributes/create.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/create.types.ts`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.types.ts`
- `client/types/api.ts`
- `server/tests/Feature/ProductAttributeValueTest.php`

### Jakie testy dodano

- `tests/Feature/ProductAttributeValueTest.php`
  - save product-level attribute values,
  - required schema validation,
  - type validation,
  - select/multiselect option validation,
  - no value inheritance,
  - product detail API contract,
  - cart/default variant compatibility.

### Jakie testy uruchomiono

- `docker compose exec php php artisan test --compact tests/Feature/ProductAttributeValueTest.php tests/Feature/CategoryAttributeSchemaTest.php tests/Feature/Api/ProductAttributeFilterTest.php`

### Co zostało celowo odłożone

- pełna storefront integration sekcji specyfikacji
- przebudowa storefront filters
- migracja compare/listing na product-level attributes
- usuwanie legacy `variant_attribute_values`
- usuwanie legacy `ProductTypeAttribute`
- Metafields end-to-end

### Następne kroki

- Dodać storefront rendering dla `attribute_values`.
- Zaplanować bezpieczne przepięcie listing filters na product-level attributes.
- Przygotować review Release 3 i dopiero potem zakres Release 4 / cleanup legacy.

## Release 4 implementation summary

### Co zostało wdrożone

- Storefront detail renderuje specyfikację produktu z `attribute_values`.
- Product detail API rozdziela teraz:
  - `attribute_values`,
  - `attribute_summary`,
  - `variant_options`,
  - `variants`.
- Listingi storefrontu zaczęły korzystać z product-level summaries bez usuwania legacy `attribute_map`.
- API listing filters przyjmuje i wystawia product-level filterable attributes jako główne źródło, ale dalej wspiera legacy variant filters jako fallback.
- Revalidation dla zmian produktowych obejmuje detail, listingi, category/brand paths, search i compare przez `product.updated`.

### Jak storefront używa product-level attributes

- Sekcja specyfikacji na detail page renderuje tylko niepuste `attribute_values`.
- Specyfikacja nie miesza się z wyborem wariantu:
  - atrybuty pokrywające się z `variant_options` nie są renderowane jako core specs,
  - selector wariantu nadal działa na `variant.attributes`,
  - `variant_options` są addytywną warstwą kontraktu dla storefrontu.
- Listingi wykorzystują `attribute_summary` jako preferowane źródło krótkich specyfikacji, z fallbackiem do legacy `attribute_map`.
- Compare dalej działa na `attribute_map`, ale mapa jest już budowana hybrydowo z product-level attributes i legacy variant attributes.

### Jakie pliki zmieniono

- `server/app/Services/ProductAttributePresenter.php`
- `server/app/Http/Controllers/Api/V1/ProductController.php`
- `server/app/Http/Controllers/Api/V1/BrandController.php`
- `server/app/Http/Resources/Api/V1/ProductResource.php`
- `server/app/Observers/ProductObserver.php`
- `server/app/Services/Admin/Ecommerce/ProductService.php`
- `server/app/Http/Requests/Admin/Ecommerce/Concerns/InteractsWithProductAttributeValues.php`
- `server/tests/Feature/ProductAttributeValueTest.php`
- `server/tests/Feature/Api/ProductAttributeFilterTest.php`
- `server/tests/Feature/Admin/Cms/OnPublishWebhookTest.php`
- `client/types/api.ts`
- `client/lib/product-attributes.ts`
- `client/app/products/[slug]/ProductDetailClient.tsx`
- `client/app/products/[slug]/product-detail-components.tsx`
- `client/app/products/[slug]/product-detail-components.types.ts`
- `client/components/product-list-item.tsx`
- `client/tests/unit/product-attributes.test.tsx`
- `client/app/stores/stores-metadata.ts`
- `client/app/stores/page.tsx`
- `client/app/[locale]/stores/page.tsx`
- `client/lib/security-headers.ts`

### Co nadal działa jako fallback

- Legacy variant filters nie zostały usunięte.
- `variant.attributes` nie zostało usunięte ani zmienione breaking-change’owo.
- Add-to-cart, cena i stock nadal zależą od wybranego wariantu.
- Compare i listing nadal akceptują stary payload tam, gdzie jeszcze był używany.

### Jakie testy dodano

- `tests/Feature/ProductAttributeValueTest.php`
  - contract `variant_options` w detail API,
  - compare compatibility bez nowych attributes.
- `tests/Feature/Api/ProductAttributeFilterTest.php`
  - product-level filters w `available_filters`,
  - fallback legacy variant filters.
- `tests/Feature/Admin/Cms/OnPublishWebhookTest.php`
  - `product.updated` przy zmianie samych `attribute_values`.
- `client/tests/unit/product-attributes.test.tsx`
  - render specyfikacji z `attribute_values`,
  - brak pustych wartości,
  - fallback `attribute_summary`/`attribute_map`.

### Co zostało celowo odłożone

- usuwanie legacy variant filters,
- usuwanie `variant.attributes`,
- end-to-end Metafields,
- pełny cleanup starego kontraktu compare/listing,
- selective legacy removal w modelu wariantów i `ProductTypeAttribute`.

### Następne kroki

- Dodać stricte frontendowe testy interakcyjne dla variant selector + add-to-cart na detail page.
- Ocenić, które typy product-level attributes mogą być bezpiecznie oznaczane jako `is_listable` / `is_comparable` po dodaniu jawnych flag w modelu.
- Przygotować osobny release na redukcję legacy `attribute_map` i `variant_attribute_values` dopiero po stabilizacji danych produkcyjnych.

## What Not to Over-Engineer

- nie przywracać teraz pełnego multi-blog UX
- nie budować ogólnego schema engine dla wszystkich encji naraz
- nie przenosić wariantów do metafields ani odwrotnie
- nie utrzymywać `ProductType` jako równoległego właściciela schema, jeśli `Category` przejmie tę rolę
- nie wystawiać wszystkich metafields publicznie “na wszelki wypadek”

## Release 5 implementation summary

- Wdrożono extension layer dla metafields end-to-end: backend definitions, admin editing, validation, public exposure i selektywny storefront rendering.
- Zmodyfikowane pliki obejmują m.in. `server/app/Models/MetafieldDefinition.php`, `server/app/Services/MetafieldVisibilityService.php`, `server/app/Observers/MetafieldObserver.php`, requesty admina dla Product/Category/Page/BlogPost, publiczne resource’y API oraz storefront helper `client/lib/metafields.ts`.
- `visibility` działa jako źródło prawdy dla publicznej widoczności, a `storefront_exposed` działa jako jawny override dla public exposure bez otwierania całego admin payloadu.
- Admin sekcja `Metafields` jest wydzielona od core fields, attributes, variants i SEO, a wartości są walidowane wg definicji.
- Public API nie zwraca prywatnych ani admin-only metafields; storefront renderuje tylko allowlistowane klucze z dedykowanymi komponentami.
- Dodano testy zapisów dla Product, Category, Page i BlogPost, testy typu/visibility, test filtrowania public API i test regresji na brak automatycznego renderowania prywatnych danych.
- Guardrails pozostają bez zmian: metafields nie są zamiennikiem SKU, stock, price, compare_at_price, variant options, category membership, core product attributes, SEO core fields, tax/shipping data ani checkout-critical data.
- Następny etap to rozszerzanie storefront allowlist o konkretne komponenty tylko wtedy, gdy biznesowo potrzebne i bezpieczne.
