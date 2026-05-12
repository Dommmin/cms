# k3s — ściągawka komend

> Zastąp `app` nazwą swojego namespace (tą, co podałeś w `bootstrap.sh`).  
> Ustaw raz: `export KUBECONFIG=~/.kube/config-hetzner`

---

## Szybki status

```bash
# Wszystkie pody — czy wszystkie Running?
kubectl -n app get pods

# Wszystko naraz: pody, serwisy, deploymenty, joby
kubectl -n app get all

# Ingress — czy ma adres IP?
kubectl -n app get ingress

# Certyfikat TLS — READY: True?
kubectl -n app get certificate

# Wolumeny — STATUS: Bound?
kubectl -n app get pvc

# Zużycie CPU i RAM
kubectl -n app top pods
```

---

## Logi

```bash
# Live logi serwera (Laravel)
kubectl -n app logs -f deployment/app-server

# Live logi queue workerów
kubectl -n app logs -f deployment/app-queue

# Logi klienta (Next.js)
kubectl -n app logs -f deployment/app-client

# Logi poprzedniego poda (po restarcie/crashu)
kubectl -n app logs --previous deployment/app-server

# Logi z ostatniej godziny
kubectl -n app logs --since=1h deployment/app-server

# Logi konkretnego poda (gdy masz kilka replik)
kubectl -n app logs -f <nazwa-poda>

# Logi zakończonego joba migracji
kubectl -n app logs job/app-migrate-<SHA>
```

---

## Wejście do kontenera

```bash
# Shell do serwera Laravel
kubectl -n app exec -it deployment/app-server -- bash

# Przydatne komendy wewnątrz:
php artisan tinker
php artisan cache:clear
php artisan queue:restart
php artisan migrate:status
php artisan scout:import "App\Models\Product"

# Shell do MySQL
kubectl -n app exec -it app-mysql-0 -- bash
mysql -u root -p

# Jednorazowe polecenie bez wchodzenia do shella
kubectl -n app exec deployment/app-server -- php artisan cache:clear
```

---

## Deploymenty — restart i rollback

```bash
# Rolling restart (zero-downtime) — np. po zmianie sekretu
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue

# Sprawdź postęp rolloutu
kubectl -n app rollout status deployment/app-server

# Historia deployów
kubectl -n app rollout history deployment/app-server

# Rollback do poprzedniej wersji
kubectl -n app rollout undo deployment/app-server

# Rollback do konkretnej wersji
kubectl -n app rollout undo deployment/app-server --to-revision=2

# Restart konkretnego poda (k8s automatycznie go zastąpi)
kubectl -n app delete pod <nazwa-poda>
```

---

## Diagnozy — gdy coś nie działa

```bash
# Szczegóły poda — zdarzenia, błędy, przyczyna Pending/Error
kubectl -n app describe pod <nazwa-poda>

# Szczegóły deploymentu
kubectl -n app describe deployment/app-server

# Szczegóły certyfikatu TLS
kubectl -n app describe certificate app-tls

# Aktywne challenge'e Let's Encrypt (dlaczego cert nie działa?)
kubectl -n app get challenges
kubectl -n app describe challenge <nazwa-challenge>

# Ordery ACME
kubectl -n app get orders

# Zdarzenia w namespace (co się ostatnio działo)
kubectl -n app get events --sort-by='.lastTimestamp' | tail -20
```

---

## Sekrety

```bash
# Lista sekretów
kubectl -n app get secrets

# Podgląd zawartości .env (server)
kubectl -n app get secret app-server-env \
  -o jsonpath='{.data.\.env}' | base64 -d

# Podgląd konkretnych kluczy z sekretu MySQL
kubectl -n app get secret app-mysql \
  -o jsonpath='{.data.username}' | base64 -d && echo
kubectl -n app get secret app-mysql \
  -o jsonpath='{.data.password}' | base64 -d && echo

# Ręczna aktualizacja sekretu .env z pliku
kubectl create secret generic app-server-env \
  --from-file=.env=server/.env.production \
  --namespace=app \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

## Migracje

```bash
# Lista jobów migracji
kubectl -n app get jobs

# Logi konkretnej migracji
kubectl -n app logs job/app-migrate-<SHA>

# Usuń stare zakończone/błędne joby migracji
kubectl -n app delete job -l component=migrate

# Sprawdź status migracji przez artisan
kubectl -n app exec deployment/app-server -- php artisan migrate:status
```

---

## MySQL — backup i dostęp

```bash
# Dostęp do MySQL przez kubectl
kubectl -n app exec -it app-mysql-0 -- \
  mysql -u root -p$(kubectl -n app get secret app-mysql \
    -o jsonpath='{.data.root-password}' | base64 -d)

# Ręczny dump bazy
kubectl -n app exec app-mysql-0 -- \
  mysqldump -u root -p<ROOT_PASS> <NAZWA_BAZY> \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Port-forward do lokalnego klienta MySQL (np. TablePlus, DBeaver)
kubectl -n app port-forward svc/app-mysql 3306:3306
# Następnie połącz się lokalnie: host=127.0.0.1 port=3306
```

---

## Port-forward — lokalny dostęp do serwisów

```bash
# Serwer Laravel (API)
kubectl -n app port-forward svc/app-server 8080:80
# → http://localhost:8080

# Klient Next.js
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

## Skalowanie

```bash
# Tymczasowe skalowanie (HPA nadpisze przy następnym ticku)
kubectl -n app scale deployment/app-server --replicas=2

# Stan HPA (autoskalowanie)
kubectl -n app get hpa

# Wyłącz HPA tymczasowo
kubectl -n app delete hpa app-server-hpa
```

---

## Traefik i sieć

```bash
# Status Traefika
kubectl -n kube-system get pods | grep traefik
kubectl -n kube-system logs -f deployment/traefik

# Serwisy Traefika (external IP, porty)
kubectl -n kube-system get svc traefik

# Middleware (redirect HTTPS, body size)
kubectl -n app get middleware
```

---

## Przydatne skróty

```bash
# k9s — terminalowy UI (wszystko w jednym miejscu)
k9s -n app

# Ustaw domyślny namespace (żeby nie pisać -n app za każdym razem)
kubectl config set-context --current --namespace=app
# Sprawdź bieżący kontekst
kubectl config get-contexts

# Pokaż wszystkie zasoby w namespace
kubectl -n app get all,ingress,certificate,pvc,secrets

# Watch — odświeżanie co 2s
kubectl -n app get pods -w
```

---

## Typowe scenariusze

### Aplikacja nie odpowiada

```bash
kubectl -n app get pods                          # czy wszystkie Running?
kubectl -n app logs deployment/app-server        # błędy PHP/Laravel?
kubectl -n app describe pod <nazwa-poda>         # Event: OOMKilled? CrashLoop?
kubectl -n app get ingress                       # czy ingress ma IP?
kubectl -n app get certificate                   # READY: True?
```

### Certyfikat nie jest wystawiony

```bash
kubectl -n app get challenges                    # które domeny mają pending?
kubectl -n app describe challenge <nazwa>        # jaki błąd (DNS? port 80?)
sudo ss -tlnp | grep :80                        # czy coś nasłuchuje na 80?
# Jeśli nie — patrz sekcja 4.1 w k3s-deployment-guide.md (servicelb)
```

### Migracja nie przechodzi

```bash
kubectl -n app get pods | grep migrate           # Error / ImagePullBackOff?
kubectl -n app logs job/app-migrate-<SHA>        # Access denied? Connection refused?
kubectl -n app get secret app-server-env \
  -o jsonpath='{.data.\.env}' | base64 -d \
  | grep -E '^DB_'                              # czy DB_HOST / DB_USERNAME poprawne?
```

### Po zmianie PROD_ENV w GitHub

```bash
# CI/CD zsynchronizuje sekret automatycznie przy następnym deployu.
# Jeśli chcesz natychmiast bez pełnego deployu:
# 1. Zaktualizuj sekret ręcznie (patrz sekcja "Sekrety" wyżej)
# 2. Rolling restart
kubectl -n app rollout restart deployment/app-server
kubectl -n app rollout restart deployment/app-queue
```
