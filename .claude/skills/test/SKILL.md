---
name: test
description: Pisze lub uruchamia testy Pest. Podaj feature name lub ścieżkę testu.
argument-hint: "[feature name, test file path, or empty for full suite]"
---

## Zadanie testowe

$ARGUMENTS

## Tryb działania

**Jeśli argument to ścieżka testu** (np. `tests/Feature/AuthTest.php`):
→ Uruchom ten test:
```bash
docker compose exec php php artisan test --compact $ARGUMENTS
```

**Jeśli argument to nazwa feature'a** (np. `auth`, `products`, `checkout`):
→ Napisz testy i uruchom:
1. Przeczytaj odpowiedni kontroler i FormRequest
2. Sprawdź istniejące testy w `server/tests/Feature/`
3. Napisz testy Pest z `describe`/`it`
4. Uruchom i napraw do green

**Jeśli brak argumentu**:
→ Uruchom full suite:
```bash
docker compose exec php php artisan test --compact
```

## Konwencje Pest

- `describe('Feature Name', function () { ... })`
- `it('should do specific thing', function () { ... })`
- `beforeEach(fn () => ...)` dla setup
- `uses(RefreshDatabase::class)`
- Factories zamiast ręcznego tworzenia
- Testuj: happy path, auth (401), authorization (403), validation (422), not found (404)
- Translatable: `assertDatabaseHas('table', ['column->en' => 'value'])`

## Priorytety brakujących testów (z audit-plan.md)

**P0:** Auth flow, Payment flow, GDPR
**P1:** Product filtering, Profile CRUD, Address CRUD, Newsletter, Discounts, Admin RBAC
**P2:** i18n, Rate limiting

## Docker

```bash
docker compose exec php php artisan test --compact tests/Feature/NazwaTest.php
docker compose exec php php artisan make:test --pest NazwaTest
```
