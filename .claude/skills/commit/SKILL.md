---
name: commit
description: Tworzy commit z conventional message. Uruchamia make fix + make check przed commitem.
disable-model-invocation: true
argument-hint: "[optional commit message override]"
---

## Workflow commit

Wykonaj po kolei:

### 1. Auto-fix formatting
```bash
make fix
```
Jeśli fail — napraw problem i powtórz.

### 2. CI mirror check
```bash
make check
```
Jeśli fail — napraw problem i powtórz. Nie przechodź dalej dopóki `make check` nie przejdzie.

### 3. Analiza zmian
```bash
git status
git diff --cached
git diff
```
Jeśli są unstaged changes — zapytaj czy dodać do staging.

### 4. Sprawdź styl commitów
```bash
git log --oneline -10
```

### 5. Zaproponuj commit message

Format: conventional commits
- `feat:` — nowy feature
- `fix:` — naprawa buga
- `refactor:` — refaktoring bez zmiany zachowania
- `test:` — dodanie/naprawa testów
- `docs:` — dokumentacja
- `chore:` — tooling, CI, dependencies
- `style:` — formatting, brak zmian logiki

Przykłady:
- `feat: add shipping zones with country-based pricing`
- `fix: resolve N+1 query in product listing`
- `test: add auth flow tests for login and register`

Jeśli podano argument ($ARGUMENTS): użyj go jako message.

### 6. CZEKAJ NA POTWIERDZENIE

**NIGDY nie commituj automatycznie.** Pokaż:
- Proponowany message
- Lista plików do commit
- Zapytaj: "Commitować? (tak/nie/zmień message)"

### 7. Po potwierdzeniu

```bash
git add [pliki]
git commit -m "message"
```

Dodaj co-author:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```
