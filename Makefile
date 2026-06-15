.PHONY: up stop down build install install-local audit shell migrate fresh test setup-test-db logs pail seed fresh-seed scout-import clear sync-translations npm-build pint fix check mobile-install mobile-start mobile-start-lan mobile-start-tunnel mobile-ios mobile-android mobile-web mobile-types mobile-lint mobile-check e2e e2e-report glitchtip-up glitchtip-down glitchtip-logs nuke-volumes help

# Set environment variables
export UID = $(shell id -u)
export GID = $(shell id -g)
export UNAME = $(shell whoami)
export PEST_PARALLEL_PROCESSES ?= 2

# Help
help:
	@echo "Available commands:"
	@echo "  up                 - Start the application"
	@echo "  down               - Stop the application"
	@echo "  stop               - Stop the application"
	@echo "  build              - Build containers"
	@echo "  install            - Install dependencies"
	@echo "  install-local      - Install dependencies locally"
	@echo "  audit      		- Security audit"
	@echo "  migrate            - Run migrations"
	@echo "  fresh              - Fresh migrations"
	@echo "  seed               - Seed database"
	@echo "  fresh-seed         - Fresh migrations and seed database"
	@echo "  scout-import       - Index products to scout"
	@echo "  test               - Run tests"
	@echo "  setup-test-db      - Setup test database"
	@echo "  clear              - Clear all Laravel caches"
	@echo "  sync-translations  - Sync admin translation keys from TSX files"
	@echo "  npm-build          - Build frontend assets (node container)"
	@echo "  pint               - Format PHP files with Pint"
	@echo "  fix                - Auto-fix all code style issues (pint, rector, eslint --fix, prettier)"
	@echo "  check              - Run all CI checks read-only — fails if anything is wrong (mirrors GitHub Actions)"
	@echo "  mobile-install     - Install Expo mobile dependencies"
	@echo "  mobile-start       - Start Expo dev server"
	@echo "  mobile-start-lan   - Start Expo for a phone on the same Wi-Fi"
	@echo "  mobile-start-tunnel- Start Expo through a tunnel for remote/blocked networks"
	@echo "  mobile-ios         - Start Expo for iOS simulator"
	@echo "  mobile-android     - Start Expo for Android emulator/device"
	@echo "  mobile-web         - Start Expo web"
	@echo "  mobile-check       - Run mobile TypeScript and lint checks"
	@echo "  quality            - Run all quality checks (Pint, PHPStan, ESLint)"
	@echo "  logs               - Show logs"
	@echo "  pail               - Inspect php logs in live mode"
	@echo "  shell              - Enter php container"
	@echo "  node_shell         - Enter node container"
	@echo "  glitchtip-up       - Start the local GlitchTip stack"
	@echo "  glitchtip-down     - Stop the local GlitchTip stack"
	@echo "  glitchtip-logs     - Tail GlitchTip logs"
	@echo "  up-full            - Start all services (including workers, search, etc)"
	@echo "  up-workers         - Start background workers"
	@echo "  up-search          - Start search services"
	@echo "  up-pdf             - Start PDF services"
	@echo "  up-testing         - Start testing services"
	@echo "  restart            - Restart the application"
	@echo "  stats              - Show docker stats"
	@echo "  ps-php             - Show top processes in PHP container"
	@echo "  ps-node            - Show top processes in Node container"
	@echo "  ps-horizon         - Show top processes in Horizon container"
	@echo "  ide-install        - Install dependencies locally for IDE"
	@echo "  docker-install     - Install dependencies inside Docker containers"
	@echo "  help               - Show this help"

# Remove dependency volumes + local dirs, then rebuild clean
nuke-volumes:
	@echo ">>> Stopping containers..."
	docker compose down
	@echo ">>> Removing Docker volumes..."
	docker volume rm cms_client_node_modules cms_client_next 2>/dev/null || true
	@echo ">>> Removing local vendor + node_modules..."
	rm -rf server/vendor server/node_modules client/node_modules client/.next
	@echo ">>> Done. Run 'make setup' to rebuild."

# Start the application
up:
	docker compose up -d php node nginx mysql redis mailpit minio minio-setup

up-full:
	docker compose --profile search --profile pdf --profile workers --profile testing up -d

up-workers:
	docker compose --profile workers up -d

up-search:
	docker compose --profile search up -d

up-pdf:
	docker compose --profile pdf up -d

up-testing:
	docker compose --profile testing up -d

restart:
	docker compose restart

stats:
	docker stats

ps-php:
	docker compose exec php sh -lc "ps aux | sort -nrk 3 | head -20"

ps-node:
	docker compose exec node sh -lc "ps aux | sort -nrk 3 | head -20"

ps-horizon:
	docker compose exec horizon sh -lc "ps aux | sort -nrk 3 | head -20"

# Stop the application
down:
	docker compose down

stop:
	docker compose stop

# Build containers
build:
	@echo "Setting up the project..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
	fi
	docker compose build

# Install dependencies inside Docker containers
docker-install:
	docker compose exec php composer install
	docker compose exec -e NODE_OPTIONS="--max-old-space-size=512" php npm install
	docker compose exec node npm install

# Install dependencies locally for IDE (PhpStorm/Cursor)
ide-install:
	cd server && composer install
	cd server && npm install
	cd client && npm install

audit:
	docker compose exec php composer outdated
	docker compose exec php npm audit
	docker compose exec node npm audit

# Run migrations
migrate:
	docker compose exec php php artisan migrate

# Fresh migrations
fresh:
	docker compose exec php php artisan migrate:fresh

seed:
	docker compose exec php php artisan db:seed

fresh-seed:
	docker compose exec php php artisan migrate:fresh --seed

# Scout import
scout-import:
	docker compose exec php artisan scout:import-products

# Setup test database
setup-test-db:
	docker compose exec mysql mysql -uroot -psecret -e "CREATE DATABASE IF NOT EXISTS laravel_test;"
	docker compose exec -e DB_CONNECTION=mysql -e DB_DATABASE=laravel_test php php artisan migrate

# Run tests
test: setup-test-db
	docker compose exec -e DB_CONNECTION=mysql -e DB_DATABASE=laravel_test php php artisan test

# Auto-fix all code style issues (run before committing)
# Applies pint, rector, eslint --fix, prettier --write in the correct order
fix:
	@echo ">>> PHP: Pint (format)"
	docker compose exec php vendor/bin/pint
	@echo ">>> PHP: Rector (apply refactors)"
	docker compose exec php php -d memory_limit=1G vendor/bin/rector process
	@echo ">>> PHP: Pint (post-rector normalisation)"
	docker compose exec php vendor/bin/pint
	@echo ">>> Server TS: ESLint --fix + Prettier + Types (TS)"
	docker compose exec php npm run lint
	docker compose exec php npm run types
	docker compose exec php npm run format
	@echo ">>> Client TS: ESLint --fix + Prettier"
	docker compose exec node npx eslint . --fix
	docker compose exec node npm run types
	docker compose exec node npm run format
	@echo ">>> Mobile TS: ESLint + Types"
	npm --prefix mobile run lint
	npm --prefix mobile run types
	@echo ">>> Done. Run 'make check' to verify nothing remains."

# Read-only CI check — mirrors GitHub Actions exactly (fails if anything is wrong)
# Run this before pushing: make fix && make check
check:
	@echo ">>> [1/10] PHP: Pint (check)"
	docker compose exec php vendor/bin/pint --test
	@echo ">>> [2/10] PHP: Rector (dry-run)"
	docker compose exec php php -d memory_limit=1G vendor/bin/rector process --dry-run
	@echo ">>> [3/10] PHP: Larastan"
	docker compose exec php php -d memory_limit=1G vendor/bin/phpstan analyse --no-progress
	@echo ">>> [4/10] Server TS: Type check"
	docker compose exec php npm run types
	@echo ">>> [5/10] Server TS: ESLint (--max-warnings=0)"
	docker compose exec php npx eslint . --max-warnings=0
	@echo ">>> [6/10] Server TS: Prettier (check)"
	docker compose exec php npm run format:check
	@echo ">>> [7/10] Client TS: ESLint + Prettier (check)"
	docker compose exec node npm run lint
	docker compose exec node npm run format:check
	@echo ">>> [8/10] Blocks contract"
	USE_DOCKER=1 bash scripts/check-blocks-contract.sh
	@echo ">>> [9/10] Mobile TS: Type check + ESLint"
	npm --prefix mobile run types
	npm --prefix mobile run lint
	@echo ">>> [10/10] Tests (Pest parallel)"
	docker compose exec -e DB_CONNECTION=mysql -e DB_DATABASE=laravel_test php php -d memory_limit=512M vendor/bin/pest --parallel --processes=$(PEST_PARALLEL_PROCESSES)
	@echo ">>> All checks passed. Safe to push."

# Mobile / Expo app
mobile-install:
	npm --prefix mobile install

mobile-start:
	npm --prefix mobile run start

mobile-start-lan:
	npm --prefix mobile run start -- --host lan

mobile-start-tunnel:
	npm --prefix mobile run start -- --tunnel

mobile-ios:
	npm --prefix mobile run ios

mobile-android:
	npm --prefix mobile run android

mobile-web:
	npm --prefix mobile run web

mobile-types:
	npm --prefix mobile run types

mobile-lint:
	npm --prefix mobile run lint

mobile-check: mobile-types mobile-lint

# Run quality tools
quality:
	docker compose exec php composer larastan
	docker compose exec php vendor/bin/pint
	docker compose exec php npm run format
	docker compose exec php npm run types
	docker compose exec php npm run lint

# Setup project from scratch
setup: build up
	docker compose exec php composer install
	docker compose exec -e NODE_OPTIONS="--max-old-space-size=512" php npm install
	docker compose run --rm node npm install
	docker compose exec php php artisan key:generate
	docker compose exec php php artisan migrate
	cd server && composer install --no-scripts
	cd server && npm install
	cd client && npm install
	@echo "Project setup completed!"

# Show logs
logs:
	docker compose logs -f

# Enter php container
shell:
	docker compose exec php bash

# Clear all caches (including translations cache)
clear:
	docker compose exec php php artisan cache:clear
	docker compose exec php php artisan config:clear
	docker compose exec php php artisan route:clear
	docker compose exec php php artisan view:clear

# Sync admin translation keys from TSX files into lang/*/admin.php
sync-translations:
	docker compose exec php php artisan admin:sync-translations

# Build frontend assets (Next.js admin SPA)
npm-build:
	docker compose exec node npm run build

# Format PHP files with Pint
pint:
	docker compose exec php vendor/bin/pint --dirty

# Inspect php logs in live mode
pail:
	docker compose exec php php artisan pail

node_shell:
	docker compose exec node bash

node_logs:
	docker compose logs -f node

# Run Playwright E2E tests (headless, inside Docker)
e2e:
	docker compose --profile testing run --rm playwright npx playwright test

# Run Playwright with UI reporter (generates HTML report in client/playwright-report/)
e2e-report:
	docker compose --profile testing run --rm playwright npx playwright test --reporter=html

glitchtip-up:
	docker compose -f .docker/glitchtip/compose.yml up -d

glitchtip-down:
	docker compose -f .docker/glitchtip/compose.yml down

glitchtip-logs:
	docker compose -f .docker/glitchtip/compose.yml logs -f
