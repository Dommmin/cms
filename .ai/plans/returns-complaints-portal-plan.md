# Plan: Dynamiczny portal zwrotów i reklamacji

Data: 2026-06-03
Zakres: CMS page modules, storefront, konto klienta, admin, API, uprawnienia
Status: plan po audycie

## 1. Cel

Należy wdrożyć pełny, dynamiczny portal zwrotów i reklamacji, który:

- działa pod dowolną stroną CMS utworzoną przez użytkownika, np. `/returns`, `/return-and-reclamations`, `/zwroty-i-reklamacje`
- obsługuje użytkownika niezalogowanego
- obsługuje użytkownika zalogowanego
- daje klientowi osobny obszar do przeglądania swoich zwrotów i reklamacji
- używa jednego spójnego backendu i jednego modelu danych
- nie jest zaszyty na sztywno pod konkretnym slugiem

## 2. Stan obecny

### 2.1 Co już istnieje

- Backend ma model i workflow zgłoszeń zwrotów:
  - `ReturnRequest`
  - `ReturnItem`
  - `ReturnStatusHistory`
- API storefront pozwala zgłosić zwrot dla zamówienia:
  - `POST /orders/{reference}/return`
- Klient zalogowany może złożyć zwrot z poziomu szczegółu własnego zamówienia.
- Klient zalogowany widzi istniejące zwroty tylko w szczególe konkretnego zamówienia.
- Admin ma sekcję do zarządzania zwrotami:
  - lista
  - szczegóły
  - akceptacja
  - odrzucenie
  - refund

### 2.2 Czego brakuje

- Brak modułu CMS typu `returns_portal` / `returns_and_complaints`.
- Brak dynamicznej strony publicznej przypinanej do dowolnego CMS page.
- Brak guest flow do wyszukania zamówienia i rozpoczęcia zgłoszenia bez logowania.
- Brak osobnej sekcji konta klienta z listą wszystkich zwrotów i reklamacji.
- Brak wspólnego UI dla zwrotu i reklamacji jako publicznego portalu.
- Obecny formularz w szczególe zamówienia jest zbyt lokalny i nie rozwiązuje całego use case'u.

## 3. Wniosek architektoniczny

Zwroty i reklamacje powinny działać jak dynamiczny moduł strony, a nie jak zaszyty feature tylko w szczególe zamówienia.

Docelowy model:

- CMS page:
  - użytkownik tworzy dowolną stronę
  - przypisuje do niej moduł `returns_portal`
- Moduł storefront:
  - renderuje portal zwrotów/reklamacji
  - rozpoznaje stan użytkownika
  - pokazuje odpowiedni flow dla gościa lub klienta zalogowanego
- Konto klienta:
  - dostaje osobną sekcję `Zwroty i reklamacje`
- Admin:
  - zostaje systemem operacyjnym do obsługi zgłoszeń

## 4. Docelowy UX

### 4.1 Użytkownik niezalogowany

Na stronie z modułem:

- widzi formularz identyfikacji zamówienia
- podaje np.:
  - numer zamówienia + email
  - alternatywnie numer zamówienia + kod pocztowy
- po poprawnej weryfikacji widzi:
  - podstawowe dane zamówienia
  - pozycje kwalifikujące się do zgłoszenia
  - historię wcześniejszych zgłoszeń dla tego zamówienia
  - formularz nowego zwrotu lub reklamacji

### 4.2 Użytkownik zalogowany

Na stronie z modułem:

- może wyszukać zamówienie w swoich zamówieniach albo wybrać je z listy
- widzi swoje wcześniejsze zwroty i reklamacje
- może przejść do szczegółu zgłoszenia
- może rozpocząć nowe zgłoszenie

### 4.3 Konto klienta

Potrzebna jest osobna sekcja:

- `/account/returns`
- lista wszystkich zwrotów i reklamacji klienta
- filtrowanie po statusie
- filtrowanie po typie: zwrot / reklamacja
- wejście do szczegółu zgłoszenia
- link do zamówienia źródłowego
- CTA do rozpoczęcia nowego zgłoszenia

## 5. Proponowany podział na byty i role

### 5.1 Moduł CMS

Nowy wpis w `server/config/cms/modules.php`:

- klucz: `returns_portal`
- label: `Returns & Complaints Portal`
- frontend renderer: `returns_portal`

Przykładowa konfiguracja modułu:

- `lookup_mode`
- `allow_guest_lookup`
- `allow_authenticated_shortcut`
- `show_order_history`
- `show_policy_page_id` albo docelowo `system_page_key`
- `eligible_statuses`
- `guest_verification_strategy`

### 5.2 Typy zgłoszeń

Dziś model już rozróżnia typ zgłoszenia. Należy doprecyzować semantykę:

- `return`
- `complaint`

W UI i tłumaczeniach trzeba konsekwentnie używać:

- `zwrot`
- `reklamacja`

bez mieszania tego wyłącznie pod etykietą `return`.

## 6. Zakres backendu

### 6.1 API dla gościa

Dodać bezpieczny guest flow:

- endpoint do wyszukania zamówienia po danych weryfikacyjnych
- endpoint do pobrania kwalifikujących się pozycji
- endpoint do złożenia zgłoszenia bez sesji klienta

Wymagania:

- brak ujawniania danych zamówienia przy niepoprawnej kombinacji danych
- rate limiting
- audit trail
- opcjonalnie jednorazowy token sesji zwrotu po weryfikacji

### 6.2 API dla klienta zalogowanego

Dodać pełny zestaw endpointów:

- lista moich zwrotów/reklamacji
- szczegół zgłoszenia
- lista moich zamówień kwalifikujących się do nowego zgłoszenia
- rozpoczęcie nowego zgłoszenia z poziomu konta

### 6.3 Reguły biznesowe

Trzeba jasno zdefiniować:

- dla jakich statusów zamówienia można zgłosić zwrot
- dla jakich statusów można zgłosić reklamację
- czy do jednego zamówienia można złożyć wiele zgłoszeń
- czy do jednej pozycji można złożyć wiele zgłoszeń
- czy częściowe zwroty i częściowe reklamacje są dozwolone
- czy istnieją limity czasowe i jak są liczone

Obecnie UI sugeruje uproszczony model i trzeba go rozszerzyć.

## 7. Zakres storefrontu

### 7.1 Renderer modułu

Dodać renderer modułu do page buildera storefrontu:

- `client/components/page-builder/modules/returns-portal-module.tsx`
- rejestracja w rendererze modułów

### 7.2 Widoki modułu

W module potrzebne są co najmniej:

- ekran startowy
- lookup zamówienia dla gościa
- wybór zamówienia dla zalogowanego
- lista wcześniejszych zgłoszeń
- formularz nowego zgłoszenia
- ekran sukcesu

### 7.3 Integracja z politykami

Moduł powinien móc odwołać się do:

- strony polityki zwrotów
- strony regulaminu
- strony polityki prywatności

Docelowo przez system pages, nie przez hardcoded URL.

## 8. Konto klienta

### 8.1 Nowe trasy

Dodać:

- `/account/returns`
- `/account/returns/[reference-or-id]`

### 8.2 Zachowanie

Sekcja konta ma być głównym miejscem dla zalogowanego użytkownika, a nie tylko widgetem w szczególe zamówienia.

Szczegół zamówienia może zostać jako skrót:

- pokaż powiązane zgłoszenia
- przycisk `Zgłoś zwrot / reklamację`
- link do pełnej sekcji konta

## 9. Admin

### 9.1 Stan obecny

Sekcja admina dla zwrotów już istnieje w kodzie:

- sidebar: `server/resources/js/components/app-sidebar.tsx`
- routes: `server/routes/admin/ecommerce.php`
- kontroler: `server/app/Http/Controllers/Admin/Ecommerce/ReturnRequestController.php`

### 9.2 Dlaczego możesz jej nie widzieć

Najbardziej prawdopodobne przyczyny:

- moduł `ecommerce` jest wyłączony
- użytkownik nie ma uprawnienia powiązanego z zamówieniami

W obecnym kodzie polityka zwrotów dla admina opiera się o:

- `orders.view`
- `orders.update`
- `orders.delete`

To znaczy, że zwroty nie mają dziś własnego, niezależnego permission namespace.

### 9.3 Co należy poprawić

- zweryfikować, czy sidebar nie powinien uwzględniać jawnego permission check dla `returns`
- rozważyć wydzielenie osobnych uprawnień:
  - `returns.view`
  - `returns.update`
  - `returns.refund`
- poprawić rolę i widoczność sekcji tak, by była przewidywalna dla administratora

## 10. Luki wykryte w obecnym wdrożeniu

### 10.1 Brak dynamiczności

- brak modułu CMS
- brak podpinania do dowolnej strony

### 10.2 Brak pełnego customer area

- klient nie ma centralnej listy swoich zwrotów
- historia jest widoczna tylko per zamówienie

### 10.3 Ograniczenie jednego flow

Obecny UI w szczególe zamówienia ukrywa formularz, gdy zamówienie ma już istniejący zwrot. To może blokować:

- kolejne zgłoszenia do tego samego zamówienia
- niezależne reklamacje po wcześniejszym zwrocie
- częściowe, wieloetapowe procesy

### 10.4 Brak flow guest

- brak publicznego wejścia dla klienta bez konta lub bez zalogowania

## 11. Proponowana kolejność wdrożenia

### Etap 1. Audit i decyzje biznesowe

- spisać ostateczne reguły dla zwrotów i reklamacji
- rozdzielić semantykę `return` vs `complaint`
- ustalić strategię weryfikacji gościa

### Etap 2. Backend API

- dodać guest lookup
- dodać guest submit
- dodać listę i detail dla konta klienta
- ujednolicić walidację i statusy

### Etap 3. Dynamiczny moduł CMS

- dopisać moduł `returns_portal`
- dodać renderer storefrontu
- dodać konfigurację modułu

### Etap 4. Konto klienta

- dodać `/account/returns`
- dodać detail zgłoszenia
- połączyć z historią zamówień

### Etap 5. Admin permissions i UX

- zweryfikować widoczność sekcji
- odseparować permissions od `orders.*`, jeśli to potrzebne
- dopracować filtry, statusy i akcje refundu

### Etap 6. SEO i routing

- upewnić się, że moduł działa pod dowolnym slugiem
- unikać hardcoded `/returns`
- dodać poprawne meta/SEO tylko dla strony CMS

## 12. Priorytety

### P1

- moduł `returns_portal`
- guest lookup + guest submit
- `/account/returns`
- historia zgłoszeń klienta

### P2

- rozdzielenie permissions `returns.*`
- poprawa admin UX
- wielokrotne zgłoszenia do jednego zamówienia

### P3

- rozszerzona konfiguracja modułu
- dodatkowe statusy i automatyzacje
- powiązanie z email templates i notyfikacjami

## 13. Ryzyka

- niejednoznaczne zasady biznesowe dla reklamacji vs zwrotów
- ryzyko ujawnienia danych zamówienia w flow guest, jeśli lookup będzie zbyt słabo zabezpieczony
- konflikty z obecnym uproszczonym UI w szczególe zamówienia
- brak spójnych permissions może mylić administratorów

## 14. Rekomendacja końcowa

Nie rozwijać dalej obecnego rozwiązania wyłącznie w szczególe zamówienia.

Docelowy kierunek powinien być taki:

- publiczny, dynamiczny moduł CMS dla zwrotów i reklamacji
- pełna sekcja konta klienta dla zalogowanych
- zachowanie admina jako operacyjnego panelu obsługi zgłoszeń
- usunięcie zależności od hardcoded ścieżek i lokalnych, jednorazowych flow
