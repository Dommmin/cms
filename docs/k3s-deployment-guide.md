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
10. [Pull Secret dla Container Registry (GHCR / GitLab)](#10-pull-secret-dla-container-registry-ghcr--gitlab)
11. [Wdrożenie aplikacji (serwer + klient)](#11-wdrożenie-aplikacji-serwer--klient)
12. [Jak CI/CD łączy się z k3s?](#12-jak-cicd-łączy-się-z-k3s)
13. [Konfiguracja GitHub Actions](#13-konfiguracja-github-actions)
14. [Konfiguracja GitLab CI/CD](#14-konfiguracja-gitlab-cicd)
15. [Pierwsze wdrożenie przez CI](#15-pierwsze-wdrożenie-przez-ci)
16. [Weryfikacja — czy wszystko działa?](#16-weryfikacja--czy-wszystko-działa)
17. [Codzienna obsługa — logi, restarty, aktualizacje](#17-codzienna-obsługa--logi-restarty-aktualizacje)
18. [Backup MySQL](#18-backup-mysql)
19. [Najczęstsze problemy (troubleshooting)](#19-najczęstsze-problemy-troubleshooting)
20. [Rancher — zarządzanie klastrem przez UI](#20-rancher--zarządzanie-klastrem-przez-ui)
21. [Czyszczenie dysku](#21-czyszczenie-dysku)
22. [k9s — terminalowy panel zarządzania](#22-k9s--terminalowy-panel-zarządzania)
23. [Rotacja secretów — aktualizacja .env i haseł bez downtime'u](#23-rotacja-secretów--aktualizacja-env-i-haseł-bez-downtimeu)

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

### 3.5 SSH — konfiguracja na lokalnym komputerze

Zanim zalogujesz się na serwer, skonfiguruj wygodny alias SSH na **lokalnym komputerze**. Dzięki temu zamiast pisać `ssh root@123.456.789.0` za każdym razem, wystarczy `ssh cms`.

Edytuj (lub utwórz) plik `~/.ssh/config`:

```bash
nano ~/.ssh/config
```

Dodaj:

```
Host cms
    HostName <IP_SERWERA>
    User root
    IdentityFile ~/.ssh/id_ed25519
```

Od teraz:

```bash
ssh cms                  # logowanie
scp plik.txt cms:/tmp/   # kopiowanie pliku
```

> Jeśli później utworzysz użytkownika `deployer` (sekcja 3.6), zmień `User root` na `User deployer`.

### 3.6 SSH — hardening serwera (wyłącz logowanie hasłem)

Po zalogowaniu na serwer pierwszym krokiem powinno być wyłączenie logowania hasłem — klucz SSH jest znacznie bezpieczniejszy.

#### Opcja A: tylko root z kluczem (prostsze)

Wystarczająca dla jednoosobowego VPS. Zaloguj się i edytuj konfigurację SSH:

```bash
ssh cms   # lub: ssh root@<IP_SERWERA>

nano /etc/ssh/sshd_config
```

Upewnij się, że te linie wyglądają tak:

```
PasswordAuthentication no
PermitRootLogin prohibit-password
```

Zrestartuj SSH:

```bash
systemctl restart ssh
```

> ⚠️ **Zanim zamkniesz obecną sesję** — otwórz drugą sesję SSH i sprawdź, czy możesz się zalogować. Jeśli tak, dopiero zamknij pierwszą.

#### Opcja B: dedykowany użytkownik `deployer` + sudo (zalecane przy kilku osobach)

Tworzy osobne konto z uprawnieniami sudo — root login zostaje całkowicie zablokowany.

```bash
# Na serwerze (jako root)
adduser deployer                            # utwórz użytkownika (ustawi hasło interaktywnie)
usermod -aG sudo deployer                   # dodaj do grupy sudo

# Skopiuj klucz SSH z roota na nowego użytkownika
mkdir -p /home/deployer/.ssh
cp ~/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
```

Teraz **przetestuj** logowanie jako `deployer` w nowej sesji:

```bash
# Na lokalnym komputerze — nowa sesja terminala
ssh -i ~/.ssh/id_ed25519 deployer@<IP_SERWERA>
sudo whoami   # powinno zwrócić: root
```

Jeśli działa — zablokuj root login:

```bash
# Na serwerze (jako deployer, przez sudo)
sudo nano /etc/ssh/sshd_config
```

```
PasswordAuthentication no
PermitRootLogin no
```

```bash
sudo systemctl restart ssh
```

Zaktualizuj alias w `~/.ssh/config` na lokalnym komputerze:

```
Host cms
    HostName <IP_SERWERA>
    User deployer
    IdentityFile ~/.ssh/id_ed25519
```

---

## 4. Instalacja k3s

### 4.1 Zainstaluj k3s

Na serwerze uruchom jedną komendę:

```bash
curl -sfL https://get.k3s.io | sh -s - --disable=servicelb
```

> **Dlaczego wyłączamy tylko servicelb?**  
> `servicelb` to wewnętrzny load balancer k3s — wyłączamy go, bo Traefik sam obsługuje ruch przychodzący. Traefiku **nie wyłączamy** — k3s instaluje go automatycznie, a `HelmChartConfig` z sekcji 4.3 dostroi jego konfigurację (HTTP→HTTPS redirect).

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

> **Lokalny komputer — od tej chwili wszystkie komendy `kubectl` wykonujesz u siebie.**  
> `kubectl` to klient HTTP — wysyła polecenia do serwera przez port 6443. Nie musisz być zalogowany przez SSH. Upewnij się, że masz ustawione `export KUBECONFIG=~/.kube/config-hetzner` (sekcja 4.2).

Instalacja Traefiku składa się z **dwóch kroków** — Middleware musi być aplikowany dopiero po tym, jak Traefik zainstaluje swoje CRD (Custom Resource Definitions).

**Krok 1** — zastosuj konfigurację Traefiku (tylko HelmChartConfig):

```bash
kubectl apply -f k8s/traefik/config.yaml
```

Poczekaj, aż Traefik będzie uruchomiony:

```bash
kubectl -n kube-system get pods --watch | grep traefik
# traefik-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

Wyjdź z `--watch` przez `Ctrl+C` gdy zobaczysz `Running`.

> Middleware (`k8s/traefik/middleware.yaml`) aplikujemy dopiero w **sekcji 7.1** — po utworzeniu namespace. Middleware musi należeć do istniejącego namespace.

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

> **Uwaga o nazwie namespace:** Przykłady w tym przewodniku używają `cms-prod` jako nazwy namespace. Zastąp ją własną — np. `my-blog-prod`, `shop-prod`, `api-prod`. Użyj jej konsekwentnie we wszystkich plikach YAML i komendach `kubectl -n`.

### 7.1 Utwórz namespace

Namespace to izolowana przestrzeń w klastrze — jak osobny folder dla naszej aplikacji.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespace cms-prod
# NAME       STATUS   AGE
# cms-prod   Active   5s
```

Teraz zastosuj Traefik Middleware — wymaga istniejącego namespace (dlatego nie robiliśmy tego w sekcji 4):

```bash
kubectl apply -f k8s/traefik/middleware.yaml
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

### 7.4 Sekret aplikacji Laravel — opcjonalne przy CI/CD

> **Jeśli używasz GitHub Actions lub GitLab CI/CD — pomiń ten krok.**  
> Pipeline automatycznie tworzy i aktualizuje ten sekret z zmiennej `PROD_ENV` przy każdym deploymencie (krok 0 w pipeline). Ręczne tworzenie jest potrzebne tylko jeśli chcesz uruchomić aplikację przed pierwszym CI/CD.

Jeśli jednak chcesz skonfigurować sekret ręcznie (np. przed pierwszym CI/CD run), użyj szablonu `server/.env.production.example`:

```bash
# Uzupełnij server/.env.production.example swoimi wartościami, a następnie:
kubectl create secret generic cms-server-env \
  --from-file=.env=server/.env.production \
  --namespace=cms-prod \
  --dry-run=client -o yaml | kubectl apply -f -
```

> **Skąd wziąć APP_KEY?**  
> `docker compose exec php php artisan key:generate --show`

### 7.5 Sekret klienta Next.js

Ten sekret zawiera wewnętrzny URL API (używany przez Next.js server-side do fetchowania danych z pominięciem publicznego internetu). **CI/CD go nie tworzy** — wymagany raz, ręcznie.

```bash
kubectl apply -f k8s/client/secret.yaml.example
# API_URL=http://cms-server.cms-prod.svc.cluster.local  (wartość już jest poprawna)
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

## 10. Pull Secret dla Container Registry (GHCR / GitLab)

Twój klaster musi wiedzieć, jak pobierać prywatne obrazy Docker. Konfiguracja zależy od tego, jakiego CI/CD używasz.

> **Ważne:** Nazwa sekretu `ghcr-pull-secret` jest taka sama w obu przypadkach — manifesty deploymentów (`k8s/server/deployment.yaml`, `k8s/client/deployment.yaml`) już jej używają. Nie zmieniaj tej nazwy.

### 10.1 GitHub Container Registry (GHCR)

Jeśli używasz **GitHub Actions** i budujesz obrazy do `ghcr.io`:

#### Utwórz Personal Access Token

W GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)**

- Scopes: `read:packages`
- Kliknij **Generate token** i zapisz — zobaczysz go tylko raz

#### Utwórz sekret w klastrze

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=<TWÓJ_GITHUB_USERNAME> \
  --docker-password=<PERSONAL_ACCESS_TOKEN> \
  --namespace=cms-prod
```

### 10.2 GitLab Container Registry

Jeśli używasz **GitLab CI** i budujesz obrazy do `registry.gitlab.com`:

#### Utwórz Deploy Token w GitLab

W GitLab: **Settings → Repository → Deploy tokens → New deploy token**

- Name: `k3s-pull`
- Scopes: zaznacz `read_registry`
- Kliknij **Create deploy token**
- Zapisz `username` i `token` — zobaczysz je tylko raz!

#### Utwórz sekret w klastrze

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<deploy-token-username> \
  --docker-password=<deploy-token-password> \
  --namespace=cms-prod
```

---

## 11. Wdrożenie aplikacji (serwer + klient)

Przed pierwszym deployem przez CI/CD musimy ręcznie zastosować manifesty infrastruktury. Obrazy Docker będą budowane przez pipeline — na razie używamy `:latest` (po pierwszym CI pushu).

### 11.1 Persistent storage dla uploadsów i logów

Zanim uruchomisz serwer, utwórz PVC (PersistentVolumeClaim) — wolumen na dysku VPS, który przechowa uploadowane pliki i logi Laravel.

```bash
kubectl apply -f k8s/server/pvc-storage.yaml
```

Sprawdź że PVC jest gotowe:

```bash
kubectl -n cms-prod get pvc
# NAME                 STATUS   VOLUME         CAPACITY   STORAGECLASS
# cms-server-storage   Bound    pvc-xxxxxxxx   20Gi       local-path
```

`STATUS: Bound` oznacza że wolumen jest gotowy. `local-path` to wbudowany w k3s mechanizm przechowywania danych na lokalnym dysku VPS.

> **Co przechowuje PVC?**
> ```
> PVC (20Gi na dysku VPS)
>   ├── storage/app/    ← uploadowane pliki (zdjęcia, PDF-y, załączniki)
>   └── storage/logs/   ← logi Laravel (gdy LOG_CHANNEL=daily lub stack)
> ```
> Dane przeżywają restarty podów i deploye. Giną tylko jeśli ręcznie usuniesz PVC.

W pliku `.env` produkcyjnym ustaw:

```dotenv
FILESYSTEM_DISK=public   # pliki na lokalny dysk (przez PVC)
LOG_CHANNEL=stderr       # logi do kubectl logs (najwygodniejsze w k8s)
# LOG_CHANNEL=stack      # lub oba: stderr + plik
# LOG_STACK=stderr,daily
```

> **Ograniczenie PVC:** działa tylko przy `replicas: 1`. Przy skalowaniu do 2+ podów przejdź na MinIO — patrz sekcja z bonusami na końcu przewodnika.

### 11.2 Wdrożenie serwerów

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

## 12. Jak CI/CD łączy się z k3s?

Zanim przejdziesz do konfiguracji, warto zrozumieć jak pipeline w ogóle może sterować Kubernetes na Twoim serwerze.

### Tradycyjny deploy (SSH)

W klasycznym podejściu (np. Deployer, Capistrano) pipeline loguje się na serwer przez SSH i uruchamia skrypty:

```
GitHub/GitLab Actions → SSH (port 22) → VPS
                          ↓
                      scp pliki
                      ./deploy.sh
```

Ty zarządzasz tym, jak kod trafia na serwer.

### Deploy przez Kubernetes API (kubectl)

W podejściu z Kubernetes pipeline **nie wysyła kodu** — kod jest już w obrazie Docker (zbudowanym i wepchniętym do rejestru). Pipeline mówi tylko k8s: *„użyj teraz tego obrazu"*:

```
GitHub/GitLab Actions → HTTPS (port 6443) → k8s API → k3s
                                                 ↓
                                    "zmień obraz w deployment na :abc1234"
                                    k8s sam robi rolling update
```

### Co to jest KUBECONFIG?

`kubectl` to klient HTTP — łączy się z API serwera k3s przez HTTPS na porcie 6443. Cały kontekst połączenia (adres serwera + poświadczenia) jest w pliku `kubeconfig`:

```yaml
apiVersion: v1
clusters:
- cluster:
    server: https://TWOJE_VPS_IP:6443   # ← adres serwera
    certificate-authority-data: BASE64  # ← cert CA (weryfikacja serwera)
  name: default
users:
- user:
    client-certificate-data: BASE64     # ← Twój "klucz" (jak SSH key)
    client-key-data: BASE64
  name: default
```

Cały plik kubeconfig wklejasz jako jeden sekret w CI/CD — zastępuje SSH_HOST + SSH_PORT + SSH_USER + SSH_KEY razem.

| Tradycyjny SSH | Kubernetes |
|---|---|
| `SSH_HOST` | ✅ zawarte w kubeconfig |
| `SSH_PORT` | ✅ zawarte w kubeconfig (6443) |
| `SSH_USER` | ✅ zawarte w kubeconfig (client cert) |
| `SSH_KEY` | ✅ zawarte w kubeconfig (client key) |

### Jak uzyskać kubeconfig?

Na lokalnym komputerze (masz już skonfigurowany kubectl z sekcji 4.2):

```bash
cat ~/.kube/config-hetzner
```

Skopiuj cały wynik (zaczyna się od `apiVersion: v1`) i wklej jako wartość sekretu `KUBECONFIG_PROD` (GitHub) lub `KUBECONFIG` (GitLab). GitHub i GitLab obsługują wieloliniowe wartości — **nie koduj do base64**.

> **Upewnij się**, że kubeconfig wskazuje na publiczny IP serwera (nie `127.0.0.1`). Jeśli skopiowałeś go komendą z sekcji 4.2 (z `sed`), jest już poprawny.

### Co musisz otworzyć na serwerze?

```bash
# Firewall Hetzner (panel Cloud) lub UFW — otwórz port 6443
ufw allow 6443/tcp comment "k8s API for CI/CD"
```

Port 22 (SSH) możesz zostawić tylko dla siebie — CI/CD już go nie potrzebuje.

---

## 13. Konfiguracja GitHub Actions

Repozytorium zawiera plik `.github/workflows/deploy.yml` z pełnym pipeline'em. Musisz tylko skonfigurować zmienne w GitHub.

### 13.1 Zmienne i sekrety

W GitHub: **Settings → Secrets and Actions → Secrets / Variables**

#### Secrets (write-only, maskowane w logach)

| Secret              | Opis                                         |
|---------------------|----------------------------------------------|
| `KUBECONFIG_PROD`   | Surowa treść kubeconfig — patrz sekcja 12   |

```bash
# Jak uzyskać wartość (bez base64):
cat ~/.kube/config-hetzner
```

#### Variables (widoczne i edytowalne w UI)

| Variable               | Przykład                             | Opis                                 |
|------------------------|--------------------------------------|--------------------------------------|
| `PROD_ENV`             | *(pełna treść .env produkcyjnego)*   | Automatycznie sync do k8s Secret     |
| `NEXT_PUBLIC_API_URL`  | `https://api.yourdomain.com`         | Build-time dla Next.js               |
| `NEXT_PUBLIC_APP_NAME` | `MyCMS`                              | Build-time dla Next.js               |

> **Dlaczego `PROD_ENV` jako Variable, a nie Secret?**  
> Secrets są write-only — raz wklejonego nie możesz odczytać ani edytować linijka po linijce. Variables są widoczne w UI, więc łatwo sprawdzisz co jest ustawione. Pipeline i tak sync'uje wartość do k8s Secret przed deployem.

#### Jak ustawić PROD_ENV

Treść to dosłownie zawartość Twojego `server/.env.production`:

```dotenv
APP_NAME="MyCMS"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_HOST=cms-mysql.cms-prod.svc.cluster.local
DB_PASSWORD=SuperTajneHaslo456!

REDIS_HOST=cms-redis.cms-prod.svc.cluster.local
REDIS_PASSWORD=SuperTajneHasloRedis789!

GOTENBERG_URL=http://cms-gotenberg.cms-prod.svc.cluster.local:3000
...
```

GitHub obsługuje wieloliniowe Variables — wklej całą treść.

### 13.2 Jak działa pipeline

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
              ├── 1. kubectl apply job-migrate (migracje DB, wait 2 min)
              ├── 2. kubectl set image deployment/cms-server
              ├── 3. kubectl set image deployment/cms-queue
              ├── 4. kubectl set image cronjob/cms-scheduler
              └── 5. kubectl set image deployment/cms-client
```

Każdy deploy:
1. Najpierw aktualizuje k8s Secret z `PROD_ENV` — żaden restart nie jest potrzebny dla migracji
2. Uruchamia `php artisan migrate --force` jako jednorazowy Job z **nowym** obrazem
3. Czeka na jego zakończenie (max 2 minuty)
4. Dopiero potem robi rolling update deploymentów

Dzięki temu migracje zawsze są przed nowym kodem — żadnych „column does not exist".

### 13.3 Obrazy bez serwera rejestru

GitHub Container Registry (GHCR) jest wbudowany w GitHub — nie musisz konfigurować żadnego zewnętrznego rejestru. Pipeline automatycznie loguje się z `GITHUB_TOKEN` (dostępny automatycznie w każdym workflow).

---

## 14. Konfiguracja GitLab CI/CD

Repozytorium zawiera plik `.gitlab-ci.yml` z pełnym pipeline'em. Musisz tylko skonfigurować zmienne.

### 14.1 Zmienne CI/CD

W GitLab: **Settings → CI/CD → Variables → Add variable**

#### Wymagane zmienne

| Zmienna                | Typ      | Masked | Protected | Opis                                 |
|------------------------|----------|--------|-----------|--------------------------------------|
| `KUBECONFIG`           | Variable | ✅      | ✅         | Surowa treść kubeconfig — patrz sekcja 12 |
| `SERVER_ENV`           | Variable | ✅      | ✅         | Pełna treść `server/.env.production` |
| `NEXT_PUBLIC_API_URL`  | Variable | ❌      | ❌         | `https://api.yourdomain.com`         |
| `NEXT_PUBLIC_APP_NAME` | Variable | ❌      | ❌         | Nazwa twojej aplikacji               |

**Nie musisz** ustawiać zmiennych rejestru — GitLab dostarcza je automatycznie:
- `CI_REGISTRY` — adres rejestru
- `CI_REGISTRY_USER` — użytkownik
- `CI_REGISTRY_PASSWORD` — hasło

#### Jak uzyskać KUBECONFIG

```bash
cat ~/.kube/config-hetzner
```

Skopiuj cały wynik i wklej jako wartość zmiennej `KUBECONFIG` w GitLab. **Nie koduj do base64** — GitLab obsługuje wieloliniowe wartości.

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

### 14.2 Jak działa pipeline

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

---

## 15. Pierwsze wdrożenie przez CI

Zrób push do gałęzi `master`:

```bash
git add .github/ k8s/
git commit -m "ci: add CI/CD pipeline and k3s manifests"
git push origin master
```

**GitHub Actions:** Przejdź do **Actions** w repozytorium i obserwuj pipeline.

**GitLab CI:** Przejdź do **CI/CD → Pipelines** i obserwuj pipeline.

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

## 16. Weryfikacja — czy wszystko działa?

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

## 17. Codzienna obsługa — logi, restarty, aktualizacje

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

## 18. Backup MySQL

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

## 19. Najczęstsze problemy (troubleshooting)

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

## 20. Rancher — zarządzanie klastrem przez UI

Jeśli w pracy korzystasz z Ranchera, możesz go postawić na tym samym VPS. Dostaniesz dokładnie to samo środowisko — podgląd podów, logi, shell do kontenera, zarządzanie secretami — wszystko przez przeglądarkę.

### 20.1 Instalacja Ranchera

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

### 20.2 Pierwsze logowanie

Pobierz hasło bootstrapowe:

```bash
docker logs rancher 2>&1 | grep "Bootstrap Password"
```

Zaloguj się i ustaw nowe hasło.

### 20.3 Importuj klaster k3s

1. W Rancherze kliknij **Import Existing** → **Generic**
2. Nadaj nazwę klastrowi, np. `cms-prod`
3. Rancher wygeneruje komendę `kubectl apply` — uruchom ją na serwerze:

```bash
kubectl apply -f https://<IP_RANCHERA>:8443/v3/import/xxxxx.yaml
```

Po ~1 minucie klaster pojawi się w Rancherze ze statusem `Active`.

### 20.4 Co możesz robić w UI

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

### 20.5 Zabezpieczenie panelu Ranchera

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

## 21. Czyszczenie dysku

k3s akumuluje stare obrazy kontenerów przy każdym deploymencie. Po kilku miesiącach możesz stracić kilkanaście GB — warto to zautomatyzować.

### 21.1 Sprawdź zajętość dysku

```bash
df -h /

# Ile zajmują obrazy k3s (containerd)
du -sh /var/lib/rancher/k3s/agent/containerd/
```

### 21.2 Ręczne czyszczenie

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

### 21.3 Automatyczne czyszczenie — CronJob

```bash
kubectl apply -f k8s/maintenance/cronjob-image-cleanup.yaml
```

CronJob uruchamia się co niedzielę o 2:00 i usuwa nieużywane obrazy z `containerd`.

---

## 22. k9s — terminalowy panel zarządzania

k9s to terminalowy UI dla Kubernetes — jak Rancher, ale w konsoli. Przydatny gdy jesteś już połączony SSH i nie chcesz otwierać przeglądarki.

### 22.1 Instalacja

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

### 22.2 Uruchomienie

```bash
k9s
# lub od razu w konkretnym namespace
k9s -n cms-prod
```

### 22.3 Najważniejsze skróty

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

## 23. Rotacja secretów — aktualizacja .env i haseł bez downtime'u

### 23.1 Aktualizacja Laravel .env

Zmodyfikuj `k8s/server/secret.yaml`, a następnie:

```bash
kubectl apply -f k8s/server/secret.yaml

# Rolling restart — nowe pody startują z nowym secretem zanim stare padną
kubectl -n cms-prod rollout restart deployment/cms-server
kubectl -n cms-prod rollout restart deployment/cms-queue
```

### 23.2 Zmiana hasła MySQL

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

### 23.3 Zmiana hasła Redis

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
# GitHub Actions — dodaj do .github/workflows/deploy.yml
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
# GitLab CI — dodaj do .gitlab-ci.yml
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

## 💡 Bonus: MinIO — self-hosted S3 dla 2+ podów

Gdy chcesz skalować do `replicas: 2+`, PVC z `ReadWriteOnce` nie wystarczy — dwa pody nie mogą jednocześnie zapisywać do tego samego wolumenu. Rozwiązaniem jest **MinIO** — self-hosted storage kompatybilny z API Amazon S3.

```
replicas: 2

Pod A ──► MinIO API (port 9000) ──► /data (PVC)
Pod B ──►
```

Oba pody piszą do MinIO przez HTTP — MinIO sam zarządza dyskiem.

### Wdrożenie MinIO

```bash
# Sekret (skopiuj i uzupełnij)
cp k8s/minio/secret.yaml.example k8s/minio/secret.yaml
# edytuj — ustaw root-user i root-password (min. 8 znaków)
kubectl apply -f k8s/minio/secret.yaml

# PVC + Deployment + Service
kubectl apply -f k8s/minio/pvc.yaml
kubectl apply -f k8s/minio/deployment.yaml
kubectl apply -f k8s/minio/service.yaml

# Sprawdź
kubectl -n cms-prod get pods | grep minio
# cms-minio-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

### Utwórz bucket

MinIO ma panel webowy na porcie 9001. Utwórz tymczasowe przekierowanie:

```bash
kubectl -n cms-prod port-forward svc/cms-minio 9001:9001
```

Wejdź na `http://localhost:9001`, zaloguj się danymi z sekretu i utwórz bucket `cms`.

Lub przez CLI bez UI:

```bash
kubectl -n cms-prod exec deployment/cms-minio -- \
  mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

kubectl -n cms-prod exec deployment/cms-minio -- \
  mc mb local/cms
```

### Konfiguracja Laravel (.env)

```dotenv
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<root-user z sekretu>
AWS_SECRET_ACCESS_KEY=<root-password z sekretu>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=cms
AWS_ENDPOINT=http://cms-minio.cms-prod.svc.cluster.local:9000
AWS_USE_PATH_STYLE_ENDPOINT=true   # wymagane dla MinIO
AWS_URL=https://api.yourdomain.com/storage   # publiczny URL przez Nginx proxy
```

> **Publiczny dostęp do plików:** MinIO działa wewnątrz klastra. Żeby pliki były dostępne publicznie, dodaj regułę w Ingress lub skonfiguruj MinIO bucket jako publiczny i wystaw port 9000 przez Ingress na osobnej subdomenie (np. `storage.yourdomain.com`).

### Migracja z PVC na MinIO

Jeśli masz już pliki na PVC i chcesz przenieść na MinIO:

```bash
# Skopiuj pliki z poda serwera do MinIO
kubectl -n cms-prod exec deployment/cms-server -- \
  aws s3 sync storage/app/public s3://cms/public \
  --endpoint-url http://cms-minio.cms-prod.svc.cluster.local:9000

# Następnie zmień FILESYSTEM_DISK=s3 w .env i zrestartuj
kubectl -n cms-prod rollout restart deployment/cms-server
```

---

## Podsumowanie

Masz teraz pełny klaster k3s z:

- ✅ Automatycznym TLS (Let's Encrypt przez cert-manager)
- ✅ HTTP → HTTPS redirect (Traefik)
- ✅ Zero-downtime deployów (rolling update)
- ✅ Migracjami przed deployem (Job)
- ✅ Automatycznym restartem po awarii (Kubernetes)
- ✅ HPA — autoskalowaniem przy obciążeniu
- ✅ CI/CD (GitHub Actions lub GitLab) — lintowanie, testy, build, deploy
- ✅ MySQL z persystentnym wolumenem
- ✅ Redis z persystentnym wolumenem
- ✅ Codziennymi backupami MySQL

Całość za ~$10-12/miesiąc na Hetzner CX33.

---
