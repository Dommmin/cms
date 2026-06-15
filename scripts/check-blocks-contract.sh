#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER="${ROOT}/server"
CLIENT="${ROOT}/client"

cd "${ROOT}"

run_in_server() {
    if [[ "${USE_DOCKER:-0}" == "1" ]]; then
        docker compose exec php bash -lc "cd /var/www/html && $*"
    else
        bash -lc "cd \"${SERVER}\" && $*"
    fi
}

run_in_client() {
    if [[ "${USE_DOCKER:-0}" == "1" ]]; then
        docker compose exec node bash -lc "cd /var/www/client && $*"
    else
        bash -lc "cd \"${CLIENT}\" && $*"
    fi
}

echo ">>> [blocks] Export schema and diff snapshot"
run_in_server "php artisan blocks:export"
run_in_server "diff -u tests/Unit/PageBuilder/snapshots/blocks.schema.json storage/app/blocks.schema.json"

echo ">>> [blocks] Snapshot gate (artisan --check)"
run_in_server "php artisan blocks:export --check"

echo ">>> [blocks] Generated TS types (admin SPA)"
run_in_server "npm run generate:blocks-types:check"

echo ">>> [blocks] Generated TS types (storefront)"
run_in_client "npm run generate:blocks-types:check"

echo ">>> [blocks] PHP contract tests"
run_in_server "./vendor/bin/pest --compact tests/Unit/PageBuilder/BlockContractTest.php tests/Unit/PageBuilder/BlockSchemaExportTest.php"

echo ">>> [blocks] Storefront registry"
run_in_client "npm run test:ui -- tests/unit/block-registry.test.ts"

echo ">>> Blocks contract checks passed."
