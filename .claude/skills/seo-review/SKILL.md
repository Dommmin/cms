---
name: seo-review
description: Analizuje storefront pod SEO techniczne i contentowe.
context: fork
agent: seo
argument-hint: "[route group, page path, or empty for storefront audit]"
---

$ARGUMENTS

Zrob SEO review dla wskazanej strony lub sekcji storefrontu.

## Tryb dzialania

Jesli podano argument:
- jesli to sciezka pliku lub route -> skup sie na tej stronie
- jesli to nazwa sekcji (np. `blog`, `categories`, `products`) -> przeanalizuj powiazane widoki

Jesli brak argumentu:
- wykonaj szybki audit SEO calego `client/app/`

## Co sprawdzic

1. `title`, `description`, Open Graph
2. Canonical i hreflang
3. Sitemap i robots
4. Structured data
5. Heading structure i potencjalny duplicate content

## Format odpowiedzi

- Critical issues
- Quick wins
- Strategic improvements
- Jesli zmiany sa jednoznaczne i bezpieczne, wdroz je
