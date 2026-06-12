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
