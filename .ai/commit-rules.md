# Commit Rules

## Atomic Commits — One Concern Per Commit

Każdy commit musi reprezentować **jedną** spójną zmianę. Nigdy nie łącz różnych typów zmian w jednym commit.

---

## Kiedy ROZBICIAĆ na osobne commity:

### 1. Feature + Tests
Jeśli dodajesz nowy feature i testy:
```
❌ JEDEN commit: feat + tests
✅ DWA commity:
   1. feat: add barcode/EAN fields to product variants
   2. test: add tests for barcode and EAN validation
```

### 2. Feature + Types/Frontend
Jeśli zmieniasz backend i frontend TypeScript types:
```
❌ JEDEN commit: backend + types
✅ DWA commity:
   1. feat: add barcode fields to ProductVariant model
   2. feat: update TypeScript types for ProductVariant
```

### 3. Database Migration + Model
Migration i model to osobne commity:
```
✅ DWA commity:
   1. feat: add migration for barcode fields
   2. feat: update ProductVariant model with barcode
```

### 4. Feature + Documentation
Aktualizacja guide.md to osobny commit:
```
✅ DWA commity:
   1. feat: add digital products support
   2. docs: update guide.md with digital products docs
```

### 5. Refactor + Format
Refaktoryzacja i formatowanie to osobne commity:
```
✅ DWA commity:
   1. refactor: extract download logic to service
   2. style: format ProductDownload models
```

---

## Typy commitów (conventional commits):

| Typ | Kiedy używać | Przykład |
|-----|--------------|----------|
| `feat:` | Nowa funkcjonalność | `feat: add barcode fields to product variants` |
| `fix:` | Naprawa buga | `fix: resolve N+1 query in product listing` |
| `refactor:` | Refaktoryzacja bez zmiany zachowania | `refactor: extract download logic to service` |
| `test:` | Dodanie/naprawa testów | `test: add tests for barcode validation` |
| `docs:` | Dokumentacja | `docs: update guide.md with digital products` |
| `style:` | Formatowanie, brak zmian logiki | `style: format ProductDownload models` |
| `chore:` | Tooling, CI, dependencies | `chore: update phpstan baseline` |
| `perf:` | Optymalizacja wydajności | `perf: optimize product query with eager loading` |

---

## Workflow commitowania:

### 1. Analiza zmian
```bash
git status
git diff --stat
```
Zidentyfikuj wszystkie typy zmian: migrations, models, controllers, tests, types, docs.

### 2. Grupowanie plików
Podziel pliki na logiczne grupy:
- **Grupa 1:** Migracje (jeśli są)
- **Grupa 2:** Modele + relacje
- **Grupa 3:** Kontrolery + requesty
- **Grupa 4:** TypeScript types
- **Grupa 5:** Testy
- **Grupa 6:** Dokumentacja

### 3. Stage i commit per grupa
```bash
# Przykład dla trzech niezależnych zmian:
git add server/database/migrations/
git commit -m "feat: add migration for barcode fields"

git add server/app/Models/ProductVariant.php server/app/Models/ProductDownload.php
git commit -m "feat: add barcode/EAN and digital product support to models"

git add client/types/api.ts
git commit -m "feat: update TypeScript types for barcode and digital products"
```

---

## Zasady szczegółowe:

1. **Nigdy nie łącz testów z implementacją** — testy to osobny commit
2. **Nigdy nie łącz dokumentacji z kodem** — docs to osobny commit
3. **Migration zawsze jako osobny commit** — chyba że jest trywialna
4. **Frontend types zawsze jako osobny commit** — gdy zmienia API
5. **`make fix` przed każdym commit** — formatter może zmienić pliki
6. **`make check` musi przejść** — przed push
7. **Commit message po angielsku** — conventional commits format
8. **Co-authored-by dla AI** — dodaj `Co-Authored-By: Claude <noreply@anthropic.com>`

---

## Przykład kompletnego workflow:

```bash
# 1. Analiza
git status
git diff --stat

# 2. Migracje
git add server/database/migrations/
git commit -m "feat: add barcode fields migration"

# 3. Modele
git add server/app/Models/
git commit -m "feat: add barcode support to ProductVariant model"

# 4. Kontrolery
git add server/app/Http/Controllers/ server/app/Http/Requests/
git commit -m "feat: add barcode validation to variant requests"

# 5. Types
git add client/types/api.ts
git commit -m "feat: update TypeScript types for barcode fields"

# 6. Testy
git add server/tests/
git commit -m "test: add tests for barcode functionality"

# 7. Docs
git add ai/guide.md
git commit -m "docs: update guide.md with barcode feature"

# 8. Sprawdzenie
make check

# 9. Push
git push --force-with-lease
```