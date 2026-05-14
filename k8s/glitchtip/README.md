# GlitchTip on Kubernetes

GlitchTip is the self-hosted, Sentry-SDK-compatible error tracking platform.
Run it as a **separate Helm release in its own namespace** (`glitchtip`),
not inside the `app` namespace — that way an outage in the main cluster
namespace doesn't break your error reporting.

## Quick start

```bash
# 1. Create the gitignored values.yaml from the template
cp k8s/glitchtip/values.example.yaml k8s/glitchtip/values.yaml

# 2. Edit k8s/glitchtip/values.yaml — see docs/k3s-deployment-guide.md
#    section 21 for the full list of variables to fill in.
#    Must-haves:
#      glitchtip.env.SECRET_KEY        (openssl rand -hex 25)
#      glitchtip.env.GLITCHTIP_DOMAIN  (with a matching DNS A record)
#      glitchtip.env.DEFAULT_FROM_EMAIL
#      glitchtip.env.EMAIL_URL         (smtp://USER:APP_PASS@host:587)
#      glitchtip.ingress.className     "traefik"  (k3s default)
#      postgresql.auth.password

# 3. Install (or upgrade) the chart
helm repo add glitchtip https://glitchtip.github.io/helm-charts
helm repo update
helm upgrade --install glitchtip glitchtip/glitchtip \
  --namespace glitchtip \
  --create-namespace \
  -f k8s/glitchtip/values.yaml
```

`bootstrap.sh` runs the same `helm upgrade --install` automatically when it
detects `k8s/glitchtip/values.yaml`. If only the `values.example.yaml`
template is present, the script prompts to skip GlitchTip.

## After install

1. Open `https://<GLITCHTIP_DOMAIN>` and create an organization.
2. Create two projects: `cms-api` (PHP/Laravel) and `cms-frontend` (Next.js).
3. From **Settings → Client Keys (DSN)** copy each DSN.
4. Wire DSNs into the CMS:
   - Laravel: set `GLITCHTIP_DSN` in `server/.env.production` (and in the
     `PROD_ENV` GitHub Variable so CI/CD picks it up).
   - Next.js: set `NEXT_PUBLIC_GLITCHTIP_DSN` in `ENV_CLIENT_PROD`
     (it's baked at build time).
5. Trigger a deploy — from the next rollout, exceptions are reported.

Smoke test:

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='throw new \Exception("glitchtip test event");'
```

The event should appear under **Issues** in GlitchTip within ~30 seconds.
