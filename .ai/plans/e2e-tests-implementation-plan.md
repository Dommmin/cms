# Plan Wdrożenia Testów E2E w Playwright

## Cel
Zapewnienie stabilności platformy CMS + E-commerce (Next.js storefront, Laravel API) poprzez dodanie kompleksowych testów end-to-end dla najbardziej newralgicznych ścieżek użytkownika (tzw. "Critical Paths"), ze szczególnym uwzględnieniem procesu zakupowego, obsługi konta i integracji wyszukiwarki.

## Scope (Zakres Testów do Wdrożenia)

### 1. Pełny proces zakupowy i płatności (Critical Path)
**Plik docelowy:** `client/tests/e2e/checkout.spec.ts`
* **Guest Checkout (Gość):** Dodanie produktu do koszyka -> Przejście na stronę kasy (`/checkout`) -> Wypełnienie danych wysyłkowych i kontaktowych -> Wybór metody płatności i dostawy -> Potwierdzenie zamówienia -> Weryfikacja przekierowania na stronę `/checkout/success`.
* **Test idempotencji (Double Submit):** Upewnienie się, że wielokrotne, szybkie kliknięcie przycisku "Złóż zamówienie" nie tworzy zduplikowanych transakcji ani zamówień w bazie.
* **Obsługa kodów rabatowych:** Wpisanie poprawnego i niepoprawnego kodu rabatowego, weryfikacja poprawnego przeliczania sekcji podsumowania (subtotal, rabat, total).

### 2. Autoryzacja i Profil Klienta (Auth & GDPR)
**Pliki docelowe:** `client/tests/e2e/auth.spec.ts`, `client/tests/e2e/account.spec.ts`
* **Rejestracja i logowanie:** Walidacja formularzy autoryzacji oraz poprawnego ustawienia ciasteczek sesyjnych po logowaniu.
* **Łączenie koszyków (Cart Merge):** Zbudowanie koszyka jako gość -> Zalogowanie się na istniejące konto -> Weryfikacja, czy elementy z koszyka gościa zostały poprawnie sklonowane/połączone z koszykiem użytkownika.
* **Zarządzanie adresami:** Dodanie nowego adresu dostawy z poziomu panelu klienta (`/account`), edycja oraz jego usunięcie.
* **Usuwanie konta (GDPR):** Test wywołania akcji usuwania konta i potwierdzenie natychmiastowego wylogowania sesji (weryfikacja wywołania mechanizmu `AnonymizeUserData` w tle).

### 3. Wyszukiwanie, Filtrowanie i Katalog (Search)
**Plik docelowy:** `client/tests/e2e/search.spec.ts`
* **Wyszukiwarka Typesense (Instant Search):** Wpisanie hasła w wyszukiwarkę i potwierdzenie, że wyniki doczytują się dynamicznie. Sprawdzenie zachowania dla zapytania nie zwracającego wyników.
* **Filtry i Sortowanie w Katalogu (`/shop`):** Ustawienie filtra zakresu cenowego lub zaznaczenie kategorii, weryfikacja zmiany parametrów w URL, a następnie sprawdzenie poprawnego zawężenia listy renderowanych produktów.

### 4. Renderowanie Treści z CMS (Page Builder)
**Plik docelowy:** `client/tests/e2e/cms.spec.ts`
* **Integracja bloków:** Weryfikacja poprawności renderowania zaawansowanych komponentów strony głównej lub stron statycznych utworzonych w Page Builderze (np. dynamiczne karuzele, siatki bloków) – sprawdzanie braku błędów JS i błędów hydratacji Reacta.

### 5. Funkcje poboczne (Newsletter)
**Plik docelowy:** `client/tests/e2e/newsletter.spec.ts`
* **Zapis do newslettera:** Przetestowanie formularza w stopce (podanie maila -> submit -> sprawdzenie komunikatu toast o sukcesie oraz obsługa błędów, np. zły format).

## Wymagania Techniczne / Architektura Testów
1. **Zależności Bazodanowe:** Rozszerzenie Seedera o konkretne dane testowe lub wykorzystanie Fabryk Laravel na żądanie w testach, aby testowany asortyment i warianty zawsze były przewidywalne.
2. **Konta Użytkowników:** Używanie dedykowanych wygenerowanych kont lub dynamiczne ich tworzenie przez API w kroku `beforeAll` / `beforeEach`.
3. **Konfiguracja CI:** Upewnienie się, że `docker compose` dostarcza Typesense, bazę i Mailpit w kontenerze na czas trwania E2E.

## User Review Required
Przed przystąpieniem do kodu, prośba o odpowiedź na:
1. **Mockowanie e-maili:** Czy w testach end-to-end chcemy wywoływać np. zewnętrzny serwer Mailpit i parsować treść e-maili (np. reset hasła, potwierdzenie zamówienia), czy polegamy tylko na weryfikacji UI?
2. **Dane testowe:** Wolisz utworzyć statyczny, znany zestaw danych do E2E uruchamiany komendą `php artisan db:seed --class=E2ESeeder`, czy preferujesz by każdy test samodzielnie generował obiekty z użyciem fabryk Laravelowych za pomocą ukrytych endpointów E2E?
