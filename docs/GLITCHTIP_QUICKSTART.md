# GlitchTip Quick Start - Integracja z CMS

Szybki przewodnik integracji GlitchTip z monorepo (server + client).

---

## Kiedy używać?

- **Klient odmawia płatności za Sentry**
- **Projekt budżetowy** - darmowy monitoring wystarcza
- **Dane w EU** - GDPR compliance (self-hosted)
- **< 100K eventów/miesiąc** - sens ekonomiczny

---

## 1. Setup GlitchTip (5 minut)

### Docker Compose (minimal)

```bash
mkdir glitchtip && cd glitchtip
wget https://raw.githubusercontent.com/glitchtip/glitchtip/master/compose.minimal.yml -O compose.yml

# Utwórz .env
cat > .env << 'EOF'
DATABASE_URL=postgres://glitchtip:CHANGE_ME@db:5432/glitchtip
POSTGRES_PASSWORD=CHANGE_ME
SECRET_KEY=$(openssl rand -hex 32)
PORT=8000
EOF

# Uruchom
docker compose up -d

# Sprawdź
curl http://localhost:8000/_health/
```

### First-time Setup

1. Otwórz http://localhost:8000
2. Utwórz konto admin
3. Utwórz organizację: `client-name`
4. Utwórz projekty:
   - `cms-api` (Laravel)
   - `cms-frontend` (Next.js)
5. Skopiuj DSN dla każdego projektu

---

## 2. Integracja Laravel API

### Instalacja

```bash
cd server
docker compose exec php composer require sentry/sentry-laravel
```

### Konfiguracja

`config/sentry.php`:

```php
<?php

declare(strict_types=1);

return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),
    'release' => env('APP_VERSION'),
    'environment' => env('APP_ENV', 'production'),
    'send_default_pii' => false,
];
```

`.env`:

```env
# GlitchTip DSN (z projekt setup)
SENTRY_LARAVEL_DSN=https://abc123@glitchtip.example.com/1

# Performance sampling (10% requestów)
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Test

```php
// routes/web.php
Route::get('/test-sentry', function () {
    throw new Exception('GlitchTip test error');
});
```

---

## 3. Integracja Next.js Frontend

### Instalacja

```bash
cd client
npm install @sentry/nextjs
```

### Konfiguracja

`sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

`sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

`next.config.js` (automatycznie dodane przez `@sentry/nextjs`):

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  silent: true,
  org: 'client-name',
  project: 'cms-frontend',
});
```

`.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://abc123@glitchtip.example.com/2
```

### Test

```typescript
// app/test-sentry/page.tsx
'use client';

import * as Sentry from '@sentry/nextjs';

export default function TestSentry() {
  return (
    <button
      onClick={() => {
        Sentry.captureException(new Error('GlitchTip frontend test'));
      }}
    >
      Test GlitchTip
    </button>
  );
}
```

---

## 4. Weryfikacja

### Sprawdź czy eventy przyszły

1. Otwórz http://glitchtip.your-domain.com
2. Selektuj projekt `cms-api` lub `cms-frontend`
3. Issues → Powinny być testowe błędy

### Sprawdź performance

1. Issues → Performance
2. Powinny być transakcje HTTP requestów
3. Sample rate: 10% (konfigurowalne)

---

## 5. Produkcja

### Checklist przed deploy

- [ ] GlitchTip działa na produkcyjnym serwerze
- [ ] HTTPS zestawiony (Certbot/Let's Encrypt)
- [ ] Email alerts skonfigurowane
- [ ] DSN w produkcyjnym `.env`
- [ ] Testowe błędy wychwytywane
- [ ] Stack traces czytelne (source maps)
- [ ] Slack/webhook integration (opcjonalnie)

### Environment-specific DSN

```env
# .env.production
SENTRY_LARAVEL_DSN=https://key@glitchtip.example.com/1

# .env.staging
SENTRY_LARAVEL_DSN=https://key@glitchtip-staging.example.com/2
```

---

## 6. Różnice Sentry vs GlitchTip

| Feature | Sentry | GlitchTip |
|---------|--------|-----------|
| SDK | Własny Sentry SDK | **Ten sam Sentry SDK** |
| DSN format | `https://key@host/project-id` | **Identyczny** |
| Integracje | Pełne ecosystem | Podstawowe |
| Performance | Zaawansowane | Basic |
| Session Replay | Verfügbar | Brak (planowane) |
| AI Insights | Verfügbar | Brak |
| Koszt | $0-500+/mo | **$5-20 VPS** |

---

## 7. FAQ

### Czy mogę używać Sentry SDK?

**Tak** - GlitchTip jest 100% kompatybilny. Wystarczy zmienić DSN.

### Czy to działa w obecnym kodzie?

**Tak** - jeśli masz już `sentry/sentry-laravel` i `@sentry/nextjs`, wystarczy zmienić `.env` DSN.

### Co tracę vs Sentry?

- Session Replay
- Zaawansowane release tracking
- AI-powered insights
- Integracje third-party
- 24/7 support

### Co zyskuję?

- **Brak limitów eventów**
- **Pełna kontrola danych** (na własnym serwerze)
- **Brak kosztów subskrypcji**
- **GDPR compliance** (dane nie wychodzą z EU)

### Jak monitorować GlitchTip?

Użyj health check:

```bash
curl -f https://glitchtip.your-domain.com/api/0/health/ || alert
```

---

## 8. Rollback do Sentry

Jeśli klient zmieni zdanie:

```env
# .env
SENTRY_LARAVEL_DSN=https://key@sentry.io/project-id
```

Restart aplikacji - **wszystko działa jak wcześniej**.

---

## Podsumowanie

**Setup time**: ~30 minut
**Kompatybilność**: 100% z Sentry SDK
**Koszt**: VPS $5-20/mo
**Wymagania**: Docker + PostgreSQL

**Używaj gdy**: Klient nie chce płacić za Sentry.
**Nie używaj gdy**: Budżet jest, a brakuje czasu na maintenance.