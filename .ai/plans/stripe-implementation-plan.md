# Plan wdrożenia Stripe dla płatności zagranicznych

> Status: **draft** | Created: 2026-06-10
> Cel: dodać Stripe jako produkcyjny gateway dla płatności zagranicznych bez destabilizowania obecnego checkoutu opartego głównie o redirect-based providers.

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
  - `StripeClient`
  - webhook verifier / webhook handler dla Stripe
  - testy feature/unit dla Stripe

Wniosek:

- architektura jest przygotowana na nowego providera,
- ale Stripe nie jest jeszcze nawet w stanie "partial integration",
- więc wdrożenie powinno być poprowadzone jako osobny, zamknięty pakiet backend + checkout + webhooki + testy.

---

## 2. Decyzja architektoniczna

### Rekomendowany wariant na start: Stripe Checkout Session

Na pierwszy release nie warto zaczynać od pełnego Stripe Elements / Payment Element osadzonego inline w checkout.

Rekomenduję:

1. backend tworzy Stripe Checkout Session,
2. frontend po złożeniu checkoutu dostaje `redirect_url`,
3. klient jest przekierowany do hostowanego checkoutu Stripe,
4. status zamówienia jest domykany webhookiem Stripe,
5. storefront wraca na istniejącą stronę `checkout/pending` albo `checkout/success`.

Powód:

- to pasuje do obecnego kontraktu `PaymentGatewayInterface`,
- nie wymaga przebudowy istniejącego flow checkoutu,
- jest szybsze do wdrożenia,
- ma mniejsze ryzyko frontendowe i compliance,
- dobrze pasuje do “zagraniczne płatności” jako osobny kanał.

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

## 3. Zakres etapu 1

### Cel biznesowy

Dodać Stripe jako metodę płatności dla rynków zagranicznych, tak aby klient mógł:

- przejść checkout,
- zostać przekierowanym do Stripe Checkout,
- opłacić zamówienie kartą / walletem dostępnych metod Stripe,
- wrócić do sklepu,
- mieć poprawnie zaktualizowany status płatności i zamówienia.

### Cel techniczny

Domknąć pełny flow:

- `checkout -> create order -> create stripe session -> redirect -> webhook -> payment completed/failed -> order state updated`

---

## 4. Backend: zakres prac

### 4.1. Warstwa infrastruktury płatności

Dodać:

- `server/app/Infrastructure/Payments/Stripe/StripeClient.php`
- `server/app/Infrastructure/Payments/Stripe/StripeGateway.php`
- opcjonalnie `server/app/Infrastructure/Payments/Stripe/StripeWebhookVerifier.php`

`StripeClient` powinien odpowiadać za:

- tworzenie Checkout Session,
- pobieranie statusu sesji / payment intent,
- refund,
- mapowanie odpowiedzi Stripe do prostego kontraktu domenowego.

`StripeGateway` powinien implementować `PaymentGatewayInterface` i obsłużyć:

- `createPayment()`
- `processPayment()`
- `verifyPayment()`
- `refundPayment()`
- `handleWebhook()`

### 4.2. Rejestracja gatewaya

W `server/app/Providers/EcommerceServiceProvider.php`:

- zarejestrować `StripeClient`
- zarejestrować `StripeGateway`
- dodać go do `PaymentGatewayManager`

To jest krytyczne, bo dziś `STRIPE` istnieje w enumie, ale nie ma drivera.

### 4.3. Konfiguracja i secrets

Dodać konfigurację:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SANDBOX` albo po prostu osobne klucze test/live
- opcjonalnie `STRIPE_ALLOWED_COUNTRIES`
- opcjonalnie `STRIPE_ALLOWED_CURRENCIES`

Źródła konfiguracji:

- `server/.env.production` / secret deploymentu
- `config/services.php`
- opcjonalnie panel admina `settings.payments`, jeśli Stripe ma być konfigurowalny tak jak PayU/P24/Paynow

### 4.4. Payment methods endpoint

W `server/app/Http/Controllers/Api/V1/CheckoutController.php` dodać do `paymentMethods()`:

- `id = stripe`
- `configured = true/false`
- `missing_env = [...]`

To pozwoli frontendowi pokazać metodę tylko wtedy, gdy konfiguracja jest kompletna.

### 4.5. Checkout flow

W `CheckoutController::checkout()` i `CheckoutService` nie trzeba przebudowywać flow zamówienia.

Wystarczy, że:

- `payment_provider = stripe`
- `PaymentGatewayManager->driver('stripe')`
- `processPayment()` zwróci:
  - `action = redirect`
  - `redirect_url = stripe checkout session url`

### 4.6. Webhook Stripe

Dodać endpoint webhooka Stripe, np.:

- `POST /api/v1/webhooks/stripe`

Obsługiwane eventy minimum:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.payment_failed`
- opcjonalnie `charge.refunded`

Ważne wymagania:

- obowiązkowa weryfikacja podpisu webhooka,
- idempotentna obsługa eventów,
- mapowanie po `payment.id` / `provider_transaction_id` / `session_id`,
- brak podwójnego oznaczania zamówienia jako paid.

### 4.7. Refunds

Etap 1 powinien przewidywać podstawowy refund API w gatewayu:

- pełny refund,
- bez partial refund orchestration w panelu admina, jeśli tego jeszcze nie ma.

Jeśli refund UI nie jest jeszcze gotowy, wystarczy:

- poprawna implementacja `refundPayment()`,
- backlog dla admin action.

---

## 5. Frontend: zakres prac

### 5.1. Checkout method

Dodać Stripe do:

- `client/components/checkout/payment-step.types.ts`
- `client/components/checkout/payment-step.tsx`
- `client/api/checkout.ts`

Nowa metoda powinna mieć osobny `PaymentMethodValue`, np.:

- `stripe`

Opis biznesowy:

- karta / Apple Pay / Google Pay / lokalne metody zależne od kraju w Stripe Checkout

### 5.2. UX i reguły widoczności

Stripe nie powinien być pokazany “wszędzie zawsze”.

Rekomendowane reguły:

- pokazywać Stripe dla krajów innych niż PL jako domyślną rekomendację,
- opcjonalnie pokazywać też w PL, ale niżej niż lokalne metody,
- jeśli waluta nie jest wspierana przez etap 1, metoda ma się ukryć albo być disabled.

To oznacza, że warto dodać prostą regułę po frontendzie albo jeszcze lepiej:

- backend zwraca listę metod już przefiltrowaną per koszyk / kraj / waluta.

### 5.3. Success / pending pages

Obecne strony:

- `client/app/checkout/pending`
- `client/app/checkout/success`

powinny działać bez specjalnych wyjątków dla Stripe.

Potrzebne jest tylko upewnienie się, że:

- redirect ze Stripe wraca na istniejący URL,
- polling / status page potrafi zobaczyć, że webhook już oznaczył płatność jako completed,
- użytkownik nie dostaje sprzecznych komunikatów typu “pending” po sukcesie.

### 5.4. PWA / manifest / mobile

Nie trzeba robić osobnej implementacji mobile-first dla Stripe w etapie 1.

Wystarczy:

- redirect na hostowany checkout,
- poprawny powrót do aplikacji / storefrontu,
- smoke test na mobile viewport.

---

## 6. Dane, model i mapowanie statusów

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

## 7. Kwestie międzynarodowe

Ponieważ celem jest “płatności zagraniczne”, plan musi jawnie objąć:

### 7.1. Waluty

Decyzja P0:

- czy etap 1 działa tylko z obecną walutą orderu,
- czy Stripe ma od razu wspierać wielowalutowość.

Rekomendacja:

- etap 1: użyć waluty już wyliczonej na orderze,
- nie mieszać teraz logiki FX, settlement i księgowania.

### 7.2. Kraje

Decyzja P0:

- które kraje dostają Stripe,
- czy Stripe jest fallbackiem dla wszystkich non-PL,
- czy są kraje wykluczone.

Rekomendacja:

- `PL`: lokalne metody na górze, Stripe opcjonalnie niżej albo wyłączony
- `EU/non-PL`: Stripe jako primary online method

### 7.3. VAT / billing address

Stripe nie zastępuje logiki podatkowej sklepu.

To znaczy:

- ceny, tax i order total dalej liczy backend sklepu,
- Stripe dostaje finalny amount,
- nie przenosić source of truth dla kwot do Stripe.

---

## 8. Testy

### 8.1. Backend tests

Dodać minimum:

- feature test: `GET /checkout/payment-methods` pokazuje `stripe`
- feature test: checkout ze `stripe` tworzy payment i zwraca `redirect_url`
- feature test: webhook z prawidłowym podpisem oznacza payment jako completed
- feature test: webhook z błędnym podpisem zwraca `400`
- feature test: idempotentny webhook nie duplikuje efektów
- unit test: mapowanie statusów Stripe -> lokalne statusy
- unit/feature test: refund flow

### 8.2. Frontend tests

Dodać minimum:

- checkout pokazuje Stripe jako metodę, gdy backend zwraca `configured = true`
- checkout nie pokazuje / blokuje Stripe, gdy config jest niepełny
- submit checkout ze Stripe kończy się redirect flow

### 8.3. E2E

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

## 9. Operacje i bezpieczeństwo

### Wymagania obowiązkowe

- webhook secret tylko w secretach deploymentu
- signed webhook verification
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

## 10. Proponowana kolejność wdrożenia

### Etap 1: backend skeleton

- dodać `StripeClient`
- dodać `StripeGateway`
- wpiąć do `PaymentGatewayManager`
- dodać config do `services.php`
- dodać `stripe` do `paymentMethods()`

### Etap 2: checkout redirect flow

- dodać Stripe do checkout UI
- dodać `payment_provider = stripe`
- zwrócić `redirect_url`
- sprawdzić success/pending flow

### Etap 3: webhooki i statusy

- endpoint webhooka
- signature verification
- status mapping
- idempotencja

### Etap 4: testy

- backend feature/unit
- frontend smoke
- 1 sandbox E2E

### Etap 5: rollout produkcyjny

- włączyć tylko dla wybranych krajów
- obserwować błędy i porzucone płatności
- dopiero potem rozszerzać zasięg

---

## 11. Done criteria

Stripe można uznać za wdrożony dopiero wtedy, gdy:

- checkout zwraca prawidłowy redirect do Stripe,
- webhook poprawnie zamyka płatność,
- order przechodzi do `paid`,
- refund działa co najmniej technicznie na poziomie gatewaya,
- testy backendowe przechodzą,
- przynajmniej jeden sandbox E2E przechodzi,
- rollout jest ograniczony do zdefiniowanych krajów / walut.

---

## 12. Rekomendacja końcowa

Najrozsądniejszy scope to:

- **Stripe Checkout Session**
- **redirect-based integration**
- **ograniczenie do zagranicznych rynków**
- **bez przebudowy obecnego checkoutu na embedded Stripe Elements**

To daje szybki, bezpieczny i zgodny z obecną architekturą sposób wejścia w płatności zagraniczne.
