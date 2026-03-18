.PHONY: up stop down build install shell migrate fresh test setup-test-db logs pail seed fresh-seed help

# Set environment variables
export UID = $(shell id -u)
export GID = $(shell id -g)
export UNAME = $(shell whoami)

# Help
help:
	@echo "Available commands:"
	@echo "  up - Start the application"
	@echo "  down - Stop the application"
	@echo "  stop - Stop the application"
	@echo "  build - Build containers"
	@echo "  install - Install dependencies"
	@echo "  migrate - Run migrations"
	@echo "  fresh - Fresh migrations"
	@echo "  test - Run tests"
	@echo "  setup-test-db - Setup test database"
	@echo "  logs - Show logs"
	@echo "  pail - Inspect php logs in live mode"
	@echo "  seed - Seed database"
	@echo "  fresh-seed - Fresh migrations and seed database"
	@echo "  help - Show this help"

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

# Run quality tools
quality:
	docker compose exec php composer larastan
	docker compose exec php composer pint
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

# Clear all caches
clear:
	docker compose exec php php artisan cache:clear
	docker compose exec php php artisan config:clear
	docker compose exec php php artisan route:clear
	docker compose exec php php artisan view:clear

# Inspect php logs in live mode
pail:
	docker compose exec php php artisan pail

node_shell:
	docker compose exec node bash

node_logs:
	docker compose logs -f node
