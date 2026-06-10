# Artykuły Blogowe: Czerwiec–Lipiec 2026

> **Harmonogram:** artykuły co ~10 dni, LinkedIn co 2–3 dni
> **Zasada:** technicznie wartościowe, bez ujawniania kodu aplikacji, nazw klas ani ścieżek plików

---

## Artykuł 1 (Planowany: 2026-06-15)

### Tytuł: Headless platforma w Laravelu — trzy decyzje, które definiują projekt

**Status:** gotowy

---

### Lead

Był moment, w którym przestałem mówić „buduję CMS".

Siedziałem nad pytaniem, czy moduł sklepu może bezpośrednio sięgać po dane z modułu treści — i zrozumiałem, że to nie jest pytanie o relacje w bazie. To pytanie o to, **czy platforma przetrwa kolejny moduł, którego jeszcze nie ma**.

Poniżej trzy decyzje architektoniczne, które kosztowały mnie najwięcej czasu w monorepo headless: Laravel (admin + API), Next.js (storefront), mobile (Expo). Bez marketingu — tylko decyzje i trade-offy.

---

### 1. Granice modułów: komunikacja przez zdarzenia, nie przez bezpośrednie zależności

Kiedy dołożyłem pełny moduł e-commerce (produkty, warianty, zamówienia, płatności), stanąłem przed wyborem.

**Podejście naiwne:** współdzielone serwisy, bezpośrednie zależności między modułem treści a sklepem. Szybkie w implementacji, kosztowne przy każdym kolejnym module.

**Podejście, które wybrałem:** moduły nie importują się nawzajem. Komunikują się przez zdarzenia i wąskie interfejsy — „strona opublikowana", „zamówienie opłacone", „przesyłka wysłana".

**Efekt praktyczny:** mogę zmieniać logikę zamówień (statusy, faktury, webhooki wychodzące) bez ryzyka zepsucia renderera treści. Mobile korzysta z tego samego API co storefront — nie z logiki wewnętrznej admina.

**Trade-off:** więcej plików, więcej testów integracyjnych. Zysk: granice, które da się utrzymać przy kolejnych modułach.

---

### 2. Spójność API: jeden kontrakt dla trzech klientów

Mam trzech konsumentów API: storefront, aplikację mobilną, potencjalne integracje zewnętrzne. Każdy niespójny endpoint to potencjalny bug w trzech miejscach naraz.

Wczesny błąd: dwie różne struktury paginacji w odpowiedziach listy produktów i listy wpisów. Storefront musiał obsługiwać oba warianty osobno.

Rozwiązanie: ujednolicony format odpowiedzi API przez wspólną warstwę zasobów. Metadane paginacji zawsze w tym samym miejscu, bez wyjątków.

Osobna zasada — ceny wyłącznie jako liczby całkowite (grosze), nigdy jako zmiennoprzecinkowe. Float w e-commerce to bug produkcyjny, który czeka na pierwszą promocję z ułamkiem.

**Lekcja:** spójność API to feature dla zespołu frontend i mobile. Nowy moduł nie powinien wymagać nowego helpera po stronie klienta.

---

### 3. Synchronizacja stanu edytora stron: to nie jest formularz

Edytor stron ma autosave, zaplanowane publikacje, workflow zatwierdzania, health check przed publish, eksport i import układu, kilkanaście typów bloków renderowanych lazy po stronie storefrontu.

Najtrudniejszy fragment to nie UI — to zapis stanu przy każdej operacji edytora.

**Problem z naiwnym podejściem (usuń wszystko i wstaw od nowa):**
- niszczy referencje między elementami (np. preview i historia zmian rozjeżdżają się)
- wymaga pełnych invalidacji cache przy każdym zapisie
- utrudnia audyt i wersjonowanie

**Rozwiązanie:** synchronizacja różnicowa po stabilnych identyfikatorach sekcji i bloków. Przenoszenie elementu między sekcjami nie zmienia jego tożsamości — zmienia tylko pozycję w drzewie.

Publikacja strony to nie tylko zapis w bazie. Bez powiadomienia storefrontu (i jego invalidacji cache) headless CMS „działa" wyłącznie w panelu admina.

---

### 4. AI w moim workflow — bez zastępowania architektury

Używam AI do boilerplate'u, szybkiej eksploracji wariantów architektury i przeglądania zapytań pod kątem problemów wydajnościowych. Reguły projektowe (środowisko, konwencje, co jest zakazane) ograniczają generowanie kodu sprzecznego z przyjętymi decyzjami.

AI nie decyduje o granicach modułów. Nie projektuje integracji płatności.

AI w produkcie (sugestie SEO, propozycje sekcji dla operatora) planuję dopiero po tym, gdy operator może cały workflow wykonać ręcznie. Osobny artykuł po wdrożeniu pierwszej takiej funkcji.

---

### Podsumowanie

Wartość tej platformy nie leży w liczbie modułów. Leży w decyzjach, które musiałem podjąć, gdy sklep, CMS i mobile wymagały tego samego API, ale różnych reguł spójności danych.

Jeśli budujesz headless CMS + commerce: najpierw granice modułów i kontrakt API, potem visual editor, na końcu skróty AI dla operatora.

---

## Artykuł 2 (Planowany: 2026-06-25)

### Tytuł: Panel administracyjny jako produkt wewnętrzny — od CRUD do workflow

**Status:** gotowy

---

### Lead

Panel administracyjny to nie interfejs bazy danych.

To produkt wewnętrzny dla operatora, który o 17:00 w piątek musi zaplanować publikację kilkunastu produktów, zatwierdzić stronę landingową i sprawdzić zamówienia — bez myślenia o tym, która tabela stoi za którym formularzem.

Mój admin to Inertia + React na tym samym repozytorium co API. Nie osobna aplikacja, nie Blade bez reaktywności — SPA z typowanymi trasami i wspólnymi komponentami.

---

### 1. Od zapisu do workflow: stany mają znaczenie

Prosty panel: model → formularz → zapisz → produkcja. Szybko do zbudowania, szybko do problemów.

Na platformie treści piszesz ze świadomością, że strona może być:
- roboczą wersją, której operator jeszcze nie skończył
- gotową do przeglądu przez drugą osobę
- zatwierdzoną i zaplanowaną na konkretną datę i godzinę
- opublikowaną — ale z dokładnością do minuty, nie „kiedyś po cronie"

To nie jest kwestia jednego pola statusu. To wymaga serwisów obsługujących przejścia między stanami, logowania decyzji i mechanizmów zapobiegających omijaniu workflow przez przypadkowy klik.

To samo dotyczy sklepu: edycja ceny produktu nie może zmienić ceny w historycznych zamówieniach. Panel admina pokazuje spójny widok, backend pilnuje niezmienności danych transakcyjnych.

---

### 2. Spójny UX między modułami: wspólna warstwa komponentów

Bez wspólnych komponentów każdy moduł wygląda jak osobna aplikacja:
- operacje masowe działają inaczej na produktach i wpisach
- upload mediów to trzy różne flow
- filtry tabel wymagają uczenia się od zera

Kierunek obecnego refaktoru:
- ujednolicony nagłówek ekranu — tytuł, opis, akcje; na wąskim ekranie akcje nie wypadają poza viewport
- jeden wzorzec list z filtrami — zamówienia, zwroty, logi, tłumaczenia na tym samym szablonie
- moduł mediów jako globalny serwis — upload, kompresja, powiązania, warianty cropowania

Operator uczy się jednego panelu. Developer płaci więcej na początku za shared layer — oszczędza przy każdym kolejnym module.

**Trade-off:** refaktor wspólnych komponentów nie jest widoczny w postach na LinkedIn. Jest widoczny w tym, czy operator po tygodniu nadal chce używać narzędzia.

---

### 3. Edytor stron i edytor tekstu jako centrum pracy z treścią

Najwięcej czasu operatora (i mojego w dev) zajmuje nie lista wpisów, tylko dwa miejsca:

**Edytor stron** — nawigacja po drzewie bloków, inspektor właściwości, health check, podgląd responsywny (desktop/tablet/mobile). Operator zmienia układ strony bez dotykania kodu storefrontu.

**Edytor tekstu** — pełny toolbar, paste sanitizer (wklejona treść z Word/Google Docs bez śmieciowego markupu), walidacja linków wewnętrznych, obsługa obrazów z wariantami, embedy z zatwierdzonej listy platform.

Health check przed publikacją: brak nagłówka głównego, pusty tekst alternatywny obrazu, martwy link — widoczne w adminie, nie po deployu na storefront.

To praktyczna definicja „CMS dla biznesu": nie więcej pól w formularzu, tylko mniej błędów wychodzących na produkcję.

---

### 4. Co planuję z AI — i dlaczego dopiero na końcu

Roadmapa przewiduje wspomagane AI kroki w workflow operatora (sugestie SEO, propozycje sekcji, warianty copy). Jeszcze tego nie ma w produkcji.

Kolejność jest celowa:
1. Operator robi wszystko ręcznie — każda funkcja kompletna bez AI
2. Stabilny workflow zatwierdzania i sanitizacja treści
3. AI jako opcjonalny skrót powtarzalnych kroków — zawsze z obowiązkowym przeglądem

Nie chcę platformy, w której „AI opublikowało" coś, czego nikt nie zatwierdził. Chcę platformy, w której AI oszczędza 10 minut na zadaniu, które i tak musi być możliwe bez AI.

Konkretny case study po wdrożeniu — wtedy z porównaniem: flow ręczny vs ze skrótem, co AI świadomie nie robi.

---

### Podsumowanie

Dobry panel admina skraca codzienną operację i pokazuje stan systemu bez eksponowania schematu bazy.

W monorepo headless to trudniejsze: ten sam operator obsługuje treść, sklep i media — a pod spodem dwa różne modele spójności danych. Spójny UI to inwestycja, która zwraca się przy każdym nowym module — nie tylko przy prezentacji projektu.

---

---

# DRAFT: Artykuł — AI-assisted workflow w panelu

> **Status:** SZKIC — nie publikować przed wdrożeniem.
> **Warunek:** funkcja w produkcji, manualny flow 1:1 bez AI, testy.
> **Zasada:** bez nazw klas, ścieżek kodu ani endpointów w treści artykułu.

---

### Tytuł roboczy: [FUNKCJA] w panelu — skrót dla operatora, nie autopilot

### Lead (szablon)

Wdrożyłem [NAZWA] w panelu. Operator nadal może [OPIS RĘCZNEJ ŚCIEŻKI — ten sam rezultat].

AI skraca [KONKRETNY KROK], nie usuwa [APPROVAL / REVIEW / SANITYZACJA].

---

### Sekcja 1: Problem biznesowy

- kto: operator / merchant
- sytuacja: [np. meta SEO pod kilkanaście podstron produktów]
- koszt ręczny: [minuty — zmierz, nie zgaduj]
- wymaganie: **identyczny rezultat musiał być osiągalny bez AI**

---

### Sekcja 2: Jak działa

- co dostaje AI na wejściu: [treść strony / parametry produktu / szablon]
- co zwraca: **sugestia** w panelu — nie automatyczny zapis
- gdzie ląduje: [pole do edycji / modal / sidebar — nie auto-save do produkcji]
- co się dzieje potem: operator edytuje, zatwierdza, dopiero wtedy do workflow

---

### Sekcja 3: Porównanie flow

| Krok | Ręcznie | Ze skrótem AI |
|------|---------|---------------|
| 1 | | |
| 2 | | |
| Review | operator | operator (obowiązkowy) |
| Publish | workflow bez zmian | workflow bez zmian |

---

### Sekcja 4: Czego AI świadomie nie robi

- auto-publish
- nadpisanie zatwierdzonej wersji
- ominięcie workflow zatwierdzania
- [dopisz specyficzne dla funkcji]

---

### Podsumowanie (szablon)

AI w produkcie ma sens, gdy ręczna ścieżka jest kompletna, a skrót jest audytowalny i opcjonalny.

[FUNKCJA] nie zastępuje panelu — skraca powtarzalną pracę operatora, który i tak zostaje autorem finalnej publikacji.

---

## Checklist przed publikacją artykułu

- [ ] Brak nazw klas, ścieżek plików i endpointów w treści
- [ ] Brak fragmentów kodu z aplikacji
- [ ] Ceny w groszach (integer), jeśli mowa o sklepie
- [ ] Każda „wdrożona" funkcja faktycznie istnieje w produkcji
- [ ] AI w produkcie tylko w DRAFT lub wyraźnie jako plan
- [ ] Trade-off przy co najmniej jednej decyzji architektonicznej
- [ ] Podsumowanie: jedna lekcja, nie lista buzzwordów
