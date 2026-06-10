# Content Style Guide: LinkedIn i Blog

## Zasada nadrzędna

**Chwytliwe, ale prawdziwe.** Każdy post musi brzmieć jak głos kogoś, kto utrzymuje ten konkretny system — nie jak template „Laravel tips".

Jeśli post mógłby napisać ktoś, kto zaczął projekt dwa tygodnie temu — jest zbyt ogólny.

---

## Fundamentalne ograniczenia (ZAWSZE)

### Czego NIE ujawniamy nigdzie (LinkedIn i blog)

- nazw klas (`PageBuilderSyncService`, `SmartCollectionService`, itp.)
- ścieżek plików i katalogów w repozytorium
- endpointów API aplikacji
- fragmentów kodu z aplikacji
- nazw plików konfiguracyjnych projektu
- nazw tabel, kolumn bazy danych

### Co możemy opisywać

- koncepcje architektoniczne i wzorce (bez ujawniania implementacji)
- problemy i trade-offy (bez kodu rozwiązania)
- decyzje projektowe i ich konsekwencje
- porównania z popularnymi rozwiązaniami (Shopify, WooCommerce) na poziomie funkcjonalnym

---

## LinkedIn — zasady formatu

### Cel posta na LinkedIn

Posty LinkedIn mają **jeden cel**: zachęcić do wejścia na bloga lub zbudować zaufanie poprzez doświadczenie. Nie tłumaczymy technicznie — sygnalizujemy.

### Struktura (max ~150–200 słów)

1. **Mocny hook** — jedno zdanie, konkret lub zaskoczenie
2. **Napięcie** — problem lub obserwacja (2–3 zdania)
3. **Sygnały wartości** — 2–4 punkty: liczby, porównania, kontrast (nie kod)
4. **Wniosek** — jedna lekcja lub pytanie do czytelnika
5. **CTA** — „artykuł na blogu, link w komentarzu" (nie w poście)

### Format

- akapity max 2–3 linie
- max 5–6 hashtagów
- link do bloga **w komentarzu**, nie w poście (lepszy organic reach)
- żadnych fragmentów kodu, ścieżek, nazw klas

### Przykład dobrego otwarcia LinkedIn

> „Opublikowałem stronę w panelu. Storefront nadal pokazywał starą wersję. Przez godzinę myślałem, że to błąd cache."

> „Visual editor wygląda prosto. Zapis jego stanu — nie. Drag-and-drop miałem gotowy w tydzień."

### Przykład złego otwarcia LinkedIn (za długi, ujawnia kod)

> „`PageBuilderSyncService` obsługuje diff/upsert po `client_id` sekcji i bloków — naiwny `delete all + insert all` psuje referencje w `POST /api/cms/revalidate`..."

---

## Blog — zasady formatu

### Cel artykułu blogowego

Artykuł ma dać **techniczną głębię** bez ujawniania implementacji. Czytelnik rozumie problem i podejście — ale nie może sklonować architektury.

### Struktura

- hook z realnego momentu w projekcie
- sekcje H3 z jednym problemem każda
- trade-off przy każdej decyzji (co zyskujesz, co tracisz)
- podsumowanie: jedna lekcja, nie lista buzzwordów
- AI w produkcie: max akapit „co planuję" — bez opisów wdrożonych funkcji, które nie istnieją

### Co możemy w blogu

- opisywać klasy problemów (bez nazw klas: „synchronizacja różnicowa", nie `PageBuilderSyncService`)
- cytować zewnętrzne konwencje (np. „integer cents zamiast float — standard w e-commerce")
- porównywać podejścia konceptualnie
- używać pseudokodu lub JSON jako ilustracji problemu (nie kod aplikacji)

### Czego nie robimy w blogu

- nie cytujemy nazw klas, serwisów, metod z kodu aplikacji
- nie wklejamy fragmentów kodu z repozytorium
- nie ujawniamy ścieżek plików ani struktury katalogów
- nie opisujemy endpointów API aplikacji (można mówić ogólnie: „webhook revalidation", nie `POST /api/cms/revalidate`)

---

## AI — dwa poziomy, dwa momenty publikacji

### Teraz: AI jako narzędzie developera

- eksploracja architektury przed kodem
- boilerplate (migracje, testy, fabryki)
- review zapytań pod wydajność

**Pisz o tym swobodnie** — to nie ujawnia nic o aplikacji.

### Później: AI w produkcie

- **Tylko** gdy funkcja jest w produkcji
- zawsze jako usprawnienie, nigdy zamiennik ręcznej pracy
- obowiązkowo: zatwierdzanie, sanitizacja treści, brak auto-publish
- **Nie publikuj** w czasie teraźniejszym, dopóki funkcja nie istnieje

---

## Stack — dla spójności

| Prawda | Błąd |
|--------|------|
| Admin: Inertia + React | Blade/Livewire |
| Storefront: Next.js | „frontend w Laravelu" |
| Ceny: integer (grosze) | float / decimal w API |
| AI w produkcie: plan/draft | „już wdrożone" |
| Opisujemy koncepcje | Ujawniamy kod aplikacji |

---

## Proporcje tematyczne (czerwiec–lipiec)

- 30% architektura i headless end-to-end
- 20% e-commerce (podatki, płatności, dane)
- 30% panel admin + edytor + bieżące refaktory
- 10% AI jako narzędzie dev
- 10% build in public / podsumowania

---

## Rytm publikacji

- **LinkedIn:** co 2–3 dni
- **Blog:** co ~10 dni
- **Link do bloga:** zawsze w komentarzu pod postem LinkedIn, nie w treści

---

## Status plików treści

| Plik | Zawartość |
|------|-----------|
| `LINKEDIN_POSTS_2026-06.md` | Posty 1–20 gotowe + DRAFT AI produkt |
| `BLOG_POST_DRAFTS_CMS_2026-06.md` | Artykuły 1–2 gotowe + DRAFT AI builder |
| `CONTENT_PUBLICATION_PLAN_2026-06.md` | Kalendarz lipiec–sierpień |

Przed publikacją draftu AI: funkcja musi być w produkcji, flow ręczny udokumentowany, testy napisane.
