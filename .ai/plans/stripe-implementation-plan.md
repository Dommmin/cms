# Plan wdrożenia Stripe dla płatności zagranicznych

> Status: **draft** | Created: 2026-06-10
> Cel: dodać Stripe jako produkcyjny gateway dla płatności zagranicznych, oparty o oficjalną paczkę Laravel, bez destabilizowania obecnego checkoutu.

---

## 1. Aktualny stan

Stripe jest już częściowo przewidziany w modelu domenowym, ale nie jest wdrożony end-to-end:

- `server/app/Enums/PaymentProviderEnum.php` zawiera `STRIPE`
- `requiresRedirect()` dla Stripe zwraca `true`
- `PaymentGatewayManager` w `server/app/Providers/EcommerceServiceProvider.php` nie rejestruje jeszcze gatewaya Stripe
- checkout frontend nie ma jeszcze metody Stripe w:
  - `client/components/checkout/payment-step.tsx`
  - `client/components/checkout/payment-step.types.ts`
  - `client/api/checkout.ts`
- backend `GET /api/v1/checkout/payment-methods` nie zwraca jeszcze konfiguracji Stripe
- nie istnieje jeszcze:
  - `StripeGateway`
  - integracja Cashier
  - webhook handling dla Stripe
  - testy feature/unit dla Stripe

Wniosek:

- architektura jest przygotowana na nowego providera,
- ale Stripe nie jest jeszcze wdrożony,
- więc wdrożenie powinno być poprowadzone jako osobny pakiet backend + checkout + webhooki + testy.

---

## 2. Decyzja architektoniczna

### Rekomendowany wariant na start: oficjalny Laravel Cashier + Stripe Checkout

Implementację należy oprzeć na **oficjalnej paczce Laravel**:

- `laravel/cashier`

Na pierwszy release nie warto zaczynać od:

- pełnego Stripe Elements / Payment Element osadzonego inline,
- ręcznie pisanego klienta Stripe jako głównej ścieżki integracji,
- przebudowy całego checkoutu pod model “Stripe-first”.

Rekomenduję:

1. dodać `laravel/cashier`,
2. tworzyć Stripe Checkout Session przez Cashier,
3. po złożeniu checkoutu zwracać `redirect_url`,
4. przekierowywać klienta na hostowany checkout Stripe,
5. zamykać status płatności webhookiem Stripe opartym o Cashier,
6. wracać na istniejące strony `checkout/pending` i `checkout/success`.

Powód:

- to jest oficjalny pakiet Laravel dla Stripe,
- Laravel 12 dokumentuje `Checkout`, `Guest Checkouts` i webhook verification,
- to pasuje do obecnego kontraktu `PaymentGatewayInterface`,
- nie wymaga przebudowy istniejącego flow checkoutu,
- jest szybsze do wdrożenia,
- ma mniejsze ryzyko frontendowe i compliance,
- dobrze pasuje do “zagraniczne płatności” jako osobny kanał.

### Wniosek praktyczny

Plan powinien bazować na:

- `composer require laravel/cashier`
- Stripe Checkout Session przez Cashier
- Guest Checkout przez Cashier tam, gdzie użytkownik nie ma konta
- webhook verification przez Cashier / Stripe secret
- własnej cienkiej warstwie domenowej tylko do spięcia z istniejącymi modelami `Order` i `Payment`

Nie budować od zera:

- własnego pełnego SDK wrappera jako podstawowej integracji,
- osobnego webhook stacku tam, gdzie Cashier już pokrywa standardowy flow,
- nowego niezależnego modelu zamówień tylko pod Stripe.

### Czego nie robić w etapie 1

Nie wdrażać od razu:

- pełnego Payment Element,
- saved cards / vaulted cards,
- subscriptions,
- Stripe Connect,
- partial captures,
- dispute workflow,
- wielowalutowego settlement logic po stronie księgowej.

To są osobne etapy.

---

## 3. Wpływ Cashier na obecną architekturę

Cashier jest warstwą integracyjną Stripe. W tym projekcie nie chcemy przepisać checkoutu na “czysty Cashier app”.

To oznacza:

- `Order` i `Payment` pozostają source of truth po stronie sklepu,
- Cashier odpowiada za komunikację ze Stripe i obsługę Checkout Session,
- nasza warstwa mapuje `checkout_session_id`, `payment_intent_id` i webhook eventy do lokalnych rekordów.

### Konsekwencja projektowa

Nie należy przenosić całej logiki checkoutu do standardowego flow Cashier kosztem obecnej domeny commerce.

Zamiast tego:

- utworzyć order i payment po obecnemu,
- przekazać do Stripe / Cashier `metadata`:
  - `order_id`
  - `payment_id`
  - `reference_number`
- po webhooku aktualizować lokalne modele.

### Guest checkout

To jest krytyczne, bo storefront już wspiera gościa.

Plan powinien preferować:

- guest checkout przez Cashier, gdy zamawia gość,
- billable checkout dla `User`, jeśli użytkownik jest zalogowany i chcemy powiązać Stripe customer z kontem.

---

## 4. Zakres etapu 1

### Cel biznesowy

Dodać Stripe jako metodę płatności dla rynków zagranicznych, tak aby klient mógł:

- przejść checkout,
- zostać przekierowanym do Stripe Checkout,
- opłacić zamówienie kartą / walletem / lokalną metodą wspieraną przez Stripe,
- wrócić do sklepu,
- mieć poprawnie zaktualizowany status płatności i zamówienia.

### Cel techniczny

Domknąć pełny flow:

- `checkout -> create order -> create payment -> create stripe checkout session przez Cashier -> redirect -> webhook -> payment completed/failed -> order state updated`

---

## 5. Backend: zakres prac

### 5.1. Instalacja i bootstrap

Dodać:

- `composer require laravel/cashier`
- publikację migracji / configu Cashier
- uruchomienie migracji Cashier

Sprawdzić wpływ na istniejące modele:

- czy `users` może dostać kolumny Cashier bez konfliktu,
- czy `User` będzie billable modelem,
- czy nie ma kolizji z obecną logiką auth i checkout.

### 5.2. Billable model

Rekomendacja etapu 1:

- dodać `Billable` do `User`

ale nie uzależniać całego checkoutu od zalogowanego usera.

Powód:

- zalogowany user dostaje poprawne spięcie ze Stripe customer,
- gość nadal może przejść checkout bez konta.

### 5.3. Warstwa integracyjna Stripe

Zamiast własnego dużego `StripeClient` jako podstawy:

- utworzyć `StripeGateway`, który używa Cashier wewnętrznie,
- ewentualnie dodać bardzo cienki adapter pomocniczy tylko dla mapowania danych do istniejącego kontraktu.

Minimalne klasy:

- `server/app/Infrastructure/Payments/Stripe/StripeGateway.php`

Opcjonalnie:

- mały helper / adapter do budowania Checkout Session payload,
- bez ciężkiego, osobnego `StripeClient.php`, jeśli Cashier pokrywa potrzebny flow.

`StripeGateway` powinien implementować `PaymentGatewayInterface` i obsłużyć:

- `createPayment()`
- `processPayment()`
- `verifyPayment()`
- `refundPayment()`
- `handleWebhook()`

### 5.4. Rejestracja gatewaya

W `server/app/Providers/EcommerceServiceProvider.php`:

- zarejestrować `StripeGateway`
- dodać go do `PaymentGatewayManager`

To jest krytyczne, bo dziś `STRIPE` istnieje w enumie, ale nie ma drivera.

### 5.5. Konfiguracja i secrets

Dodać konfigurację:

- `STRIPE_KEY`
- `STRIPE_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- `CASHIER_CURRENCY`
- opcjonalnie `CASHIER_CURRENCY_LOCALE`
- opcjonalnie `STRIPE_ALLOWED_COUNTRIES`
- opcjonalnie `STRIPE_ALLOWED_CURRENCIES`

Źródła konfiguracji:

- `server/.env.production`
- deployment secret
- `config/services.php`
- `config/cashier.php`
- opcjonalnie panel admina `settings.payments`, jeśli Stripe ma być konfigurowalny z panelu

### 5.6. Payment methods endpoint

W `server/app/Http/Controllers/Api/V1/CheckoutController.php` dodać do `paymentMethods()`:

- `id = stripe`
- `configured = true/false`
- `missing_env = [...]`

To pozwoli frontendowi pokazać metodę tylko wtedy, gdy konfiguracja jest kompletna.

### 5.7. Checkout flow

W `CheckoutController::checkout()` i `CheckoutService` nie trzeba przebudowywać flow zamówienia.

Wystarczy, że:

- `payment_provider = stripe`
- `PaymentGatewayManager->driver('stripe')`
- `processPayment()` utworzy Cashier Checkout Session
- `processPayment()` zwróci:
  - `action = redirect`
  - `redirect_url = stripe checkout session url`

Do Stripe / Cashier trzeba przekazać `metadata`:

- `order_id`
- `payment_id`
- `reference_number`
- opcjonalnie `customer_type`

### 5.8. Webhook Stripe

Dodać webhook Stripe oparty o Cashier.

Obsługiwane eventy minimum:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.payment_failed`
- opcjonalnie `charge.refunded`

Ważne wymagania:

- obowiązkowa weryfikacja podpisu webhooka
- idempotentna obsługa eventów
- mapowanie po `payment.id`, `provider_transaction_id` albo `checkout_session_id`
- brak podwójnego oznaczania zamówienia jako paid

### 5.9. Refunds

Etap 1 powinien przewidywać podstawowy refund API:

- pełny refund przez Stripe
- bez partial refund orchestration w panelu admina, jeśli tego jeszcze nie ma

Jeśli refund UI nie jest jeszcze gotowy, wystarczy:

- poprawna implementacja `refundPayment()`
- backlog dla admin action

---

## 6. Frontend: zakres prac

### 6.1. Checkout method

Dodać Stripe do:

- `client/components/checkout/payment-step.types.ts`
- `client/components/checkout/payment-step.tsx`
- `client/api/checkout.ts`

Nowa metoda powinna mieć osobny `PaymentMethodValue`, np.:

- `stripe`

Opis biznesowy:

- karta / Apple Pay / Google Pay / lokalne metody zależne od kraju przez Stripe Checkout

### 6.2. UX i reguły widoczności

Stripe nie powinien być pokazany “wszędzie zawsze”.

Rekomendowane reguły:

- pokazywać Stripe dla krajów innych niż PL jako domyślną rekomendację,
- opcjonalnie pokazywać też w PL, ale niżej niż lokalne metody,
- jeśli waluta nie jest wspierana przez etap 1, metoda ma się ukryć albo być disabled.

Lepiej, żeby:

- backend zwracał listę metod już przefiltrowaną per koszyk / kraj / waluta.

### 6.3. Success / pending pages

Obecne strony:

- `client/app/checkout/pending`
- `client/app/checkout/success`

powinny działać bez specjalnych wyjątków dla Stripe.

Potrzebne jest tylko upewnienie się, że:

- redirect ze Stripe wraca na istniejący URL,
- polling / status page widzi, że webhook już oznaczył płatność jako completed,
- użytkownik nie dostaje sprzecznych komunikatów typu “pending” po sukcesie.

### 6.4. PWA / mobile

Nie trzeba robić osobnej implementacji mobile-first dla Stripe w etapie 1.

Wystarczy:

- redirect na hostowany checkout,
- poprawny powrót do storefrontu,
- smoke test na mobile viewport.

---

## 7. Dane, model i mapowanie statusów

### Payment model

Trzeba ustalić, co trzymamy w `payments.payload` dla Stripe.

Minimalnie:

- `checkout_session_id`
- `payment_intent_id`
- `customer_email`
- `status snapshot`

### Mapowanie statusów

Stripe -> lokalne statusy:

- paid / completed -> `PaymentStatusEnum::COMPLETED`
- failed / expired / canceled -> `PaymentStatusEnum::FAILED`
- open / pending -> `PaymentStatusEnum::PENDING`

Order:

- po sukcesie -> `OrderStatusEnum::PAID`
- po porażce nie oznaczać automatycznie jako cancelled bez osobnej reguły biznesowej

---

## 8. Kwestie międzynarodowe

Ponieważ celem jest “płatności zagraniczne”, plan musi jawnie objąć:

### 8.1. Waluty

Decyzja P0:

- czy etap 1 działa tylko z obecną walutą orderu,
- czy Stripe ma od razu wspierać wielowalutowość.

Rekomendacja:

- etap 1: użyć waluty już wyliczonej na orderze,
- nie mieszać teraz logiki FX, settlement i księgowania.

`CASHIER_CURRENCY` nie może stać się nowym source of truth dla order total.

### 8.2. Kraje

Decyzja P0:

- które kraje dostają Stripe,
- czy Stripe jest fallbackiem dla wszystkich non-PL,
- czy są kraje wykluczone.

Rekomendacja:

- `PL`: lokalne metody na górze, Stripe opcjonalnie niżej albo wyłączony
- `EU/non-PL`: Stripe jako primary online method

### 8.3. VAT / billing address

Stripe nie zastępuje logiki podatkowej sklepu.

To znaczy:

- ceny, tax i order total dalej liczy backend sklepu,
- Stripe dostaje finalny amount,
- nie przenosić source of truth dla kwot do Stripe.

---

## 9. Testy

### 9.1. Backend tests

Dodać minimum:

- feature test: `GET /checkout/payment-methods` pokazuje `stripe`
- feature test: checkout ze `stripe` tworzy payment i zwraca `redirect_url`
- feature test: webhook z prawidłowym podpisem oznacza payment jako completed
- feature test: webhook z błędnym podpisem zwraca `400`
- feature test: idempotentny webhook nie duplikuje efektów
- unit test: mapowanie statusów Stripe -> lokalne statusy
- unit/feature test: refund flow

### 9.2. Frontend tests

Dodać minimum:

- checkout pokazuje Stripe jako metodę, gdy backend zwraca `configured = true`
- checkout nie pokazuje / blokuje Stripe, gdy config jest niepełny
- submit checkout ze Stripe kończy się redirect flow

### 9.3. E2E

Dla Stripe warto dodać przynajmniej 1 krytyczny sandbox flow:

1. dodanie produktu do koszyka
2. checkout guest
3. wybór Stripe
4. przejście do Stripe Checkout
5. symulacja sukcesu sandbox
6. powrót do storefrontu
7. status order/payment poprawny

Nie trzeba od razu budować dużej matrycy E2E.

---

## 10. Operacje i bezpieczeństwo

### Wymagania obowiązkowe

- `STRIPE_WEBHOOK_SECRET` tylko w secretach deploymentu
- signed webhook verification przez Cashier / Stripe
- idempotencja
- timeouty outbound HTTP
- sensowne logowanie błędów bez wycieku secretów
- retry strategy dla chwilowych błędów Stripe API

### Monitoring

Dodać alerty na:

- błędy tworzenia Checkout Session
- failed webhook verification
- stuck payments `pending` > określony czas
- refund failures

---

## 11. Proponowana kolejność wdrożenia

### Etap 1: bootstrap Cashier

- dodać `laravel/cashier`
- opublikować migracje i config
- dodać `Billable` do `User`
- ustalić mapowanie customer / guest checkout

### Etap 2: backend Stripe gateway

- dodać `StripeGateway`
- wpiąć do `PaymentGatewayManager`
- dodać config do `services.php`, `cashier.php` i `paymentMethods()`

### Etap 3: checkout redirect flow

- dodać Stripe do checkout UI
- dodać `payment_provider = stripe`
- utworzyć Cashier Checkout Session
- zwrócić `redirect_url`

### Etap 4: webhooki i statusy

- skonfigurować webhook route
- signature verification
- status mapping
- idempotencja

### Etap 5: testy

- backend feature/unit
- frontend smoke
- 1 sandbox E2E

### Etap 6: rollout produkcyjny

- włączyć tylko dla wybranych krajów
- obserwować błędy i porzucone płatności
- dopiero potem rozszerzać zasięg

---

## 12. Done criteria

Stripe można uznać za wdrożony dopiero wtedy, gdy:

- checkout zwraca prawidłowy redirect do Stripe,
- webhook poprawnie zamyka płatność,
- order przechodzi do `paid`,
- refund działa co najmniej technicznie na poziomie gatewaya,
- testy backendowe przechodzą,
- przynajmniej jeden sandbox E2E przechodzi,
- rollout jest ograniczony do zdefiniowanych krajów / walut.

---

## 13. Referencja implementacyjna

Plan bazuje na oficjalnej dokumentacji Laravel Cashier (Stripe):

- instalacja `laravel/cashier`
- Stripe Checkout
- Guest Checkouts
- webhook signature verification
- Payment Intents jako opcjonalny kolejny etap, nie etap 1

Źródło:

- [Laravel Cashier (Stripe)](https://laravel.com/docs/12.x/billing)

---

## 14. Rekomendacja końcowa

Najrozsądniejszy scope to:

- **oficjalny `laravel/cashier`**
- **Stripe Checkout Session**
- **redirect-based integration**
- **ograniczenie do zagranicznych rynków**
- **bez przebudowy obecnego checkoutu na embedded Stripe Elements**

To daje szybki, bezpieczny i zgodny z obecną architekturą sposób wejścia w płatności zagraniczne.
