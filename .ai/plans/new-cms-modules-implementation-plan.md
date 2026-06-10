# Plan wdrożenia nowych modułów CMS

> Status: **draft** | Created: 2026-06-10
> Cel: Rozszerzenie systemu CMS monorepo o nowe, dynamiczne moduły wzorowane na systemach WordPress i Shopify w celu wyeliminowania sztywno zakodowanych podstron i oddania pełnej kontroli administratorowi.

---

## 1. Wykaz planowanych modułów

Proponujemy wdrożenie 4 nowych modułów dynamicznych, rejestrowanych w bazie danych oraz konfigurowanych przez panel administratora:

1. **Lokalizator sklepów (`store_locator`)**
2. **Centrum ofert błyskawicznych (`flash_sales_hub`)**
3. **Śledzenie przesyłki gościa (`guest_order_tracker`)**
4. **Preferencje newslettera (`newsletter_preferences`)**

---

## 2. Architektura i wdrożenie po stronie Backend (`server/`)

### A. Rejestracja w CMS (`server/config/cms/modules.php`)

Należy dodać definicje nowych modułów w pliku konfiguracyjnym:

```php
return [
    // ... istniejące moduły ...
    
    'store_locator' => [
        'label' => 'Lokalizator sklepów stacjonarnych',
        'description' => 'Dynamiczna mapa i lista sklepów fizycznych z filtrowaniem miast.',
        'frontend_renderer' => 'store_locator',
        'module_config_schema' => [
            'default_zoom' => ['nullable', 'integer', 'min:1', 'max:20'],
            'initial_city' => ['nullable', 'string', 'max:255'],
        ],
    ],
    'flash_sales_hub' => [
        'label' => 'Centrum wyprzedaży błyskawicznych',
        'description' => 'Lista aktywnych i nadchodzących promocji limitowanych czasowo z odliczaniem.',
        'frontend_renderer' => 'flash_sales_hub',
        'module_config_schema' => [
            'show_expired' => ['required', 'boolean'],
            'limit' => ['nullable', 'integer', 'min:1'],
        ],
    ],
    'guest_order_tracker' => [
        'label' => 'Śledzenie zamówienia (Gość)',
        'description' => 'Formularz śledzenia statusu zamówienia i przesyłek po numerze referencyjnym i e-mail.',
        'frontend_renderer' => 'guest_order_tracker',
        'module_config_schema' => [],
    ],
    'newsletter_preferences' => [
        'label' => 'Zarządzanie preferencjami newslettera',
        'description' => 'Strona do zarządzania subskrypcją i tematami newslettera dla RODO/GDPR.',
        'frontend_renderer' => 'newsletter_preferences',
        'module_config_schema' => [],
    ],
];
```

### B. Endpoints API (`routes/api.php`)

Do obsługi śledzenia i newslettera potrzebne są nowe bezpieczne punkty końcowe:

1. **Śledzenie zamówienia**:
   - `GET /api/v1/orders/track?reference=ORD-XXXXXX&email=user@example.com`
   - **Bezpieczeństwo**: endpoint zwraca tylko status zamówienia, nazwę kuriera i numer przesyłki. Nie może zwracać pełnych danych osobowych (np. adresu dostawy, telefonu, szczegółów płatności) ze względów bezpieczeństwa (zapobieganie wyciekom danych bez autoryzacji sesji).

2. **Zarządzanie newsletterem**:
   - `GET /api/v1/newsletter/preferences?token=SECURE_HASH`
   - `POST /api/v1/newsletter/preferences`
   - Obsługa jednorazowych, podpisanych kryptograficznie tokenów wysyłanych w stopkach maili (opt-out / preferences flow).

---

## 3. Architektura i wdrożenie po stronie Frontend (`client/`)

### A. Rozszerzenie `ModuleRenderer` (`client/components/page-builder/module-renderer.tsx`)

Należy rozbudować instrukcję `switch (page.module_name)` o nowe mapowania:

```tsx
        case 'store_locator':
            return <StoreLocatorModule page={page} />;
        case 'flash_sales_hub':
            return <FlashSalesHubModule page={page} />;
        case 'guest_order_tracker':
            return <GuestOrderTrackerModule page={page} />;
        case 'newsletter_preferences':
            return <NewsletterPreferencesModule page={page} />;
```

### B. Implementacja komponentów klienckich (`client/components/page-builder/modules/`)

Każdy moduł powinien mieć dedykowany komponent serwerowy (pobierający początkowe dane z API) delegujący do zoptymalizowanego, interaktywnego komponentu klienckiego (z `'use client'`).

#### 1. Store Locator Module (`store-locator-module.tsx`)
- Pobiera z API listę sklepów (korzysta z modelu `Store`).
- Renderuje mapę Leaflet (korzystając z istniejących komponentów `StoreMap` / `StoreMapInner`).
- Oferuje listę sklepów z podziałem na miasta, godziny otwarcia oraz przycisk "Pokaż na mapie".

#### 2. Flash Sales Hub Module (`flash-sales-hub-module.tsx`)
- Pobiera listę promocji błyskawicznych.
- Renderuje siatkę kart promocyjnych z licznikami czasu (`framer-motion` + `setInterval`).
- Pokazuje stopień wyczerpania zapasów (progress bar) i bezpośrednie linki do zakupu.

#### 3. Guest Order Tracker Module (`guest-order-tracker-module.tsx`)
- Renderuje dwupolowy formularz (Numer referencyjny + Adres e-mail).
- Wywołuje bezpieczne API do śledzenia.
- Pokazuje graficzny timeline statusu zamówienia (Draft -> Paid -> Shipped -> Delivered) oraz odnośnik do śledzenia paczki u przewoźnika.

#### 4. Newsletter Preferences Module (`newsletter-preferences-module.tsx`)
- Pobiera stan subskrypcji użytkownika na podstawie tokenu z adresu URL.
- Wyświetla formularz wyboru tematów subskrypcji (np. Nowości, Promocje, Lifestyle).
- Zawiera dedykowany, jednoklikowy przycisk całkowitego wypisania się (RODO).

---

## 4. Harmonogram prac (Etapy)

### Etap 1: Konfiguracja i Typy (Backend + Shared Types)
- Rejestracja modułów w `server/config/cms/modules.php`.
- Aktualizacja interfejsów TypeScript w `client/types/api.ts`.
- Stworzenie migracji/seederów do nowych stron testowych.

### Etap 2: Implementacja Logiki API (Backend)
- Stworzenie endpointu `/orders/track` z zabezpieczeniem danych osobowych.
- Stworzenie mechanizmu postanowień / podpisanych tokenów newslettera.
- Napisanie testów Pest dla nowych endpointów API.

### Etap 3: Budowa Widoków i Komponentów (Frontend)
- Implementacja i ostylowanie poszczególnych modułów.
- Wykorzystanie design-tokenów (`globals.css`, glassmorphism, harmonious palettes).
- Weryfikacja RWD i interakcji.

### Etap 4: Testy i Audyt Jakościowy
- Uruchomienie `make fix && make check`.
- Przeprowadzenie testów UX na różnych viewportach (mobile, tablet, desktop).
