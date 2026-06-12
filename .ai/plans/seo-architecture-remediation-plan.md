# Plan: SEO architecture remediation dla CMS + Ecommerce

Data: 2026-06-12
Zakres: Laravel backend, Inertia admin, Next.js storefront, metadata, sitemap, robots, schema.org, preview/publish/cache
Status: plan po review
Źródło discovery: `docs/reviews/seo-discovery.md`

## 1. Cel

Doprowadzić warstwę SEO do stanu, w którym:

- storefront renderuje kompletne i aktualne dane SEO dla wszystkich głównych typów treści,
- backend i frontend mają spójny kontrakt SEO,
- publish / unpublish / update nie zostawia starych meta danych ani starych URL w cache,
- robots i sitemap mają jedno czytelne źródło prawdy,
- architektura pozwala łatwo dodać SEO do nowych typów encji bez kopiowania logiki,
- system jest bezpieczny dla multi-locale i dla konfigurowalnych ścieżek CMS,
- testy pokrywają krytyczne ścieżki indeksacji i rewalidacji.

To ma być profesjonalna podstawa pod headless CMS/e-commerce dla wielu klientów, bez nadmiarowego frameworkowania.

## 2. Stan obecny

### 2.1 Co już działa

- `Page`, `BlogPost`, `Product`, `Category` i `Blog` mają pola SEO po stronie backendu.
- Dla `Page`, `BlogPost` i `Product` storefront realnie renderuje metadata przez `generateMetadata()`.
- Istnieje `HasSeoMetadata`, który częściowo ujednolica fallbacki backendowe.
- Jest `StorefrontPathService`, który rozwiązuje publiczne ścieżki na podstawie system pages i locale.
- Next storefront renderuje JSON-LD dla głównych typów:
  - `WebSite`,
  - `Organization`,
  - `WebPage`,
  - `FAQPage`,
  - `Product`,
  - `BlogPosting`,
  - `BreadcrumbList`,
  - `Store`.
- API ma sensowne `Cache-Control` dla publicznych endpointów.
- `Page` ma preview token flow i oddzielne zachowanie dla draft/preview.
- Są backendowe testy dla blog SEO, cache headers i publication webhooks.

### 2.2 Co działa częściowo

- Rewalidacja storefrontu działa dla stron CMS, ale nie dla produktów i wpisów blogowych.
- Sitemap Next.js działa poprawniej niż stary generator Laravel, ale nie skaluje się powyżej pierwszych 100 rekordów na typ.
- Multi-locale routing jest obecny, ale nie wszystkie źródła URL są spięte z tym samym resolverem.
- Admin ma wspólny `SeoPanel` dla części encji, ale nie cały model SEO jest konsekwentnie wykorzystywany przez storefront.

### 2.3 Główne luki

- `Category` ma SEO w backendzie, ale storefront go nie renderuje.
- `Blog` ma SEO w modelu i API, ale storefront nie ma jasnego consumer-a dla metadata listingu bloga.
- `robots` i `sitemap` istnieją w kilku równoległych implementacjach.
- webhooki `product.*` i `blog_post.*` nie odświeżają cache Next.js.
- część URL jest nadal składana ręcznie zamiast przez jeden resolver ścieżek.
- obecna sitemap Next.js obcina katalog i blog do pierwszych 100 rekordów.
- testy storefrontowego HTML SEO i revalidation nie są domknięte.

## 3. Priorytety

### 3.1 P0 — krytyczne

1. Domknąć rewalidację storefrontu dla `product.*` i `blog_post.*`.
2. Naprawić contract drift kategorii: backendowe SEO kategorii musi realnie wpływać na metadata storefrontu.
3. Wybrać jedno runtime source of truth dla `robots`.
4. Wybrać jedno runtime source of truth dla `sitemap`.
5. Usunąć ręcznie składane ścieżki z krytycznych flow SEO/cache/webhook.

### 3.2 P1 — ważne

1. Rozszerzyć sitemap tak, aby obejmowała komplet danych, nie tylko pierwszą stronę wyników.
2. Ujednolicić model consumerów SEO dla listing pages i kontenerów contentowych.
3. Dookreślić politykę fallbacków SEO między:
   - global settings,
   - encją,
   - obrazem encji,
   - excerptem / title.
4. Dodać testy dla renderowanego HTML metadata, revalidation i preview/noindex.

### 3.3 P2 — porządkowanie architektury

1. Uporządkować wspólne budowanie metadata na froncie.
2. Uporządkować wspólne budowanie SEO payloadów na backendzie.
3. Rozważyć lekkie abstrahowanie resolverów SEO tam, gdzie redukuje duplikację bez overengineeringu.

## 4. Zakres wdrożenia

### 4.1 Backend

- modele i pola SEO,
- API Resources / DTO / kontrolery,
- `StorefrontPathService`,
- webhooki publish/unpublish,
- preview token flow,
- cache headers i invalidacja,
- robots / sitemap / RSS,
- walidacja i spójność danych SEO w adminie.

### 4.2 Frontend

- `generateMetadata()` dla wszystkich publicznych stron,
- canonicale, robots, OG, Twitter,
- hreflang / alternates,
- JSON-LD,
- CMS dynamic pages,
- product/category/blog detail i listing pages,
- preview i noindex,
- Next cache tags / path revalidation,
- sitemap i robots runtime.

### 4.3 Admin / CMS UX

- spójność pól SEO między typami contentu,
- realna zgodność formularza SEO z tym, co później renderuje storefront,
- podglądy i warningi tylko tam, gdzie odpowiadają rzeczywistemu kontraktowi frontendowemu.

## 5. Proponowana kolejność

### Etap 1 — P0: spójność runtime SEO

Cel:

- wyeliminować najgroźniejsze rozjazdy między publikacją treści a widocznością SEO na storefrontcie.

Zakres:

1. Rozszerzyć `client/app/api/cms/revalidate/route.ts` o obsługę:
   - `product.published`,
   - `product.unpublished`,
   - `blog_post.published`,
   - `blog_post.unpublished`.
2. Zmapować dla tych eventów:
   - tagi fetchy,
   - pathy publiczne,
   - locale-specific slugi.
3. Oprzeć payload eventów i invalidację na resolverze ścieżek, nie na ręcznie złożonych `/products/...` i `/blog/...`.
4. Ustalić jeden runtime owner dla `robots.txt`.
5. Ustalić jeden runtime owner dla `sitemap.xml`.

Done criteria:

- publish/unpublish produktu, wpisu i strony odświeża metadata i ścieżki storefrontu bez czekania na TTL,
- nie ma dwóch konkurencyjnych runtime implementacji `robots`,
- nie ma dwóch konkurencyjnych runtime implementacji `sitemap`.

### Etap 2 — P0/P1: naprawa contract drift SEO

Cel:

- doprowadzić do tego, żeby pola SEO dostępne w backendzie były faktycznie używane przez storefront.

Zakres:

1. Dodać pełne pola SEO kategorii do frontendowego kontraktu typów.
2. Przepiąć category metadata na realne pola:
   - `seo_title`,
   - `seo_description`,
   - `canonical_url`,
   - `meta_robots`,
   - `og_image`,
   - `sitemap_exclude` tam, gdzie wpływa na sitemap.
3. Zweryfikować analogicznie listing/kontener bloga:
   - czy ma własne SEO renderowane,
   - jeśli nie, zdecydować czy jest to bug czy martwe pole adminowe.
4. Zweryfikować, czy ustawienia globalne SEO są rzeczywiście używane tam, gdzie admin oczekuje.

Done criteria:

- category detail page renderuje backendowe SEO kategorii,
- blog listing ma jednoznacznie zdefiniowane źródło metadata,
- globalne fallbacki są jawne i spójne.

### Etap 3 — P1: skalowalna sitemap i indeksacja

Cel:

- usunąć ograniczenia, które dziś psują pełne pokrycie indeksacji.

Zakres:

1. Przebudować runtime sitemap tak, aby pobierała komplet rekordów, a nie tylko pierwsze 100.
2. Zdecydować, czy:
   - jedna sitemap wystarczy,
   - czy potrzebny jest sitemap index + osobne pliki dla `pages`, `products`, `categories`, `posts`.
3. Ujednolicić reguły wykluczania:
   - nieopublikowane,
   - `sitemap_exclude`,
   - ewentualnie `noindex` jeśli ma być spójny z sitemap policy.
4. Ujednolicić `lastmod`, locale alternates i canonical path generation.
5. Rozstrzygnąć przyszłość Laravelowego generatora sitemap:
   - usunąć,
   - zostawić tylko do offline maintenance,
   - albo przepiąć na ten sam resolver i ten sam kontrakt.

Done criteria:

- sitemap obejmuje komplet rekordów,
- nie generuje błędnych hardcoded URL,
- ma jeden utrzymywany mechanizm runtime.

### Etap 4 — P1: testy krytycznych ścieżek SEO

Cel:

- dać twardy sygnał regresji dla najważniejszych elementów SEO.

Zakres backend:

- testy payloadów webhooków SEO i ich ścieżek,
- testy `robots` source of truth,
- testy sitemap source of truth,
- testy fallbacków `HasSeoMetadata`,
- testy category/blog SEO contract.

Zakres frontend:

- testy `generateMetadata()` dla:
  - CMS page,
  - product,
  - category,
  - blog post,
  - blog listing jeśli istnieje,
  - search / technical pages.
- testy `revalidate` route.
- testy preview + noindex / brak indeksacji draftów.
- testy sitemap buildera.
- testy renderowanego HTML metadata i JSON-LD.

Infra:

- ustabilizować Playwright/browser setup w kontenerze, bo dziś E2E SEO nie daje wiarygodnego sygnału bez zainstalowanego browsera.

Done criteria:

- najważniejsze ścieżki SEO mają automatyczne pokrycie,
- E2E SEO da się realnie uruchomić w kontenerze.

### Etap 5 — P2: lekkie porządki architektoniczne

Cel:

- zmniejszyć duplikację bez budowania ciężkiego SEO frameworka.

Rekomendowane lekkie abstrakcje:

- `ContentUrlResolver` / wykorzystanie `StorefrontPathService` jako jedynego źródła ścieżek,
- mały frontendowy helper do budowy metadata dla encji contentowych,
- wydzielenie spójnego kontraktu SEO dla API tam, gdzie dziś kontrolery składają pola ręcznie,
- ewentualnie prosty `SchemaBuilder` layer po stronie clienta, jeśli zacznie rosnąć liczba schema typów.

Na tym etapie nie rekomenduję automatycznie wdrażać:

- dużego `SeoResolver`,
- pełnego `SeoPresenter`,
- rozbudowanego `SeoProfile` systemu,
- uniwersalnego value object frameworku dla wszystkiego,

chyba że po etapach P0/P1 nadal będzie wyraźny ból z duplikacją.

## 6. Decyzje architektoniczne do potwierdzenia

1. Który runtime ma być publicznym ownerem:
   - `robots.txt`,
   - `sitemap.xml`?
2. Czy `noindex` ma automatycznie wykluczać URL z sitemap?
3. Czy blog listing ma mieć własny, niezależny model SEO od system page `blog_listing`, czy system page ma być jedynym ownerem metadata listingu?
4. Czy category / brand / product listing filters mają docelowo:
   - self-canonical,
   - canonical do czystej listy,
   - czy mieszany model zależny od typu filtra?
5. Czy chcemy wspierać slug history + 301 redirecty jako część SEO contract dla zmian slugów?

## 7. Co poprawiać, a czego nie przeinżynierować

### Poprawiać

- źródła prawdy runtime,
- contract drift backend ↔ frontend,
- pełne pokrycie revalidation,
- kompletność sitemap,
- testy SEO na poziomie HTML i metadata.

### Nie przeinżynierować

- nie budować od razu dużej hierarchii `Seo*` klas bez udowodnionego zysku,
- nie wprowadzać osobnej tabeli SEO tylko dlatego, że “tak czyściej”, jeśli obecny model pól per encja jest wystarczający,
- nie robić globalnego refactoru wszystkich modeli zanim nie zostaną naprawione krytyczne problemy runtime.

## 8. Minimalny plan wdrożenia

1. Naprawić revalidation dla produktów i bloga.
2. Oprzeć webhook paths i SEO URL-e na jednym resolverze.
3. Urealnić category SEO na storefrontcie.
4. Wybrać jeden mechanizm `robots` i jeden mechanizm `sitemap`.
5. Rozszerzyć sitemap na pełny dataset.
6. Dodać testy dla metadata, sitemap, revalidation i preview.

## 9. Dokumenty powiązane

- `docs/reviews/seo-discovery.md`
- `.ai/guide.md`
- `client/CLAUDE.md`
- `server/AGENTS.md`
