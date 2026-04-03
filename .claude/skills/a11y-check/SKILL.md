---
name: a11y-check
description: Sprawdza i poprawia dostępność widoku lub komponentu zgodnie z WCAG 2.2 AA.
context: fork
agent: accessibility
argument-hint: "[component path, page path, or flow name]"
---

$ARGUMENTS

Zrob accessibility check wskazanego widoku, komponentu lub flow.

## Tryb dzialania

Jesli podano argument:
- jesli to sciezka pliku -> sprawdz ten plik i najblizsze zaleznosci
- jesli to nazwa flow (np. `checkout`, `filters`, `modal`) -> przeanalizuj powiazane komponenty

Jesli brak argumentu:
- przeanalizuj biezace frontendowe zmiany pod katem a11y

## Co sprawdzic

1. Semantyke HTML
2. Focus order i keyboard navigation
3. Labels, `aria-describedby`, komunikaty bledow
4. Modale, dropdowny i elementy dynamiczne
5. Czy znaczenie nie zalezy wylacznie od koloru

## Format odpowiedzi

- Znalezione problemy
- Poziom ryzyka lub wplywu
- Konkretne poprawki
- Jesli poprawki sa lokalne i bezpieczne, wdroz je
