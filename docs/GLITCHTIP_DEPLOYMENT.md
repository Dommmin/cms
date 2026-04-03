# Plan Wdrożenia GlitchTip (Self-Hosted)

GlitchTip - open-source alternatywa dla Sentry. Kompatybilny z Sentry SDK (bez zmian w kodzie aplikacji).

---

## 1. Wymagania Systemowe

### Minimalne
- RAM: 256MB (all-in-one) / 512MB (z Valkey)
- CPU: x86 / arm64
- Dysk: ~30GB / 1M eventów miesięcznie
- PostgreSQL 14+
- Redis/Valkey 7+ (opcjonalny, zalecany dla wydajności)

### Zalecane (produkcja)
- RAM: 1GB+
- CPU: 2+ rdzenie
- Dysk: SSD 50GB+
- Zewnętrzny PostgreSQL (managed)

---

## 2. Instalacja Docker Compose

### Krok 1: Pobranie konfiguracji

```bash
# Minimal setup (trial/małe instancje)
wget https://raw.githubusercontent.com/glitchtip/glitchtip/master/compose.minimal.yml -O compose.yml

# Pełny setup (produkcja)
wget https://raw.githubusercontent.com/glitchtip/glitchtip/master/compose.sample.yml -O compose.yml
```

### Krok 2: Konfiguracja środowiska

Utwórz `.env`:

```env
# Database
DATABASE_URL=postgres://glitchtip:PASSWORD@db:5432/glitchtip
POSTGRES_USER=glitchtip
POSTGRES_PASSWORD=SECURE_PASSWORD_HERE
POSTGRES_DB=glitchtip

# Redis (jeśli używasz)
REDIS_URL=redis://redis:6379/0

# GlitchTip
SECRET_KEY=generate_random_50_char_string
PORT=8000
EMAIL_URL=smtp://user:pass@smtp.example.com:587

# Domyślna organizacja
GLITCHTIP_DOMAIN=glitchtip.your-domain.com
DEFAULT_FROM_EMAIL=noreply@your-domain.com

# Celery beat (scheduled tasks)
CELERY_WORKER_AUTOSCALE="1,3"
CELERY_WORKER_MAX_TASKS_PER_CHILD=10000
```

### Krok 3: Uruchomienie

```bash
docker compose up -d

# Sprawdź status
docker compose ps

# Logi
docker compose logs -f glitchtip
```

---

## 3. Konfiguracja PostgreSQL ( produkcja)

### Opcja A: Zewnętrzny managed PostgreSQL (zalecane)
- Supabase, Railway, Neon, DigitalOcean Managed DB
-security: VPC/private networking

### Opcja B: Lokalny PostgreSQL w Docker

```yaml
# compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: glitchtip
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Uprawnienia least-privilege (opcjonalne)

```sql
-- Web role (ograniczone uprawnienia)
CREATE ROLE glitchtip_app WITH LOGIN PASSWORD 'app_password';
GRANT CONNECT ON DATABASE glitchtip TO glitchtip_app;
GRANT USAGE ON SCHEMA public TO glitchtip_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO glitchtip_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO glitchtip_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO glitchtip_app;

-- Migrate/Worker role (pełne uprawnienia)
CREATE ROLE glitchtip_maintainer WITH LOGIN PASSWORD 'maintainer_password';
GRANT CONNECT ON DATABASE glitchtip TO glitchtip_maintainer;
GRANT CREATE, USAGE ON SCHEMA public TO glitchtip_maintainer;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO glitchtip_maintainer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO glitchtip_maintainer;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO glitchtip_maintainer;
```

---

## 4. Reverse Proxy & SSL

### Nginx

```nginx
server {
    server_name glitchtip.your-domain.com;
    access_log /var/log/nginx/glitchtip.access.log;
    client_max_body_size 40M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL z Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d glitchtip.your-domain.com
```

---

## 5. Integracja z Aplikacją

GlitchTip jest **100% kompatybilny z Sentry SDK** - wystarczy zmienić DSN.

### Laravel (server/)

```bash
composer require sentry/sentry-laravel
```

`config/sentry.php`:

```php
<?php

declare(strict_types=1);

return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),

    // Sample rate (1.0 = 100%)
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),

    // Profile sample rate
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),

    // Release version
    'release' => env('APP_VERSION'),

    // Environment
    'environment' => env('APP_ENV', 'production'),

    // Deduplicate errors
    'send_default_pii' => false,
];
```

`.env`:

```env
SENTRY_LARAVEL_DSN=https://key@glitchtip.your-domain.com/project-id
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Next.js (client/)

```bash
npm install @sentry/nextjs
```

`sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
});
```

`sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

`.env.local` (development):

```env
NEXT_PUBLIC_SENTRY_DSN=https://key@glitchtip.your-domain.com/project-id
```

---

## 6. Migracja z Sentry

### Predieployment Checklist

1. **Przygotuj GlitchTip instance**
   - [ ] Serwer z Docker
   - [ ] PostgreSQL 14+
   - [ ] Domena + SSL
   - [ ] Konfiguracja `.env`

2. **Backup Sentry data** (opcjonalnie)
   - Export issues/events przez Sentry API
   - GlitchTip ma własne issue tracking

3. **Konfiguracja aplikacji**
   - [ ] Utwórz organizację w GlitchTip
   - [ ] Utwórz projekty ( Laravel API, Next.js frontend)
   - [ ] Skopiuj DSN dla każdego projektu
   - [ ] Zaktualizuj `.env` w aplikacjach

4. **Testy**
   - [ ] Wygeneruj testowy błąd w każdej aplikacji
   - [ ] Sprawdź czy error appeared w GlitchTip
   - [ ] Zweryfikuj stack trace + metadata
   - [ ] Testuj alerty email/Slack

### Rollback Plan

Jeśli GlitchTip nie działa:
1. Przywróć `.env` z Sentry DSN
2. Restart aplikacji
3. Issue tracking wraca do Sentry

---

## 7. Konfiguracja Zaawansowana

### Email Alerts

```env
EMAIL_URL=smtp://user:pass@smtp.example.com:589
DEFAULT_FROM_EMAIL=alerts@your-domain.com
```

### Slack Integration

GlitchTip UI → Project Settings → Integrations → Slack

lub webhook:

```env
GLITCHTIP_WEBHOOK_URL=https://hooks.slack.com/services/XXX
```

### File Storage (Sourcemaps)

```env
# Local storage (default)
GLITCHTIP_FILE_STORAGE_BACKEND=django.core.files.storage.FileSystemStorage

# AWS S3
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# DigitalOcean Spaces
AWS_STORAGE_BUCKET_NAME=your-space
AWS_S3_ENDPOINT_URL=https://fra1.digitaloceanspaces.com
```

---

## 8. Monitoring & Maintenance

### Health Checks

```bash
# API health
curl -f https://glitchtip.your-domain.com/api/0/health/ || exit 1

# Database connection
docker compose exec glitchtip python manage.py check --database default
```

### Backup

```bash
# PostgreSQL backup
docker compose exec db pg_dump -U glitchtip glitchtip > backup.sql

# Restore
docker compose exec -T db psql -U glitchtip glitchtip < backup.sql
```

### Upgrade

```bash
docker compose pull
docker compose stop
docker compose up -d
```

---

## 9. Koszty vs Sentry

| Metryka | Sentry Team | GlitchTip Self-Hosted |
|---------|-------------|----------------------|
| Miesięczne zdarzenia | 50K free, potem $26/mo | Unlimited (hardware limit) |
| Retencja | 30 dni (free), 90 dni (paid) | Nieograniczona |
| Użytkownicy | 1 free, potem $26/mo | Unlimited |
| Source maps | Free | Free |
| Performance monitoring | Paid addon | Free |
| Koszt infrastruktury | - | $5-20/mo (VPS) |

**Różnica**: GlitchTip zwraca się przy ~2000+ zdarzeń/miesiąc.

---

## 10. Bezpieczeństwo

### Checklist

- [ ] HTTPS-only (Certbot/Let's Encrypt)
- [ ] Silne hasła PostgreSQL
- [ ] `SECRET_KEY` losowy 50+ znaków
- [ ] Firewall: tylko port 80/443
- [ ] Regular backup PostgreSQL
- [ ] Aktualizacje Docker images
- [ ] Rate limiting na poziomie nginx

### Network Isolation (zalecane)

```yaml
# compose.yml
networks:
  glitchtip_internal:
    internal: true  # Brak dostępu do internetu
  glitchtip_public:
    driver: bridge

services:
  glitchtip:
    networks:
      - glitchtip_public
      - glitchtip_internal
```

---

## 11. Troubleshooting

### Błędy połączenia z DB

```bash
# Sprawdź czy PostgreSQL działa
docker compose exec db pg_isready

# Sprawdź logi
docker compose logs db
docker compose logs glitchtip
```

### Eventy nie przychodzą

1. Sprawdź DSN w `.env`
2. Sprawdź czy aplikacja ma dostęp do GlitchTip URL
3. Sprawdź logi aplikacji: `Sentry error: ...`
4. Sprawdź network tab - requesty do `/api/0/envelope/`

### Performance Issues

1. Dodaj Valkey/Redis (cache)
2. Zwiększ `CELERY_WORKER_AUTOSCALE`
3. Użyj zewnętrznego PostgreSQL ( supabase)
4. Zmniejsz `traces_sample_rate`

---

## 12. Kiedy NIE używać GlitchTip

- Budżet na Sentry istnieje i klient* może płacić
- Brak zasobów na maintenance self-hosted
- Wymagana 24/7 support gwarancja
- Potrzebne zaawansowane feature'y Sentry (Session Replay, AI insights)
- Szybkie skalowanie bez zarządzania infrastrukturą

## 13. Kiedy UŻYWAĆ GlitchTip

- Klient nie chce płacić za Sentry
- < 100K eventów/miesiąc
- Proste wymagania monitoring
- Masz kontrolę nad infrastrukturą
- GDPR-compliant ( dane w własnym serwerze)

---

## 14. Następne Kroki

1. **Demo setup**: Uruchom lokalnie `compose.minimal.yml`
2. **Produkcja**: Przygotuj VPS/dedykowany serwer
3. **Staging:** Zintegruj z aplikacją testową
4. **Produkcja**: Switch DSN w produkcyjnym `.env`
5. **Monitoring**: Dodaj health checks do Cron/Uptime Kuma

---

## 15. Przydatne Linki

- Dokumentacja: https://glitchtip.com/documentation
- GitHub: https://github.com/glitchtip/glitchtip
- SDK docs: https://glitchtip.com/sdkdocs
- Helm chart (K8s): https://github.com/glitchtip/glitchtip-helm