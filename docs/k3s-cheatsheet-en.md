# k3s — Command Cheat Sheet

> Replace `app` with your namespace (the one you chose in `bootstrap.sh`).  
> Set once: `export KUBECONFIG=~/.kube/config-hetzner`

---

## Quick status

```bash
# All pods — are they all Running?
kubectl -n app get pods

# Everything at once: pods, services, deployments, jobs
kubectl -n app get all

# Ingress — does it have an IP address?
kubectl -n app get ingress

# TLS certificate — READY: True?
kubectl -n app get certificate

# Persistent volumes — STATUS: Bound?
kubectl -n app get pvc

# CPU and RAM usage
kubectl -n app top pods
```

---

## Logs

```bash
# Live server logs (Laravel)
kubectl -n app logs -f deployment/app-server

# Live queue worker logs
kubectl -n app logs -f deployment/app-queue

# Client logs (Next.js)
kubectl -n app logs -f deployment/app-client

# Logs from the previous pod (after restart/crash)
kubectl -n app logs --previous deployment/app-server

# Logs from the last hour
kubectl -n app logs --since=1h deployment/app-server

# Logs of a specific pod (when you have multiple replicas)
kubectl -n app logs -f <pod-name>

# Logs of a completed migration job
kubectl -n app logs job/app-migrate-<SHA>
```

---

## Shell access

```bash
# Shell into the Laravel server
kubectl -n app exec -it deployment/app-server -- bash

# Useful commands inside:
php artisan tinker
php artisan cache:clear
php artisan queue:restart
php artisan migrate:status
php artisan scout:import "App\Models\Product"

# Shell into MySQL
kubectl -n app exec -it app-mysql-0 -- bash
mysql -u root -p

# One-off command without entering the shell
kubectl -n app exec deployment/app-server -- php artisan cache:clear
```

---

## Deployments — restart and rollback

```bash
# Rolling restart (zero-downtime) — e.g. after a secret change
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue

# Check rollout progress
kubectl -n app rollout status deployment/app-server

# Deployment history
kubectl -n app rollout history deployment/app-server

# Roll back to the previous version
kubectl -n app rollout undo deployment/app-server

# Roll back to a specific revision
kubectl -n app rollout undo deployment/app-server --to-revision=2

# Restart a specific pod (Kubernetes replaces it automatically)
kubectl -n app delete pod <pod-name>
```

---

## Diagnostics — when something's wrong

```bash
# Pod details — events, errors, reason for Pending/Error
kubectl -n app describe pod <pod-name>

# Deployment details
kubectl -n app describe deployment/app-server

# TLS certificate details
kubectl -n app describe certificate app-tls

# Active Let's Encrypt challenges (why is the cert not ready?)
kubectl -n app get challenges
kubectl -n app describe challenge <challenge-name>

# ACME orders
kubectl -n app get orders

# Recent events in the namespace
kubectl -n app get events --sort-by='.lastTimestamp' | tail -20
```

---

## Secrets

```bash
# List secrets
kubectl -n app get secrets

# View the server .env content
kubectl -n app get secret app-server-env \
  -o jsonpath='{.data.\.env}' | base64 -d

# View specific keys from the MySQL secret
kubectl -n app get secret app-mysql \
  -o jsonpath='{.data.username}' | base64 -d && echo
kubectl -n app get secret app-mysql \
  -o jsonpath='{.data.password}' | base64 -d && echo

# Manually update the .env secret from a file
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

## Migrations

```bash
# List migration jobs
kubectl -n app get jobs

# Logs of a specific migration
kubectl -n app logs job/app-migrate-<SHA>

# Delete old completed/failed migration jobs
kubectl -n app delete job -l component=migrate

# Check migration status via artisan
kubectl -n app exec deployment/app-server -- php artisan migrate:status
```

---

## MySQL — backup and access

```bash
# Access MySQL via kubectl
kubectl -n app exec -it app-mysql-0 -- \
  mysql -u root -p$(kubectl -n app get secret app-mysql \
    -o jsonpath='{.data.root-password}' | base64 -d)

# Manual database dump
kubectl -n app exec app-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASS> <DATABASE_NAME> \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Port-forward to a local MySQL client (e.g. TablePlus, DBeaver)
kubectl -n app port-forward svc/app-mysql 3306:3306
# Then connect locally: host=127.0.0.1 port=3306
```

---

## Port-forward — local access to cluster services

```bash
# Laravel server (API)
kubectl -n app port-forward svc/app-server 8080:80
# → http://localhost:8080

# Next.js client
kubectl -n app port-forward svc/app-client 3000:3000
# → http://localhost:3000

# MySQL
kubectl -n app port-forward svc/app-mysql 3306:3306

# Redis
kubectl -n app port-forward svc/app-redis 6379:6379

# Typesense
kubectl -n app port-forward svc/app-typesense 8108:8108
# → http://localhost:8108/health
```

---

## Scaling

```bash
# Temporary scaling (HPA will override on next tick)
kubectl -n app scale deployment/app-server --replicas=2

# HPA status (autoscaling)
kubectl -n app get hpa

# Temporarily disable HPA
kubectl -n app delete hpa app-server-hpa
```

---

## Traefik and networking

```bash
# Traefik status
kubectl -n kube-system get pods | grep traefik
kubectl -n kube-system logs -f deployment/traefik

# Traefik service (external IP, ports)
kubectl -n kube-system get svc traefik

# Middlewares (HTTPS redirect, body size)
kubectl -n app get middleware
```

---

## Useful shortcuts

```bash
# k9s — terminal UI (everything in one place)
k9s -n app

# Set default namespace (so you don't type -n app every time)
kubectl config set-context --current --namespace=app
# Check current context
kubectl config get-contexts

# Show all resources in the namespace
kubectl -n app get all,ingress,certificate,pvc,secrets

# Watch — auto-refresh every 2s
kubectl -n app get pods -w
```

---

## Common scenarios

### Application not responding

```bash
kubectl -n app get pods                          # are all pods Running?
kubectl -n app logs deployment/app-server        # PHP/Laravel errors?
kubectl -n app describe pod <pod-name>           # Event: OOMKilled? CrashLoop?
kubectl -n app get ingress                       # does the ingress have an IP?
kubectl -n app get certificate                   # READY: True?
```

### Certificate not issued

```bash
kubectl -n app get challenges                    # which domains are pending?
kubectl -n app describe challenge <name>         # what error (DNS? port 80?)
sudo ss -tlnp | grep :80                        # is anything listening on port 80?
# If not — see section 4.1 in k3s-deployment-guide-en.md (servicelb)
```

### Migration failing

```bash
kubectl -n app get pods | grep migrate           # Error / ImagePullBackOff?
kubectl -n app logs job/app-migrate-<SHA>        # Access denied? Connection refused?
kubectl -n app get secret app-server-env \
  -o jsonpath='{.data.\.env}' | base64 -d \
  | grep -E '^DB_'                              # are DB_HOST / DB_USERNAME correct?
```

### After updating PROD_ENV in GitHub

```bash
# CI/CD syncs the secret automatically on the next deploy.
# If you want immediate effect without a full deploy:
# 1. Update the secret manually (see "Secrets" section above)
# 2. Rolling restart
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```
