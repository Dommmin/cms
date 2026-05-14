#!/usr/bin/env bash
# =============================================================================
# k3s Bootstrap Script — Production Cluster
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

# ─── Apply a k8s manifest ────────────────────────────────────────────────────
# Manifests are hardcoded to the `app` namespace / `app-*` resource names,
# so no substitution is needed — this is a thin wrapper for consistency.
kapply() {
  kubectl apply -f "$1"
}

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

  # Soft checks — not fatal, the related steps just get skipped.
  if command -v helm &>/dev/null; then
    ok "helm: present (GlitchTip step available)"
  else
    warn "helm: not found — the GlitchTip step (12) will be skipped."
    warn "      Install now if you want it: macOS 'brew install helm'."
  fi

  if [ "$missing" -eq 1 ]; then
    error "Prerequisites not met. Fix the issues above and re-run."
    exit 1
  fi
}

# ─── Collect inputs ──────────────────────────────────────────────────────────
collect_inputs() {
  section "Configuration"

  # The k8s manifests are hardcoded to the `app` namespace and `app-*`
  # resource names — this is not configurable without editing every file.
  APP_NAME="app"
  info "Namespace / resource prefix: ${APP_NAME} (fixed — manifests hardcode it)"

  echo
  prompt "MySQL root password (strong, at least 16 chars):"
  read -rs MYSQL_ROOT_PASSWORD; echo
  prompt "MySQL app username [app]:"
  read -r MYSQL_USERNAME; MYSQL_USERNAME="${MYSQL_USERNAME:-app}"
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

  if [[ "$INSTALL_CERT" == [Yy] ]]; then
    prompt "Your email for Let's Encrypt (certificate expiry alerts):"
    read -r LETSENCRYPT_EMAIL
  fi

  prompt "Apply ingress-dev.yaml (HTTP only, for testing without a domain)? [y/N]:"
  read -r APPLY_DEV_INGRESS; APPLY_DEV_INGRESS="${APPLY_DEV_INGRESS:-N}"

  if [[ "$APPLY_DEV_INGRESS" != [Yy] ]]; then
    prompt "Apply production ingress.yaml (requires DNS + cert-manager)? [Y/n]:"
    read -r APPLY_PROD_INGRESS; APPLY_PROD_INGRESS="${APPLY_PROD_INGRESS:-Y}"
  fi

  prompt "Install GlitchTip (error tracking via Helm)? [y/N]:"
  read -r INSTALL_GLITCHTIP; INSTALL_GLITCHTIP="${INSTALL_GLITCHTIP:-N}"

  prompt "Deploy ops tooling (Rancher + Uptime Kuma) via docker-compose.ops.yml? [y/N]:"
  read -r INSTALL_OPS; INSTALL_OPS="${INSTALL_OPS:-N}"
  if [[ "$INSTALL_OPS" == [Yy] ]]; then
    prompt "  SSH host as user@ip (e.g. ubuntu@1.2.3.4 — must have PASSWORDLESS sudo;"
    prompt "  leave empty if running this script ON the server):"
    read -r OPS_SSH_HOST
  fi

  echo
  info "App name / namespace: ${APP_NAME}"
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

  # Give klipper/cloud LB a moment to assign an external IP
  sleep 5
  local ext_ip
  ext_ip=$(kubectl -n kube-system get svc traefik \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)

  if [ -n "$ext_ip" ]; then
    ok "Traefik external IP: ${ext_ip} (LoadBalancer ready)"
  else
    warn "Traefik has no external IP — ports 80/443 are NOT reachable from the internet."
    warn ""
    warn "  Hetzner Cloud:  install hcloud-controller-manager and it provisions a real LB."
    warn "  Other providers (OVHcloud, Vultr, DigitalOcean, bare metal, etc.):"
    warn "    k3s ships with a built-in LB (servicelb/klipper) that binds port 80/443"
    warn "    directly on the host. It must NOT be disabled."
    warn ""
    warn "  If k3s was installed with '--disable=servicelb', fix it now on the server:"
    warn "    sudo nano /etc/systemd/system/k3s.service"
    warn "    Remove the line:  '--disable=servicelb' \\"
    warn "    sudo systemctl daemon-reload && sudo systemctl restart k3s"
    warn ""
    warn "  Without this, TLS certificates (Let's Encrypt HTTP-01) will never be issued."
    info "Continuing bootstrap — fix servicelb before running the first deploy."
  fi
}

# ─── Step 2: cert-manager ────────────────────────────────────────────────────
step_cert_manager() {
  if [[ "$INSTALL_CERT" != [Yy] ]]; then
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
  ok "cert-manager pods are running"

  # `rollout status` is NOT enough — the webhook's serving cert is injected by
  # cainjector AFTER the pod reports ready. Hitting the API too early fails with
  # 'tls: failed to verify certificate: x509: certificate signed by unknown
  # authority'. Probe the webhook with a server-side dry-run until it answers.
  info "Waiting for cert-manager webhook to be reachable (server-side probe)..."
  local webhook_ok=0
  for i in $(seq 1 36); do
    if kubectl apply --dry-run=server -f - >/dev/null 2>&1 <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: bootstrap-webhook-probe
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${LETSENCRYPT_EMAIL}
    privateKeySecretRef:
      name: bootstrap-webhook-probe
    solvers:
      - http01:
          ingress:
            ingressClassName: traefik
EOF
    then
      webhook_ok=1
      ok "cert-manager webhook is reachable (after ${i} attempt(s))"
      break
    fi
    sleep 5
  done

  if [ "$webhook_ok" -ne 1 ]; then
    error "cert-manager webhook did not become reachable after 180s."
    error "Check: kubectl -n cert-manager get pods; kubectl -n cert-manager logs deploy/cert-manager-webhook"
    exit 1
  fi

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

  kapply k8s/namespace.yaml
  ok "Namespace ${APP_NAME} created"

  kapply k8s/traefik/middleware.yaml
  ok "Traefik Middleware applied (redirect-https, body-size)"
}

# ─── Step 4: Secrets ─────────────────────────────────────────────────────────
step_secrets() {
  section "Step 4 — Kubernetes Secrets"

  # MySQL secret
  kubectl create secret generic "${APP_NAME}-mysql" \
    --namespace="${APP_NAME}" \
    --from-literal=root-password="${MYSQL_ROOT_PASSWORD}" \
    --from-literal=username="${MYSQL_USERNAME}" \
    --from-literal=password="${MYSQL_PASSWORD}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ok "${APP_NAME}-mysql secret created"

  # Redis secret
  kubectl create secret generic "${APP_NAME}-redis" \
    --namespace="${APP_NAME}" \
    --from-literal=password="${REDIS_PASSWORD}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ok "${APP_NAME}-redis secret created"

  # Typesense secret
  kubectl create secret generic "${APP_NAME}-typesense" \
    --namespace="${APP_NAME}" \
    --from-literal=api-key="${TYPESENSE_API_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ok "${APP_NAME}-typesense secret created"

  # No client secret — the Next.js internal API URL is not sensitive, it's a
  # plain env var (API_URL) baked into k8s/client/deployment.yaml.

  info "Server .env secret: skipped — CI/CD will create it from PROD_ENV / SERVER_ENV."
  info "If you need it now, run:"
  info "  kubectl create secret generic ${APP_NAME}-server-env --from-file=.env=server/.env.production --namespace=${APP_NAME} --dry-run=client -o yaml | kubectl apply -f -"
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
      --namespace="${APP_NAME}" \
      --dry-run=client -o yaml | kubectl apply -f -
    ok "ghcr-pull-secret created (ghcr.io)"
  elif [[ "$REGISTRY_TYPE" == "gitlab" ]]; then
    kubectl create secret docker-registry ghcr-pull-secret \
      --docker-server=registry.gitlab.com \
      --docker-username="${REGISTRY_USER}" \
      --docker-password="${REGISTRY_TOKEN}" \
      --namespace="${APP_NAME}" \
      --dry-run=client -o yaml | kubectl apply -f -
    ok "ghcr-pull-secret created (registry.gitlab.com)"
  fi
}

# ─── Step 6: MySQL + Redis ───────────────────────────────────────────────────
step_databases() {
  section "Step 6 — MySQL + Redis"

  kapply k8s/mysql/statefulset.yaml
  kapply k8s/mysql/service.yaml
  ok "MySQL StatefulSet + Service applied"

  kapply k8s/redis/pvc.yaml
  kapply k8s/redis/deployment.yaml
  kapply k8s/redis/service.yaml
  ok "Redis PVC + Deployment + Service applied"

  info "Waiting for MySQL to be ready (this may take ~2 minutes)..."
  kubectl -n "${APP_NAME}" rollout status statefulset/"${APP_NAME}-mysql" --timeout=5m
  ok "MySQL is ready"

  info "Waiting for Redis..."
  kubectl -n "${APP_NAME}" rollout status deployment/"${APP_NAME}-redis" --timeout=3m
  ok "Redis is ready"
}

# ─── Step 7: Gotenberg + Typesense ───────────────────────────────────────────
step_services() {
  section "Step 7 — Gotenberg + Typesense"

  kapply k8s/gotenberg/deployment.yaml
  kapply k8s/gotenberg/service.yaml
  ok "Gotenberg deployed"

  kapply k8s/typesense/pvc.yaml
  kapply k8s/typesense/deployment.yaml
  kapply k8s/typesense/service.yaml
  info "Waiting for Typesense (~20s initialization)..."
  kubectl -n "${APP_NAME}" rollout status deployment/"${APP_NAME}-typesense" --timeout=3m
  ok "Typesense is ready"
}

# ─── Step 8: Storage PVC ─────────────────────────────────────────────────────
step_storage() {
  section "Step 8 — Server Storage PVC"

  kapply k8s/server/pvc-storage.yaml
  ok "${APP_NAME}-server-storage PVC created"
  info "PVC will bind automatically when the server pod is scheduled (WaitForFirstConsumer)."
}

# ─── Step 9: Application ─────────────────────────────────────────────────────
step_application() {
  section "Step 9 — Application (server + client)"

  kapply k8s/server/service.yaml
  kapply k8s/server/deployment.yaml
  kapply k8s/server/deployment-queue.yaml
  kapply k8s/server/cronjob-scheduler.yaml
  kapply k8s/server/hpa.yaml
  ok "Server (Laravel) manifests applied"

  kapply k8s/client/service.yaml
  kapply k8s/client/deployment.yaml
  kapply k8s/client/hpa.yaml
  ok "Client (Next.js) manifests applied"

  info "Note: pods may be in ImagePullBackOff until CI/CD pushes the first image."
}

# ─── Step 10: Ingress ────────────────────────────────────────────────────────
step_ingress() {
  section "Step 10 — Ingress"

  if [[ "$APPLY_DEV_INGRESS" == [Yy] ]]; then
    kapply k8s/ingress-dev.yaml
    ok "Development ingress applied (HTTP only, sslip.io)"
    warn "Remember: edit k8s/ingress-dev.yaml and replace the IP with your actual server IP!"
  elif [[ "$APPLY_PROD_INGRESS" == [Yy] ]]; then
    kapply k8s/ingress.yaml
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

  kapply k8s/maintenance/cronjob-image-cleanup.yaml
  ok "Image cleanup CronJob applied (runs every Sunday 2:00 AM)"
}

# ─── Step 12: GlitchTip (optional) ───────────────────────────────────────────
step_glitchtip() {
  if [[ "$INSTALL_GLITCHTIP" != [Yy] ]]; then
    return
  fi

  section "Step 12 — GlitchTip (error tracking)"

  if ! command -v helm &>/dev/null; then
    warn "helm not found — skipping GlitchTip."
    warn "Install helm, then re-run this script (or run the 3 commands manually):"
    warn "  macOS:  brew install helm"
    warn "  Linux:  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash"
    warn "  then:   helm repo add glitchtip https://gitlab.com/api/v4/projects/16325141/packages/helm/stable && helm repo update"
    warn "          helm upgrade --install glitchtip glitchtip/glitchtip --namespace glitchtip --create-namespace -f k8s/glitchtip/values.yaml"
    return
  fi

  # Prefer values.yaml (gitignored, real secrets) over values.example.yaml (template).
  local VALUES_FILE
  if [ -f "k8s/glitchtip/values.yaml" ]; then
    VALUES_FILE="k8s/glitchtip/values.yaml"
    ok "Found k8s/glitchtip/values.yaml — using it."
  elif [ -f "k8s/glitchtip/values.example.yaml" ]; then
    warn "k8s/glitchtip/values.yaml not found — only the template values.example.yaml exists."
    warn "Copy it and fill in real secrets BEFORE installing GlitchTip:"
    warn "  cp k8s/glitchtip/values.example.yaml k8s/glitchtip/values.yaml"
    warn "  # then edit k8s/glitchtip/values.yaml — set SECRET_KEY, GLITCHTIP_DOMAIN,"
    warn "  # DEFAULT_FROM_EMAIL, EMAIL_URL, postgresql.auth.password, ingress.className=traefik"
    prompt "Skip GlitchTip for now? [Y/n]:"
    read -r SKIP_GLITCHTIP; SKIP_GLITCHTIP="${SKIP_GLITCHTIP:-Y}"
    if [[ "$SKIP_GLITCHTIP" == [Yy] ]]; then
      warn "Skipping GlitchTip — re-run manually after editing values.yaml:"
      warn "  helm repo add glitchtip https://gitlab.com/api/v4/projects/16325141/packages/helm/stable && helm repo update"
      warn "  helm upgrade --install glitchtip glitchtip/glitchtip --namespace glitchtip --create-namespace -f k8s/glitchtip/values.yaml"
      return
    fi
    warn "Proceeding with template values.example.yaml — GlitchTip will use placeholder secrets (do NOT use in production)."
    VALUES_FILE="k8s/glitchtip/values.example.yaml"
  else
    error "Neither values.yaml nor values.example.yaml found in k8s/glitchtip/ — skipping."
    return
  fi

  # --force-update makes `helm repo add` idempotent (succeeds whether the repo
  # is new or already present, and refreshes the URL if it changed). No more
  # `2>/dev/null || true`, which used to hide a failed add and then surface as
  # a confusing "helm repo update: no repositories found".
  #
  # GlitchTip is OPTIONAL — a helm failure here must NOT abort the whole
  # bootstrap (Step 13 and the summary still need to run). Wrap in a subshell
  # guarded against `set -e` so a bad values file / missing dependency just
  # warns and moves on.
  if (
    set -e
    helm repo add glitchtip https://gitlab.com/api/v4/projects/16325141/packages/helm/stable --force-update
    helm repo update glitchtip
    helm upgrade --install glitchtip glitchtip/glitchtip \
      --namespace glitchtip \
      --create-namespace \
      -f "$VALUES_FILE"
  ); then
    ok "GlitchTip deployed to namespace glitchtip (values: $VALUES_FILE)"
  else
    warn "GlitchTip install failed — continuing bootstrap without it (it's optional)."
    warn "Most common cause: values file written for an older chart version."
    warn "Check the current schema:  helm show values glitchtip/glitchtip"
    warn "Or skip self-hosting entirely — use a hosted DSN (app.glitchtip.com)"
    warn "and just set GLITCHTIP_DSN in PROD_ENV."
  fi
}

# ─── Step 13: Ops tooling (Rancher + Uptime Kuma via docker-compose) ─────────
step_ops_tooling() {
  if [[ "$INSTALL_OPS" != [Yy] ]]; then
    return
  fi

  section "Step 13 — Ops tooling (Rancher + Uptime Kuma)"

  if [ ! -f "docker-compose.ops.yml" ]; then
    warn "docker-compose.ops.yml not found in repo root — skipping."
    return
  fi

  # Rancher + Uptime Kuma run as plain Docker containers ALONGSIDE k3s — not
  # inside it (monitor-the-monitor pattern). A pure k3s server has only
  # containerd, NOT Docker, so we install Docker first if it's missing.
  #
  # Works with a non-root, sudo-capable SSH user (e.g. OVHcloud's `ubuntu`,
  # or a hand-made `deployer`). `scp` runs as that user and CANNOT write to
  # root-owned /opt — so we stage the file in the user's home, then `sudo mv`.
  # `sudo docker compose` avoids needing the user in the `docker` group.
  # Requires the SSH user to have passwordless sudo (no TTY over `ssh host cmd`).
  local _ssh=""
  if [ -n "${OPS_SSH_HOST:-}" ]; then
    _ssh="ssh ${OPS_SSH_HOST}"

    if $_ssh "command -v docker" >/dev/null 2>&1; then
      ok "Docker already installed on the server"
    else
      info "Docker not found on the server — installing (k3s uses its own"
      info "containerd; Docker is separate, for the ops tools only)..."
      $_ssh "curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sudo sh /tmp/get-docker.sh && rm -f /tmp/get-docker.sh"
      ok "Docker installed"
    fi

    info "Provisioning host dirs on ${OPS_SSH_HOST}..."
    $_ssh "sudo mkdir -p /opt/rancher /opt/uptime-kuma && sudo chown -R 1000:1000 /opt/uptime-kuma"
    info "Copying docker-compose.ops.yml to the server (staged in home, then moved)..."
    scp docker-compose.ops.yml "${OPS_SSH_HOST}:docker-compose.ops.yml"
    $_ssh "sudo mv ~/docker-compose.ops.yml /opt/docker-compose.ops.yml"
    info "Starting ops containers..."
    $_ssh "cd /opt && sudo docker compose -f docker-compose.ops.yml up -d"
    $_ssh "cd /opt && sudo docker compose -f docker-compose.ops.yml ps"
  else
    info "Running locally (assuming this script is on the server)..."
    if ! command -v docker >/dev/null 2>&1; then
      info "Docker not found — installing..."
      curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sudo sh /tmp/get-docker.sh && rm -f /tmp/get-docker.sh
      ok "Docker installed"
    fi
    sudo mkdir -p /opt/rancher /opt/uptime-kuma
    sudo chown -R 1000:1000 /opt/uptime-kuma
    sudo cp docker-compose.ops.yml /opt/docker-compose.ops.yml
    (cd /opt && sudo docker compose -f docker-compose.ops.yml up -d)
    (cd /opt && sudo docker compose -f docker-compose.ops.yml ps)
  fi

  ok "Ops tooling started"
  info "  Rancher:      https://<SERVER_IP>:8443   (run: sudo docker logs rancher | grep 'Bootstrap Password')"
  info "  Uptime Kuma:  http://<SERVER_IP>:3001"
  warn "  Restrict ports 8443 and 3001 to your IP via UFW or the cloud firewall."
}

# ─── Summary ─────────────────────────────────────────────────────────────────
print_summary() {
  section "Bootstrap Complete"

  echo -e "${GREEN}Cluster is set up. Here's what was deployed:${NC}"
  echo ""
  kubectl -n "${APP_NAME}" get pods 2>/dev/null || true
  echo ""
  echo -e "${BOLD}Next steps:${NC}"
  echo ""
  echo "  1. Configure CI/CD secrets:"
  echo "     GitHub: KUBECONFIG_PROD (plain text), PROD_ENV (Variable), ENV_CLIENT_PROD (Variable)"
  echo "     GitLab: KUBECONFIG (plain text), SERVER_ENV (masked), ENV_CLIENT_PROD"
  echo ""
  echo "  2. Push to master — the pipeline will:"
  echo "     - Build Docker images"
  echo "     - Sync PROD_ENV → k8s Secret"
  echo "     - Run database migrations"
  echo "     - Roll out server + client"
  echo ""
  echo "  3. After first deploy, import search indexes:"
  echo "     kubectl -n ${APP_NAME} exec deployment/${APP_NAME}-server -- php artisan scout:import 'App\\Models\\Product'"
  echo "     kubectl -n ${APP_NAME} exec deployment/${APP_NAME}-server -- php artisan scout:import 'App\\Models\\BlogPost'"
  echo ""
  echo "  4. (Optional) Set up MySQL backup CronJob:"
  echo "     mkdir -p /opt/${APP_NAME}-backups  # on the server"
  echo "     kubectl apply -f k8s/mysql/cronjob-backup.yaml"
  echo ""
  echo -e "${BOLD}Useful commands:${NC}"
  echo "  kubectl -n ${APP_NAME} get pods          # check pod status"
  echo "  kubectl -n ${APP_NAME} get ingress        # check ingress + IP"
  echo "  kubectl -n ${APP_NAME} get certificate    # check TLS cert"
  echo "  kubectl -n ${APP_NAME} logs -f deployment/${APP_NAME}-server"
  echo "  k9s -n ${APP_NAME}                        # terminal UI"
  echo ""

  if [[ "$INSTALL_CERT" == [Yy] ]]; then
    echo -e "${BOLD}CI/CD kubeconfig (paste into KUBECONFIG_PROD / KUBECONFIG):${NC}"
    echo "  GitHub:  cat ~/.kube/config-hetzner"
    echo "  GitLab:  cat ~/.kube/config-hetzner"
    echo ""
  fi
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  echo -e "${BOLD}"
  echo "╔══════════════════════════════════════════════╗"
  echo "║        k3s Bootstrap — Production Cluster   ║"
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
  step_ops_tooling

  print_summary
}

main "$@"
