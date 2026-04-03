---
name: review
description: Uruchamia code review na zmianach w bieżącej gałęzi lub podanym pliku.
disable-model-invocation: true
argument-hint: "[branch, file path, or empty for current diff]"
---

Zrób code review zmian w projekcie CMS.

## Zakres

Jeśli podano argument ($ARGUMENTS):
- Jeśli to ścieżka pliku → review tego pliku
- Jeśli to nazwa brancha → `git diff main...$ARGUMENTS`

Jeśli brak argumentu → review bieżących zmian:
```bash
git diff HEAD
git diff --cached
```

## Co sprawdzić

1. **Bezpieczeństwo** — XSS, SQL injection, CSRF, mass assignment, auth bypass (OWASP Top 10)
2. **Wydajność** — N+1 queries, brak eager loading, niepotrzebne re-rendery
3. **Standardy** — zgodność z CLAUDE.md:
   - `declare(strict_types=1)` w PHP
   - `Model::query()` zamiast `DB::`
   - FormRequest zamiast inline validation
   - ApiController z helperami
   - Typy w `.types.ts`, nie w `.tsx`
   - Brak `as any` / `as unknown`
4. **Pokrycie testami** — czy zmiana ma testy?
5. **Typy TypeScript** — spójność z `client/types/api.ts`

## Format

Raportuj w formacie:

**[CRITICAL/HIGH/MEDIUM/LOW]** Krótki opis
- Plik: `path/to/file:line`
- Problem: szczegóły
- Fix: konkretna sugestia

Na koniec uruchom testy:
```bash
docker compose exec php php artisan test --compact
```
