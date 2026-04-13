# MCP Servers

Dokumentacja serwerów MCP używanych w projekcie.

> Konfiguracja source of truth: `ai/mcp/mcp.json`
> Konfiguracje per-tool: `server/.ai/mcp/mcp.json`, `server/.mcp.json`, `server/.cursor/mcp.json`, `server/.junie/mcp/mcp.json`

---

## Zasada: Docker-first

**Wszystkie komendy MCP MUSZĄ używać `docker compose exec`.**

```json
{
  "command": "docker",
  "args": ["compose", "exec", "-T", "php", "php", "artisan", "boost:mcp"]
}
```

Powód: laravel-boost potrzebuje dostępu do bazy danych i Redis, które są dostępne tylko wewnątrz sieci Docker. Uruchomienie `php artisan boost:mcp` bezpośrednio na hoście spowoduje błąd połączenia.

---

## laravel-boost

**Cel:** Zestaw narzędzi AI dla aplikacji Laravel — dostarczany przez `laravel/boost`.

**Komenda:** `docker compose exec -T php php artisan boost:mcp`

**Dostępne narzędzia:**

| Narzędzie | Opis | Kiedy używać |
|-----------|------|-------------|
| `search-docs` | Przeszukuje dokumentację pakietów wg zainstalowanych wersji | **Zawsze przed zmianami w kodzie** |
| `database-query` | Wykonuje read-only zapytania SQL | Zamiast tinker dla prostych zapytań |
| `database-schema` | Pokazuje strukturę tabel | Przed pisaniem migracji/modeli |
| `tinker` | Wykonuje PHP w kontekście aplikacji | Debugowanie, testowanie kodu |
| `browser-logs` | Czyta logi przeglądarki, błędy JS | Debugowanie frontendu |
| `list-routes` | Listuje routes Laravel | Sprawdzanie dostępnych endpointów |
| `application-info` | Info o aplikacji, wersjach pakietów | Kontekst środowiska |
| `last-error` | Ostatni błąd z logów Laravel | Szybkie debugowanie |

**Ważne:**
- Używaj `search-docs` przed każdą zmianą kodu — zwraca dokumentację właściwą dla zainstalowanych wersji
- Boost działa na HOST, łączy się z Docker services przez `localhost:3306` i `localhost:6379`
- Komenda w `server/boost.json` wskazuje na `/Users/domin/admin/artisan` — osobna boost admin app

---

## shadcn

**Cel:** Dokumentacja i generowanie komponentów shadcn/ui.

**Komenda:** `npx shadcn@latest mcp`

**Używany dla:** Admin SPA (`server/resources/js/`) — komponenty UI, dialogi, formularze.

**Nie używać dla:** Publicznego frontendu (`client/`) — ten używa własnych komponentów Tailwind.

---

## Konfiguracje per-tool

| Plik | Narzędzie | Status |
|------|-----------|--------|
| `ai/mcp/mcp.json` | Claude Code (source of truth) | OK — Docker |
| `server/.ai/mcp/mcp.json` | Anthropic SDK / Claude Code | OK — Docker (`-T`) |
| `server/.mcp.json` | Multi-tool fallback | OK — Docker (`-T`) |
| `server/.cursor/mcp.json` | Cursor IDE | OK — Docker (`-T`) |
| `server/.junie/mcp/mcp.json` | Junie | OK — Docker (`-T`) |
| `server/opencode.json` | OpenCode.ai | OK — Docker (`-T`) |
| `server/.gemini/settings.json` | Gemini CLI | OK — Docker (`-T`) |
| `server/.codex/config.toml` | GitHub Codex | Kontenerowy (`cwd=/var/www/html`) |

**Nota o Codex:** `server/.codex/config.toml` używa `php artisan boost:mcp` z `cwd = "/var/www/html"` — działa jeśli Codex jest uruchamiany wewnątrz kontenera PHP. Jeśli nie, trzeba zmienić na Docker-based.

---

## Konfiguracja Claude Code (`server/.claude/settings.local.json`)

Zawiera `enableAllProjectMcpServers: true` — Claude Code automatycznie wykrywa i uruchamia MCP serwery z wszystkich `*.mcp.json` plików w projekcie.

Permissions allow-list zawiera m.in.:
- `mcp__laravel-boost__*` — wszystkie narzędzia boost
- `Bash(docker compose:*)` — docker commands
- `WebFetch` dla packagist.org, github.com, etc.

---

## Dodawanie nowego MCP serwera

1. Dodaj konfigurację do `ai/mcp/mcp.json` (source of truth)
2. Skopiuj do `server/.ai/mcp/mcp.json`, `server/.mcp.json`, `server/.cursor/mcp.json`, `server/.junie/mcp/mcp.json`, `server/opencode.json`
3. Upewnij się że komenda używa `docker compose exec` (Docker-first!)
4. Dodaj wpis do tej dokumentacji
5. Dodaj narzędzia do allow-list w `server/.claude/settings.local.json` jeśli potrzeba
