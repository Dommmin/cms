---
name: ux-review
description: Analizuje ekran lub flow pod kątem UI/UX i wdraża lub proponuje poprawki.
context: fork
agent: ui-ux
argument-hint: "[screen, route, component path, or flow name]"
---

$ARGUMENTS

Zrob UI/UX review wskazanego ekranu, flow lub komponentu.

## Tryb dzialania

Jesli podano argument:
- jesli to sciezka pliku -> przeanalizuj ten komponent lub widok
- jesli to nazwa flow (np. `checkout`, `product page`, `cart`) -> przesledz powiazane widoki

Jesli brak argumentu:
- przeanalizuj biezace zmiany frontendowe w `client/` i `server/resources/js/`

## Co sprawdzic

1. Hierarchie wizualna i czytelnosc
2. CTA i jasnosc komunikatow
3. Formularze oraz feedback po bledzie i sukcesie
4. Loading, empty i error states
5. Mobile UX i responsywnosc

## Format odpowiedzi

- Co dziala dobrze
- Co spowalnia lub myli uzytkownika
- Konkretne propozycje poprawek
- Jesli zmiany sa niewielkie i bezpieczne, wdroz je
