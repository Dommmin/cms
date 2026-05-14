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
   - [4.4 Automatyczna konfiguracja klastra — bootstrap.sh](#44-automatyczna-konfiguracja-klastra--bootstrapsh) ← **zalecane po instalacji k3s**
5. [Instalacja cert-manager (SSL Let's Encrypt)](#5-instalacja-cert-manager-ssl-lets-encrypt)
6. [Konfiguracja Traefik (HTTPS + przekierowanie)](#6-konfiguracja-traefik-https--przekierowanie)
7. [Przygotowanie klastra — namespace i sekrety](#7-przygotowanie-klastra--namespace-i-sekrety)
8. [Wdrożenie bazy danych i cache (MySQL + Redis)](#8-wdrożenie-bazy-danych-i-cache-mysql--redis)
9. [Wdrożenie Gotenberg (PDF)](#9-wdrożenie-gotenberg-pdf)
10. [Wdrożenie Typesense (full-text search)](#10-wdrożenie-typesense-full-text-search)
11. [Pull Secret dla Container Registry (GHCR / GitLab)](#11-pull-secret-dla-container-registry-ghcr--gitlab)
12. [Wdrożenie aplikacji (serwer + klient)](#12-wdrożenie-aplikacji-serwer--klient)
    - [12.3 Queue worker (joby w tle)](#123-queue-worker-joby-w-tle)
    - [12.4 Scheduler (cron joby Laravel)](#124-scheduler-cron-joby-laravel)
    - [12.5 Mail (SMTP)](#125-mail-smtp)
    - [12.6 Reverb / broadcasting (realtime — chat, notyfikacje)](#126-reverb--broadcasting-realtime--chat-notyfikacje)
    - [12.7 Laravel Excel — gotchas](#127-laravel-excel--gotchas)
13. [Jak CI/CD łączy się z k3s?](#13-jak-cicd-łączy-się-z-k3s)
14. [Konfiguracja GitHub Actions](#14-konfiguracja-github-actions)
15. [Konfiguracja GitLab CI/CD](#15-konfiguracja-gitlab-cicd)
16. [Pierwsze wdrożenie przez CI](#16-pierwsze-wdrożenie-przez-ci)
17. [Weryfikacja — czy wszystko działa?](#17-weryfikacja--czy-wszystko-działa)
18. [Codzienna obsługa — logi, restarty, aktualizacje](#18-codzienna-obsługa--logi-restarty-aktualizacje)
19. [Backup MySQL](#19-backup-mysql)
20. [Najczęstsze problemy (troubleshooting)](#20-najczęstsze-problemy-troubleshooting)
21. [GlitchTip — śledzenie błędów](#21-glitchtip--śledzenie-błędów)
22. [Rancher — zarządzanie klastrem przez UI](#22-rancher--zarządzanie-klastrem-przez-ui)
23. [Czyszczenie dysku](#23-czyszczenie-dysku)
24. [k9s — terminalowy panel zarządzania](#24-k9s--terminalowy-panel-zarządzania)
25. [Rotacja secretów — aktualizacja .env i haseł bez downtime'u](#25-rotacja-secretów--aktualizacja-env-i-haseł-bez-downtimeu)

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
    ├──► app-client (Next.js :3000)       ← publiczny frontend
    │
    └──► app-server (Laravel/Nginx :80)   ← API + admin panel
              │
              ├── app-mysql (MySQL 8)     ← StatefulSet + PVC
              ├── app-redis (Redis 7)     ← Deployment + PVC
              └── app-gotenberg           ← generowanie PDF
```

Wszystko działa w namespace `app`. MySQL i Redis mają persystentne wolumeny na dysku serwera (k3s `local-path` storage class). Obrazy Docker buduje GitLab CI i pushuje do GitLab Container Registry.

---

## 3. Przygotowanie serwera (Hetzner)

### 3.1 Utwórz serwer

#### Jeśli nie masz jeszcze klucza SSH

Klucz SSH tworzysz na **lokalnym komputerze**, nie na serwerze. Jeśli plik `~/.ssh/id_ed25519.pub` już istnieje, możesz pominąć ten krok.

Sprawdź, czy masz już klucz:

```bash
ls -la ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub
```

Jeśli pliki nie istnieją, wygeneruj nowy klucz:

```bash
ssh-keygen -t ed25519 -C "twoj-email@example.com"
```

Gdy `ssh-keygen` zapyta o ścieżkę, zostaw domyślną:

```bash
~/.ssh/id_ed25519
```

Passphrase jest opcjonalne, ale zalecane. Jeśli je ustawisz, system będzie pytał o hasło do klucza przy pierwszym użyciu w sesji.

Wyświetl klucz publiczny:

```bash
cat ~/.ssh/id_ed25519.pub
```

Skopiuj cały wynik zaczynający się od `ssh-ed25519`. To właśnie ten **publiczny** klucz wklejasz w panelu Hetzner. Nigdy nie kopiuj ani nie wysyłaj pliku `~/.ssh/id_ed25519` — to klucz prywatny.

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

#### Jeśli zapomniałeś dodać klucz SSH przy tworzeniu serwera

Najprościej naprawić to, zanim wyłączysz logowanie hasłem.

Jeśli możesz zalogować się hasłem jako `root`, dodaj klucz z lokalnego komputera:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@<IP_SERWERA>
```

Potem sprawdź logowanie kluczem:

```bash
ssh -i ~/.ssh/id_ed25519 root@<IP_SERWERA>
```

Jeśli `ssh-copy-id` nie jest dostępne, zrób to ręcznie:

```bash
# Na lokalnym komputerze
cat ~/.ssh/id_ed25519.pub
```

Skopiuj wynik, zaloguj się na serwer hasłem przez SSH albo konsolę Hetzner, a potem uruchom:

```bash
# Na serwerze
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Wklej publiczny klucz do `authorized_keys`, zapisz plik i przetestuj nowe logowanie z drugiego terminala.

Jeśli nie możesz zalogować się ani hasłem, ani kluczem, użyj konsoli Hetzner lub trybu Rescue, dodaj klucz do `/root/.ssh/authorized_keys`, a w najgorszym przypadku przebuduj serwer z poprawnie dodanym kluczem. Nie wyłączaj `PasswordAuthentication`, dopóki nie potwierdzisz, że logowanie kluczem działa.

### 3.2 Zaloguj się i zaktualizuj system

```bash
ssh root@<IP_SERWERA>

sudo apt update && apt upgrade -y
sudo apt install -y curl wget git htop vim
```

### 3.3 Ustaw hostname

```bash
hostnamectl set-hostname app
echo "127.0.0.1 app" >> /etc/hosts
```

### 3.4 Konfiguracja DNS

W panelu swojego rejestratora domen ustaw rekordy A:

```
yourdomain.com        A  <IP_SERWERA>
www.yourdomain.com    A  <IP_SERWERA>
admin.yourdomain.com  A  <IP_SERWERA>
```

> Panel admina i API Laravel działają pod tą samą domeną `admin.yourdomain.com` — serwer obsługuje zarówno `/admin/*` (Inertia SPA) jak i `/api/v1/*` (REST API).

Poczekaj ~5-15 minut na propagację DNS. Możesz sprawdzić:

```bash
dig +short yourdomain.com
# powinno zwrócić IP serwera
```

### 3.5 SSH — konfiguracja na lokalnym komputerze

Zanim zalogujesz się na serwer, skonfiguruj wygodny alias SSH na **lokalnym komputerze**. Dzięki temu zamiast pisać `ssh root@123.456.789.0` za każdym razem, wystarczy `ssh app`.

Edytuj (lub utwórz) plik `~/.ssh/config`:

```bash
nano ~/.ssh/config
```

Dodaj:

```
Host app
    HostName <IP_SERWERA>
    User root
    IdentityFile ~/.ssh/id_ed25519
```

Od teraz:

```bash
ssh app                  # logowanie
scp plik.txt app:/tmp/   # kopiowanie pliku
```

> Jeśli później utworzysz użytkownika `deployer` (sekcja 3.6), zmień `User root` na `User deployer`.

### 3.6 SSH — hardening serwera (wyłącz logowanie hasłem)

Po zalogowaniu na serwer pierwszym krokiem powinno być wyłączenie logowania hasłem — klucz SSH jest znacznie bezpieczniejszy.

#### Opcja A: tylko root z kluczem (prostsze)

Wystarczająca dla jednoosobowego VPS. Zaloguj się i edytuj konfigurację SSH:

```bash
ssh app   # lub: ssh root@<IP_SERWERA>

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
Host app
    HostName <IP_SERWERA>
    User deployer
    IdentityFile ~/.ssh/id_ed25519
```

---

## 4. Instalacja k3s

### 4.1 Zainstaluj k3s

Zaloguj się na serwer i uruchom instalator. **k3s musi być zainstalowany jako root** — niezależnie od tego, czy wybrałeś Opcję A czy B w sekcji 3.6.

```bash
# Opcja A (root): jesteś już zalogowany jako root
ssh root@<IP_SERWERA>

# Opcja B (deployer): zaloguj się i przejdź na roota
ssh deployer@<IP_SERWERA>
sudo -i
```

Uruchom instalator k3s z flagą `K3S_KUBECONFIG_MODE="644"` — dzięki temu plik kubeconfig będzie czytelny dla wszystkich użytkowników serwera (potrzebne w sekcji 4.2, żeby skopiować go bez `sudo`):

**Hetzner Cloud** (z hcloud-controller-manager) — CCM sam prowizjonuje prawdziwy Load Balancer, więc wewnętrzny LB k3s jest zbędny:

```bash
curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -s - --disable=servicelb
```

**Inne providery** (OVHcloud, DigitalOcean, Vultr, bare metal itp.) — bez chmurowego LB potrzebujesz wbudowanego servicelb k3s, który binduje porty 80/443 bezpośrednio na hoście. **Nie dodawaj** `--disable=servicelb`:

```bash
curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -s -
```

> **Co to jest servicelb?**  
> `servicelb` (klipper) to wewnętrzny load balancer k3s. Tworzy pody DaemonSet, które nasłuchują na portach 80/443 hosta i przekazują ruch do Traefika. Bez niego — i bez chmurowego LB — porty 80/443 są niedostępne z internetu, Let's Encrypt HTTP-01 challenge nigdy nie przejdzie i certyfikat TLS nie zostanie wystawiony.
>
> Traefiku **nie wyłączamy** — k3s instaluje go automatycznie, a `HelmChartConfig` z sekcji 4.3 dostroi jego konfigurację (HTTP→HTTPS redirect).

Poczekaj ~30 sekund, a następnie sprawdź (nadal jako root na serwerze):

```bash
kubectl get nodes
# NAME   STATUS   ROLES                  AGE   VERSION
# app    Ready    control-plane,master   1m    v1.31.x+k3s1
```

Status `Ready` — możesz wyjść z SSH.

### 4.2 Skopiuj kubeconfig na lokalny komputer

Na **lokalnym komputerze** (nie na serwerze). Komenda jest taka sama niezależnie od tego, czy używasz `root` czy `deployer` — dzięki `K3S_KUBECONFIG_MODE="644"` z poprzedniego kroku plik jest czytelny bez `sudo`:

```bash
mkdir -p ~/.kube

# root lub deployer — ta sama komenda:
ssh <USER>@<IP_SERWERA> "cat /etc/rancher/k3s/k3s.yaml" \
  | sed "s/127.0.0.1/<IP_SERWERA>/g" \
  > ~/.kube/config-hetzner
```

Gdzie `<USER>` to `root` (Opcja A) lub `deployer` (Opcja B).

```bash
chmod 600 ~/.kube/config-hetzner
export KUBECONFIG=~/.kube/config-hetzner
```

Zweryfikuj połączenie:

```bash
kubectl get nodes
# app   Ready   control-plane,master   2m
```

> **Dodaj do ~/.bashrc lub ~/.zshrc:**  
> `export KUBECONFIG=~/.kube/config-hetzner`  
> żeby nie musieć ustawiać za każdym razem.

Od teraz **nie potrzebujesz już SSH** — wszystkie dalsze komendy `kubectl` wykonujesz lokalnie przez port 6443.

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

### 4.4 Automatyczna konfiguracja klastra — bootstrap.sh

Po zainstalowaniu k3s i skopiowaniu kubeconfig (sekcje 4.1–4.2) masz dwie opcje:

| Opcja                            | Kiedy wybrać                                                                  |
|----------------------------------|-------------------------------------------------------------------------------|
| **A: `bootstrap.sh`** (zalecana) | Nowy klaster, chcesz przejść szybko — skrypt wykona sekcje 5–12 automatycznie |
| **B: Ręcznie** (sekcje 5–12)     | Uczysz się Kubernetes, chcesz pełną kontrolę nad każdym krokiem               |

#### Opcja A — uruchom bootstrap.sh

Wymagania przed uruchomieniem:
- `KUBECONFIG` wskazuje na klaster (sekcja 4.2)
- Repozytorium jest sklonowane lokalnie (katalog `k8s/` musi istnieć)
- Rekordy DNS wskazują na IP serwera (sekcja 3.4)

Z **katalogu głównego repozytorium** na lokalnym komputerze:

```bash
chmod +x k8s/bootstrap.sh
./k8s/bootstrap.sh
```

Skrypt interaktywnie zapyta o:

| Pytanie                     | Co wpisać                                            |
|-----------------------------|------------------------------------------------------|
| Hasło MySQL root            | Silne hasło, min. 16 znaków                          |
| Nazwa użytkownika MySQL     | Domyślnie `app`                                      |
| Hasło MySQL app             | Silne hasło, min. 16 znaków                          |
| Hasło Redis                 | Silne hasło, min. 16 znaków                          |
| Typesense API key           | Losowy klucz, min. 16 znaków                         |
| Typ CI/CD                   | `1` = GitHub Actions, `2` = GitLab CI, Enter = pomiń |
| GitHub/GitLab token         | Do pull secret dla prywatnego rejestru obrazów       |
| E-mail Let's Encrypt        | Powiadomienia o wygasaniu certyfikatów               |
| Ingress deweloperski (HTTP) | `y` jeśli nie masz domeny — używa sslip.io           |
| Ingress produkcyjny (HTTPS) | `Y` (domyślnie) — wymaga DNS + cert-manager          |
| GlitchTip                   | `y` jeśli chcesz self-hosted śledzenie błędów        |
| Ops tooling (Rancher + Uptime Kuma) | `y` jeśli chcesz panel UI klastra i monitoring dostępności — odpala `docker-compose.ops.yml` na serwerze |

**Czas wykonania:** ~5–10 minut (większość to oczekiwanie na MySQL i cert-manager).

Po zakończeniu skrypt wyświetli listę podów w namespace `app` oraz dalsze kroki — konfigurację sekretów CI/CD.

> **Jeśli wybrałeś Opcję A — przejdź do [sekcji 13 (Jak CI/CD łączy się z k3s?)](#13-jak-cicd-łączy-się-z-k3s).** Sekcje 5–12 poniżej opisują to samo co robi skrypt — przydatne jako dokumentacja lub przy ręcznej rekonfiguracji.

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

> **Uwaga o nazwie namespace:** Wszystkie manifesty w `k8s/` mają na stałe wpisany namespace `app` i prefiks zasobów `app-*` (`app-server`, `app-mysql`, `app-redis`, …). To **nie jest** konfigurowalne bez edycji każdego pliku — `bootstrap.sh` i pipeline CI/CD zakładają `app`. Jeśli naprawdę potrzebujesz innej nazwy, zrób globalny `sed` po `k8s/` i zaktualizuj `KUBE_NAMESPACE` w CI.

### 7.1 Utwórz namespace

Namespace to izolowana przestrzeń w klastrze — jak osobny folder dla naszej aplikacji.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespace app
# NAME       STATUS   AGE
# app   Active   5s
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
  username: "app"
  password: "SuperTajneHasloapp456!"
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
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -
```

> **Skąd wziąć APP_KEY?**  
> `docker compose exec php php artisan key:generate --show`

### 7.5 Konfiguracja klienta Next.js — brak sekretu

Next.js po stronie serwera fetchuje dane z API pod wewnętrznym adresem klastra. Ten adres (`API_URL=http://app-server.app.svc.cluster.local/api/v1`) **nie jest wrażliwy** — to po prostu nazwa DNS wewnątrz klastra — więc **nie ma tu żadnego sekretu do utworzenia**.

`API_URL` jest wpisany na stałe jako zwykła zmienna `env:` w [`k8s/client/deployment.yaml`](../k8s/client/deployment.yaml). Nic nie musisz robić ręcznie.

> Zmienne `NEXT_PUBLIC_*` (publiczne, widoczne w przeglądarce) to osobna sprawa — są wstrzykiwane przy buildzie obrazu jako `--build-arg` z `ENV_CLIENT_PROD` (patrz sekcja 14).

---

## 8. Wdrożenie bazy danych i cache (MySQL + Redis)

### 8.1 MySQL

```bash
kubectl apply -f k8s/mysql/statefulset.yaml
kubectl apply -f k8s/mysql/service.yaml
```

Poczekaj, aż MySQL będzie gotowy:

```bash
kubectl -n app get pods --watch
# NAME           READY   STATUS    RESTARTS   AGE
# app-mysql-0    1/1     Running   0          2m
```

> **Dlaczego StatefulSet, a nie Deployment?**  
> StatefulSet gwarantuje stabilną nazwę poda (`app-mysql-0`) i kolejność uruchamiania. Dla baz danych to ważne — dzięki temu DNS `app-mysql-0.app-mysql.app.svc.cluster.local` zawsze wskazuje na tę samą instancję.

Sprawdź czy MySQL działa:

```bash
kubectl -n app exec -it app-mysql-0 -- mysql -u root -p
# Enter password: <root-password z sekretu>
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

Sprawdź połączenie:

```bash
kubectl -n app exec -it deployment/app-redis -- redis-cli -a <REDIS_PASSWORD> ping
# PONG
```

---

## 9. Wdrożenie Gotenberg (PDF)

Gotenberg to mikroserwis do generowania PDF z HTML. Wdrażamy go jako oddzielny pod, dostępny tylko wewnątrz klastra.

```bash
kubectl apply -f k8s/gotenberg/deployment.yaml
kubectl apply -f k8s/gotenberg/service.yaml

kubectl -n app get pods | grep gotenberg
# app-gotenberg-xxxxxxxxx-xxxxx   1/1   Running   0   30s
```

---

## 10. Wdrożenie Typesense (full-text search)

Typesense to szybki silnik full-text search. Aplikacja używa go przez Laravel Scout (`SCOUT_DRIVER=typesense`). Wdrażamy go jako osobny pod dostępny tylko wewnątrz klastra.

### 10.1 Utwórz sekret z kluczem API

Typesense wymaga klucza API do autoryzacji zapytań. Użyj losowego, silnego klucza (min. 16 znaków):

```bash
kubectl create secret generic app-typesense \
  --from-literal=api-key=<TWÓJ_KLUCZ_API> \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -
```

> Ten sam klucz wpisz w PROD_ENV jako `TYPESENSE_API_KEY=<TWÓJ_KLUCZ_API>`.  
> **Ważne:** Nie dodawaj komentarzy (`#`) za wartością — Laravel odczyta je jako część klucza.

### 10.2 Wdróż Typesense

```bash
kubectl apply -f k8s/typesense/pvc.yaml
kubectl apply -f k8s/typesense/deployment.yaml
kubectl apply -f k8s/typesense/service.yaml
```

Poczekaj na uruchomienie (~20 sekund inicjalizacji):

```bash
kubectl -n app rollout status deployment/app-typesense --timeout=120s
# deployment "app-typesense" successfully rolled out
```

Sprawdź health check:

```bash
kubectl -n app exec deployment/app-typesense -- wget -qO- http://localhost:8108/health
# {"ok":true}
```

### 10.3 Konfiguracja w PROD_ENV

Upewnij się, że w `PROD_ENV` (zmienna CI/CD) masz:

```dotenv
SCOUT_DRIVER=typesense
SCOUT_QUEUE=true
TYPESENSE_HOST=app-typesense.app.svc.cluster.local
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=<TWÓJ_KLUCZ_API>
```

### 10.4 Zaindeksuj dane po pierwszym wdrożeniu

Po pierwszym deployu zaimportuj istniejące dane do indeksów:

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan scout:import "App\Models\Product"

kubectl -n app exec deployment/app-server -- \
  php artisan scout:import "App\Models\BlogPost"
```

> Scout automatycznie indeksuje nowe i zmienione rekordy przez kolejkę (Redis) — import ręczny jest potrzebny tylko raz, przy pierwszym wdrożeniu.

---

## 11. Pull Secret dla Container Registry (GHCR / GitLab)

Twój klaster musi wiedzieć, jak pobierać prywatne obrazy Docker. Konfiguracja zależy od tego, jakiego CI/CD używasz.

> **Ważne:** Nazwa sekretu `ghcr-pull-secret` jest taka sama w obu przypadkach — manifesty deploymentów (`k8s/server/deployment.yaml`, `k8s/client/deployment.yaml`) już jej używają. Nie zmieniaj tej nazwy.

### 11.1 GitHub Container Registry (GHCR)

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
  --namespace=app
```

### 11.2 GitLab Container Registry

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
  --namespace=app
```

---

## 12. Wdrożenie aplikacji (serwer + klient)

Przed pierwszym deployem przez CI/CD musimy ręcznie zastosować manifesty infrastruktury. Obrazy Docker będą budowane przez pipeline — na razie używamy `:latest` (po pierwszym CI pushu).

### 12.1 Persistent storage dla uploadsów i logów

Zanim uruchomisz serwer, utwórz PVC (PersistentVolumeClaim) — wolumen na dysku VPS, który przechowa uploadowane pliki i logi Laravel.

```bash
kubectl apply -f k8s/server/pvc-storage.yaml
```

Sprawdź że PVC jest gotowe:

```bash
kubectl -n app get pvc
# NAME                 STATUS   VOLUME         CAPACITY   STORAGECLASS
# app-server-storage   Bound    pvc-xxxxxxxx   20Gi       local-path
```

`STATUS: Bound` oznacza że wolumen jest gotowy. `local-path` to wbudowany w k3s mechanizm przechowywania danych na lokalnym dysku VPS.

> **Co przechowuje PVC?**
> ```
> PVC (20Gi na dysku VPS)
>   ├── storage/app/                   ← uploadowane pliki (zdjęcia, PDF-y, załączniki)
>   ├── storage/logs/                  ← logi Laravel (gdy LOG_CHANNEL=daily lub stack)
>   └── storage/framework/             ← cache widoków, sesje, kolejki, eksporty Excela
>       ├── cache/data/                  ← cache aplikacji (gdy CACHE_STORE=file)
>       ├── cache/laravel-excel/         ← tymczasowe pliki dla queued Excel exports
>       ├── sessions/                    ← sesje (gdy SESSION_DRIVER=file)
>       └── views/                       ← skompilowane Blade-y
> ```
> Dane przeżywają restarty podów i deploye. Giną tylko jeśli ręcznie usuniesz PVC.

> **Ważne:** Katalogi `storage/framework/*` muszą istnieć **zanim** uruchomi się pod — inaczej:
> - `php artisan view:cache` wywala się przy starcie
> - queued Excel exports padają z `fopen(... laravel-excel/...): No such file or directory`
> - sesje filesowe fail-ują
>
> Jeśli Twój `Dockerfile` nie tworzy tych katalogów w obrazie, **dodaj je do `command`/`entrypoint`** poda lub do migration joba:
> ```bash
> mkdir -p storage/framework/{cache/data,cache/laravel-excel,sessions,views} \
>          storage/app/{public,private} storage/logs \
>   && chown -R www-data:www-data storage bootstrap/cache
> ```
> Najlepsza praktyka: dodaj tę linię do `Dockerfile` (warstwa zaraz przed `USER www-data`) — wtedy każdy nowy obraz ma poprawną strukturę.

W pliku `.env` produkcyjnym ustaw:

```dotenv
FILESYSTEM_DISK=public   # pliki na lokalny dysk (przez PVC)
LOG_CHANNEL=stderr       # logi do kubectl logs (najwygodniejsze w k8s)
# LOG_CHANNEL=stack      # lub oba: stderr + plik
# LOG_STACK=stderr,daily
```

> **Ograniczenie PVC:** działa tylko przy `replicas: 1`. Przy skalowaniu do 2+ podów przejdź na MinIO — patrz sekcja z bonusami na końcu przewodnika.

### 12.2 Wdrożenie serwerów

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
kubectl -n app get all
```

Powinieneś zobaczyć:

```
NAME                               READY   STATUS
pod/app-server-xxxxxxxxx-xxxxx     1/1     Running
pod/app-queue-xxxxxxxxx-xxxxx      1/1     Running
pod/app-client-xxxxxxxxx-xxxxx     1/1     Running
pod/app-mysql-0                    1/1     Running
pod/app-redis-xxxxxxxxx-xxxxx      1/1     Running
pod/app-gotenberg-xxxxxxxxx-xxxxx  1/1     Running

NAME                TYPE        CLUSTER-IP
service/app-server  ClusterIP   10.43.x.x
service/app-client  ClusterIP   10.43.x.x
service/app-mysql   ClusterIP   None
service/app-redis   ClusterIP   10.43.x.x
service/app-gotenberg ClusterIP 10.43.x.x
```

### 12.3 Queue worker (joby w tle)

Queue worker to **osobny Deployment** (`app-queue`), który nieprzerwanie czyta kolejkę Redis i wykonuje joby z aplikacji. Bez niego:

- maile, notyfikacje SSE, indeksacja Scout → wszystko leci do kolejki i nikt tego nie przetworzy
- konwersje obrazów Spatie MediaLibrary → uploadowane zdjęcia nie dostają thumbów
- queued Excel exports → użytkownik nigdy nie dostaje pliku
- powiadomienia e-mail po zakupie / rejestracji → nigdy nie wychodzą

Manifest `k8s/server/deployment-queue.yaml` startuje 2 repliki (HA) i uruchamia:

```
php artisan queue:work redis --tries=3 --timeout=300 --max-jobs=1000 --max-time=3600
```

`--max-time=3600` i `--max-jobs=1000` powodują, że worker sam się restartuje co godzinę / co 1000 jobów — to chroni przed wyciekami pamięci w długich procesach.

**Sprawdź że workery działają:**

```bash
kubectl -n app get pods -l component=queue
# NAME                       READY   STATUS    RESTARTS   AGE
# app-queue-xxxxx-aaaaa      1/1     Running   0          12m
# app-queue-xxxxx-bbbbb      1/1     Running   0          12m

kubectl -n app logs deployment/app-queue --tail=30
```

**Failed jobs — co z nimi robić:**

Joby, które wywaliły się 3 razy, trafiają do tabeli `failed_jobs`. Sprawdź je regularnie:

```bash
# Lista
kubectl -n app exec deployment/app-server -- php artisan queue:failed

# Szczegóły konkretnego joba (exception)
kubectl -n app exec deployment/app-server -- \
  php artisan queue:failed | grep "ProductsExport"

# Retry pojedynczego joba
kubectl -n app exec deployment/app-server -- \
  php artisan queue:retry <UUID>

# Retry wszystkich
kubectl -n app exec deployment/app-server -- php artisan queue:retry all

# Wywal wszystkie failed jobs (czyszczenie)
kubectl -n app exec deployment/app-server -- php artisan queue:flush
```

**Skalowanie:** Jeśli kolejka rośnie szybciej niż workerzy ją przetwarzają, zwiększ repliki:

```bash
kubectl -n app scale deployment/app-queue --replicas=4
```

Pamiętaj że każdy worker pobiera ten sam `.env` — duża ilość workerów = większe zużycie pamięci i połączeń do Redis/MySQL.

### 12.4 Scheduler (cron joby Laravel)

Laravel ma wbudowany scheduler — w `routes/console.php` definiujesz zadania, które mają chodzić cyklicznie (np. publikacja zaplanowanych postów, czyszczenie koszyków). Lista zadań:

```bash
kubectl -n app exec deployment/app-server -- php artisan schedule:list
```

W tradycyjnym serwerze ustawiasz w `crontab` jeden wpis:
```
* * * * * php artisan schedule:run >> /dev/null 2>&1
```

W k3s odpowiednikiem tego jest **`CronJob`** (`k8s/server/cronjob-scheduler.yaml`) — Kubernetes co minutę startuje krótkotrwały pod, który odpala `php artisan schedule:run`, i go zabija.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: app-scheduler
spec:
  schedule: "* * * * *"          # co minutę
  concurrencyPolicy: Forbid       # nie startuj nowego, jeśli poprzedni jeszcze leci
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

**Weryfikacja:**

```bash
# CronJob istnieje
kubectl -n app get cronjob app-scheduler
# NAME            SCHEDULE    LAST SCHEDULE   AGE
# app-scheduler   * * * * *   39s             1d

# Ostatnie kilka wywołań (pody z statusem Completed)
kubectl -n app get pods | grep app-scheduler | tail -5

# Logi z ostatniego runa
LAST=$(kubectl -n app get pods -o name | grep scheduler | tail -1)
kubectl -n app logs $LAST
# Running ['artisan' blog:publish-scheduled] . 2 sek. DONE
# Running ['artisan' cms:process-scheduled-pages]  2 sek. DONE
```

**Częsta pomyłka:** CronJob używa tego samego obrazu co `app-server`. Pipeline aktualizuje obraz w obu (`kubectl set image deployment/app-server` **i** `kubectl set image cronjob/app-scheduler`) — sprawdź swój `.github/workflows/deploy.yml`, bo łatwo o tym zapomnieć.

### 12.5 Mail (SMTP)

Laravel wysyła maile transactional przez SMTP. W k3s masz dwie opcje:

#### Opcja A — zewnętrzny SMTP (rekomendowane na produkcję)

Mailgun, SendGrid, Resend, Postmark, Amazon SES, własny SMTP. Wpisz dane w `PROD_ENV`:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com         # lub smtp.mailgun.org, smtp.eu.mailgun.org, ...
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxxxxxxxxxxxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

> **Najczęstsza pomyłka:** `MAIL_HOST=smtp.yourdomain.com` jako placeholder — wszystkie maile fail-ują z `getaddrinfo failed`. Sprawdź realny config:
> ```bash
> kubectl -n app exec deployment/app-server -- \
>   php artisan config:show mail.mailers.smtp.host
> ```

#### Opcja B — mailpit na klastrze (do testów / staging)

[Mailpit](https://mailpit.axllent.org/) to lekki SMTP server z webowym UI — łapie wszystkie maile w pamięci i pokazuje je w przeglądarce, nic nie wychodzi na zewnątrz. Idealny do staging i developerskich smoke-testów.

Zapisz manifest `k8s/mailpit/deployment.yaml`:

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

W `PROD_ENV` (lub `STAGING_ENV`) ustaw:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=mailpit            # usługa DNS w klastrze
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="no-reply@yourdomain.test"
```

Webowe UI (port 8025) wyeksponuj przez Ingress albo `kubectl port-forward`:

```bash
kubectl -n app port-forward svc/mailpit 8025:8025
# otwórz http://localhost:8025
```

**Test wysyłki:**

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='Mail::raw("test ".now(), fn($m) => $m->to("test@example.com")->subject("ping"));'
```

### 12.6 Reverb / broadcasting (realtime — chat, notyfikacje)

Jeśli aplikacja używa WebSocket-ów (Laravel Reverb, Pusher, Soketi) — np. live chat support, push notyfikacji w panelu admina — potrzebujesz osobnego deploya.

Najprościej z **Laravel Reverb** (oficjalny, dołączony do Laravel ≥11):

```yaml
# k8s/reverb/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: app-reverb, namespace: app }
spec:
  replicas: 1                     # Reverb trzyma WS in-memory; HA wymaga zewnętrznego state (Redis pub/sub działa, ale klienci są sticky)
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

Wymagane zmienne w `PROD_ENV`:

```dotenv
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=<losowy_id>
REVERB_APP_KEY=<losowy_key>
REVERB_APP_SECRET=<losowy_secret>
REVERB_HOST=app-reverb           # serwerowo, w klastrze
REVERB_PORT=8080
REVERB_SCHEME=http

# Frontend / build args klienta:
NEXT_PUBLIC_REVERB_APP_KEY=<ten sam key>
NEXT_PUBLIC_REVERB_HOST=ws.yourdomain.com   # publiczny host, przez Ingress
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

W Ingressie dodaj host `ws.yourdomain.com` ze ścieżką `/app` → `app-reverb:8080`. Traefik **z definicji** obsługuje WebSocket upgrade — nic dodatkowo nie ustawiasz.

**Bez Reverba:** w `.env` zostaw `BROADCAST_CONNECTION=log` (eventy będą tylko logowane) lub `redis` (eventy lecą do Redis pub/sub, ale frontend nie ma jak ich odebrać). Chat / SSE notyfikacje będą działać tylko przez polling.

### 12.7 Laravel Excel — gotchas

Eksporty `Maatwebsite\Excel` w tym projekcie (`ProductsExport`, `OrdersExport`, `CustomersExport`, `CustomReportExport`) **implementują `ShouldQueue`** — to znaczy że `Excel::store(...)` natychmiast wraca, a faktyczny zapis pliku dzieje się w workerze.

Konsekwencje:

1. **Wymagany queue worker** — bez `app-queue` Running eksporty nigdy nie powstaną.
2. **Wymagany katalog cache** — worker pisze pliki tymczasowe do `storage/framework/cache/laravel-excel/`. Jeśli katalog nie istnieje, queue job fail-uje z:
   ```
   ErrorException: fopen(.../storage/framework/cache/laravel-excel/laravel-excel-XXX.xlsx): No such file or directory
   ```
   Patrz "Co przechowuje PVC?" wyżej — `mkdir -p storage/framework/cache/laravel-excel`.
3. **Disk = `local`** w `config/excel.php` celuje w `storage/app` (lub `storage/app/private` od Laravel 11). Jeśli chcesz że pliki przeżyją restart poda — to PVC obsługuje, jeśli `replicas: 1`. Przy 2+ replikach przerzuć eksporty na MinIO/S3 (`Excel::store(..., 's3')`).

### 12.8 Testowanie bez domeny (sslip.io)

Jeśli nie masz jeszcze prawdziwej domeny, użyj ingressu deweloperskiego — tylko HTTP, bez TLS:

```bash
# Edytuj k8s/ingress-dev.yaml i zamień 1.2.3.4 na IP swojego serwera
kubectl apply -f k8s/ingress-dev.yaml
```

Usługa `sslip.io` automatycznie rozwiązuje subdomeny:
- `app.1.2.3.4.sslip.io` → IP Twojego serwera (frontend Next.js)
- `api.1.2.3.4.sslip.io` → IP Twojego serwera (admin Laravel)

Przełącz na ingress produkcyjny, gdy domena będzie gotowa:

```bash
kubectl delete -f k8s/ingress-dev.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 13. Jak CI/CD łączy się z k3s?

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

| Tradycyjny SSH | Kubernetes                           |
|----------------|--------------------------------------|
| `SSH_HOST`     | ✅ zawarte w kubeconfig               |
| `SSH_PORT`     | ✅ zawarte w kubeconfig (6443)        |
| `SSH_USER`     | ✅ zawarte w kubeconfig (client cert) |
| `SSH_KEY`      | ✅ zawarte w kubeconfig (client key)  |

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

## 14. Konfiguracja GitHub Actions

Repozytorium zawiera plik `.github/workflows/deploy.yml` z pełnym pipeline'em. Musisz tylko skonfigurować zmienne w GitHub.

### 14.1 Zmienne i sekrety

W GitHub: **Settings → Secrets and Actions → Secrets / Variables**

#### Secrets (write-only, maskowane w logach)

| Secret            | Opis                                      |
|-------------------|-------------------------------------------|
| `KUBECONFIG_PROD` | Surowa treść kubeconfig — patrz sekcja 13 |

```bash
# Jak uzyskać wartość (bez base64):
cat ~/.kube/config-hetzner
```

#### Variables (widoczne i edytowalne w UI)

| Variable          | Przykład                            | Opis                                       |
|-------------------|-------------------------------------|--------------------------------------------|
| `PROD_ENV`        | *(pełna treść .env produkcyjnego)*  | Automatycznie sync do k8s Secret           |
| `ENV_CLIENT_PROD` | *(pełna treść .env frontendowego)*  | Build-time zmienne dla Next.js (multiline) |

> **Dlaczego `PROD_ENV` jako Variable, a nie Secret?**  
> Secrets są write-only — raz wklejonego nie możesz odczytać ani edytować linijka po linijce. Variables są widoczne w UI, więc łatwo sprawdzisz co jest ustawione. Pipeline i tak sync'uje wartość do k8s Secret przed deployem.

#### Jak ustawić PROD_ENV

Treść to dosłownie zawartość Twojego `server/.env.production`:

```dotenv
APP_NAME="Myapp"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_HOST=app-mysql.app.svc.cluster.local
DB_PASSWORD=SuperTajneHaslo456!

REDIS_HOST=app-redis.app.svc.cluster.local
REDIS_PASSWORD=SuperTajneHasloRedis789!

GOTENBERG_URL=http://app-gotenberg.app.svc.cluster.local:3000
...
```

GitHub obsługuje wieloliniowe Variables — wklej całą treść.

#### Jak ustawić ENV_CLIENT_PROD

Treść to `.env` dla frontendu Next.js — tylko zmienne build-time potrzebne przy budowaniu obrazu:

```dotenv
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Myapp
```

Dodaj tyle zmiennych `NEXT_PUBLIC_*` ile potrzebujesz. Pipeline automatycznie przekaże je wszystkie do `docker buildx build` jako wpisy `--build-arg`.

### 14.2 Jak działa pipeline

```
push → master/main
        │
        ├── lint-server    (Pint, Rector, PHPStan, ESLint, Prettier)
        ├── lint-client    (TypeScript, ESLint, Prettier)
        ├── security       (composer audit, npm audit)
        ├── test           (Pest PHP — matrix 8.4 + 8.5)
        │
        ├── build-server   → ghcr.io/<owner>/app-server:abc1234
        ├── build-client   → ghcr.io/<owner>/app-client:abc1234
        │
        └── deploy
              ├── 0. kubectl create secret app-server-env (sync PROD_ENV)
              ├── 1. kubectl apply job-migrate (migracje DB, wait 2 min)
              ├── 2. kubectl set image deployment/app-server
              ├── 3. kubectl set image deployment/app-queue
              ├── 4. kubectl set image cronjob/app-scheduler
              └── 5. kubectl set image deployment/app-client
```

Każdy deploy:
1. Najpierw aktualizuje k8s Secret z `PROD_ENV` — żaden restart nie jest potrzebny dla migracji
2. Uruchamia `php artisan migrate --force` jako jednorazowy Job z **nowym** obrazem
3. Czeka na jego zakończenie (max 2 minuty)
4. Dopiero potem robi rolling update deploymentów

Dzięki temu migracje zawsze są przed nowym kodem — żadnych „column does not exist".

### 14.3 Obrazy bez serwera rejestru

GitHub Container Registry (GHCR) jest wbudowany w GitHub — nie musisz konfigurować żadnego zewnętrznego rejestru. Pipeline automatycznie loguje się z `GITHUB_TOKEN` (dostępny automatycznie w każdym workflow).

### 14.4 GitHub Environments i ochrona deploymentu

Job `deploy` używa `environment: production`. Reguły ochrony skonfigurujesz w **Settings → Environments → production**:

- Wymagani recenzenci przed deployem
- Wait timer (np. 5-minutowe opóźnienie)
- Whitelist gałęzi deploymentu

Job używa też grupy `concurrency` (`production-deploy`) z `cancel-in-progress: false` — trwający deploy **nigdy** nie jest anulowany przez kolejny push.

---

## 15. Konfiguracja GitLab CI/CD

Repozytorium zawiera plik `.gitlab-ci.yml` z pełnym pipeline'em. Musisz tylko skonfigurować zmienne.

### 15.1 Zmienne CI/CD


W GitLab: **Settings → CI/CD → Variables → Add variable**

#### Wymagane zmienne

| Zmienna           | Typ      | Masked | Protected | Opis                                       |
|-------------------|----------|--------|-----------|--------------------------------------------|
| `KUBECONFIG`      | Variable | ✅      | ✅         | Surowa treść kubeconfig — patrz sekcja 13  |
| `SERVER_ENV`      | Variable | ✅      | ✅         | Pełna treść `server/.env.production`       |
| `ENV_CLIENT_PROD` | Variable | ❌      | ❌         | Build-time zmienne dla Next.js (multiline) |

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
APP_NAME="Myapp"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
...
```

Wklej całą treść jako wartość zmiennej (GitLab obsługuje wieloliniowe zmienne).

### 15.2 Jak działa pipeline

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
              ├── 2. kubectl set image deployment/app-server
              ├── 3. kubectl set image deployment/app-queue
              ├── 4. kubectl set image cronjob/app-scheduler
              └── 5. kubectl set image deployment/app-client
```

---

## 16. Pierwsze wdrożenie przez CI

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
kubectl -n app get pods
kubectl -n app get ingress
```

Sprawdź certyfikat TLS:

```bash
kubectl -n app describe certificate app-tls
# Status: True (Ready)
```

Wejdź w przeglądarkę:
- `https://yourdomain.com` — frontend Next.js
- `https://api.yourdomain.com/health` — health check Laravel (powinien zwrócić `{"status":"ok"}`)

---

## 17. Weryfikacja — czy wszystko działa?

### Checklist po pierwszym wdrożeniu

```bash
# Wszystkie pody Running
kubectl -n app get pods

# Certyfikat TLS wystawiony
kubectl -n app get certificate
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   5m

# Ingress ma adres IP
kubectl -n app get ingress
# NAME          CLASS     HOSTS              ADDRESS       PORTS
# app-ingress   traefik   yourdomain.com...  <IP>          80, 443

# Laravel odpowiada
curl -s https://api.yourdomain.com/health
# {"status":"ok","timestamp":"..."}

# Frontend odpowiada
curl -I https://yourdomain.com
# HTTP/2 200

# Migracje się wykonały
kubectl -n app exec -it deployment/app-server -- \
  php artisan migrate:status | tail -5

# Queue workers działają
kubectl -n app logs deployment/app-queue --tail=20
```

### Health probes

Deployment serwera ma dwa probe'y:
- **Liveness** (`/healthz`): poziom nginx — Kubernetes restartuje poda, jeśli proces jest martwy
- **Readiness** (`/health`): endpoint health Laravela — Kubernetes nie kieruje ruchu, dopóki aplikacja nie jest gotowa

### Test uploadów

Zaloguj się do panelu admina i spróbuj wgrać obraz — weryfikuje MySQL, storage (S3/R2) i nginx (body size limit).

---

## 18. Codzienna obsługa — logi, restarty, aktualizacje

### Podgląd logów

```bash
# Logi konkretnego poda (live)
kubectl -n app logs -f deployment/app-server

# Logi queue workers
kubectl -n app logs -f deployment/app-queue

# Logi kilku ostatnich podów (po restarcie)
kubectl -n app logs deployment/app-server --previous

# Logi z ostatnich 1 godziny
kubectl -n app logs deployment/app-server --since=1h
```

### Restart poda / deploymentu

```bash
# Restart deployment (tworzy nowe pody rolling)
kubectl -n app rollout restart deployment/app-server

# Wymuszony restart konkretnego poda (Kubernetes zastąpi go nowym)
kubectl -n app delete pod <nazwa-poda>
```

### Wejście do kontenera (jak docker exec)

```bash
kubectl -n app exec -it deployment/app-server -- bash

# Wewnątrz:
php artisan tinker
php artisan cache:clear
php artisan queue:restart
```

### Sprawdzenie zasobów (CPU / RAM)

```bash
kubectl -n app top pods
# NAME                        CPU(cores)   MEMORY(bytes)
# app-server-xxx              45m          210Mi
# app-queue-xxx               12m          128Mi
# app-client-xxx              8m           95Mi
# app-mysql-0                 35m          480Mi
# app-redis-xxx               3m           28Mi
```

### Rollback deploymentu

Jeśli nowa wersja psuje coś krytycznego:

```bash
# Sprawdź historię
kubectl -n app rollout history deployment/app-server

# Rollback do poprzedniej wersji
kubectl -n app rollout undo deployment/app-server

# Rollback do konkretnej wersji
kubectl -n app rollout undo deployment/app-server --to-revision=2
```

### Aktualizacja k3s

```bash
# Na serwerze
curl -sfL https://get.k3s.io | sh -
# k3s sam wykryje istniejącą instalację i zaktualizuje się
```

---

## 19. Backup MySQL

MySQL działa na PersistentVolume — dane są na dysku serwera. Nie polegaj jednak wyłącznie na tym!

### Ręczny backup

```bash
kubectl -n app exec app-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASSWORD> app \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automatyczny backup przez CronJob

Stwórz plik `k8s/mysql/cronjob-backup.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: app-mysql-backup
  namespace: app
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
                  mysqldump -h app-mysql -u root -p$MYSQL_ROOT_PASSWORD app \
                    | gzip > /backup/app_$(date +%Y%m%d_%H%M%S).sql.gz
                  # Usuń backupy starsze niż 7 dni
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
                path: /opt/app-backups    # katalog na serwerze
                type: DirectoryOrCreate
          restartPolicy: OnFailure
```

```bash
# Na serwerze utwórz katalog
mkdir -p /opt/app-backups

# Zastosuj CronJob
kubectl apply -f k8s/mysql/cronjob-backup.yaml
```

> **Zalecenie:** Dodatkowo synchronizuj katalog `/opt/app-backups` na zewnętrzny storage (np. Hetzner Object Storage, Backblaze B2) narzędziem `rclone`.

---

## 20. Najczęstsze problemy (troubleshooting)

### Pod utknął w `Pending`

```bash
kubectl -n app describe pod <nazwa-poda>
```

Szukaj sekcji `Events` na dole. Typowe przyczyny:
- `Insufficient memory` — za mało RAM na węźle
- `ImagePullBackOff` — błędny pull secret lub zły adres obrazu
- `PVC not bound` — problem ze storage class

### `ImagePullBackOff` — nie może pobrać obrazu

```bash
kubectl -n app get secret ghcr-pull-secret -o yaml
# Sprawdź czy secret istnieje

# Sprawdź czy deploy token jest aktywny w GitLab
# Settings → Repository → Deploy tokens
```

Odtwórz sekret:

```bash
kubectl -n app delete secret ghcr-pull-secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<nowy-token-username> \
  --docker-password=<nowy-token-password> \
  --namespace=app
```

### Certyfikat TLS nie jest wystawiony

```bash
kubectl -n app describe certificate app-tls
kubectl -n cert-manager logs deployment/cert-manager | grep ERROR
```

Najczęstsze przyczyny:
- DNS jeszcze nie propagował (poczekaj 15 min)
- Port 80 zablokowany przez firewall (Let's Encrypt używa HTTP challenge)
- **servicelb wyłączone bez chmurowego LB** — porty 80/443 niedostępne na hoście; sprawdź `sudo ss -tlnp | grep :80` na serwerze; jeśli nic nie nasłuchuje — patrz sekcja 4.1
- Przekroczyłeś limit certyfikatów Let's Encrypt (5 na tydzień na domenę)

### cert-manager: `x509: certificate signed by unknown authority` przy tworzeniu ClusterIssuer

```
Error from server (InternalError): error when creating "STDIN": Internal error
occurred: failed calling webhook "webhook.cert-manager.io": ... tls: failed to
verify certificate: x509: certificate signed by unknown authority
```

Race condition: pody cert-managera są `Running`, ale `cainjector` nie zdążył jeszcze wstrzyknąć certyfikatu serwującego do webhooka. `kubectl rollout status` tego **nie** wykrywa — pod jest "ready" zanim webhook faktycznie odpowiada.

`bootstrap.sh` ma na to probe (server-side dry-run w pętli, do 180 s). Jeśli mimo to trafisz na ten błąd przy ręcznej instalacji — po prostu poczekaj ~30 s i ponów `kubectl apply` ClusterIssuera:

```bash
# sprawdź że webhook faktycznie odpowiada
kubectl -n cert-manager get pods
until kubectl apply --dry-run=server -f k8s/cert-manager/cluster-issuer.yaml >/dev/null 2>&1; do
  echo "webhook not ready yet, retrying in 5s..."; sleep 5
done
kubectl apply -f k8s/cert-manager/cluster-issuer.yaml
```

### Laravel zwraca błąd 500

```bash
kubectl -n app logs deployment/app-server --tail=50
kubectl -n app exec -it deployment/app-server -- cat storage/logs/laravel.log | tail -50
```

### Migracja nie przeszła

```bash
# Sprawdź logi zakończonego joba
kubectl -n app get jobs
kubectl -n app logs job/app-migrate-<SHA>
```

### Brak połączenia z MySQL

```bash
# Test z poda serwera
kubectl -n app exec -it deployment/app-server -- \
  php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';"
```

Sprawdź czy `DB_HOST` w sekrecie zgadza się z `app-mysql.app.svc.cluster.local`.

### Typesense: kolekcja istnieje, ale `num_documents=0`

Po `scout:import` w logach kolekcja jest, ale dokumenty się nie indeksują. Sprawdź workera:

```bash
kubectl -n app logs deployment/app-queue --tail=50 | grep -A3 -i scout
```

Typowy błąd: `Error importing document: Field 'is_featured' must be a bool` — to znaczy że `toSearchableArray()` w modelu zwraca **int** zamiast **bool** (bo brakuje `'is_featured' => 'boolean'` w `$casts`). Pomóc może rebuild obrazu z poprawnego commita lub dodanie jawnego rzutowania `(bool) $this->is_featured` w `toSearchableArray()`.

Po naprawie:

```bash
# Wyczyść starą kolekcję i zaimportuj ponownie
kubectl -n app exec deployment/app-server -- php artisan scout:flush "App\Models\Product"
kubectl -n app exec deployment/app-server -- php artisan scout:import "App\Models\Product"
```

### Excel export wywala `fopen(.../laravel-excel/...): No such file or directory`

Queued export Maatwebsite/Excel próbuje pisać do `storage/framework/cache/laravel-excel/`, a katalog nie istnieje na PVC. Utwórz go w każdym podzie korzystającym z tego volume (server + queue):

```bash
for pod in $(kubectl -n app get pods -l 'component in (server,queue)' -o name); do
  kubectl -n app exec $pod -- sh -c \
    'mkdir -p storage/framework/cache/laravel-excel && chown www-data:www-data storage/framework/cache/laravel-excel'
done
```

Trwałe rozwiązanie: dodaj `mkdir -p` do `Dockerfile` (warstwa przed `USER www-data`) — patrz sekcja 12.1.

### Maile nie wychodzą — `Name does not resolve`

```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='try{ Mail::raw("t",fn($m)=>$m->to("x@x")->subject("p")); echo "OK"; }catch(\Throwable $e){echo $e->getMessage();}'
# Connection could not be established with host "smtp.yourdomain.com:587": getaddrinfo failed
```

Najczęstsze przyczyny:
1. `MAIL_HOST` w `PROD_ENV` to placeholder (`smtp.yourdomain.com`) — wpisz prawdziwy SMTP albo postaw mailpita (sekcja 12.5).
2. `MAIL_HOST=mailpit` ale brak Service `mailpit` w klastrze — `kubectl -n app get svc mailpit`.
3. Firewall serwera blokuje wyjściowy 587/465 — sprawdź `nc -zv smtp.host 587` z poda.

### Failed jobs rosną (queue:failed → setki rekordów)

Często widoczne po: zmianie schematu DB, refactorze nazw klas jobów, błędach Scout/Media. Workflow:

```bash
# 1. zobacz typy padających jobów
kubectl -n app exec deployment/app-server -- php artisan queue:failed | awk '{print $5}' | sort | uniq -c

# 2. zobacz jeden exception
kubectl -n app exec deployment/app-server -- php artisan tinker --execute='echo DB::table("failed_jobs")->latest("failed_at")->value("exception");' | head -c 500

# 3. po naprawie kodu — retry albo wyrzuć
kubectl -n app exec deployment/app-server -- php artisan queue:retry all
# lub: queue:flush  (kasuje wszystkie failed)
```

### HPA nie skaluje

```bash
kubectl -n app get hpa
# Jeśli TARGETS = <unknown>/70% — metrics-server nie działa

# Sprawdź czy metrics-server jest zainstalowany
kubectl -n kube-system get deployment metrics-server
```

Jeśli metrics-server nie ma — zainstaluj:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 21. GlitchTip — śledzenie błędów

GlitchTip to self-hosted, open-source alternatywa dla Sentry. Używa tego samego SDK co Sentry — nie trzeba zmieniać kodu, wystarczy podmienić DSN na adres własnej instancji.

### 21.1 Przygotuj `values.yaml`

W repo jest `k8s/glitchtip/values.example.yaml` jako szablon. **Nigdy nie commituj** plików z prawdziwymi sekretami — `.gitignore` już ignoruje `k8s/glitchtip/values.yaml`:

```bash
cp k8s/glitchtip/values.example.yaml k8s/glitchtip/values.yaml
```

Edytuj `k8s/glitchtip/values.yaml` i ustaw:

| Klucz | Czym wypełnić |
|---|---|
| `glitchtip.env.SECRET_KEY` | Losowy 50-znakowy hex: `openssl rand -hex 25` |
| `glitchtip.env.GLITCHTIP_DOMAIN` | Domena/subdomena Glitchtip, np. `glitchtip.laravel-test.site` (musi mieć rekord DNS A na IP serwera) |
| `glitchtip.env.DEFAULT_FROM_EMAIL` | Adres "Od" w mailach z alertami, np. `noreply@laravel-test.site` |
| `glitchtip.env.EMAIL_URL` | URL SMTP do wysyłki alertów: `smtp://USER:APP_PASSWORD@smtp.gmail.com:587` (dla Gmail — wygeneruj [App Password](https://myaccount.google.com/apppasswords)) |
| `glitchtip.ingress.className` | **Zmień `nginx` → `traefik`** (k3s domyślnie używa Traefika) |
| `glitchtip.ingress.hosts[0].host` | Ta sama domena co `GLITCHTIP_DOMAIN` |
| `glitchtip.ingress.tls[0].hosts[0]` | Ta sama domena |
| `postgresql.auth.password` | Silne hasło do wbudowanej bazy Postgres (Glitchtip używa Postgres, nie MySQL) |

> **Uwaga:** Po wygenerowaniu SECRET_KEY zachowaj go — zmiana po starcie unieważnia wszystkie sesje i tokeny w Glitchtip.

### 21.2 Instalacja Helm

```bash
helm repo add glitchtip https://glitchtip.github.io/helm-charts
helm repo update
helm upgrade --install glitchtip glitchtip/glitchtip \
  --namespace glitchtip \
  --create-namespace \
  -f k8s/glitchtip/values.yaml
```

`bootstrap.sh` **wykrywa automatycznie** czy istnieje `values.yaml` — jeśli tak, używa go; jeśli nie, ostrzega żebyś go najpierw stworzył.

### 21.3 Konfiguracja po instalacji

1. Otwórz `https://glitchtip.laravel-test.site` (poczekaj 1–2 min na certyfikat TLS od cert-manager)
2. Utwórz organizację (np. `cms`)
3. Utwórz dwa projekty: `cms-api` (platform: PHP/Laravel) i `cms-frontend` (platform: Next.js)
4. Skopiuj DSN-y z **Settings → Client Keys (DSN)** każdego projektu
5. Wpisz do CI/CD:
   - Laravel: `GLITCHTIP_DSN=https://...@glitchtip.laravel-test.site/1` (w `PROD_ENV`)
   - Next.js (build arg): `NEXT_PUBLIC_GLITCHTIP_DSN=https://...@glitchtip.laravel-test.site/2` (w `ENV_CLIENT_PROD`)
6. Triggernij deploy — od następnego rolloutu błędy lecą do Glitchtip.

**Test:** w Laravel pod admin shell:
```bash
kubectl -n app exec deployment/app-server -- \
  php artisan tinker --execute='throw new \Exception("glitchtip test event");'
```
Po ~30 sek event pojawi się w UI Glitchtip → Issues.

---

## 22. Rancher — zarządzanie klastrem przez UI

Jeśli w pracy korzystasz z Ranchera, możesz go postawić na tym samym VPS. Dostaniesz dokładnie to samo środowisko — podgląd podów, logi, shell do kontenera, zarządzanie secretami — wszystko przez przeglądarkę.

> **🚀 Najprościej: postaw Rancher i Uptime Kuma jednym poleceniem przez `docker-compose.ops.yml`.**
>
> W repo jest gotowy plik `docker-compose.ops.yml` (root projektu), który zawiera Rancher (porty 8080/8443) i Uptime Kuma (port 3001) z trwałymi wolumenami `/opt/rancher` i `/opt/uptime-kuma`.
>
> **Użytkownik SSH:** użyj konta, które ma **passwordless sudo** — `ssh host "sudo …"` nie ma TTY, więc sudo z hasłem zawiśnie. Domyślne konta chmurowe zwykle to mają (`root` na Hetzner, `ubuntu` na OVHcloud/AWS). Jeśli używasz własnego konta (np. `deployer`) — patrz ramka "Konto `deployer` do operacji ops" niżej.
>
> ```bash
> # Załóżmy SSH_HOST=ubuntu@<IP_SERWERA>  (na Hetzner: root@<IP_SERWERA>)
>
> # 1. Katalogi na hoście (scp nie umie sudo — /opt jest root-owned)
> ssh $SSH_HOST "sudo mkdir -p /opt/rancher /opt/uptime-kuma && sudo chown -R 1000:1000 /opt/uptime-kuma"
>
> # 2. Skopiuj plik do home użytkownika, potem przenieś z sudo do /opt
> scp docker-compose.ops.yml $SSH_HOST:docker-compose.ops.yml
> ssh $SSH_HOST "sudo mv ~/docker-compose.ops.yml /opt/docker-compose.ops.yml"
>
> # 3. Uruchom (Docker, NIE k3s — to narzędzia operacyjne obok klastra)
> ssh $SSH_HOST "cd /opt && sudo docker compose -f docker-compose.ops.yml up -d"
>
> # Status:
> ssh $SSH_HOST "cd /opt && sudo docker compose -f docker-compose.ops.yml ps"
> ```
>
> `bootstrap.sh` (Krok 13) robi dokładnie to samo automatycznie — pyta o `user@ip`.
>
> Reszta tej sekcji opisuje co dalej: pierwsze logowanie do Ranchera (22.2), import klastra k3s (22.3), zabezpieczenie portów (22.5). Konfiguracja Uptime Kuma jest w sekcji "💡 Bonus: Uptime Kuma" niżej.

> **Konto `deployer` do operacji ops**
>
> Jeśli — zgodnie z sekcją 3.6 Opcja B — masz konto `deployer` i chcesz go używać do Kroku 13 / `docker-compose.ops.yml`, musi mieć **passwordless sudo** (bo `ssh host "sudo …"` nie ma TTY na hasło). Jednorazowo na serwerze:
>
> ```bash
> echo 'deployer ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/deployer
> sudo chmod 440 /etc/sudoers.d/deployer
> ```
>
> To jedyne miejsce w całym wdrożeniu, gdzie SSH na serwer w ogóle jest potrzebne — operacje `kubectl` (Kroki 1–12) idą przez `KUBECONFIG`, nie przez SSH. Konto `deployer` nie musi być w grupie `docker` — używamy `sudo docker compose`.

### 22.1 Instalacja Ranchera (ręcznie, bez compose)

Jeśli wolisz nie używać compose:

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

### 22.2 Pierwsze logowanie

Pobierz hasło bootstrapowe:

```bash
docker logs rancher 2>&1 | grep "Bootstrap Password"
```

Zaloguj się i ustaw nowe hasło.

### 22.3 Importuj klaster k3s

1. W Rancherze kliknij **Import Existing** → **Generic**
2. Nadaj nazwę klastrowi, np. `app`
3. Rancher wygeneruje komendę `kubectl apply` — uruchom ją na serwerze:

```bash
kubectl apply -f https://<IP_RANCHERA>:8443/v3/import/xxxxx.yaml
```

Po ~1 minucie klaster pojawi się w Rancherze ze statusem `Active`.

### 22.4 Co możesz robić w UI

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

### 22.5 Zabezpieczenie panelu Ranchera

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

## 23. Czyszczenie dysku

k3s akumuluje stare obrazy kontenerów przy każdym deploymencie. Po kilku miesiącach możesz stracić kilkanaście GB — warto to zautomatyzować.

### 23.1 Sprawdź zajętość dysku

```bash
df -h /

# Ile zajmują obrazy k3s (containerd)
du -sh /var/lib/rancher/k3s/agent/containerd/
```

### 23.2 Ręczne czyszczenie

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

### 23.3 Automatyczne czyszczenie — CronJob

```bash
kubectl apply -f k8s/maintenance/cronjob-image-cleanup.yaml
```

CronJob uruchamia się co niedzielę o 2:00 i usuwa nieużywane obrazy z `containerd`.

---

## 24. k9s — terminalowy panel zarządzania

k9s to terminalowy UI dla Kubernetes — jak Rancher, ale w konsoli. Przydatny gdy jesteś już połączony SSH i nie chcesz otwierać przeglądarki.

### 24.1 Instalacja

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

### 24.2 Uruchomienie

```bash
k9s
# lub od razu w konkretnym namespace
k9s -n app
```

### 24.3 Najważniejsze skróty

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

## 25. Rotacja secretów — aktualizacja .env i haseł bez downtime'u

> **Najprościej (zalecane):** zaktualizuj wartości w `PROD_ENV` (GitHub Variables / GitLab CI Variables) i triggernij deploy — pipeline sam zsynchronizuje sekret `app-server-env` i zrobi rolling restart. Sekcje poniżej są dla operacji wykonywanych ręcznie z `kubectl` (bez CI/CD).

### 25.1 Aktualizacja Laravel .env

Single source of truth dla Laravel `.env` w klastrze to sekret `app-server-env`. Bez CI/CD wygeneruj go z lokalnego `server/.env.production`:

```bash
# 1) zaktualizuj wartości w server/.env.production (gitignored)
# 2) re-create secret (idempotentne — nadpisuje istniejący):
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

# 3) rolling restart — nowe pody startują z nowym sekretem zanim stare padną
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```

### 25.2 Zmiana hasła MySQL

**Krok 1** — zmień hasło w bazie:

```bash
kubectl -n app exec -it app-mysql-0 -- mysql -u root -p<STARE_HASŁO>
```

```sql
ALTER USER 'app'@'%' IDENTIFIED BY 'NoweHaslo123!';
FLUSH PRIVILEGES;
EXIT;
```

**Krok 2** — zaktualizuj oba sekrety i zrestartuj:

```bash
# Sekret MySQL — odśwież wartością z --from-literal (bootstrap nigdy nie tworzy
# pliku k8s/mysql/secret.yaml — używa kubectl CLI bezpośrednio).
kubectl create secret generic app-mysql \
  --from-literal=root-password='<NOWE_ROOT>' \
  --from-literal=username='app' \
  --from-literal=password='NoweHaslo123!' \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

# Zaktualizuj DB_PASSWORD w server/.env.production, potem:
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```

### 25.3 Zmiana hasła Redis

```bash
# Sekret Redis
kubectl create secret generic app-redis \
  --from-literal=password='<NOWE_HASLO_REDIS>' \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

# Zaktualizuj REDIS_PASSWORD w server/.env.production, potem:
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n app rollout restart deployment/app-redis
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```

> **Uwaga:** Restart Redis czyści cache i sesje — użytkownicy zostaną wylogowani. Planuj poza godzinami szczytu.

---

## 💡 Bonus: Staging namespace

Możesz postawić środowisko stagingowe w osobnym namespace `app-staging` na tym samym klastrze — bez dodatkowych kosztów.

```bash
# Utwórz namespace staging
sed 's/app/app-staging/g' k8s/namespace.yaml | kubectl apply -f -

# Stwórz sekret z osobnego pliku .env dla stagingu
# (np. server/.env.staging — gitignored razem z .env.production)
kubectl create secret generic app-staging-server-env \
  --from-file=.env=server/.env.staging \
  --namespace=app-staging \
  --dry-run=client -o yaml | kubectl apply -f -

# MySQL / Redis sekrety analogicznie:
kubectl create secret generic app-staging-mysql \
  --from-literal=root-password='<STAGING_ROOT>' \
  --from-literal=username='app' \
  --from-literal=password='<STAGING_APP>' \
  --namespace=app-staging \
  --dry-run=client -o yaml | kubectl apply -f -
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
        kubectl -n app-staging set image deployment/app-server \
          app="ghcr.io/${{ github.repository_owner }}/app-server:${{ github.sha }}"
        kubectl -n app-staging rollout status deployment/app-server --timeout=5m
```

```yaml
# GitLab CI — dodaj do .gitlab-ci.yml
deploy-staging:
  stage: deploy
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
  script:
    - kubectl -n app-staging set image deployment/app-server app="${SERVER_IMAGE}:${CI_COMMIT_SHORT_SHA}"
    - kubectl -n app-staging rollout status deployment/app-server --timeout=5m
```

Dla stagingowego ingressu użyj subdomeny `staging.yourdomain.com`.

---

## 💡 Bonus: Uptime Kuma — monitoring dostępności

Uptime Kuma to self-hosted alternatywa dla UptimeRobot.

**Zalecane:** uruchom przez `docker-compose.ops.yml` razem z Rancherem (patrz sekcja 22 wyżej):

```bash
# Na serwerze
cd /opt && sudo docker compose -f docker-compose.ops.yml up -d uptime-kuma
```

Alternatywnie samodzielnie:

```bash
docker run -d \
  --name uptime-kuma \
  --restart=unless-stopped \
  -p 3001:3001 \
  -v /opt/uptime-kuma:/app/data \
  louislam/uptime-kuma:latest
```

Wejdź na `http://<IP_SERWERA>:3001` i dodaj monitory dla:
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
kubectl -n app get pods | grep minio
# app-minio-xxxxxxxxx-xxxxx   1/1   Running   0   1m
```

### Utwórz bucket

MinIO ma panel webowy na porcie 9001. Utwórz tymczasowe przekierowanie:

```bash
kubectl -n app port-forward svc/app-minio 9001:9001
```

Wejdź na `http://localhost:9001`, zaloguj się danymi z sekretu i utwórz bucket `app`.

Lub przez CLI bez UI:

```bash
kubectl -n app exec deployment/app-minio -- \
  mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

kubectl -n app exec deployment/app-minio -- \
  mc mb local/app
```

### Konfiguracja Laravel (.env)

```dotenv
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<root-user z sekretu>
AWS_SECRET_ACCESS_KEY=<root-password z sekretu>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=app
AWS_ENDPOINT=http://app-minio.app.svc.cluster.local:9000
AWS_USE_PATH_STYLE_ENDPOINT=true   # wymagane dla MinIO
AWS_URL=https://api.yourdomain.com/storage   # publiczny URL przez Nginx proxy
```

> **Publiczny dostęp do plików:** MinIO działa wewnątrz klastra. Żeby pliki były dostępne publicznie, dodaj regułę w Ingress lub skonfiguruj MinIO bucket jako publiczny i wystaw port 9000 przez Ingress na osobnej subdomenie (np. `storage.yourdomain.com`).

### Migracja z PVC na MinIO

Jeśli masz już pliki na PVC i chcesz przenieść na MinIO:

```bash
# Skopiuj pliki z poda serwera do MinIO
kubectl -n app exec deployment/app-server -- \
  aws s3 sync storage/app/public s3://app/public \
  --endpoint-url http://app-minio.app.svc.cluster.local:9000

# Następnie zmień FILESYSTEM_DISK=s3 w .env i zrestartuj
kubectl -n app rollout restart deployment/app-server
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
