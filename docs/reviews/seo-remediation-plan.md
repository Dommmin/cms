# SEO Architecture Remediation Plan

## Cel Główny
Doprowadzić SEO architecture do stanu, w którym:
* storefront renderuje kompletne i aktualne metadata dla CMS pages, produktów, kategorii, blog posts i blog listingów,
* backend i frontend mają spójny kontrakt SEO,
* publish / unpublish / update nie zostawia starych metadata ani starych URL-i w cache,
* robots.txt i sitemap.xml mają jedno runtime source of truth,
* ścieżki publiczne nie są składane ręcznie w krytycznych flow, tylko przechodzą przez resolver ścieżek,
* sitemap obejmuje komplet danych, a nie tylko pierwsze 100 rekordów,
* preview / draft / noindex działa bezpiecznie,
* testy realnie potwierdzają, że wszystko działa.

## Zasady Architektoniczne
1. **Publiczny runtime owner robots.txt**: Next.js storefront.
2. **Publiczny runtime owner sitemap.xml**: Next.js storefront.
3. **Laravel sitemap/robots**: Usuń z runtime flow lub oznacz jako legacy/offline/internal. Nie może być publicznym source of truth.
4. **noindex**: Wyklucza z sitemap.
5. **Blog listing SEO**: Posiada jednoznaczne źródło metadata (preferowane system page lub configured CMS page). Brak martwych pól SEO.
6. **Category SEO**: Traktowane jako realny kontrakt frontendowy.
7. **Ścieżki**: Publiczne URL-e przechodzą przez jeden resolver ścieżek (`StorefrontPathService` lub analogiczny).

## Etap 1 — P0: Revalidation i Runtime Source of Truth
1. Rozszerzenie `client/app/api/cms/revalidate/route.ts` o zdarzenia: `product.published`, `product.unpublished`, `product.updated`, `blog_post.published`, `blog_post.unpublished`, `blog_post.updated`.
2. Mapowanie dla eventów: cache tags, public paths, locale-specific paths, listing paths, sitemap/metadata.
3. Usunięcie ręcznego składania URL-i. Użycie `StorefrontPathService`.
4. Ustalenie Next.js jako ownera robots/sitemap i usunięcie konkurencyjnych implementacji z Laravela.

## Etap 2 — P0/P1: Category SEO i Blog Listing SEO
1. Rozszerzenie typów na frontendzie o pola SEO kategorii (`seo_title`, `seo_description`, `canonical_url`, `meta_robots`, `og_image`, `sitemap_exclude`).
2. Przepięcie `generateMetadata()` dla category detail page na backendowe SEO z fallbackami.
3. Implementacja consumer'a metadata dla blog listing.
4. Weryfikacja globalnych SEO settings i ich spójności między adminem a frontendem.

## Etap 3 — P1: Sitemap
1. Przebudowa sitemap w Next.js na pobieranie kompletu danych (paginacja lub dedykowany endpoint).
2. Jedna sitemap lub sitemap index.
3. Reguły wykluczania: nieopublikowane, `sitemap_exclude`, `noindex`, preview/draft.
4. Ujednolicenie `lastmod`, `canonical URL`, locale alternates, resolver paths.

## Etap 4 — P1: Testy
Dodanie i poprawa testów backend (webhook, resolver, SEO contract, sitemap source of truth) i frontend (generateMetadata, revalidate route, sitemap builder, HTML/metadata smoke test). Uruchomienie E2E/Playwright (jeśli działa w kontenerze).

## Raport
Raport końcowy będzie zapisany w `docs/reviews/seo-remediation-implementation-report.md`.
