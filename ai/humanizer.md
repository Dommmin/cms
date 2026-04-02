# Humanizer — Communication Style

Instrukcje dla AI jak pisać teksty w tym projekcie.

---

## Język bazowy

| Kontekst | Język | Uwagi |
|----------|-------|-------|
| Kod (PHP, TS, CSS) | **Angielski** | Zawsze — nazwy zmiennych, metod, klas |
| Komentarze w kodzie | **Angielski** | PHPDoc, inline komentarze |
| Git commits | **Angielski** | Conventional commits: `feat:`, `fix:`, `refactor:` |
| PR opisy, issue | **Angielski** | Techniczny, zwięzły |
| Admin panel UI | **Polski + Angielski** | Via `lang/pl/admin.php` i `lang/en/admin.php` |
| Publiczny frontend | **Polski + Angielski** | Via `translations` table — locale-based |
| Dokumentacja AI (`ai/`) | **Polski** | Robocza dokumentacja dla zespołu |
| Dokumentacja techniczna (`docs/`) | **Polski** | USER_GUIDE.md, DEVELOPER_GUIDE.md |

---

## Styl komunikatów w UI

### Flash messages (admin panel)

- **Success:** Krótkie, pozytywne, konkretne. "Produkt zapisany." nie "Operacja zakończona pomyślnie."
- **Error:** Informacyjne, nie techniczne. "Nie można usunąć kategorii z przypisanymi produktami." nie "Foreign key constraint failed."
- **Validation:** Wskazuj pole. "Pole 'Nazwa' jest wymagane."
- Bez wykrzykników w komunikatach sukcesu (zbyt entuzjastyczne)
- Bez emoji w komunikatach systemowych

### Publiczny frontend (klient końcowy)

- **Ton:** Przyjazny, rzeczowy, profesjonalny
- **Persono:** Sklep internetowy klasy mid-market — nie dyskontowy, nie luksusowy
- **Akcje:** Imperatyw: "Dodaj do koszyka", "Przejdź do kasy", "Sprawdź dostępność"
- **Błędy:** Pomocne, nie winące użytkownika. "Nie znaleźliśmy tego produktu. Spróbuj wyszukać inaczej."
- **Empty states:** Konstruktywne. "Twój koszyk jest pusty. Zacznij od [kategorii]."

---

## Nazewnictwo w kodzie

### PHP

```php
// Dobre — opisowe, angielskie
$isRegisteredForDiscounts
$hasActiveSubscription
$calculateOrderTotal()
$sendAbandonedCartEmail()

// Złe — skróty, polskie litery, niejasne
$disc
$aktywnyAbonament
$calc()
$wyslij()
```

### TypeScript / React

```ts
// Komponenty — PascalCase, rzeczowniki
ProductCard, OrderStatusBadge, CheckoutSummary

// Hooki — use + camelCase
useLocalePath, useCartItems, usePaymentStatus

// Funkcje API — czasownik + rzeczownik
fetchProducts, createOrder, updateCartItem

// Props — opisowe
isOutOfStock (nie: oos), showPriceHistory (nie: history)
```

### Baza danych

```sql
-- Tabele — snake_case, liczba mnoga angielska
products, blog_posts, order_items, affiliate_codes

-- Kolumny — snake_case, opisowe
created_at, updated_at, deleted_at
unit_price (nie: price), is_active (nie: active)
```

---

## Komentarze w kodzie

```php
// DOBRZE — wyjaśnia DLACZEGO, nie CO
// Prices are stored in grosz (1/100 PLN) to avoid floating-point rounding errors
$priceInGrosze = (int) round($pricePln * 100);

// Wayfinder-generated file — do not edit manually
// Run: php artisan wayfinder:generate

// ŹLE — opis tego co widać w kodzie
// Multiply price by 100
$priceInGrosze = $pricePln * 100;
```

- PHPDoc dla publicznych metod serwisów i modeli
- Inline komentarze tylko dla nieoczywistej logiki biznesowej
- Nie komentuj oczywistego kodu

---

## Teksty SEO (generowane przez AI)

Jeśli AI generuje meta descriptions, OG titles lub treści SEO:

- **Meta description:** Max 160 znaków, zawiera słowo kluczowe, call-to-action
- **OG title:** Max 60 znaków, konkretny
- **Alt text zdjęć:** Opisowy, bez "zdjęcie", "obraz" na początku
- **Structured data:** Schema.org — używać istniejących builderów z `client/lib/schema.ts`

---

## Czego nie robić

- Nie używaj emoji w kodzie, commitach, komentarzach, ani komunikatach systemowych
- Nie tłumacz nazw PHP klas, metod ani zmiennych na polski
- Nie generuj "lorem ipsum" — używaj realistycznych danych (nazwy produktów, prawdziwe kwoty)
- Nie dodawaj zbędnych "TODO: remove before production" komentarzy — po prostu usuń kod
