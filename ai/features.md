# Features Backlog

> Current implemented features → `ai/guide.md` (Implemented Features section).
> This file tracks what's **planned**, **in progress**, or **under consideration**.

---

## P0 — Krytyczne (security / stability przed launch)

| # | Feature | Opis | Status |
|---|---------|------|--------|
| S1 | **XSS sanitization** | 6 miejsc z `dangerouslySetInnerHTML` bez DOMPurify (product descriptions, blog, rich-text blocks, accordion, two-columns, custom-html block) | `[ ] todo` |
| S2 | **Content-Security-Policy** | Dodać CSP header z nonce w `next.config.ts` | `[ ] todo` |
| S3 | **CORS lock-down** | `config/cors.php` — ustawić jawnie `CORS_ALLOWED_ORIGINS` na domenę frontendu | `[ ] todo` |
| S4 | **Error tracking** | Sentry (`sentry/sentry-laravel` + `@sentry/nextjs`) | `[ ] todo` |

---

## P1 — Ważne (przed pierwszym klientem)

| # | Feature | Opis |
|---|---------|------|
| E1 | **Inventory management** | Śledzenie stanów magazynowych, rezerwacje przy checkout, alert niskiego stanu |
| E2 | **Email templates editor** | Wizualny edytor maili transakcyjnych (zamówienia, wysyłka, zwroty) |
| E3 | **Product bundles** | Zestawy produktów ze wspólną ceną |
| E4 | **Abandoned cart recovery** | Maile przypominające (już jest `AbandonedCartCleanupJob` — rozszerzyć) |
| C1 | **Admin 2FA enforcement** | Wymuszenie 2FA dla roli admin (opcjonalne dla editor) |
| C2 | **Rate limiting na API auth** | Weryfikacja czy obecne limity (10/min) są wystarczające |
| I1 | **Webhook retry system** | Dead-letter queue dla failed webhooks (PayU, P24) |

---

## P2 — Nice to have

| # | Feature | Opis |
|---|---------|------|
| E5 | **Multi-warehouse** | Wiele magazynów, routing zamówień |
| E6 | **Subscription products** | Cykliczne płatności |
| E7 | **Loyalty program** | Punkty za zakupy |
| C3 | **Activity log** | `spatie/laravel-activitylog` — kto co zmienił w adminie |
| C4 | **Scheduled publishing** | Blog posty (już jest `published_at`) — rozszerzyć na produkty/strony |
| I2 | **Redis queue monitoring** | Horizon dashboard |
| I3 | **Full-text search improvements** | Typo tolerance, facets (Meilisearch config) |

---

## P3 — Rozważane / Backlog

| # | Feature | Opis |
|---|---------|------|
| E8 | **B2B pricing tiers** | Ceny dla grup klientów |
| E9 | **POS integration** | Synchronizacja z kasą fiskalną |
| C5 | **A/B testing framework** | Testy wariantów stron/produktów |
| I4 | **CDN asset optimization** | Cloudflare R2 + image optimization pipeline |
| I5 | **Audit trail** | Kompletny log zmian dla compliance |

---

## Notatki

- Priorytety aktualizować po każdym sprincie
- Każda ukończona feature → przenieść do `ai/guide.md` (Implemented Features)
- Szczegóły implementacji → `ai/audit-plan.md` (enterprise readiness audit)
