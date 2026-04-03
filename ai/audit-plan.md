# Audyt i Plan Rozwoju CMS — Enterprise Readiness

> **Data audytu:** 2026-04-02
> **Cel:** Doprowadzenie projektu do poziomu enterprise (Shopify, Media Expert, x-kom)
> **Aktualny poziom gotowości:** ~70% mid-market, ~50% enterprise

---

## Spis treści

1. [Audyt Bezpieczeństwa](#1-audyt-bezpieczeństwa)
2. [Zgodność ze Standardami Projektu](#2-zgodność-ze-standardami-projektu)
3. [Luki w Funkcjonalnościach](#3-luki-w-funkcjonalnościach)
4. [Infrastruktura i DevOps](#4-infrastruktura-i-devops)
5. [Testy](#5-testy)
6. [Podsumowanie Ocen](#6-podsumowanie-ocen)
7. [Plan Priorytetów](#7-plan-priorytetów)

---

## 1. Audyt Bezpieczeństwa

### 1.1 Krytyczne (do naprawy natychmiast)

| #  | Problem                             | Lokalizacja                                                                                                                                             | Ryzyko                                                            | Rozwiązanie                                                                                                                                         |
|----|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| S1 | **XSS — brak sanityzacji HTML**     | 6 miejsc z `dangerouslySetInnerHTML` bez DOMPurify: product descriptions, blog content, rich-text blocks, accordion, two-columns, **custom-html block** | Wysokie — skompromitowane konto admina = pełny XSS na frontendzie | ~~Zainstalować `dompurify` + `@types/dompurify`, sanityzować KAŻDY HTML przed renderem. Custom-html block jest najwyższym ryzykiem~~ **NAPRAWIONE** |
| S2 | **~~Brak Content-Security-Policy~~** ✅ | **NAPRAWIONE:** Dodano CSP headers z nonce w Next.js middleware, obsługiwane inline scripts z nonce |
| S3 | **~~CORS wildcard w produkcji~~** ✅ | **NAPRAWIONE:** Usunięto domyślny wildcard, CORS_ALLOWED_ORIGINS wymagane w .env produkcyjnym                                                           |
| S4 | **~~Brak error trackingu~~** ✅ | **NAPRAWIONE:** Zainstalowano Sentry (backend + frontend), skonfigurowano alerting |

### 1.2 Średnie (do naprawy przed publicznym wdrożeniem)

| #   | Problem                                             | Lokalizacja                                                                             | Ryzyko                                                       | Rozwiązanie                                                                               |
|-----|-----------------------------------------------------|-----------------------------------------------------------------------------------------|--------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| S5  | **Słaba walidacja hasła przy zmianie**              | `UpdatePasswordRequest` — tylko `min:8`                                                 | Średnie — użytkownicy mogą ustawiać słabe hasła              | Użyć tych samych reguł co `RegisterRequest` (mixed case, numbers, symbols, uncompromised) |
| S6  | **P24 webhook bez weryfikacji przed kolejkowaniem** | `WebhookController` — P24 dispatched do queue bez uprzedniej weryfikacji sygnatury      | Średnie — niezweryfikowane dane mogą trafić do przetwarzania | Weryfikować sygnaturę P24 synchronicznie PRZED dispatch do queue (jak PayU)               |
| S7  | **Brak CSRF tokenów na frontendzie**                | `client/lib/axios.ts` — POST requesty bez explicit CSRF                                 | Średnie — polega wyłącznie na cookies + withCredentials      | Dodać CSRF token w headerze dla state-changing requestów                                  |
| S8  | **Dane bankowe w sessionStorage**                   | `client/app/checkout/success/page.tsx`                                                  | Średnie — widoczne w DevTools                                | Użyć memory-only state zamiast sessionStorage                                             |
| S9  | **Cookie admina bez walidacji**                     | `client/app/layout.tsx` — `admin_preview` cookie parsowane bez walidacji struktury JSON | Średnie — potencjalny injection                              | Walidować strukturę cookie przez Zod schema                                               |
| S10 | **Brak rotacji tokenów API**                        | Sanctum tokens bez konfiguracji wygasania                                               | Średnie — skradzione tokeny ważne bezterminowo               | Skonfigurować `expiration` w `config/sanctum.php`                                         |

### 1.3 Niskie (rekomendacje)

| #   | Problem                             | Rozwiązanie                                                          |
|-----|-------------------------------------|----------------------------------------------------------------------|
| S11 | Parsowanie cookies przez regex      | Użyć biblioteki `js-cookie` zamiast regex w `axios.ts`               |
| S12 | Brak IP whitelistingu dla admina    | Dodać middleware ograniczający dostęp do `/admin` po IP              |
| S13 | Brak session timeout dla admina     | Skonfigurować krótszy czas wygaśnięcia sesji dla admina              |
| S14 | Brak security scanning w CI/CD      | Dodać `composer audit`, `npm audit`, SAST (Snyk/Semgrep) do pipeline |
| S15 | Brak szyfrowania danych w spoczynku | Dokumentacja strategii encryption at rest dla DB + S3                |

---

## 2. Zgodność ze Standardami Projektu

### 2.1 PHP / Laravel — co jest OK

| Standard                                  | Status  | Uwagi                                                 |
|-------------------------------------------|---------|-------------------------------------------------------|
| `declare(strict_types=1)`                 | ✅ 100%  | Każdy plik PHP                                        |
| `Model::query()` zamiast `DB::`           | ✅ OK    | Brak `DB::` w kontrolerach                            |
| Eager loading relacji                     | ✅ Dobry | ProductController, OrderController poprawne           |
| FormRequest dla walidacji                 | ✅ 100%  | Każdy endpoint ma dedykowany FormRequest              |
| `env()` tylko w `config/`                 | ✅ OK    | Brak bezpośrednich wywołań `env()` poza config        |
| API controllers extend `ApiController`    | ✅ OK    | Wszystkie API kontrolery dziedziczą z `ApiController` |
| Helpery `$this->ok()`, `$this->created()` | ✅ OK    | Brak bezpośrednich `response()->json()`               |
| Pint formatting                           | ✅ OK    | Skonfigurowane w CI                                   |
| Return type declarations                  | ✅ OK    | Wszystkie metody kontrolerów mają typy zwracane       |

### 2.2 TypeScript / Next.js — co jest OK

| Standard                              | Status | Uwagi                |
|---------------------------------------|--------|----------------------|
| Typy w osobnych `.types.ts`           | ✅ OK   | 86 plików z typami   |
| `strict: true` w tsconfig             | ✅ OK   | Pełny strict mode    |
| `serverFetch()` dla server components | ✅ OK   | Poprawne użycie      |
| `api` z `lib/axios.ts` dla client     | ✅ OK   | Spójne               |
| `useLocalePath()` dla linków          | ✅ OK   | Konsekwentne         |
| Typy API w `client/types/api.ts`      | ✅ OK   | 655 linii, kompletne |

### 2.3 Naruszenia standardów do naprawy

| #  | Naruszenie                               | Szczegóły                                                                                              |
|----|------------------------------------------|--------------------------------------------------------------------------------------------------------|
| N1 | **2 type casty `as any` / `as unknown`** | `featured-products.tsx`: `as unknown as Product`, `store-map-inner.tsx`: `as any` — naprawić typowanie |
| N2 | **Brak aktualizacji `ai/guide.md`**      | Kilka nowych feature'ów (blog comments/votes/views, promotions) nie zaktualizowanych w guide           |
| N3 | **~~38 failing testów w CI~~** ✅         | **NAPRAWIONE:** Wszystkie 138 testów przechodzi, CI stabilne                                          |
| N4 | **Brak label na polach formularzy**      | `newsletter-form.tsx`, `_search-client.tsx` — brak `<label htmlFor>`                                   |

---

## 3. Luki w Funkcjonalnościach

### 3.1 Produkty (8/10)

**Brakuje:**
- [ ] Produkty bundlowane / zestawy (kup 3 w cenie 2)
- [x] Produkty cyfrowe / pliki do pobrania
- [x] Zdjęcia per wariant (nie tylko na poziomie produktu)
- [ ] Pre-order / backorder status
- [ ] Multi-warehouse inventory (wiele magazynów)
- [x] Kody kreskowe / EAN / UPC management

### 3.2 Zamówienia (7/10)

**Brakuje:**
- [ ] Częściowe zwroty (partial refunds) — aktualnie all-or-nothing
- [ ] Częściowe wysyłki (partial shipments)
- [ ] Workflow fulfillmentu (approve → pick → pack → ship)
- [ ] Zamówienia subskrypcyjne (recurring orders)
- [ ] Draft orders (zamówienia robocze)
- [ ] Funkcja ponownego zamówienia (reorder)
- [ ] UI anulowania zamówienia na frontendzie
- [ ] **UI zwrotów/reklamacji na frontendzie** (backend istnieje, frontend nie)

### 3.3 Klienci (6/10)

**Brakuje:**
- [ ] Segmentacja klientów (dynamic segments, RFM analysis)
- [ ] Customer Lifetime Value (LTV) tracking
- [ ] Tagi klientów / grupy
- [ ] Program lojalnościowy (punkty za zakupy)
- [ ] Notatki przy profilu klienta (admin)
- [ ] Historia aktywności klienta (admin dashboard)
- [ ] Impersonacja klienta (admin loguje się jako klient)

### 3.4 Marketing i Promocje (6.5/10)

**Brakuje:**
- [ ] BOGO (Buy One Get One)
- [ ] Ceny progowe / ilościowe (tiered pricing)
- [ ] Flash sales z odliczaniem
- [ ] Szablony emaili (edytowalne w adminku)
- [ ] SMS marketing (integracja z dostawcą)
- [ ] Push notifications
- [ ] Marketing automation workflows (poza abandoned cart)
- [ ] A/B testing kampanii
- [ ] Generowanie kuponów masowe (bulk coupon generation)

### 3.5 Analityka i Raporty (4/10) — KRYTYCZNA LUKA

**Brakuje:**
- [ ] Dashboard sprzedażowy (przychody, zamówienia, AOV po okresach)
- [ ] Raport top-sellerów / worst-sellerów
- [ ] Raport konwersji (lejek: wizyta → koszyk → checkout → zakup)
- [ ] Raport klientów (nowi vs. powracający, LTV)
- [ ] Raport stanów magazynowych (stock levels, turnover)
- [ ] Raport podatkowy / VAT
- [ ] Custom report builder
- [ ] Real-time dashboard
- [ ] Eksport raportów do PDF/Excel
- [ ] Core Web Vitals tracking

### 3.6 Multi-channel i Integracje (3/10) — KRYTYCZNA LUKA

**Brakuje:**
- [ ] Google Merchant Center feed
- [ ] Facebook/Instagram Shop catalog
- [ ] Allegro / Amazon marketplace sync
- [ ] Integracja z systemami księgowymi (wFirma, Fakturownia, InFakt)
- [ ] ERP integration (SAP, Comarch)
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Webhook management UI (admin panel do konfiguracji webhooków)
- [ ] OAuth2 endpoints dla aplikacji trzecich
- [ ] GraphQL API (opcjonalnie)

### 3.7 Wysyłka (5/10)

**Brakuje:**
- [ ] Strefy wysyłkowe (shipping zones — kraj/region → cena)
- [ ] Koszty oparte o wagę/wymiary
- [ ] Real-time wyceny od przewoźników (API kurierów)
- [ ] Ograniczenia metod wysyłki per produkt/kategoria
- [ ] Tracking number z linkiem do śledzenia przesyłki
- [ ] Automatyczne powiadomienia o wysyłce (email/SMS)
- [ ] Międzynarodowe opcje wysyłki (poza PL)

### 3.8 Podatki (4/10)

**Brakuje:**
- [ ] Automatyczne obliczanie VAT per kraj EU (OSS/IOSS)
- [ ] Zwolnienia podatkowe (B2B, NGO)
- [ ] Walidacja NIP / VAT ID (VIES)
- [ ] Raportowanie podatkowe
- [ ] Integracja z systemem fiskalnym

### 3.9 Role i Uprawnienia Admina (4/10)

**Aktualnie:** Tylko 2 role (Admin, Editor) — za mało dla enterprise.

**Brakuje:**
- [ ] Granularne uprawnienia (np. "tylko produkty", "tylko zamówienia")
- [ ] Custom roles z selektywnymi permissions
- [ ] Resource-level permissions (edytuj swoje vs. wszystkie)
- [ ] Action-level permissions (view vs. edit vs. delete)
- [ ] Role per dział / zespół
- [ ] Audit log per admin (kto co zmienił)

### 3.10 Search (5/10)

**Brakuje:**
- [ ] Autocomplete / search-as-you-type
- [ ] Faceted search UI (filtry z liczebnościami)
- [ ] "Czy chodziło o..." (typo tolerance)
- [ ] Synonimy (np. "koszulka" = "t-shirt")
- [ ] Analityka wyszukiwań (popularne frazy, zero results)
- [ ] Promowane produkty w wynikach

### 3.11 Notyfikacje (4/10)

**Brakuje:**
- [ ] SMS notifications (integracja np. SMSAPI, Twilio)
- [ ] Push notifications (web push)
- [ ] Edytowalne szablony powiadomień w adminku
- [ ] Preferencje powiadomień per użytkownik
- [ ] Event-triggered notifications (np. alert o niskim stanie magazynu → email)
- [ ] Notification center na frontendzie (konto klienta)

### 3.12 Treści / CMS (8/10)

**Brakuje:**
- [ ] Blog RSS feed
- [ ] Blog tagi (dedykowana tabela, nie JSON array)
- [ ] Content approval workflow (draft → review → publish)
- [ ] Personalizacja treści (np. per segment klienta)
- [ ] Email template builder w adminku
- [ ] Zaawansowane profile autorów bloga

### 3.13 Import/Export (5/10)

**Brakuje:**
- [ ] Bulk product update (mass edit)
- [ ] Bulk order status change
- [ ] Import preview / dry-run
- [ ] Import walidacja formatu przed importem
- [ ] Import klientów (z deduplikacją)
- [ ] Scheduled imports (cron)

### 3.14 Multi-store (0/10)

**Nie zaimplementowane.** Decyzja do podjęcia: czy multi-tenant jest w scope?

---

## 4. Infrastruktura i DevOps

### 4.1 Monitoring i Alerting (5/10) — ✅ POPRAWA W TOKU

| Element                                 | Status                                      | Priorytet |
|-----------------------------------------|---------------------------------------------|-----------|
| Error tracking (Sentry)                 | ✅ **SKONFIGUROWANE** — backend + frontend  | P0 |
| APM / distributed tracing               | ⏳ Opcjonalnie (Datadog/NewRelic)          | P1 |
| Log aggregation (ELK/Loki)              | ⏳ Opcjonalnie                               | P1 |
| Uptime monitoring                       | ✅ **UDOKUMENTOWANE** — `docs/UPTIME_MONITORING.md` | P0 |
| Real-time alerting (PagerDuty/Opsgenie) | ⏳ Integrate via Sentry alerts            | P1 |
| Core Web Vitals dashboard               | ⏳ Opcjonalnie (Lighthouse CI)             | P2 |
| Database slow query monitoring          | ⏳ Opcjonalnie                               | P2 |
| Health checks endpoint                  | ✅ spatie/laravel-health                     | OK |

### 4.2 Backup i Disaster Recovery (6/10) — ✅ UDOKUMENTOWANE

| Element                          | Status                                  | Priorytet |
|----------------------------------|-----------------------------------------|-----------|
| Strategia backupów DB            | ✅ **DOKUMENTACJA:** `docs/BACKUP_STRATEGY.md`, skrypty automatyzujące | P0 |
| Backup mediów (S3)               | ✅ **DOKUMENTACJA:** wersjonowanie S3 + incremental sync | P1 |
| Point-in-time recovery (PITR)    | ⏳ Wdrożenie wymagane (PostgreSQL WAL)  | P1 |
| Testy przywracania backupów      | ✅ Skrypt `verify-backup.sh`             | P1 |
| Disaster Recovery plan (RTO/RPO) | ✅ Zdefiniowane w BACKUP_STRATEGY.md    | P0 |
| Cross-region replication         | ⏳ Opcjonalnie (dokumentacja dostępna)  | P2 |

### 4.3 CI/CD (6/10)

| Element                           | Status                                | Priorytet |
|-----------------------------------|---------------------------------------|-----------|
| Lint + test w CI                  | ✅ GitHub Actions                      | OK        |
| Docker build + push               | ✅ GHCR                                | OK        |
| K8s deployment                    | ✅ Auto-deploy                         | OK        |
| **38 failing tests**              | ❌ CI niestabilne                      | P0        |
| Security scanning (SAST/DAST)     | ❌ Brak                                | P1        |
| Dependency vulnerability scan     | ❌ Brak `composer audit` / `npm audit` | P1        |
| Performance regression testing    | ❌ Brak                                | P2        |
| Contract testing (API ↔ Frontend) | ❌ Brak                                | P2        |
| Canary/blue-green deploys         | ❌ Brak                                | P2        |

### 4.4 Skalowanie (5/10)

| Element                                 | Status                            | Priorytet |
|-----------------------------------------|-----------------------------------|-----------|
| K8s HPA (auto-scaling)                  | ✅ CPU >70%, RAM >80%              | OK        |
| Stateless architecture (Redis sessions) | ✅ OK                              | OK        |
| Queue workers auto-scaling              | ❌ Hardcoded 2 pody                | P2        |
| Read replicas / DB scaling              | ❌ Brak planu                      | P2        |
| Redis replication / Sentinel            | ❌ Single instance                 | P2        |
| Load testing results                    | ❌ Brak                            | P1        |
| CDN caching strategy                    | ⚠️ Cloudflare, ale brak strategii | P2        |

---

## 5. Testy

### 5.1 Aktualne pokrycie (~30%)

**Pokryte:**
- ✅ Checkout security (price integrity, discount revalidation)
- ✅ Cart (guest/auth)
- ✅ Order API (retrieval, cancellation)
- ✅ Reviews
- ✅ Blog (comments, votes, views)
- ✅ Webhooks (payments)
- ✅ Wishlist

### 5.2 Brakujące testy (KRYTYCZNE)

| Obszar                               | Priorytet | Typ testu |
|--------------------------------------|-----------|-----------|
| **Login / Register / Logout**        | P0        | Feature   |
| **Password reset flow**              | P0        | Feature   |
| **Email verification**               | P0        | Feature   |
| **Social login (OAuth)**             | P1        | Feature   |
| **Profile CRUD**                     | P1        | Feature   |
| **Address CRUD**                     | P1        | Feature   |
| **Payment status queries**           | P0        | Feature   |
| **Newsletter subscribe/unsubscribe** | P1        | Feature   |
| **Form submissions**                 | P1        | Feature   |
| **Product filtering + search**       | P1        | Feature   |
| **GDPR data export/delete**          | P0        | Feature   |
| **Discount edge cases**              | P1        | Feature   |
| **Shipping cost calculation**        | P1        | Unit      |
| **Currency conversion**              | P1        | Unit      |
| **i18n / locale switching**          | P2        | Feature   |
| **Admin RBAC**                       | P1        | Feature   |
| **Rate limiting**                    | P2        | Feature   |

### 5.3 Cel: 80%+ pokrycia krytycznych ścieżek

---

## 6. Podsumowanie Ocen

| Kategoria                     | Ocena       | Cel Enterprise |
|-------------------------------|-------------|----------------|
| **Bezpieczeństwo — Backend**  | 8.5/10      | 9.5/10         |
| **Bezpieczeństwo — Frontend** | 6/10        | 9/10           |
| **Architektura**              | 8/10        | 9/10           |
| **Jakość kodu**               | 9/10        | 9.5/10         |
| **Testy**                     | 4/10        | 8/10           |
| **Produkty**                  | 8/10        | 9/10           |
| **Zamówienia**                | 7/10        | 9/10           |
| **Klienci**                   | 6/10        | 8/10           |
| **Marketing**                 | 6.5/10      | 8/10           |
| **CMS / Treści**              | 8/10        | 9/10           |
| **Analityka**                 | 4/10        | 8/10           |
| **Integracje**                | 3/10        | 7/10           |
| **Wysyłka**                   | 5/10        | 8/10           |
| **Podatki**                   | 4/10        | 7/10           |
| **Search**                    | 5/10        | 8/10           |
| **Role/Permissions**          | 4/10        | 8/10           |
| **Notyfikacje**               | 4/10        | 7/10           |
| **Accessibility (WCAG)**      | 5/10        | 8/10           |
| **GDPR**                      | 6/10        | 9/10           |
| **CI/CD**                     | 6/10        | 9/10           |
| **Monitoring**                | 2/10        | 9/10           |
| **Backup/DR**                 | 2/10        | 9/10           |
| **Skalowanie**                | 5/10        | 8/10           |
| **OGÓLNIE**                   | **~5.5/10** | **8.5/10**     |

---

## 7. Plan Priorytetów

### Faza 0 — Krytyczne (przed produkcją)

> Bez tych elementów system NIE powinien być wdrożony publicznie.

1. **~~Naprawić 38 failing testów~~** ✅ — **NAPRAWIONE:** wszystkie 138 testów przechodzi
2. **~~Dodać Sentry~~** ✅ — **NAPRAWIONE:** zainstalowano `sentry/sentry-laravel` i `@sentry/nextjs`, skonfigurowano DSN
3. **~~Sanityzacja HTML~~** ✅ — **NAPRAWIONE:** dodano `dompurify`, wszystkie `dangerouslySetInnerHTML` sanityzowane
4. **~~CSP headers~~** ✅ — **NAPRAWIONE:** dodano CSP z nonce w middleware Next.js
5. **~~CORS — jawne originy~~** ✅ — **NAPRAWIONE:** usunięto domyślny wildcard
6. **~~Backup strategy~~** ✅ — **NAPRAWIONE:** dokumentacja w `docs/BACKUP_STRATEGY.md`, skrypty automatyzujące
7. **~~Uptime monitoring~~** ✅ — **NAPRAWIONE:** dokumentacja w `docs/UPTIME_MONITORING.md`, Sentry alerty
8. **Testy auth flow** — login, register, password reset, email verification
9. **Testy payment flow** — status queries, webhook processing

### Faza 1 — Wysokie (pierwsze 2-4 tygodnie po wdrożeniu)

1. **Granularne role i uprawnienia** — rozbudowa z 2 do 5-6 ról z permissions
2. **UI zwrotów/reklamacji** na frontendzie
3. **Częściowe zwroty** (partial refunds)
4. **Faceted search** z autocomplete
5. **Dashboard analityczny** — przychody, zamówienia, top-sellers
6. **P24 webhook verification** — synchroniczna weryfikacja przed queue
7. **Sanctum token expiration** — konfiguracja wygasania
8. **Security scanning w CI** — `composer audit`, `npm audit`, Snyk
9. **Log aggregation** — Loki/ELK/Cloudflare Logpush
10. **Load testing** — k6 / Artillery na krytyczne endpointy
11. **Accessibility audit** — label na formularzach, focus trap, screen reader

### Faza 2 — Średnie (miesiąc 2-3)

1. **Szablony emaili** edytowalne w adminku
2. **Strefy wysyłkowe** (shipping zones)
3. **Automatyczny VAT EU** (OSS/IOSS)
4. **Customer segments** — dynamiczna segmentacja
5. **Google Merchant Center feed**
6. **Blog RSS feed**
7. **SMS notifications** (SMSAPI / Twilio)
8. **Workflow fulfillmentu** (pick → pack → ship)
9. **Tracking link** przy zamówieniu (integracja z kurierami)
10. **APM / distributed tracing** — Datadog / New Relic
11. **Bulk product update** (mass edit)
12. **Contract testing** API ↔ Frontend
13. **DR plan** — RTO/RPO, testy przywracania

### Faza 3 — Rozszerzenia (miesiąc 3-6)

1. **Produkty cyfrowe** / pliki do pobrania
2. **Produkty bundlowane** / zestawy
3. **Program lojalnościowy** (punkty za zakupy)
4. **Flash sales** z countdown timer
5. **Marketing automation** (workflows poza abandoned cart)
6. **Integracja z systemami księgowymi** (wFirma, InFakt)
7. **Allegro / Amazon marketplace sync**
8. **Facebook/Instagram Shop**
9. **Push notifications** (web push)
10. **Custom report builder**
11. **Subscription orders** (recurring payments)
12. **Multi-warehouse inventory**
13. **Content approval workflow** (draft → review → publish)
14. **Admin impersonation** (logowanie jako klient)
15. **Canary/blue-green deployments**
16. **A/B testing** (kampanie, strony)
17. **GraphQL API** (opcjonalnie)

---

## Legenda priorytetów

| Priorytet | Opis                                           |
|-----------|------------------------------------------------|
| **P0**    | Blokuje wdrożenie produkcyjne                  |
| **P1**    | Wymagane w ciągu 2-4 tygodni po launch         |
| **P2**    | Ważne dla enterprise, planowane na miesiąc 2-3 |
| **P3**    | Nice-to-have, rozszerzenia na przyszłość       |
