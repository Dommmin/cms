#!/usr/bin/env bash
# =============================================================================
# k3s Application Reset Helper
#
# Removes one application namespace from an existing k3s cluster, but keeps k3s
# itself installed. This is the normal reset path before deploying a different
# project with k8s/bootstrap.sh.
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $*"; }
ok() { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

usage() {
  cat <<'EOF'
Usage:
  APP_NAME=app KUBE_NAMESPACE=app k8s/reset.sh --yes
  k8s/reset.sh --namespace app --yes

Options:
  --namespace <name>  Kubernetes namespace to delete. Defaults to KUBE_NAMESPACE or APP_NAME or app.
  --app-name <name>   Application resource prefix. Defaults to APP_NAME or app.
  --yes              Required confirmation for this destructive operation.
  -h, --help         Show this help.

This deletes the application namespace and its namespaced resources: pods,
deployments, services, secrets, PVCs, jobs, ingress, certificates, and local-path
volume claims. It keeps k3s, Traefik, cert-manager, ClusterIssuer, kube-system,
and the server operating system intact.

Back up databases, uploads, and secrets before running it.
EOF
}

APP_NAME="${APP_NAME:-app}"
KUBE_NAMESPACE="${KUBE_NAMESPACE:-$APP_NAME}"
YES=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --namespace)
      KUBE_NAMESPACE="${2:-}"
      shift 2
      ;;
    --app-name)
      APP_NAME="${2:-}"
      shift 2
      ;;
    --yes)
      YES=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      error "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [ "$YES" -ne 1 ]; then
  error "Refusing to run without --yes."
  usage
  exit 1
fi

if [ -z "$KUBE_NAMESPACE" ]; then
  error "Namespace cannot be empty."
  exit 1
fi

info "Using kubectl context:"
kubectl config current-context

warn "Deleting namespace ${KUBE_NAMESPACE}. k3s itself will stay installed."
kubectl get namespace "$KUBE_NAMESPACE" >/dev/null
kubectl delete namespace "$KUBE_NAMESPACE" --wait=true

ok "Namespace ${KUBE_NAMESPACE} deleted."
info "You can now run k8s/bootstrap.sh against the existing k3s cluster."
