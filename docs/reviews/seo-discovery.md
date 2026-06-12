# SEO Discovery

Stan na podstawie przeglądu kodu w `server/` i `client/` z dnia 2026-06-12. To jest wyłącznie discovery aktualnej implementacji, bez propozycji refaktoru.

## Zakres

Przejrzane obszary:

- meta tagi, canonicale, robots, sitemap, RSS
- schema.org / JSON-LD
- slugi i lokalizacja URL
- publish / preview / cache / invalidacja
- API SEO i renderowanie SEO na storefrontcie
- istniejące testy oraz luki testowe

## Mapa wysokopoziomowa

Aktualny przepływ SEO wygląda tak:

1. Dane SEO są przechowywane głównie w tabelach contentowych w Laravelu: `pages`, `blog_posts`, `products`, `categories`, `blogs`, plus globalne ustawienia w `settings`.
2. API publikuje te dane przez:
   - dedykowane resource’y (`PageResource`, `BlogPostResource`, `BlogResource`, `CategoryResource`)
   - częściowo ręcznie budowane odpowiedzi (`ProductController@show`)
   - publiczne ustawienia `GET /api/v1/settings/public`
3. Frontend Next.js pobiera SEO przez `client/api/cms.ts`, `client/api/settings.ts` i buduje `generateMetadata()` w page-level route’ach.
4. Structured data jest renderowane przez `<JsonLd />` i buildery z `client/lib/schema.ts`.
5. Cache działa równolegle na kilku warstwach:
   - Laravel API: `Cache-Control` przez `ApiCacheHeaders`
   - Laravel page cache: `PageCacheService`
   - Next.js data cache: `serverFetch(..., { revalidate, tags })`
   - Next.js page/path invalidation: `POST /api/cms/revalidate`
   - RSS cache w Laravelu i stale-while-revalidate po stronie Next
6. Publikacja i unpublikacja części encji emituje webhooki (`page.*`, `product.*`, `blog_post.*`), ale invalidacja storefrontu jest zaimplementowana tylko dla eventów stron CMS.

## Encje z SEO

### 1. `Page`

Pliki główne:

- `server/app/Models/Page.php`
- `server/app/Http/Resources/Api/V1/PageResource.php`
- `client/app/page.tsx`
- `client/app/[locale]/page.tsx`
- `client/app/_routes/cms-dynamic-page.tsx`

Przechowywane pola:

- `seo_title`
- `seo_description`
- `seo_canonical`
- `meta_robots`
- `og_image`
- `sitemap_exclude`
- `slug` jako JSON translatable
- `is_published`, `published_at`, `scheduled_publish_at`, `scheduled_unpublish_at`

Gdzie są edytowane:

- admin create/edit stron: `server/resources/js/pages/admin/cms/pages/create.tsx`, `edit.tsx`
- page builder preview/publish: `server/app/Http/Controllers/Admin/Cms/PageBuilderController.php`

Jak trafiają do API:

- `PageController@show` i `showBySystemPageKey`
- serializacja przez `PageResource`
- `PageResource` używa `Page::getSeoMetadata()` z `HasSeoMetadata`

Jak trafiają na frontend:

- `client/api/cms.ts#getPage()`
- strony home i dynamiczne korzystają z `getPage()` lub `getSystemPage()`

Jak są renderowane:

- `generateMetadata()` w:
  - `client/app/page.tsx`
  - `client/app/[locale]/page.tsx`
  - `client/app/_routes/cms-dynamic-page.tsx`
- canonical idzie przez `alternates.canonical`, z override z `page.seo_canonical`
- OG/Twitter biorą `page.og_image`, a fallbackiem jest `settings.seo.og_image`
- structured data:
  - `WebPage` dla zwykłych CMS pages
  - `FAQPage` gdy `page.module_name === 'faq'`

Cache / invalidacja:

- Laravel page cache: `PageCacheService`
- invalidacja Laravel cache przez `PageObserver`
- API `GET /api/v1/pages/*` ma `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`
- Next fetch: `getPage()` ma `revalidate: 60` i tag `page:{slug}`
- preview omija Next cache (`revalidate: false`)
- webhook `page.published` / `page.unpublished` trafia do `client/app/api/cms/revalidate/route.ts`
- ten endpoint robi `revalidateTag()` i `revalidatePath()`

Fallbacki:

- `HasSeoMetadata` zwraca domyślne `robots = 'index, follow'`
- brak `seo_title` => `page.title`
- brak `seo_description` => brak opisu
- brak `og_image` => globalne `settings.seo.og_image`
- brak locale-specific sluga => fallback w `Page::localizedSlug()` i `StorefrontPathService`

### 2. `BlogPost`

Pliki główne:

- `server/app/Models/BlogPost.php`
- `server/app/Http/Controllers/Api/V1/Blog/BlogPostController.php`
- `server/app/Http/Resources/Api/V1/BlogPostResource.php`
- `client/app/blog/_blog-metadata.ts`
- `client/components/blog-post-client.tsx`

Przechowywane pola:

- `seo_title`
- `seo_description`
- `canonical_url`
- `meta_robots`
- `og_image`
- `sitemap_exclude`
- `slug` jako JSON translatable
- `translation_group_id`
- `available_locales`
- `published_at`
- historycznie była migracja `slug_translations`, ale obecnie slug jest JSON-em, a resource nadal wystawia `slug_translations` jako pochodną z `getTranslations('slug')`

Gdzie są edytowane:

- admin create/edit postów: `server/resources/js/pages/admin/blog/posts/create.tsx`, `edit.tsx`
- `SeoPanel` jest podpięty na ekranie edycji posta

Jak trafiają do API:

- `GET /api/v1/blog/posts`
- `GET /api/v1/blog/posts/{slug}`
- `BlogPostResource` wystawia:
  - `seo_title`
  - `seo_description`
  - `canonical_url`
  - `meta_robots`
  - `og_image`
  - `sitemap_exclude`
  - `canonical_slug`
  - `slug_translations`
  - `available_locales`

Jak trafiają na frontend:

- `client/api/cms.ts#getBlogPost()`
- `client/app/blog/_blog-metadata.ts#getBlogPostMetadata()`
- `client/components/blog-post-client.tsx`

Jak są renderowane:

- metadata w `client/app/blog/[slug]/page.tsx` i `client/app/[locale]/blog/[slug]/page.tsx` przez helper `getBlogPostMetadata()`
- canonical:
  - najpierw `post.canonical_url`
  - inaczej URL z `localizedBlogPath(...)`
- OG:
  - `post.og_image`
  - inaczej `post.featured_image`
  - inaczej dynamiczny `opengraph-image`
- Twitter analogicznie
- JSON-LD:
  - `BlogPosting`
  - `BreadcrumbList`

Cache / invalidacja:

- API detail ma `Cache-Control: public, s-maxage=30, stale-while-revalidate=60`
- API listy bloga: `s-maxage=600, stale-while-revalidate=7200`
- Next `getBlogPost()` ma `revalidate: 30` i tag `blog-post:{slug}`
- `BlogPostObserver` emituje webhooki `blog_post.published` i `blog_post.unpublished`
- brak implementacji obsługi tych eventów w `client/app/api/cms/revalidate/route.ts`

Fallbacki:

- brak `seo_title` => `post.title`
- brak `seo_description` => `post.excerpt`
- brak `canonical_url` => URL locale-aware
- brak `og_image` => `featured_image`, a potem dynamiczny OG image
- `available_locales` filtruje indeksowalność locale w API i metadata

### 3. `Product`

Pliki główne:

- `server/app/Models/Product.php`
- `server/app/Http/Controllers/Api/V1/ProductController.php`
- `client/app/_routes/product-detail-page.tsx`
- `client/app/products/[slug]/ProductDetailClient.tsx`

Przechowywane pola:

- `seo_title`
- `seo_description`
- `meta_robots`
- `og_image`
- `sitemap_exclude`
- `slug` jako JSON translatable
- `is_active`, `is_saleable`

Gdzie są edytowane:

- admin create/edit produktów:
  - `server/resources/js/pages/admin/ecommerce/products/create.tsx`
  - `server/resources/js/pages/admin/ecommerce/products/edit.tsx`
- `SeoPanel` jest używany w edycji produktu

Jak trafiają do API:

- `ProductController@show` wystawia SEO ręcznie, bez resource’a SEO-specific
- pola obecne w odpowiedzi:
  - `seo_title`
  - `seo_description`
  - `meta_robots`
  - `og_image`
  - `sitemap_exclude`
  - `public_url`

Jak trafiają na frontend:

- przez `serverFetch<Product>(/products/{slug})`
- route metadata przez `generateProductMetadata()`

Jak są renderowane:

- `client/app/_routes/product-detail-page.tsx`
- title/description z produktu
- `robots` z produktu
- alternates z `product.public_url`
- OG image: `product.og_image`, potem pierwsze zdjęcie produktu
- JSON-LD:
  - `Product`
  - `BreadcrumbList`

Cache / invalidacja:

- API `/products*` ma `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`
- `ProductObserver` flushuje `Cache::tags(['products'])`
- Next metadata/detail używa fetchu produktowego
- `ProductObserver` emituje webhooki `product.published` i `product.unpublished`
- brak obsługi tych eventów w `client/app/api/cms/revalidate/route.ts`

Fallbacki:

- brak `seo_title` => `product.name`
- brak `seo_description` => `product.short_description`
- brak `og_image` => pierwsze zdjęcie produktu
- `robots` fallback do `index, follow`

### 4. `Category`

Pliki główne:

- `server/app/Models/Category.php`
- `server/app/Data/CategoryData.php`
- `server/app/Http/Resources/Api/V1/CategoryResource.php`
- `server/app/Http/Resources/Api/V1/CategoryShowResource.php`
- `client/app/_routes/category-detail-page.tsx`

Przechowywane pola:

- `seo_title`
- `seo_description`
- `canonical_url`
- `meta_robots`
- `og_image`
- `sitemap_exclude`
- `slug` jako JSON translatable

Gdzie są edytowane:

- admin edit kategorii: `server/resources/js/pages/admin/ecommerce/categories/edit.tsx`
- `SeoPanel` jest używany w edycji kategorii

Jak trafiają do API:

- `CategoryData` zawiera pełen zestaw SEO
- `CategoryResource` i `CategoryShowResource` używają `CategoryData`

Jak trafiają na frontend:

- `client/api/cms.ts#getCategory()`
- frontendowy typ `Category` w `client/types/api.ts` nie zawiera pól SEO

Jak są renderowane:

- `client/app/_routes/category-detail-page.tsx`
- metadata są obecnie budowane z:
  - `category.name`
  - `category.description`
  - hardcoded `robots: 'index, follow'`
  - `category.public_url` dla alternates
- `canonical_url`, `meta_robots`, `og_image`, `sitemap_exclude`, `seo_title`, `seo_description` nie są używane na storefrontcie mimo że backend je posiada

Cache / invalidacja:

- API `/categories*` ma `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`
- `CategoryObserver` robi tylko `Cache::tags(['categories'])->flush()`
- nie ma webhooka publikacyjnego dla kategorii

Fallbacki:

- frontend w praktyce zawsze używa zwykłych pól kategorii, bo typ i route metadata nie czytają pól SEO

### 5. `Blog`

Pliki główne:

- `server/app/Models/Blog.php`
- `server/app/Http/Resources/Api/V1/BlogResource.php`
- `server/app/Http/Controllers/Api/V1/Blog/BlogController.php`

Przechowywane pola:

- `seo_title`
- `seo_description`
- `slug` jako JSON translatable

Gdzie są edytowane:

- admin create/edit blogów: `server/resources/js/pages/admin/blogs/create.tsx`, `edit.tsx`

Jak trafiają do API:

- `BlogResource` wystawia `seo_title` i `seo_description`
- `BlogController@show()` zwraca `blog` i `posts`

Jak trafiają na frontend:

- brak znalezionego dedykowanego route’u storefrontowego korzystającego z `BlogResource` do metadata listing page
- blog listing w praktyce jest obsługiwany przez system page `blog_listing` i/lub dynamiczne page routing

Wniosek faktograficzny:

- kontener bloga ma pola SEO w modelu i API
- nie znalazłem miejsca w storefrontcie, które renderuje te pola bezpośrednio do `<head>`

### 6. Globalne ustawienia SEO (`settings`)

Pliki główne:

- `server/app/Models/Setting.php`
- `server/app/Http/Controllers/Api/V1/ProfileController.php::publicSettings`
- `client/api/settings.ts`
- `client/app/layout.tsx`

Przechowywane / używane klucze:

- `settings.general.site_name`
- `settings.general.site_url`
- `settings.general.site_description`
- `settings.seo.disable_indexing`
- `settings.seo.google_site_verification`
- `settings.seo.bing_site_verification`
- `settings.seo.og_image`
- `settings.seo.google_tag_manager`
- `settings.seo.robots_txt` po stronie Laravel web route
- onboarding zapisuje też `seo.meta_title` i `seo.meta_description`, ale storefront root layout ich nie używa bezpośrednio

Jak trafiają do API:

- `GET /api/v1/settings/public`
- fetch w `client/api/settings.ts` ma `revalidate: 300`, tag `settings`

Jak są renderowane:

- `client/app/layout.tsx`
  - title template
  - applicationName
  - default description
  - global `robots` przy `disable_indexing`
  - verification meta dla Google/Bing
  - `WebSite` i `Organization` JSON-LD
- per-page fallback dla OG image

## Slugi, locale i canonicalizacja URL

### Aktualny model slugów

- `pages.slug`, `blog_posts.slug`, `products.slug`, `categories.slug`, `blogs.slug` są JSON translatable po migracji `2026_05_25_103820_convert_slug_to_json_translatable.php`
- `StorefrontPathService` buduje publiczne ścieżki na bazie system pages i locale-specific slugów
- `Page::findByLocalizedPath()` rozwiązuje wielosegmentowe ścieżki CMS po locale-specific slugach

### Redirecty i canonicalizacja

Znalezione mechanizmy:

- `client/middleware.ts`
  - default locale prefix jest przekierowywany do clean URL
  - pierwszy visit może dostać redirect po `Accept-Language`
  - session paths są rewrite’owane bez locale prefixu
- `client/app/_routes/cms-dynamic-page.tsx`
  - jeśli path nie jest canonical localized path, robi `redirect(canonicalPath)`
- `client/app/api/preview/route.ts`
  - ustawia cookie preview i redirectuje na `/{locale}/{slug}`

Ważne obserwacje:

- canonical URL strony CMS może być ręcznie nadpisany przez `seo_canonical`
- blog post ma niezależne `canonical_url`
- produkt nie ma dedykowanego pola canonical
- kategoria ma `canonical_url` w backendzie, ale storefront go nie renderuje

## Robots

### Laravel

- `server/routes/web.php` wystawia `/robots.txt` przez `SeoController`
- `SeoController` czyta `Setting::get('seo', 'robots_txt', "User-agent: *\nAllow: /")`

### Next.js

- `client/app/robots.ts` generuje własny robots config:
  - `allow: /`
  - disallow dla `/account/`, `/checkout/`, `/admin/`, `/preview/`, `?preview=*`, `?preview_token=*`, `/api/cms/revalidate`
  - sitemap wskazuje na `${SITE_URL}/sitemap.xml`

### Stan faktyczny

- istnieją dwa źródła robots:
  - dynamiczny Laravel route `/robots.txt`
  - Next App Router `app/robots.ts`
- dodatkowo istnieje statyczny plik `server/public/robots.txt` z treścią:
  - `User-agent: *`
  - `Disallow:`

To oznacza, że w repo są trzy miejsca związane z robots, ale nie wszystkie muszą być aktywne w runtime jednocześnie.

## Sitemap i RSS

### Next.js sitemap

Plik:

- `client/app/sitemap.ts`

Źródła danych:

- system pages: `product_listing`, `faq_page`, `blog_listing`
- produkty: `/api/v1/products?per_page=100`
- blog posty: `/api/v1/blog/posts?per_page=100` dla wszystkich locale

Zasady:

- pomija rekordy z `sitemap_exclude`
- generuje locale alternates i `x-default`
- używa `public_url` lub locale-aware slugów

### Laravel sitemap command

Plik:

- `server/app/Console/Commands/GenerateSitemap.php`

Stan:

- generuje `server/public/sitemap.xml`
- używa twardych ścieżek:
  - `/products/{slug}`
  - `/categories/{slug}`
  - `/{page.slug}`
- nie korzysta z `StorefrontPathService`
- nie obsługuje locale alternates
- nie filtruje `sitemap_exclude`
- nie uwzględnia blog postów

Wniosek faktograficzny:

- w repo istnieją dwa niezależne mechanizmy sitemap:
  - runtime Next `client/app/sitemap.ts`
  - offline/public-file generator w Laravelu

### RSS

Są dwa osobne mechanizmy:

- Laravel `BlogFeedController`
  - cache `blog_rss_feed_{locale}` na 3600 s
  - buduje linki przez ręczne `'/blog/{slug}'` + prefiks `/en`
- Next `client/app/blog/rss.xml/route.ts`, `client/app/[locale]/blog/rss.xml/route.ts`, `client/lib/blog-rss.ts`
  - pobiera blog posts z API
  - filtruje `sitemap_exclude`
  - używa locale-aware slugów

## Schema.org / JSON-LD

Centralne buildery:

- `client/lib/schema.ts`

Obsługiwane typy:

- `WebSite`
- `Organization`
- `BlogPosting`
- `WebPage`
- `FAQPage`
- `Product`
- `Store` / LocalBusiness-like data
- `BreadcrumbList`

Miejsca renderowania:

- root layout:
  - `WebSite`
  - `Organization`
- CMS dynamic pages:
  - `WebPage`
  - `FAQPage`
- blog post:
  - `BlogPosting`
  - `BreadcrumbList`
- product detail:
  - `Product`
  - `BreadcrumbList`
- stores:
  - `Store`
  - `BreadcrumbList`

Braki w znalezionym kodzie:

- nie znalazłem JSON-LD dla kategorii
- nie znalazłem JSON-LD dla brand pages
- nie znalazłem testów jednostkowych dla `client/lib/schema.ts`

## Publish / preview / cache / invalidacja

### Preview

Backend:

- `PageBuilderController::previewUrl()` tworzy token i URL do `client/app/api/preview/route.ts`
- tokeny są trzymane w `page_preview_tokens`
- `PagePreviewService` haszuje token i weryfikuje TTL

Frontend:

- `GET /api/preview?token=...&slug=...`
- ustawia `page_preview_token` cookie na 30 min
- redirectuje do `/{locale}/{slug}`
- `getPage()` przy preview wysyła `preview_token` do API i wyłącza revalidate cache

Obserwacja:

- preview jest zaimplementowany tylko dla CMS pages
- nie znalazłem analogicznego signed preview flow dla product/blog/category detail po stronie storefront metadata

### Publish / unpublish

Znalezione eventy:

- `page.published`
- `page.unpublished`
- `product.published`
- `product.unpublished`
- `blog_post.published`
- `blog_post.unpublished`

Implementacja:

- strony: `PagePublicationWebhookService`
- produkty: `ProductObserver`
- blog posts: `BlogPostObserver`

### Invalidacja storefrontu

`client/app/api/cms/revalidate/route.ts`:

- przyjmuje tylko:
  - `page.published`
  - `page.unpublished`
- robi invalidację:
  - tagów `page:{slug}`
  - pathów z payloadu i `slug_translations`

Wniosek faktograficzny:

- blog i product wysyłają webhooki publikacyjne
- storefrontowy endpoint invalidacyjny ich nie obsługuje

### Laravel cache lokalny

- `PageCacheService` cache’uje stronę pod `page:{locale}:{slug}` na 24h
- `PageObserver` czyści cache na `updated`, `deleted`, a na `saved` tylko dla opublikowanych stron
- `ProductObserver` flushuje tag `products`
- `CategoryObserver` flushuje tag `categories`
- blog RSS ma osobny cache `blog_rss_feed_{locale}`

### HTTP cache headers

`server/app/Http/Middleware/ApiCacheHeaders.php`:

- settings public: `s-maxage=3600`
- blog post detail: `s-maxage=30`
- blog listy: `s-maxage=600`
- products/categories/pages/menus/faqs/stores: zwykle `s-maxage=300`
- auth/session/mutating/error responses: `no-store` lub `no-cache`

## Fallbacki i wartości hardcoded

### Fallbacki

- `HasSeoMetadata`:
  - `robots => index, follow`
  - canonical z `seo_canonical ?? canonical_url ?? null`
- layout:
  - site name => `Store`
  - description => `Your online store`
- `client/lib/seo.ts`:
  - `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:8000'`
- `client/app/api/preview/route.ts`:
  - locale cookie fallback => `'en'`
  - base URL fallback => `http://localhost:3000`
- middleware:
  - fallback locales => `['en', 'pl']`
  - fallback default locale => `'en'`
- `client/lib/schema.ts`:
  - `SITE_URL = ... ?? 'http://localhost:8000'`
  - `currencyCode ?? 'USD'`
- search page:
  - title `'Search'`
  - description `'Search our product catalogue.'`
  - `robots: 'noindex'`
- stores page:
  - hardcoded title/description/H1 copy

### Hardcoded miejsca szczególnie istotne SEO

- `client/app/stores/page.tsx` metadata i copy nie są CMS-driven
- `client/app/search/page.tsx` metadata są twarde
- `client/app/robots.ts` ma twardą listę `disallow`
- `server/app/Console/Commands/GenerateSitemap.php` ma twarde path patterns `/products`, `/categories`
- `BlogFeedController` ręcznie skleja blog URL zamiast używać `StorefrontPathService`

## Miejsca, gdzie dane SEO kończą się przed storefrontem

1. `Category`
   - backend przechowuje pełne SEO
   - API resource to wystawia
   - frontend type i metadata route tego nie używają

2. `Blog`
   - model i API mają `seo_title` / `seo_description`
   - nie znalazłem renderowania tych pól do `<head>`

3. `settings.seo.meta_title` / `settings.seo.meta_description`
   - onboarding zapisuje te klucze
   - storefront root layout czyta `general.site_name` i `general.site_description`, nie te pola

## Testy istniejące

Znalezione pokrycie:

- `server/tests/Feature/BlogSeoTest.php`
  - lokalizowane SEO dla blog posta
  - draft nie wychodzi przez public API
  - `blog:seo-audit --fix`
- `server/tests/Feature/ApiCacheHeadersTest.php`
  - cache headers dla public API
- `server/tests/Feature/Admin/Cms/PagePublicationWebhookTest.php`
  - page publish/unpublish webhooki
- `server/tests/Feature/Admin/Cms/OnPublishWebhookTest.php`
  - product/blog publish webhooki
- `server/tests/Feature/HookSystemTest.php`
  - SEO metadata filter hook
- `server/resources/js/components/seo-panel-health.test.ts`
  - ostrzeżenia panelu SEO
- `client/tests/e2e/seo.spec.ts`
  - sprawdza subset URL z sitemap pod kątem title/description/canonical/OG/JSON-LD/H1

## Braki testowe

Nie znalazłem testów dla:

- `client/app/robots.ts`
- `client/app/sitemap.ts`
- `client/app/api/cms/revalidate/route.ts`
- `client/app/api/preview/route.ts`
- `client/lib/seo.ts`
- `client/lib/schema.ts`
- metadata generatorów dla:
  - product detail
  - category detail
  - CMS dynamic page
  - stores page
  - search page
- renderowania category SEO na storefrontcie
- renderowania blog container SEO na storefrontcie
- dynamicznego Laravel `/robots.txt` z settings
- `GenerateSitemap` command w Laravelu
- `PageCacheService` invalidation
- preview token expiry / invalid token handling
- obsługi blog/product publish webhooków po stronie storefront invalidation

## Faktyczne rozjazdy implementacyjne

To nie są rekomendacje refaktoru, tylko obecny stan:

- są dwa mechanizmy sitemap: Next runtime i Laravel command
- są co najmniej dwa aktywne źródła robots w kodzie: Laravel route i Next `app/robots.ts`, plus trzeci statyczny plik `server/public/robots.txt`
- category SEO istnieje w modelu i API, ale storefront nie używa tych pól do metadata
- blog container SEO istnieje w modelu i API, ale nie znalazłem storefrontowego renderu tych pól do `<head>`
- product i blog publish webhooki istnieją, ale Next invalidation route przyjmuje wyłącznie eventy stron CMS
- onboarding zapisuje część ustawień SEO, których storefront nie odczytuje bezpośrednio

## Najważniejsze pliki referencyjne

Backend:

- `server/app/Models/Page.php`
- `server/app/Models/BlogPost.php`
- `server/app/Models/Product.php`
- `server/app/Models/Category.php`
- `server/app/Models/Blog.php`
- `server/app/Traits/HasSeoMetadata.php`
- `server/app/Http/Resources/Api/V1/PageResource.php`
- `server/app/Http/Resources/Api/V1/BlogPostResource.php`
- `server/app/Http/Controllers/Api/V1/ProductController.php`
- `server/app/Http/Controllers/Api/V1/CategoryController.php`
- `server/app/Http/Middleware/ApiCacheHeaders.php`
- `server/app/Services/StorefrontPathService.php`
- `server/app/Services/PageCacheService.php`
- `server/app/Services/PagePublicationWebhookService.php`
- `server/app/Observers/PageObserver.php`
- `server/app/Observers/ProductObserver.php`
- `server/app/Observers/BlogPostObserver.php`
- `server/app/Http/Controllers/SeoController.php`
- `server/app/Console/Commands/GenerateSitemap.php`

Frontend:

- `client/api/cms.ts`
- `client/api/settings.ts`
- `client/app/layout.tsx`
- `client/lib/seo.ts`
- `client/lib/schema.ts`
- `client/app/sitemap.ts`
- `client/app/robots.ts`
- `client/app/_routes/cms-dynamic-page.tsx`
- `client/app/blog/_blog-metadata.ts`
- `client/app/_routes/product-detail-page.tsx`
- `client/app/_routes/category-detail-page.tsx`
- `client/app/api/cms/revalidate/route.ts`
- `client/app/api/preview/route.ts`
