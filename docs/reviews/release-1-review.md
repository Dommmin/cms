# Release 1 Review

Data: 2026-06-12

## 1. Czy Release 1 jest zaakceptowany?

Nie jeszcze.

Kod po review mieści się w zakresie Release 1 i nie wygląda na breaking dla storefrontu, ale brakuje wiarygodnie zakończonych quality gates. W momencie review kontenery Docker były zatrzymane, więc nie dało się potwierdzić Pest, Pint, Larastan/PHPStan ani TypeScript check w docelowym środowisku.

## 2. Co zostało wykonane poprawnie?

- Zakres funkcjonalny został utrzymany w obrębie Blog simplification i Attribute normalization.
- Nie wdrożono `Category Attribute Schema`.
- Nie dodano `ProductAttributeValue`.
- Nie wdrożono Metafields end-to-end.
- Nie znaleziono zmian w koszyku ani checkout.
- Nie usunięto `ProductType`, `ProductTypeAttribute` ani `VariantAttributeValue`.
- Nie zmieniono shape `variant.attributes`.
- Nie usunięto `attributes: []` z product detail API.
- Blog:
  - dodano resolver domyślnego bloga: [server/app/Services/DefaultBlogResolver.php](/Users/domin/projects/laravel/cms/server/app/Services/DefaultBlogResolver.php)
  - `BlogPost` przypisuje default blog przy create bez `blog_id`: [server/app/Models/BlogPost.php](/Users/domin/projects/laravel/cms/server/app/Models/BlogPost.php)
  - dodano backfill dla istniejących postów bez bloga: [server/database/migrations/2026_06_12_090000_backfill_default_blog_for_blog_posts.php](/Users/domin/projects/laravel/cms/server/database/migrations/2026_06_12_090000_backfill_default_blog_for_blog_posts.php)
  - admin create/edit postów nadal nie wymaga wyboru bloga: [server/resources/js/pages/admin/blog/posts/create.tsx](/Users/domin/projects/laravel/cms/server/resources/js/pages/admin/blog/posts/create.tsx), [server/resources/js/pages/admin/blog/posts/edit.tsx](/Users/domin/projects/laravel/cms/server/resources/js/pages/admin/blog/posts/edit.tsx)
- Attributes:
  - enum, model i migracje są spójne dla `text`, `numeric`, `select`, `multiselect`, `color`: [server/app/Enums/AttributeTypeEnum.php](/Users/domin/projects/laravel/cms/server/app/Enums/AttributeTypeEnum.php), [server/app/Models/Attribute.php](/Users/domin/projects/laravel/cms/server/app/Models/Attribute.php), [server/database/migrations/2026_01_31_221512_create_attributes_table.php](/Users/domin/projects/laravel/cms/server/database/migrations/2026_01_31_221512_create_attributes_table.php)
  - znormalizowano `number -> numeric`, `label -> slug`, `color_code -> color_hex`: [server/app/Http/Requests/Admin/Ecommerce/Concerns/NormalizesAttributePayload.php](/Users/domin/projects/laravel/cms/server/app/Http/Requests/Admin/Ecommerce/Concerns/NormalizesAttributePayload.php)
  - backend zapisuje realne pola tabeli `attribute_values`: [server/app/Http/Controllers/Admin/Ecommerce/AttributeController.php](/Users/domin/projects/laravel/cms/server/app/Http/Controllers/Admin/Ecommerce/AttributeController.php)
  - admin UI wysyła payload zgodny z backendem: [server/resources/js/pages/admin/ecommerce/attributes/create.tsx](/Users/domin/projects/laravel/cms/server/resources/js/pages/admin/ecommerce/attributes/create.tsx), [server/resources/js/pages/admin/ecommerce/attributes/edit.tsx](/Users/domin/projects/laravel/cms/server/resources/js/pages/admin/ecommerce/attributes/edit.tsx)

## 3. Co jest błędne?

- Quality gates nie zostały realnie domknięte.
  - W poprzednim wdrożeniu uruchomiono tylko `php -l`, a nie pełne testy i narzędzia wymagane przez zakres.
  - W trakcie review kontenery Docker były już zatrzymane (`docker compose ps` zwrócił pusty stan), więc nie dało się potwierdzić działania w środowisku aplikacji.
- Test coverage nadal nie domyka całego wymaganego zachowania:
  - brak end-to-end testu potwierdzającego, że podstawowy admin flow tworzenia posta nie wymaga wyboru bloga,
  - brak nowego testu kompatybilności dla `/api/v1/blogs/*` po zmianach Release 1; są starsze testy endpointów, ale nie ma testu regresyjnego spiętego z default-blog flow,
  - brak testu admin payload -> backend validation dla ekranu edit/create atrybutów na poziomie Inertia/UI.
- W trakcie review znaleziono i poprawiono dwie luki Release 1:
  - brak walidacji duplikatów `values.*.slug` w jednym payloadzie mógł kończyć się błędem bazy zamiast błędem walidacji,
  - ekran edit atrybutu sugerował usuwanie istniejących `AttributeValue`, mimo że backend Release 1 nie wspierał bezpiecznego usuwania persistowanych wartości.
  - Poprawki są w [server/app/Http/Requests/Admin/Ecommerce/StoreAttributeRequest.php](/Users/domin/projects/laravel/cms/server/app/Http/Requests/Admin/Ecommerce/StoreAttributeRequest.php), [server/app/Http/Requests/Admin/Ecommerce/UpdateAttributeRequest.php](/Users/domin/projects/laravel/cms/server/app/Http/Requests/Admin/Ecommerce/UpdateAttributeRequest.php), [server/resources/js/pages/admin/ecommerce/attributes/edit.tsx](/Users/domin/projects/laravel/cms/server/resources/js/pages/admin/ecommerce/attributes/edit.tsx).

## 4. Czy zakres został przekroczony?

Nie znalazłem przekroczenia zakresu.

- Brak wdrożenia Category-owned schema.
- Brak `ProductAttributeValue`.
- Brak przebudowy storefront filters.
- Brak zmian kontraktu `variant.attributes`.
- Brak zmian w cart/checkout.

## 5. Czy są breaking changes?

Statycznie nie widać breaking changes.

- `variant.attributes` pozostaje używane przez storefront detail/wishlist/compare.
- `attributes: []` pozostaje w product detail API.
- `/api/v1/blogs/*` nie zostało usunięte ani przebudowane.
- `/api/v1/blog/posts` nadal jest primary public feed.

Jednocześnie brak zakończonych testów runtime oznacza, że nie można jeszcze zamknąć tematu z pełną pewnością operacyjną.

## 6. Czy testy są wystarczające?

Nie.

- Dodano sensowne testy jednostkowo-funkcyjne dla:
  - default blog assignment,
  - backfill blog posts bez `blog_id`,
  - normalizacji typów i pól atrybutów,
  - zachowania `variant.attributes` i filtrów.
- To jednak nadal za mało do akceptacji release:
  - nie ma potwierdzonego uruchomienia relewantnych Pest suites,
  - nie ma potwierdzonego Pint,
  - nie ma potwierdzonego Larastan/PHPStan,
  - nie ma potwierdzonego TypeScript check,
  - build nie został uruchomiony i słusznie nie był wymuszany przy aktywnym dev serverze, ale brak jasnego alternatywnego potwierdzenia frontendowego zachowania.

## 7. Co trzeba poprawić przed Release 2?

- Postawić działające kontenery i realnie uruchomić:
  - backend releasowe Pest suites,
  - Pint,
  - Larastan/PHPStan, jeśli skonfigurowane,
  - frontend `npm run types`.
- Dodać brakujące testy regresyjne:
  - admin create post bez wyboru bloga,
  - regresja kompatybilności `/api/v1/blogs/*` w połączeniu z default blog flow,
  - payload create/edit atrybutów na poziomie request/controller dla edge-case'ów.
- Przed Release 2 nie zakładać, że Release 1 jest w pełni zamknięty operacyjnie, dopóki quality gates nie przejdą w Dockerze.
