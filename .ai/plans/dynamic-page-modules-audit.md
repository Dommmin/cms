# Plan po audycie: pełne przejście na dynamiczne strony modułowe

Data audytu: 2026-06-03

## Cel

Doprowadzić storefront i CMS do jednego spójnego modelu:

- edytor tworzy stronę w CMS,
- przypisuje do niej moduł,
- storefront renderuje listing lub detail pod slugiem tej strony,
- nie ma twardo zaszytych ścieżek typu `/products`, `/blog`, `/categories`, `/brands` jako jedynego źródła prawdy.

To samo podejście ma obowiązywać dla:

- bloga,
- produktów,
- kategorii,
- marek,
- kolejnych listingów domenowych, jeśli istnieją lub dojdą później.

## Stan obecny po audycie

### 1. Mechanizm dynamicznych stron istnieje, ale jest wdrożony tylko częściowo

- `server/app/Models/Page.php` ma `page_type`, `module_name`, `page_module_id`, `module_layout_id`, `module_configuration`.
- `server/app/Http/Controllers/Api/V1/PageController.php` zwraca stronę po dynamicznym slugu.
- `client/app/[locale]/[...slug]/page.tsx` i `client/app/_routes/cms-dynamic-page.tsx` potrafią renderować stronę CMS po ścieżce.

### 2. Rejestr modułów CMS nie obejmuje e-commerce

- `server/config/cms/modules.php` zawiera tylko:
  - `content`
  - `faq`
  - `blog`
- Brakuje modułów dla:
  - produktów,
  - kategorii,
  - marek,
  - detali produktu/kategorii/marki lub ich wariantów.

Skutek:

- w panelu CMS nie da się legalnie utworzyć strony modułowej dla tych obszarów,
- `StorePageRequest` i `UpdatePageRequest` walidują `module_name` tylko względem `config('cms.modules')`.

### 3. Frontend renderer modułów też jest niepełny

- `client/components/page-builder/module-renderer.tsx` obsługuje tylko:
  - `content`
  - `faq`
  - `blog`
- Brak rendererów dla e-commerce.

Skutek:

- nawet gdyby CMS zwrócił stronę modułu e-commerce, storefront i tak jej nie wyrenderuje.

### 4. Blog jest częściowo zintegrowany dynamicznie, ale nadal ma legacy fallbacki

- `client/components/page-builder/modules/blog-module.tsx` renderuje listing bloga z CMS page.
- `client/app/_routes/cms-dynamic-page.tsx` ma specjalny fallback: jeśli CMS page nie istnieje, próbuje potraktować końcówkę ścieżki jako wpis bloga.
- Jednocześnie nadal istnieją sztywne trasy:
  - `client/app/blog/[slug]/page.tsx`
  - blog RSS i sitemap nadal zakładają `/blog`

Skutek:

- blog działa hybrydowo,
- routing i SEO nie są jeszcze w pełni oparte o CMS page jako źródło prawdy.

### 5. Produkty są nadal obsługiwane sztywno

- listing ma osobną trasę:
  - `client/app/products/page.tsx`
  - `client/app/[locale]/products/page.tsx`
  - shared route: `client/app/_routes/products-page.tsx`
- listing klienta jest spięty pod stały path `/products`:
  - `client/app/products/ProductsClient.tsx`
- detail produktu też jest sztywny:
  - `client/app/products/[slug]/page.tsx`
  - `client/app/[locale]/products/[slug]/page.tsx`

Skutek:

- nie da się przypisać listingu produktów do dowolnej strony CMS,
- nie da się zmienić bazowego slugu bez zmian w kodzie,
- breadcrumbs, linki, SEO i wyszukiwarka zakładają `/products`.

### 6. Kategorie są nadal potraktowane jako filtr, nie jako modułowa strona

- API ma:
  - `GET /categories`
  - `GET /categories/{slug}`
  - `GET /categories/{slug}/products`
- storefront kieruje kategorie do `/products?category=...` zamiast do własnej strony CMS.
- przykłady:
  - `client/components/layout/search-bar.tsx`
  - `client/app/products/[slug]/ProductDetailClient.tsx`

Skutek:

- kategoria nie jest pełnoprawnym bytem routowanym przez CMS,
- brak dynamicznej strony kategorii z własnym layoutem modułowym,
- brak możliwości zrobienia wielu typów listingów kategorii przez CMS.

### 7. Marki nie są podpięte pod własne strony

- API brandów ma tylko listę `GET /brands` w `server/routes/api/ecommerce.php`.
- `server/app/Http/Controllers/Api/V1/BrandController.php` zwraca wyłącznie listing.
- brak:
  - `GET /brands/{slug}`
  - `GET /brands/{slug}/products`
  - odpowiadających stron CMS i rendererów.

Skutek:

- marka nie istnieje jako dynamiczna strona treściowa/listingowa,
- nie da się zbudować strony brandowej sterowanej z CMS.

### 8. Seedery sugerują architekturę, której runtime jeszcze nie obsługuje

- `server/database/seeders/PagesDemoSeeder.php` tworzy strony modułowe:
  - `blog`
  - `shop` / `sklep`
  - `categories` / `kategorie`
  - `brands` / `marki`
- dla e-commerce seeder ustawia `module_name = 'ecommerce'`.

Skutek:

- dane demo już zakładają moduł e-commerce,
- ale `server/config/cms/modules.php` i frontend nie obsługują `ecommerce`,
- część architektury jest deklaratywna, ale nie jest dokończona.

### 9. SEO, sitemap i linkowanie nadal zakładają sztywne ścieżki

- `client/app/sitemap.ts` na sztywno dodaje:
  - `/products`
  - `/blog`
  - `/faq`
  - `/products/{slug}`
- wiele miejsc linkuje twardo do:
  - `/products`
  - `/products/{slug}`
  - `/blog/{slug}`
  - `/products?category=...`

Skutek:

- po przejściu na dynamiczne strony bez refaktoru SEO pojawi się niespójność,
- canonicale, breadcrumbs, search suggestions, sitemap i alternates muszą być przepięte na route resolution z CMS.

## Najważniejsze problemy do poprawy

1. `cms.modules` nie opisuje wszystkich modułów domenowych.
2. Renderer modułów na storefront nie obsługuje e-commerce.
3. Route resolution nadal jest mieszane: część dynamiczna, część hardcoded.
4. Kategorie i marki nie są modelowane jako strony modułowe.
5. Produkty mają hardcoded bazowy prefix `/products`.
6. Blog nadal ma fallbacki legacy, które utrudniają pełne ujednolicenie.
7. SEO/sitemap/search/breadcrumbs nie korzystają z jednego systemu rozwiązywania ścieżek.

## Docelowy model architektury

## Zasada

Każdy publiczny byt wejściowy ma bazować na CMS page lub regule modułu:

- listing bloga -> CMS page z modułem `blog_listing`
- listing produktów -> CMS page z modułem `product_listing`
- listing kategorii -> CMS page z modułem `category_listing`
- listing marek -> CMS page z modułem `brand_listing`
- detail produktu -> route resolved przez regułę modułu/detail route
- detail kategorii -> route resolved przez regułę modułu/detail route
- detail marki -> route resolved przez regułę modułu/detail route
- detail wpisu bloga -> route resolved przez regułę modułu/detail route

## Preferowany kierunek implementacyjny

Zamiast jednego ogólnego modułu `ecommerce`, wprowadzić jawne moduły domenowe:

- `blog_listing`
- `blog_post`
- `product_listing`
- `product_detail`
- `category_listing`
- `category_detail`
- `brand_listing`
- `brand_detail`

Powód:

- prostszy renderer,
- prostsza walidacja `module_config`,
- czytelniejsze SEO i route resolution,
- mniej logiki warunkowej niż w jednym module `ecommerce`.

Alternatywa:

- zachować moduł agregujący `ecommerce`, ale wtedy `module_config` musiałby rozróżniać tryb:
  - `products`
  - `categories`
  - `brands`
  - `product_detail`
  - `category_detail`
  - `brand_detail`

Ta alternatywa jest gorsza utrzymaniowo.

## Zakres prac

### Etap 1. Uporządkowanie kontraktu modułów

- Rozszerzyć `server/config/cms/modules.php`.
- Zdecydować, czy source of truth ma być:
  - wyłącznie config,
  - czy docelowo `page_modules` + `module_layouts`.
- Ujednolicić nazewnictwo:
  - dziś istnieją równolegle `module_name`, `page_module_id`, `module_layout_id`, `module_configuration`.
- Zdecydować, czy usuwamy/deprecjonujemy legacy `module_name = ecommerce`, czy mapujemy go migracją na nowe klucze.

### Etap 2. Ujednolicenie route resolution

- Wydzielić centralny resolver ścieżek publicznych.
- Resolver musi umieć rozstrzygnąć:
  - CMS page,
  - detail blog post,
  - detail product,
  - detail category,
  - detail brand.
- Usunąć specjalne fallbacki rozsiane po Next.js i zastąpić je jedną strategią rozpoznawania ścieżki.

### Etap 3. Dynamiczny listing produktów

- Zastąpić sztywne `/products` stroną CMS z modułem `product_listing`.
- Przepiąć `ProductsClient` tak, aby działał względem `basePath` z CMS page, a nie na sztywno.
- `module_config` powinien wspierać co najmniej:
  - `per_page`
  - domyślny `sort`
  - prefiltr kategorii/marki/tagu
  - wariant layoutu listingu
  - tryb "all products" vs "featured" vs "query-based"

### Etap 4. Dynamiczne strony kategorii

- Wprowadzić dwa poziomy:
  - `category_listing` dla listy kategorii,
  - `category_detail` dla konkretnej kategorii.
- Zamiast kierować do `/products?category=slug`, każda kategoria powinna mieć własny publiczny URL kontrolowany przez moduł.
- Zdefiniować, czy detail kategorii ma:
  - własną stronę CMS per kategoria,
  - czy jeden moduł-detail z runtime bindingiem do encji kategorii.

Rekomendacja:

- jeden moduł `category_detail` + runtime resolution po slugu kategorii,
- opcjonalne per-category overrides przez metafields / przypiętą page template.

### Etap 5. Dynamiczne strony marek

- Dodać API:
  - `GET /brands/{slug}`
  - `GET /brands/{slug}/products`
- Wprowadzić:
  - `brand_listing`
  - `brand_detail`
- Dodać możliwość budowy strony brandowej z layoutem CMS, opisem, hero, listingiem produktów marki i modułami treści.

### Etap 6. Dokończenie dynamicznego bloga

- Zostawić blog jako wzorzec, ale usunąć hybrydę.
- Zastąpić fallbacki specjalne jednym resolverem ścieżek.
- Przenieść RSS, sitemap i canonicale tak, aby opierały się o realny slug strony blogowej z CMS, nie o twarde `/blog`.

### Etap 7. Refaktor wszystkich linków i nawigacji

- Przejrzeć i przepiąć:
  - header / mega menu,
  - search suggestions,
  - breadcrumbs,
  - cards,
  - CTA,
  - related products/posts,
  - compare/wishlist/order empty states,
  - mobile navigation,
  - schema.org breadcrumbs,
  - sitemap.

Wszędzie link bazowy powinien pochodzić z resolvera ścieżek, nie z literal stringów.

### Etap 8. SEO i indeksacja

- Przepiąć `generateMetadata()` dla listingów i detali na dynamiczne ścieżki.
- Przebudować `client/app/sitemap.ts`, żeby:
  - pobierał bazowe strony modułowe z CMS,
  - generował wpisy detail zgodnie z aktualnym route pattern,
  - nie zakładał `/products` i `/blog` na sztywno.
- Upewnić się, że canonical, alternates i breadcrumbs są liczone z jednego resolvera URL.

### Etap 9. Migracja danych i kompatybilność wsteczna

- Zmapować istniejące strony demo:
  - `ecommerce` -> nowe klucze modułów
  - `blog` -> ewentualnie `blog_listing`
- Przygotować migrację/backfill dla istniejących rekordów `pages`.
- Dodać bezpieczny fallback dla starych URL-i:
  - 301 gdzie trzeba,
  - albo tymczasowe aliasy do czasu pełnej migracji.

### Etap 10. Testy i weryfikacja

- Testy backend:
  - resolution ścieżek,
  - walidacja modułów,
  - API brand/category/product detail/listing,
  - sitemap generation.
- Testy frontend:
  - rendering modułów,
  - linkowanie po `basePath`,
  - metadata/canonicale,
  - breadcrumbs,
  - search suggestions.
- E2E:
  - blog listing -> post,
  - product listing -> product detail,
  - category listing -> category detail,
  - brand listing -> brand detail.

## Kolejność realizacji

1. Zdefiniować docelowy kontrakt modułów i nazwy modułów.
2. Napisać centralny resolver ścieżek publicznych.
3. Wdrożyć `product_listing`.
4. Wdrożyć `category_listing` i `category_detail`.
5. Wdrożyć `brand_listing` i `brand_detail`.
6. Domknąć blog pod ten sam resolver.
7. Przepiąć wszystkie linki, sitemapę i metadata.
8. Wykonać migrację danych i redirecty.
9. Dodać testy regresyjne.

## Priorytety

### P1

- kontrakt modułów,
- centralny route resolver,
- product listing jako dynamic page,
- usunięcie zależności od twardego `/products`.

### P2

- category detail/listing,
- brand detail/listing,
- refaktor nawigacji i search,
- sitemap/canonical/breadcrumbs.

### P3

- pełne czyszczenie legacy fallbacków,
- migracje danych demo,
- redirecty kompatybilnościowe,
- domknięcie wszystkich edge-case'ów i testów E2E.

## Ryzyka

- Rozjazd między obecnym `module_name` a nowszym modelem `page_module_id` / `module_layout_id`.
- Duża liczba miejsc z twardymi linkami do `/products` i `/blog`.
- Możliwe skutki SEO, jeśli migracja URL-i nie będzie miała redirectów i canonicali.
- Kategorie dziś funkcjonują także jako filtr listingu, więc trzeba jasno rozdzielić:
  - listing globalny produktów,
  - listing w kontekście kategorii,
  - detail kategorii jako strona treściowo-listingowa.
- Marki mają najsłabsze pokrycie backend/frontend, więc ten obszar wymaga największego dopięcia od zera.

## Rekomendacja techniczna

Nie rozwijać dalej hardcoded tras publicznych dla domen CMS/e-commerce.

Zamiast tego:

- potraktować CMS page jako warstwę wejściową dla listingów,
- potraktować detail routes jako element tego samego systemu rozpoznawania ścieżek,
- zbudować jeden reusable resolver URL + helpery do generowania linków.

To jest jedyny kierunek, który skaluje się na:

- blog,
- produkty,
- kategorie,
- marki,
- kolejne moduły domenowe bez kolejnych wyjątków w routingu.

## Proponowane następne zadanie implementacyjne

Pierwszy etap wdrożeniowy:

1. zaprojektować docelową listę modułów i ich `module_config`,
2. wdrożyć `product_listing` end-to-end,
3. wyciąć zależność listingu od twardego `/products`,
4. przygotować pod to bazowy resolver ścieżek, z którego później skorzystają kategorie, marki i blog.
