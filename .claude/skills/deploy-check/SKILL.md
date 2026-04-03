---
name: deploy-check
description: Pre-deployment checklist — weryfikuje gotowość do wdrożenia. Sprawdza testy, build, debug calls, vulnerabilities.
disable-model-invocation: true
---

## Pre-deployment Checklist

Wykonaj WSZYSTKIE kroki po kolei i raportuj wyniki:

### 1. Quality gates
```bash
make check
```

### 2. Testy
```bash
docker compose exec php php artisan test --compact
```

### 3. Frontend build
```bash
docker compose exec node npm run build
```

### 4. Git status
```bash
git status
```
Sprawdź: nie powinno być niescommitowanych zmian.

### 5. Debug calls (grep)
Szukaj debug calls które nie powinny być w produkcji:

W server/:
- `dd(`, `dump(`, `ray(`, `Log::debug(`

W client/ (poza lib/):
- `console.log` (ale NIE w `lib/` — tam może być celowo)

### 6. Dependency vulnerabilities
```bash
docker compose exec php composer audit 2>&1 || true
docker compose exec node npm audit 2>&1 || true
```

### 7. Krytyczne luki bezpieczeństwa
Przeczytaj `ai/audit-plan.md` sekcja 1.1 — czy wszystkie krytyczne (S1-S4) są naprawione?

### 8. Migracje
```bash
docker compose exec php php artisan migrate:status
```
Sprawdź: nie powinno być niepuszczonych migracji.

## Format raportu

```
# Deploy Check — [data]

| Check | Status | Uwagi |
|-------|--------|-------|
| Quality gates (make check) | ✅/❌ | ... |
| Testy | ✅/❌ | X passed, Y failed |
| Frontend build | ✅/❌ | ... |
| Git clean | ✅/❌ | ... |
| Debug calls | ✅/❌ | X znalezionych |
| Dependencies | ✅/❌ | X vulnerabilities |
| Security (S1-S4) | ✅/❌ | ... |
| Migrations | ✅/❌ | ... |

## Verdict: READY / NOT READY
[podsumowanie co blokuje deploy, jeśli NOT READY]
```
