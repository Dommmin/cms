.PHONY: up stop down build install shell migrate fresh test setup-test-db logs pail seed fresh-seed clear sync-translations npm-build pint fix check e2e e2e-report help

# Set environment variables
export UID = $(shell id -u)
export GID = $(shell id -g)
export UNAME = $(shell whoami)

# Help
help:
	@echo "Available commands:"
	@echo "  up                 - Start the application"
	@echo "  down               - Stop the application"
	@echo "  stop               - Stop the application"
	@echo "  build              - Build containers"
	@echo "  install            - Install dependencies"
	@echo "  migrate            - Run migrations"
	@echo "  fresh              - Fresh migrations"
	@echo "  seed               - Seed database"
	@echo "  fresh-seed         - Fresh migrations and seed database"
	@echo "  test               - Run tests"
	@echo "  setup-test-db      - Setup test database"
	@echo "  clear              - Clear all Laravel caches"
	@echo "  sync-translations  - Sync admin translation keys from TSX files"
	@echo "  npm-build          - Build frontend assets (node container)"
	@echo "  pint               - Format PHP files with Pint"
	@echo "  fix                - Auto-fix all code style issues (pint, rector, eslint --fix, prettier)"
	@echo "  check              - Run all CI checks read-only — fails if anything is wrong (mirrors GitHub Actions)"
	@echo "  quality            - Run all quality checks (Pint, PHPStan, ESLint)"
	@echo "  logs               - Show logs"
	@echo "  pail               - Inspect php logs in live mode"
	@echo "  shell              - Enter php container"
	@echo "  node_shell         - Enter node container"
	@echo "  help               - Show this help"

# Start the application
up:
	docker compose up -d

# Stop the application
down:
	docker compose down

stop:
	docker compose stop

# Build containers
build:
	@echo "Setting up the project..."
	@if [ ! -f .env ]; then \
		cp .env.local .env; \
		echo "Created .env file from .env.local"; \
	fi
	docker compose build

# Install dependencies
install:
	docker compose exec php composer install
	docker compose exec -e NODE_OPTIONS="--max-old-space-size=512" php npm install
	docker compose run --rm node npm install

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

# Setup test database
setup-test-db:
	docker compose exec mysql mysql -uroot -psecret -e "CREATE DATABASE IF NOT EXISTS laravel_test;"
	docker compose exec php php artisan migrate --env=testing

# Run tests
test: setup-test-db
	docker compose exec php php artisan test --env=testing

# Auto-fix all code style issues (run before committing)
# Applies pint, rector, eslint --fix, prettier --write in the correct order
fix:
	@echo ">>> PHP: Pint (format)"
	docker compose exec php vendor/bin/pint
	@echo ">>> PHP: Rector (apply refactors)"
	docker compose exec php php -d memory_limit=1G vendor/bin/rector process
	@echo ">>> PHP: Pint (post-rector normalisation)"
	docker compose exec php vendor/bin/pint
	@echo ">>> Server TS: ESLint --fix + Prettier"
	docker compose exec php npm run lint
	docker compose exec php npm run format
	@echo ">>> Client TS: ESLint --fix + Prettier"
	docker compose exec node npx eslint . --fix
	docker compose exec node npm run format
	@echo ">>> Done. Run 'make check' to verify nothing remains."

# Read-only CI check — mirrors GitHub Actions exactly (fails if anything is wrong)
# Run this before pushing: make fix && make check
check:
	@echo ">>> [1/7] PHP: Pint (check)"
	docker compose exec php vendor/bin/pint --test
	@echo ">>> [2/7] PHP: Rector (dry-run)"
	docker compose exec php php -d memory_limit=1G vendor/bin/rector process --dry-run
	@echo ">>> [3/7] PHP: Larastan"
	docker compose exec php php -d memory_limit=1G vendor/bin/phpstan analyse --no-progress
	@echo ">>> [4/7] Server TS: ESLint (--max-warnings=0)"
	docker compose exec php npx eslint . --max-warnings=0
	@echo ">>> [5/7] Server TS: Prettier (check)"
	docker compose exec php npm run format:check
	@echo ">>> [6/7] Client TS: ESLint + Prettier (check)"
	docker compose exec node npm run lint
	docker compose exec node npm run format:check
	@echo ">>> [7/7] Tests (Pest parallel)"
	docker compose exec php php -d memory_limit=512M vendor/bin/pest --parallel
	@echo ">>> All checks passed. Safe to push."

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
