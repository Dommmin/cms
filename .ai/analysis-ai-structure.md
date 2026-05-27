# Analiza struktury AI — ARCHIWUM

Ten plik został skrócony, żeby nie generować szumu tokenowego.

## Status

- Oryginalna długa analiza (2026-04-02) była historyczna i częściowo nieaktualna.
- Aktualnym źródłem prawdy są: `.ai/routing.md`, `.ai/rules.md`, `.ai/guide.md`.

## Docelowy model (3 poziomy)

1. **Poziom 0 (always-on, 50-80 linii)**  
   `.cursor/rules/global.mdc` + link do `.ai/routing.md`
2. **Poziom 1 (task-level, on demand)**  
   `.ai/guide.md` (sekcja), `.ai/rules.md` (quality), `.cursor/rules/backend.mdc`
3. **Poziom 2 (deep context, only when needed)**  
   `.ai/context.md`, `.ai/commit-rules.md`, `.ai/prompts.md`

## Weryfikacja

- Po zmianach kodu, przed "done": `make check` (Docker)
- Przed commitem: `make fix && make check`
- Nigdy nie deleguj checków do usera, jeśli agent ma dostęp do Dockera
