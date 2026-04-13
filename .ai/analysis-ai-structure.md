# Analiza struktury plików AI — CMS Monorepo

> **Data:** 2026-04-02
> **Cel:** Reorganizacja instrukcji AI, eliminacja duplikacji, ujednolicenie konfiguracji MCP
> **Narzędzia:** Claude Code (główne), Codex, Cursor, Junie, Gemini CLI, OpenCode

---

## Spis treści

1. [Obecny stan — mapa plików](#1-obecny-stan--mapa-plików)
2. [Problemy i duplikacje](#2-problemy-i-duplikacje)
3. [Laravel Boost — co generuje i jak się ma do reszty](#3-laravel-boost--co-generuje-i-jak-się-ma-do-reszty)
4. [Analiza MCP — niespójności między narzędziami](#4-analiza-mcp--niespójności-między-narzędziami)
5. [Nazewnictwo: `ai/` vs `.ai/`](#5-nazewnictwo-ai-vs-ai)
6. [Proponowana docelowa struktura](#6-proponowana-docelowa-struktura)
7. [Co warto dodać](#7-co-warto-dodać)
8. [Plan migracji — kolejność kroków](#8-plan-migracji--kolejność-kroków)

---

## 1. Obecny stan — mapa plików

### Root (`/`)

| Plik | Dla kogo | Linii | Rola | Status |
|------|----------|-------|------|--------|
| `CLAUDE.md` | Claude Code | 106 | Główne instrukcje — reguły, Docker, struktura | **Kluczowy** — entry point |
| `AGENTS.md` | Codex, agenty | 168 | Pełny kontekst: struktura, reguły, typy API, auth, testy | **Duplikuje** ~80% CLAUDE.md |
| `GEMINI.md` | Gemini CLI | 86 | Skrócony kontekst: Docker, konwencje, ścieżki | **Duplikuje** ~60% CLAUDE.md |
| `.junie/guidelines.md` | Junie | 94 | Docker, PHP/TS reguły, testy, arch | **Duplikuje** ~70% CLAUDE.md |
| `.claude/settings.local.json` | Claude Code | 81 | Permissions (allow-list) | OK — tool-specyficzny |
| `Makefile` | Wszystkie | 142 | Skróty Docker | OK — uniwersalny |

### `ai/` (shared context)

| Plik | Linii | Rola | Status |
|------|-------|------|--------|
| `guide.md` | 201 | Feature map, ścieżki, pakiety — **PRIMARY** | **Kluczowy** |
| `context.md` | 184 | Deep context: auth, rate limiting, middleware, GDPR | OK |
| `rules.md` | 156 | Auto-update rules, quality gates, Docker-first, GDPR | OK |
| `prompts.md` | 132 | Szablony promptów do copy-paste | OK |
| `commit-rules.md` | 18 | Konwencje commitów | OK |
| `audit-plan.md` | 445 | Audyt enterprise-readiness | OK (tymczasowy) |
| `mcp/mcp.json` | 32 | MCP config: boost + shadcn + filesystem + context7 | **Niespójny** z innymi |

### `server/` (Laravel — auto-managed by Boost)

| Plik/Folder | Dla kogo | Rola | Status |
|-------------|----------|------|--------|
| `CLAUDE.md` | Claude Code | Auto-generowany przez Boost (1100+ linii) | **Auto — NIE EDYTOWAĆ** |
| `AGENTS.md` | Codex/agenty | Auto-generowany — identyczny z CLAUDE.md | **Auto — NIE EDYTOWAĆ** |
| `.claude/skills/` (12 skills) | Claude Code | Boost auto-skills: pest, inertia, wayfinder, etc. | **Auto** |
| `.claude/settings.local.json` | Claude Code | Permissions (boost MCP, bash, etc.) | OK — per-project |
| `.cursor/skills/` (12 skills) | Cursor | **Identyczne** z .claude/skills/ | **Auto duplikat** |
| `.cursor/mcp.json` | Cursor | MCP: `php artisan boost:mcp` (bare, bez Docker!) | **BŁĄD** |
| `.junie/skills/` (12 skills) | Junie | **Identyczne** z .claude/skills/ | **Auto duplikat** |
| `.junie/guidelines.md` | Junie | Auto-guidelines (1100+ linii, stare wersje!) | **NIEAKTUALNE** |
| `.junie/mcp/mcp.json` | Junie | MCP: `/usr/local/bin/php /var/www/html/artisan` | **BŁĄD** |
| `.agents/skills/` (12 skills) | Multi-agent | **Identyczne** z .claude/skills/ | **Auto duplikat** |
| `.ai/mcp/mcp.json` | Anthropic SDK | MCP: `docker compose exec -T php` | OK (jedyny poprawny!) |
| `.codex/config.toml` | GitHub Codex | MCP: `php artisan boost:mcp` cwd=/var/www/html | **KONTENEROWY** |
| `.mcp.json` | Multi-tool | MCP: `docker compose exec -T php` | OK |
| `opencode.json` | OpenCode.ai | MCP: `php artisan boost:mcp` (bare!) | **BŁĄD** |
| `boost.json` | Laravel Boost | Master config — agenci, pakiety, skills | **Konfiguracja źródłowa** |

### `client/` (Next.js)

| Plik | Dla kogo | Linii | Rola | Status |
|------|----------|-------|------|--------|
| `CLAUDE.md` | Claude Code | 153 | Next.js konwencje, i18n, typy, SEO, WCAG | **OK — specyficzny** |

---

## 2. Problemy i duplikacje

### 2.1 Masywna duplikacja treści (KRYTYCZNE)

Tą samą informację powtarzamy w **5 miejscach**:

```
CLAUDE.md (root)  ─┐
AGENTS.md (root)   │  "Docker-first", "PHP rules", "TS rules",
GEMINI.md (root)   ├─ "testing", "architecture", "API types"
.junie/guidelines  │  → ~80% overlap
server/AGENTS.md  ─┘  (ten jest auto — ale root/AGENTS.md jest ręczny!)
```

**Koszt:** Przy każdej zmianie reguł trzeba aktualizować 4-5 plików ręcznie. Reguły się rozjeżdżają (np. `server/.junie/guidelines.md` ma PHP 8.4 + Inertia v2, a `server/CLAUDE.md` ma PHP 8.5 + Inertia v3).

### 2.2 Niespójne wersje pakietów

| Źródło | PHP | Laravel | Inertia |
|--------|-----|---------|---------|
| `server/CLAUDE.md` (Boost auto) | 8.5 | 13 | v3 |
| `server/.junie/guidelines.md` (Boost auto) | **8.4** | **12** | **v2** |
| Root `CLAUDE.md` (ręczny) | — | 12 | — |
| Root `GEMINI.md` (ręczny) | — | 12 | — |

Boost regeneruje `CLAUDE.md` i `AGENTS.md` przy aktualizacji, ale `.junie/guidelines.md` jest nieaktualne!

### 2.3 Skills — 4x ten sam zestaw

```
server/.claude/skills/    ← 12 skills (source of truth)
server/.cursor/skills/    ← identyczna kopia
server/.junie/skills/     ← identyczna kopia
server/.agents/skills/    ← identyczna kopia
```

Boost automatycznie generuje to dla każdego agenta z `boost.json`. Nie jest to problem per se (każde narzędzie wymaga swojego folderu), ale **to generowane dane — nie powinny być w repo** (powinny być w `.gitignore`).

### 2.4 Root `AGENTS.md` vs `server/AGENTS.md`

- `server/AGENTS.md` = auto-generowany przez Boost (pełne 1100 linii z package versions + skills)
- Root `AGENTS.md` = **ręcznie napisany** (168 linii, kompaktowy, Docker-first)

Codex patrzy na root `AGENTS.md`. To dwa zupełnie różne pliki o tej samej nazwie!

---

## 3. Laravel Boost — co generuje i jak się ma do reszty

### Czym jest Boost

`laravel/boost` to pakiet Laravel który:
1. **Generuje pliki instrukcji** dla różnych AI tool-ów na podstawie `boost.json`
2. **Serwuje MCP server** (`php artisan boost:mcp`) z narzędziami: tinker, DB query, schema, search-docs, browser-logs
3. **Dostarcza skills** (pest-testing, wayfinder, inertia-react, etc.)

### Co generuje Boost (auto-managed — NIE EDYTOWAĆ)

```
server/CLAUDE.md          ← dla Claude Code
server/AGENTS.md          ← dla agentów/Codex
server/.claude/skills/*   ← domain-specific skills
server/.cursor/skills/*   ← kopia dla Cursor
server/.junie/skills/*    ← kopia dla Junie
server/.junie/guidelines.md  ← pełne guidelines dla Junie
server/.agents/skills/*   ← kopia dla multi-agent
server/.cursor/mcp.json   ← MCP config dla Cursor
server/.junie/mcp/mcp.json ← MCP config dla Junie
server/.ai/mcp/mcp.json   ← MCP config (Anthropic SDK)
server/.mcp.json           ← root MCP config
```

### Problem: Boost działa wewnątrz `server/`

Boost myśli, że `server/` jest rootem projektu (bo tam jest `artisan`). Dlatego generuje wszystko wewnątrz `server/`. Ale nasz projekt to monorepo — **root jest poziom wyżej**.

To powoduje, że:
- Claude Code widzi `root/CLAUDE.md` + `server/CLAUDE.md` (oba się ładują)
- Instrukcje z root CLAUDE.md mogą kolidować z Boost auto-guidelines
- MCP configy w `server/` nie wiedzą o `client/`

---

## 4. Analiza MCP — niespójności między narzędziami

### Porównanie komend MCP boost:mcp

| Lokalizacja | Komenda | Docker? | Poprawna? |
|-------------|---------|---------|-----------|
| `ai/mcp/mcp.json` | `docker compose exec php php artisan boost:mcp` | Tak | **TAK** |
| `server/.mcp.json` | `docker compose exec -T php php artisan boost:mcp` | Tak (-T) | **TAK** |
| `server/.ai/mcp/mcp.json` | `docker compose exec -T php php artisan boost:mcp` | Tak (-T) | **TAK** |
| `server/.cursor/mcp.json` | `php artisan boost:mcp` | **NIE** | **NIE — bare PHP** |
| `server/.junie/mcp/mcp.json` | `/usr/local/bin/php /var/www/html/artisan boost:mcp` | **NIE** | **NIE — wewnątrz kontenera?** |
| `server/opencode.json` | `php artisan boost:mcp` | **NIE** | **NIE — bare PHP** |
| `server/.codex/config.toml` | `php artisan boost:mcp` cwd=/var/www/html | **NIE** | **KONTENEROWY** (działa jeśli Codex jest w kontenerze) |

**Problem:** 3 z 7 konfiguracji MCP próbują uruchamiać `php artisan` bezpośrednio na hoście, co łamie zasadę Docker-first. Cursor i OpenCode nie będą mieć dostępu do DB/Redis.

### shadcn MCP

`npx shadcn@latest mcp` — obecny w 3 z 7 konfiguracji. Powinien być wszędzie lub nigdzie.

### Dodatkowe serwery w `ai/mcp/mcp.json`

- `filesystem` — `@modelcontextprotocol/server-filesystem` (redundancja — Claude Code ma wbudowany dostęp do plików)
- `context7` — `https://mcp.context7.com/mcp` (zewnętrzny, nie ma w innych configach)

---

## 5. Nazewnictwo: `ai/` vs `.ai/`

### Obecna sytuacja

- Root: **`ai/`** (widoczny, w repozytorium)
- Server: **`.ai/`** (ukryty, generowany przez Boost)

### Rekomendacja: **`ai/`** (bez kropki)

| Kryterium | `ai/` | `.ai/` |
|-----------|-------|--------|
| Widoczność w IDE | Tak | Ukryty domyślnie |
| Git | Normalny tracking | Łatwo przeoczyć |
| Boost compatibility | — | Boost generuje `.ai/` |
| Inne narzędzia (Junie, Cursor) | Nie mają konwencji | Każde ma swój ukryty folder |
| Dokumentacja projektu | Powinien być widoczny | Ukrywanie instrukcji to antypattern |

**Decyzja:** `ai/` w rocie — bo to **nasza** dokumentacja, nie auto-generated. Boost auto-files w `server/` mogą zostać ukryte (`.claude/`, `.cursor/` etc.) — to narzędzia je czytają, nie ludzie.

---

## 6. Proponowana docelowa struktura

### Zasady

1. **Single Source of Truth** — każda informacja w jednym miejscu
2. **Root `ai/`** = ręcznie zarządzane instrukcje wspólne dla wszystkich narzędzi
3. **Root `CLAUDE.md`** = entry point dla Claude Code, wskazuje na `ai/`
4. **Root `AGENTS.md`** = entry point dla Codex, wskazuje na `ai/`
5. **Root `GEMINI.md`** = entry point dla Gemini CLI, wskazuje na `ai/`
6. **`server/` hidden dirs** = auto-managed przez Boost (`.gitignore` skills)
7. **`client/CLAUDE.md`** = specyficzne instrukcje Next.js (zostaje)
8. **Docker-first** = KAŻDA komenda MCP musi iść przez `docker compose exec`

### Docelowe drzewo plików

```
/
├── CLAUDE.md                        ← Entry point Claude Code (zwięzły, referuje ai/)
├── AGENTS.md                        ← Entry point Codex/agentów (zwięzły, referuje ai/)
├── GEMINI.md                        ← Entry point Gemini CLI (zwięzły, referuje ai/)
├── .junie/
│   └── guidelines.md                ← Entry point Junie (zwięzły, referuje ai/)
├── .claude/
│   └── settings.local.json          ← Permissions Claude Code
├── Makefile                          ← Docker shortcuts
│
├── ai/                               ← ** SHARED KNOWLEDGE BASE **
│   ├── guide.md                      ← Feature map, ścieżki (PRIMARY — update on every feature)
│   ├── context.md                    ← Deep technical: auth, cart, i18n, payments
│   ├── rules.md                      ← Quality gates, auto-update rules, GDPR, Docker-first
│   ├── prompts.md                    ← Szablony promptów
│   ├── commit-rules.md               ← Konwencje commitów
│   ├── features.md                   ← [NOWY] Backlog/roadmap features z priorytetami
│   ├── humanizer.md                  ← [NOWY] Tone of voice, branding, styl komunikacji
│   ├── mcp.md                        ← [NOWY] Dokumentacja serwerów MCP (co mamy, jak skonfigurować)
│   └── mcp/
│       └── mcp.json                  ← MCP config (source of truth — Docker-first!)
│
├── server/                           ← Laravel backend
│   ├── CLAUDE.md                     ← Auto-managed by Boost (nie edytować!)
│   ├── AGENTS.md                     ← Auto-managed by Boost (nie edytować!)
│   ├── boost.json                    ← Boost master config
│   ├── .claude/                      ← Auto: settings + skills
│   ├── .cursor/                      ← Auto: MCP + skills  ← MCP POPRAWIĆ na Docker!
│   ├── .junie/                       ← Auto: guidelines + MCP + skills ← MCP POPRAWIĆ!
│   ├── .agents/                      ← Auto: skills
│   ├── .ai/                          ← Auto: MCP ← OK (Docker-based)
│   ├── .codex/                       ← Codex config ← POPRAWIĆ na Docker!
│   ├── .mcp.json                     ← MCP root ← OK
│   └── opencode.json                 ← OpenCode ← POPRAWIĆ na Docker!
│
├── client/                           ← Next.js frontend
│   └── CLAUDE.md                     ← Next.js specific rules (zostaje)
│
└── docs/                             ← Human documentation
    ├── backend.md
    ├── frontend.md
    └── ...
```

### Zmiany w entry-point plikach

**Root `CLAUDE.md`** — skrócić do:
```markdown
# CLAUDE.md
Monorepo: server/ (Laravel) + client/ (Next.js)
> Read ai/guide.md first. Read ai/context.md for deep tasks. Read ai/rules.md for quality gates.
> server/CLAUDE.md is auto-managed by Boost — do not edit.
[Docker commands + Non-negotiable rules — to co teraz, ale BEZ duplikowania ai/rules.md]
```

**Root `AGENTS.md`** — skrócić do:
```markdown
# AGENTS.md
> Full context: ai/guide.md · ai/context.md · ai/rules.md
[Struktura + najważniejsze reguły — bez powtórek z ai/*]
```

**Root `GEMINI.md`** — skrócić do:
```markdown
# GEMINI.md
> Read ai/guide.md for features. Read ai/rules.md for quality gates.
[Docker commands + key conventions — zwięzłe]
```

---

## 7. Co warto dodać

### 7.1 `ai/features.md` — Backlog / Roadmap

Obecny `ai/guide.md` zawiera "Implemented Features", ale brakuje:
- Co jest zaplanowane
- Priorytety (P0/P1/P2)
- Zależności między features

```markdown
# Features Backlog

## P0 — Krytyczne (przed launch)
- [ ] XSS sanitization (DOMPurify)
- [ ] Content-Security-Policy
- [ ] CORS lock-down
- [ ] Sentry integration

## P1 — Ważne
- [ ] Inventory management (stock tracking)
- [ ] Email templates editor
- [ ] Multi-warehouse
...
```

Alternatywnie: przenieść do `docs/features-backlog.md` (jeśli już istnieje — sprawdzić).

### 7.2 `ai/humanizer.md` — Styl komunikacji

Instrukcje dla AI jak pisać:
- Tekst publiczny (opisy produktów, blog, maile) — ton, język, brand voice
- Komunikaty systemowe (flash messages, błędy, powiadomienia)
- Komentarze w kodzie — kiedy pisać, w jakim języku
- Lokalizacja — polskie vs angielskie nazwy w kodzie

```markdown
# Humanizer — Communication Style

## Code & Commits
- Language: English always (code, comments, commits, PR descriptions)
- No emojis in code or commits

## User-Facing Text (Admin Panel)
- Language: based on admin locale (translations via lang/*.php)
- Tone: professional, concise, action-oriented

## Public Frontend Text
- Language: per locale (EN/PL)
- Tone: friendly, trustworthy, clear
- Brand voice: [define]
```

### 7.3 `ai/mcp.md` — MCP Documentation

```markdown
# MCP Servers

## laravel-boost
- Purpose: Tinker, DB query, schema inspect, docs search, browser logs
- Command: MUST use Docker: `docker compose exec -T php php artisan boost:mcp`
- Runs: on HOST, connects to Docker services via localhost ports
- Config source: boost.json

## shadcn
- Purpose: shadcn/ui component docs and generation
- Command: `npx shadcn@latest mcp`
- Used by: admin SPA (server/resources/js/)

## Nieużywane/zbędne
- filesystem MCP — redundancja (Claude Code ma natywny dostęp do plików)
- context7 — external service, wartość wątpliwa
```

### 7.4 Czego NIE dodawać

| Pomysł | Dlaczego nie |
|--------|-------------|
| `ai/architecture.md` | Już jest w `docs/backend.md` + `docs/frontend.md` |
| `ai/changelog.md` | Git log jest źródłem prawdy |
| `ai/debugging.md` | Fixy są w kodzie, kontekst w commitach |
| `ai/skills/` w root | Boost generuje skills per-tool w server/ — nie duplikować |

### 7.5 Brakujące konfiguracje narzędzi

| Narzędzie | Obecny entry point | Brakuje? |
|-----------|-------------------|----------|
| Claude Code | `CLAUDE.md` (root + server + client) | OK |
| Codex | `AGENTS.md` (root) + `server/AGENTS.md` (auto) | OK |
| Gemini CLI | `GEMINI.md` (root) | Brak deep context — dodać ref do `ai/` |
| Cursor | `server/.cursor/` (auto) | **Brak root entry point** — Cursor nie widzi `ai/` |
| Junie | `.junie/guidelines.md` (root + server) | OK ale root jest ręczny |
| OpenCode | `server/opencode.json` | **Brak root entry point** |
| GitHub Copilot | brak | Rozważyć `.github/copilot-instructions.md` |
| Windsurf | brak | Rozważyć `.windsurfrules` jeśli używany |

---

## 8. Plan migracji — kolejność kroków

### Faza 1: Naprawy krytyczne (MCP Docker-first)

```bash
# 1. Naprawić server/.cursor/mcp.json — dodać docker compose exec
# 2. Naprawić server/.junie/mcp/mcp.json — dodać docker compose exec
# 3. Naprawić server/opencode.json — dodać docker compose exec
# 4. Usunąć filesystem MCP z ai/mcp/mcp.json (zbędny)
# 5. Usunąć context7 z ai/mcp/mcp.json (lub zostawić jeśli używane)
```

**UWAGA:** Konfiguracje `.cursor/mcp.json` i `.junie/mcp/mcp.json` w server/ są **auto-generowane przez Boost**. Zmiany trzeba zrobić w konfiguracji Boost (`boost.json`) albo nadpisać ręcznie (i dodać do `.gitignore` żeby Boost ich nie nadpisał).

Sprawdzić: `php artisan boost:publish --help` — czy Boost pozwala customizować komendy MCP.

### Faza 2: Redukcja duplikacji w root entry points

1. **Root `CLAUDE.md`** — usunąć duplikaty z `ai/rules.md`, zostawić:
   - Struktura monorepo (3 linijki)
   - Docker commands (najważniejsze 5)
   - Non-negotiable rules (te które NIE SĄ w `ai/rules.md`)
   - Referencje: "Read `ai/guide.md` first"

2. **Root `AGENTS.md`** — analogicznie skrócić, dodać:
   ```
   For full rules: ai/rules.md
   For feature map: ai/guide.md
   For deep context: ai/context.md
   ```

3. **Root `GEMINI.md`** — dodać referencje do `ai/`

4. **Root `.junie/guidelines.md`** — analogicznie

### Faza 3: Nowe pliki

1. Utworzyć `ai/features.md` — backlog z priorytetami
2. Utworzyć `ai/humanizer.md` — styl komunikacji / brand voice
3. Utworzyć `ai/mcp.md` — dokumentacja MCP serwerów

### Faza 4: Porządki

1. Sprawdzić `.gitignore` — czy auto-generated skills/guidelines Boost powinny być w repo
2. Ujednolicić `server/.codex/config.toml` (zdecydować: kontenerowy czy Docker-based)
3. Rozważyć `.github/copilot-instructions.md` jeśli używamy Copilot
4. Usunąć `ai/audit-plan.md` po wdrożeniu (lub przenieść do `docs/`)

### Faza 5: Walidacja

1. Uruchomić każde narzędzie AI i sprawdzić czy:
   - Widzi aktualne wersje pakietów
   - MCP boost działa (połączenie z DB)
   - Czyta `ai/guide.md` jako primary context
2. Test: poprosić każde narzędzie o "wylistuj wszystkie features projektu" — powinno zwrócić to samo

---

## Podsumowanie priorytetów

| # | Akcja | Priorytet | Powód |
|---|-------|-----------|-------|
| 1 | Naprawić MCP configs na Docker-first | **P0** | Cursor/OpenCode nie działają poprawnie |
| 2 | Skrócić root entry points (CLAUDE/AGENTS/GEMINI/Junie) | **P1** | Duplikacja = drift |
| 3 | Dodać `ai/features.md` | **P1** | AI nie zna roadmapy |
| 4 | Dodać `ai/humanizer.md` | **P2** | Nice to have — brand voice |
| 5 | Dodać `ai/mcp.md` | **P2** | Dokumentacja dla developerów |
| 6 | Boost auto-files → .gitignore | **P2** | 4x skopiowane skills to szum |
| 7 | GitHub Copilot instructions | **P3** | Tylko jeśli używane |
| 8 | `.junie/guidelines.md` sync z Boost | **P1** | Stare wersje pakietów! |
