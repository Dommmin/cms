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
