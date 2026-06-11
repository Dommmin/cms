# Plan: Security / Auth / Identity Roadmap dla CMS + Ecommerce

Data: 2026-06-11
Zakres: storefront, API, admin backoffice, sesje, recovery, auditability, sensitive operations
Status: plan po review

## 1. Cel

Doprowadzić model tożsamości i bezpieczeństwa do poziomu odpowiedniego dla realnego ecommerce i panelu administracyjnego, w którym przetwarzane są:

- dane klientów,
- operacje finansowe,
- publikacja i edycja treści CMS,
- działania supportowe i operacyjne,
- zgłoszenia refundów, zwrotów, zmian ról i ustawień integracji.

Docelowo system ma być:

- bezpieczny,
- spójny między storefrontem i adminem,
- wygodny dla użytkowników nietechnicznych,
- audytowalny,
- odporny na nadużycia,
- rozsądny produktowo, bez przerostu mechanizmów.

## 2. Stan obecny

### 2.1 Co już istnieje

- Dwa rozdzielone tory auth:
  - `Fortify` dla admin panelu (`/panel/*`) na sesjach cookie,
  - `Sanctum` dla API (`/api/v1/*`) na tokenach bearer.
- Admin ma:
  - 2FA/TOTP,
  - recovery codes,
  - passkey support,
  - session timeout middleware,
  - activity log dla wybranych modeli,
  - impersonation klienta.
- Storefront ma:
  - login/register/reset password,
  - email verification,
  - OTP login,
  - passkeys,
  - social login,
  - listę sesji tokenowych,
  - część flow GDPR.
- Jest rate limiting dla auth endpointów.
- Jest audyt zależności przez `make audit`.

### 2.2 Co wygląda na częściowo wdrożone

- `passkeys` mają konfigurację z `password.confirm` dla management routes, ale custom API dla passkeys i 2FA nie wymusza step-up.
- Storefront pokazuje security center dla klienta, ale kontrakt `me` nie jest kompletny względem frontendu.
- Admin ma role i permissions, ale model dostępu do wielu akcji jest bardziej oparty na wejściu do panelu niż na per-action authorization.
- Activity log istnieje, ale nie obejmuje pełnego lifecycle auth i security events.

### 2.3 Główne luki

- brak step-up przy zmianie e-maila i przy operacjach auth methods,
- brak re-verify e-mail po zmianie adresu,
- brak dedykowanej historii loginów i failed logins,
- brak trusted devices / suspicious activity / new device alerting,
- zbyt szeroki dostęp części ról do panelu i krytycznych operacji,
- password reset i OTP mają słabe lub niejednoznaczne granice bezpieczeństwa,
- auth UX nie jest jeszcze spójny między klientem i adminem.

## 3. Priorytety

### 3.1 MUST

1. Wymusić step-up i reautoryzację dla operacji wysokiego ryzyka.
2. Domknąć model zmiany e-maila, weryfikacji i odzyskiwania konta.
3. Rozdzielić panelowe role od faktycznych uprawnień do akcji.
4. Dodać podstawowe bezpieczeństwo abuse protection dla password reset, OTP, passkeys i auth endpoints.
5. Ustawić audyt dla krytycznych operacji tożsamości i administracji.

### 3.2 SHOULD

1. Dodać pełną historię sesji i urządzeń dla klientów i adminów.
2. Dodać alerty / ślady zdarzeń dla podejrzanych zmian.
3. Uporządkować kontrakty API auth dla frontendów.
4. Ujednolicić permission model dla finansów, zwrotów, CMS publish i settings.

### 3.3 COULD

1. Trusted devices.
2. Risk-based auth.
3. Passkey-first login.
4. WebAuthn jako drugi czynnik także dla adminów.
5. Approval flow dla wybranych operacji finansowych.

## 4. Zakres wdrożenia

### 4.1 Klienci / storefront

- Login, register, OTP, password reset, email verification.
- Passkeys i 2FA jako główne metody bezpieczeństwa konta.
- Account security center.
- Session/device management.
- Reset/recovery flow bez user enumeration.
- Step-up przy:
  - zmianie e-maila,
  - zmianie hasła,
  - usuwaniu konta,
  - dodawaniu/usuwaniu passkey,
  - włączaniu/wyłączaniu 2FA,
  - regeneracji recovery codes,
  - eksporcie danych.

### 4.2 Admin / backoffice

- Login do panelu.
- 2FA obowiązkowe.
- Password confirmation przed krytycznymi akcjami.
- Session timeout i session inventory.
- Impersonation z pełnym logiem i wyjściem.
- Refundy, order operations, settings, role changes, exports i CMS publish jako operations wysokiego ryzyka.
- Per-action authorization zamiast samego `admin` middleware.

## 5. Proponowana kolejność

### Etap 1

- Naprawić change-email flow.
- Wymusić step-up dla auth methods.
- Zlikwidować enumeration na reset password.
- Uporządkować kontrakt `me` i security DTO.

### Etap 2

- Rozdzielić permissions dla admin panelu.
- Dodać audyt zdarzeń auth/security.
- Wprowadzić session/device management dla wszystkich istotnych flow.

### Etap 3

- Dodać trusted devices i alerting.
- Rozważyć risk-based auth i passkey-first UX.
- Rozważyć step-up na refundy i settings integracji.

## 6. Decyzje produktowe do potwierdzenia

- Czy OTP email ma być:
  - loginem tylko dla istniejących kont,
  - czy pełnym passwordless signup flow?
- Czy passkeys mają być:
  - tylko opcją dodatkową,
  - czy promowanym domyślnym loginem?
- Czy admin support ma mieć dostęp do impersonation wprost, czy przez ograniczony workflow zatwierdzany?
- Czy refundy i settings płatnicze powinny wymagać dodatkowego step-up lub 4-eyes approval?

