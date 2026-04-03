---
name: audit-update
description: Aktualizuje ai/audit-plan.md — weryfikuje status luk i feature'ów, przelicza oceny.
disable-model-invocation: true
---

## Aktualizacja Audit Plan

Przeczytaj i zaktualizuj `ai/audit-plan.md`:

### 1. Bezpieczeństwo (sekcja 1)

Sprawdź każdą pozycję S1-S15:

- **S1 XSS**: `dangerouslySetInnerHTML` → czy DOMPurify jest użyty?
- **S2 CSP**: `next.config.ts` → czy Content-Security-Policy jest ustawione?
- **S3 CORS**: `config/cors.php` → czy `allowed_origins` nie jest `'*'`?
- **S4 Sentry**: `composer.json` + `package.json` → czy sentry jest zainstalowane?
- **S5-S15**: sprawdź analogicznie wg lookup strategy w audit-plan

### 2. Standardy (sekcja 2.3)

- **N1**: Grep `as any|as unknown` → ile instancji?
- **N2**: Czy `ai/guide.md` jest aktualne?
- **N3**: `docker compose exec php php artisan test --compact` → ile failing?
- **N4**: Grep `<input` bez `<label` w client/

### 3. Feature gaps (sekcja 3)

Sprawdź czy coś nowego zostało dodane od ostatniego audytu:
- Nowe modele w `server/app/Models/`
- Nowe kontrolery
- Nowe komponenty frontend

### 4. Testy (sekcja 5)

```bash
docker compose exec php php artisan test --compact 2>&1 | tail -5
```
Policz: ile testów, ile passing, ile failing. Zaktualizuj pokrycie.

### 5. Aktualizacja ocen (sekcja 6)

Przelicz oceny na podstawie aktualnego stanu. Reguły:
- Każda naprawiona pozycja krytyczna = +0.5 do oceny kategorii
- Każda naprawiona pozycja średnia = +0.25
- Nowy feature z checklisty = +0.5 do oceny kategorii
- Nowe testy = proporcjonalnie do pokrycia

### 6. Pokaż diff

Po zaktualizowaniu — pokaż co się zmieniło (summary zmian).
