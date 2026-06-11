# Prompts: Security / Auth / Identity

Gotowe prompty dla agenta pracującego nad bezpieczeństwem tożsamości, sesji i operacji wrażliwych.

## 1. Full Audit Prompt

```text
Przeprowadź pełny audit security / auth / identity dla CMS + Ecommerce.

Zakres:
- login, register, logout, reset password, email verification
- 2FA / OTP / recovery codes / passkeys / WebAuthn
- session security, device management, trusted devices, session invalidation
- authorization: roles, permissions, policies, guards
- sensitive operations: profile, email change, password change, account deletion, refunds, role changes, settings, impersonation, exports
- auditability: login history, failed login history, security events, admin action history
- abuse protection: rate limiting, enumeration, brute force, replay, CSRF, session fixation

Wymagania:
- nie zgaduj, sprawdzaj kod i testy
- porównaj storefront users i admin users osobno
- podaj MUST / SHOULD / COULD
- wskaż ryzyka i konkretne miejsca w kodzie
- jeśli coś jest częściowo wdrożone, opisz dokładnie co działa i czego brakuje
```

## 2. Backend Fix Prompt

```text
Napraw backendowy problem security/auth w tym projekcie.

Praca:
- znajdź minimalny root cause w kodzie
- zmień tylko niezbędne pliki
- dodaj lub zaktualizuj Pest tests
- utrzymaj zgodność z aktualnym stylem Laravel
- użyj FormRequest tam, gdzie jest walidacja
- nie dodawaj obejść ani globalnych wyjątków

Po zmianie sprawdź:
- login / session / passkey / 2FA / reset-password flow zależnie od obszaru
- wpływ na permissions i policies
- czy nie powstał nowy problem enumeration lub privilege escalation
```

## 3. Frontend Security UX Prompt

```text
Zaktualizuj storefront lub admin security UI tak, aby był spójny i bezpieczny.

Zasady:
- frontend ma pokazywać gotowy stan z API, nie liczyć go lokalnie
- nie wymyślaj własnych kontraktów, sprawdź `client/types/api.ts`
- dla akcji high-risk dodaj czytelny step-up UX
- zachowaj zgodność z istniejącym design systemem
- jeśli zmieniasz auth methods lub device/session UX, pokaż konsekwencje dla użytkownika

Cel:
- prosty, czytelny security center
- jasne komunikaty recovery i verification
- brak niejasnych edge case'ów dla 2FA/passkeys/sessions
```

## 4. Admin Authorization Prompt

```text
Przeanalizuj authorization dla admin/backoffice i doprowadź ją do poziomu produkcyjnego.

Sprawdź:
- które role mogą wejść do panelu
- które role mogą wykonać konkretne akcje
- czy krytyczne operacje mają `authorizeResource` albo jawne `authorize(...)`
- czy eksporty, refundy, settings, role changes i impersonation są odpowiednio ograniczone

Wynik ma zawierać:
- konkretne braki w guardach i policy
- propozycję minimalnego safe fix
- testy, które potwierdzają granice dostępu
```

## 5. Recovery / Reset Prompt

```text
Przeanalizuj i uporządkuj recovery flow:
- forgot password
- reset password
- email verification resend
- OTP login
- passkey login fallback
- 2FA challenge and recovery codes

Szukaj:
- user enumeration
- braków rate limiting
- zbyt łatwego odzyskania konta po kompromitacji
- niespójnych komunikatów i kontraktów API

Wynik:
- wskaż, co jest niebezpieczne
- zaproponuj jedną spójną politykę odzyskiwania konta
- dopasuj UX do ecommerce i adminów osobno
```

