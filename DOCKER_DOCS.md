# Docker Environment Documentation

This document describes the optimized local Docker Compose setup for the CMS / E-commerce project.

## Basic Usage

To start the essential services for everyday development:
```bash
make up
```
This command starts: `php`, `node`, `nginx`, `mysql`, `redis`, and `mailpit`.

To stop the environment:
```bash
make down
```

## Profiles (Optional Services)

The environment has been divided into profiles to reduce idle CPU and RAM usage.

### Workers (Laravel Horizon & Scheduler)
If you need background processing (Queues managed by Laravel Horizon, and the Cron Scheduler), start the workers profile:
```bash
make up-workers
```

### Search (Typesense)
If you are working on features that require the Typesense search engine:
```bash
make up-search
```

### PDF (Gotenberg)
If you need PDF generation capabilities:
```bash
make up-pdf
```

### Testing (Playwright)
To run end-to-end tests:
```bash
make up-testing
```

### Full Stack
To start absolutely everything:
```bash
make up-full
```

## Dependency Management

Dependencies can be managed both locally (for your IDE like PhpStorm or Cursor to index them correctly) and inside the containers (for runtime).

- **Local (IDE)**: `make ide-install`
  Installs `vendor` and `node_modules` on your host machine.
- **Docker**: `make docker-install`
  Installs dependencies inside the Docker volumes used by the containers.

## Troubleshooting HMR & CPU Usage

By default, file watchers use native OS events which are highly efficient but may fail in some environments (like Windows WSL 1, or older macOS network shares).

If your frontend (Vite or Next.js) doesn't refresh automatically when you save a file, you can enable polling. **Note that polling consumes significantly more CPU.**

In your `.env` file, change:
```env
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true
VITE_USE_POLLING=true
```
Then restart the containers:
```bash
make restart
```

## Diagnostics

If your system is slow, use the following commands to find the culprit:

- **Docker Stats**: `make stats` (shows memory/cpu usage per container)
- **PHP Top Processes**: `make ps-php` (shows top 20 processes in the PHP container)
- **Node Top Processes**: `make ps-node` (shows top 20 processes in the Node container)
- **Horizon Top Processes**: `make ps-horizon` (shows top 20 processes in the Horizon container)
