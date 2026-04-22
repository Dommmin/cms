# Wdrożenie aplikacji Laravel + Next.js na k3s — kompletny przewodnik

> **Poziom:** Junior / Mid · **Wymagania wstępne:** Docker, podstawy CLI, własna domena  
> **Czas czytania:** ~30 min · **Czas wdrożenia:** ~2 godz. (przy pierwszym razie)

---

Jeśli do tej pory wdrażałeś aplikacje przez `docker-compose up` na VPS i zastanawiasz się, kiedy i jak przejść na Kubernetes — ten artykuł jest dla Ciebie. Pokażę Ci, jak wdrożyć pełny stack (Laravel API + admin SPA, Next.js frontend, MySQL, Redis, Gotenberg PDF) na **k3s** — lekkim Kubernetes idealnym na pojedynczy VPS.

Nie zakładam, że znasz Kubernetes. Zakładam, że znasz Dockera i nie boisz się terminala.

---

## Spis treści

1. [Czym jest k3s i dlaczego nie zwykły k8s?](#1-czym-jest-k3s-i-dlaczego-nie-zwykły-k8s)
2. [Architektura tego wdrożenia](#2-architektura-tego-wdrożenia)
3. [Przygotowanie serwera (Hetzner)](#3-przygotowanie-serwera-hetzner)
4. [Instalacja k3s](#4-instalacja-k3s)
5. [Instalacja cert-manager (SSL Let's Encrypt)](#5-instalacja-cert-manager-ssl-lets-encrypt)
6. [Konfiguracja Traefik (HTTPS + przekierowanie)](#6-konfiguracja-traefik-https--przekierowanie)
7. [Przygotowanie klastra — namespace i sekrety](#7-przygotowanie-klastra--namespace-i-sekrety)
8. [Wdrożenie bazy danych i cache (MySQL + Redis)](#8-wdrożenie-bazy-danych-i-cache-mysql--redis)
9. [Wdrożenie Gotenberg (PDF)](#9-wdrożenie-gotenberg-pdf)
10. [Pull Secret dla GitLab Container Registry](#10-pull-secret-dla-gitlab-container-registry)
11. [Wdrożenie aplikacji (serwer + klient)](#11-wdrożenie-aplikacji-serwer--klient)
12. [Konfiguracja GitLab CI/CD](#12-konfiguracja-gitlab-cicd)
13. [Pierwsze wdrożenie przez CI](#13-pierwsze-wdrożenie-przez-ci)
14. [Weryfikacja — czy wszystko działa?](#14-weryfikacja--czy-wszystko-działa)
15. [Codzienna obsługa — logi, restarty, aktualizacje](#15-codzienna-obsługa--logi-restarty-aktualizacje)
16. [Backup MySQL](#16-backup-mysql)
17. [Najczęstsze problemy (troubleshooting)](#17-najczęstsze-problemy-troubleshooting)

---

## 1. Czym jest k3s i dlaczego nie zwykły k8s?

**Kubernetes (k8s)** to system orkiestracji kontenerów — mówisz mu *co* chcesz uruchomić, a on pilnuje, żeby to działało. Jeśli kontener padnie, Kubernetes go restartuje. Chcesz zaktualizować aplikację bez przestoju? Kubernetes zaktualizuje po jednym podzie na raz.

**k3s** to Kubernetes odchudzony do minimum przez Rancher Labs (teraz SUSE). Usuwa zbędne sterowniki chmurowe, zastępuje `etcd` lżejszą bazą SQLite (albo embedded etcd dla HA), pakuje wszystko w jeden binarny plik ~70 MB. API jest **w 100% kompatybilne** z pełnym k8s — te same manifesty YAML, ten sam `kubectl`.

### Porównanie zasobów

|                          | Pełny k8s (kubeadm) | k3s       |
|--------------------------|---------------------|-----------|
| RAM samego control plane | ~2 GB               | ~512 MB   |
| Instalacja               | ~30 kroków          | 1 komenda |
| Wymagany serwer          | min. 4 węzły        | 1 węzeł   |
| Kompatybilność z k8s     | 100%                | 100%      |

Na pojedynczym VPS z 8 GB RAM k3s to jedyna rozsądna opcja.

### Dlaczego nie docker-compose?

Docker Compose sprawdza się świetnie na lokalnym środowisku. Na produkcji brakuje mu jednak:

- **Automatycznego restartu** po OOM lub crashu kontenera z logiką retry/backoff
- **Zero-downtime deployów** — `docker-compose up` zatrzymuje kontener zanim uruchomi nowy
- **Health check gate** — Kubernetes nie przekieruje ruchu do poda, dopóki nie odpowie `/health`
- **Migracji przed deployem** — możesz uruchomić Job z migracją i poczekać na jego zakończenie przed rolloutem
- **Rollback** jedną komendą

---

## 2. Architektura tego wdrożenia

```
Internet
    │
    ▼
[ Traefik ] ← wbudowany w k3s, zajmuje się TLS + routing
    │
    ├──► cms-client (Next.js :3000)       ← publiczny frontend
    │
    └──► cms-server (Laravel/Nginx :80)   ← API + admin panel
              │
              ├── cms-mysql (MySQL 8)     ← StatefulSet + PVC
              ├── cms-redis (Redis 7)     ← Deployment + PVC
              └── cms-gotenberg           ← generowanie PDF
```

Wszystko działa w namespace `cms-prod`. MySQL i Redis mają persystentne wolumeny na dysku serwera (k3s `local-path` storage class). Obrazy Docker buduje GitLab CI i pushuje do GitLab Container Registry.

---

## 3. Przygotowanie serwera (Hetzner)

### 3.1 Utwórz serwer

W panelu Hetzner Cloud ([console.hetzner.cloud](https://console.hetzner.cloud)):

1. **Location:** Falkenstein (Europa — niskie ping z Polski)
2. **Image:** Ubuntu 24.04 LTS
3. **Type:** CX33 (4 vCPU, 8 GB RAM, 80 GB NVMe) — ~$10/mc
4. **Networking:** Włącz publiczne IPv4 + IPv6
5. **SSH key:** Wklej swój klucz publiczny (`cat ~/.ssh/id_ed25519.pub`)
6. **Firewall:** Utwórz nowy z regułami:

| Typ     | Protokół | Port | Źródło                                     |
|---------|----------|------|--------------------------------------------|
| Inbound | TCP      | 22   | Twój IP (lub `0.0.0.0/0` jeśli dynamiczny) |
| Inbound | TCP      | 80   | `0.0.0.0/0`, `::/0`                        |
| Inbound | TCP      | 443  | `0.0.0.0/0`, `::/0`                        |
| Inbound | TCP      | 6443 | Twój IP (kubectl API)                      |

> Port 6443 to API serwera Kubernetes. Ogranicz go do swojego IP — nie ma powodu, żeby był publiczny.

### 3.2 Zaloguj się i zaktualizuj system

```bash
ssh root@<IP_SERWERA>

apt update && apt upgrade -y
apt install -y curl wget git htop vim
```

### 3.3 Ustaw hostname

```bash
hostnamectl set-hostname cms-prod
echo "127.0.0.1 cms-prod" >> /etc/hosts
```

### 3.4 Konfiguracja DNS

W panelu swojego rejestratora domen ustaw rekordy A:

```
yourdomain.com        A  <IP_SERWERA>
www.yourdomain.com    A  <IP_SERWERA>
api.yourdomain.com    A  <IP_SERWERA>
```

Poczekaj ~5-15 minut na propagację DNS. Możesz sprawdzić:

```bash
dig +short yourdomain.com
# powinno zwrócić IP serwera
```

---

## 4. Instalacja k3s

### 4.1 Zainstaluj k3s

Na serwerze uruchom jedną komendę:

```bash
curl -sfL https://get.k3s.io | sh -s - \
  --disable=servicelb \
  --disable=traefik
```

> **Dlaczego wyłączamy traefik i servicelb?**  
> Wyłączamy je tu, żeby zainstalować je przez Helm z własną konfiguracją (HTTP→HTTPS redirect, body size limit). k3s za chwilę zainstaluje je sam przez HelmChartConfig.

Poczekaj ~30 sekund, a następnie sprawdź:

```bash
kubectl get nodes
# NAME       STATUS   ROLES                  AGE   VERSION
# cms-prod   Ready    control-plane,master   1m    v1.31.x+k3s1
```

Status `Ready` — jesteś w domu.

### 4.2 Skopiuj kubeconfig na lokalny komputer

Na **lokalnym komputerze** (nie na serwerze):

```bash
mkdir -p ~/.kube

# Kopiuje config z serwera i podmienia adres na publiczny IP
ssh root@<IP_SERWERA> "cat /etc/rancher/k3s/k3s.yaml" \
  | sed "s/127.0.0.1/<IP_SERWERA>/g" \
  > ~/.kube/config-hetzner

chmod 600 ~/.kube/config-hetzner
export KUBECONFIG=~/.kube/config-hetzner
```

Teraz możesz sterować klastrem z lokalnego komputera:

```bash
kubectl get nodes
# cms-prod   Ready   control-plane,master   2m
```

> **Dodaj do ~/.bashrc lub ~/.zshrc:**  
> `export KUBECONFIG=~/.kube/config-hetzner`  
> żeby nie musieć ustawiać za każdym razem.

### 4.3 Zainstaluj Traefik i ServiceLB przez Helm

Teraz zainstalujemy Traefik z konfiguracją z naszego repozytorium. Najpierw zastosu manifest:

```bash
kubectl apply -f k8s/traefik/config.yaml
```

Po chwili k3s sam pobierze i zainstaluje Traefik z tymi ustawieniami:

```bash
kubectl -n kube-system get pods | grep traefik
# traefik-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

---

## 5. Instalacja cert-manager (SSL Let's Encrypt)

cert-manager automatycznie wystawia i odnawia certyfikaty TLS od Let's Encrypt.

### 5.1 Zainstaluj cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

Poczekaj, aż wszystkie pody będą `Running`:

```bash
kubectl -n cert-manager get pods --watch
# cert-manager-xxxx             1/1   Running
# cert-manager-cainjector-xxxx  1/1   Running
# cert-manager-webhook-xxxx     1/1   Running
```

### 5.2 Utwórz ClusterIssuer

ClusterIssuer to konfiguracja mówiąca cert-managerowi, jak wystawiać certyfikaty. Stwórz plik `letsencrypt-prod.yaml`:

```yaml
# letsencrypt-prod.yaml (nie commituj do repo — jednorazowe polecenie)
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: twoj@email.com          # <-- ZMIEŃ na swój e-mail
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            ingressClassName: traefik
```

Zastosuj:

```bash
kubectl apply -f letsencrypt-prod.yaml
```

Sprawdź status:

```bash
kubectl get clusterissuer letsencrypt-prod
# NAME               READY   AGE
# letsencrypt-prod   True    30s
```

`READY: True` = cert-manager jest gotowy do wystawiania certyfikatów.

---

## 6. Konfiguracja Traefik (HTTPS + przekierowanie)

Plik `k8s/traefik/config.yaml` zawiera dwie rzeczy:

1. **HelmChartConfig** — konfiguruje Traefik tak, żeby ruch HTTP (port 80) był automatycznie przekierowywany na HTTPS (port 443)
2. **Middleware** — ustawia limit rozmiaru ciała żądania na 100 MB (potrzebne do uploadów plików)

Jeśli wcześniej zastosowałeś ten plik, Traefik już jest skonfigurowany. Zweryfikuj:

```bash
kubectl -n kube-system get helmchartconfig traefik
# NAME      AGE
# traefik   5m
```

---

## 7. Przygotowanie klastra — namespace i sekrety

### 7.1 Utwórz namespace

Namespace to izolowana przestrzeń w klastrze — jak osobny folder dla naszej aplikacji.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespace cms-prod
# NAME       STATUS   AGE
# cms-prod   Active   5s
```

### 7.2 Sekret MySQL

Skopiuj przykładowy plik i uzupełnij hasła:

```bash
cp k8s/mysql/secret.yaml.example k8s/mysql/secret.yaml
```

Otwórz `k8s/mysql/secret.yaml` i zmień `CHANGE_ME` na silne hasła:

```yaml
stringData:
  root-password: "SuperTajneHasloRoot123!"
  username: "cms"
  password: "SuperTajneHasloCms456!"
```

> **Nigdy nie commituj plików `secret.yaml` do repozytorium!**  
> Dodaj `k8s/**/*secret.yaml` do `.gitignore`.

Zastosuj:

```bash
kubectl apply -f k8s/mysql/secret.yaml
```

### 7.3 Sekret Redis

```bash
cp k8s/redis/secret.yaml.example k8s/redis/secret.yaml
# edytuj k8s/redis/secret.yaml — zmień hasło
kubectl apply -f k8s/redis/secret.yaml
```

### 7.4 Sekret aplikacji Laravel

Skopiuj `k8s/server/secret.yaml.example` i uzupełnij wszystkie `CHANGE_ME`:

```bash
cp k8s/server/secret.yaml.example k8s/server/secret.yaml
```

Kluczowe wartości do ustawienia:

```dotenv
APP_KEY=base64:...                        # php artisan key:generate
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_HOST=cms-mysql.cms-prod.svc.cluster.local   # wewnętrzny DNS k8s
DB_PASSWORD=SuperTajneHasloCms456!             # musi zgadzać się z sekret MySQL

REDIS_HOST=cms-redis.cms-prod.svc.cluster.local
REDIS_PASSWORD=SuperTajneHasloRedis789!        # musi zgadzać się z sekret Redis

GOTENBERG_URL=http://cms-gotenberg.cms-prod.svc.cluster.local:3000

# S3 / Cloudflare R2 dla plików
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET=...
```

> **Skąd wziąć APP_KEY?**  
> Lokalnie w projekcie: `docker compose exec php php artisan key:generate --show`

```bash
kubectl apply -f k8s/server/secret.yaml
```

### 7.5 Sekret klienta Next.js

```bash
kubectl apply -f k8s/client/secret.yaml.example
# API_URL=http://cms-server.cms-prod.svc.cluster.local  (już jest poprawne)
```

---

## 8. Wdrożenie bazy danych i cache (MySQL + Redis)

### 8.1 MySQL

```bash
kubectl apply -f k8s/mysql/statefulset.yaml
kubectl apply -f k8s/mysql/service.yaml
```

Poczekaj, aż MySQL będzie gotowy:

```bash
kubectl -n cms-prod get pods --watch
# NAME           READY   STATUS    RESTARTS   AGE
# cms-mysql-0    1/1     Running   0          2m
```

> **Dlaczego StatefulSet, a nie Deployment?**  
> StatefulSet gwarantuje stabilną nazwę poda (`cms-mysql-0`) i kolejność uruchamiania. Dla baz danych to ważne — dzięki temu DNS `cms-mysql-0.cms-mysql.cms-prod.svc.cluster.local` zawsze wskazuje na tę samą instancję.

Sprawdź czy MySQL działa:

```bash
kubectl -n cms-prod exec -it cms-mysql-0 -- mysql -u root -p
# Enter password: <root-password z sekretu>
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

Sprawdź połączenie:

```bash
kubectl -n cms-prod exec -it deployment/cms-redis -- redis-cli -a <REDIS_PASSWORD> ping
# PONG
```

---

## 9. Wdrożenie Gotenberg (PDF)

Gotenberg to mikroserwis do generowania PDF z HTML. Wdrażamy go jako oddzielny pod, dostępny tylko wewnątrz klastra.

```bash
kubectl apply -f k8s/gotenberg/deployment.yaml
kubectl apply -f k8s/gotenberg/service.yaml

kubectl -n cms-prod get pods | grep gotenberg
# cms-gotenberg-xxxxxxxxx-xxxxx   1/1   Running   0   30s
```

---

## 10. Pull Secret dla GitLab Container Registry

GitLab Container Registry jest domyślnie prywatne — klaster musi wiedzieć, jak się do niego uwierzytelniać.

### 10.1 Utwórz Deploy Token w GitLab

W GitLab: **Settings → Repository → Deploy tokens → New deploy token**

- Name: `k3s-pull`
- Scopes: zaznacz `read_registry`
- Kliknij **Create deploy token**
- Zapisz `username` i `token` — zobaczysz je tylko raz!

### 10.2 Utwórz sekret w klastrze

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<deploy-token-username> \
  --docker-password=<deploy-token-password> \
  --namespace=cms-prod
```

> **Nazwa `ghcr-pull-secret` musi zgadzać się** z tym co jest w manifestach (`k8s/server/deployment.yaml`, `k8s/client/deployment.yaml` etc.). Manifesty już używają tej nazwy — nie zmieniaj.

---

## 11. Wdrożenie aplikacji (serwer + klient)

Przed pierwszym deployem przez CI/CD musimy ręcznie zastosować manifesty infrastruktury. Obrazy Docker będą budowane przez pipeline — na razie używamy `:latest` (po pierwszym CI pushu).

```bash
# Serwer (Laravel)
kubectl apply -f k8s/server/service.yaml
kubectl apply -f k8s/server/deployment.yaml
kubectl apply -f k8s/server/deployment-queue.yaml
kubectl apply -f k8s/server/cronjob-scheduler.yaml
kubectl apply -f k8s/server/hpa.yaml

# Klient (Next.js)
kubectl apply -f k8s/client/service.yaml
kubectl apply -f k8s/client/deployment.yaml
kubectl apply -f k8s/client/hpa.yaml

# Ingress (routing + TLS)
kubectl apply -f k8s/ingress.yaml
```

Sprawdź status:

```bash
kubectl -n cms-prod get all
```

Powinieneś zobaczyć:

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

## 12. Konfiguracja GitLab CI/CD

Repozytorium zawiera plik `.gitlab-ci.yml` z pełnym pipeline'em. Musisz tylko skonfigurować zmienne.

### 12.1 Zmienne CI/CD

W GitLab: **Settings → CI/CD → Variables → Add variable**

#### Wymagane zmienne

| Zmienna                | Typ      | Masked | Protected | Opis                                 |
|------------------------|----------|--------|-----------|--------------------------------------|
| `KUBECONFIG`           | Variable | ✅      | ✅         | Base64 kubeconfig — patrz niżej      |
| `SERVER_ENV`           | Variable | ✅      | ✅         | Pełna treść `server/.env.production` |
| `NEXT_PUBLIC_API_URL`  | Variable | ❌      | ❌         | `https://api.yourdomain.com`         |
| `NEXT_PUBLIC_APP_NAME` | Variable | ❌      | ❌         | Nazwa twojej aplikacji               |

**Nie musisz** ustawiać zmiennych rejestru — GitLab dostarcza je automatycznie:
- `CI_REGISTRY` — adres rejestru
- `CI_REGISTRY_USER` — użytkownik
- `CI_REGISTRY_PASSWORD` — hasło

#### Jak uzyskać KUBECONFIG (base64)

Na lokalnym komputerze (gdzie masz skonfigurowany kubectl):

```bash
cat ~/.kube/config-hetzner | base64 | tr -d '\n'
```

Skopiuj wynik i wklej jako wartość zmiennej `KUBECONFIG` w GitLab.

> **Upewnij się**, że kubeconfig wskazuje na publiczny IP serwera (nie `127.0.0.1`). Jeśli skopiowałeś go komendą z sekcji 4.2 (z `sed`), jest już poprawny.

#### Jak uzyskać SERVER_ENV

Treść zmiennej `SERVER_ENV` to dosłownie zawartość twojego `server/.env.production`:

```dotenv
APP_NAME="MyCMS"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
...
```

Wklej całą treść jako wartość zmiennej (GitLab obsługuje wieloliniowe zmienne).

### 12.2 Jak działa pipeline

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
              ├── 1. kubectl apply job-migrate (migracje DB)
              ├── 2. kubectl set image deployment/cms-server
              ├── 3. kubectl set image deployment/cms-queue
              ├── 4. kubectl set image cronjob/cms-scheduler
              └── 5. kubectl set image deployment/cms-client
```

Każdy deploy:
1. Najpierw uruchamia `php artisan migrate --force` jako jednorazowy Job
2. Czeka na jego zakończenie (max 2 minuty)
3. Dopiero potem robi rolling update deploymentów

Dzięki temu migracje zawsze są przed nowym kodem — żadnych "column does not exist".

---

## 13. Pierwsze wdrożenie przez CI

Zrób push do gałęzi `master`:

```bash
git add .gitlab-ci.yml k8s/
git commit -m "ci: add GitLab CI/CD and k3s manifests"
git push origin master
```

W GitLab przejdź do **CI/CD → Pipelines** i obserwuj pipeline.

Pierwsze uruchomienie trwa dłużej (~10-15 min) bo:
- pobiera zależności PHP i Node.js bez cache
- buduje obrazy Docker od zera

Kolejne pipelines są szybsze dzięki cache warstw Docker i node_modules.

### Sprawdź wyniki

Po zakończeniu pipeline'u:

```bash
kubectl -n cms-prod get pods
kubectl -n cms-prod get ingress
```

Sprawdź certyfikat TLS:

```bash
kubectl -n cms-prod describe certificate cms-tls
# Status: True (Ready)
```

Wejdź w przeglądarkę:
- `https://yourdomain.com` — frontend Next.js
- `https://api.yourdomain.com/admin` — panel administracyjny
- `https://api.yourdomain.com/health` — health check Laravel (powinien zwrócić `{"status":"ok"}`)

---

## 14. Weryfikacja — czy wszystko działa?

### Checklist po pierwszym wdrożeniu

```bash
# Wszystkie pody Running
kubectl -n cms-prod get pods

# Certyfikat TLS wystawiony
kubectl -n cms-prod get certificate
# NAME      READY   SECRET    AGE
# cms-tls   True    cms-tls   5m

# Ingress ma adres IP
kubectl -n cms-prod get ingress
# NAME          CLASS     HOSTS              ADDRESS       PORTS
# cms-ingress   traefik   yourdomain.com...  <IP>          80, 443

# Laravel odpowiada
curl -s https://api.yourdomain.com/health
# {"status":"ok","timestamp":"..."}

# Frontend odpowiada
curl -I https://yourdomain.com
# HTTP/2 200

# Migracje się wykonały
kubectl -n cms-prod exec -it deployment/cms-server -- \
  php artisan migrate:status | tail -5

# Queue workers działają
kubectl -n cms-prod logs deployment/cms-queue --tail=20
```

### Test uploadów

Zaloguj się do panelu admina i spróbuj wgrać obraz — weryfikuje MySQL, storage (S3/R2) i nginx (body size limit).

---

## 15. Codzienna obsługa — logi, restarty, aktualizacje

### Podgląd logów

```bash
# Logi konkretnego poda (live)
kubectl -n cms-prod logs -f deployment/cms-server

# Logi queue workers
kubectl -n cms-prod logs -f deployment/cms-queue

# Logi kilku ostatnich podów (po restarcie)
kubectl -n cms-prod logs deployment/cms-server --previous

# Logi z ostatnich 1 godziny
kubectl -n cms-prod logs deployment/cms-server --since=1h
```

### Restart poda / deploymentu

```bash
# Restart deployment (tworzy nowe pody rolling)
kubectl -n cms-prod rollout restart deployment/cms-server

# Wymuszony restart konkretnego poda (Kubernetes zastąpi go nowym)
kubectl -n cms-prod delete pod <nazwa-poda>
```

### Wejście do kontenera (jak docker exec)

```bash
kubectl -n cms-prod exec -it deployment/cms-server -- bash

# Wewnątrz:
php artisan tinker
php artisan cache:clear
php artisan queue:restart
```

### Sprawdzenie zasobów (CPU / RAM)

```bash
kubectl -n cms-prod top pods
# NAME                        CPU(cores)   MEMORY(bytes)
# cms-server-xxx              45m          210Mi
# cms-queue-xxx               12m          128Mi
# cms-client-xxx              8m           95Mi
# cms-mysql-0                 35m          480Mi
# cms-redis-xxx               3m           28Mi
```

### Rollback deploymentu

Jeśli nowa wersja psuje coś krytycznego:

```bash
# Sprawdź historię
kubectl -n cms-prod rollout history deployment/cms-server

# Rollback do poprzedniej wersji
kubectl -n cms-prod rollout undo deployment/cms-server

# Rollback do konkretnej wersji
kubectl -n cms-prod rollout undo deployment/cms-server --to-revision=2
```

### Aktualizacja k3s

```bash
# Na serwerze
curl -sfL https://get.k3s.io | sh -
# k3s sam wykryje istniejącą instalację i zaktualizuje się
```

---

## 16. Backup MySQL

MySQL działa na PersistentVolume — dane są na dysku serwera. Nie polegaj jednak wyłącznie na tym!

### Ręczny backup

```bash
kubectl -n cms-prod exec cms-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASSWORD> cms \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automatyczny backup przez CronJob

Stwórz plik `k8s/mysql/cronjob-backup.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cms-mysql-backup
  namespace: cms-prod
spec:
  schedule: "0 3 * * *"     # codziennie o 3:00
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
                  # Usuń backupy starsze niż 7 dni
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
                path: /opt/cms-backups    # katalog na serwerze
                type: DirectoryOrCreate
          restartPolicy: OnFailure
```

```bash
# Na serwerze utwórz katalog
mkdir -p /opt/cms-backups

# Zastosuj CronJob
kubectl apply -f k8s/mysql/cronjob-backup.yaml
```

> **Zalecenie:** Dodatkowo synchronizuj katalog `/opt/cms-backups` na zewnętrzny storage (np. Hetzner Object Storage, Backblaze B2) narzędziem `rclone`.

---

## 17. Najczęstsze problemy (troubleshooting)

### Pod utknął w `Pending`

```bash
kubectl -n cms-prod describe pod <nazwa-poda>
```

Szukaj sekcji `Events` na dole. Typowe przyczyny:
- `Insufficient memory` — za mało RAM na węźle
- `ImagePullBackOff` — błędny pull secret lub zły adres obrazu
- `PVC not bound` — problem ze storage class

### `ImagePullBackOff` — nie może pobrać obrazu

```bash
kubectl -n cms-prod get secret ghcr-pull-secret -o yaml
# Sprawdź czy secret istnieje

# Sprawdź czy deploy token jest aktywny w GitLab
# Settings → Repository → Deploy tokens
```

Odtwórz sekret:

```bash
kubectl -n cms-prod delete secret ghcr-pull-secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<nowy-token-username> \
  --docker-password=<nowy-token-password> \
  --namespace=cms-prod
```

### Certyfikat TLS nie jest wystawiony

```bash
kubectl -n cms-prod describe certificate cms-tls
kubectl -n cert-manager logs deployment/cert-manager | grep ERROR
```

Najczęstsze przyczyny:
- DNS jeszcze nie propagował (poczekaj 15 min)
- Port 80 zablokowany przez firewall (Let's Encrypt używa HTTP challenge)
- Przekroczyłeś limit certyfikatów Let's Encrypt (5 na tydzień na domenę)

### Laravel zwraca błąd 500

```bash
kubectl -n cms-prod logs deployment/cms-server --tail=50
kubectl -n cms-prod exec -it deployment/cms-server -- cat storage/logs/laravel.log | tail -50
```

### Migracja nie przeszła

```bash
# Sprawdź logi zakończonego joba
kubectl -n cms-prod get jobs
kubectl -n cms-prod logs job/cms-migrate-<SHA>
```

### Brak połączenia z MySQL

```bash
# Test z poda serwera
kubectl -n cms-prod exec -it deployment/cms-server -- \
  php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';"
```

Sprawdź czy `DB_HOST` w sekrecie zgadza się z `cms-mysql.cms-prod.svc.cluster.local`.

### HPA nie skaluje

```bash
kubectl -n cms-prod get hpa
# Jeśli TARGETS = <unknown>/70% — metrics-server nie działa

# Sprawdź czy metrics-server jest zainstalowany
kubectl -n kube-system get deployment metrics-server
```

Jeśli metrics-server nie ma — zainstaluj:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 18. Rancher — zarządzanie klastrem przez UI

Jeśli w pracy korzystasz z Ranchera, możesz go postawić na tym samym VPS. Dostaniesz dokładnie to samo środowisko — podgląd podów, logi, shell do kontenera, zarządzanie secretami — wszystko przez przeglądarkę.

### 18.1 Instalacja Ranchera

Rancher działa jako kontener Docker — niezależnie od k3s. Na serwerze:

```bash
docker run -d \
  --name rancher \
  --restart=unless-stopped \
  --privileged \
  -p 8080:80 -p 8443:443 \
  -v /opt/rancher:/var/lib/rancher \
  rancher/rancher:latest
```

Poczekaj ~2 minuty, a następnie wejdź na:

```
https://<IP_SERWERA>:8443
```

> **Uwaga:** Rancher używa self-signed certyfikatu przy pierwszym uruchomieniu — przeglądarka pokaże ostrzeżenie, kliknij "Proceed anyway".

### 18.2 Pierwsze logowanie

Pobierz hasło bootstrapowe:

```bash
docker logs rancher 2>&1 | grep "Bootstrap Password"
```

Zaloguj się i ustaw nowe hasło.

### 18.3 Importuj klaster k3s

1. W Rancherze kliknij **Import Existing** → **Generic**
2. Nadaj nazwę klastrowi, np. `cms-prod`
3. Rancher wygeneruje komendę `kubectl apply` — uruchom ją na serwerze:

```bash
kubectl apply -f https://<IP_RANCHERA>:8443/v3/import/xxxxx.yaml
```

Po ~1 minucie klaster pojawi się w Rancherze ze statusem `Active`.

### 18.4 Co możesz robić w UI

| Funkcja                  | Gdzie w Rancherze                      |
|--------------------------|----------------------------------------|
| Podgląd wszystkich podów | Workloads → Pods                       |
| Logi poda (live)         | Pod → ⋮ → View Logs                    |
| Shell do kontenera       | Pod → ⋮ → Execute Shell                |
| Restart deploymentu      | Workloads → Deployments → ⋮ → Redeploy |
| Podgląd secretów         | Storage → Secrets                      |
| Edycja zmiennych env     | Deployment → Edit Config               |
| Zużycie CPU / RAM        | Cluster → Metrics                      |
| CronJoby i Joby          | Workloads → CronJobs / Jobs            |

### 18.5 Zabezpieczenie panelu Ranchera

Domyślnie Rancher jest dostępny publicznie na porcie 8443. Ogranicz dostęp przez firewall Hetzner (panel → Firewall) lub bezpośrednio na serwerze:

```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 6443         # kubectl API — tylko Twój IP
ufw deny 8443          # zablokuj publicznie
ufw allow from <TWÓJ_IP> to any port 8443
ufw enable
```

---

## 19. Czyszczenie dysku

k3s akumuluje stare obrazy kontenerów przy każdym deploymencie. Po kilku miesiącach możesz stracić kilkanaście GB — warto to zautomatyzować.

### 19.1 Sprawdź zajętość dysku

```bash
df -h /

# Ile zajmują obrazy k3s (containerd)
du -sh /var/lib/rancher/k3s/agent/containerd/
```

### 19.2 Ręczne czyszczenie

k3s używa `containerd` (nie Dockera). Do zarządzania obrazami służy `crictl`:

```bash
# Usuń wszystkie nieużywane obrazy
k3s crictl rmi --prune

# Sprawdź co zostało
k3s crictl images
```

Jeśli masz też Dockera na serwerze (Rancher, Uptime Kuma):

```bash
docker system prune -af
```

### 19.3 Automatyczne czyszczenie — CronJob

```bash
kubectl apply -f k8s/maintenance/cronjob-image-cleanup.yaml
```

CronJob uruchamia się co niedzielę o 2:00 i usuwa nieużywane obrazy z `containerd`.

---

## 20. k9s — terminalowy panel zarządzania

k9s to terminalowy UI dla Kubernetes — jak Rancher, ale w konsoli. Przydatny gdy jesteś już połączony SSH i nie chcesz otwierać przeglądarki.

### 20.1 Instalacja

macOS:
```bash
brew install k9s
```

Linux (serwer lub lokalnie):
```bash
VERSION=$(curl -s https://api.github.com/repos/derailed/k9s/releases/latest | grep tag_name | cut -d '"' -f 4)
curl -L "https://github.com/derailed/k9s/releases/download/${VERSION}/k9s_Linux_amd64.tar.gz" \
  | tar xz -C /usr/local/bin k9s
```

Windows:
```bash
winget install k9s
```

### 20.2 Uruchomienie

```bash
k9s
# lub od razu w konkretnym namespace
k9s -n cms-prod
```

### 20.3 Najważniejsze skróty

| Klawisz   | Akcja                     |
|-----------|---------------------------|
| `:pod`    | lista podów               |
| `:deploy` | lista deploymentów        |
| `:secret` | lista secretów            |
| `:job`    | lista jobów               |
| `l`       | logi poda (live)          |
| `s`       | shell do kontenera        |
| `d`       | describe (szczegóły)      |
| `ctrl+r`  | restart deploymentu       |
| `/`       | filtrowanie po nazwie     |
| `?`       | pełna lista skrótów       |
| `q`       | wyjście / poprzedni widok |

---

## 21. Rotacja secretów — aktualizacja .env i haseł bez downtime'u

### 21.1 Aktualizacja Laravel .env

Zmodyfikuj `k8s/server/secret.yaml`, a następnie:

```bash
kubectl apply -f k8s/server/secret.yaml

# Rolling restart — nowe pody startują z nowym secretem zanim stare padną
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

### 21.2 Zmiana hasła MySQL

**Krok 1** — zmień hasło w bazie:

```bash
kubectl -n cms-prod exec -it cms-mysql-0 -- mysql -u root -p<STARE_HASŁO>
```

```sql
ALTER USER 'cms'@'%' IDENTIFIED BY 'NoweHaslo123!';
FLUSH PRIVILEGES;
EXIT;
```

**Krok 2** — zaktualizuj oba sekrety i zrestartuj:

```bash
# Zaktualizuj k8s/mysql/secret.yaml i k8s/server/secret.yaml
kubectl apply -f k8s/mysql/secret.yaml
kubectl apply -f k8s/server/secret.yaml
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

### 21.3 Zmiana hasła Redis

```bash
# Zaktualizuj k8s/redis/secret.yaml i k8s/server/secret.yaml (REDIS_PASSWORD)
kubectl apply -f k8s/redis/secret.yaml
kubectl apply -f k8s/server/secret.yaml

kubectl -n cms-prod rollout restart deployment/cms-redis
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

> **Uwaga:** Restart Redis czyści cache i sesje — użytkownicy zostaną wylogowani. Planuj poza godzinami szczytu.

---

## 💡 Bonus: Staging namespace

Możesz postawić środowisko stagingowe w osobnym namespace `cms-staging` na tym samym klastrze — bez dodatkowych kosztów.

```bash
# Utwórz namespace staging
sed 's/cms-prod/cms-staging/g' k8s/namespace.yaml | kubectl apply -f -

# Zastosuj sekrety ze stagingowymi wartościami
sed 's/cms-prod/cms-staging/g' k8s/server/secret.yaml | kubectl apply -f -
```

W CI/CD dodaj job uruchamiany na branchu `develop`:

```yaml
deploy-staging:
  stage: deploy
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
  script:
    - kubectl -n cms-staging set image deployment/cms-server app="${SERVER_IMAGE}:${CI_COMMIT_SHORT_SHA}"
    - kubectl -n cms-staging rollout status deployment/cms-server --timeout=5m
```

Dla stagingowego ingressu użyj subdomeny `staging.yourdomain.com`.

---

## 💡 Bonus: Uptime Kuma — monitoring dostępności

Uptime Kuma to self-hosted alternatywa dla UptimeRobot. Działa jako kontener Docker obok Ranchera:

```bash
docker run -d \
  --name uptime-kuma \
  --restart=unless-stopped \
  -p 3001:3001 \
  -v /opt/uptime-kuma:/app/data \
  louislam/uptime-kuma:latest
```

Wejdź na `https://<IP_SERWERA>:3001` i dodaj monitory dla:
- `https://yourdomain.com` — frontend
- `https://api.yourdomain.com/health` — Laravel API
- `https://api.yourdomain.com/admin` — panel admina

Wysyła powiadomienia przez Slack, email, Telegram i wiele innych kanałów.

> Zabezpiecz port 3001 tak samo jak 8443 — ogranicz do swojego IP przez UFW.

---

## Podsumowanie

Masz teraz pełny klaster k3s z:

- ✅ Automatycznym TLS (Let's Encrypt przez cert-manager)
- ✅ HTTP → HTTPS redirect (Traefik)
- ✅ Zero-downtime deployów (rolling update)
- ✅ Migracjami przed deployem (Job)
- ✅ Automatycznym restartem po awarii (Kubernetes)
- ✅ HPA — autoskalowaniem przy obciążeniu
- ✅ GitLab CI/CD — lintowanie, testy, build, deploy
- ✅ MySQL z persystentnym wolumenem
- ✅ Redis z persystentnym wolumenem
- ✅ Codziennymi backupami MySQL

Całość za ~$10-12/miesiąc na Hetzner CX33.

---
