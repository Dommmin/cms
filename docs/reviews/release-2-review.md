# Release 2 Review

Data: 2026-06-12

## 1. Czy Release 2 jest zaakceptowany?

Nie jeszcze.

Implementacja mieści się w zakresie Release 2 backend-only i statycznie nie wygląda na breaking dla storefrontu ani ecommerce runtime, ale:

- nie ma zakończonych quality gates,
- `Category Attribute Schema` jest dziś wdrożone głównie jako warstwa danych i admin backend handling,
- aktywne workflow produktu nadal nie używają nowego schema do żadnej realnej walidacji ani logiki produktu.

To oznacza, że Release 2 jest dobrym foundation, ale jeszcze nie jest domknięty operacyjnie.

## 2. Co zostało wykonane poprawnie?

- Zakres został utrzymany jako `Category Attribute Schema` backend-only.
- Nie dodano `ProductAttributeValue`.
- Nie przebudowano storefront filters.
- Nie usunięto `ProductTypeAttribute`.
- Nie znaleziono zmian w koszyku ani checkout.
- Nie znaleziono breaking change w publicznym product API.
- `variant.attributes` i top-level `attributes: []` pozostały bez zmian.
- Dodano nową warstwę danych:
  - model [server/app/Models/CategoryAttributeSchema.php](/Users/domin/projects/laravel/cms/server/app/Models/CategoryAttributeSchema.php)
  - migracja [server/database/migrations/2026_06_12_130000_create_category_attribute_schemas_table.php](/Users/domin/projects/laravel/cms/server/database/migrations/2026_06_12_130000_create_category_attribute_schemas_table.php)
- `Category` dostała relacje i inheritance helper: [server/app/Models/Category.php](/Users/domin/projects/laravel/cms/server/app/Models/Category.php)
- Admin backend kategorii przyjmuje spójny payload `attribute_schema` i waliduje duplikaty: [server/app/Http/Requests/Admin/Ecommerce/StoreCategoryRequest.php](/Users/domin/projects/laravel/cms/server/app/Http/Requests/Admin/Ecommerce/StoreCategoryRequest.php), [server/app/Http/Requests/Admin/Ecommerce/UpdateCategoryRequest.php](/Users/domin/projects/laravel/cms/server/app/Http/Requests/Admin/Ecommerce/UpdateCategoryRequest.php)
- Category schema wspiera:
  - przypisanie definicji atrybutu do kategorii,
  - `is_required`,
  - `position`,
  - unikalność `category_id + attribute_id`,
  - dziedziczenie definicji po parent category bez dziedziczenia wartości produktu.
- Backfill z `product_type_attributes` jest bezpieczny i nie usuwa legacy danych.
- Testy kompatybilności storefront variant filters zostały utrzymane i rozszerzone: [server/tests/Feature/Api/ProductAttributeFilterTest.php](/Users/domin/projects/laravel/cms/server/tests/Feature/Api/ProductAttributeFilterTest.php)

## 3. Co jest błędne?

- `Category` jest właścicielem schema tylko strukturalnie, ale jeszcze nie operacyjnie.
  - Nowy schema jest zapisywany i odczytywany na kategorii, ale aktywny flow produktu nadal nie korzysta z niego przy create/update produktu.
  - W praktyce `ProductType` nadal pozostaje jedyną warstwą, która historycznie wpływa na realny model produktu, a nowy schema nie ma jeszcze konsumenta poza admin backend kategorii.
- Brakuje runtime verification.
  - Nie ma potwierdzonego uruchomienia relewantnych testów backendowych ani quality gates.
- Testy nie domykają całego zachowania schema:
  - brak testu override tego samego atrybutu w child category nad inherited row parenta,
  - brak testu potwierdzającego kolejność `position` w resolved schema,
  - brak testu request/controller dla edge-case typu czyszczenie istniejącego direct schema do pustej listy.

## 4. Czy zakres został przekroczony?

Nie widzę przekroczenia zakresu.

- Brak `ProductAttributeValue`.
- Brak przebudowy storefront filters.
- Brak zmian w publicznym kontrakcie produktu.
- Brak zmian cart/checkout.
- Brak usunięcia `ProductTypeAttribute`, `ProductType` i legacy variant attributes.

## 5. Czy są breaking changes?

Statycznie nie widać breaking changes.

- [server/app/Http/Controllers/Api/V1/ProductController.php](/Users/domin/projects/laravel/cms/server/app/Http/Controllers/Api/V1/ProductController.php) nadal zwraca:
  - `attributes: []`
  - `variants[*].attributes`
- istniejące variant filters nadal opierają się o `VariantAttributeValue`,
- istniejące produkty powinny renderować się tak jak wcześniej, bo Release 2 nie przepiął storefrontu na nowy model.

Jednocześnie brak uruchomionych testów runtime oznacza, że to nadal ocena statyczna, nie operacyjna.

## 6. Czy testy są wystarczające?

Nie jeszcze.

- Na plus:
  - są testy required/optional,
  - jest test unikalności,
  - jest test dziedziczenia schema,
  - jest test braku dziedziczenia wartości produktu,
  - jest test backfillu i kompatybilności z legacy `ProductTypeAttribute`,
  - jest regresja dla variant filters.
- Nadal brakuje:
  - uruchomienia relewantnych Pest suites,
  - testu override parent/child dla tego samego atrybutu,
  - testu kolejności `position` w resolved schema,
  - pełnego potwierdzenia jakości przez Pint i Larastan/PHPStan.

## 7. Co trzeba poprawić przed Release 3?

- Uruchomić relewantne backend tests i quality gates w docelowym środowisku Docker.
- Dodać brakujące testy regresyjne:
  - override inherited schema przez child,
  - ordering po `position`,
  - edge-case synchronizacji pustego direct schema.
- Jasno domknąć przejście roli ownera schema:
  - w Release 3 produkt powinien zacząć realnie czytać category schema,
  - dopiero wtedy `ProductType` przestanie być de facto główną warstwą schematu produktu.
- Zachować obecną kompatybilność storefrontu do czasu wdrożenia `ProductAttributeValue` i kontrolowanej migracji filtrów.
