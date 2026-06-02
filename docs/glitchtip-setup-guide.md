# Śledzenie błędów z GlitchTip na k3s — przewodnik wdrożenia i integracji

> **Poziom:** Średni · **Wymagania wstępne:** Wdrożony klaster k3s, podstawy kubectl, Laravel 11/12, Next.js  
> **Czas czytania:** ~15 min · **Czas wdrożenia:** ~20 min  

---

Podczas wdrażania systemów produkcyjnych kluczowe jest natychmiastowe dowiadywanie się o błędach (Exception 500) napotykanych przez użytkowników. Chociaż standardowe logi są wysyłane do `stderr` i można je czytać przez `kubectl logs`, ręczne przeszukiwanie plików tekstowych jest nieefektywne.

W naszym projekcie zintegrowaliśmy **GlitchTip** — w pełni open-source'ową, kompatybilną z Sentry alternatywę, którą hostujemy we własnym klastrze k3s. Ten przewodnik opisuje dokładnie, jak wygląda nasza architektura, jak połączyliśmy aplikacje i jak rozwiązaliśmy problemy z certyfikatami SSL wewnątrz klastra.

---

## Spis treści

1. [Dlaczego GlitchTip?](#1-dlaczego-glitchtip)
2. [Architektura wdrożenia w klastrze](#2-architektura-wdrożenia-w-klastrze)
3. [Integracja z Laravel API (Backend)](#3-integracja-z-laravel-api-backend)
   - [3.1 Konfiguracja Sentry SDK](#31-konfiguracja-sentry-sdk)
   - [3.2 Rejestracja handlera w Laravel 11/12](#32-rejestracja-handlera-w-laravel-1112)
   - [3.3 Kropka nad i: Opcja pomijania weryfikacji SSL](#33-kropka-nad-i-opcja-pomijania-weryfikacji-ssl)
4. [Najważniejszy krok: Wewnętrzne trasowanie mikroserwisów (Bypass SSL)](#4-najważniejszy-krok-wewnętrzne-trasowanie-mikroserwisów-bypass-ssl)
5. [Integracja z Next.js Storefront (Frontend)](#5-integracja-z-next-js-storefront-frontend)
6. [Czyszczenie cache i OPcache na produkcji](#6-czyszczenie-cache-i-opcache-na-produkcji)
7. [Weryfikacja integracji (Testy)](#7-weryfikacja-integracji-testy)

---

## 1. Dlaczego GlitchTip?

*   **100% kompatybilności z Sentry:** Używamy oficjalnych bibliotek `@sentry/nextjs` oraz `sentry/sentry-laravel`. Zmiana z Sentry na GlitchTip wymaga jedynie podmiany adresu `DSN` w pliku `.env`.
*   **Self-hosted & RODO/GDPR:** Wszystkie logi, adresy IP i dane użytkowników nie opuszczają naszego klastra.
*   **Brak limitów:** Limituje nas jedynie pojemność dysku i zasoby bazy danych na naszym serwerze VPS.

---

## 2. Architektura wdrożenia w klastrze

GlitchTip działa w dedykowanej przestrzeni nazw (namespace) `glitchtip` i składa się z trzech głównych komponentów:

```
Klient (Przeglądarka)
       │ (HTTPS)
       ▼
  [ Ingress ] ──► glitchtip-web (Port 80/443) ──► glitchtip-valkey (Redis)
                                │
                                └──► glitchtip-postgresql (Baza danych)
```

Wewnątrz klastra k3s usługi komunikują się za pomocą wewnętrznych nazw DNS:
*   Baza danych: `glitchtip-postgresql.glitchtip.svc.cluster.local:5432`
*   Cache/kolejka (Valkey): `glitchtip-valkey.glitchtip.svc.cluster.local:6379`
*   Serwer WWW GlitchTip: `glitchtip-web.glitchtip.svc.cluster.local:80`

Dla dostępu zewnętrznego (np. dla przeglądarki użytkownika wysyłającej błędy z Next.js) zdefiniowany jest Ingress z certyfikatem SSL:
*   Domena zewnętrzna: `https://glitchtip.laravel-test.shop`

---

## 3. Integracja z Laravel API (Backend)

Do integracji z Laravelem zainstalowaliśmy pakiet `sentry/sentry-laravel`. Aby system poprawnie logował błędy, wykonaliśmy trzy kluczowe zmiany.

### 3.1 Konfiguracja Sentry SDK

W pliku [config/sentry.php](file:///Users/domin/projects/laravel/cms/server/config/sentry.php) zdefiniowaliśmy zmienne środowiskowe, dając priorytet nazewnictwu `GLITCHTIP` nad standardowym `SENTRY`:

```php
return [
    'dsn' => env('GLITCHTIP_DSN', env('SENTRY_LARAVEL_DSN')),
    'http_ssl_verify_peer' => (bool) env('GLITCHTIP_HTTP_SSL_VERIFY', env('SENTRY_HTTP_SSL_VERIFY', true)),
    'environment' => env('APP_ENV', 'production'),
    // ... rest of the configuration
];
```

### 3.2 Rejestracja handlera w Laravel 11/12

W Laravelu 11 i 12 konfiguracja wyjątków została przeniesiona z klasy `Handler.php` do pliku [bootstrap/app.php](file:///Users/domin/projects/laravel/cms/server/bootstrap/app.php). Musieliśmy jawnie połączyć mechanizm wyjątków Laravela z GlitchTipem w sekcji `withExceptions`:

```php
->withExceptions(function (Exceptions $exceptions): void {
    // Ta linijka rejestruje GlitchTip jako handler wyjątków
    \Sentry\Laravel\Integration::handles($exceptions);

    // Twoje pozostałe metody renderowania błędów:
    $exceptions->render(function (AuthenticationException $e, Request $request) {
        ...
    });
})
```

### 3.3 Kropka nad i: Opcja pomijania weryfikacji SSL

Lokalnie lub w środowiskach testowych (sandbox) nasza instancja GlitchTipa może używać samopodpisanego certyfikatu SSL (np. domyślnego certyfikatu Traefika `TRAEFIK DEFAULT CERT`). Standardowo klient cURL w PHP odrzuci połączenie z błędem:
`cURL Error (60) SSL: unable to get local issuer certificate`.

Dzięki dodaniu `'http_ssl_verify'` w konfiguracji Sentry, w środowisku deweloperskim możemy to wyłączyć dodając w `.env`:
```env
GLITCHTIP_HTTP_SSL_VERIFY=false
```

---

## 4. Najważniejszy krok: Wewnętrzne trasowanie mikroserwisów (Bypass SSL)

Najbardziej eleganckim i bezpiecznym rozwiązaniem problemu z SSL wewnątrz klastra jest **całkowite ominięcie weryfikacji SSL poprzez bezpośrednie połączenie HTTP wewnątrz sieci klastra**.

Serwer PHP/Laravel działa w tym samym klastrze co GlitchTip. Zamiast wysyłać logi "na zewnątrz" do publicznej domeny HTTPS, zmieniliśmy konfigurację zmiennej `GLITCHTIP_DSN` w sekrecie klastra `app-server-env`:

*   **Zamiast (Publiczny HTTPS):**
    `GLITCHTIP_DSN=https://klucz@glitchtip.laravel-test.shop/1`
*   **Użyliśmy (Wewnętrzny HTTP):**
    `GLITCHTIP_DSN=http://klucz@glitchtip-web.glitchtip.svc.cluster.local/1`

### Dlaczego to doskonałe rozwiązanie?
1.  **Bypass SSL:** Ponieważ ruch odbywa się wewnątrz bezpiecznej sieci klastra po protokole HTTP (port 80), całkowicie eliminujemy potrzebę weryfikacji certyfikatów SSL w PHP i zapobiegamy błędom `cURL Error 60`.
2.  **Ultra wydajność:** Ruch nie wychodzi poza serwer fizyczny, nie przechodzi przez publiczne bramy ani zewnętrzne zapory. Pakiety są przekazywane bezpośrednio pomiędzy kontenerami na poziomie interfejsu sieciowego klastra.

---

## 5. Integracja z Next.js Storefront (Frontend)

Ponieważ kod frontendu (Next.js) jest uruchamiany w przeglądarce użytkownika (poza siecią klastra), **musi on komunikować się za pomocą publicznej domeny HTTPS**.

Konfiguracja frontendu opiera się na plikach:
*   [sentry.client.config.ts](file:///Users/domin/projects/laravel/cms/client/sentry.client.config.ts) – błędy w przeglądarce klienta.
*   [sentry.server.config.ts](file:///Users/domin/projects/laravel/cms/client/sentry.server.config.ts) – błędy przy SSR i API Routes po stronie Node.js.
*   [sentry.edge.config.ts](file:///Users/domin/projects/laravel/cms/client/sentry.edge.config.ts) – błędy w middleware.

Do pliku `.env` środowiska frontendowego podajemy **publiczny adres DSN**:
```env
NEXT_PUBLIC_GLITCHTIP_DSN=https://klucz-frontend@glitchtip.laravel-test.shop/2
```

---

## 6. Czyszczenie cache i OPcache na produkcji

Podczas dynamicznych aktualizacji plików konfiguracyjnych bezpośrednio na działającym serwerze (np. przy użyciu `kubectl cp`), PHP-FPM może nadal serwować stary kod ze względu na włączone buforowanie skryptów (**OPcache**).

Aby wymusić przeładowanie kodu bez restartu całego kontenera, wyślij sygnał `USR2` do procesu PHP-FPM:

```bash
# Wyczyszczenie cache tras i konfiguracji Laravela
kubectl -n app exec deploy/app-server -- php artisan config:clear
kubectl -n app exec deploy/app-server -- php artisan route:clear

# Przeładowanie OPcache w PHP-FPM (zakładając, że master proces ma PID 20)
kubectl -n app exec deploy/app-server -- kill -USR2 20
```

---

## 7. Weryfikacja integracji (Testy)

Aby upewnić się, czy połączenie z GlitchTip działa poprawnie, uruchom wbudowany test połączenia Sentry bezpośrednio w podzie aplikacji:

```bash
kubectl -n app exec deploy/app-server -- php artisan sentry:test
```

Prawidłowy wynik powinien zakończyć się sukcesem:
```
DSN discovered from Laravel config or `.env` file!
Sending test event...
Test event sent with ID: d5d06e4f24ff4e9188a083c0439e6850
```

Po tym kroku wejdź do swojego panelu GlitchTip i sprawdź listę **Issues** – błąd testowy powinien być widoczny od razu. Zabezpieczyłeś w ten sposób pełny podgląd na stabilność swojej platformy!
