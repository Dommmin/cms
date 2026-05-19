# Deploying Laravel + Next.js on k3s — Complete Guide

> **Level:** Junior / Mid · **Prerequisites:** Docker, basic CLI skills, a domain name  
> **Reading time:** ~30 min · **Setup time:** ~2 hours (first time)

---

If you've been deploying apps via `docker-compose up` on a VPS and wondering when and how to move to Kubernetes — this article is for you. I'll show you how to deploy a full stack (Laravel API + admin SPA, Next.js frontend, MySQL, Redis, Gotenberg PDF) on **k3s** — a lightweight Kubernetes perfect for a single VPS.

I don't assume you know Kubernetes. I do assume you know Docker and aren't afraid of a terminal.

---

## Table of Contents

1. [What is k3s and why not plain k8s?](#1-what-is-k3s-and-why-not-plain-k8s)
2. [Deployment architecture](#2-deployment-architecture)
3. [Server setup (Hetzner)](#3-server-setup-hetzner)
4. [Installing k3s](#4-installing-k3s)
   - [4.4 Automated cluster setup — bootstrap.sh](#44-automated-cluster-setup--bootstrapsh) ← **recommended after installing k3s**
5. [Installing cert-manager (SSL Let's Encrypt)](#5-installing-cert-manager-ssl-lets-encrypt)
6. [Configuring Traefik (HTTPS + redirect)](#6-configuring-traefik-https--redirect)
7. [Cluster preparation — namespace and secrets](#7-cluster-preparation--namespace-and-secrets)
8. [Deploying the database and cache (MySQL + Redis)](#8-deploying-the-database-and-cache-mysql--redis)
9. [Deploying Gotenberg (PDF)](#9-deploying-gotenberg-pdf)
10. [Deploying Typesense (full-text search)](#10-deploying-typesense-full-text-search)
11. [Pull Secret for Container Registry (GHCR / GitLab)](#11-pull-secret-for-container-registry-ghcr--gitlab)
12. [Deploying the application (server + client)](#12-deploying-the-application-server--client)
    - [12.3 Queue worker (background jobs)](#123-queue-worker-background-jobs)
    - [12.4 Scheduler (Laravel cron jobs)](#124-scheduler-laravel-cron-jobs)
    - [12.5 Mail (SMTP)](#125-mail-smtp)
    - [12.6 Reverb / broadcasting (realtime — chat, notifications)](#126-reverb--broadcasting-realtime--chat-notifications)
    - [12.7 Laravel Excel — gotchas](#127-laravel-excel--gotchas)
13. [How Does CI/CD Connect to k3s?](#13-how-does-cicd-connect-to-k3s)
14. [Configuring GitHub Actions](#14-configuring-github-actions)
15. [Configuring GitLab CI/CD](#15-configuring-gitlab-cicd)
16. [First deployment via CI](#16-first-deployment-via-ci)
17. [Verification — is everything working?](#17-verification--is-everything-working)
18. [Day-to-day operations — logs, restarts, updates](#18-day-to-day-operations--logs-restarts-updates)
19. [MySQL backup](#19-mysql-backup)
20. [Common problems (troubleshooting)](#20-common-problems-troubleshooting)
21. [GlitchTip — error tracking](#21-glitchtip--error-tracking)
22. [Rancher — cluster management via UI](#22-rancher--cluster-management-via-ui)
23. [Disk cleanup](#23-disk-cleanup)
24. [k9s — terminal management UI](#24-k9s--terminal-management-ui)
25. [Secret rotation — updating .env and passwords with no downtime](#25-secret-rotation--updating-env-and-passwords-with-no-downtime)
26. [Resetting the server for another application](#26-resetting-the-server-for-another-application)

---

## 1. What is k3s and why not plain k8s?

**Kubernetes (k8s)** is a container orchestration system — you tell it *what* you want to run, and it makes sure it keeps running. If a container crashes, Kubernetes restarts it. Want to update your app with no downtime? Kubernetes rolls out the update one pod at a time.

**k3s** is Kubernetes slimmed down to the minimum by Rancher Labs (now SUSE). It removes unnecessary cloud drivers, replaces `etcd` with a lighter SQLite backend (or embedded etcd for HA), and packages everything into a single ~70 MB binary. The API is **100% compatible** with full k8s — same YAML manifests, same `kubectl`.

### Resource comparison

|                       | Full k8s (kubeadm) | k3s       |
|-----------------------|--------------------|-----------|
| Control plane RAM     | ~2 GB              | ~512 MB   |
| Installation          | ~30 steps          | 1 command |
| Minimum nodes         | 4                  | 1         |
| k8s API compatibility | 100%               | 100%      |

On a single VPS with 8 GB of RAM, k3s is the only sensible option.

### Why not docker-compose?

Docker Compose is great for local development. In production it lacks:

- **Automatic restart** after OOM or crash with retry/backoff logic
- **Zero-downtime deploys** — `docker-compose up` stops the container before starting the new one
- **Health check gate** — Kubernetes won't route traffic to a pod until `/health` responds
- **Migrations before deploy** — you can run a migration Job and wait for it to finish before rolling out
- **One-command rollback**

---

## 2. Deployment architecture

```
Internet
    │
    ▼
[ Traefik ] ← built into k3s, handles TLS + routing
    │
    ├──► app-client (Next.js :3000)       ← public frontend
    │      yourdomain.com
    │      www.yourdomain.com
    │
    └──► app-server (Laravel/Nginx :80)   ← API + admin panel
           admin.yourdomain.com
              │
              ├── app-mysql (MySQL 8)     ← StatefulSet + PVC
              ├── app-redis (Redis 7)     ← Deployment + PVC
              ├── app-gotenberg           ← PDF generation
              └── app-typesense          ← full-text search
```

Everything runs in the `app` namespace. MySQL and Redis have persistent volumes on the server disk (k3s `local-path` storage class). Docker images are built by CI and pushed to the container registry.

> **Domain structure:** The public Next.js frontend runs on the apex domain (`yourdomain.com`). The Laravel admin panel is served from a separate subdomain (`admin.yourdomain.com`) — this keeps the API and admin behind a distinct hostname and simplifies Ingress routing.

---

## 3. Server setup (Hetzner)

### 3.1 Create the server

#### If you don't have an SSH key yet

You create the SSH key on your **local machine**, not on the server. If the file `~/.ssh/id_ed25519.pub` already exists, you can skip this step.

Check whether you already have a key:

```bash
ls -la ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub
```

If the files don't exist, generate a new key:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

When `ssh-keygen` asks for a path, keep the default:

```bash
~/.ssh/id_ed25519
```

A passphrase is optional but recommended. If you set one, the system will ask for the key's password on first use in a session.

Print the public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the entire output starting with `ssh-ed25519`. That **public** key is what you paste into the Hetzner panel. Never copy or send the `~/.ssh/id_ed25519` file — that's the private key.

In the Hetzner Cloud panel ([console.hetzner.cloud](https://console.hetzner.cloud)):

1. **Location:** Falkenstein (EU — low latency)
2. **Image:** Ubuntu 24.04 LTS
3. **Type:** CX33 (4 vCPU, 8 GB RAM, 80 GB NVMe) — ~$10/mo
4. **Networking:** Enable public IPv4 + IPv6
5. **SSH key:** Paste your public key (`cat ~/.ssh/id_ed25519.pub`)
6. **Firewall:** Create a new one with these rules:

| Type    | Protocol | Port | Source                              |
|---------|----------|------|-------------------------------------|
| Inbound | TCP      | 22   | Your IP (or `0.0.0.0/0` if dynamic) |
| Inbound | TCP      | 80   | `0.0.0.0/0`, `::/0`                 |
| Inbound | TCP      | 443  | `0.0.0.0/0`, `::/0`                 |
| Inbound | TCP      | 6443 | Your IP (kubectl API)               |

> Port 6443 is the Kubernetes API server. Restrict it to your IP — there's no reason for it to be public.

#### If you forgot to add the SSH key when creating the server

The easiest fix is to do it before you disable password login.

If you can log in as `root` with a password, add the key from your local machine:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@<SERVER_IP>
```

Then verify key-based login:

```bash
ssh -i ~/.ssh/id_ed25519 root@<SERVER_IP>
```

If `ssh-copy-id` isn't available, do it manually:

```bash
# On your local machine
cat ~/.ssh/id_ed25519.pub
```

Copy the output, log into the server with a password via SSH or the Hetzner console, then run:

```bash
# On the server
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Paste the public key into `authorized_keys`, save the file, and test the new login from a second terminal.

If you can log in with neither a password nor a key, use the Hetzner console or Rescue mode, add the key to `/root/.ssh/authorized_keys`, and in the worst case rebuild the server with the key added correctly. Don't disable `PasswordAuthentication` until you've confirmed key-based login works.

### 3.2 Log in and update the system

```bash
ssh root@<SERVER_IP>

apt update && apt upgrade -y
apt install -y curl wget git htop vim
```

### 3.3 Set the hostname

```bash
hostnamectl set-hostname app
echo "127.0.0.1 app" >> /etc/hosts
```

### 3.4 DNS configuration

In your domain registrar's panel, create A records:

```
yourdomain.com        A  <SERVER_IP>
www.yourdomain.com    A  <SERVER_IP>
admin.yourdomain.com  A  <SERVER_IP>
```

Wait ~5–15 minutes for DNS propagation. You can check:

```bash
dig +short yourdomain.com
# should return your server IP
```

### 3.5 SSH — local machine configuration

Before logging in, set up a convenient SSH alias on your **local machine**. Instead of typing `ssh root@123.456.789.0` every time, you can just use `ssh cms`.

Edit (or create) `~/.ssh/config`:

```bash
nano ~/.ssh/config
```

Add:

```
Host cms
    HostName <SERVER_IP>
    User root
    IdentityFile ~/.ssh/id_ed25519
```

From now on:

```bash
ssh cms                  # log in
scp file.txt cms:/tmp/   # copy a file
```

> If you later create the `deployer` user (section 3.6), change `User root` to `User deployer`.

### 3.6 SSH — server hardening (disable password login)

After logging in, the first thing you should do is disable password authentication — an SSH key is far more secure.

#### Option A: root only with key (simpler)

Sufficient for a single-person VPS. Log in and edit the SSH config:

```bash
ssh cms   # or: ssh root@<SERVER_IP>

nano /etc/ssh/sshd_config
```

Make sure these lines look like this:

```
PasswordAuthentication no
PermitRootLogin prohibit-password
```

Restart SSH:

```bash
systemctl restart ssh
```

> ⚠️ **Before closing your current session** — open a second SSH session and verify you can log in. Only close the first one once you've confirmed access.

#### Option B: dedicated `deployer` user + sudo (recommended for teams)

Creates a separate account with sudo privileges — root login is fully blocked.

```bash
# On the server (as root)
adduser deployer                            # create user (sets password interactively)
usermod -aG sudo deployer                   # add to sudo group

# Copy SSH key from root to new user
mkdir -p /home/deployer/.ssh
cp ~/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
```

Now **test** logging in as `deployer` in a new terminal session:

```bash
# On your local machine — new terminal window
ssh -i ~/.ssh/id_ed25519 deployer@<SERVER_IP>
sudo whoami   # should return: root
```

If it works — block root login:

```bash
# On the server (as deployer, via sudo)
sudo nano /etc/ssh/sshd_config
```

```
PasswordAuthentication no
PermitRootLogin no
```

```bash
sudo systemctl restart ssh
```

Update the alias in `~/.ssh/config` on your local machine:

```
Host cms
    HostName <SERVER_IP>
    User deployer
    IdentityFile ~/.ssh/id_ed25519
```

---

## 4. Installing k3s

### 4.1 Install k3s

On the server, run a single command:

**Hetzner Cloud** (with hcloud-controller-manager) — the CCM provisions a real Load Balancer, so k3s's built-in LB is unnecessary:

```bash
curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -s - --disable=servicelb
```

**Other providers** (OVHcloud, DigitalOcean, Vultr, bare metal, etc.) — without a cloud LB you need k3s's built-in servicelb, which binds ports 80/443 directly on the host. **Do not add** `--disable=servicelb`:

```bash
curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -s -
```

> **What is servicelb?**  
> `servicelb` (klipper) is k3s's built-in load balancer. It creates DaemonSet pods that listen on ports 80/443 of the host and forward traffic to Traefik. Without it — and without a cloud LB — ports 80/443 are unreachable from the internet, Let's Encrypt HTTP-01 challenges will never pass, and the TLS certificate will never be issued.
>
> We do **not** disable Traefik — k3s installs it automatically, and the `HelmChartConfig` from section 4.3 will tune its configuration (HTTP→HTTPS redirect).

Wait ~30 seconds, then verify:

```bash
kubectl get nodes
# NAME       STATUS   ROLES                  AGE   VERSION
# app   Ready    control-plane,master   1m    v1.31.x+k3s1
```

Status `Ready` — you're good to go.

### 4.2 Copy kubeconfig to your local machine

On your **local machine** (not the server):

```bash
mkdir -p ~/.kube

# Copy the config from the server and replace the address with the public IP
ssh root@<SERVER_IP> "cat /etc/rancher/k3s/k3s.yaml" \
  | sed "s/127.0.0.1/<SERVER_IP>/g" \
  > ~/.kube/config-hetzner

chmod 600 ~/.kube/config-hetzner
export KUBECONFIG=~/.kube/config-hetzner
```

Now you can control the cluster from your local machine:

```bash
kubectl get nodes
# app   Ready   control-plane,master   2m
```

> **Add to ~/.bashrc or ~/.zshrc:**  
> `export KUBECONFIG=~/.kube/config-hetzner`  
> so you don't have to set it every time.

### 4.3 Configure Traefik via Helm

> **Local machine — from this point on, all `kubectl` commands run on your computer.**  
> `kubectl` is an HTTP client — it sends commands to the server over port 6443. No SSH needed. Make sure you have `export KUBECONFIG=~/.kube/config-hetzner` set (section 4.2).

Installing Traefik requires **two steps** — the Middleware must be applied only after Traefik has installed its CRDs (Custom Resource Definitions).

**Step 1** — apply the Traefik configuration (HelmChartConfig only):

```bash
kubectl apply -f k8s/traefik/config.yaml
```

Wait until Traefik is running:

```bash
kubectl -n kube-system get pods --watch | grep traefik
# traefik-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

Exit `--watch` with `Ctrl+C` once you see `Running`.

**Step 2** — apply the Middleware (requires Traefik CRDs, and the namespace must exist first — see section 7.1):

> The Middleware lives in the `app` namespace — apply it **after** creating the namespace in section 7.1.

```bash
kubectl apply -f k8s/traefik/middleware.yaml
```

> **Why two steps?** `Middleware` is a Traefik CRD resource. If you apply it before Traefik is installed, kubectl returns `no matches for kind "Middleware"` — because the CRD doesn't exist yet. Additionally, the Middleware must belong to an existing namespace.

### 4.4 Automated cluster setup — bootstrap.sh

After installing k3s and copying the kubeconfig (sections 4.1–4.2), you have two options:

| Option                           | When to choose it                                                              |
|----------------------------------|--------------------------------------------------------------------------------|
| **A: `bootstrap.sh`** (recommended) | New cluster, you want to move fast — the script runs sections 5–12 for you  |
| **B: Manually** (sections 5–12)  | You're learning Kubernetes, you want full control over every step              |

#### Option A — run bootstrap.sh

Prerequisites before running:
- `KUBECONFIG` points at the cluster (section 4.2)
- The repository is cloned locally (the `k8s/` directory must exist)
- DNS records point at the server IP (section 3.4)

From the **repository root** on your local machine:

```bash
chmod +x k8s/bootstrap.sh
./k8s/bootstrap.sh
```

The script will interactively ask for:

| Question                    | What to enter                                        |
|-----------------------------|------------------------------------------------------|
| MySQL root password         | Strong password, min. 16 characters                  |
| MySQL username              | Defaults to `app`                                    |
| MySQL app password          | Strong password, min. 16 characters                  |
| Redis password              | Strong password, min. 16 characters                  |
| Typesense API key           | Random key, min. 16 characters                       |
| CI/CD type                  | `1` = GitHub Actions, `2` = GitLab CI, Enter = skip  |
| GitHub/GitLab token         | For the pull secret of your private image registry   |
| Let's Encrypt email         | Certificate expiry notifications                     |
| Dev ingress (HTTP)          | `y` if you have no domain — uses sslip.io            |
| Production ingress (HTTPS)  | `Y` (default) — requires DNS + cert-manager          |
| GlitchTip                   | `y` if you want self-hosted error tracking           |
| Ops tooling (Rancher + Uptime Kuma) | `y` if you want a cluster UI panel and uptime monitoring — runs `docker-compose.ops.yml` on the server |

**Run time:** ~5–10 minutes (mostly waiting for MySQL and cert-manager).

When finished, the script prints the list of pods in the namespace plus the next steps — configuring CI/CD secrets.

> **If you chose Option A — jump to [section 13 (How Does CI/CD Connect to k3s?)](#13-how-does-cicd-connect-to-k3s).** Sections 5–12 below describe the same thing the script does — useful as documentation or for manual reconfiguration.

---

## 5. Installing cert-manager (SSL Let's Encrypt)

cert-manager automatically issues and renews TLS certificates from Let's Encrypt.

### 5.1 Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

Wait until all pods are `Running`:

```bash
kubectl -n cert-manager get pods --watch
# cert-manager-xxxx             1/1   Running
# cert-manager-cainjector-xxxx  1/1   Running
# cert-manager-webhook-xxxx     1/1   Running
```

### 5.2 Create a ClusterIssuer

A ClusterIssuer is the configuration telling cert-manager how to issue certificates. Create a file `letsencrypt-prod.yaml`:

```yaml
# letsencrypt-prod.yaml (don't commit to repo — one-time setup)
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your@email.com          # <-- CHANGE to your email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            ingressClassName: traefik
```

Apply it:

```bash
kubectl apply -f letsencrypt-prod.yaml
```

Check the status:

```bash
kubectl get clusterissuer letsencrypt-prod
# NAME               READY   AGE
# letsencrypt-prod   True    30s
```

`READY: True` = cert-manager is ready to issue certificates.

---

## 6. Configuring Traefik (HTTPS + redirect)

The file `k8s/traefik/config.yaml` contains the `HelmChartConfig` that configures Traefik to automatically redirect HTTP (port 80) to HTTPS (port 443) and sets the server's external IP.

The file `k8s/traefik/middleware.yaml` defines two Traefik middlewares:

1. **`redirect-https`** — permanent HTTP → HTTPS redirect
2. **`body-size`** — sets the request body size limit to 100 MB (needed for file uploads)

If you applied `config.yaml` earlier, Traefik is already configured. Verify:

```bash
kubectl -n kube-system get helmchartconfig traefik
# NAME      AGE
# traefik   5m
```

The Middleware is applied in section 7.1 after the namespace is created.

---

## 7. Cluster preparation — namespace and secrets

> **Note on namespace name:** Every manifest in `k8s/` hardcodes the `app` namespace and the `app-*` resource prefix (`app-server`, `app-mysql`, `app-redis`, …). This is **not** configurable without editing every file — `bootstrap.sh` and the CI/CD pipeline assume `app`. If you genuinely need a different name, do a global `sed` across `k8s/` and update `KUBE_NAMESPACE` in CI.

### 7.1 Create the namespace and apply Middleware

A namespace is an isolated space in the cluster — like a separate folder for our application.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespace app
# NAME       STATUS   AGE
# app   Active   5s
```

Now apply the Traefik Middleware — it requires an existing namespace (which is why we didn't do it in section 4):

```bash
kubectl apply -f k8s/traefik/middleware.yaml
```

### 7.2 MySQL secret

Copy the example file and fill in the passwords:

```bash
cp k8s/mysql/secret.yaml.example k8s/mysql/secret.yaml
```

Open `k8s/mysql/secret.yaml` and replace `CHANGE_ME` with strong passwords:

```yaml
stringData:
  root-password: "SuperSecretRootPassword123!"
  username: "cms"
  password: "SuperSecretCmsPassword456!"
```

> **Never commit `secret.yaml` files to your repository!**  
> Add `k8s/**/*secret.yaml` to `.gitignore`.

Apply it:

```bash
kubectl apply -f k8s/mysql/secret.yaml
```

### 7.3 Redis secret

```bash
cp k8s/redis/secret.yaml.example k8s/redis/secret.yaml
# edit k8s/redis/secret.yaml — change the password
kubectl apply -f k8s/redis/secret.yaml
```

### 7.4 Laravel application secret — optional with CI/CD

> **If you are using GitHub Actions or GitLab CI/CD — skip this step.**  
> The pipeline automatically creates and updates this secret from the `PROD_ENV` / `SERVER_ENV` variable on every deployment (step 0 in the pipeline). Manual creation is only needed if you want to run the app before the first CI/CD run.

If you want to configure the secret manually (e.g. before the first CI/CD run), use the `server/.env.production.example` template:

```bash
# Copy and edit the example — fill in all CHANGE_ME values
cp server/.env.production.example server/.env.production
# edit server/.env.production with your production values

# Create the secret from the file:
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -
```

> **Where do I get APP_KEY?**  
> `docker compose exec php php artisan key:generate --show`

The secret contains your full production `.env`, including database credentials, Redis password, S3/storage config, payment gateways, and monitoring DSNs.

### 7.5 Next.js client configuration — no secret

Next.js fetches API data server-side from an internal cluster address. That address (`API_URL=http://app-server.app.svc.cluster.local/api/v1`) is **not sensitive** — it's just a cluster-internal DNS name — so **there is no secret to create here**.

`API_URL` is hardcoded as a plain `env:` variable in [`k8s/client/deployment.yaml`](../k8s/client/deployment.yaml). Nothing to do manually.

> `NEXT_PUBLIC_*` variables (public, visible in the browser) are a separate matter — they're baked into the image at build time as `--build-arg` from `ENV_CLIENT_PROD` (see section 14).

---

## 8. Deploying the database and cache (MySQL + Redis)

### 8.1 MySQL

```bash
kubectl apply -f k8s/mysql/statefulset.yaml
kubectl apply -f k8s/mysql/service.yaml
```

Wait until MySQL is ready:

```bash
kubectl -n app get pods --watch
# NAME           READY   STATUS    RESTARTS   AGE
# app-mysql-0    1/1     Running   0          2m
```

> **Why StatefulSet instead of Deployment?**  
> A StatefulSet guarantees a stable pod name (`app-mysql-0`) and startup order. For databases this matters — the DNS `app-mysql-0.app-mysql.app.svc.cluster.local` always points to the same instance.

Verify MySQL is working:

```bash
kubectl -n app exec -it app-mysql-0 -- mysql -u root -p
# Enter password: <root-password from the secret>
# mysql> SHOW DATABASES;
```

### 8.2 Redis

```bash
kubectl apply -f k8s/redis/pvc.yaml
kubectl apply -f k8s/redis/deployment.yaml
kubectl apply -f k8s/redis/service.yaml

kubectl -n app get pods | grep redis
# app-redis-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

Test the connection:

```bash
kubectl -n app exec -it deployment/app-redis -- redis-cli -a <REDIS_PASSWORD> ping
# PONG
```

---

## 9. Deploying Gotenberg (PDF)

Gotenberg is a microservice for generating PDFs from HTML. We deploy it as a separate pod, accessible only inside the cluster.

```bash
kubectl apply -f k8s/gotenberg/deployment.yaml
kubectl apply -f k8s/gotenberg/service.yaml

kubectl -n app get pods | grep gotenberg
# app-gotenberg-xxxxxxxxx-xxxxx   1/1   Running   0   30s
```

---

## 10. Deploying Typesense (full-text search)

Typesense is a fast full-text search engine. The application uses it via Laravel Scout (`SCOUT_DRIVER=typesense`). We deploy it as a separate pod accessible only inside the cluster.

### 10.1 Create the API key secret

Typesense needs an API key. Use a strong random key (min. 16 characters):

```bash
kubectl create secret generic app-typesense \
  --from-literal=api-key='<YOUR_API_KEY>' \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -
```

> Use this same key in your production `.env` as `TYPESENSE_API_KEY=<YOUR_API_KEY>`.  
> **Important:** Do not add inline comments (`#`) after the value — Laravel will read them as part of the key.

### 10.2 Deploy Typesense

```bash
kubectl apply -f k8s/typesense/pvc.yaml
kubectl apply -f k8s/typesense/deployment.yaml
kubectl apply -f k8s/typesense/service.yaml
```

Wait for it to start (~20 seconds initialization):

```bash
kubectl -n app rollout status deployment/app-typesense --timeout=120s
# deployment "app-typesense" successfully rolled out
```

Verify the health check:

```bash
kubectl -n app exec deployment/app-typesense -- wget -qO- http://localhost:8108/health
# {"ok":true}
```

### 10.3 Configuration in production .env

Make sure your production `.env` contains:

```dotenv
SCOUT_DRIVER=typesense
SCOUT_QUEUE=true
TYPESENSE_HOST=app-typesense.app.svc.cluster.local
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=<YOUR_API_KEY>
```

### 10.4 Import existing data after first deployment

After the first deploy, import existing records into the search indexes:

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan scout:import "App\Models\Product"

kubectl -n app exec deployment/app-server -- \
  php artisan scout:import "App\Models\BlogPost"
```

> Scout automatically indexes new and changed records via the queue (Redis) — the manual import is only needed once, on first deployment.

---

## 11. Pull Secret for Container Registry (GHCR / GitLab)

Your cluster needs to know how to pull private Docker images. The configuration depends on which CI/CD system you are using.

> **Important:** The secret name `ghcr-pull-secret` is the same in both cases — the deployment manifests (`k8s/server/deployment.yaml`, `k8s/client/deployment.yaml`) already use this name. Do not change it.

### 11.1 GitHub Container Registry (GHCR)

If you use **GitHub Actions** and build images to `ghcr.io`:

#### Create a Personal Access Token

In GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)**

- Scopes: `read:packages`
- Click **Generate token** and save it — you'll only see it once

#### Create the secret in the cluster

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=<YOUR_GITHUB_USERNAME> \
  --docker-password=<PERSONAL_ACCESS_TOKEN> \
  --namespace=app
```

### 11.2 GitLab Container Registry

If you use **GitLab CI** and build images to `registry.gitlab.com`:

#### Create a Deploy Token in GitLab

In GitLab: **Settings → Repository → Deploy tokens → New deploy token**

- Name: `k3s-pull`
- Scopes: check `read_registry`
- Click **Create deploy token**
- Save the `username` and `token` — you'll only see them once!

#### Create the secret in the cluster

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<deploy-token-username> \
  --docker-password=<deploy-token-password> \
  --namespace=app
```

---

## 12. Deploying the application (server + client)

Before the first CI/CD deploy we need to manually apply the infrastructure manifests. Docker images will be built by the pipeline — for now we use `:latest` (after the first CI push).

### 12.1 Persistent storage for uploads and logs

Before starting the server, create a PVC (PersistentVolumeClaim) — a volume on the VPS disk that will store uploaded files and Laravel logs.

```bash
kubectl apply -f k8s/server/pvc-storage.yaml
```

Check that the PVC is ready:

```bash
kubectl -n app get pvc
# NAME                 STATUS   VOLUME         CAPACITY   STORAGECLASS
# app-server-storage   Bound    pvc-xxxxxxxx   20Gi       local-path
```

`STATUS: Bound` means the volume is ready. `local-path` is k3s's built-in mechanism for storing data on the local VPS disk.

> **What does the PVC store?**
> ```
> PVC (20Gi on the VPS disk)
>   ├── storage/app/                   ← uploaded files (images, PDFs, attachments)
>   ├── storage/logs/                  ← Laravel logs (when LOG_CHANNEL=daily or stack)
>   └── storage/framework/             ← view cache, sessions, queues, Excel exports
>       ├── cache/data/                  ← application cache (when CACHE_STORE=file)
>       ├── cache/laravel-excel/         ← temp files for queued Excel exports
>       ├── sessions/                    ← sessions (when SESSION_DRIVER=file)
>       └── views/                       ← compiled Blade templates
> ```
> Data survives pod restarts and deploys. It is lost only if you manually delete the PVC.

> **Important:** The `storage/framework/*` directories must exist **before** the pod starts — otherwise:
> - `php artisan view:cache` fails on startup
> - queued Excel exports fail with `fopen(... laravel-excel/...): No such file or directory`
> - file-based sessions fail
>
> If your `Dockerfile` doesn't create these directories in the image, **add them to the pod's `command`/`entrypoint`** or to the migration job:
> ```bash
> mkdir -p storage/framework/{cache/data,cache/laravel-excel,sessions,views} \
>          storage/app/{public,private} storage/logs \
>   && chown -R www-data:www-data storage bootstrap/cache
> ```
> Best practice: add this line to the `Dockerfile` (a layer just before `USER www-data`) — that way every new image has the correct structure.

> **PVC limitation:** works only with `replicas: 1`. When scaling to 2+ pods, switch to external S3-compatible storage (AWS S3, MinIO, Cloudflare R2) — set `FILESYSTEM_DISK=s3` in your `.env`.

The default `server/.env.production.example` uses `FILESYSTEM_DISK=s3` — external object storage is the recommended setup for production. Set `FILESYSTEM_DISK=public` only if you intentionally want local PVC storage with a single replica.

### 12.2 Deploying the servers

```bash
# Server (Laravel)
kubectl apply -f k8s/server/service.yaml
kubectl apply -f k8s/server/deployment.yaml
kubectl apply -f k8s/server/deployment-queue.yaml
kubectl apply -f k8s/server/cronjob-scheduler.yaml
kubectl apply -f k8s/server/hpa.yaml

# Client (Next.js)
kubectl apply -f k8s/client/service.yaml
kubectl apply -f k8s/client/deployment.yaml
kubectl apply -f k8s/client/hpa.yaml

# Ingress (routing + TLS)
kubectl apply -f k8s/ingress.yaml
```

Check the status:

```bash
kubectl -n app get all
```

You should see:

```
NAME                               READY   STATUS
pod/app-server-xxxxxxxxx-xxxxx     1/1     Running
pod/app-queue-xxxxxxxxx-xxxxx      1/1     Running
pod/app-queue-xxxxxxxxx-yyyyy      1/1     Running
pod/app-client-xxxxxxxxx-xxxxx     1/1     Running
pod/app-mysql-0                    1/1     Running
pod/app-redis-xxxxxxxxx-xxxxx      1/1     Running
pod/app-gotenberg-xxxxxxxxx-xxxxx  1/1     Running
```

> **Note:** `app-queue` runs 2 replicas by default (configured in `k8s/server/deployment-queue.yaml`). Each worker restarts itself after 1 hour (`--max-time=3600`) to prevent memory leaks.

### 12.3 Queue worker (background jobs)

The queue worker is a **separate Deployment** (`app-queue`) that continuously reads the Redis queue and runs the application's jobs. Without it:

- mail, SSE notifications, Scout indexing → everything goes to the queue and nobody processes it
- Spatie MediaLibrary image conversions → uploaded images never get thumbnails
- queued Excel exports → the user never receives the file
- post-purchase / post-registration emails → never go out

The `k8s/server/deployment-queue.yaml` manifest starts 2 replicas (HA) and runs:

```
php artisan queue:work redis --tries=3 --timeout=300 --max-jobs=1000 --max-time=3600
```

`--max-time=3600` and `--max-jobs=1000` make the worker restart itself every hour / every 1000 jobs — this guards against memory leaks in long-running processes.

**Check that the workers are running:**

```bash
kubectl -n app get pods -l component=queue
# NAME                       READY   STATUS    RESTARTS   AGE
# app-queue-xxxxx-aaaaa      1/1     Running   0          12m
# app-queue-xxxxx-bbbbb      1/1     Running   0          12m

kubectl -n app logs deployment/app-queue --tail=30
```

**Failed jobs — what to do with them:**

Jobs that fail 3 times land in the `failed_jobs` table. Check them regularly:

```bash
# List
kubectl -n app exec deployment/app-server -- php artisan queue:failed

# Details of a specific job (exception)
kubectl -n app exec deployment/app-server -- \
  php artisan queue:failed | grep "ProductsExport"

# Retry a single job
kubectl -n app exec deployment/app-server -- \
  php artisan queue:retry <UUID>

# Retry all
kubectl -n app exec deployment/app-server -- php artisan queue:retry all

# Flush all failed jobs (cleanup)
kubectl -n app exec deployment/app-server -- php artisan queue:flush
```

**Scaling:** If the queue grows faster than the workers can drain it, add replicas:

```bash
kubectl -n app scale deployment/app-queue --replicas=4
```

Remember that every worker pulls the same `.env` — more workers means more memory usage and more connections to Redis/MySQL.

### 12.4 Scheduler (Laravel cron jobs)

Laravel has a built-in scheduler — in `routes/console.php` you define tasks that should run periodically (e.g. publishing scheduled posts, clearing carts). List the tasks:

```bash
kubectl -n app exec deployment/app-server -- php artisan schedule:list
```

On a traditional server you'd add a single `crontab` entry:
```
* * * * * php artisan schedule:run >> /dev/null 2>&1
```

In k3s the equivalent is a **`CronJob`** (`k8s/server/cronjob-scheduler.yaml`) — every minute Kubernetes starts a short-lived pod that runs `php artisan schedule:run`, then kills it.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: app-scheduler
spec:
  schedule: "* * * * *"          # every minute
  concurrencyPolicy: Forbid       # don't start a new one if the previous is still running
  successfulJobsHistoryLimit: 1
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: scheduler
              image: ghcr.io/<user>/app-server:latest
              command: ["php", "artisan", "schedule:run"]
```

**Verification:**

```bash
# The CronJob exists
kubectl -n app get cronjob app-scheduler
# NAME            SCHEDULE    LAST SCHEDULE   AGE
# app-scheduler   * * * * *   39s             1d

# The last few invocations (pods with Completed status)
kubectl -n app get pods | grep app-scheduler | tail -5

# Logs from the last run
LAST=$(kubectl -n app get pods -o name | grep scheduler | tail -1)
kubectl -n app logs $LAST
# Running ['artisan' blog:publish-scheduled] . 2 sec DONE
# Running ['artisan' cms:process-scheduled-pages]  2 sec DONE
```

**Common mistake:** The CronJob uses the same image as `app-server`. The pipeline updates the image in both (`kubectl set image deployment/app-server` **and** `kubectl set image cronjob/app-scheduler`) — check your `.github/workflows/deploy.yml`, it's easy to forget.

### 12.5 Mail (SMTP)

Laravel sends transactional email over SMTP. In k3s you have two options:

#### Option A — external SMTP (recommended for production)

Mailgun, SendGrid, Resend, Postmark, Amazon SES, your own SMTP. Put the credentials in `PROD_ENV`:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com         # or smtp.mailgun.org, smtp.eu.mailgun.org, ...
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxxxxxxxxxxxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

> **Most common mistake:** `MAIL_HOST=smtp.yourdomain.com` left as a placeholder — all mail fails with `getaddrinfo failed`. Check the actual config:
> ```bash
> kubectl -n app exec deployment/app-server -- \
>   php artisan config:show mail.mailers.smtp.host
> ```

#### Option B — mailpit in the cluster (for testing / staging)

[Mailpit](https://mailpit.axllent.org/) is a lightweight SMTP server with a web UI — it catches all mail in memory and shows it in the browser, nothing leaves the cluster. Perfect for staging and developer smoke tests.

Save the manifest `k8s/mailpit/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-mailpit
  namespace: app
spec:
  replicas: 1
  selector: { matchLabels: { app: app-mailpit } }
  template:
    metadata: { labels: { app: app-mailpit } }
    spec:
      containers:
        - name: mailpit
          image: axllent/mailpit:latest
          ports:
            - { name: smtp, containerPort: 1025 }
            - { name: http, containerPort: 8025 }
          resources:
            requests: { cpu: 10m, memory: 32Mi }
            limits:   { cpu: 100m, memory: 128Mi }
---
apiVersion: v1
kind: Service
metadata: { name: mailpit, namespace: app }
spec:
  selector: { app: app-mailpit }
  ports:
    - { name: smtp, port: 1025, targetPort: 1025 }
    - { name: http, port: 8025, targetPort: 8025 }
```

```bash
kubectl apply -f k8s/mailpit/deployment.yaml
```

In `PROD_ENV` (or `STAGING_ENV`) set:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=mailpit            # the in-cluster DNS service
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="no-reply@yourdomain.test"
```

Expose the web UI (port 8025) via Ingress or `kubectl port-forward`:

```bash
kubectl -n app port-forward svc/mailpit 8025:8025
# open http://localhost:8025
```

**Send test:**

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='Mail::raw("test ".now(), fn($m) => $m->to("test@example.com")->subject("ping"));'
```

### 12.6 Reverb / broadcasting (realtime — chat, notifications)

If the application uses WebSockets (Laravel Reverb, Pusher, Soketi) — e.g. live support chat, admin panel push notifications — you need a separate deployment.

The simplest is **Laravel Reverb** (official, bundled with Laravel ≥11):

```yaml
# k8s/reverb/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: app-reverb, namespace: app }
spec:
  replicas: 1                     # Reverb keeps WS state in-memory; HA needs external state (Redis pub/sub works, but clients are sticky)
  selector: { matchLabels: { app: app-reverb } }
  template:
    metadata: { labels: { app: app-reverb } }
    spec:
      imagePullSecrets: [{ name: ghcr-pull-secret }]
      containers:
        - name: reverb
          image: ghcr.io/<user>/app-server:latest
          command: ["php", "artisan", "reverb:start", "--host=0.0.0.0", "--port=8080"]
          envFrom: [{ secretRef: { name: app-server-env } }]
          ports: [{ containerPort: 8080 }]
---
apiVersion: v1
kind: Service
metadata: { name: app-reverb, namespace: app }
spec:
  selector: { app: app-reverb }
  ports: [{ port: 8080, targetPort: 8080 }]
```

Required variables in `PROD_ENV`:

```dotenv
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=<random_id>
REVERB_APP_KEY=<random_key>
REVERB_APP_SECRET=<random_secret>
REVERB_HOST=app-reverb           # server-side, in-cluster
REVERB_PORT=8080
REVERB_SCHEME=http

# Frontend / client build args:
NEXT_PUBLIC_REVERB_APP_KEY=<same key>
NEXT_PUBLIC_REVERB_HOST=ws.yourdomain.com   # public host, via Ingress
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

In the Ingress add the host `ws.yourdomain.com` with path `/app` → `app-reverb:8080`. Traefik handles WebSocket upgrade **out of the box** — nothing extra to configure.

**Without Reverb:** in `.env` leave `BROADCAST_CONNECTION=log` (events are only logged) or `redis` (events go to Redis pub/sub, but the frontend has no way to receive them). Chat / SSE notifications will only work via polling.

### 12.7 Laravel Excel — gotchas

The `Maatwebsite\Excel` exports in this project (`ProductsExport`, `OrdersExport`, `CustomersExport`, `CustomReportExport`) **implement `ShouldQueue`** — meaning `Excel::store(...)` returns immediately and the actual file write happens in the worker.

Consequences:

1. **A queue worker is required** — without `app-queue` Running, exports are never produced.
2. **A cache directory is required** — the worker writes temp files to `storage/framework/cache/laravel-excel/`. If the directory doesn't exist, the queue job fails with:
   ```
   ErrorException: fopen(.../storage/framework/cache/laravel-excel/laravel-excel-XXX.xlsx): No such file or directory
   ```
   See "What does the PVC store?" above — `mkdir -p storage/framework/cache/laravel-excel`.
3. **Disk = `local`** in `config/excel.php` targets `storage/app` (or `storage/app/private` since Laravel 11). If you want files to survive pod restarts — the PVC handles that, if `replicas: 1`. With 2+ replicas, move exports to MinIO/S3 (`Excel::store(..., 's3')`).

### 12.8 Testing without a domain (sslip.io)

If you don't have a real domain yet, use the development ingress — HTTP only, no TLS needed:

```bash
# Edit k8s/ingress-dev.yaml and replace 1.2.3.4 with your server IP
kubectl apply -f k8s/ingress-dev.yaml
```

The `sslip.io` service resolves subdomains automatically:
- `app.1.2.3.4.sslip.io` → your server IP (Next.js frontend)
- `api.1.2.3.4.sslip.io` → your server IP (Laravel admin)

Switch to production ingress when your domain is ready:

```bash
kubectl delete -f k8s/ingress-dev.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 13. How Does CI/CD Connect to k3s?

Before configuring the pipeline, it's worth understanding how it can control Kubernetes on your server at all.

### Traditional deploy (SSH)

In the classic approach (e.g. Deployer, Capistrano) the pipeline logs into the server via SSH and runs scripts:

```
GitHub/GitLab Actions → SSH (port 22) → VPS
                          ↓
                      scp files
                      ./deploy.sh
```

You manage how code gets onto the server.

### Deploy via Kubernetes API (kubectl)

With Kubernetes, the pipeline **does not send code** — the code is already in the Docker image (built and pushed to the registry). The pipeline only tells k8s: *"use this image now"*:

```
GitHub/GitLab Actions → HTTPS (port 6443) → k8s API → k3s
                                                 ↓
                         sed image tag in manifest → kubectl apply
                         k8s handles the rolling update itself
```

### What is KUBECONFIG?

`kubectl` is an HTTP client — it connects to the k3s API server over HTTPS on port 6443. The entire connection context (server address + credentials) lives in a `kubeconfig` file:

```yaml
apiVersion: v1
clusters:
- cluster:
    server: https://YOUR_VPS_IP:6443   # ← server address
    certificate-authority-data: BASE64  # ← CA cert (server verification)
  name: default
users:
- user:
    client-certificate-data: BASE64     # ← your "key" (like an SSH key)
    client-key-data: BASE64
  name: default
```

The kubeconfig file is pasted as a single secret in CI/CD — it replaces SSH_HOST + SSH_PORT + SSH_USER + SSH_KEY combined.

| Traditional SSH | Kubernetes                           |
|-----------------|--------------------------------------|
| `SSH_HOST`      | included in kubeconfig               |
| `SSH_PORT`      | included in kubeconfig (6443)        |
| `SSH_USER`      | included in kubeconfig (client cert) |
| `SSH_KEY`       | included in kubeconfig (client key)  |

### How to get the kubeconfig?

On your local machine (kubectl already configured from section 4.2):

```bash
cat ~/.kube/config-hetzner
```

> **Make sure** the kubeconfig points to the server's public IP (not `127.0.0.1`). If you copied it with the command from section 4.2 (with `sed`), it's already correct.

### What port do you need to open on the server?

```bash
# Hetzner firewall (Cloud panel) or UFW — open port 6443
ufw allow 6443/tcp comment "k8s API for CI/CD"
```

Port 22 (SSH) can remain restricted to your IP only — CI/CD no longer needs it.

---

## 14. Configuring GitHub Actions

The repository contains a `.github/workflows/deploy.yml` file with a complete pipeline. You only need to configure variables in GitHub.

### 14.1 Secrets and Variables

In GitHub: **Settings → Secrets and variables → Actions → Secrets / Variables**

#### Secrets (write-only, masked in logs)

| Secret            | Description                                       |
|-------------------|---------------------------------------------------|
| `KUBECONFIG_PROD` | Raw kubeconfig content (plain text, not base64)   |

```bash
# How to get the value:
cat ~/.kube/config-hetzner
# Copy the entire output (starts with "apiVersion: v1") and paste as the secret value.
# Do NOT base64-encode it.
```

#### Variables (visible and editable in the UI)

| Variable          | Example                             | Description                                   |
|-------------------|-------------------------------------|-----------------------------------------------|
| `PROD_ENV`        | *(full content of production .env)* | Automatically synced to k8s Secret on deploy  |
| `ENV_CLIENT_PROD` | *(full content of frontend .env)*   | Build-time variables for Next.js (multiline)  |

> **Why `PROD_ENV` as a Variable, not a Secret?**  
> Secrets are write-only — once saved you can't read or edit them line by line. Variables are visible in the UI, so you can easily check what's set and update individual lines. The pipeline syncs the value to a k8s Secret before deploying anyway.

#### How to set PROD_ENV

The value is literally the contents of your production `.env`. See `server/.env.production.example` for the full list of required variables:

```dotenv
APP_NAME="MyCMS"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://admin.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Internal service hostnames follow the pattern:
# <APP_NAME>-<service>.<NAMESPACE>.svc.cluster.local
# If your namespace is "app", it's app-mysql.app.svc.cluster.local
# If your namespace is "app",      it's app-mysql.app.svc.cluster.local
DB_HOST=<APP_NAME>-mysql.<NAMESPACE>.svc.cluster.local
DB_DATABASE=<NAMESPACE>
DB_USERNAME=<from bootstrap secret>
DB_PASSWORD=<from bootstrap secret>

REDIS_HOST=<APP_NAME>-redis.<NAMESPACE>.svc.cluster.local
REDIS_PASSWORD=<from bootstrap secret>

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET=...
AWS_ENDPOINT=...

GOTENBERG_URL=http://<APP_NAME>-gotenberg.<NAMESPACE>.svc.cluster.local:3000

TYPESENSE_API_KEY=<from bootstrap secret>
TYPESENSE_HOST=<APP_NAME>-typesense.<NAMESPACE>.svc.cluster.local

GLITCHTIP_DSN=https://...@glitchtip.yourdomain.com/1
...
```

> **Where do I find the namespace and service names?**  
> They depend on the app name you chose during `bootstrap.sh`. Check with `kubectl -n <NAMESPACE> get svc`.

GitHub supports multiline Variables — paste the entire content.

#### How to set ENV_CLIENT_PROD

The value is the `.env` content for the Next.js frontend — only the build-time variables needed at image build:

```dotenv
NEXT_PUBLIC_API_URL=https://admin.yourdomain.com
NEXT_PUBLIC_APP_NAME=MyCMS
NEXT_PUBLIC_GLITCHTIP_DSN=https://...@glitchtip.yourdomain.com/2
```

Add as many `NEXT_PUBLIC_*` variables as needed. The pipeline passes them all to `docker buildx build` as `--build-arg` entries automatically.

### 14.2 How the pipeline works

```
push → master/main
        │
        ├── changes        (detect: server/ or client/ changed?)
        │
        ├── lint-server    (Pint, Rector, Larastan, Wayfinder types, ESLint, Prettier)
        ├── lint-client    (TypeScript types, ESLint, Prettier)
        ├── security       (composer audit, npm audit — server + client)
        ├── test           (Pest PHP — matrix 8.4 + 8.5, with Gotenberg service)
        │
        ├── build-server   → ghcr.io/<owner>/app-server:abc1234   (only if server/ changed)
        ├── build-client   → ghcr.io/<owner>/app-client:abc1234   (only if client/ changed)
        │
        └── deploy
              ├── 0.  kubectl create secret app-server-env (sync PROD_ENV)
              ├── 0b. kubectl apply ingress, traefik, services, hpa (infra manifests)
              ├── 1.  kubectl apply job-migrate (DB migrations, wait 2 min)
              ├── 2.  kubectl apply deployment/app-server (with new image tag)
              ├── 3.  kubectl apply deployment/app-queue  (with new image tag)
              ├── 4.  kubectl apply cronjob/app-scheduler (with new image tag)
              └── 5.  kubectl apply deployment/app-client (with new image tag)
```

**Smart change detection:** The pipeline detects which directories changed (`server/` or `client/`). If only frontend code changed, the server image is not rebuilt (and vice versa). The deploy step always runs if anything was built or if triggered manually.

**Image tag substitution:** The deploy step uses `sed` to replace the placeholder image tag in the YAML manifests and applies the full manifest — not `kubectl set image`. This ensures the manifest in git always matches what's running in the cluster:

```bash
sed "s|ghcr.io/owner/app-server:latest|ghcr.io/owner/app-server:abc1234|g" \
  k8s/server/deployment.yaml | kubectl apply -f -
```

**Fallback to :latest:** If a build was skipped (the component didn't change), the deploy uses the `:latest` tag already in the registry.

**Manual triggers:** The pipeline supports `workflow_dispatch` with two options:
- `skip_deploy`: run lint/test/build only, skip the k8s deploy
- `deploy_only`: skip lint/test/build entirely and deploy the existing `:latest` images

Each deploy:
1. First updates the k8s Secret from `PROD_ENV` — no restart needed for migrations
2. Applies infrastructure manifests (safe to re-apply — idempotent)
3. Runs `php artisan migrate --force` as a one-off Job with the **new** image
4. Waits for it to complete (max 2 minutes)
5. Only then performs the rolling update of deployments

This means migrations always run before new code — no more "column does not exist".

### 14.3 No registry server required

GitHub Container Registry (GHCR) is built into GitHub — you don't need to configure any external registry. The pipeline automatically authenticates using `GITHUB_TOKEN` (available automatically in every workflow).

### 14.4 GitHub Environments and deployment protection

The `deploy` job uses `environment: production`. You can configure protection rules in **Settings → Environments → production**:

- Required reviewers before deploying
- Wait timer (e.g. 5-minute delay)
- Deployment branches whitelist

The job also uses a `concurrency` group (`production-deploy`) with `cancel-in-progress: false` — a running deploy is **never** cancelled by a subsequent push.

---

## 15. Configuring GitLab CI/CD

The repository contains a `.gitlab-ci.yml` file with a complete pipeline. You only need to configure variables.

### 15.1 CI/CD variables

In GitLab: **Settings → CI/CD → Variables → Add variable**

#### Required variables

| Variable          | Type     | Masked | Protected | Description                              |
|-------------------|----------|--------|-----------|------------------------------------------|
| `KUBECONFIG`      | Variable | ✅      | ✅         | **Base64-encoded** kubeconfig            |
| `SERVER_ENV`      | Variable | ✅      | ✅         | Full content of production `.env`        |
| `ENV_CLIENT_PROD` | Variable | ❌      | ❌         | Build-time variables for Next.js         |

**You don't need** to set registry variables — GitLab provides them automatically:
- `CI_REGISTRY` — registry address
- `CI_REGISTRY_USER` — username
- `CI_REGISTRY_PASSWORD` — password

#### How to get KUBECONFIG

> ⚠️ **GitLab requires the kubeconfig to be base64-encoded.** The pipeline decodes it with `base64 -d`.

```bash
# On your local machine (where kubectl is configured):
cat ~/.kube/config-hetzner | base64 | tr -d '\n'
# Copy the entire output and paste as the KUBECONFIG variable value in GitLab.
```

#### How to get SERVER_ENV

The value of `SERVER_ENV` is literally the contents of your production `.env`:

```dotenv
APP_NAME="MyCMS"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://admin.yourdomain.com
FRONTEND_URL=https://yourdomain.com
...
```

Paste the entire content as the variable value (GitLab supports multiline variables).

### 15.2 How the pipeline works

```
push → master
        │
        ├── lint-server    (Pint, Rector, Larastan, Wayfinder types, ESLint, Prettier)
        ├── lint-client    (TypeScript types, ESLint, Prettier)
        ├── security       (composer audit, npm audit)
        ├── test           (Pest PHP, with Gotenberg service)
        │
        ├── build-server   → registry.gitlab.com/.../server:abc1234
        ├── build-client   → registry.gitlab.com/.../client:abc1234
        │
        └── deploy
              ├── 1. kubectl apply job-migrate (DB migrations, wait 2 min)
              ├── 2. kubectl set image deployment/app-server
              ├── 3. kubectl set image deployment/app-queue
              ├── 4. kubectl set image cronjob/app-scheduler
              └── 5. kubectl set image deployment/app-client
```

The `resource_group: production` directive prevents concurrent deploys — the same as the GitHub Actions concurrency group.

Each deploy:
1. Runs `php artisan migrate --force` as a one-off Job with the new image
2. Waits for it to complete (max 2 minutes)
3. Only then performs the rolling update of deployments

---

## 16. First deployment via CI

Push to the `master` branch:

```bash
# GitHub Actions
git add .github/ k8s/
git commit -m "ci: add GitHub Actions CI/CD and k3s manifests"
git push origin master
```

```bash
# GitLab CI
git add .gitlab-ci.yml k8s/
git commit -m "ci: add GitLab CI/CD and k3s manifests"
git push origin master
```

**GitHub Actions:** Go to the **Actions** tab in your repository and watch the pipeline.

**GitLab CI:** Go to **CI/CD → Pipelines** and watch the pipeline.

The first run takes longer (~10–15 min) because:
- it downloads PHP and Node.js dependencies without cache
- it builds Docker images from scratch

Subsequent pipelines are faster thanks to Docker layer cache and node_modules cache.

### Check the results

After the pipeline finishes:

```bash
kubectl -n app get pods
kubectl -n app get ingress
```

Check the TLS certificate:

```bash
kubectl -n app describe certificate app-tls
# Status: True (Ready)
```

Open a browser and visit:
- `https://yourdomain.com` — Next.js frontend
- `https://admin.yourdomain.com` — admin panel (Laravel + Inertia)
- `https://admin.yourdomain.com/health` — Laravel health check (should return `{"status":"ok"}`)

---

## 17. Verification — is everything working?

### Post-deployment checklist

```bash
# All pods Running
kubectl -n app get pods

# TLS certificate issued
kubectl -n app get certificate
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   5m

# Ingress has an IP address
kubectl -n app get ingress
# NAME          CLASS     HOSTS                           ADDRESS       PORTS
# app-ingress   traefik   yourdomain.com,admin....        <IP>          80, 443

# Laravel responds
curl -s https://admin.yourdomain.com/health
# {"status":"ok","timestamp":"..."}

# Frontend responds
curl -I https://yourdomain.com
# HTTP/2 200

# Migrations ran
kubectl -n app exec -it deployment/app-server -- \
  php artisan migrate:status | tail -5

# Queue workers are running (2 replicas)
kubectl -n app logs deployment/app-queue --tail=20
```

### Health probes

The server deployment has two probes:
- **Liveness** (`/healthz`): nginx-level — Kubernetes restarts the pod if the process is dead
- **Readiness** (`/health`): Laravel health endpoint — Kubernetes won't route traffic until the app is ready

### Upload test

Log in to the admin panel and try uploading an image — this verifies MySQL, storage (S3/R2), and nginx body size limit.

---

## 18. Day-to-day operations — logs, restarts, updates

### Viewing logs

```bash
# Live logs for a deployment
kubectl -n app logs -f deployment/app-server

# Queue worker logs
kubectl -n app logs -f deployment/app-queue

# Logs from the previous pod (after a restart)
kubectl -n app logs deployment/app-server --previous

# Logs from the last hour
kubectl -n app logs deployment/app-server --since=1h
```

### Restarting a pod / deployment

```bash
# Rolling restart of a deployment (creates new pods one by one)
kubectl -n app rollout restart deployment/app-server

# Force restart a specific pod (Kubernetes replaces it with a new one)
kubectl -n app delete pod <pod-name>
```

### Getting a shell inside a container (like docker exec)

```bash
kubectl -n app exec -it deployment/app-server -- bash

# Inside:
php artisan tinker
php artisan cache:clear
php artisan queue:restart
```

### Checking resource usage (CPU / RAM)

```bash
kubectl -n app top pods
# NAME                        CPU(cores)   MEMORY(bytes)
# app-server-xxx              45m          210Mi
# app-queue-xxx               12m          128Mi
# app-queue-yyy               10m          121Mi
# app-client-xxx              8m           95Mi
# app-mysql-0                 35m          480Mi
# app-redis-xxx               3m           28Mi
```

### Rolling back a deployment

If a new version breaks something critical:

```bash
# Check the rollout history
kubectl -n app rollout history deployment/app-server

# Roll back to the previous version
kubectl -n app rollout undo deployment/app-server

# Roll back to a specific revision
kubectl -n app rollout undo deployment/app-server --to-revision=2
```

### Updating k3s

```bash
# On the server
curl -sfL https://get.k3s.io | sh -
# k3s detects the existing installation and updates itself
```

---

## 19. MySQL backup

MySQL runs on a PersistentVolume — data is stored on the server's disk. Don't rely on that alone, though!

### Manual backup

```bash
kubectl -n app exec app-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASSWORD> cms \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automatic backup via CronJob

Create a file `k8s/mysql/cronjob-backup.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: app-mysql-backup
  namespace: app
spec:
  schedule: "0 3 * * *"     # every day at 3:00 AM
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: mysql:8.0
              command:
                - /bin/sh
                - -c
                - |
                  mysqldump -h app-mysql -u root -p$MYSQL_ROOT_PASSWORD cms \
                    | gzip > /backup/cms_$(date +%Y%m%d_%H%M%S).sql.gz
                  # Delete backups older than 7 days
                  find /backup -name "*.sql.gz" -mtime +7 -delete
              env:
                - name: MYSQL_ROOT_PASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: app-mysql
                      key: root-password
              volumeMounts:
                - name: backup
                  mountPath: /backup
          volumes:
            - name: backup
              hostPath:
                path: /opt/app-backups    # directory on the server
                type: DirectoryOrCreate
          restartPolicy: OnFailure
```

```bash
# Create the directory on the server
mkdir -p /opt/app-backups

# Apply the CronJob
kubectl apply -f k8s/mysql/cronjob-backup.yaml
```

> **Recommendation:** Also sync `/opt/app-backups` to external storage (e.g. Hetzner Object Storage, Backblaze B2) using `rclone`.

---

## 20. Common problems (troubleshooting)

### Pod stuck in `Pending`

```bash
kubectl -n app describe pod <pod-name>
```

Look for the `Events` section at the bottom. Common causes:
- `Insufficient memory` — not enough RAM on the node
- `ImagePullBackOff` — wrong pull secret or incorrect image address
- `PVC not bound` — storage class issue

### `ImagePullBackOff` — can't pull the image

```bash
kubectl -n app get secret ghcr-pull-secret -o yaml
# Check if the secret exists

# Check if the deploy token is active in GitLab
# Settings → Repository → Deploy tokens
```

Recreate the secret:

```bash
kubectl -n app delete secret ghcr-pull-secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<new-token-username> \
  --docker-password=<new-token-password> \
  --namespace=app
```

### TLS certificate not issued

```bash
kubectl -n app describe certificate app-tls
kubectl -n cert-manager logs deployment/cert-manager | grep ERROR
```

Common causes:
- DNS hasn't propagated yet (wait 15 min)
- Port 80 is blocked by the firewall (Let's Encrypt uses HTTP challenge)
- **servicelb disabled without a cloud LB** — ports 80/443 not bound on the host; check `sudo ss -tlnp | grep :80` on the server; if nothing is listening — see section 4.1
- You've hit Let's Encrypt's rate limit (5 certificates per week per domain)

### cert-manager: `x509: certificate signed by unknown authority` when creating ClusterIssuer

```
Error from server (InternalError): error when creating "STDIN": Internal error
occurred: failed calling webhook "webhook.cert-manager.io": ... tls: failed to
verify certificate: x509: certificate signed by unknown authority
```

Race condition: the cert-manager pods are `Running`, but `cainjector` hasn't yet injected the serving certificate into the webhook. `kubectl rollout status` does **not** detect this — the pod is "ready" before the webhook actually answers.

`bootstrap.sh` has a probe for this (a server-side dry-run in a loop, up to 180s). If you still hit this error during a manual install — just wait ~30s and retry the ClusterIssuer `kubectl apply`:

```bash
# confirm the webhook actually answers
kubectl -n cert-manager get pods
until kubectl apply --dry-run=server -f letsencrypt-prod.yaml >/dev/null 2>&1; do
  echo "webhook not ready yet, retrying in 5s..."; sleep 5
done
kubectl apply -f letsencrypt-prod.yaml
```

### Laravel returning 500

```bash
kubectl -n app logs deployment/app-server --tail=50
kubectl -n app exec -it deployment/app-server -- cat storage/logs/laravel.log | tail -50
```

### Migration failed

```bash
# Check logs of the finished job
kubectl -n app get jobs
kubectl -n app logs job/app-migrate-<SHA>
```

### No connection to MySQL

```bash
# Test from the server pod
kubectl -n app exec -it deployment/app-server -- \
  php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';"
```

Check that `DB_HOST` in the secret matches `app-mysql.app.svc.cluster.local`.

### Typesense: the collection exists but `num_documents=0`

After `scout:import` the collection shows up in the logs, but documents aren't indexed. Check the worker:

```bash
kubectl -n app logs deployment/app-queue --tail=50 | grep -A3 -i scout
```

Typical error: `Error importing document: Field 'is_featured' must be a bool` — this means `toSearchableArray()` in the model returns an **int** instead of a **bool** (because `'is_featured' => 'boolean'` is missing from `$casts`). Fix it by rebuilding the image from the correct commit, or by adding an explicit `(bool) $this->is_featured` cast in `toSearchableArray()`.

After the fix:

```bash
# Flush the old collection and re-import
kubectl -n app exec deployment/app-server -- php artisan scout:flush "App\Models\Product"
kubectl -n app exec deployment/app-server -- php artisan scout:import "App\Models\Product"
```

### Excel export fails with `fopen(.../laravel-excel/...): No such file or directory`

A queued Maatwebsite/Excel export tries to write to `storage/framework/cache/laravel-excel/` and the directory doesn't exist on the PVC. Create it in every pod that uses the volume (server + queue):

```bash
for pod in $(kubectl -n app get pods -l 'component in (server,queue)' -o name); do
  kubectl -n app exec $pod -- sh -c \
    'mkdir -p storage/framework/cache/laravel-excel && chown www-data:www-data storage/framework/cache/laravel-excel'
done
```

Permanent fix: add `mkdir -p` to the `Dockerfile` (a layer before `USER www-data`) — see section 12.1.

### Mail doesn't go out — `Name does not resolve`

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='try{ Mail::raw("t",fn($m)=>$m->to("x@x")->subject("p")); echo "OK"; }catch(\Throwable $e){echo $e->getMessage();}'
# Connection could not be established with host "smtp.yourdomain.com:587": getaddrinfo failed
```

Most common causes:
1. `MAIL_HOST` in `PROD_ENV` is a placeholder (`smtp.yourdomain.com`) — set a real SMTP host or deploy mailpit (section 12.5).
2. `MAIL_HOST=mailpit` but there is no `mailpit` Service in the cluster — `kubectl -n app get svc mailpit`.
3. The server firewall blocks outbound 587/465 — check `nc -zv smtp.host 587` from the pod.

### Failed jobs piling up (queue:failed → hundreds of records)

Often visible after a DB schema change, a job class rename refactor, or Scout/Media errors. Workflow:

```bash
# 1. see which job types are failing
kubectl -n app exec deployment/app-server -- php artisan queue:failed | awk '{print $5}' | sort | uniq -c

# 2. inspect one exception
kubectl -n app exec deployment/app-server -- php artisan tinker --execute='echo DB::table("failed_jobs")->latest("failed_at")->value("exception");' | head -c 500

# 3. after fixing the code — retry or flush
kubectl -n app exec deployment/app-server -- php artisan queue:retry all
# or: queue:flush  (deletes all failed jobs)
```

### HPA not scaling

```bash
kubectl -n app get hpa
# If TARGETS = <unknown>/70% — metrics-server isn't working

# Check if metrics-server is installed
kubectl -n kube-system get deployment metrics-server
```

If metrics-server is missing — install it:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 21. GlitchTip — error tracking

GlitchTip is a self-hosted, open-source alternative to Sentry. It uses the same Sentry SDK — no code changes needed, just point the DSN to your GlitchTip instance.

> **Chart version:** the steps below target the official chart **8.2.0** (app v6.1.4). Chart 8.x **no longer bundles Postgres** — `postgresql.enabled: true` requires the CloudNativePG operator. So we run our own standalone Postgres (`k8s/glitchtip/postgresql.yaml`) and point the chart at it via `DATABASE_URL`. Valkey (the Redis replacement) is still bundled by the chart.

### 21.1 Prepare `values.yaml` and `secret.yaml`

The repo ships two templates. **Never commit** the files with secrets — `.gitignore` ignores `k8s/glitchtip/values.yaml` and `k8s/glitchtip/secret.yaml`:

```bash
cp k8s/glitchtip/values.example.yaml k8s/glitchtip/values.yaml
cp k8s/glitchtip/secret.yaml.example k8s/glitchtip/secret.yaml

# generate the secrets:
openssl rand -hex 25                     # → SECRET_KEY
openssl rand -base64 24 | tr -d '/+='    # → POSTGRES_PASSWORD
```

**`k8s/glitchtip/secret.yaml`** — one Secret `glitchtip-secrets`, three keys:

| Key | What to fill in |
|---|---|
| `SECRET_KEY` | The generated 50-char hex. **Don't change after startup** — it invalidates sessions and tokens. |
| `POSTGRES_PASSWORD` | The generated strong Postgres password. |
| `DATABASE_URL` | `postgres://glitchtip:<POSTGRES_PASSWORD>@glitchtip-postgresql:5432/glitchtip` — the password **must** match `POSTGRES_PASSWORD`. |

**`k8s/glitchtip/values.yaml`** — Helm config (no secrets):

| Key | What to fill in |
|---|---|
| `glitchtip.domain` | Full URL of the instance, e.g. `https://glitchtip.yourdomain.com` (the subdomain must have a DNS A record pointing at the server IP) |
| `web.ingress.hosts[0].host` + `web.ingress.tls[0].hosts[0]` | The same domain (without `https://`) |
| `web.extraEnvVars` → `EMAIL_URL` | SMTP for alerts: `smtp://USER%40gmail.com:APP_PASSWORD@smtp.gmail.com:587` — URL-encode special chars (`@` in the username → `%40`). Gmail needs an [App Password](https://myaccount.google.com/apppasswords). |
| `web.extraEnvVars` → `DEFAULT_FROM_EMAIL` | The "From" address for alert emails |

The remaining fields (`glitchtip.existingSecret`, `glitchtip.database.existingSecret`, `valkey.enabled`, `postgresql.enabled: false`, `web.ingress.className: traefik`) are already set correctly in the template — leave them.

### 21.2 Install

Order matters: namespace → secret → Postgres → chart.

```bash
kubectl create namespace glitchtip --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/glitchtip/secret.yaml
kubectl apply -f k8s/glitchtip/postgresql.yaml
kubectl -n glitchtip rollout status statefulset/glitchtip-postgresql --timeout=3m

helm repo add glitchtip https://gitlab.com/api/v4/projects/16325141/packages/helm/stable --force-update
helm repo update glitchtip
helm upgrade --install glitchtip glitchtip/glitchtip \
  --namespace glitchtip \
  -f k8s/glitchtip/values.yaml
```

`bootstrap.sh` (Step 12) does exactly this automatically — provided both `values.yaml` **and** `secret.yaml` exist. If they don't, Step 12 is skipped (the bootstrap continues — GlitchTip is optional).

### 21.3 Post-install configuration

1. Open `https://glitchtip.yourdomain.com` (wait 1–2 min for the TLS certificate from cert-manager)
2. Create an organization (e.g. `cms`)
3. Create two projects: `cms-api` (platform: PHP/Laravel) and `cms-frontend` (platform: Next.js)
4. Copy the DSNs from **Settings → Client Keys (DSN)** of each project
5. Wire them into CI/CD:
   - Laravel: `GLITCHTIP_DSN=https://...@glitchtip.yourdomain.com/1` (in `PROD_ENV`)
   - Next.js (build arg): `NEXT_PUBLIC_GLITCHTIP_DSN=https://...@glitchtip.yourdomain.com/2` (in `ENV_CLIENT_PROD`)
6. Trigger a deploy — from the next rollout, errors are reported to GlitchTip.

**Test:** in a Laravel admin shell:
```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='throw new \Exception("glitchtip test event");'
```
After ~30s the event appears in the GlitchTip UI → Issues.

---

## 22. Rancher — cluster management via UI

If you use Rancher at work, you can run it on the same VPS. You'll get the exact same environment — pod overview, logs, shell into containers, secret management — all from the browser.

> **🚀 Easiest: bring up Rancher and Uptime Kuma with a single command via `docker-compose.ops.yml`.**
>
> The repo ships a ready-made `docker-compose.ops.yml` (project root) containing Rancher (ports 8080/8443) and Uptime Kuma (port 3001) with persistent volumes `/opt/rancher` and `/opt/uptime-kuma`.
>
> **⚠️ Docker is required on the server.** These tools run as **Docker containers alongside k3s** (the monitor-the-monitor pattern — see above). A pure k3s server only has `containerd`, **not Docker**. `bootstrap.sh` (Step 13) detects this and installs Docker automatically (`curl -fsSL https://get.docker.com | sudo sh`). If you do it manually — install Docker first. Docker and k3s/containerd coexist fine (separate sockets).
>
> **SSH user:** use an account with **passwordless sudo** — `ssh host "sudo …"` has no TTY, so password-prompting sudo will hang. Default cloud accounts usually have it (`root` on Hetzner, `ubuntu` on OVHcloud/AWS). If you use your own account (e.g. `deployer`), see the "The `deployer` account for ops operations" box below.
>
> ```bash
> # Assume SSH_HOST=ubuntu@<SERVER_IP>  (on Hetzner: root@<SERVER_IP>)
>
> # 0. Install Docker if missing (k3s has its own containerd — this is separate)
> ssh $SSH_HOST "command -v docker || (curl -fsSL https://get.docker.com -o /tmp/d.sh && sudo sh /tmp/d.sh)"
>
> # 1. Host directories (scp can't sudo — /opt is root-owned)
> ssh $SSH_HOST "sudo mkdir -p /opt/rancher /opt/uptime-kuma && sudo chown -R 1000:1000 /opt/uptime-kuma"
>
> # 2. Copy the file to the user's home, then sudo-move it into /opt
> scp docker-compose.ops.yml $SSH_HOST:docker-compose.ops.yml
> ssh $SSH_HOST "sudo mv ~/docker-compose.ops.yml /opt/docker-compose.ops.yml"
>
> # 3. Start it (Docker, NOT k3s — operational tools running alongside the cluster)
> ssh $SSH_HOST "cd /opt && sudo docker compose -f docker-compose.ops.yml up -d"
>
> # Status:
> ssh $SSH_HOST "cd /opt && sudo docker compose -f docker-compose.ops.yml ps"
> ```
>
> `bootstrap.sh` (Step 13) does exactly this automatically — it prompts for `user@ip` and installs Docker if needed.
>
> The rest of this section covers what comes next: the first Rancher login (22.2), importing the k3s cluster (22.3), securing the ports (22.5). Uptime Kuma configuration is in the "💡 Bonus: Uptime Kuma" section below.

> **The `deployer` account for ops operations**
>
> If — per section 3.6 Option B — you have a `deployer` account and want to use it for Step 13 / `docker-compose.ops.yml`, it needs **passwordless sudo** (because `ssh host "sudo …"` has no TTY for a password). One-time, on the server:
>
> ```bash
> echo 'deployer ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/deployer
> sudo chmod 440 /etc/sudoers.d/deployer
> ```
>
> This is the only place in the whole deployment where SSH to the server is needed at all — `kubectl` operations (Steps 1–12) go through `KUBECONFIG`, not SSH. The `deployer` account does not need to be in the `docker` group — we use `sudo docker compose`.

### 22.1 Installing Rancher (manually, without compose)

If you prefer not to use compose:

```bash
docker run -d \
  --name rancher \
  --restart=unless-stopped \
  --privileged \
  -p 8080:80 -p 8443:443 \
  -v /opt/rancher:/var/lib/rancher \
  rancher/rancher:latest
```

Wait ~2 minutes, then open:

```
https://<SERVER_IP>:8443
```

> **Note:** Rancher uses a self-signed certificate on first launch — the browser will show a warning, click "Proceed anyway".

### 22.2 First login

Get the bootstrap password:

```bash
docker logs rancher 2>&1 | grep "Bootstrap Password"
```

Log in and set a new password.

### 22.3 Import the k3s cluster

1. In Rancher click **Import Existing** → **Generic**
2. Give the cluster a name, e.g. `app`
3. Rancher will generate a `kubectl apply` command — run it on the server:

```bash
kubectl apply -f https://<RANCHER_IP>:8443/v3/import/xxxxx.yaml
```

After ~1 minute the cluster will appear in Rancher with status `Active`.

### 22.4 What you can do in the UI

| Feature                | Where in Rancher                       |
|------------------------|----------------------------------------|
| View all pods          | Workloads → Pods                       |
| Live pod logs          | Pod → ⋮ → View Logs                    |
| Shell into a container | Pod → ⋮ → Execute Shell                |
| Restart a deployment   | Workloads → Deployments → ⋮ → Redeploy |
| View secrets           | Storage → Secrets                      |
| Edit env variables     | Deployment → Edit Config               |
| CPU / RAM usage        | Cluster → Metrics                      |
| CronJobs and Jobs      | Workloads → CronJobs / Jobs            |

### 22.5 Securing the Rancher panel

By default Rancher is publicly accessible on port 8443. Restrict access via the Hetzner firewall panel or directly on the server:

```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 6443         # kubectl API — your IP only
ufw deny 8443          # block publicly
ufw allow from <YOUR_IP> to any port 8443
ufw enable
```

---

## 23. Disk cleanup

k3s accumulates old container images with every deployment. After a few months you can lose tens of gigabytes — worth automating.

### 23.1 Check disk usage

```bash
df -h /

# How much k3s (containerd) images are taking
du -sh /var/lib/rancher/k3s/agent/containerd/
```

### 23.2 Manual cleanup

k3s uses `containerd` (not Docker). Use `crictl` to manage images:

```bash
# Remove all unused images
k3s crictl rmi --prune

# Check what's left
k3s crictl images
```

If you also have Docker on the server (Rancher, Uptime Kuma):

```bash
docker system prune -af
```

### 23.3 Automatic cleanup — CronJob

```bash
kubectl apply -f k8s/maintenance/cronjob-image-cleanup.yaml
```

The CronJob runs every Sunday at 2:00 AM and removes unused images from `containerd`.

---

## 24. k9s — terminal management UI

k9s is a terminal UI for Kubernetes — like Rancher, but in the console. Useful when you're already connected via SSH and don't want to open a browser.

### 24.1 Installation

macOS:
```bash
brew install k9s
```

Linux (server or local):
```bash
VERSION=$(curl -s https://api.github.com/repos/derailed/k9s/releases/latest | grep tag_name | cut -d '"' -f 4)
curl -L "https://github.com/derailed/k9s/releases/download/${VERSION}/k9s_Linux_amd64.tar.gz" \
  | tar xz -C /usr/local/bin k9s
```

Windows:
```bash
winget install k9s
```

### 24.2 Running k9s

```bash
k9s
# or jump directly into a specific namespace
k9s -n app
```

### 24.3 Key shortcuts

| Key       | Action               |
|-----------|----------------------|
| `:pod`    | list pods            |
| `:deploy` | list deployments     |
| `:secret` | list secrets         |
| `:job`    | list jobs            |
| `l`       | live pod logs        |
| `s`       | shell into container |
| `d`       | describe (details)   |
| `ctrl+r`  | restart deployment   |
| `/`       | filter by name       |
| `?`       | full shortcut list   |
| `q`       | exit / previous view |

---

## 25. Secret rotation — updating .env and passwords with no downtime

> **Easiest (recommended):** update the values in `PROD_ENV` (GitHub Variables / GitLab CI Variables) and trigger a deploy — the pipeline syncs the `app-server-env` secret and does a rolling restart for you. The sections below are for operations done manually with `kubectl` (without CI/CD).

### 25.1 Updating the Laravel .env

The single source of truth for the Laravel `.env` in the cluster is the `app-server-env` secret. Without CI/CD, regenerate it from your local `server/.env.production`:

```bash
# 1) update the values in server/.env.production (gitignored)
# 2) re-create the secret (idempotent — overwrites the existing one):
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

# 3) rolling restart — new pods start with the new secret before old ones stop
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```

### 25.2 Changing the MySQL password

**Step 1** — change the password in the database:

```bash
kubectl -n app exec -it app-mysql-0 -- mysql -u root -p<OLD_PASSWORD>
```

```sql
ALTER USER 'cms'@'%' IDENTIFIED BY 'NewPassword123!';
FLUSH PRIVILEGES;
EXIT;
```

**Step 2** — update both secrets and restart:

```bash
# MySQL secret — refresh it with --from-literal (bootstrap never creates a
# k8s/mysql/secret.yaml file — it uses kubectl CLI directly).
kubectl create secret generic app-mysql \
  --from-literal=root-password='<NEW_ROOT>' \
  --from-literal=username='cms' \
  --from-literal=password='NewPassword123!' \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

# Update DB_PASSWORD in server/.env.production, then:
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```

### 25.3 Changing the Redis password

```bash
# Redis secret
kubectl create secret generic app-redis \
  --from-literal=password='<NEW_REDIS_PASSWORD>' \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

# Update REDIS_PASSWORD in server/.env.production, then:
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n app rollout restart deployment/app-redis
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```

> **Note:** Restarting Redis clears all cache and sessions — users will be logged out. Plan the rotation outside peak hours.

---

## 26. Resetting the server for another application

This is not a day-to-day workflow, but it is useful when you want to reuse the same VPS for a completely different application without reinstalling the operating system, SSH setup, firewall rules, and basic packages.

There are two cleanup levels:

| Goal | What to run | What remains |
|------|-------------|--------------|
| Remove only this application | `kubectl delete namespace app` | k3s, Traefik, cert-manager, cluster configuration |
| Remove all Kubernetes | `k3s-uninstall.sh` | Linux system, SSH, firewall, DNS, system packages |

### 26.1 Before deleting

A full k3s uninstall removes cluster resources, secrets, PVCs, and local `local-path` volumes. For this application, that means MySQL, Redis, Typesense, uploads stored in PVCs, and all Kubernetes secrets.

Before resetting, do at least:

```bash
# Database backup
kubectl -n app exec app-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASSWORD> app \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Export key secrets for audit/recovery
kubectl -n app get secret app-server-env -o yaml > app-server-env.backup.yaml
kubectl -n app get secret app-mysql -o yaml > app-mysql.backup.yaml

# Resource inventory before deletion
kubectl -n app get all,ingress,certificate,pvc,secrets
```

If uploads are stored in S3/R2, the database and configuration backups are usually enough. If files are stored in a PVC or local storage, copy them separately from the pod or volume before uninstalling.

### 26.2 Lighter option — remove only the application

If you want to deploy a new application on the same running k3s cluster, deleting the namespace is usually enough:

```bash
kubectl delete namespace app
kubectl get namespace app
```

After the namespace is gone, you can run the bootstrap/deploy flow for the new application with a different `APP_NAME` and `KUBE_NAMESPACE`. This option keeps cert-manager, Traefik, Rancher/k9s, and the whole cluster configuration.

### 26.3 Full option — remove all k3s

On the control-plane server, run:

```bash
sudo /usr/local/bin/k3s-uninstall.sh
```

If you are cleaning up a separate agent node, use:

```bash
sudo /usr/local/bin/k3s-agent-uninstall.sh
```

The script stops k3s services and removes binaries, systemd configuration, cluster data, and k3s-managed directories. After this, `kubectl` will no longer work with this cluster, and any local kubeconfig pointing to this server becomes stale.

Verify after uninstall:

```bash
systemctl status k3s
command -v k3s
ls /etc/rancher/k3s
ls /var/lib/rancher/k3s
```

If the service, binary, and directories are gone, the server is ready for a fresh k3s installation. Start again from [4. Installing k3s](#4-installing-k3s), then run the bootstrap flow for the new application.

### 26.4 Tools running next to k3s

The Rancher and Uptime Kuma sections use the Docker-based variant, meaning those containers run next to k3s. `k3s-uninstall.sh` does not remove them.

If you also want to clean up those tools:

```bash
docker ps -a
docker stop <container>
docker rm <container>
docker volume ls
docker volume rm <volume>
```

Do not remove Docker volumes if they contain data that should survive the reset.

---

## 💡 Bonus: Staging namespace

You can run a staging environment in a separate `app-staging` namespace on the same cluster — at no extra cost.

```bash
# Create the staging namespace
sed 's/app/app-staging/g' k8s/namespace.yaml | kubectl apply -f -

# Create the secret from a separate staging .env file (gitignored)
kubectl create secret generic app-staging-server-env \
  --from-file=.env=server/.env.staging \
  --namespace=app-staging \
  --dry-run=client -o yaml | kubectl apply -f -
```

In CI/CD add a job triggered on the `develop` branch:

```yaml
# GitHub Actions — add to .github/workflows/deploy.yml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/develop'
  steps:
    - name: Deploy server to staging
      run: |
        sed "s|ghcr.io/owner/app-server:latest|ghcr.io/owner/app-server:${{ github.sha }}|g" \
          k8s/server/deployment.yaml | kubectl apply -n app-staging -f -
        kubectl -n app-staging rollout status deployment/app-server --timeout=5m
```

```yaml
# GitLab CI — add to .gitlab-ci.yml
deploy-staging:
  stage: deploy
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
  script:
    - kubectl -n app-staging set image deployment/app-server app="${SERVER_IMAGE}:${CI_COMMIT_SHORT_SHA}"
    - kubectl -n app-staging rollout status deployment/app-server --timeout=5m
```

Use the subdomain `staging.yourdomain.com` for the staging ingress.

---

## 💡 Bonus: Uptime Kuma — uptime monitoring

Uptime Kuma is a self-hosted alternative to UptimeRobot.

**Recommended:** run it via `docker-compose.ops.yml` together with Rancher (see section 22 above):

```bash
# On the server
cd /opt && sudo docker compose -f docker-compose.ops.yml up -d uptime-kuma
```

Alternatively, standalone:

```bash
docker run -d \
  --name uptime-kuma \
  --restart=unless-stopped \
  -p 3001:3001 \
  -v /opt/uptime-kuma:/app/data \
  louislam/uptime-kuma:latest
```

Open `http://<SERVER_IP>:3001` and add monitors for:
- `https://yourdomain.com` — frontend
- `https://admin.yourdomain.com/health` — Laravel API
- `https://admin.yourdomain.com/admin` — admin panel

Sends notifications via Slack, email, Telegram, and many other channels.

> Secure port 3001 the same way as 8443 — restrict to your IP via UFW.

---

## 💡 Bonus: MinIO — self-hosted S3 for 2+ pods

When you want to scale to `replicas: 2+`, a PVC with `ReadWriteOnce` is not enough — two pods cannot write to the same volume simultaneously. The solution is **MinIO** — self-hosted storage compatible with the Amazon S3 API.

```
replicas: 2

Pod A ──► MinIO API (port 9000) ──► /data (PVC)
Pod B ──►
```

Both pods write to MinIO over HTTP — MinIO manages the disk itself.

### Deploying MinIO

```bash
# Secret (copy and fill in)
cp k8s/minio/secret.yaml.example k8s/minio/secret.yaml
# edit — set root-user and root-password (min. 8 characters)
kubectl apply -f k8s/minio/secret.yaml

# PVC + Deployment + Service
kubectl apply -f k8s/minio/pvc.yaml
kubectl apply -f k8s/minio/deployment.yaml
kubectl apply -f k8s/minio/service.yaml

# Check
kubectl -n app get pods | grep minio
# app-minio-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

### Create a bucket

MinIO has a web panel on port 9001. Create a temporary port-forward:

```bash
kubectl -n app port-forward svc/app-minio 9001:9001
```

Open `http://localhost:9001`, log in with the credentials from the secret, and create a bucket named `cms`.

Or via the CLI without the UI:

```bash
kubectl -n app exec deployment/app-minio -- \
  mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

kubectl -n app exec deployment/app-minio -- \
  mc mb local/cms
```

### Laravel configuration (.env)

```dotenv
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<root-user from secret>
AWS_SECRET_ACCESS_KEY=<root-password from secret>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=cms
AWS_ENDPOINT=http://app-minio.app.svc.cluster.local:9000
AWS_USE_PATH_STYLE_ENDPOINT=true   # required for MinIO
AWS_URL=https://admin.yourdomain.com/storage   # public URL via the Nginx proxy
```

> **Public file access:** MinIO runs inside the cluster. To make files publicly available, add an Ingress rule, or configure the MinIO bucket as public and expose port 9000 via Ingress on a separate subdomain (e.g. `storage.yourdomain.com`).

### Migrating from PVC to MinIO

If you already have files on the PVC and want to move them to MinIO:

```bash
# Copy files from the server pod to MinIO
kubectl -n app exec deployment/app-server -- \
  aws s3 sync storage/app/public s3://cms/public \
  --endpoint-url http://app-minio.app.svc.cluster.local:9000

# Then set FILESYSTEM_DISK=s3 in .env and restart
kubectl -n app rollout restart deployment/app-server
```

---

## Summary

You now have a full k3s cluster with:

- ✅ Automatic TLS (Let's Encrypt via cert-manager)
- ✅ HTTP → HTTPS redirect (Traefik)
- ✅ Zero-downtime deploys (rolling update with liveness + readiness probes)
- ✅ Migrations before deploy (Job with IMAGE_PLACEHOLDER substitution)
- ✅ Automatic restart on failure (Kubernetes)
- ✅ HPA — autoscaling under load
- ✅ CI/CD (GitHub Actions or GitLab) — linting (Pint, Rector, Larastan), tests, build, deploy
- ✅ Smart change detection — rebuild only what changed
- ✅ MySQL with persistent volume
- ✅ Redis with persistent volume
- ✅ Queue workers (2 replicas, hourly restart to prevent memory leaks)
- ✅ Daily MySQL backups
- ✅ Error tracking (GlitchTip)

All of it for ~$10–12/month on a Hetzner CX33.

---
