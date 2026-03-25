# Deployment

## Local Development

### Prerequisites
- Docker + Docker Compose
- Make

### Start

```bash
# Clone and setup
cp server/.env.example server/.env
# Edit server/.env — set DB_*, REDIS_*, etc.

# Start containers
make up

# First-time setup
make shell
php artisan key:generate
php artisan migrate --seed

# Or via Makefile
make fresh          # Fresh migrate + seed
```

### Services after `make up`

| Service             | URL                         |
|---------------------|-----------------------------|
| Admin panel         | https://localhost/admin     |
| Public frontend     | http://localhost:3000       |
| Laravel API         | https://localhost/api/v1    |
| API docs (Scramble) | https://localhost/docs/api  |
| Telescope           | https://localhost/telescope |
| MailHog             | http://localhost:8025       |
| MySQL               | localhost:3306              |
| Redis               | localhost:6379              |

### Makefile Commands

```bash
make up             # Start all containers (detached)
make down           # Stop containers
make shell          # Enter PHP container bash
make migrate        # Run pending migrations
make fresh          # php artisan migrate:fresh --seed
make test           # php artisan test --compact
make quality        # Pint + PHPStan

# Manual commands inside PHP container
php artisan tinker
php artisan queue:work
php artisan scout:import "App\Models\Product"
```

---

## Docker Architecture

```yaml
# docker-compose.yml services
php:     Laravel + PHP-FPM 8.4 + Supervisord (queue workers, scheduler)
node:    Next.js 16 frontend
nginx:   Reverse proxy (HTTP/HTTPS), SSL termination
mysql:   MySQL 8.0 with utf8mb4
redis:   Cache + queue backend
gotenberg: PDF generation
mailhog: Dev mail catcher
```

### PHP Container
- Built from `.docker/php/Dockerfile`
- Supervisord manages: PHP-FPM, queue workers, cron scheduler
- Vite dev server runs on `:5173` (exposed via docker port)
- Volume: `./server:/var/www/html`

### Node Container
- Built from `.docker/node/Dockerfile`
- Runs `next dev` on `:3000`
- Volume: `./client:/var/www/client`

### Nginx
- Handles SSL (self-signed certs in `.docker/nginx/certs/`)
- Routes `/api/*`, `/admin/*`, `/docs/*` → PHP-FPM
- Routes `:3000` → Node container
- Config: `.docker/nginx/conf.d/default.conf`

---

## Environment Variables

Key variables in `server/.env`:

```bash
APP_NAME="CMS"
APP_ENV=local|production
APP_KEY=              # php artisan key:generate
APP_URL=https://localhost

DB_CONNECTION=mysql
DB_HOST=mysql         # Docker service name
DB_PORT=3306
DB_DATABASE=cms
DB_USERNAME=root
DB_PASSWORD=secret

REDIS_HOST=redis      # Docker service name
REDIS_PORT=6379

QUEUE_CONNECTION=redis

MAIL_MAILER=smtp
MAIL_HOST=mailhog     # Dev: Docker MailHog
MAIL_PORT=1025

# Search (if Typesense enabled)
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=secret

# PDF (Gotenberg)
GOTENBERG_URL=http://gotenberg:3000
```

---

## CI / CD Pipeline

All workflows live in **`.github/workflows/`** at the repo root. Do **not** put workflows in `server/.github/` or `client/.github/` — GitHub Actions only reads the root `.github/workflows/` directory.

### Workflow files

| File | Trigger | Purpose |
|------|---------|---------|
| `ci.yml` | push / PR → master, main | Lint + tests only (fast feedback on PRs) |
| `deploy.yml` | push → master, main | Full pipeline: lint → test → build → deploy |

### Job order in `deploy.yml`

```
lint ──┐
       ├──► build-server ──┐
test ──┘                   ├──► deploy
       ├──► build-client ──┘
```

Build jobs only start if **both** lint and test pass. Deploy only starts if **both** images build successfully.

### GitHub Actions — pinned versions

Always use the latest major version of each action. Current pinned versions:

| Action | Version | Notes |
|--------|---------|-------|
| `actions/checkout` | `v6` | Latest as of 2026-03 |
| `actions/setup-node` | `v6` | Latest as of 2026-03 |
| `shivammathur/setup-php` | `v2` | Stable major |
| `docker/login-action` | `v3` | |
| `docker/setup-buildx-action` | `v3` | |
| `docker/build-push-action` | `v6` | |
| `azure/setup-kubectl` | `v4` | |

**Node version:** always match the version used in `docker-compose.yml` / `.docker/node/Dockerfile`. Currently **Node 24** (`node:24-bookworm` in Docker, `node-version: '24'` in CI).

> When adding a new action or updating versions, check [github.com/marketplace](https://github.com/marketplace?type=actions) for the latest major version tag and update this table.

### Required GitHub secrets & variables

| Name | Type | Used in |
|------|------|---------|
| `GITHUB_TOKEN` | auto | Push images to GHCR |
| `KUBECONFIG_PROD` | secret | base64-encoded kubeconfig for production cluster |
| `NEXT_PUBLIC_API_URL` | variable (vars) | Baked into Next.js client image at build time |
| `NEXT_PUBLIC_APP_NAME` | variable (vars) | Baked into Next.js client image at build time |

### Lint checks

The `lint` job runs in check-only mode (never auto-commits):
- **Pint** — `vendor/bin/pint --test` (fails if any file needs formatting)
- **Rector** — `vendor/bin/rector process --dry-run` (fails if any refactoring is needed)
- **ESLint** — `npx eslint . --max-warnings=0`
- **Prettier** — `npm run format:check`

Run locally before pushing:
```bash
docker compose exec php vendor/bin/pint --dirty
docker compose exec php vendor/bin/rector process --dry-run
docker compose exec node npm run lint
docker compose exec node npm run format:check
```

---

## Production Checklist

Before deploying to production:

### Security
- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] Strong `APP_KEY` (regenerate from dev key)
- [ ] Real SSL certificates (not self-signed)
- [ ] `DB_PASSWORD`, `REDIS_PASSWORD` set to strong values
- [ ] Mail configured to real SMTP (not MailHog)
- [ ] Remove Telescope + Debugbar from prod (`APP_ENV=production` handles this)

### Performance
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] `php artisan event:cache`
- [ ] `npm run build` (Next.js production build)
- [ ] Queue workers running (Supervisord configured)
- [ ] Scheduler running (cron or Supervisord)
- [ ] Redis for both cache and queue

### Database
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed required data: `php artisan db:seed --class=RolePermissionSeeder`
- [ ] Database backups configured

### Storage
- [ ] Storage symlink: `php artisan storage:link`
- [ ] Persistent volume for `server/storage/`

---

## Cloudflare Setup (Production)

Cloudflare provides free DDoS protection, WAF, and bot protection. All features below are on the **Free plan**.

### 1. DNS / Proxy Setup

1. Add your domain to Cloudflare (free plan).
2. In the **DNS** tab, set your A record to your server IP and **enable the orange cloud** (proxied). All traffic now flows through Cloudflare.
3. In **SSL/TLS** → Overview: set mode to **Full (strict)** if your server has a valid cert, or **Full** otherwise.

### 2. Cloudflare Turnstile (CAPTCHA)

Turnstile is a free, privacy-preserving CAPTCHA that protects login, register, newsletter, and contact forms.

**Setup:**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** (left sidebar).
2. Click **Add site** → enter your domain → choose widget type: **Managed** (recommended).
3. Copy the **Site Key** (public) and **Secret Key** (private).
4. Set environment variables:

```bash
# server/.env
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key_here

# client/.env.local (or production env)
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key_here
```

The widget renders automatically on login, register, newsletter, and contact forms. If the keys are not set, the widget is hidden and validation is skipped (dev mode).

### 3. Real IP from Cloudflare (`CF-Connecting-IP`)

The `TrustCloudflareProxies` middleware (registered in `bootstrap/app.php`) reads the real visitor IP from the `CF-Connecting-IP` header. This ensures:
- Rate limiting applies to real IPs, not Cloudflare proxy IPs.
- Form submission deduplication by IP works correctly.

**Nginx hardening** — strip the header on direct (non-Cloudflare) connections to prevent spoofing:

```nginx
# In your server block, before proxy_pass to PHP-FPM:
# Only allow CF-Connecting-IP from Cloudflare's IP ranges.
# Cloudflare publishes ranges at https://www.cloudflare.com/ips/
# For simplicity, clear it and let the middleware fall back to REMOTE_ADDR
# if a request arrives without going through Cloudflare:
real_ip_header CF-Connecting-IP;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
```

### 4. WAF Custom Rules (5 Free Rules)

In Cloudflare dashboard → **Security** → **WAF** → **Custom rules** → click **Create rule**:

| # | Rule name | Expression | Action |
|---|-----------|-----------|--------|
| 1 | Block non-browser API abuse | `(http.request.uri.path contains "/api/" and not http.user_agent contains "Mozilla" and not http.user_agent contains "curl" and not http.user_agent contains "axios")` | **Block** |
| 2 | Rate-limit login endpoint | `(http.request.uri.path eq "/api/v1/auth/login" and http.request.method eq "POST")` | **Rate limit** — 5 req/min per IP |
| 3 | Rate-limit register endpoint | `(http.request.uri.path eq "/api/v1/auth/register" and http.request.method eq "POST")` | **Rate limit** — 3 req/min per IP |
| 4 | Block known bad bots | `(cf.client.bot)` | **Block** |
| 5 | Challenge suspicious countries | `(ip.geoip.country in {"XX" "YY"} and http.request.uri.path contains "/api/v1/auth/")` | **Managed Challenge** |

> Replace `"XX" "YY"` in rule 5 with ISO country codes you want to challenge (e.g. countries you don't sell to).
> Rules 2 and 3 use Cloudflare's built-in rate limiting on the Free plan (limited to 1 rule per zone on Free — upgrade to Pro for multiple rate limit rules).

### 5. Bot Fight Mode

In **Security** → **Bots** → enable **Bot Fight Mode** (free). Automatically challenges known bots.

### 6. Security Level

In **Security** → **Settings** → set **Security Level** to **Medium** or **High** (blocks known malicious IPs automatically).

### Production Cloudflare Checklist

- [ ] Domain proxied through Cloudflare (orange cloud in DNS)
- [ ] SSL/TLS mode set to Full or Full (strict)
- [ ] Turnstile keys set in both `server/.env` and client env
- [ ] Bot Fight Mode enabled
- [ ] WAF Custom Rules 1–4 created (rule 5 optional)
- [ ] Security Level set to Medium or High
- [ ] Nginx `real_ip_header CF-Connecting-IP` configured

---

## Scheduled Commands

Configured in `routes/console.php`:

| Command                         | Frequency    | Purpose                                      |
|---------------------------------|--------------|----------------------------------------------|
| `blog:publish-scheduled`        | Every minute | Auto-publish scheduled blog posts            |
| `activitylog:clean`             | Weekly       | Prune old activity log entries               |
| `cart:clean`                    | Daily        | Remove abandoned carts                       |
| `user:prune --days=30`          | Monthly      | Permanently delete soft-deleted users (GDPR) |
| `SendAbandonedCartEmails` (Job) | Hourly       | Send abandoned cart recovery emails          |
| `SendLowStockAlerts` (Job)      | Daily        | Alert on low stock                           |
