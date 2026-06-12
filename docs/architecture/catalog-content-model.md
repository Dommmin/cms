# Catalog & Content Model

Data: 2026-06-12

## 1. Executive Summary

Docelowa architektura powinna rozdzielić cztery warstwy, które dziś częściowo się mieszają:

- `Blog` jako techniczny kontener jednego publicznego bloga
- `Attributes` jako core model danych katalogowych i filtrów
- `Variants` jako model różnic zakupowych
- `Metafields` jako extension layer dla danych niestandardowych

Najważniejsza decyzja:

- aplikacja działa publicznie jako `single-blog`
- `Category` staje się właścicielem schematu atrybutów produktu
- `Product` dostaje jawne wartości core attributes
- `ProductVariant` pozostaje jedynym źródłem danych zakupowych
- `Metafields` nie przechowują danych checkout-critical ani core catalog fields

To upraszcza model domeny, poprawia kontrakt backend ↔ storefront i usuwa niejednoznaczność dla zespołu.

## 2. Final Decision

Finalna decyzja architektoniczna:

1. Blog publiczny działa zawsze jako jeden globalny listing `/blog` i wpis `/blog/{postSlug}`.
2. `Blog` zostaje w modelu jako techniczny/default container, ale nie komplikuje podstawowego flow.
3. `Category` definiuje schemat atrybutów dla produktów w tej kategorii.
4. `Product` przechowuje wartości core attributes na poziomie produktu.
5. `ProductVariant` przechowuje wyłącznie różnice zakupowe i variant options.
6. `Metafields` są warstwą rozszerzeń i publicznie są wystawiane tylko jawnie.
7. Publiczne API produktu rozróżnia:
   - `attribute_values`
   - `variant_options`
   - `variants`
   - `metafields`
8. Admin edytuje te warstwy osobno, z jasnym UX i walidacją.

## 3. Blog Model

### Finalny model

- `Blog` pozostaje encją techniczną
- system utrzymuje jeden `default blog`
- każdy `BlogPost` musi mieć `blog_id`
- w podstawowym flow admina użytkownik nie wybiera bloga
- `blog_id` jest ustawiany automatycznie na domyślny blog

### Publiczny routing

- listing: `/blog`
- detail: `/blog/{postSlug}`

### Dopuszczalna przyszłość

Multi-blog może wrócić jako future feature, ale dopiero gdy:

- admin będzie miał jasny wybór bloga
- storefront będzie miał odrębne listing routes
- URL model będzie wspierał per-blog navigation

Do tego czasu multi-blog jest nieaktywną możliwością techniczną, nie częścią podstawowej architektury.

## 4. Product Attribute Model

### Cel

Attributes są głównym modelem danych katalogowych.

Służą do danych, które:

- mają znaczenie katalogowe
- są filtrowalne
- mogą być porównywane
- mogą być wymagane przez kategorię
- mogą być renderowane na listingach i detail pages

### Docelowy model

`AttributeDefinition`

- id
- name
- slug
- type
- unit
- is_filterable
- is_comparable
- is_listable
- is_search_facet
- supports_multiple_values
- input_mode: `text | number | select | multiselect | boolean | color | dimension | json-lite`

`AttributeOption`

- id
- attribute_definition_id
- value
- slug
- color_hex
- position

`ProductAttributeValue`

- id
- product_id
- attribute_definition_id
- raw_value
- normalized_value
- option_id nullable
- locale handling where needed

### Zasada

Product attributes są przypisane do produktu, nie do wariantu.

## 5. Category Attribute Schema

### Właściciel schematu

`Category` definiuje schemat atrybutów.

Nie `ProductType`.

### Docelowy model

`CategoryAttributeSchema`

- id
- category_id
- attribute_definition_id
- is_required
- is_filterable_override nullable
- is_listable_override nullable
- is_comparable_override nullable
- position

### Release 2 backend foundation

Aktualna implementacja Release 2 używa istniejącej tabeli `attributes` jako źródła definicji, więc backendowy pivot ma postać:

`category_attribute_schemas`

- id
- category_id
- attribute_id
- is_required
- position

Semantycznie `attribute_id` jest w tym etapie odpowiednikiem docelowego `attribute_definition_id`.

Opcjonalnie:

- `inherits_from_parent` jako zachowanie systemowe, nie osobna wartość per row

### Semantyka

Kategoria definiuje:

- które atrybuty wolno używać
- które są wymagane
- które są opcjonalne

Kategoria nie definiuje:

- konkretnych wartości produktu

To jest schema inheritance, nie value inheritance.

### Dziedziczenie

Można wspierać dziedziczenie schematu po kategorii nadrzędnej, ale:

- tylko dla definicji pól
- bez dziedziczenia wartości

## 6. Product Variant Model

### Cel

Variant istnieje tylko wtedy, gdy różnica wpływa na zakup.

### Variant może przechowywać

- SKU
- price
- compare_at_price
- cost_price
- stock_quantity
- stock_threshold
- backorder / preorder state
- barcode / EAN / UPC
- variant image
- download config
- tax override

### Variant nie powinien przechowywać

- ogólnych parametrów specyfikacji produktu
- danych, które nie wpływają na wybór zakupowy
- core SEO
- metafields zastępujących katalog

### Variant options

Variant options są podzbiorem atrybutów, ale mają osobną rolę domenową:

- służą do wyboru wariantu
- muszą prowadzić do jednoznacznego SKU

Przykłady:

- size
- color
- capacity
- pack_size

## 7. Metafield Model

### Cel

Metafields pozostają extension layer.

Są dla danych:

- niestandardowych
- opcjonalnych
- niecheckoutowych
- branżowych lub klient-specyficznych
- czasem publicznych, czasem wewnętrznych

### Docelowy model definicji

`MetafieldDefinition`

- owner_type
- namespace
- key
- name
- type
- validations
- visibility: `private | admin_only | storefront`
- storefront_exposed: boolean
- pinned
- position

### Docelowy model wartości

`Metafield`

- owner_type
- owner_id
- namespace
- key
- type
- value
- description nullable

### Public API

Publiczne API wystawia tylko metafields z:

- `visibility = storefront`
lub
- `storefront_exposed = true`

## 8. What Belongs to Attributes

Do attributes należą dane, które:

- są częścią modelu katalogowego
- mają być filtrowalne
- mają być porównywalne
- mogą być wymagane przez kategorię
- mają występować w specyfikacji produktu

Przykłady:

- skin_type
- material
- power
- dimensions
- weight
- compatibility
- active_ingredients
- spf
- capacity_ml

## 9. What Belongs to Variants

Do variants należą dane, które zmieniają zakup.

Przykłady:

- rozmiar S/M/L
- kolor kupowany jako osobny SKU
- pojemność 250 ml / 500 ml gdy ma własną cenę lub stock
- pack size
- product edition / version

Warunek:

różnica musi wpływać na SKU, cenę, stan, obraz lub wybór klienta przed dodaniem do koszyka.

## 10. What Belongs to Metafields

Do metafields należą dane rozszerzające, np.:

- warranty_info
- technical_sheet_url
- care_instructions
- custom_badge_text
- product_story
- external_erp_note
- delivery_notice
- specification_pdf
- additional_description
- custom_frontend_section_data

## 11. What Must Not Be Stored in Metafields

Metafields nie mogą zastępować:

- SKU
- stock
- price
- compare_at_price
- variant option selection
- category membership
- core product attributes
- SEO core fields, jeśli model ma już własne pola
- checkout-critical data
- tax/shipping critical data

## 12. API Contract

### Product list response

Listing produktu powinien wystawiać:

- id
- name
- slug
- public_url
- thumbnail
- price_min / price_max
- compare_at_price_min / omnibus_price_min
- category
- brand
- attribute_summary
- variant_option_summary

`attribute_summary`:

- agregowane, czytelne wartości do listingu i compare

`variant_option_summary`:

- opcje możliwe do wyboru, jeśli potrzebne na cardach

### Product detail response

Detail produktu powinien rozdzielać:

- `attribute_values`
- `variant_options`
- `variants`
- `metafields`

Przykładowa struktura:

```json
{
  "id": 1,
  "name": "Face Cream",
  "attribute_values": [
    { "slug": "skin_type", "label": "Skin Type", "type": "select", "value": "sensitive" },
    { "slug": "spf", "label": "SPF", "type": "number", "value": 30 }
  ],
  "variant_options": [
    { "slug": "capacity_ml", "label": "Capacity", "values": ["50", "100"] }
  ],
  "variants": [
    { "id": 101, "sku": "CRM-50", "price": 4999, "attributes": { "capacity_ml": "50" } }
  ],
  "metafields": [
    { "namespace": "content", "key": "product_story", "type": "rich_text", "value": "..." }
  ]
}
```

### Category response

Category detail dla admin/API wewnętrznego powinien wystawiać schema:

- attribute definitions
- required/optional flags
- inherited markers

### Blog API

Publiczny storefront używa:

- `/blog/posts`
- `/blog/posts/{slug}`

Endpointy blog container mogą pozostać dla kompatybilności, ale nie są primary storefront contract.

## 13. Admin UX Contract

### Product form

Formularz produktu powinien mieć osobne sekcje:

1. General
2. Category & Schema
3. Core Attributes
4. Variant Options / Variants
5. Media
6. SEO
7. Metafields

### Zasady UX

- po wyborze kategorii formularz ładuje category attribute schema
- required attributes są oznaczone wyraźnie
- product attributes edytuje się jako specyfikację produktu
- variant options są oddzielone wizualnie od core attributes
- metafields są na końcu jako advanced/extension

### Blog post form

- blog selection ukryte w podstawowym flow
- system automatycznie przypisuje default blog
- editor widzi tylko kategorię posta, tagi, status i content

## 14. Storefront Rendering Rules

### Product detail

1. Core specs renderują się z `attribute_values`
2. Wybór wariantu renderuje się z `variant_options`
3. Cena, stock i add-to-cart zależą od wybranego wariantu
4. Metafields renderują się tylko, jeśli są jawnie wystawione

### Product listing

1. Filtry pochodzą z filterable attributes
2. Listing nie powinien zgadywać danych z metafields
3. Listing może pokazywać wybrane `is_listable` attributes

### Blog

1. Listing bloga renderuje globalny `/blog`
2. Wpis renderuje `/blog/{slug}`
3. Blog container nie zmienia podstawowego UX storefrontu

## 15. Validation Rules

### Blog

- `blog_id` zawsze wymagany na poziomie modelu zapisu
- jeśli brak w payload, backend ustawia default blog

### Category schema

- `category_id + attribute_definition_id` unikalne
- w aktualnym backend foundation odpowiada temu unikalność `category_id + attribute_id`
- `is_required` jawne

### Product attributes

- produkt musi spełnić required schema z kategorii
- wartość musi zgadzać się z typem definicji
- select/multiselect muszą wskazywać dozwolone option values

### Variants

- kombinacja variant options musi być unikalna per product
- produkt z wariantami nie może mieć niespójnego default variant
- produkt bez wariantów musi mieć dokładnie jeden default variant

### Metafields

- tylko zdefiniowane typy danych
- walidacje z definicji
- public exposure tylko dla jawnie oznaczonych definicji

## 16. Cache / Revalidation Impact

Zmiany w tych warstwach powinny invalidować:

- product detail
- product listings / category listings
- compare/search filters
- blog listing
- blog post detail

### Minimalne reguły

- zmiana `ProductAttributeValue` czyści product detail i odpowiednie listingi/filter metadata
- zmiana `CategoryAttributeSchema` czyści category admin cache i listing filter metadata
- zmiana `ProductVariant` czyści product detail, cart-related cached fragments i listing prices
- zmiana `BlogPost` czyści `/blog` oraz `/blog/{slug}`
- zmiana publicznych metafields czyści owner detail page

## 17. Migration Strategy from Current Code

### Blog

1. Utworzyć/wybrać default blog
2. Backfill `blog_id` dla istniejących postów bez bloga
3. Ustawić automatyczne przypisywanie `blog_id` przy create
4. Nie eksponować wyboru bloga w podstawowym admin flow

### Attributes

1. Zrobić audit obecnych `Attribute`, `AttributeValue`, `ProductTypeAttribute`
2. Naprawić bieżące niespójności typów i payloadów
3. Wprowadzić `ProductAttributeValue`
4. Przenieść ownership schematu z `ProductType` na `Category`
5. Zachować kompatybilne czytanie starych variant attributes w okresie przejściowym

## Release 2 implementation summary

### Co zostało wdrożone

- Dodano backendowy model `CategoryAttributeSchema` z tabelą `category_attribute_schemas`.
- `Category` ma teraz własne relacje do direct schema i helper `resolvedAttributeSchemas()` do dziedziczenia definicji po parent category.
- Admin backend kategorii akceptuje opcjonalny payload `attribute_schema` z polami:
  - `attribute_id`
  - `is_required`
  - `position`
- Sync schema działa w `store` i `update` kategorii bez breaking change dla istniejącego formularza.
- Dodano backfill, który mapuje legacy `product_type_attributes` na `category_attribute_schemas` przez `categories.product_type_id`.
- Kategorie bez `product_type_id` albo bez legacy `product_type_attributes` nie są mapowane automatycznie i pozostają na ścieżce przejściowej do czasu jawnego przypisania schema kategorii.
- Legacy `ProductType`, `ProductTypeAttribute` i `variant_attribute_values` pozostają aktywne dla kompatybilności.

### Jak działa Category Attribute Schema

- Kategoria jest właścicielem definicji dostępnych atrybutów katalogowych.
- Schema określa tylko definicje i flagę required/optional.
- Schema nie przypisuje żadnych wartości do produktu.
- Child category dziedziczy schema parenta na poziomie definicji, a direct wpis childa nadpisuje odziedziczoną definicję tego samego atrybutu.
- Storefront filters i `variant.attributes` nadal działają na istniejącym modelu wariantów; Release 2 ich nie przepina.
- Jeśli kategoria nie ma jeszcze własnego schema po backfillu, system nadal zachowuje legacy `ProductTypeAttribute` jako warstwę kompatybilności i migracji przejściowej.

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

### Jakie testy dodano

- przypisywanie attribute definitions do kategorii w admin flow,
- required/optional flags na schema kategorii,
- unikalność `category_id + attribute_id`,
- dziedziczenie schema po parent category bez dziedziczenia wartości produktu,
- backfill z `product_type_attributes` bez usuwania legacy danych,
- regresja dla storefront variant filters przy równoległym istnieniu category schema.

### Co zostało celowo odłożone

- `ProductAttributeValue`
- walidacja produktu względem required schema przy zapisie produktu
- pełny admin UX do edycji produktu według schema kategorii
- storefront integration nowego schema
- migracja storefront filters z `variant_attribute_values`
- Metafields end-to-end

### Następne kroki

- Podpiąć schema kategorii do przyszłej warstwy `ProductAttributeValue`.
- Dodać walidację produktu względem required category schema przy create/update produktu.
- Dopiero po tym etapowo przepinać admin UX produktu i storefront filters na nowy model danych.

## Release 3 implementation summary

### Co zostało wdrożone

- Dodano model i tabelę `ProductAttributeValue` jako warstwę product-level core attributes.
- `Product` ma teraz relację `attributeValues`, a `Attribute` ma relację `productValues`.
- Create/update produktu waliduje payload `attribute_values` względem resolved `CategoryAttributeSchema`, w tym:
  - required attributes,
  - zgodność typu wartości,
  - select/multiselect tylko dla dozwolonych option values.
- `ProductService` synchronizuje `product_attribute_values` równolegle do istniejącego flow wariantu i nie dotyka legacy `variant_attribute_values`.
- Admin formularz produktu dostał osobną sekcję `Core Attributes`, ładowaną z resolved schema wybranej kategorii.
- Product detail API wystawia nowe pola:
  - `attribute_values`
  - `attribute_summary`
- Zachowano kompatybilność:
  - `attributes: []` nadal istnieje w detail API,
  - `variant.attributes` nie zmieniło shape,
  - filtry storefrontu nadal działają na atrybutach wariantów.

### Jak działają product-level attributes

- Wartości są przypisane do produktu, nie do wariantu.
- Kategoria pozostaje ownerem schema, a produkt zapisuje tylko wartości dla atrybutów dopuszczonych przez schema.
- Brak dziedziczenia wartości z kategorii: sama definicja schema nie tworzy żadnego `ProductAttributeValue`.
- Typy wspierane w Release 3:
  - `text`
  - `numeric`
  - `boolean`
  - `select`
  - `multiselect`
  - `color`
  - `date`
- `select` zapisuje pojedynczy `attribute_value_id`, a `multiselect` zapisuje listę dozwolonych option ids w `value_json`.

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
- `server/app/Data/AdminProductData.php`
- `server/app/Http/Controllers/Api/V1/ProductController.php`
- `server/resources/js/pages/admin/ecommerce/products/core-attributes-section.tsx`
- `server/resources/js/pages/admin/ecommerce/products/core-attributes.types.ts`
- `server/resources/js/pages/admin/ecommerce/products/core-attributes.utils.ts`
- `server/resources/js/pages/admin/ecommerce/products/create.tsx`
- `server/resources/js/pages/admin/ecommerce/products/edit.tsx`
- `server/resources/js/pages/admin/ecommerce/products/create.types.ts`
- `server/resources/js/pages/admin/ecommerce/products/edit.types.ts`
- `server/resources/js/pages/admin/ecommerce/attributes/create.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/create.types.ts`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.types.ts`
- `client/types/api.ts`
- `server/tests/Feature/ProductAttributeValueTest.php`

### Jakie testy dodano

- zapis product-level attribute values w admin flow,
- walidacja required category attributes,
- walidacja typu wartości,
- walidacja dozwolonych option values dla `select` i `multiselect`,
- brak dziedziczenia wartości z category schema,
- `attribute_values` w product detail API,
- kompatybilność z legacy `variant.attributes`,
- kompatybilność default variant i cart flow.

### Co zostało celowo odłożone

- migracja storefront filters z `variant_attribute_values`
- pełna storefront integration sekcji specyfikacji
- przebudowa compare/listing na nowy model product attributes
- usuwanie legacy `ProductTypeAttribute`
- usuwanie legacy `variant_attribute_values`
- Metafields end-to-end

### Następne kroki

- Przepiąć storefront detail na bezpieczne renderowanie `attribute_values`.
- Zaplanować kontrolowaną migrację listing filters z modelu wariantów na product-level attributes.
- Dopiero po stabilizacji kontraktu detail/listing ocenić zakres redukcji legacy `ProductTypeAttribute` i `variant_attribute_values`.

## Release 4 implementation summary

### Co zostało wdrożone

- Storefront detail renderuje specyfikację produktu z `attribute_values`.
- Publiczny kontrakt detail został rozszerzony o `variant_options`, bez usuwania `variant.attributes`.
- `attribute_summary` stało się preferowanym źródłem krótkich specyfikacji na listingach storefrontu.
- `attribute_map` pozostało kompatybilnym payloadem dla compare/listingu, ale jest budowane hybrydowo z product-level attributes i legacy variant attributes.
- Product-level filterable attributes trafiają do `available_filters`, a legacy variant filters nadal pozostają aktywne jako fallback.
- Revalidation produktu obejmuje detail, listing rooty, category/brand pages, search i compare przez event `product.updated`.

### Jak storefront używa product-level attributes

- Detail page pokazuje tylko niepuste specyfikacje z `attribute_values`.
- Atrybuty pokrywające się z `variant_options` nie są renderowane jako core specs, żeby nie mieszać specyfikacji z wyborem wariantu.
- Wybór wariantu nadal zależy od `variant.attributes`, a `variant_options` jest addytywną warstwą kontraktu.
- Listing cards preferują `attribute_summary`, z fallbackiem do legacy `attribute_map`.

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

- legacy variant filters,
- `variant.attributes`,
- add-to-cart / stock / pricing flow oparty o wariant,
- compare/listing payloady oczekujące `attribute_map`,
- brak publicznego end-to-end exposure dla Metafields.

### Jakie testy dodano

- detail API contract dla `variant_options`,
- compare compatibility bez nowych attributes,
- product-level filters w `available_filters`,
- fallback legacy variant filters,
- `product.updated` przy zmianie samych `attribute_values`,
- unit testy storefrontu dla renderingu specyfikacji i fallbacków `attribute_summary` / `attribute_map`.

### Co zostało celowo odłożone

- usuwanie legacy variant filters,
- usuwanie `variant.attributes`,
- end-to-end Metafields,
- pełny cleanup compare/listing payloadów,
- selective legacy removal w modelu wariantów i `ProductTypeAttribute`.

### Następne kroki

- Dodać interakcyjne testy storefrontu dla variant selector i add-to-cart na detail page.
- Rozszerzyć model definicji atrybutów o jawne flagi `is_listable` / `is_comparable`, zamiast wnioskować z obecnego stanu przejściowego.
- Dopiero po stabilizacji danych produkcyjnych zaplanować redukcję `variant_attribute_values` i legacy `attribute_map`.

### Variants

1. Zachować obecny model wariantów
2. Ograniczyć ich semantykę wyłącznie do różnic zakupowych
3. Wyróżnić variant options jako osobną warstwę kontraktu API

### Metafields

1. Dodać visibility flags do definicji
2. Wystawiać publicznie tylko jawne metafields
3. Dodać admin editing w głównych formularzach

## 18. Backward Compatibility Risks

Największe ryzyka:

- istniejący storefront oczekuje `variant.attributes`, nie `attribute_values`
- istniejące filtry opierają się na variant attribute values
- część danych może siedzieć tylko na wariantach, mimo że domenowo powinna być product-level attribute
- istniejące posty mogą mieć `blog_id = null`
- część integracji może czytać ogólny endpoint metafields bez visibility restrictions

Strategia:

- wprowadzać nowe pola kontraktu równolegle
- utrzymać stare pola przez okres przejściowy
- dodać warstwę mapującą legacy data do nowego modelu

## 19. Test Plan

### Blog

- create post bez `blog_id` przypisuje default blog
- istniejące posty bez `blog_id` po migracji dostają default blog
- storefront `/blog` i `/blog/{slug}` działa bez zależności od wyboru bloga

### Category schema

- kategoria może mieć required/optional attributes
- schema może być dziedziczony z parent category, jeśli feature włączony
- wartości nie są dziedziczone

### Product attributes

- produkt nie przechodzi walidacji bez required attributes
- typy wartości są walidowane poprawnie
- filterable attributes pojawiają się w `available_filters`
- comparable/listable attributes renderują się poprawnie

### Variants

- warianty mają unikalne kombinacje option values
- add-to-cart działa na wybranym wariancie
- produkty bez wariantów mają jeden default variant

### Metafields

- admin może edytować wartości metafields dla supported owner types
- public API nie wystawia prywatnych metafields
- storefront renderuje tylko jawnie wystawione metafields

### API contract

- listing response ma spójną strukturę
- detail response rozdziela attributes / variant_options / variants / metafields
- TS types storefrontu odpowiadają realnemu payloadowi

## Release 5 implementation summary

- Wdrożono `visibility` i `storefront_exposed` w `MetafieldDefinition` oraz migrację dla istniejących rekordów.
- Dodano backendowy `MetafieldVisibilityService`, observer dla zmian metafields i kontrolę publicznej widoczności przez definicję, nie przez sam payload.
- Admin formularze `Product`, `Category`, `Page` i `BlogPost` mają osobną sekcję `Metafields` opartą o definicje, z walidacją typów i bez mieszania z core fields, variants ani SEO.
- Publiczne API zwraca tylko metafields jawnie publiczne (`storefront` lub `storefront_exposed=true`), a endpoint `GET /api/v1/metafields/{type}/{id}` nie ujawnia adminowych danych.
- Storefront renderuje tylko allowlistowane metafields z dedykowanych komponentów; brak automatycznego renderowania całego zbioru.
- Zmiana publicznego metafield invaliduje owner detail page przez webhook/revalidation; zmiana prywatnego metafield nie musi ruszać storefront cache.
- Dodano testy dla zapisu metafields z formularzy admina, walidacji typów, filtrowania public API i braku automatycznego renderowania prywatnych danych.
- Metafields nie powinny przechowywać: SKU, stock, price, compare_at_price, variant options, membership w kategoriach, core attributes, SEO core fields, tax/shipping data ani checkout-critical data.
- Kolejny krok: doprecyzować allowlisty rendererów storefront dla konkretnych namespace/key pairs, jeśli pojawią się nowe publiczne use case’y.
