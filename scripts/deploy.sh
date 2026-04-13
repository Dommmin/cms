#!/usr/bin/env bash
# =============================================================================
# Blue-Green Zero-Downtime Deploy Script
#
# Usage:
#   ./scripts/deploy.sh [--slot blue|green] [--version IMAGE_TAG]
#
# Options:
#   --slot      Target slot to deploy to. Defaults to the inactive slot.
#   --version   Docker image tag to deploy. Defaults to APP_VERSION in .env.prod
#               or "latest".
#   --env-file  Path to the production env file. Defaults to .env.prod
#
# Flow:
#   1. Determine current active slot (blue|green)
#   2. Compute the target (inactive) slot
#   3. Pull new image
#   4. Start target slot with new image
#   5. Wait for health check to pass (max 2 minutes)
#   6. Run DB migrations on the new slot BEFORE switching traffic
#   7. Reload nginx to point to the new slot
#   8. Wait 30 s for in-flight requests to drain
#   9. Stop the old slot
#  10. Update ACTIVE_SLOT in the env file
#
# Rollback:
#   If the health check fails at step 5, the new slot is stopped and the old
#   slot remains live. Traffic is never cut.
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log()  { printf '%s [%s] %s\n' "$(date '+%H:%M:%S')" "${CYAN}INFO${RESET}"    "$*"; }
ok()   { printf '%s [%s] %s\n' "$(date '+%H:%M:%S')" "${GREEN}OK${RESET}"     "$*"; }
warn() { printf '%s [%s] %s\n' "$(date '+%H:%M:%S')" "${YELLOW}WARN${RESET}"  "$*"; }
err()  { printf '%s [%s] %s\n' "$(date '+%H:%M:%S')" "${RED}ERROR${RESET}"    "$*" >&2; }
die()  { err "$*"; exit 1; }

# ── Defaults ─────────────────────────────────────────────────────────────────
TARGET_SLOT=""
APP_VERSION=""
ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_ENDPOINT="http://localhost/health"
HEALTH_TIMEOUT=120   # seconds to wait for health check to pass
DRAIN_WAIT=30        # seconds to drain in-flight requests after traffic switch

# ── Argument parsing ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --slot)    TARGET_SLOT="$2"; shift 2 ;;
        --version) APP_VERSION="$2"; shift 2 ;;
        --env-file) ENV_FILE="$2"; shift 2 ;;
        *) die "Unknown argument: $1" ;;
    esac
done

# ── Resolve working directory to repo root ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

log "Working directory: ${REPO_ROOT}"

# ── Validate prerequisites ────────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || die "docker is not installed"
command -v curl    >/dev/null 2>&1 || die "curl is not installed"

[[ -f "${ENV_FILE}" ]] || die "Env file '${ENV_FILE}' not found. Copy .env.prod.example and fill in the values."
[[ -f "${COMPOSE_FILE}" ]] || die "Compose file '${COMPOSE_FILE}' not found."

# ── Load env file (for defaults) ─────────────────────────────────────────────
# shellcheck disable=SC1090
set -a; source "${ENV_FILE}"; set +a

# ── Determine image version ───────────────────────────────────────────────────
APP_VERSION="${APP_VERSION:-${APP_VERSION:-latest}}"
log "Image version: ${BOLD}${APP_VERSION}${RESET}"

# ── Determine current active slot ────────────────────────────────────────────
CURRENT_SLOT="${ACTIVE_SLOT:-blue}"

if [[ -z "${TARGET_SLOT}" ]]; then
    if [[ "${CURRENT_SLOT}" == "blue" ]]; then
        TARGET_SLOT="green"
    else
        TARGET_SLOT="blue"
    fi
fi

[[ "${TARGET_SLOT}" == "blue" || "${TARGET_SLOT}" == "green" ]] \
    || die "Invalid slot '${TARGET_SLOT}'. Must be 'blue' or 'green'."

log "Current active slot: ${BOLD}${CURRENT_SLOT}${RESET}"
log "Deploying to slot:   ${BOLD}${TARGET_SLOT}${RESET}"

if [[ "${TARGET_SLOT}" == "${CURRENT_SLOT}" ]]; then
    warn "Target slot is already the active slot. This will update the running container in-place."
    warn "For true zero-downtime, deploy to the inactive slot instead."
fi

# ── Helper: run docker compose with prod file + env ──────────────────────────
dc() {
    APP_VERSION="${APP_VERSION}" ACTIVE_SLOT="${TARGET_SLOT}" \
        docker compose \
            --env-file "${ENV_FILE}" \
            -f "${COMPOSE_FILE}" \
            "$@"
}

dc_current() {
    ACTIVE_SLOT="${CURRENT_SLOT}" \
        docker compose \
            --env-file "${ENV_FILE}" \
            -f "${COMPOSE_FILE}" \
            "$@"
}

# ── Step 1: Pull new image ────────────────────────────────────────────────────
log "Pulling image for slot ${TARGET_SLOT}..."
dc pull "app_${TARGET_SLOT}" || die "Failed to pull image"
ok "Image pulled"

# ── Step 2: Start new slot ────────────────────────────────────────────────────
log "Starting app_${TARGET_SLOT}..."

if [[ "${TARGET_SLOT}" == "green" ]]; then
    APP_VERSION="${APP_VERSION}" ACTIVE_SLOT="${TARGET_SLOT}" \
        docker compose \
            --env-file "${ENV_FILE}" \
            -f "${COMPOSE_FILE}" \
            --profile green \
            up -d "app_${TARGET_SLOT}"
else
    dc up -d "app_${TARGET_SLOT}"
fi

ok "app_${TARGET_SLOT} started"

# ── Step 3: Wait for health check ────────────────────────────────────────────
log "Waiting for app_${TARGET_SLOT} to become healthy (timeout: ${HEALTH_TIMEOUT}s)..."

ELAPSED=0
HEALTHY=false
SLOT_HEALTH_URL="http://$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "cms_app_${TARGET_SLOT}" 2>/dev/null || echo 'localhost')/health"

while [[ "${ELAPSED}" -lt "${HEALTH_TIMEOUT}" ]]; do
    # Check Docker health status first
    DOCKER_HEALTH="$(docker inspect --format='{{.State.Health.Status}}' "cms_app_${TARGET_SLOT}" 2>/dev/null || echo 'unknown')"

    if [[ "${DOCKER_HEALTH}" == "healthy" ]]; then
        HEALTHY=true
        break
    fi

    if [[ "${DOCKER_HEALTH}" == "unhealthy" ]]; then
        break
    fi

    sleep 5
    ELAPSED=$((ELAPSED + 5))
    log "  Still waiting... (${ELAPSED}s, docker_health=${DOCKER_HEALTH})"
done

if [[ "${HEALTHY}" != "true" ]]; then
    err "app_${TARGET_SLOT} did not become healthy within ${HEALTH_TIMEOUT}s."
    err "Docker health: ${DOCKER_HEALTH}"
    err "Rolling back — stopping app_${TARGET_SLOT}..."

    if [[ "${TARGET_SLOT}" == "green" ]]; then
        docker compose \
            --env-file "${ENV_FILE}" \
            -f "${COMPOSE_FILE}" \
            --profile green \
            stop "app_${TARGET_SLOT}" || true
    else
        dc stop "app_${TARGET_SLOT}" || true
    fi

    die "Deploy aborted. Active slot ${CURRENT_SLOT} remains live."
fi

ok "app_${TARGET_SLOT} is healthy"

# ── Step 4: Run DB migrations on the new slot ────────────────────────────────
log "Running database migrations on app_${TARGET_SLOT}..."
docker exec "cms_app_${TARGET_SLOT}" php artisan migrate --force \
    || die "Migrations failed — deploy aborted. Active slot ${CURRENT_SLOT} remains live."
ok "Migrations complete"

# ── Step 5: Warm up caches on the new slot ───────────────────────────────────
log "Warming up caches..."
docker exec "cms_app_${TARGET_SLOT}" php artisan config:cache
docker exec "cms_app_${TARGET_SLOT}" php artisan route:cache
docker exec "cms_app_${TARGET_SLOT}" php artisan view:cache
docker exec "cms_app_${TARGET_SLOT}" php artisan event:cache
ok "Caches warm"

# ── Step 6: Switch nginx to the new slot ─────────────────────────────────────
log "Switching nginx to slot ${TARGET_SLOT}..."

# Update ACTIVE_SLOT in the running nginx container via environment reload
# The nginx image processes templates on SIGHUP — update env and reload
docker exec cms_nginx sh -c "sed -i 's/ACTIVE_SLOT=.*/ACTIVE_SLOT=${TARGET_SLOT}/' /etc/nginx/conf.d/env || true"

# Re-render the template with the new ACTIVE_SLOT and reload nginx
docker exec -e ACTIVE_SLOT="${TARGET_SLOT}" cms_nginx sh -c \
    'envsubst "\${ACTIVE_SLOT}" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf \
    && nginx -t && nginx -s reload'

ok "Nginx reloaded — traffic now routing to ${TARGET_SLOT}"

# ── Step 7: Update env file ───────────────────────────────────────────────────
log "Updating ACTIVE_SLOT in ${ENV_FILE}..."
if grep -q '^ACTIVE_SLOT=' "${ENV_FILE}"; then
    sed -i.bak "s/^ACTIVE_SLOT=.*/ACTIVE_SLOT=${TARGET_SLOT}/" "${ENV_FILE}" && rm -f "${ENV_FILE}.bak"
else
    echo "ACTIVE_SLOT=${TARGET_SLOT}" >> "${ENV_FILE}"
fi

if grep -q '^APP_VERSION=' "${ENV_FILE}"; then
    sed -i.bak "s/^APP_VERSION=.*/APP_VERSION=${APP_VERSION}/" "${ENV_FILE}" && rm -f "${ENV_FILE}.bak"
else
    echo "APP_VERSION=${APP_VERSION}" >> "${ENV_FILE}"
fi

ok "Env file updated (ACTIVE_SLOT=${TARGET_SLOT}, APP_VERSION=${APP_VERSION})"

# ── Step 8: Drain in-flight requests ─────────────────────────────────────────
log "Draining in-flight requests (${DRAIN_WAIT}s)..."
sleep "${DRAIN_WAIT}"
ok "Drain complete"

# ── Step 9: Stop old slot ─────────────────────────────────────────────────────
if [[ "${TARGET_SLOT}" != "${CURRENT_SLOT}" ]]; then
    log "Stopping old slot app_${CURRENT_SLOT}..."

    if [[ "${CURRENT_SLOT}" == "green" ]]; then
        docker compose \
            --env-file "${ENV_FILE}" \
            -f "${COMPOSE_FILE}" \
            --profile green \
            stop "app_${CURRENT_SLOT}" || warn "Could not stop app_${CURRENT_SLOT} — may already be stopped"
    else
        dc_current stop "app_${CURRENT_SLOT}" || warn "Could not stop app_${CURRENT_SLOT} — may already be stopped"
    fi

    ok "app_${CURRENT_SLOT} stopped"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
printf '\n'
ok "${BOLD}Deploy complete!${RESET}"
ok "  Active slot : ${GREEN}${TARGET_SLOT}${RESET}"
ok "  Image       : ${APP_VERSION}"
ok "  Stopped     : ${RED}${CURRENT_SLOT}${RESET}"
printf '\n'
