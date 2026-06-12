# Application Discovery — CMS / E-commerce

Data: 2026-06-12

## Zakres i metoda

Raport opiera się wyłącznie na kodzie repozytorium:

- backend Laravel w `server/app`, `server/routes`, `server/database`
- panel admina Inertia/React w `server/resources/js`
- publiczne API w `server/routes/api*.php`, kontrolerach i resources
- storefront Next.js w `client/app`, `client/components`, `client/api`
- testy w `server/tests` i `client/tests`

Przejrzane zostały przede wszystkim:

- routing admin/API
- modele, migrations, requests, resources, observers, services
- komponenty i strony admin/storefront
- mechanizmy preview, publish, cache i invalidacji
- miejsca, gdzie frontend zależy od kontraktu backendu

To jest discovery architektury, nie review implementacyjny linia po linii. Statusy poniżej oznaczają stan integracji modułu między warstwami.

## Mapa modułów

| Moduł | Backend | Admin | API | Frontend | Testy | Status | Rekomendacja |
|---|---|---|---|---|---|---|---|
| CMS Pages | `Page`, `PageSection`, `PageBlock`, `ContentEntry`, requests, resources, `StorefrontPathService` | CRUD stron i sekcji w `routes/admin/cms.php` | `Api/V1/PageController`, `PageResource` | dynamiczne strony `client/app/[...slug]`, `PageRenderer` | szerokie pokrycie (`PagePublicationWebhookTest`, `SystemPageResolutionTest`, snapshot/validation tests) | Complete | Zostawić jako rdzeń CMS; ograniczyć tylko ryzyka cache/preview opisane niżej |
| Page Builder | builder snapshot/versioning, save pipeline, `PageVersionService`, `PagePreviewService` | `/builder`, sekcje, bloki, templates | pośrednio przez `PageResource` | `SectionRenderer`, `ModuleRenderer`, block renderers | dobre pokrycie testami admin CMS | Complete | Zostawić; dopiąć preview draftów |
| Reusable Blocks | `ReusableBlock` + walidacja | CRUD w admin CMS | pośrednio przez pages/slots | render przez page builder i sloty | `ReusableBlockValidationTest` | Complete | Zostawić |
| Global Slots | `GlobalSlot`, relacje do bloków/encji | CRUD w admin CMS | dostarczane przez `publicSettings` | `SlotZone`, `SlotRenderer`, użycie w layoutach storefrontu | `GlobalSlotTest`, `PublicSettingsTest` | Complete | Zostawić |
| Section Templates | `SectionTemplate` + walidacja | CRUD w builderze | brak publicznego API dedykowanego | używane pośrednio przez builder | `SectionTemplateValidationTest` | Complete | Zostawić |
| Preview / Publish / Scheduling | `PagePreviewToken`, `PreviewController`, webhooki publikacji, `ProcessScheduledPages` | preview URL, schedule UI | preview token w `Api\V1\PageController` | `/api/preview`, dynamic page route | testy publikacji i webhooków istnieją | Risky | Naprawić niespójność draft preview i ujednolicić revalidację |
| Blogs | `Blog`, `BlogController`, `BlogResource`, migracje | CRUD blogów | `/api/v1/blogs`, `/api/v1/blogs/{slug}`, `/api/v1/blogs/{slug}/posts` | brak dedykowanego kontenera bloga użytego w głównym flow storefrontu | `BlogTest`, `BlogSeoTest`, `BlogFeedControllerTest` | Partial | Zdecydować: multi-blog naprawdę wspierany albo uprościć do single-blog |
| Blog Posts | `BlogPost`, kategorie, tagi, comments, votes, resources | CRUD postów | `/api/v1/blog/posts`, komentarze, vote, feed | `blog-post-page`, `BlogListClient`, `BlogPostClient` | szerokie pokrycie API/blog tests | Partial | Dodać realne powiązanie z `blog_id` w adminie i froncie albo usunąć tę warstwę |
| Metafields | `Metafield`, `MetafieldDefinition`, trait `HasMetafields`, sync endpoint | definicje w adminie, komponent `MetafieldEditor` istnieje | `/api/v1/metafields/{type}/{id}` | brak realnego użycia w głównych ekranach storefrontu | `MetafieldTest` | Partial | Albo dopiąć edycję i odczyt end-to-end, albo ograniczyć/ukryć funkcję |
| Ecommerce Catalog | `Product`, `Category`, `Brand`, atrybuty, warianty, flags, types | rozbudowany admin ecommerce | list/detail/filter/search endpoints | storefront product/category/brand pages i listingi | dużo testów feature/API | Complete | Zostawić; dopilnować invalidacji cache dla powiązanych treści |
| Cart / Checkout / Orders / Payments | koszyk, checkout, orders, shipping, payment providers, idempotency | admin order flows i konfiguracja | rozbudowane ecommerce API | cart/checkout/account/order flows | bardzo szerokie pokrycie testami | Complete | Zostawić |
| Returns / Guest Order Tracking | return portal, guest tracking, status | admin returns + permissions | returns endpoints i guest tracking | moduły `returns_portal`, `guest_order_tracker` | `ReturnPortalApiTest`, `GuestOrderTrackingTest` i inne | Complete | Zostawić |
| Search | search analytics, storefront route resolution, autocomplete | raporty/analityka po stronie admina | search endpoints | storefront search UX | `SearchAnalyticsTest`, `SearchImprovementsTest` | Complete | Zostawić |
| Newsletter | newsletter prefs, provider integrations | admin settings/integrations | `routes/api/newsletter.php`, preferences APIs | newsletter UI i moduł preferences | `NewsletterPreferencesTest`, `NewsletterProviderTest` | Complete | Zostawić |
| Push Subscriptions | backend controller istnieje | brak potwierdzonego UI admin | brak routów API dla używanego kontraktu | `use-push-notifications.ts` wywołuje endpointy | brak znalezionych testów tej ścieżki | Partial | Dokończyć routing i testy albo usunąć hook |
| Store Locator | stores model/controller + moduł page buildera | zarządzanie sklepami w adminie | `/api/v1/stores` | moduł `store_locator` | pośrednie pokrycie przez API/system pages | Complete | Zostawić; dopiąć pełną walidację configu modułu |
| FAQ / Forms / Consent / Legal | FAQ, forms, consent, policy docs | zarządzanie przez admin CMS/settings | endpoints publiczne istnieją | używane przez moduły i public settings | testy GDPR/consent/public settings | Complete | Zostawić |
| Settings / Theme / Public Settings / Locales | settings services, cached groups, locale/theme/public config | admin settings | `ProfileController@publicSettings` i inne settings endpoints | `layout.tsx` pobiera settings/slots/theme | `SettingsTest`, `PublicSettingsTest`, `ThemeDesignSystemTest` | Complete | Zostawić; dokumentować warstwy cache |
| Notifications / Notification Preferences | notification center, preferences, admin notification controller | admin notifications | preferences endpoints | storefront/account preferences | `NotificationCenterTest`, `NotificationPreferenceTest` | Complete | Zostawić |
| Media / Files / Image Tools | media library, crops, search, conversions | admin media flows | API pośrednie tam gdzie używane | użycie przez editor i storefront assets | `ImageCropTest`, `MediaSearchTest`, `CmsMediaConversionsTest` | Complete | Zostawić |
| Webhooks / Integrations / Automation | webhook management, MailerLite, BaseLinker, automation, reports | admin webhooks/automation | webhook endpoints | brak bezpośredniego UI storefront | liczne testy feature/API | Complete | Zostawić |
| Legacy Page Module Registry | `PageModule`, `ModuleLayout`, `ModuleRegistryService`, `PageModulesSeeder` | brak aktywnego flow edycji opartego o te modele | brak aktywnego publicznego użycia | runtime storefront używa `config/cms/modules.php`, nie tego rejestru | brak testów wskazujących aktywne użycie | Dead code | Kandydat do usunięcia po potwierdzeniu braku migracji danych zależnych |

## Moduły i encje

Najważniejsze domeny znalezione w kodzie:

- CMS: `Page`, `PageSection`, `PageBlock`, `ReusableBlock`, `GlobalSlot`, `SectionTemplate`, `PagePreviewToken`, `PolicyDocumentVersion`, `ContentEntry`
- Blog: `Blog`, `BlogPost`, `BlogCategory`, komentarze, tagi, feed, votes
- E-commerce: `Product`, `ProductVariant`, `Category`, `Brand`, atrybuty, shipping, payments, returns, wishlist, reviews, orders
- Konfiguracja/public shell: settings, theme, locale, public settings, sloty globalne
- Rozszerzenia: `Metafield`, `MetafieldDefinition`
- Integracje: webhooki, newsletter provider, payments, support, analytics

## Routing

### Admin

Admin jest rozdzielony na domeny:

- `server/routes/admin.php`
- `server/routes/admin/cms.php`
- `server/routes/admin/blog.php`
- `server/routes/admin/ecommerce.php`
- `server/routes/admin/metafields.php`

W adminie istnieją pełne sekcje dla:

- CMS pages / builder / preview / scheduling
- reusable blocks / global slots / templates
- blogów i postów
- katalogu ecommerce i zamówień
- stores, settings, newsletter, notifications, webhooks, support
- definicji metafields

### API

Publiczne API jest szerokie i podzielone na:

- CMS/public shell: pages, menus, public settings, storefront routes, stores, forms, consent, metafields, tags
- Blog: blogs, posts, categories, comments, vote, feed
- E-commerce: produkty, listingi, brandy, koszyk, checkout, płatności, wishlist, orders, returns, reviews, search
- Newsletter preferences

Stwierdzona luka kontraktowa:

- `client/hooks/use-push-notifications.ts` używa `GET /push-subscriptions/public-key`, `POST /push-subscriptions`, `DELETE /push-subscriptions`
- `server/app/Http/Controllers/Api/V1/PushSubscriptionController.php` istnieje
- w `server/routes/api*.php` nie ma zarejestrowanych tych endpointów

Efekt: frontend ma feature, który w obecnym routingu kończy się 404.

## Mechanizm Metafields

### Jak działa

Mechanizm jest zaimplementowany po stronie backendu:

- `Metafield` to rekord polymorphic przypinany do modeli przez trait `HasMetafields`
- `MetafieldDefinition` trzyma schemat definicji
- `Admin\MetafieldController` obsługuje CRUD definicji i synchronizację wartości
- `Api\V1\MetafieldController` wystawia odczyt publiczny

Modele z podpiętym traitem obejmują co najmniej:

- `Product`
- `BlogPost`
- `Page`
- `Category`

### Czy Metafields są używane w adminie

Częściowo:

- definicje są zarządzalne z admina
- istnieje komponent `server/resources/js/components/metafield-editor.tsx`
- nie znaleziono użycia `MetafieldEditor` w formularzach edycji produktów, stron, kategorii ani postów

Wniosek faktograficzny:

- backend i panel definicji istnieją
- edycja wartości metafields nie jest dopięta do głównych ekranów admina

### Czy Metafields są używane w API

Tak:

- publiczny endpoint istnieje
- testy `server/tests/Feature/MetafieldTest.php` potwierdzają aktywną ścieżkę backendową

### Czy Metafields są używane na froncie

Nie znaleziono realnego użycia w głównych flow storefrontu:

- brak istotnych odczytów endpointu metafields w `client/api` / `client/components`
- brak integracji z rendererami stron, produktów lub bloga

Status końcowy: implementacja backendowa istnieje, ale funkcja nie jest domknięta end-to-end.

## Blogi i Posty

### Co istnieje

Backend wspiera dwa poziomy:

- kontener `Blog`
- wpis `BlogPost` z `blog_id`

API wspiera:

- listę blogów
- szczegóły blogu po slug
- posty dla konkretnego blogu
- globalną listę postów

### Co jest realnie używane

Storefront używa głównie globalnego listingu postów:

- `client/components/page-builder/modules/blog-module.tsx` pobiera `getBlogPosts(...)`
- moduł nie korzysta z `page.module_config.blog_id`
- baza ścieżek publicznych dla wpisów jest wyznaczana przez globalny system page `blog_listing`

To oznacza:

- architektura backendowa sugeruje multi-blog
- aktualny storefront renderuje blog jak jedną wspólną listę postów

### Czy blogi są naprawdę wykorzystywane

Tak, ale częściowo:

- CRUD blogów istnieje
- `blog_id` istnieje w modelu i migracji
- testy backendowe potwierdzają relację

Jednocześnie:

- `StoreBlogPostRequest` i `UpdateBlogPostRequest` nie walidują `blog_id`
- w przejrzanych ekranach admina nie znaleziono pola powiązania posta z blogiem
- moduł frontendowy ignoruje `blog_id`

Wniosek:

- `Blog` nie jest martwym kodem
- ale warstwa multi-blog nie jest konsekwentnie wdrożona end-to-end
- w praktyce publiczna prezentacja wygląda jak single-blog z dodatkową, niedopiętą abstrakcją `Blog`

## Cache i invalidacja

### Gdzie jest cache

Backend:

- `ApiCacheHeaders` ustawia `Cache-Control` zależnie od ścieżki
- `PageCacheService` cachuje strony pod kluczami `page:{locale}:{slug}`
- wybrane grupy settings są cachowane na 1h
- cache jest też używany dla OTP, passkeys, idempotency i części integracji

Frontend / Next:

- `client/lib/server-fetch.ts` używa `fetch` z `revalidate` i tagami
- `client/api/cms.ts` taguje m.in. strony i menu
- `client/public/sw.js` dodaje warstwę service worker cache

### Gdzie jest invalidacja

Backend:

- `PageObserver` czyści cache stron
- `ProductObserver` i `CategoryObserver` flushują cache przez tagi
- save settings czyści odpowiednie grupy ustawień

Frontend:

- `client/app/api/cms/revalidate/route.ts` obsługuje revalidację Next po webhooku

### Gdzie dev może mieć problem przez cache

Najbardziej problematyczne miejsca:

- strona może być cachowana jednocześnie w Laravel, Next ISR i service workerze
- settings są cachowane na backendzie przez 1h i wymagają manualnej invalidacji przy zmianie
- preview draftów używa osobnej ścieżki `no-store`, ale zwykły runtime używa revalidate/tagów
- tag-based flush w Laravel zależy od wsparcia drivera cache

### Luka w invalidacji

`client/app/api/cms/revalidate/route.ts` obsługuje tylko zdarzenia stron:

- `page.published`
- `page.unpublished`

Nie znaleziono analogicznej obsługi dla:

- blog posts
- produktów
- innych treści publikowanych, które wpływają na routing/storefront

Skutek:

- część zmian może czekać na TTL zamiast dostać natychmiastową invalidację

## Publish / Preview

Mechanizm preview jest rozdzielony na dwa typy:

- admin preview przez cookie `admin_preview`
- draft preview przez token `page_preview_token`

Przepływ draft preview:

- backend generuje token przez `PagePreviewService`
- Next route `client/app/api/preview/route.ts` ustawia cookie i robi redirect na stronę
- `Api\V1\PageController@show` dopuszcza nieopublikowaną stronę przy poprawnym tokenie
- `client/app/_routes/cms-dynamic-page.tsx` nie robi `notFound()` dla draftu w preview

Istotna niespójność:

- `client/components/page-builder/page-renderer.tsx` zwraca `null`, gdy `!page.is_published`

Skutek:

- draft może przejść przez routing i fetch
- ale renderer nic nie wyświetli

To jest twardy, potwierdzony z kodu problem w ścieżce preview.

## Martwy kod i kandydaci do usunięcia

### Potwierdzony martwy / legacy kod

`PageModule` / `ModuleLayout` / `ModuleRegistryService` / `PageModulesSeeder` wyglądają na stary system modułów:

- runtime storefront i admin operują dziś na `pages.module_name`
- aktywny katalog modułów pochodzi z `server/config/cms/modules.php`
- renderer frontendowy przełącza się po `module_name`
- nie znaleziono aktywnego flow, który wymagałby DB-based `PageModule` / `ModuleLayout`

To jest najsilniejszy kandydat do usunięcia po potwierdzeniu, że nie ma zależnych danych historycznych.

### Kandydaci do usunięcia lub uproszczenia

- `MetafieldEditor` jako osierocony komponent admina, jeśli nie ma planu dopięcia feature
- `HomepageSection` wygląda na nieużywany model; w przeglądzie nie znaleziono aktywnego routingu ani UI korzystającego z tego bytu

Drugi punkt jest słabszy niż legacy module registry, więc traktuję go jako kandydat, nie pewny dead code.

## Miejsca, gdzie użytkownik może wytworzyć dane prowadzące do 404, 500 albo crasha

### 500 przez brak system page

`StorefrontPathService` rzuca `RuntimeException`, gdy brakuje wymaganych stron systemowych, m.in. dla:

- `product_listing`
- `category_listing`
- `brand_listing`
- `blog_listing`

Te metody są używane w wielu resources i usługach, więc admin może stworzyć dane, które później wywołają 500:

- produkt bez skonfigurowanej systemowej strony listingu produktów
- wpis blogowy bez skonfigurowanej systemowej strony bloga
- slot lub relacja odwołująca się do encji wymagającej brakującej system page

To nie jest tylko 404. W tych ścieżkach backend potrafi rzucić wyjątek.

### 404 przez nieistniejący kontrakt

Push subscriptions na froncie wołają endpointy bez routingu backendowego.

Efekt:

- użytkownik trafia na błędy requestów
- feature nie działa mimo obecności hooka i kontrolera

### Pusty ekran zamiast preview

Draft preview może zakończyć się pustym renderem przez `PageRenderer`.

To jest ryzyko crash-like z perspektywy użytkownika admina: preview działa transportowo, ale nie renderuje treści.

### Ryzyko z niedowalidowanym `module_config`

`server/config/cms/modules.php` deklaruje więcej parametrów modułów niż walidują requesty stron.

Walidowane są głównie:

- `content_id`
- `category`

Brakuje potwierdzonej walidacji dla części configów, np.:

- `blog_id`
- `per_page`
- `default_zoom`
- `initial_city`
- `show_expired`
- `limit`

Efekt:

- admin może zapisać konfigurację modułu, której frontend lub backend nie interpretują konsekwentnie
- kończy się to co najmniej cichym błędem funkcjonalnym

## Gdzie brakuje walidacji

Najbardziej konkretne braki:

- `StoreBlogPostRequest` i `UpdateBlogPostRequest` nie walidują `blog_id`
- requests stron CMS nie pokrywają pełnego zakresu `module_config` z `config/cms/modules.php`
- push subscriptions nie są nawet spięte routingowo, więc kontrakt nie dochodzi do warstwy walidacji

## Niespójności backend ↔ frontend

Najważniejsze kontrakty niespójne wprost z kodu:

1. Push subscriptions
   Frontend wywołuje endpointy, których routing backendu nie wystawia.

2. Draft preview
   Backend i route layer pozwalają renderować draft przy preview tokenie, ale `PageRenderer` blokuje go warunkiem `page.is_published`.

3. Blog module
   Backend deklaruje `blog_id` w konfiguracji modułu blogowego, ale storefrontowy `BlogModule` tego nie używa.

4. Module config
   `config/cms/modules.php` definiuje bogatszy kontrakt niż ten walidowany i obsługiwany w admin flow.

5. Multi-blog
   API wspiera blog containers i per-blog post listing, ale storefront i ścieżki URL są zorganizowane jak globalny, pojedynczy blog listing.

## Tabele i modele wyglądające na nieużywane

Najmocniejsze sygnały:

- `page_modules`
- `module_layouts`

Powód:

- istnieją modele, seeder i service
- aktywny runtime modułów używa innego mechanizmu

Słabszy kandydat:

- `homepage_sections`

Powód:

- model istnieje
- w discovery nie znaleziono aktywnego routingu, UI ani runtime usage

## Podsumowanie końcowe

### 1. Moduły kompletne

- CMS Pages
- Page Builder
- Reusable Blocks
- Global Slots
- Section Templates
- Ecommerce Catalog
- Cart / Checkout / Orders / Payments
- Returns / Guest Order Tracking
- Search
- Newsletter
- Store Locator
- FAQ / Forms / Consent / Legal
- Settings / Theme / Public Settings / Locales
- Notifications / Notification Preferences
- Media / Files / Image Tools
- Webhooks / Integrations / Automation

### 2. Moduły częściowe

- Blogs
- Blog Posts
- Metafields
- Push Subscriptions
- Preview / Publish / Scheduling

### 3. Martwy kod

- `PageModule`
- `ModuleLayout`
- `ModuleRegistryService`
- `PageModulesSeeder`

### 4. Niedokończone funkcje

- multi-blog przypięty do postów i używany realnie na froncie
- edycja wartości metafields w głównych formularzach admina
- push subscriptions end-to-end
- pełna walidacja `module_config`
- spójne preview draftów

### 5. Rzeczy do uproszczenia

- dwa konkurencyjne systemy modułów stron: aktywny config-based i legacy DB-based
- model blogów, jeśli produktowo platforma i tak działa jak single-blog
- warstwy cache, które dziś nakładają się na siebie i utrudniają diagnostykę

### 6. Rzeczy do usunięcia

- legacy page module registry po potwierdzeniu braku zależności
- osierocone komponenty/metody wokół metafields, jeśli feature nie będzie dopięty
- `HomepageSection`, jeśli dodatkowy audit potwierdzi brak użycia poza modelem/migracją

### 7. Rzeczy do dokończenia

- routy i testy push subscriptions
- walidacja i UI dla `blog_id`
- użycie `blog_id` w module bloga na storefront
- pełne pokrycie `module_config` w requestach i admin UI
- invalidacja Next dla nie-page content
- preview draftów bez pustego renderu

### 8. Największe ryzyka architektury

- krytyczne ścieżki storefrontu zależą od istnienia system pages; ich brak może dawać 500 zamiast kontrolowanego fallbacku
- kontrakt modułów stron jest rozjechany między `config/cms/modules.php`, requestami admina i rendererem storefrontu
- blogi wyglądają jak niedokończona warstwa abstrakcji nad single-blog flow
- metafields są wdrożone tylko częściowo, co zwiększa koszt utrzymania bez realnej wartości produktowej
- preview i invalidacja cache są rozproszone między Laravel, Next i service worker, co zwiększa ryzyko trudnych do odtworzenia błędów
