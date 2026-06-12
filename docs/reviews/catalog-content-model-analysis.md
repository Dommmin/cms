# Catalog & Content Model Analysis

Data: 2026-06-12

## Zakres

Analiza opiera się na aktualnym kodzie backendu, admina, API i storefrontu oraz na wcześniejszym raporcie `docs/reviews/application-discovery.md`.

Przejrzane zostały w szczególności:

- modele i migracje dla produktów, kategorii, atrybutów, wariantów, bloga i metafields
- kontrolery admin/API
- requesty walidacyjne
- resources API
- formularze admina
- użycie danych po stronie storefrontu

## Executive Summary

Aktualny system nie ma jeszcze jednego spójnego modelu dla:

- core attributes produktu
- category-specific attribute schema
- variant options
- extension layer metafields

Najważniejsze fakty:

- atrybuty istnieją, ale są spięte z `ProductType`, nie z `Category`
- produkt nie ma modelu wartości atrybutów na poziomie produktu
- wartości atrybutów są dziś przechowywane wyłącznie na poziomie wariantu przez `variant_attribute_values`
- storefront filtruje i porównuje produkty na podstawie atrybutów wariantów
- formularz produktu w adminie nie edytuje żadnych wartości atrybutów
- formularz kategorii nie edytuje schematu atrybutów ani nawet `product_type_id`
- metafields mają działający backend i API, ale nie są dopięte do głównych formularzy admina ani do głównych flow storefrontu
- blog jest technicznie multi-blog, ale storefront i główny flow publiczny działają jak single-blog

To oznacza, że obecna architektura jest funkcjonalna dla:

- katalogu wariantowego
- filtrów listingowych
- pojedynczego publicznego bloga

ale jest niespójna dla:

- modelowania specyfikacji produktu niebędącej wariantem
- per-category schema
- rozgraniczenia attributes vs variants vs metafields

## Odpowiedzi na pytania

### 1. Jak obecnie działają product attributes?

Obecny model atrybutów składa się z:

- `Attribute`
- `AttributeValue`
- `ProductTypeAttribute`
- `VariantAttributeValue`

Rzeczywista logika jest taka:

- definicja atrybutu istnieje globalnie w `attributes`
- predefiniowane wartości istnieją w `attribute_values`
- przypięcie atrybutu do schematu odbywa się przez `product_type_attributes`
- faktyczna wartość przypisana do produktu istnieje dopiero na wariancie przez `variant_attribute_values`

W praktyce oznacza to:

- system umie modelować atrybuty wyboru i używać ich jako opcji wariantu
- system nie ma osobnej warstwy product-level attribute values dla danych typu specyfikacja / parametry / skład / kompatybilność

### 2. Czy atrybuty są przypisane do produktów?

Nie bezpośrednio.

Produkt ma:

- `product_type_id`
- `variants`

Wartości atrybutów są przypisane do `ProductVariant`, nie do `Product`.

Po stronie modelu nie znaleziono relacji typu:

- `product_attribute_values`
- `product.attributes`
- `product.attributeValues`

### 3. Czy atrybuty są przypisane do kategorii?

Nie jako pierwszy-class schema.

`Category` ma kolumnę `product_type_id`, ale:

- formularze kategorii nie eksponują `product_type_id`
- `StoreCategoryRequest` i `UpdateCategoryRequest` nie walidują `product_type_id`
- kontroler kategorii nie zapisuje tego pola z admin flow

W praktyce aktywny admin kategorii nie zarządza schematem atrybutów.

### 4. Czy kategorie definiują schemat atrybutów?

Nie.

Najbliższy istniejący mechanizm to:

- `ProductType`
- pivot `product_type_attributes` z `is_required`

To znaczy:

- schemat jest dziś przywiązany do `ProductType`
- nie do `Category`

Dodatkowo admin `ProductType` nie udostępnia edycji listy atrybutów ani `variant_selection_attributes`, więc nawet ten schemat nie jest domknięty w UI.

### 5. Czy wartości atrybutów są filtrowalne?

Tak, ale tylko przez wartości atrybutów wariantu.

`Api\V1\ProductController`:

- przyjmuje `filter[attributes][slug]=value1,value2`
- filtruje przez `activeVariants.attributeValues`
- generuje `available_filters` z atrybutów, które mają `is_filterable = true`

Storefront:

- `client/api/products.ts` buduje parametry `filter[attributes][...]`
- `client/app/products/ProductsClient.tsx` renderuje filtry atrybutów z `meta.available_filters`

### 6. Czy atrybuty są używane na storefront?

Tak, ale w dwóch konkretnych rolach:

- filtry listingowe
- wybór wariantu i porównanie

Storefront używa:

- `variant.attributes` na detail page
- `attribute_map` na listingach i porównaniu

Nie znaleziono product-level attribute table renderowanej z pełnego, spójnego API specyfikacji produktu.

### 7. Jak obecnie działają warianty produktów?

Warianty są pełnoprawną warstwą zakupową.

`ProductVariant` ma własne:

- SKU
- price
- compare_at_price
- stock_quantity
- backorder/pre-order state
- barcode / ean / upc
- images
- downloads
- price tiers

Koszyk, wishlist, checkout i order flows pracują na `variant_id`.

### 8. Czy warianty mają własne SKU, cenę, stock i opcje?

Tak.

To jest jeden z bardziej spójnych fragmentów architektury.

Opcje wariantu są modelowane przez:

- `VariantAttributeValue`
- relacje do `Attribute` i `AttributeValue`

Storefront detail page wybiera konkretny wariant przez zestaw `variant.attributes`.

### 9. Jak obecnie działają metafields?

Metafields są zaimplementowane jako polymorphic extension layer:

- `metafields` z `owner_type` / `owner_id`
- definicje w `metafield_definitions`
- trait `HasMetafields`

Obsługiwane owner types w kodzie admin/API:

- product
- blog-post
- page
- category

Typy danych w walidacji sync endpointu obejmują m.in.:

- string
- integer
- float
- boolean
- json
- date
- datetime
- url
- color
- image
- rich_text

Aktualny model definicji nie ma public-visibility flags typu `storefront_exposed`.

### 10. Czy metafields są używane w adminie?

Częściowo.

Istnieją:

- CRUD definicji metafields
- endpoint `admin.metafields.sync`
- komponent `metafield-editor.tsx`

Nie znaleziono natomiast użycia `MetafieldEditor` w głównych formularzach:

- produktu
- kategorii
- strony
- blog posta

Czyli:

- admin ma warstwę techniczną
- ale nie ma dopiętego głównego UX do edycji wartości

### 11. Czy metafields są używane w API?

Tak.

Jest publiczny endpoint:

- `/api/v1/metafields/{type}/{id}`

Testy `server/tests/Feature/MetafieldTest.php` potwierdzają działanie:

- set/get
- casted values
- publiczny odczyt

### 12. Czy metafields są używane na storefront?

Nie znaleziono istotnego użycia w głównych ścieżkach storefrontu.

W szczególności nie znaleziono:

- renderowania metafields na product detail
- renderowania metafields na category page
- renderowania metafields w blog postach
- ogólnego klienta API metafields używanego w głównych ekranach

### 13. Czy metafields dublują obecne attributes/options/settings/SEO?

Potencjalnie tak, bo obecna architektura nie narzuca jasnych granic.

Fakty z kodu:

- `Product`, `Category`, `BlogPost`, `Page` mają już własne SEO fields
- atrybuty istnieją jako osobny model katalogowy
- warianty mają własny model opcji zakupowych
- metafields nie mają guardrails uniemożliwiających użycie ich do danych core

Dodatkowo w testach metafields pojawiają się przykłady typu:

- canonical_url
- variants_config
- weight

To pokazuje, że obecna warstwa metafields jest bardzo ogólna i łatwo nią zdublować model domenowy.

### 14. Jak działa obecnie Blog + BlogPost?

Backend wspiera dwa poziomy:

- `Blog`
- `BlogPost`

API wspiera:

- listę blogów
- jeden blog po slug
- posty dla konkretnego bloga
- globalny listing postów
- pojedynczy post po slug

Admin:

- ma CRUD blogów
- ma CRUD blog postów

Jednak:

- `StoreBlogPostRequest` i `UpdateBlogPostRequest` nie walidują `blog_id`
- formularz tworzenia/edycji posta nie eksponuje wyboru bloga
- `BlogPostController` zapisuje post bez automatycznego ustawiania `blog_id`

W efekcie post może zostać zapisany bez bloga.

### 15. Czy multi-blog jest realnie używany end-to-end?

Nie.

Technicznie backend i API wspierają multi-blog.

Ale publiczny storefront działa jak single-blog:

- listing postów idzie przez globalne `getBlogPosts()`
- routing publiczny to `/blog` i `/blog/{slug}`
- `BlogModule` nie używa `page.module_config.blog_id`
- `StorefrontPathService` buduje URL wpisu na bazie globalnego `blog_listing`

Wniosek:

- multi-blog istnieje jako warstwa techniczna
- nie jest spójnie wykorzystywany end-to-end

## Dodatkowe ustalenia architektoniczne

### Atrybuty: niespójności implementacyjne

W obecnym kodzie są twarde sprzeczności:

1. `AttributeTypeEnum` i migracja `attributes` wspierają:
   - `text`
   - `select`
   - `multiselect`
   - `numeric`
   - `color`

2. Requesty admina dla atrybutów walidują:
   - `text`
   - `number`
   - `boolean`
   - `select`
   - `color`
   - `date`

To oznacza, że kontrakt UI/request ≠ enum/model/migration.

3. `AttributeController::store()` tworzy wartości atrybutu z polami:
   - `label`
   - `color_code`

ale model/migracja `attribute_values` mają:

- `slug`
- `color_hex`

To jest kolejna potwierdzona niespójność warstwy atrybutów.

4. Formularze admin atrybutów nie eksponują:
   - unit
   - values
   - position

czyli request i kontroler są bogatsze niż realny UI.

### Product Type: częściowo wdrożony schema owner

`ProductType` wygląda jak obecny owner schematu katalogowego:

- `has_variants`
- `variant_selection_attributes`
- `product_type_attributes`

Ale admin `ProductType` aktualnie pozwala tylko edytować:

- name
- slug
- has_variants
- is_shippable

Bez:

- przypisywania atrybutów
- ustawiania `is_required`
- ustawiania `variant_selection_attributes`

### Category: ukryta, ale nieaktywna warstwa typów

`categories` mają `product_type_id` w bazie i modelu, ale aktywny flow admina tego nie obsługuje.

To oznacza:

- kategoria ma ślad po planowanym schema ownership
- ale aktualnie nie jest to rzeczywiście używana część produktu

### Product form: brak miejsca na core specs

Formularze produktu `create/edit` obsługują:

- name
- slug
- description
- category
- product type
- brand
- flags
- default variant
- images
- SEO

Nie obsługują:

- wartości atrybutów produktu
- przypisania schematu wynikającego z kategorii
- metafields

To jest główny powód, dla którego obecny system nie ma spójnego modelu content/catalog editing.

### API contract: niespójność product detail

Na detail endpointcie produktu:

- `attributes` są zwracane jako pusta tablica `[]`
- realna informacja o opcjach siedzi w `variants[*].attributes`

To oznacza, że publiczny kontrakt produktu nie rozróżnia dziś jasno:

- core attributes produktu
- selectable variant options

## Wnioski

### Co działa dobrze

- wariant jako nośnik SKU/ceny/stocku
- filtracja storefrontu po atrybutach wariantów
- koszyk/checkout oparty o `variant_id`
- blog jako pojedynczy publiczny flow `/blog`
- backendowa warstwa metafields jako extension mechanism

### Co jest strukturalnie niekompletne

- category-owned attribute schema
- product-level attribute values
- rozgraniczenie attribute vs variant option vs metafield
- admin UX do edycji tych danych
- spójny publiczny API contract dla produktu

### Decyzja wynikająca z analizy

Najbezpieczniejszy kierunek docelowy:

- uprościć blog do single-blog by default
- przenieść ownership schematu atrybutów z `ProductType` na `Category`
- zostawić wariant jako nośnik danych zakupowych
- dodać product-level attribute values dla specyfikacji i filtrów
- zostawić metafields jako extension layer, nie core catalog model
