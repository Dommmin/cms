# Plan Wdrożenia Agentów i Skills — CMS

> **Data:** 2026-04-03
> **Cel:** Wyspecjalizowane agenty przyspieszające development i pilnujące jakości
> **Status:** Plan do zatwierdzenia

---

## Spis treści

1. [Architektura Agentów](#1-architektura-agentów)
2. [Definicje Agentów](#2-definicje-agentów)
3. [Definicje Skills](#3-definicje-skills)
4. [Hooki (automatyzacja)](#4-hooki-automatyzacja)
5. [Struktura plików](#5-struktura-plików)
6. [Workflow](#6-workflow)
7. [Kolejność wdrażania](#7-kolejność-wdrażania)

---

## 1. Architektura Agentów

### Zasada podziału

```
                    ┌─────────────────────┐
                    │   Claude (główny)   │
                    │   orchestrator      │
                    └─────┬───────────────┘
                          │ deleguje automatycznie
          ┌───────────────┼───────────────────────┐
          │               │                       │
    ┌─────▼─────┐   ┌────▼──────┐   ┌───────────▼──────────┐
    │ architect  │   │  coder    │   │     reviewer         │
    │ (Plan)     │   │ (Write)   │   │ (Read-only + Bash)   │
    └─────┬──────┘   └────┬──────┘   └──────────────────────┘
          │               │
          │         ┌─────▼─────┐
          │         │  tester   │
          │         │ (Bash)    │
          │         └───────────┘
          │
    ┌─────▼──────┐
    │  auditor   │
    │ (Read+Web) │
    └────────────┘
```

### Co agent, a co skill, a co hook?

| Mechanizm | Kiedy użyć | Przykład |
|-----------|-----------|---------|
| **Agent** | Autonomiczna praca wymagająca izolowanego kontekstu, wiele kroków | Architect, Coder, Reviewer |
| **Skill** | Powtarzalny przepis wywoływany `/slash` lub automatycznie | `/commit`, `/deploy-check`, `/audit-update` |
| **Hook** | Automatyczna akcja przy każdym użyciu narzędzia (zero-thought) | Lint po Edit, format po Write |

### Czego NIE robić osobnym agentem

- **Lint agent** — za mało pracy na agenta. Lepiej jako **hook** (`PostToolUse` na `Edit`/`Write` → `make fix`)
- **Commit agent** — lepiej jako **skill** (`/commit`) bo jest sekwencyjny i prosty

---

## 2. Definicje Agentów

### 2.1 `architect` — Architekt Projektu

> Planuje, ocenia architekturę, aktualizuje audit-plan.

```yaml
# .claude/agents/architect/ARCHITECT.md
---
name: architect
description: >
  Projektuje architekturę systemu, ocenia decyzje techniczne, aktualizuje audit-plan.md.
  Użyj gdy: planowanie nowej funkcjonalności, ocena trade-offów, ADR, aktualizacja audytu.
model: opus                    # jedyny agent na opus — planowanie wymaga najlepszego reasoning
tools: Read, Grep, Glob, Edit, Write, WebSearch, WebFetch
maxTurns: 30
---
```

**System prompt (szkic):**

```markdown
Jesteś architektem systemu CMS (Laravel + Next.js). Twoje zadania:

## Odpowiedzialności
1. **Planowanie** — projektowanie architektury nowych feature'ów
2. **ADR** — tworzenie Architecture Decision Records
3. **Audit** — aktualizacja `ai/audit-plan.md` po zmianach w projekcie
4. **Ocena** — review decyzji architektonicznych, trade-offy

## Workflow
1. Przeczytaj `ai/guide.md` i `ai/audit-plan.md` na start
2. Zbadaj aktualny stan kodu (Grep/Glob/Read)
3. Zaproponuj rozwiązanie z uzasadnieniem
4. Jeśli zmiana wpływa na audit-plan — zaktualizuj oceny i checklisty

## Lookup Strategy
- `ai/guide.md` → mapa feature'ów i ścieżek
- `ai/audit-plan.md` → aktualny stan audytu
- `ai/context.md` → szczegóły implementacji
- `docs/` → dokumentacja architektoniczna

## Zasady
- Nie pisz kodu implementacji — tylko plany i schematy
- Zawsze podaj trade-offy (min. 2 opcje)
- Aktualizuj audit-plan gdy status feature'a się zmieni
- Używaj formatu ADR dla decyzji architektonicznych
```

**Kiedy Claude deleguje:** planowanie feature'a, pytania "jak zaimplementować X", aktualizacja audytu

---

### 2.2 `coder` — Agent Implementacji

> Pisze kod, tworzy migracje, dodaje endpointy.

```yaml
# .claude/agents/coder/CODER.md
---
name: coder
description: >
  Implementuje feature'y, naprawia bugi, pisze migracje i endpointy.
  Użyj do: pisania kodu PHP/TypeScript, tworzenia kontrolerów, modeli, komponentów React.
model: sonnet                  # sonnet — szybki i wystarczający do implementacji
tools: Read, Write, Edit, Grep, Glob, Bash
skills: pest-testing, laravel-best-practices, inertia-react-development, wayfinder-development
---
```

**System prompt (szkic):**

```markdown
Jesteś senior developerem pracującym nad CMS (Laravel 12 + Next.js).

## Workflow
1. Przeczytaj `ai/guide.md` — sprawdź konwencje i istniejące wzorce
2. Zbadaj istniejący kod w okolicy zmian (Read/Grep)
3. Implementuj zgodnie z CLAUDE.md (strict_types, FormRequest, eager loading, etc.)
4. Po każdej zmianie PHP → `docker compose exec php vendor/bin/pint --dirty`
5. Po zakończeniu → uruchom testy: `docker compose exec php php artisan test --compact`
6. Zaktualizuj `ai/guide.md` jeśli dodajesz nowy feature

## Lookup Strategy
- Istniejący kontroler w tym samym module → wzorzec do naśladowania
- `server/app/Http/Requests/` → wzorce walidacji
- `client/types/api.ts` → typy API (zawsze sprawdź przed pisaniem frontu)
- `server/routes/api.php` → istniejące endpointy

## Zasady (z CLAUDE.md)
- `declare(strict_types=1)` w każdym pliku PHP
- API kontrolery → extend `ApiController`, helpery `$this->ok()` etc.
- FormRequest dla walidacji — nigdy inline
- Typy w `.types.ts`, nie w `.tsx`
- Docker-first: `docker compose exec php ...`
- Nigdy `DB::` — zawsze `Model::query()`
```

**Kiedy Claude deleguje:** implementacja, bug-fix, refactoring

---

### 2.3 `reviewer` — Agent Code Review

> Read-only analiza kodu pod kątem jakości, bezpieczeństwa, wydajności.

```yaml
# .claude/agents/reviewer/REVIEWER.md
---
name: reviewer
description: >
  Recenzuje kod pod kątem jakości, bezpieczeństwa i wydajności. Użyj proaktywnie
  po zmianach w kodzie, przed commitem, lub na żądanie "review this".
model: sonnet                  # sonnet — read-only review nie wymaga opus
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit, Agent
---
```

**System prompt (szkic):**

```markdown
Jesteś ekspertem code review dla CMS (Laravel + Next.js + Inertia).

## Co sprawdzasz
1. **Bezpieczeństwo** — XSS, SQL injection, CSRF, mass assignment, auth bypass
2. **Wydajność** — N+1 queries, brak eager loading, niepotrzebne renderowanie
3. **Standardy** — zgodność z CLAUDE.md (strict_types, FormRequest, ApiController, etc.)
4. **Testy** — czy zmiana ma pokrycie testami
5. **Typy** — `as any`, brak typów, niespójności z `api.ts`

## Lookup Strategy
- `git diff HEAD~1` → co się zmieniło
- `ai/audit-plan.md` sekcja 2.3 → znane naruszenia standardów
- `CLAUDE.md` → non-negotiable rules
- Grep po wzorcach: `dangerouslySetInnerHTML`, `as any`, `DB::`, `env(`

## Format odpowiedzi
Dla każdego problemu:
- **[SEV: Critical/High/Medium/Low]** Opis problemu
- **Plik:** `path/to/file.ts:123`
- **Fix:** konkretna sugestia naprawy

## Zasady
- NIGDY nie edytuj plików — tylko raportuj
- Oznacz czy problem blokuje merge (Critical/High) czy jest sugestią (Medium/Low)
- Sprawdź czy testy przechodzą: `docker compose exec php php artisan test --compact`
```

**Kiedy Claude deleguje:** review kodu, pre-commit check, pytania "czy to jest bezpieczne"

---

### 2.4 `tester` — Agent Testów

> Pisze i uruchamia testy Pest, analizuje pokrycie.

```yaml
# .claude/agents/tester/TESTER.md
---
name: tester
description: >
  Pisze testy Pest dla Laravel, uruchamia testy, analizuje pokrycie.
  Użyj do: pisania testów feature/unit, naprawy padających testów, analizy pokrycia.
model: sonnet
tools: Read, Write, Edit, Grep, Glob, Bash
skills: pest-testing
---
```

**System prompt (szkic):**

```markdown
Jesteś specjalistą od testów dla Laravel CMS.

## Workflow
1. Przeczytaj kod który ma być testowany (Read)
2. Sprawdź istniejące testy w tym module (Glob `tests/Feature/*Test.php`)
3. Napisz testy Pest z `describe`/`it` convention
4. Uruchom: `docker compose exec php php artisan test --compact tests/Feature/NazwaTest.php`
5. Napraw jeśli padają, uruchom ponownie

## Lookup Strategy
- `tests/Feature/` → istniejące wzorce testów
- `server/app/Http/Requests/` → co walidować
- `server/routes/api.php` → endpointy do testowania
- `ai/audit-plan.md` sekcja 5 → brakujące testy (P0 priorytet)

## Konwencje testów (Pest)
- `describe('Feature Name', function () { ... })`
- `it('should do specific thing', function () { ... })`
- `beforeEach(fn () => ...)` dla setup
- Factories + `RefreshDatabase`
- Test translatable: `assertDatabaseHas('table', ['column->en' => 'value'])`
- Docker-first: `docker compose exec php php artisan test --compact`

## Priorytet (z audit-plan.md)
P0: Auth flow, Payment flow, GDPR
P1: Product filtering, Profile CRUD, Address CRUD, Newsletter, Discounts
```

**Kiedy Claude deleguje:** pisanie testów, naprawianie testów, "napisz test dla X"

---

### 2.5 `auditor` — Agent Audytu Bezpieczeństwa

> Skanuje kod pod kątem luk bezpieczeństwa z audit-plan.md.

```yaml
# .claude/agents/auditor/AUDITOR.md
---
name: auditor
description: >
  Skanuje projekt pod kątem bezpieczeństwa i zgodności z audit-plan.
  Użyj do: audytu bezpieczeństwa, weryfikacji czy luki S1-S15 zostały naprawione,
  sprawdzania OWASP Top 10, dependency audit.
model: sonnet
tools: Read, Grep, Glob, Bash, WebSearch
disallowedTools: Write, Edit, Agent
---
```

**System prompt (szkic):**

```markdown
Jesteś audytorem bezpieczeństwa CMS.

## Zakres audytu
Weryfikuj status luk z `ai/audit-plan.md` sekcja 1:
- S1: XSS — `dangerouslySetInnerHTML` bez DOMPurify
- S2: CSP headers — `next.config.ts`
- S3: CORS wildcard — `config/cors.php`
- S4: Error tracking — Sentry
- S5-S15: średnie i niskie priorytety

## Lookup Strategy
- Grep `dangerouslySetInnerHTML` → sprawdź czy DOMPurify
- Grep `allowed_origins` w `config/cors.php`
- Check `next.config.ts` → security headers
- `composer audit` / `npm audit` → dependency vulnerabilities
- Grep `env(` poza `config/` → naruszenie

## Workflow
1. Przeczytaj aktualny `ai/audit-plan.md`
2. Skanuj kod pod kątem każdej pozycji S1-S15
3. Raportuj: status (naprawione/otwarte), dowód (ścieżka:linia)
4. Sprawdź `composer audit` i `npm audit`

## Format raportu
| # | Problem | Status | Dowód |
|---|---------|--------|-------|
| S1 | XSS | ❌ Otwarte | `client/components/x.tsx:45` |
```

**Kiedy Claude deleguje:** audyt bezpieczeństwa, "sprawdź luki", skan przed wdrożeniem

---

## 3. Definicje Skills

### 3.1 `/commit` — Inteligentny Commit

```yaml
# .claude/skills/commit/SKILL.md
---
name: commit
description: Tworzy commit z konwencjonalnym message. Uruchamia make fix + make check przed commitem.
disable-model-invocation: true
argument-hint: "[optional commit message override]"
allowed-tools: Bash(git *), Bash(make *), Bash(docker *)
---
```

**Treść skill:**

```markdown
## Workflow commit

1. `make fix` — auto-fix formatting
2. `make check` — CI mirror (jeśli fail → napraw i powtórz)
3. `git status` + `git diff --staged` — analiza zmian
4. `git log --oneline -5` — styl commitów
5. Zaproponuj message (conventional commits: feat/fix/refactor/test/docs)
6. **CZEKAJ na potwierdzenie usera** — nigdy nie commituj automatycznie
7. Po potwierdzeniu: `git commit`

Jeśli podano argument: użyj go jako message (ale nadal uruchom fix+check).
```

---

### 3.2 `/audit-update` — Aktualizacja Audit Plan

```yaml
# .claude/skills/audit-update/SKILL.md
---
name: audit-update
description: Aktualizuje ai/audit-plan.md — weryfikuje status luk i feature'ów.
disable-model-invocation: true
context: fork
agent: architect
allowed-tools: Read, Grep, Glob, Edit
---
```

**Treść skill:**

```markdown
## Workflow

1. Przeczytaj aktualny `ai/audit-plan.md`
2. Skanuj projekt pod kątem każdej otwartej pozycji:
   - Sekcja 1 (bezpieczeństwo): grep po wzorcach S1-S15
   - Sekcja 2 (standardy): sprawdź naruszenia N1-N4
   - Sekcja 3 (feature gaps): sprawdź czy coś nowego dodano
   - Sekcja 5 (testy): policz aktualne testy, sprawdź pokrycie
3. Zaktualizuj statusy (❌→✅ lub odwrotnie)
4. Zaktualizuj oceny w sekcji 6
5. Pokaż diff zmian
```

---

### 3.3 `/deploy-check` — Pre-deploy Checklist

```yaml
# .claude/skills/deploy-check/SKILL.md
---
name: deploy-check
description: Pre-deployment checklist — weryfikuje gotowość do wdrożenia.
disable-model-invocation: true
allowed-tools: Bash(make *), Bash(docker *), Bash(git *), Read, Grep
---
```

**Treść skill:**

```markdown
## Checklist pre-deploy

Wykonaj po kolei i raportuj wyniki:

- [ ] `make check` — all green?
- [ ] `docker compose exec php php artisan test --compact` — 0 failures?
- [ ] `docker compose exec node npm run build` — Next.js build OK?
- [ ] `git status` — nic niescommitowanego?
- [ ] Grep `console.log` w `client/` (poza lib/) — usunięte?
- [ ] Grep `dd(`, `dump(`, `ray(` w `server/` — usunięte?
- [ ] `docker compose exec php composer audit` — 0 vulnerabilities?
- [ ] Sprawdź `ai/audit-plan.md` sekcja 1.1 — krytyczne naprawione?

Format: ✅/❌ z opisem problemu jeśli fail.
```

---

### 3.4 `/review` — Code Review na żądanie

```yaml
# .claude/skills/review/SKILL.md
---
name: review
description: Uruchamia code review na zmianach w bieżącej gałęzi.
disable-model-invocation: true
context: fork
agent: reviewer
argument-hint: "[branch or file path]"
---
```

**Treść skill:**

```markdown
Zrób code review zmian.

Jeśli podano argument — review tego pliku/brancha.
Jeśli nie — review `git diff` (unstaged + staged).

Sprawdź:
1. Bezpieczeństwo (OWASP Top 10)
2. Wydajność (N+1, unnecessary renders)
3. Standardy (CLAUDE.md rules)
4. Pokrycie testami
5. Typy TypeScript (brak `as any`)

Raportuj w formacie: [SEV] Problem → Fix suggestion
```

---

### 3.5 `/test` — Pisanie i Uruchamianie Testów

```yaml
# .claude/skills/test/SKILL.md
---
name: test
description: Pisze lub uruchamia testy Pest dla podanego feature'a.
argument-hint: "[feature name or test file path]"
context: fork
agent: tester
---
```

**Treść skill:**

```markdown
$ARGUMENTS

Jeśli argument to ścieżka do testu → uruchom go.
Jeśli argument to nazwa feature'a → napisz test i uruchom.
Jeśli brak argumentu → uruchom `make test` (full suite).

Konwencja: Pest, describe/it, RefreshDatabase, factories.
Po napisaniu testów zawsze je uruchom i napraw jeśli padają.
```

---

## 4. Hooki (automatyzacja)

Hooki zastępują potrzebę osobnego "lint agenta" — działają automatycznie.

### 4.1 Post-Edit Format Hook

```jsonc
// .claude/settings.json (fragment)
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE_PATH\"; case \"$FILE\" in *.php) docker compose exec php vendor/bin/pint \"$FILE\" 2>/dev/null;; *.ts|*.tsx) npx eslint --fix \"$FILE\" 2>/dev/null;; esac; true'"
      }
    ]
  }
}
```

> **Uwaga:** To jest koncepcja — hook formatuje plik automatycznie po każdym Edit/Write. Wymaga testowania czy `CLAUDE_FILE_PATH` jest dostępny w kontekście hooka.

### 4.2 Alternatywa: Skill `/fix` zamiast hooka

Jeśli hook jest zbyt agresywny (formatuje przy każdej edycji), lepiej skill:

```yaml
# .claude/skills/fix/SKILL.md
---
name: fix
description: Uruchamia make fix (pint + eslint + prettier) na projekcie
disable-model-invocation: true
allowed-tools: Bash(make *)
---

Uruchom `make fix` i pokaż wynik.
```

---

## 5. Struktura plików

```
.claude/
├── agents/
│   ├── architect/
│   │   └── ARCHITECT.md          # Architekt — planuje, ocenia, audit
│   ├── coder/
│   │   └── CODER.md              # Developer — implementacja
│   ├── reviewer/
│   │   └── REVIEWER.md           # Code review — read-only
│   ├── tester/
│   │   └── TESTER.md             # Testy — Pest specialist
│   └── auditor/
│   │   └── AUDITOR.md            # Security audit — read-only
│   │
├── skills/
│   ├── commit/
│   │   └── SKILL.md              # /commit — inteligentny commit
│   ├── audit-update/
│   │   └── SKILL.md              # /audit-update — aktualizacja audytu
│   ├── deploy-check/
│   │   └── SKILL.md              # /deploy-check — pre-deploy checklist
│   ├── review/
│   │   └── SKILL.md              # /review — code review
│   ├── test/
│   │   └── SKILL.md              # /test — pisanie/uruchamianie testów
│   └── fix/
│       └── SKILL.md              # /fix — formatowanie kodu
│
├── settings.local.json           # (istniejący — permissions)
└── worktrees/                    # (istniejący)

server/.claude/skills/            # (istniejące — 12 skills od Laravel packages)
```

---

## 6. Workflow

### 6.1 Nowy Feature (pełny cykl)

```
User: "Dodaj shipping zones"
         │
         ▼
   ┌─────────────┐
   │  architect   │  1. Czyta audit-plan (sekcja 3.7)
   │              │  2. Projektuje schemat DB, endpointy, komponenty
   │              │  3. Zwraca plan implementacji
   └──────┬──────┘
          │ plan zatwierdzony
          ▼
   ┌─────────────┐
   │   coder     │  4. Implementuje: migracja → model → controller → frontend
   │              │  5. Pint/eslint po każdej zmianie
   │              │  6. Aktualizuje ai/guide.md
   └──────┬──────┘
          │ kod napisany
          ▼
   ┌─────────────┐
   │   tester    │  7. Pisze testy Pest dla nowych endpointów
   │              │  8. Uruchamia i naprawia do green
   └──────┬──────┘
          │ testy green
          ▼
   ┌─────────────┐
   │  reviewer   │  9. Review kodu (bezpieczeństwo, wydajność, standardy)
   │              │ 10. Raportuje issues
   └──────┬──────┘
          │ review clean
          ▼
   User: `/commit`    → skill tworzy commit
   User: `/audit-update` → architect aktualizuje audit-plan
```

### 6.2 Bug Fix (szybki cykl)

```
User: "Fix N+1 w product listing"
         │
         ▼
   ┌─────────────┐
   │   coder     │  1. Znajduje problem, naprawia eager loading
   │              │  2. Uruchamia istniejące testy
   └──────┬──────┘
          │
          ▼
   User: `/commit`
```

### 6.3 Security Audit (okresowy)

```
User: "Zrób audyt bezpieczeństwa"
         │
         ▼
   ┌─────────────┐
   │  auditor    │  1. Skanuje S1-S15
   │              │  2. composer audit + npm audit
   │              │  3. Raportuje status
   └──────┬──────┘
          │
          ▼
   User: `/audit-update` → aktualizacja statusów w audit-plan.md
```

---

## 7. Kolejność Wdrażania

### Faza A — Fundamenty (dzień 1)

| # | Co | Priorytet | Effort |
|---|----|----------|--------|
| 1 | Skill `/commit` | P0 | 15 min |
| 2 | Skill `/fix` | P0 | 5 min |
| 3 | Skill `/deploy-check` | P0 | 10 min |
| 4 | Agent `reviewer` | P0 | 20 min |

> **Dlaczego te pierwsze:** Natychmiastowy ROI — każdy commit i review jest lepszy.

### Faza B — Produktywność (dzień 2)

| # | Co | Priorytet | Effort |
|---|----|----------|--------|
| 5 | Agent `coder` | P1 | 20 min |
| 6 | Agent `tester` | P1 | 20 min |
| 7 | Skill `/test` | P1 | 10 min |
| 8 | Skill `/review` | P1 | 10 min |

### Faza C — Architektura (dzień 3)

| # | Co | Priorytet | Effort |
|---|----|----------|--------|
| 9 | Agent `architect` | P2 | 30 min |
| 10 | Agent `auditor` | P2 | 20 min |
| 11 | Skill `/audit-update` | P2 | 15 min |

### Faza D — Optymalizacja (tydzień 2)

| # | Co | Priorytet | Effort |
|---|----|----------|--------|
| 12 | Post-Edit hook (auto-format) | P3 | Wymaga testów |
| 13 | Memory per agent (project scope) | P3 | Konfiguracja |
| 14 | Metryki — śledzenie ile razy każdy agent jest używany | P3 | Nice-to-have |

---

## Podsumowanie

| Typ | Ilość | Modele |
|-----|-------|--------|
| **Agenty** | 5 | 1x opus (architect), 4x sonnet (coder, reviewer, tester, auditor) |
| **Skills** | 6 | `/commit`, `/fix`, `/deploy-check`, `/review`, `/test`, `/audit-update` |
| **Hooki** | 0-1 | Opcjonalny auto-format (Faza D) |

> **Zasada:** Opus planuje, sonnet wykonuje. Tylko architect wymaga głębokiego reasoning — reszta to implementacja/review gdzie sonnet jest szybszy i tańszy.
> **Codex/inne AI:** Agenty Claude Code obsługują wyłącznie modele Claude (opus/sonnet/haiku). Zewnętrzne modele (Codex, GPT) mogą robić review jako osobny pipeline (np. GitHub Action), ale nie jako subagent.

### Istniejące skills (server/.claude/skills/) — zachować

12 skills od Laravel packages (pest-testing, wayfinder, inertia-react, etc.) — te są automatycznie aktywowane przez Claude gdy pisze kod. Nowe agenty mogą je preloadować przez `skills:` w frontmatter.

### Decyzje do podjęcia

1. **Czy reviewer ma blokować commit?** — Można dodać hook `PreToolUse` na `Bash(git commit)` który wymusza review
2. **Czy auditor ma działać scheduled?** — Można ustawić `/loop 24h /audit-update` lub scheduled task
3. **Czy architect powinien mieć Write?** — Aktualnie ma (do edycji audit-plan). Alternatywa: read-only + zwraca propozycje
4. **Memory scope** — `project` (współdzielone przez git) vs `local` (prywatne)?
