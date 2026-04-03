# Plan: Codex CLI Workflow (lokalny review)

> **Status:** Plan (do wdrożenia opcjonalnie)
> **Cel:** Użycie OpenAI Codex CLI jako dodatkowego reviewer'a obok Claude Code

---

## Co to jest Codex CLI

OpenAI Codex CLI (`@openai/codex`) to terminal-based AI agent, analogiczny do Claude Code ale oparty na modelach OpenAI (o3, o4-mini, GPT-4.1). Obsługuje:
- Czytanie/pisanie plików
- Uruchamianie komend shell
- Tryby: suggest (propozycje) / auto-edit (automatyczne zmiany) / full-auto (bez pytań)

---

## Instalacja

```bash
npm install -g @openai/codex
export OPENAI_API_KEY="sk-..."
```

Konfiguracja w `~/.codex/config.yaml` lub `~/.codex/instructions.md`.

---

## Proponowany workflow

### Scenariusz 1: Review przed commitem (ręczny)

```bash
# Po zakończeniu pracy w Claude Code, przed commitem:
codex "Review the git diff for security, performance and code quality issues in this Laravel + Next.js CMS project. Check for: XSS, N+1 queries, missing FormRequest, as any casts, debug calls. Output markdown summary."
```

### Scenariusz 2: Alias / script

```bash
# ~/.zshrc lub Makefile
alias codex-review='codex --approval-mode suggest "Review git diff HEAD for this Laravel+Next.js CMS. Check security (OWASP Top 10), performance (N+1), standards (strict_types, FormRequest, ApiController). Markdown output with severity levels."'

# Użycie:
codex-review
```

### Scenariusz 3: Makefile target

```makefile
# Makefile (dodać do istniejącego)
codex-review:
	@echo "Running Codex review..."
	@codex --approval-mode suggest \
		"Review the current git diff. This is a Laravel 12 + Next.js 16 CMS. \
		Check: 1) Security (XSS, SQL injection, CSRF) \
		2) Performance (N+1, eager loading) \
		3) Standards (strict_types, FormRequest, ApiController, types in .types.ts) \
		4) Test coverage. Output concise markdown."
```

### Scenariusz 4: Dedykowany instructions file

```markdown
# .codex/instructions.md (Codex equivalent of CLAUDE.md)

## Projekt
CMS: Laravel 12 (server/) + Next.js 16 (client/), monorepo.

## Rola
Jesteś code reviewer. NIGDY nie edytuj plików — tylko raportuj.

## Standardy do sprawdzenia
### PHP (server/)
- `declare(strict_types=1)` w każdym pliku
- `Model::query()` zamiast `DB::`
- FormRequest dla walidacji
- ApiController z helperami ($this->ok(), etc.)
- env() tylko w config/

### TypeScript (client/)
- Typy w .types.ts, nie w .tsx
- Brak `as any` / `as unknown`
- useLocalePath() dla linków

## Bezpieczeństwo
- dangerouslySetInnerHTML → wymaga DOMPurify
- Brak raw SQL z user input
- CSRF tokeny
- Sanctum token expiration

## Format
[CRITICAL/HIGH/MEDIUM/LOW] Problem
- Plik: path:line
- Fix: sugestia
```

---

## Porównanie Claude Code vs Codex CLI

| Aspekt | Claude Code | Codex CLI |
|--------|-------------|-----------|
| **Model** | Claude Opus/Sonnet | o3/o4-mini/GPT-4.1 |
| **Koszt** | Subskrypcja Claude | Pay-per-token OpenAI |
| **Tryby** | Plan/Auto | Suggest/Auto-edit/Full-auto |
| **Agents/Skills** | Tak (subagenty, skills, hooks) | Nie (tylko instructions.md) |
| **MCP** | Tak | Nie (na razie) |
| **Sandbox** | macOS Seatbelt + Docker | Toml-based network/FS policy |
| **Edycja plików** | Edit/Write tools | Direct file access |
| **Najlepszy do** | Implementacja, planowanie, pełny cykl dev | Szybki review, second opinion |

## Proponowane użycie w projekcie

```
┌─────────────────────────────────────────────────┐
│                  Development Flow                │
│                                                  │
│  1. Claude Code (opus) → planuje architekturę    │
│  2. Claude Code (sonnet) → implementuje          │
│  3. Claude Code (sonnet) → pisze testy           │
│  4. Codex CLI → second opinion review  ◄─── NEW │
│  5. Claude Code /commit → commit                 │
│  6. GitHub Actions → automated review na PR      │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Kiedy użyć Codex zamiast/obok Claude:
- **Second opinion** — Claude napisał kod, Codex review'uje (inny model = inne perspektywy)
- **Koszt** — drobne review'y na o4-mini są tańsze niż opus
- **Diversyfikacja** — różne modele łapią różne błędy

### Kiedy NIE użyć Codex:
- Implementacja (brak skills, MCP, knowledge o projekcie)
- Planowanie architektoniczne (brak kontekstu z ai/guide.md)
- Cokolwiek wymagające Docker exec (Codex nie ma łatwego dostępu do Docker compose)

---

## Wdrożenie krok po kroku

1. `npm install -g @openai/codex`
2. Ustaw `OPENAI_API_KEY` w env
3. Utwórz `.codex/instructions.md` z kontekstem projektu (jak wyżej)
4. Dodaj `codex-review` alias lub Makefile target
5. Przetestuj na bieżącym diffie
6. Dostosuj instructions na podstawie jakości reviewów
7. (Opcjonalnie) Dodaj do `make review`: Claude review + Codex review

---

## Koszty szacunkowe

| Model | Input (1M tok) | Output (1M tok) | Typowy review (~2K in, ~1K out) |
|-------|----------------|------------------|---------------------------------|
| o4-mini | $1.10 | $4.40 | ~$0.007 |
| o3 | $2.00 | $8.00 | ~$0.012 |
| GPT-4.1 | $2.00 | $8.00 | ~$0.012 |

Przy 10 reviewów/dzień z o4-mini: **~$2/miesiąc**.
