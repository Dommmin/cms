#!/usr/bin/env bash
# =============================================================================
# k3s Bootstrap Script — CMS Production Cluster
#
# Automates the full cluster setup from scratch.
# Run this ONCE on a fresh server, then configure CI/CD secrets.
#
# Usage (from repo root on your LOCAL machine):
#   chmod +x k8s/bootstrap.sh
#   ./k8s/bootstrap.sh
#
# Requirements:
#   - kubectl installed locally and KUBECONFIG pointing to the cluster
#   - git repo cloned (k8s/ manifests must exist)
#   - DNS A records already pointing to the server IP
# =============================================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()      { echo -e "${GREEN}[OK]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
section() { echo -e "\n${BOLD}══════════════════════════════════════════${NC}"; echo -e "${BOLD} $*${NC}"; echo -e "${BOLD}══════════════════════════════════════════${NC}"; }
prompt()  { echo -e "${YELLOW}[INPUT]${NC} $*"; }

# ─── Prereq check ────────────────────────────────────────────────────────────
check_prereqs() {
  section "Checking prerequisites"

  local missing=0

  if ! command -v kubectl &>/dev/null; then
    error "kubectl not found. Install: https://kubernetes.io/docs/tasks/tools/"
    missing=1
  else
    ok "kubectl: $(kubectl version --client --short 2>/dev/null | head -1)"
  fi

  if ! kubectl cluster-info &>/dev/null 2>&1; then
    error "Cannot connect to Kubernetes cluster."
    error "Make sure KUBECONFIG is set: export KUBECONFIG=~/.kube/config-hetzner"
    missing=1
  else
    ok "Cluster connection: OK"
  fi

  if [ ! -d "k8s" ]; then
    error "k8s/ directory not found. Run this script from the repo root."
    missing=1
  else
    ok "k8s/ manifests: found"
  fi

  if [ "$missing" -eq 1 ]; then
    error "Prerequisites not met. Fix the issues above and re-run."
    exit 1
  fi
}

# ─── Collect inputs ──────────────────────────────────────────────────────────
collect_inputs() {
  section "Configuration"

  prompt "MySQL root password (strong, at least 16 chars):"
  read -rs MYSQL_ROOT_PASSWORD; echo
  prompt "MySQL app username [cms]:"
  read -r MYSQL_USERNAME; MYSQL_USERNAME="${MYSQL_USERNAME:-cms}"
  prompt "MySQL app password (strong, at least 16 chars):"
  read -rs MYSQL_PASSWORD; echo
  prompt "Redis password (strong, at least 16 chars):"
  read -rs REDIS_PASSWORD; echo
  prompt "Typesense API key (random, at least 16 chars):"
  read -rs TYPESENSE_API_KEY; echo

  echo
  prompt "CI/CD system? [1] GitHub Actions  [2] GitLab CI  [Enter to skip]:"
  read -r CI_CHOICE

  REGISTRY_TYPE=""
  REGISTRY_TOKEN=""
  REGISTRY_USER=""
  if [[ "$CI_CHOICE" == "1" ]]; then
    REGISTRY_TYPE="ghcr"
    prompt "GitHub username:"
    read -r REGISTRY_USER
    prompt "GitHub Personal Access Token (scope: read:packages):"
    read -rs REGISTRY_TOKEN; echo
  elif [[ "$CI_CHOICE" == "2" ]]; then
    REGISTRY_TYPE="gitlab"
    prompt "GitLab Deploy Token username (from Settings → Repository → Deploy tokens):"
    read -r REGISTRY_USER
    prompt "GitLab Deploy Token value:"
    read -rs REGISTRY_TOKEN; echo
  fi

  prompt "Install cert-manager + create ClusterIssuer? [Y/n]:"
  read -r INSTALL_CERT; INSTALL_CERT="${INSTALL_CERT:-Y}"

  if [[ "${INSTALL_CERT^^}" == "Y" ]]; then
    prompt "Your email for Let's Encrypt (certificate expiry alerts):"
    read -r LETSENCRYPT_EMAIL
  fi

  prompt "Apply ingress-dev.yaml (HTTP only, for testing without a domain)? [y/N]:"
  read -r APPLY_DEV_INGRESS; APPLY_DEV_INGRESS="${APPLY_DEV_INGRESS:-N}"

  if [[ "${APPLY_DEV_INGRESS^^}" != "Y" ]]; then
    prompt "Apply production ingress.yaml (requires DNS + cert-manager)? [Y/n]:"
    read -r APPLY_PROD_INGRESS; APPLY_PROD_INGRESS="${APPLY_PROD_INGRESS:-Y}"
  fi

  prompt "Install GlitchTip (error tracking via Helm)? [y/N]:"
  read -r INSTALL_GLITCHTIP; INSTALL_GLITCHTIP="${INSTALL_GLITCHTIP:-N}"

  echo
  info "Configuration collected. Starting setup..."
}

# ─── Step 1: Traefik config ───────────────────────────────────────────────────
step_traefik_config() {
  section "Step 1 — Traefik HelmChartConfig"

  kubectl apply -f k8s/traefik/config.yaml
  ok "Traefik HelmChartConfig applied"

  info "Waiting for Traefik to be Running..."
  kubectl -n kube-system rollout status deployment/traefik --timeout=3m
  ok "Traefik is running"
}

# ─── Step 2: cert-manager ────────────────────────────────────────────────────
step_cert_manager() {
  if [[ "${INSTALL_CERT^^}" != "Y" ]]; then
    warn "Skipping cert-manager installation"
    return
  fi

  section "Step 2 — cert-manager"

  info "Installing cert-manager (this may take ~1 minute)..."
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

  info "Waiting for cert-manager pods to be ready..."
  kubectl -n cert-manager rollout status deployment/cert-manager --timeout=3m
  kubectl -n cert-manager rollout status deployment/cert-manager-webhook --timeout=3m
  kubectl -n cert-manager rollout status deployment/cert-manager-cainjector --timeout=3m
  ok "cert-manager is ready"

  info "Creating ClusterIssuer for Let's Encrypt..."
  kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${LETSENCRYPT_EMAIL}
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            ingressClassName: traefik
EOF
  ok "ClusterIssuer letsencrypt-prod created"
}

# ─── Step 3: Namespace + Middleware ──────────────────────────────────────────
step_namespace() {
  section "Step 3 — Namespace + Traefik Middleware"

  kubectl apply -f k8s/namespace.yaml
  ok "Namespace cms-prod created"

  kubectl apply -f k8s/traefik/middleware.yaml
  ok "Traefik Middleware applied (redirect-https, body-size)"
}

# ─── Step 4: Secrets ─────────────────────────────────────────────────────────
step_secrets() {
  section "Step 4 — Kubernetes Secrets"

  # MySQL secret
  kubectl create secret generic cms-mysql \
    --namespace=cms-prod \
    --from-literal=root-password="${MYSQL_ROOT_PASSWORD}" \
    --from-literal=username="${MYSQL_USERNAME}" \
    --from-literal=password="${MYSQL_PASSWORD}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ok "cms-mysql secret created"

  # Redis secret
  kubectl create secret generic cms-redis \
    --namespace=cms-prod \
    --from-literal=password="${REDIS_PASSWORD}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ok "cms-redis secret created"

  # Typesense secret
  kubectl create secret generic cms-typesense \
    --namespace=cms-prod \
    --from-literal=api-key="${TYPESENSE_API_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ok "cms-typesense secret created"

  # Client API URL secret
  kubectl apply -f k8s/client/secret.yaml.example
  ok "cms-client secret applied (API_URL → internal cluster address)"

  info "Server .env secret: skipped — CI/CD will create it from PROD_ENV / SERVER_ENV."
  info "If you need it now, run:"
  info "  kubectl create secret generic cms-server-env --from-file=.env=server/.env.production --namespace=cms-prod --dry-run=client -o yaml | kubectl apply -f -"
}

# ─── Step 5: Pull secret ─────────────────────────────────────────────────────
step_pull_secret() {
  if [[ -z "$REGISTRY_TYPE" ]]; then
    warn "Skipping pull secret (no CI/CD registry configured)"
    return
  fi

  section "Step 5 — Container Registry Pull Secret"

  if [[ "$REGISTRY_TYPE" == "ghcr" ]]; then
    kubectl create secret docker-registry ghcr-pull-secret \
      --docker-server=ghcr.io \
      --docker-username="${REGISTRY_USER}" \
      --docker-password="${REGISTRY_TOKEN}" \
      --namespace=cms-prod \
      --dry-run=client -o yaml | kubectl apply -f -
    ok "ghcr-pull-secret created (ghcr.io)"
  elif [[ "$REGISTRY_TYPE" == "gitlab" ]]; then
    kubectl create secret docker-registry ghcr-pull-secret \
      --docker-server=registry.gitlab.com \
      --docker-username="${REGISTRY_USER}" \
      --docker-password="${REGISTRY_TOKEN}" \
      --namespace=cms-prod \
      --dry-run=client -o yaml | kubectl apply -f -
    ok "ghcr-pull-secret created (registry.gitlab.com)"
  fi
}

# ─── Step 6: MySQL + Redis ───────────────────────────────────────────────────
step_databases() {
  section "Step 6 — MySQL + Redis"

  kubectl apply -f k8s/mysql/statefulset.yaml
  kubectl apply -f k8s/mysql/service.yaml
  ok "MySQL StatefulSet + Service applied"

  kubectl apply -f k8s/redis/pvc.yaml
  kubectl apply -f k8s/redis/deployment.yaml
  kubectl apply -f k8s/redis/service.yaml
  ok "Redis PVC + Deployment + Service applied"

  info "Waiting for MySQL to be ready (this may take ~2 minutes)..."
  kubectl -n cms-prod rollout status statefulset/cms-mysql --timeout=5m
  ok "MySQL is ready"

  info "Waiting for Redis..."
  kubectl -n cms-prod rollout status deployment/cms-redis --timeout=3m
  ok "Redis is ready"
}

# ─── Step 7: Gotenberg + Typesense ───────────────────────────────────────────
step_services() {
  section "Step 7 — Gotenberg + Typesense"

  kubectl apply -f k8s/gotenberg/deployment.yaml
  kubectl apply -f k8s/gotenberg/service.yaml
  ok "Gotenberg deployed"

  kubectl apply -f k8s/typesense/pvc.yaml
  kubectl apply -f k8s/typesense/deployment.yaml
  kubectl apply -f k8s/typesense/service.yaml
  info "Waiting for Typesense (~20s initialization)..."
  kubectl -n cms-prod rollout status deployment/cms-typesense --timeout=3m
  ok "Typesense is ready"
}

# ─── Step 8: Storage PVC ─────────────────────────────────────────────────────
step_storage() {
  section "Step 8 — Server Storage PVC"

  kubectl apply -f k8s/server/pvc-storage.yaml
  ok "cms-server-storage PVC created"

  # Wait for PVC to bind
  local retries=12
  while [ "$retries" -gt 0 ]; do
    local status
    status=$(kubectl -n cms-prod get pvc cms-server-storage -o jsonpath='{.status.phase}' 2>/dev/null || echo "Pending")
    if [ "$status" = "Bound" ]; then
      ok "PVC cms-server-storage is Bound"
      return
    fi
    info "PVC status: $status — waiting..."
    sleep 5
    retries=$((retries - 1))
  done
  warn "PVC did not bind within 60s — check: kubectl -n cms-prod describe pvc cms-server-storage"
}

# ─── Step 9: Application ─────────────────────────────────────────────────────
step_application() {
  section "Step 9 — Application (server + client)"

  kubectl apply -f k8s/server/service.yaml
  kubectl apply -f k8s/server/deployment.yaml
  kubectl apply -f k8s/server/deployment-queue.yaml
  kubectl apply -f k8s/server/cronjob-scheduler.yaml
  kubectl apply -f k8s/server/hpa.yaml
  ok "Server (Laravel) manifests applied"

  kubectl apply -f k8s/client/service.yaml
  kubectl apply -f k8s/client/deployment.yaml
  kubectl apply -f k8s/client/hpa.yaml
  ok "Client (Next.js) manifests applied"

  info "Note: pods may be in ImagePullBackOff until CI/CD pushes the first image."
}

# ─── Step 10: Ingress ────────────────────────────────────────────────────────
step_ingress() {
  section "Step 10 — Ingress"

  if [[ "${APPLY_DEV_INGRESS^^}" == "Y" ]]; then
    kubectl apply -f k8s/ingress-dev.yaml
    ok "Development ingress applied (HTTP only, sslip.io)"
    warn "Remember: edit k8s/ingress-dev.yaml and replace the IP with your actual server IP!"
  elif [[ "${APPLY_PROD_INGRESS^^}" == "Y" ]]; then
    kubectl apply -f k8s/ingress.yaml
    ok "Production ingress applied (HTTPS + TLS)"
    info "TLS certificate will be issued by cert-manager (may take 1-2 minutes after DNS is ready)"
  else
    warn "No ingress applied. Apply manually when ready:"
    warn "  kubectl apply -f k8s/ingress.yaml"
  fi
}

# ─── Step 11: Maintenance CronJobs ───────────────────────────────────────────
step_maintenance() {
  section "Step 11 — Maintenance (image cleanup)"

  kubectl apply -f k8s/maintenance/cronjob-image-cleanup.yaml
  ok "Image cleanup CronJob applied (runs every Sunday 2:00 AM)"
}

# ─── Step 12: GlitchTip (optional) ───────────────────────────────────────────
step_glitchtip() {
  if [[ "${INSTALL_GLITCHTIP^^}" != "Y" ]]; then
    return
  fi

  section "Step 12 — GlitchTip (error tracking)"

  if ! command -v helm &>/dev/null; then
    warn "helm not found — skipping GlitchTip. Install helm and run manually:"
    warn "  helm repo add glitchtip https://glitchtip.github.io/helm-charts"
    warn "  helm upgrade --install glitchtip glitchtip/glitchtip --namespace glitchtip --create-namespace -f k8s/glitchtip/values.example.yaml"
    return
  fi

  info "Edit k8s/glitchtip/values.example.yaml first (domain, email, passwords)."
  prompt "Have you edited values.example.yaml? [y/N]:"
  read -r EDITED; EDITED="${EDITED:-N}"

  if [[ "${EDITED^^}" != "Y" ]]; then
    warn "Skipping GlitchTip — edit the file and run manually:"
    warn "  helm repo add glitchtip https://glitchtip.github.io/helm-charts && helm repo update"
    warn "  helm upgrade --install glitchtip glitchtip/glitchtip --namespace glitchtip --create-namespace -f k8s/glitchtip/values.example.yaml"
    return
  fi

  helm repo add glitchtip https://glitchtip.github.io/helm-charts 2>/dev/null || true
  helm repo update
  helm upgrade --install glitchtip glitchtip/glitchtip \
    --namespace glitchtip \
    --create-namespace \
    -f k8s/glitchtip/values.example.yaml
  ok "GlitchTip deployed to namespace glitchtip"
}

# ─── Summary ─────────────────────────────────────────────────────────────────
print_summary() {
  section "Bootstrap Complete"

  echo -e "${GREEN}Cluster is set up. Here's what was deployed:${NC}"
  echo ""
  kubectl -n cms-prod get pods 2>/dev/null || true
  echo ""
  echo -e "${BOLD}Next steps:${NC}"
  echo ""
  echo "  1. Configure CI/CD secrets:"
  echo "     GitHub: KUBECONFIG_PROD (plain text), PROD_ENV (Variable), ENV_CLIENT_PROD (Variable)"
  echo "     GitLab: KUBECONFIG (base64-encoded), SERVER_ENV (masked), ENV_CLIENT_PROD"
  echo ""
  echo "  2. Push to master — the pipeline will:"
  echo "     - Build Docker images"
  echo "     - Sync PROD_ENV → k8s Secret"
  echo "     - Run database migrations"
  echo "     - Roll out server + client"
  echo ""
  echo "  3. After first deploy, import search indexes:"
  echo "     kubectl -n cms-prod exec deployment/cms-server -- php artisan scout:import 'App\\Models\\Product'"
  echo "     kubectl -n cms-prod exec deployment/cms-server -- php artisan scout:import 'App\\Models\\BlogPost'"
  echo ""
  echo "  4. (Optional) Set up MySQL backup CronJob:"
  echo "     mkdir -p /opt/cms-backups  # on the server"
  echo "     kubectl apply -f k8s/mysql/cronjob-backup.yaml"
  echo ""
  echo -e "${BOLD}Useful commands:${NC}"
  echo "  kubectl -n cms-prod get pods          # check pod status"
  echo "  kubectl -n cms-prod get ingress        # check ingress + IP"
  echo "  kubectl -n cms-prod get certificate    # check TLS cert"
  echo "  kubectl -n cms-prod logs -f deployment/cms-server"
  echo "  k9s -n cms-prod                        # terminal UI"
  echo ""

  if [[ "${INSTALL_CERT^^}" == "Y" ]]; then
    echo -e "${BOLD}CI/CD kubeconfig (paste into KUBECONFIG_PROD / base64 for GitLab):${NC}"
    echo "  GitHub:  cat ~/.kube/config-hetzner"
    echo "  GitLab:  cat ~/.kube/config-hetzner | base64 | tr -d '\\n'"
    echo ""
  fi
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  echo -e "${BOLD}"
  echo "╔══════════════════════════════════════════════╗"
  echo "║     k3s Bootstrap — CMS Production Cluster  ║"
  echo "╚══════════════════════════════════════════════╝"
  echo -e "${NC}"

  check_prereqs
  collect_inputs

  step_traefik_config
  step_cert_manager
  step_namespace
  step_secrets
  step_pull_secret
  step_databases
  step_services
  step_storage
  step_application
  step_ingress
  step_maintenance
  step_glitchtip

  print_summary
}

main "$@"
