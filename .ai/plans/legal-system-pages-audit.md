# Plan: strony regulaminowe, polityki i inne strony systemowe

## Cel

Ujednolicić obsługę stron prawnych i wszystkich innych "specjalnych" stron tak, aby:

- każda publiczna strona była zwykłą stroną CMS albo stroną CMS z przypisaną rolą systemową,
- żaden fragment aplikacji nie zależał od twardego slugu typu `/privacy-policy`, `/terms-of-service`, `/shipping-policy`,
- integracje typu checkout, cookie banner, footer legal, SEO, sitemap, RSS, wyszukiwarka i routing korzystały z jednego źródła prawdy,
- jeśli jakaś funkcja nadal nie jest dynamiczna, była jawnie wykryta w audycie i doprowadzona do zgodności.

---

## Jak robi to Shopify

Na podstawie oficjalnej dokumentacji Shopify:

- polityki sklepu są zarządzane w panelu `Settings > Policies`,
- Shopify rozróżnia konkretne typy polityk:
  - privacy policy,
  - terms of service,
  - shipping policy,
  - return/refund policy,
  - legal notice,
  - subscription policy,
- checkout i część storefrontu umieją automatycznie podpiąć te polityki,
- Shopify ma też osobny obszar privacy/customer privacy:
  - automated privacy policy,
  - cookie banner,
  - data sharing opt-out page,
- poza politykami merchant może tworzyć zwykłe custom pages do treści informacyjnych.

Wniosek architektoniczny:

- Shopify nie traktuje polityk jako "zwykłych przypadkowych stron po URL".
- Polityka ma jednocześnie:
  - treść/URL widoczne publicznie,
  - semantyczną rolę systemową używaną przez checkout, privacy tools i nawigację.

To jest właściwy kierunek dla tego CMS.

Źródła:

- [Shopify: Adding store policies](https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos)
- [Shopify: Configuring customer privacy settings](https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings)
- [Shopify: Display your store policies and other legal information](https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-spain/spain-custom-page)

---

## Jak robi to WordPress

Na podstawie oficjalnej dokumentacji WordPress:

- standardowe treści statyczne są zwykłymi `Pages`,
- WordPress ma jednak specjalny mechanizm dla strony polityki prywatności:
  - admin wybiera istniejącą stronę albo tworzy nową w `Settings > Privacy`,
  - system zapamiętuje przypisaną stronę jako specjalną stronę systemową,
  - core potrafi rozpoznać ją semantycznie,
  - pluginy i theme mogą dostarczać sugerowaną treść polityki prywatności do panelu (`wp_add_privacy_policy_content()`).

Wniosek architektoniczny:

- WordPress używa zwykłych stron jako nośnika URL i contentu,
- ale dla wybranych przypadków dodaje warstwę "page role / page assignment".

To jest dobry wzorzec dla naszego systemu:

- zwykła CMS page jako byt treściowy,
- dodatkowa rola systemowa jako kontrakt dla integracji.

Źródła:

- [WordPress: Settings Privacy screen](https://wordpress.org/support/article/settings-privacy-screen/)
- [WordPress: WordPress Privacy](https://wordpress.org/documentation/article/wordpress-privacy/)
- [WordPress: wp_add_privacy_policy_content()](https://developer.wordpress.org/reference/functions/wp_add_privacy_policy_content/)
- [WordPress: Pages Add New screen](https://wordpress.org/support/article/pages-add-new-screen/)

---

## Stan po audycie w tym repo

### Co już działa częściowo poprawnie

- legal pages istnieją jako zwykłe strony CMS i są seedowane,
- footer legal menu linkuje do stron przez `page_slug`, nie przez sztywne URL-e w komponencie,
- istnieje preset `legal_basic`,
- cookie banner ma konfigurowalne linki,
- checkout pokazuje linki do regulaminu i polityki prywatności.

### Co jest nadal źle

- checkout linkuje na sztywno do:
  - `/terms-of-service`
  - `/privacy-policy`
- cookie banner używa ustawień URL:
  - `privacy_policy_url`
  - `cookie_policy_url`
  czyli przechowuje ścieżki, a nie referencje do stron,
- system nie ma pojęcia "to jest strona polityki prywatności", "to jest regulamin", "to jest polityka zwrotów",
- `cms.modules` nie obejmuje pełnego modelu stron systemowych i e-commerce,
- wcześniejszy audit już wykazał twarde zależności od `/products`, `/blog`, `/categories`, `/brands`,
- część seedów i presetów sugeruje kierunek dynamiczny, ale runtime nadal pozostaje hybrydowy.

Wniosek:

- mamy content pages,
- nie mamy spójnego systemu page roles / system assignments.

---

## Docelowy model

### 1. Dodać role systemowe stron

Każda specjalna strona powinna mieć opcjonalne pole typu:

- `system_page_key`

albo osobną tabelę przypisań:

- `system_pages`
  - `key`
  - `page_id`
  - `locale`

Rekomendacja:

- nie pakować tego w zwykłe settings URL,
- trzymać referencję do `page_id`,
- jeśli potrzebna jest lokalizacja per język, wspierać przypisanie per locale.

### 2. Zdefiniować jawny słownik stron systemowych

Minimalny zestaw:

- `privacy_policy`
- `cookie_policy`
- `terms_of_service`
- `shipping_policy`
- `return_policy`
- `legal_notice`
- `checkout_terms_reference`

Rozszerzalne:

- `data_sharing_opt_out`
- `faq_page`
- `contact_page`
- `blog_listing`
- `product_listing`
- `category_listing`
- `brand_listing`

Ważne:

- role prawne i role listingów nie muszą być obsługiwane identycznie w UI,
- ale architektonicznie powinny przejść przez ten sam mechanizm przypięcia strony do funkcji systemowej.

### 3. Oddzielić dwa poziomy odpowiedzialności

Poziom A: publiczny URL i treść

- obsługiwane przez CMS Page i page builder / module.

Poziom B: semantyka systemowa

- obsługiwana przez `system_page_key`.

To eliminuje błędne założenie:

- "jeśli slug jest `privacy-policy`, to znaczy że to polityka prywatności".

---

## Zakres audytu do poprawy

Każde miejsce w systemie trzeba sklasyfikować jako jedno z trzech:

1. w pełni dynamiczne,
2. dynamiczne tylko częściowo,
3. twardo zaszyte i wymagające refaktoru.

### Obszary obowiązkowe

- routing storefrontu,
- checkout,
- cookie/privacy,
- menu i footer,
- sitemap,
- canonicale i hreflang,
- breadcrumbs,
- wyszukiwarka,
- RSS,
- dane seedujące,
- admin page creation,
- moduły CMS,
- API dla resolvera ścieżek,
- wszystkie ustawienia, które dziś przechowują URL zamiast referencji do strony.

---

## Etapy wdrożenia

### Etap 1. Inwentaryzacja wszystkich twardych URL i slugów

Spisać wszystkie wystąpienia:

- `/privacy-policy`
- `/cookie-policy`
- `/terms-of-service`
- `/shipping-policy`
- `/return-policy`
- `/products`
- `/blog`
- `/categories`
- `/brands`

oraz każdą logikę opartą o:

- `page_slug`,
- `module_name`,
- ustawienia `*_url`,
- warunki typu "if pathname startsWith(...)"

Efekt:

- jedna tabela audytowa: miejsce, obecny mechanizm, docelowy mechanizm, priorytet.

### Etap 2. Wprowadzenie mechanizmu `system_page_key`

Do decyzji implementacyjnej:

- kolumna na `pages`,
- albo tabela mapująca role do stron.

Rekomendacja:

- osobna tabela mapująca,
- bo łatwiej wymusić unikalność,
- łatwiej wspierać locale,
- łatwiej audytować i rozszerzać bez przeciążania modelu `pages`.

### Etap 3. Resolver stron systemowych

Zbudować jeden serwis/backend contract:

- `SystemPageResolver`

który zwraca stronę po roli i locale.

Przykłady użycia:

- checkout pobiera `terms_of_service` i `privacy_policy`,
- cookie banner pobiera `privacy_policy` i `cookie_policy`,
- footer legal może mieć fallback do zestawu przypisanych system pages,
- SEO/sitemap bierze tylko faktycznie przypisane i opublikowane strony.

### Etap 4. Refaktor ustawień z `*_url` na `*_page_id` albo role

Do poprawy w pierwszej kolejności:

- `privacy_policy_url`
- `cookie_policy_url`

Docelowo:

- ustawienia nie powinny przechowywać URL,
- tylko:
  - `page_id`,
  - albo samą rolę systemową, jeśli rola jest stała.

Najlepszy wariant:

- dla standardowych polityk w ogóle nie przechowywać URL ani page_id w settings,
- tylko używać stałych kluczy systemowych.

### Etap 5. Refaktor checkoutu

Checkout nie może linkować do sztywnych ścieżek.

Powinien:

- pobierać URL przypisanej strony systemowej,
- obsługiwać brak przypisania kontrolowanym fallbackiem,
- raportować w adminie brak wymaganej strony.

Dodatkowo:

- checkbox terms powinien być powiązany z konkretną wersją regulaminu tylko jeśli biznes wymaga wersjonowania zgody,
- jeśli nie, minimum to stabilny link przez resolver.

### Etap 6. Refaktor cookie/privacy

Cookie consent powinien korzystać z:

- `privacy_policy`,
- `cookie_policy`,
- opcjonalnie `data_sharing_opt_out`.

Trzeba też ocenić, czy potrzebny jest osobny typ treści:

- zwykła polityka cookies jako CMS page,
- plus opcjonalna strona systemowa z dynamicznym komponentem opt-out.

To byłby odpowiednik Shopify privacy/data-sharing page.

### Etap 7. Refaktor footer legal i menu

Menu może nadal być ręcznie zarządzane,
ale system powinien umieć:

- proponować automatyczne dodanie przypisanych stron systemowych,
- ostrzegać, jeśli legal pages są przypisane, ale nie ma ich w menu,
- zapewnić fallback renderowania minimalnego legal menu, jeśli administrator go nie skonfiguruje.

### Etap 8. Ujednolicenie z modułami dynamicznymi

To samo podejście trzeba doprowadzić do końca dla:

- bloga,
- produktów,
- kategorii,
- marek.

Zasada:

- listing/detail może być stroną CMS z modułem,
- ale jeśli pełni rolę centralnej strony systemowej, powinien mieć też `system_page_key`.

Przykład:

- strona sklepu:
  - moduł `product_listing`
  - rola `product_listing`

### Etap 9. SEO, sitemap, canonical, hreflang

Wszystkie mechanizmy SEO muszą przestać zgadywać URL-e.

Powinny bazować na:

- opublikowanych stronach,
- modułach,
- przypisaniach systemowych,
- resolverze ścieżek.

Dotyczy to szczególnie:

- legal pages,
- blog listing/post,
- product listing/detail,
- category listing/detail,
- brand listing/detail.

### Etap 10. Admin UX

Administrator powinien widzieć:

- listę ról systemowych,
- która strona jest do nich przypisana,
- które role są wymagane,
- które są opcjonalne,
- które role są nieobsadzone,
- czy przypisana strona jest opublikowana.

Minimum UX:

- ekran "System Pages" w adminie.

Dodatkowo:

- przy edycji strony możliwość zaznaczenia roli,
- walidacja unikalności przypisania,
- ostrzeżenie przed usunięciem strony przypisanej do roli systemowej.

---

## Priorytety

### P1

- mechanizm `system_page_key`,
- checkout terms/privacy bez hardcoded slugów,
- cookie/privacy bez `*_url`,
- audyt i usunięcie twardych legal URL-i,
- dokończenie dynamicznego modelu dla products/blog/categories/brands.

### P2

- ekran adminowy do zarządzania system pages,
- fallback legal menu,
- dynamiczny data-sharing opt-out / privacy extensions,
- automatyczne ostrzeżenia o brakujących stronach obowiązkowych.

### P3

- wersjonowanie treści prawnych,
- logowanie "jaki regulamin zaakceptowano",
- starter/suggested legal content per moduł lub integracja.

---

## Ryzyka

- jeśli przypisanie nadal będzie po slugu, problem wróci przy zmianie URL-i,
- jeśli settings dalej będą przechowywać URL-e, powstanie drugi niespójny system źródła prawdy,
- jeśli blog/products/categories/brands zostaną rozwiązane inaczej niż legal pages, znowu zbudujemy kilka mechanizmów zamiast jednego,
- jeśli zabraknie lokalizowanego przypisania, wielojęzyczny storefront będzie miał błędne linki prawne.

---

## Rekomendacja implementacyjna

Najlepszy kierunek dla tego projektu:

1. Wprowadzić wspólny mechanizm `system pages`.
2. Traktować legal pages jako zwykłe CMS pages z dodatkową rolą systemową.
3. Zastąpić wszystkie ustawienia oparte o URL referencjami do stron albo stałymi rolami.
4. Tę samą architekturę wykorzystać do końcowego domknięcia:
   - bloga,
   - produktów,
   - kategorii,
   - marek.

W praktyce:

- Shopify potwierdza potrzebę specjalnych ról systemowych dla polityk,
- WordPress potwierdza, że nośnikiem może być zwykła strona,
- nasz CMS powinien połączyć oba podejścia:
  - normalna strona CMS,
  - plus przypisanie systemowe,
  - plus pełna dynamiczność routingu.

---

## Pierwszy krok po akceptacji planu

Najpierw wdrożyć fundament, nie pojedyncze wyjątki:

1. tabela lub mechanizm `system_page_key`,
2. resolver stron systemowych,
3. refaktor checkout + cookie consent z hardcoded URL-i,
4. dopiero potem rozszerzenie tego samego wzorca na products/categories/brands/blog.
