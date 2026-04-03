# GlitchTip On Kubernetes

Production should run GlitchTip as a separate deployment from the CMS apps.

Use the official Helm chart:

```bash
helm repo add glitchtip https://glitchtip.github.io/helm-charts
helm repo update
helm upgrade --install glitchtip glitchtip/glitchtip \
  --namespace glitchtip \
  --create-namespace \
  -f k8s/glitchtip/values.example.yaml
```

After install:

1. Create an organization.
2. Create `cms-api` and `cms-frontend` projects.
3. Copy DSNs into the CMS production secrets/build variables.

CMS integration points:

- `k8s/server/secret.yaml.example` → `GLITCHTIP_DSN`
- client CI/build vars → `NEXT_PUBLIC_GLITCHTIP_DSN`
