# Release 3 Review

## 1. Czy Release 3 jest zaakceptowany?

Warunkowo tak.

Backend + admin dla `ProductAttributeValue` zostały wdrożone zgodnie z celem Release 3 i po poprawkach z tego review nie widzę breaking change w publicznym API produktu ani w legacy `variant.attributes`.

Nie rekomenduję jednak wypychać całego aktualnego diffu jako jednego releasu bez odseparowania zmian poza zakresem w:

- `client/app/sitemap.ts`
- `client/package.json`

## 2. Co zostało wykonane poprawnie?

- Dodano product-level core attributes przez nową tabelę/model `product_attribute_values`.
- Dodano relacje `Product -> attributeValues` oraz `Attribute -> productValues`.
- Walidacja produktu jest spięta z Category Attribute Schema:
  - required attributes są wymagane,
  - wartości są sprawdzane względem typu,
  - `select` / `multiselect` akceptują tylko dozwolone option values,
  - wartości spoza schema kategorii są odrzucane.
- Wartości produktu nie są dziedziczone z kategorii; kategoria definiuje tylko schema.
- Legacy warstwa wariantów została zachowana:
  - `VariantAttributeValue` nie zostało usunięte,
  - `variant.attributes` nadal jest zwracane,
  - `attributes: []` nadal jest utrzymane w product detail API.
- Admin produktu dostał osobną sekcję `Core Attributes`:
  - required fields są oznaczone,
  - inputy wynikają z typu atrybutu,
  - core attributes są oddzielone od wariantów.
- API produktu zostało rozszerzone addytywnie o:
  - `attribute_values`
  - `attribute_summary`
- Dodano sensowne testy backendowe dla:
  - zapisu core attributes,
  - required attributes,
  - type validation,
  - select/multiselect option validation,
  - braku dziedziczenia wartości,
  - API detail,
  - kompatybilności z wariantami i koszykiem.

## 3. Co jest błędne?

W trakcie review były 2 realne błędy Release 3 i zostały poprawione:

- `server/app/Http/Controllers/Api/V1/ProductController.php`
  - `attribute_summary` gubiło wartość `false`, bo `(string) false` dawało pusty string.
  - Poprawione przez jawne formatowanie boolean do `'true'` / `'false'`.
- `server/app/Http/Requests/Admin/Ecommerce/StoreAttributeRequest.php`
- `server/app/Http/Requests/Admin/Ecommerce/UpdateAttributeRequest.php`
- `server/resources/js/pages/admin/ecommerce/attributes/create.tsx`
- `server/resources/js/pages/admin/ecommerce/attributes/edit.tsx`
  - po dodaniu typów `boolean` i `date` admin nadal pozwalał oznaczać je jako `is_filterable` i `is_variant_selection`, mimo że storefront filters i legacy variant layer nadal działają tylko na dyskretnych option-based attributes.
  - Dodałem guardrails w backend validation i w UI.

Pozostaje 1 problem poza samym Release 3:

- `client/app/sitemap.ts`
  - zawiera debugowe `console.log(...)` i poluzowanie typu do `any`.
  - To nie jest część Release 3 i nie powinno wejść do tego deployu.

## 4. Czy zakres został przekroczony?

Tak, ale nie przez sam rdzeń Release 3.

Implementacja `ProductAttributeValue backend + admin` trzyma się zakresu. Natomiast w aktualnym worktree są dodatkowe zmiany poza zakresem:

- `client/app/sitemap.ts`
- `client/package.json`

`client/package.json` zmienia strategię buildu storefrontu na `next build --webpack`, co jest zmianą operacyjną, a nie elementem Release 3.

## 5. Czy są breaking changes?

Nie widzę breaking change w publicznym API produktu:

- `attribute_values` i `attribute_summary` zostały dodane addytywnie,
- `attributes: []` zostało zachowane,
- `variant.attributes` zostało zachowane,
- legacy warianty, koszyk i checkout nie zostały przebudowane.

Ryzyko operacyjne jest tylko wokół zmian poza zakresem:

- `client/app/sitemap.ts`
- `client/package.json`

## 6. Czy testy są wystarczające?

Częściowo tak.

Na plus:

- coverage backendu dla głównych reguł biznesowych Release 3 jest dobra,
- są testy API i kompatybilności z wariantami/koszykiem,
- podczas review dodałem test dla poprawnej serializacji `false` w `attribute_summary`,
- podczas review dodałem test blokujący nieobsługiwane użycie `boolean/date` jako filter/variant attributes.

Braki:

- brak testów UI/admin dla zachowania sekcji `Core Attributes`,
- brak testów frontendowych potwierdzających guardrails w formularzu admina,
- w tej sesji nie mogłem ponownie uruchomić Dockera i pełnej weryfikacji, bo dostęp do Dockera kończy się `permission denied`.

## 7. Co trzeba poprawić przed storefront integration?

- Nie łączyć Release 3 z niepowiązanymi zmianami w `client/app/sitemap.ts`.
- Nie łączyć Release 3 z wymuszeniem `next build --webpack`, jeśli to nie jest osobna, świadoma decyzja techniczna.
- Uruchomić ponownie w Dockerze:
  - relewantne testy backendu,
  - pełny backend suite,
  - TypeScript checks,
  - build backend/admin i storefrontu.
- Dodać przynajmniej lekkie testy admin UI dla:
  - renderowania `Core Attributes`,
  - przełączania category -> schema,
  - blokady `is_filterable` / `is_variant_selection` dla typów niedyskretnych.
- Przed storefront integration ustalić docelowy kontrakt renderowania:
  - jak prezentować `boolean`,
  - jak prezentować `date`,
  - czy storefront ma korzystać z `attribute_values`, `attribute_summary`, czy obu pól.
