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
5. [Installing cert-manager (SSL Let's Encrypt)](#5-installing-cert-manager-ssl-lets-encrypt)
6. [Configuring Traefik (HTTPS + redirect)](#6-configuring-traefik-https--redirect)
7. [Cluster preparation — namespace and secrets](#7-cluster-preparation--namespace-and-secrets)
8. [Deploying the database and cache (MySQL + Redis)](#8-deploying-the-database-and-cache-mysql--redis)
9. [Deploying Gotenberg (PDF)](#9-deploying-gotenberg-pdf)
10. [Pull Secret for Container Registry (GHCR / GitLab)](#10-pull-secret-for-container-registry-ghcr--gitlab)
11. [Deploying the application (server + client)](#11-deploying-the-application-server--client)
12. [How Does CI/CD Connect to k3s?](#12-how-does-cicd-connect-to-k3s)
13. [Configuring GitHub Actions](#13-configuring-github-actions)
14. [Configuring GitLab CI/CD](#14-configuring-gitlab-cicd)
15. [First deployment via CI](#15-first-deployment-via-ci)
16. [Verification — is everything working?](#16-verification--is-everything-working)
17. [Day-to-day operations — logs, restarts, updates](#17-day-to-day-operations--logs-restarts-updates)
18. [MySQL backup](#18-mysql-backup)
19. [Common problems (troubleshooting)](#19-common-problems-troubleshooting)
20. [Rancher — cluster management via UI](#20-rancher--cluster-management-via-ui)
21. [Disk cleanup](#21-disk-cleanup)
22. [k9s — terminal management UI](#22-k9s--terminal-management-ui)
23. [Secret rotation — updating .env and passwords with no downtime](#23-secret-rotation--updating-env-and-passwords-with-no-downtime)

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
    ├──► cms-client (Next.js :3000)       ← public frontend
    │
    └──► cms-server (Laravel/Nginx :80)   ← API + admin panel
              │
              ├── cms-mysql (MySQL 8)     ← StatefulSet + PVC
              ├── cms-redis (Redis 7)     ← Deployment + PVC
              └── cms-gotenberg           ← PDF generation
```

Everything runs in the `cms-prod` namespace. MySQL and Redis have persistent volumes on the server disk (k3s `local-path` storage class). Docker images are built by GitLab CI and pushed to GitLab Container Registry.

---

## 3. Server setup (Hetzner)

### 3.1 Create the server

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

### 3.2 Log in and update the system

```bash
ssh root@<SERVER_IP>

apt update && apt upgrade -y
apt install -y curl wget git htop vim
```

### 3.3 Set the hostname

```bash
hostnamectl set-hostname cms-prod
echo "127.0.0.1 cms-prod" >> /etc/hosts
```

### 3.4 DNS configuration

In your domain registrar's panel, create A records:

```
yourdomain.com        A  <SERVER_IP>
www.yourdomain.com    A  <SERVER_IP>
api.yourdomain.com    A  <SERVER_IP>
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

```bash
curl -sfL https://get.k3s.io | sh -s - --disable=servicelb
```

> **Why only disable servicelb?**  
> `servicelb` is k3s's built-in load balancer — we disable it because Traefik handles incoming traffic directly. We do **not** disable Traefik — k3s installs it automatically, and the `HelmChartConfig` from section 4.3 will tune its configuration (HTTP→HTTPS redirect).

Wait ~30 seconds, then verify:

```bash
kubectl get nodes
# NAME       STATUS   ROLES                  AGE   VERSION
# cms-prod   Ready    control-plane,master   1m    v1.31.x+k3s1
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
# cms-prod   Ready   control-plane,master   2m
```

> **Add to ~/.bashrc or ~/.zshrc:**  
> `export KUBECONFIG=~/.kube/config-hetzner`  
> so you don't have to set it every time.

### 4.3 Install Traefik and ServiceLB via Helm

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

**Step 2** — now apply the Middleware (requires Traefik CRDs):

```bash
kubectl apply -f k8s/traefik/middleware.yaml
```

> **Why two steps?** `Middleware` is a Traefik CRD resource. If you apply it before Traefik is installed, kubectl returns `no matches for kind "Middleware"` — because the CRD doesn't exist yet.

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

The file `k8s/traefik/config.yaml` contains two things:

1. **HelmChartConfig** — configures Traefik to automatically redirect HTTP (port 80) to HTTPS (port 443)
2. **Middleware** — sets the request body size limit to 100 MB (needed for file uploads)

If you applied this file earlier, Traefik is already configured. Verify:

```bash
kubectl -n kube-system get helmchartconfig traefik
# NAME      AGE
# traefik   5m
```

---

## 7. Cluster preparation — namespace and secrets

> **Note on namespace name:** Examples throughout this guide use `cms-prod` as the namespace. Replace it with your own — e.g. `my-blog-prod`, `shop-prod`, `api-prod`. Use it consistently in all YAML files and `kubectl -n` commands.

### 7.1 Create the namespace

A namespace is an isolated space in the cluster — like a separate folder for our application.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespace cms-prod
# NAME       STATUS   AGE
# cms-prod   Active   5s
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
> The pipeline automatically creates and updates this secret from the `PROD_ENV` variable on every deployment (step 0 in the pipeline). Manual creation is only needed if you want to run the app before the first CI/CD run.

If you want to configure the secret manually (e.g. before the first CI/CD run), use the `server/.env.production.example` template:

```bash
# Fill in server/.env.production.example with your values, then:
kubectl create secret generic cms-server-env \
  --from-file=.env=server/.env.production \
  --namespace=cms-prod \
  --dry-run=client -o yaml | kubectl apply -f -
```

> **Where do I get APP_KEY?**  
> `docker compose exec php php artisan key:generate --show`

### 7.5 Next.js client secret

This secret contains the internal API URL used by Next.js server-side fetches (bypassing the public internet). **CI/CD does not create this** — required once, manually.

```bash
kubectl apply -f k8s/client/secret.yaml.example
# API_URL=http://cms-server.cms-prod.svc.cluster.local  (value is already correct)
```

---

## 8. Deploying the database and cache (MySQL + Redis)

### 8.1 MySQL

```bash
kubectl apply -f k8s/mysql/statefulset.yaml
kubectl apply -f k8s/mysql/service.yaml
```

Wait until MySQL is ready:

```bash
kubectl -n cms-prod get pods --watch
# NAME           READY   STATUS    RESTARTS   AGE
# cms-mysql-0    1/1     Running   0          2m
```

> **Why StatefulSet instead of Deployment?**  
> A StatefulSet guarantees a stable pod name (`cms-mysql-0`) and startup order. For databases this matters — the DNS `cms-mysql-0.cms-mysql.cms-prod.svc.cluster.local` always points to the same instance.

Verify MySQL is working:

```bash
kubectl -n cms-prod exec -it cms-mysql-0 -- mysql -u root -p
# Enter password: <root-password from the secret>
# mysql> SHOW DATABASES;
```

### 8.2 Redis

```bash
kubectl apply -f k8s/redis/pvc.yaml
kubectl apply -f k8s/redis/deployment.yaml
kubectl apply -f k8s/redis/service.yaml

kubectl -n cms-prod get pods | grep redis
# cms-redis-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

Test the connection:

```bash
kubectl -n cms-prod exec -it deployment/cms-redis -- redis-cli -a <REDIS_PASSWORD> ping
# PONG
```

---

## 9. Deploying Gotenberg (PDF)

Gotenberg is a microservice for generating PDFs from HTML. We deploy it as a separate pod, accessible only inside the cluster.

```bash
kubectl apply -f k8s/gotenberg/deployment.yaml
kubectl apply -f k8s/gotenberg/service.yaml

kubectl -n cms-prod get pods | grep gotenberg
# cms-gotenberg-xxxxxxxxx-xxxxx   1/1   Running   0   30s
```

---

## 10. Pull Secret for Container Registry (GHCR / GitLab)

Your cluster needs to know how to pull private Docker images. The configuration depends on which CI/CD system you are using.

> **Important:** The secret name `ghcr-pull-secret` is the same in both cases — the deployment manifests (`k8s/server/deployment.yaml`, `k8s/client/deployment.yaml`) already use this name. Do not change it.

### 10.1 GitHub Container Registry (GHCR)

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
  --namespace=cms-prod
```

### 10.2 GitLab Container Registry

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
  --namespace=cms-prod
```

---

## 11. Deploying the application (server + client)

Before the first CI/CD deploy we need to manually apply the infrastructure manifests. Docker images will be built by the pipeline — for now we use `:latest` (after the first CI push).

### 11.1 Persistent storage for uploads and logs

Before starting the server, create a PVC (PersistentVolumeClaim) — a volume on the VPS disk that will store uploaded files and Laravel logs.

```bash
kubectl apply -f k8s/server/pvc-storage.yaml
```

Check that the PVC is ready:

```bash
kubectl -n cms-prod get pvc
# NAME                 STATUS   VOLUME         CAPACITY   STORAGECLASS
# cms-server-storage   Bound    pvc-xxxxxxxx   20Gi       local-path
```

`STATUS: Bound` means the volume is ready. `local-path` is k3s's built-in mechanism for storing data on the local VPS disk.

> **What does the PVC store?**
> ```
> PVC (20Gi on VPS disk)
>   ├── storage/app/    ← uploaded files (images, PDFs, attachments)
>   └── storage/logs/   ← Laravel logs (when LOG_CHANNEL=daily or stack)
> ```
> Data survives pod restarts and deploys. It is only lost if you manually delete the PVC.

In your production `.env` set:

```dotenv
FILESYSTEM_DISK=public   # files on local disk (via PVC)
LOG_CHANNEL=stderr       # logs to kubectl logs (most convenient in k8s)
# LOG_CHANNEL=stack      # or both: stderr + file
# LOG_STACK=stderr,daily
```

> **PVC limitation:** works only with `replicas: 1`. When scaling to 2+ pods, switch to MinIO — see the bonus section at the end of this guide.

### 11.2 Deploying the servers

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
kubectl -n cms-prod get all
```

You should see:

```
NAME                               READY   STATUS
pod/cms-server-xxxxxxxxx-xxxxx     1/1     Running
pod/cms-queue-xxxxxxxxx-xxxxx      1/1     Running
pod/cms-client-xxxxxxxxx-xxxxx     1/1     Running
pod/cms-mysql-0                    1/1     Running
pod/cms-redis-xxxxxxxxx-xxxxx      1/1     Running
pod/cms-gotenberg-xxxxxxxxx-xxxxx  1/1     Running

NAME                TYPE        CLUSTER-IP
service/cms-server  ClusterIP   10.43.x.x
service/cms-client  ClusterIP   10.43.x.x
service/cms-mysql   ClusterIP   None
service/cms-redis   ClusterIP   10.43.x.x
service/cms-gotenberg ClusterIP 10.43.x.x
```

---

## 12. How Does CI/CD Connect to k3s?

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
                                    "change image in deployment to :abc1234"
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

Copy the entire output (starts with `apiVersion: v1`) and paste it as the secret `KUBECONFIG_PROD` (GitHub) or `KUBECONFIG` (GitLab). Both support multiline values — **do not base64-encode it**.

> **Make sure** the kubeconfig points to the server's public IP (not `127.0.0.1`). If you copied it with the command from section 4.2 (with `sed`), it's already correct.

### What port do you need to open on the server?

```bash
# Hetzner firewall (Cloud panel) or UFW — open port 6443
ufw allow 6443/tcp comment "k8s API for CI/CD"
```

Port 22 (SSH) can remain restricted to your IP only — CI/CD no longer needs it.

---

## 13. Configuring GitHub Actions

The repository contains a `.github/workflows/deploy.yml` file with a complete pipeline. You only need to configure variables in GitHub.

### 13.1 Secrets and Variables

In GitHub: **Settings → Secrets and variables → Actions → Secrets / Variables**

#### Secrets (write-only, masked in logs)

| Secret            | Description                                       |
|-------------------|---------------------------------------------------|
| `KUBECONFIG_PROD` | Raw kubeconfig content — see section 12           |

```bash
# How to get the value (no base64):
cat ~/.kube/config-hetzner
```

#### Variables (visible and editable in the UI)

| Variable               | Example                               | Description                          |
|------------------------|---------------------------------------|--------------------------------------|
| `PROD_ENV`             | *(full content of production .env)*   | Automatically synced to k8s Secret   |
| `NEXT_PUBLIC_API_URL`  | `https://api.yourdomain.com`          | Build-time variable for Next.js      |
| `NEXT_PUBLIC_APP_NAME` | `MyCMS`                               | Build-time variable for Next.js      |

> **Why `PROD_ENV` as a Variable, not a Secret?**  
> Secrets are write-only — once saved you can't read or edit them line by line. Variables are visible in the UI, so you can easily check what's set. The pipeline syncs the value to a k8s Secret before deploying anyway.

#### How to set PROD_ENV

The value is literally the contents of your `server/.env.production`:

```dotenv
APP_NAME="MyCMS"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_HOST=cms-mysql.cms-prod.svc.cluster.local
DB_PASSWORD=SuperSecretPassword456!

REDIS_HOST=cms-redis.cms-prod.svc.cluster.local
REDIS_PASSWORD=SuperSecretRedisPassword789!

GOTENBERG_URL=http://cms-gotenberg.cms-prod.svc.cluster.local:3000
...
```

GitHub supports multiline Variables — paste the entire content.

### 13.2 How the pipeline works

```
push → master/main
        │
        ├── lint-server    (Pint, Rector, PHPStan, ESLint, Prettier)
        ├── lint-client    (TypeScript, ESLint, Prettier)
        ├── security       (composer audit, npm audit)
        ├── test           (Pest PHP — matrix 8.4 + 8.5)
        │
        ├── build-server   → ghcr.io/<owner>/cms-server:abc1234
        ├── build-client   → ghcr.io/<owner>/cms-client:abc1234
        │
        └── deploy
              ├── 0. kubectl create secret cms-server-env (sync PROD_ENV)
              ├── 1. kubectl apply job-migrate (DB migrations, wait 2 min)
              ├── 2. kubectl set image deployment/cms-server
              ├── 3. kubectl set image deployment/cms-queue
              ├── 4. kubectl set image cronjob/cms-scheduler
              └── 5. kubectl set image deployment/cms-client
```

Each deploy:
1. First updates the k8s Secret from `PROD_ENV` — no restart needed for migrations
2. Runs `php artisan migrate --force` as a one-off Job with the **new** image
3. Waits for it to complete (max 2 minutes)
4. Only then performs the rolling update of deployments

This means migrations always run before new code — no more "column does not exist".

### 13.3 No registry server required

GitHub Container Registry (GHCR) is built into GitHub — you don't need to configure any external registry. The pipeline automatically authenticates using `GITHUB_TOKEN` (available automatically in every workflow).

---

## 14. Configuring GitLab CI/CD

The repository contains a `.gitlab-ci.yml` file with a complete pipeline. You only need to configure variables.

### 14.1 CI/CD variables

In GitLab: **Settings → CI/CD → Variables → Add variable**

#### Required variables

| Variable               | Type     | Masked | Protected | Description                              |
|------------------------|----------|--------|-----------|------------------------------------------|
| `KUBECONFIG`           | Variable | ✅      | ✅         | Raw kubeconfig content — see section 12  |
| `SERVER_ENV`           | Variable | ✅      | ✅         | Full content of `server/.env.production` |
| `NEXT_PUBLIC_API_URL`  | Variable | ❌      | ❌         | `https://api.yourdomain.com`             |
| `NEXT_PUBLIC_APP_NAME` | Variable | ❌      | ❌         | Your application name                    |

**You don't need** to set registry variables — GitLab provides them automatically:
- `CI_REGISTRY` — registry address
- `CI_REGISTRY_USER` — username
- `CI_REGISTRY_PASSWORD` — password

#### How to get KUBECONFIG

On your local machine (where kubectl is configured):

```bash
cat ~/.kube/config-hetzner
```

Copy the entire output and paste it as the value of the `KUBECONFIG` variable in GitLab. **Do not base64-encode it** — GitLab supports multiline values natively.

#### How to get SERVER_ENV

The value of `SERVER_ENV` is literally the contents of your `server/.env.production`:

```dotenv
APP_NAME="MyCMS"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
...
```

Paste the entire content as the variable value (GitLab supports multiline variables).

### 14.2 How the pipeline works

```
push → master
        │
        ├── lint-server    (Pint, Rector, PHPStan, ESLint, Prettier)
        ├── lint-client    (TypeScript, ESLint, Prettier)
        ├── security       (composer audit, npm audit)
        ├── test           (Pest PHP)
        │
        ├── build-server   → registry.gitlab.com/.../server:abc1234
        ├── build-client   → registry.gitlab.com/.../client:abc1234
        │
        └── deploy
              ├── 1. kubectl apply job-migrate (DB migrations)
              ├── 2. kubectl set image deployment/cms-server
              ├── 3. kubectl set image deployment/cms-queue
              ├── 4. kubectl set image cronjob/cms-scheduler
              └── 5. kubectl set image deployment/cms-client
```

Each deploy:
1. First runs `php artisan migrate --force` as a one-off Job
2. Waits for it to complete (max 2 minutes)
3. Only then performs the rolling update of deployments

This means migrations always run before new code — no more "column does not exist".

---

## 15. First deployment via CI

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
kubectl -n cms-prod get pods
kubectl -n cms-prod get ingress
```

Check the TLS certificate:

```bash
kubectl -n cms-prod describe certificate cms-tls
# Status: True (Ready)
```

Open a browser and visit:
- `https://yourdomain.com` — Next.js frontend
- `https://api.yourdomain.com/admin` — admin panel
- `https://api.yourdomain.com/health` — Laravel health check (should return `{"status":"ok"}`)

---

## 16. Verification — is everything working?

### Post-deployment checklist

```bash
# All pods Running
kubectl -n cms-prod get pods

# TLS certificate issued
kubectl -n cms-prod get certificate
# NAME      READY   SECRET    AGE
# cms-tls   True    cms-tls   5m

# Ingress has an IP address
kubectl -n cms-prod get ingress
# NAME          CLASS     HOSTS              ADDRESS       PORTS
# cms-ingress   traefik   yourdomain.com...  <IP>          80, 443

# Laravel responds
curl -s https://api.yourdomain.com/health
# {"status":"ok","timestamp":"..."}

# Frontend responds
curl -I https://yourdomain.com
# HTTP/2 200

# Migrations ran
kubectl -n cms-prod exec -it deployment/cms-server -- \
  php artisan migrate:status | tail -5

# Queue workers are running
kubectl -n cms-prod logs deployment/cms-queue --tail=20
```

### Upload test

Log in to the admin panel and try uploading an image — this verifies MySQL, storage (S3/R2), and nginx body size limit.

---

## 17. Day-to-day operations — logs, restarts, updates

### Viewing logs

```bash
# Live logs for a deployment
kubectl -n cms-prod logs -f deployment/cms-server

# Queue worker logs
kubectl -n cms-prod logs -f deployment/cms-queue

# Logs from the previous pod (after a restart)
kubectl -n cms-prod logs deployment/cms-server --previous

# Logs from the last hour
kubectl -n cms-prod logs deployment/cms-server --since=1h
```

### Restarting a pod / deployment

```bash
# Rolling restart of a deployment (creates new pods one by one)
kubectl -n cms-prod rollout restart deployment/cms-server

# Force restart a specific pod (Kubernetes replaces it with a new one)
kubectl -n cms-prod delete pod <pod-name>
```

### Getting a shell inside a container (like docker exec)

```bash
kubectl -n cms-prod exec -it deployment/cms-server -- bash

# Inside:
php artisan tinker
php artisan cache:clear
php artisan queue:restart
```

### Checking resource usage (CPU / RAM)

```bash
kubectl -n cms-prod top pods
# NAME                        CPU(cores)   MEMORY(bytes)
# cms-server-xxx              45m          210Mi
# cms-queue-xxx               12m          128Mi
# cms-client-xxx              8m           95Mi
# cms-mysql-0                 35m          480Mi
# cms-redis-xxx               3m           28Mi
```

### Rolling back a deployment

If a new version breaks something critical:

```bash
# Check the rollout history
kubectl -n cms-prod rollout history deployment/cms-server

# Roll back to the previous version
kubectl -n cms-prod rollout undo deployment/cms-server

# Roll back to a specific revision
kubectl -n cms-prod rollout undo deployment/cms-server --to-revision=2
```

### Updating k3s

```bash
# On the server
curl -sfL https://get.k3s.io | sh -
# k3s detects the existing installation and updates itself
```

---

## 18. MySQL backup

MySQL runs on a PersistentVolume — data is stored on the server's disk. Don't rely on that alone, though!

### Manual backup

```bash
kubectl -n cms-prod exec cms-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASSWORD> cms \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automatic backup via CronJob

Create a file `k8s/mysql/cronjob-backup.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cms-mysql-backup
  namespace: cms-prod
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
                  mysqldump -h cms-mysql -u root -p$MYSQL_ROOT_PASSWORD cms \
                    | gzip > /backup/cms_$(date +%Y%m%d_%H%M%S).sql.gz
                  # Delete backups older than 7 days
                  find /backup -name "*.sql.gz" -mtime +7 -delete
              env:
                - name: MYSQL_ROOT_PASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: cms-mysql
                      key: root-password
              volumeMounts:
                - name: backup
                  mountPath: /backup
          volumes:
            - name: backup
              hostPath:
                path: /opt/cms-backups    # directory on the server
                type: DirectoryOrCreate
          restartPolicy: OnFailure
```

```bash
# Create the directory on the server
mkdir -p /opt/cms-backups

# Apply the CronJob
kubectl apply -f k8s/mysql/cronjob-backup.yaml
```

> **Recommendation:** Also sync `/opt/cms-backups` to external storage (e.g. Hetzner Object Storage, Backblaze B2) using `rclone`.

---

## 19. Common problems (troubleshooting)

### Pod stuck in `Pending`

```bash
kubectl -n cms-prod describe pod <pod-name>
```

Look for the `Events` section at the bottom. Common causes:
- `Insufficient memory` — not enough RAM on the node
- `ImagePullBackOff` — wrong pull secret or incorrect image address
- `PVC not bound` — storage class issue

### `ImagePullBackOff` — can't pull the image

```bash
kubectl -n cms-prod get secret ghcr-pull-secret -o yaml
# Check if the secret exists

# Check if the deploy token is active in GitLab
# Settings → Repository → Deploy tokens
```

Recreate the secret:

```bash
kubectl -n cms-prod delete secret ghcr-pull-secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<new-token-username> \
  --docker-password=<new-token-password> \
  --namespace=cms-prod
```

### TLS certificate not issued

```bash
kubectl -n cms-prod describe certificate cms-tls
kubectl -n cert-manager logs deployment/cert-manager | grep ERROR
```

Common causes:
- DNS hasn't propagated yet (wait 15 min)
- Port 80 is blocked by the firewall (Let's Encrypt uses HTTP challenge)
- You've hit Let's Encrypt's rate limit (5 certificates per week per domain)

### Laravel returning 500

```bash
kubectl -n cms-prod logs deployment/cms-server --tail=50
kubectl -n cms-prod exec -it deployment/cms-server -- cat storage/logs/laravel.log | tail -50
```

### Migration failed

```bash
# Check logs of the finished job
kubectl -n cms-prod get jobs
kubectl -n cms-prod logs job/cms-migrate-<SHA>
```

### No connection to MySQL

```bash
# Test from the server pod
kubectl -n cms-prod exec -it deployment/cms-server -- \
  php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';"
```

Check that `DB_HOST` in the secret matches `cms-mysql.cms-prod.svc.cluster.local`.

### HPA not scaling

```bash
kubectl -n cms-prod get hpa
# If TARGETS = <unknown>/70% — metrics-server isn't working

# Check if metrics-server is installed
kubectl -n kube-system get deployment metrics-server
```

If metrics-server is missing — install it:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 20. Rancher — cluster management via UI

If you use Rancher at work, you can run it on the same VPS. You'll get the exact same environment — pod overview, logs, shell into containers, secret management — all from the browser.

### 20.1 Installing Rancher

Rancher runs as a Docker container — independently from k3s. On the server:

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

### 20.2 First login

Get the bootstrap password:

```bash
docker logs rancher 2>&1 | grep "Bootstrap Password"
```

Log in and set a new password.

### 20.3 Import the k3s cluster

1. In Rancher click **Import Existing** → **Generic**
2. Give the cluster a name, e.g. `cms-prod`
3. Rancher will generate a `kubectl apply` command — run it on the server:

```bash
kubectl apply -f https://<RANCHER_IP>:8443/v3/import/xxxxx.yaml
```

After ~1 minute the cluster will appear in Rancher with status `Active`.

### 20.4 What you can do in the UI

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

### 20.5 Securing the Rancher panel

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

## 21. Disk cleanup

k3s accumulates old container images with every deployment. After a few months you can lose tens of gigabytes — worth automating.

### 21.1 Check disk usage

```bash
df -h /

# How much k3s (containerd) images are taking
du -sh /var/lib/rancher/k3s/agent/containerd/
```

### 21.2 Manual cleanup

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

### 21.3 Automatic cleanup — CronJob

```bash
kubectl apply -f k8s/maintenance/cronjob-image-cleanup.yaml
```

The CronJob runs every Sunday at 2:00 AM and removes unused images from `containerd`.

---

## 22. k9s — terminal management UI

k9s is a terminal UI for Kubernetes — like Rancher, but in the console. Useful when you're already connected via SSH and don't want to open a browser.

### 22.1 Installation

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

### 22.2 Running k9s

```bash
k9s
# or jump directly into a specific namespace
k9s -n cms-prod
```

### 22.3 Key shortcuts

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

## 23. Secret rotation — updating .env and passwords with no downtime

### 23.1 Updating the Laravel .env

Edit `k8s/server/secret.yaml`, then:

```bash
kubectl apply -f k8s/server/secret.yaml

# Rolling restart — new pods start with the new secret before old ones stop
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

### 23.2 Changing the MySQL password

**Step 1** — change the password in the database:

```bash
kubectl -n cms-prod exec -it cms-mysql-0 -- mysql -u root -p<OLD_PASSWORD>
```

```sql
ALTER USER 'cms'@'%' IDENTIFIED BY 'NewPassword123!';
FLUSH PRIVILEGES;
EXIT;
```

**Step 2** — update both secrets and restart:

```bash
# Update k8s/mysql/secret.yaml and k8s/server/secret.yaml
kubectl apply -f k8s/mysql/secret.yaml
kubectl apply -f k8s/server/secret.yaml
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

### 23.3 Changing the Redis password

```bash
# Update k8s/redis/secret.yaml and k8s/server/secret.yaml (REDIS_PASSWORD)
kubectl apply -f k8s/redis/secret.yaml
kubectl apply -f k8s/server/secret.yaml

kubectl -n cms-prod rollout restart deployment/cms-redis
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

> **Note:** Restarting Redis clears all cache and sessions — users will be logged out. Plan the rotation outside peak hours.

---

## 💡 Bonus: Staging namespace

You can run a staging environment in a separate `cms-staging` namespace on the same cluster — at no extra cost.

```bash
# Create the staging namespace
sed 's/cms-prod/cms-staging/g' k8s/namespace.yaml | kubectl apply -f -

# Apply secrets with staging values
sed 's/cms-prod/cms-staging/g' k8s/server/secret.yaml | kubectl apply -f -
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
        kubectl -n cms-staging set image deployment/cms-server \
          app="ghcr.io/${{ github.repository_owner }}/cms-server:${{ github.sha }}"
        kubectl -n cms-staging rollout status deployment/cms-server --timeout=5m
```

```yaml
# GitLab CI — add to .gitlab-ci.yml
deploy-staging:
  stage: deploy
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
  script:
    - kubectl -n cms-staging set image deployment/cms-server app="${SERVER_IMAGE}:${CI_COMMIT_SHORT_SHA}"
    - kubectl -n cms-staging rollout status deployment/cms-server --timeout=5m
```

Use the subdomain `staging.yourdomain.com` for the staging ingress.

---

## 💡 Bonus: Uptime Kuma — uptime monitoring

Uptime Kuma is a self-hosted alternative to UptimeRobot. It runs as a Docker container alongside Rancher:

```bash
docker run -d \
  --name uptime-kuma \
  --restart=unless-stopped \
  -p 3001:3001 \
  -v /opt/uptime-kuma:/app/data \
  louislam/uptime-kuma:latest
```

Open `https://<SERVER_IP>:3001` and add monitors for:
- `https://yourdomain.com` — frontend
- `https://api.yourdomain.com/health` — Laravel API
- `https://api.yourdomain.com/admin` — admin panel

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
kubectl -n cms-prod get pods | grep minio
# cms-minio-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

### Create a bucket

MinIO has a web console on port 9001. Create a temporary port-forward:

```bash
kubectl -n cms-prod port-forward svc/cms-minio 9001:9001
```

Open `http://localhost:9001`, log in with the credentials from the secret, and create a bucket named `cms`.

Or via CLI without the UI:

```bash
kubectl -n cms-prod exec deployment/cms-minio -- \
  mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

kubectl -n cms-prod exec deployment/cms-minio -- \
  mc mb local/cms
```

### Laravel configuration (.env)

```dotenv
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<root-user from secret>
AWS_SECRET_ACCESS_KEY=<root-password from secret>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=cms
AWS_ENDPOINT=http://cms-minio.cms-prod.svc.cluster.local:9000
AWS_USE_PATH_STYLE_ENDPOINT=true   # required for MinIO
AWS_URL=https://api.yourdomain.com/storage   # public URL via Nginx proxy
```

> **Public file access:** MinIO runs inside the cluster. To make files publicly accessible, add a rule to the Ingress or configure the MinIO bucket as public and expose port 9000 via Ingress on a separate subdomain (e.g. `storage.yourdomain.com`).

### Migrating from PVC to MinIO

If you already have files on the PVC and want to move them to MinIO:

```bash
# Copy files from the server pod to MinIO
kubectl -n cms-prod exec deployment/cms-server -- \
  aws s3 sync storage/app/public s3://cms/public \
  --endpoint-url http://cms-minio.cms-prod.svc.cluster.local:9000

# Then change FILESYSTEM_DISK=s3 in .env and restart
kubectl -n cms-prod rollout restart deployment/cms-server
```

---

## Summary

You now have a full k3s cluster with:

- ✅ Automatic TLS (Let's Encrypt via cert-manager)
- ✅ HTTP → HTTPS redirect (Traefik)
- ✅ Zero-downtime deploys (rolling update)
- ✅ Migrations before deploy (Job)
- ✅ Automatic restart on failure (Kubernetes)
- ✅ HPA — autoscaling under load
- ✅ CI/CD (GitHub Actions or GitLab) — linting, tests, build, deploy
- ✅ MySQL with persistent volume
- ✅ Redis with persistent volume
- ✅ Daily MySQL backups

All of it for ~$10–12/month on a Hetzner CX33.

---
