# Plan: AI-assisted content creation w CMS/adminie

Data: 2026-06-10
Status: plan wykonawczy przed implementacją

## Cel

Celem jest wdrożenie AI jako kontrolowanej warstwy wspierającej redaktora i merchandisera w CMS, bez oddawania modelowi bezpośredniej kontroli nad publikacją, routingiem, cenami, workflow zamówień ani innymi krytycznymi operacjami.

Plan zakłada:

- backend na **Laravel 13**
- użycie **Laravel AI SDK** jako warstwy integracyjnej
- wdrożenie AI najpierw w adminie, nie na publicznym storefrontcie
- nacisk na **structured output**, **draft-first**, **auditability** i **review by human**

## Założenia strategiczne

AI ma działać jako zestaw małych, przewidywalnych asystentów do konkretnych zadań, a nie jako jeden ogólny agent z szerokim dostępem do całego systemu.

Na start AI:

- tworzy drafty
- proponuje warianty treści
- uzupełnia meta dane
- pomaga w przepisywaniu i skracaniu copy
- podpowiada strukturę strony

Na start AI nie:

- publikuje stron samodzielnie
- nie edytuje istniejących stron bez jawnej akcji użytkownika
- nie wykonuje operacji destrukcyjnych
- nie dostaje dostępu do checkoutu, zamówień, płatności i workflow operacyjnych

## Dlaczego Laravel AI SDK

Laravel AI SDK jest sensowną bazą dla tego wdrożenia, ponieważ daje spójny kontrakt dla:

- agentów jako klas PHP
- structured output
- conversation storage
- tools
- streaming
- queueing
- testing
- failover między providerami

To ogranicza vendor lock-in na poziomie aplikacji i pozwala traktować provider/model jako wymienialny detal infrastrukturalny.

Źródło referencyjne:

- [Laravel AI SDK 13.x](https://laravel.com/docs/13.x/ai-sdk)

## Główne use case'y

Najwyższy priorytet na start mają use case'y, które są jednocześnie wartościowe biznesowo i niskiego ryzyka operacyjnego.

### Use case 1. Create Page Draft

Użytkownik podaje brief strony:

- cel strony
- branża
- grupa docelowa
- ton komunikacji
- typ strony
- opcjonalne sekcje

AI zwraca:

- propozycję tytułu
- propozycję slug-a
- SEO title
- SEO description
- zestaw bloków/sekcji zgodny z kontraktem page buildera
- notatki redakcyjne

Wynik jest zapisywany jako draft strony do dalszej ręcznej edycji.

### Use case 2. Improve Copy

Użytkownik zaznacza istniejący tekst lub sekcję i wybiera jedną z operacji:

- skróć
- uprość
- nadaj bardziej sprzedażowy ton
- popraw SEO
- przepisz na formalny / nieformalny styl

AI zwraca wyłącznie propozycję nowej treści, bez automatycznego zapisu.

### Use case 3. Generate SEO Meta

AI generuje:

- meta title
- meta description
- nagłówki alternatywne
- propozycje FAQ

Ta funkcja może działać zarówno dla stron CMS, jak i później dla kategorii, produktów i wpisów blogowych.

### Use case 4. Content Enrichment

Po stabilizacji podstaw można dodać:

- alt texty
- tagi
- klasyfikację treści
- ekstrakcję cech i benefitów
- propozycje linkowania wewnętrznego

## Kolejność wdrożenia

### Etap 0. Discovery i kontrakty

Właściciel: główny agent / główny developer

Zakres:

- zmapować obecny kontrakt danych page buildera
- ustalić minimalny zestaw bloków, które AI może generować
- ustalić pola, które muszą być obowiązkowe, oraz pola opcjonalne
- wyznaczyć granicę między AI draftem a ręczną edycją
- ustalić politykę modeli, kosztów, timeoutów i retry

Artefakty:

- kontrakt JSON dla draftu strony
- lista dozwolonych bloków dla AI
- polityka bezpieczeństwa i walidacji
- decyzja, czy conversation storage ma być per user, per draft, czy per task

Kryterium ukończenia:

- istnieje jeden jawny schemat wejścia/wyjścia dla pierwszego use case'u

### Etap 1. Foundation w Laravel 13

Zakres:

- instalacja i konfiguracja Laravel AI SDK
- konfiguracja providera lub providerów
- przygotowanie środowisk dev/stage/prod
- ustalenie konfiguracji modeli tekstowych
- przygotowanie podstaw pod testy i audyt

Docelowe obszary:

- `server/config/ai.php`
- `server/.env.example`
- `server/app/Ai/*`
- wybrane migracje conversation storage, jeśli będą używane

Wymagania architektoniczne:

- provider i model nie mogą być hardcodowane w logice domenowej
- konfiguracja ma pozwalać na failover lub prostą zmianę modelu
- limity i timeouty mają być konfigurowalne

Kryterium ukończenia:

- aplikacja potrafi wykonać prosty request do modelu przez Laravel AI SDK w kontrolowanym teście

### Etap 2. Agent `CreatePageDraft`

Zakres:

- utworzenie pierwszego agenta do draftów stron
- zdefiniowanie structured output
- mapowanie odpowiedzi modelu na snapshot/page builder contract
- zapis jako draft

Minimalny kontrakt outputu:

- `pageTitle`
- `pagePurpose`
- `slugSuggestion`
- `seoTitle`
- `seoDescription`
- `blocks`
- `editorNotes`

Minimalny kontrakt `blocks[]`:

- `type`
- `heading`
- `subheading`
- `body`
- `ctaLabel`
- `ctaTarget`
- `imagePrompt`
- `confidence`

Zasady:

- model zwraca tylko typy bloków z allowlisty
- backend waliduje wynik przed zapisem
- niepoprawny output nie może trafić do draftu
- wynik ma być możliwy do częściowego odrzucenia lub poprawy

Kryterium ukończenia:

- użytkownik może przejść flow `brief -> generate -> review -> save draft`

### Etap 3. Admin UI dla generowania draftu

Zakres:

- ekran lub modal w adminie do wpisania briefu
- streaming odpowiedzi
- podgląd wyniku przed zapisem
- obsługa błędów, retry i informacja o stanie generowania

Wymagania UX:

- użytkownik zawsze wie, że to draft wygenerowany przez AI
- zapis jest jawny i odrębny od publikacji
- wynik można odrzucić bez skutków ubocznych
- prompt nie może być jedynym miejscem sterowania; UI powinno mieć też pola strukturalne

Rekomendowany input UI:

- typ strony
- branża
- grupa docelowa
- cel strony
- ton marki
- długość treści
- checkboxy sekcji opcjonalnych

Kryterium ukończenia:

- redaktor potrafi wygenerować szkic bez znajomości prompt engineering

### Etap 4. Agent `ImproveCopy`

Zakres:

- operacje na istniejącym tekście lub sekcji
- szybkie przepisywanie bez przebudowy całej strony
- integracja na poziomie konkretnego pola lub bloku

Tryby:

- shorten
- simplify
- expand
- makeMorePersuasive
- makeMoreFormal
- improveSeo

Zasady:

- operacja jest lokalna dla wybranego pola/sekcji
- użytkownik zawsze widzi diff lub co najmniej preview stare vs nowe
- brak auto-save bez akceptacji

Kryterium ukończenia:

- redaktor potrafi poprawić pojedynczą sekcję bez generowania całego draftu od zera

### Etap 5. Agent `GenerateSeoMeta`

Zakres:

- generowanie meta title i description
- propozycje H1/H2
- opcjonalnie FAQ schema seed content

Zasady:

- output krótki i deterministyczny
- limity długości wymuszone walidacją
- można uruchamiać dla różnych typów encji później: page, category, product, blog post

Kryterium ukończenia:

- SEO assistant działa jako mały osobny flow, bez mieszania z page generation

### Etap 6. Audit, observability i governance

Zakres:

- logowanie wejścia/wyjścia i metadanych requestu
- powiązanie akcji z użytkownikiem admina
- monitoring błędów i kosztów
- podstawy rate limiting i abuse protection

Logować należy:

- kto uruchomił akcję
- kiedy
- na jakim obiekcie
- jaki agent
- jaki provider/model
- czas odpowiedzi
- wynik walidacji
- czy wynik zapisano

Kryterium ukończenia:

- każda akcja AI jest audytowalna i da się ją odtworzyć analitycznie

### Etap 7. Etap drugi po stabilizacji

Dopiero po sprawdzeniu realnego użycia można rozszerzyć zakres o:

- embeddings
- vector stores
- semantyczne wyszukiwanie treści
- podobne strony / podobne produkty
- knowledge assistant dla redaktorów
- rekomendacje linkowania wewnętrznego

To nie powinno blokować MVP i nie powinno wejść do pierwszego wdrożenia.

## Proponowana architektura katalogów

Po stronie `server/` rekomendowany podział:

- `server/app/Ai/Agents/`
- `server/app/Ai/Tools/`
- `server/app/Ai/Data/`
- `server/app/Services/Ai/`
- `server/app/Http/Controllers/Admin/Ai/`
- `server/app/Http/Requests/Admin/Ai/`

Przykładowe klasy:

- `CreatePageDraftAgent`
- `ImproveCopyAgent`
- `GenerateSeoMetaAgent`
- `SaveAiGeneratedDraftAction`
- `MapAiDraftToPageBuilderSnapshot`
- `AiUsageLogger`

Zasada:

- agent opisuje instrukcje, tools i output schema
- warstwa usługowa mapuje wynik na domenę CMS
- kontroler nie zawiera prompt logic

## Narzędzia dostępne agentom

Na start agenci powinni dostać wyłącznie wąskie, bezpieczne narzędzia odczytowe albo draftowe.

Dozwolone przykłady:

- `getAvailablePageBlocks`
- `getPageTypeRules`
- `getBrandVoiceRules`
- `getCategoryContext`
- `saveDraftPage`

Niedozwolone na start:

- `publishPage`
- `deletePage`
- `bulkUpdatePages`
- narzędzia modyfikujące ceny, stany magazynowe, zamówienia, płatności

## Walidacja i bezpieczeństwo

Najważniejsza zasada: model nie jest źródłem prawdy. Źródłem prawdy jest backendowa walidacja kontraktu.

Warstwy bezpieczeństwa:

1. allowlista typów bloków
2. structured output schema
3. backend validation przed zapisem
4. permissions admina
5. draft-only workflow
6. audit log
7. rate limiting
8. timeouty, retry i fallback

Dodatkowo:

- prompt i output mogą zawierać dane użytkownika, więc trzeba przejrzeć GDPR/privacy impact
- nie należy wysyłać do modelu zbędnych danych klientów, zamówień ani danych wrażliwych
- trzeba wyznaczyć politykę retencji conversation history

## Provider strategy

Warstwa aplikacyjna nie powinna być przywiązana do jednego dostawcy.

Rekomendacja:

- 1 model główny do tworzenia draftów
- 1 tańszy model do prostych transformacji typu copy/SEO
- opcjonalny failover dla kluczowych flow

Kryteria wyboru modelu:

- jakość structured output
- koszt
- opóźnienie
- stabilność
- jakość języka polskiego

## Test strategy

### Testy backendowe

- testy walidacji outputu
- testy mapowania outputu na snapshot buildera
- testy autoryzacji
- testy retry/failover
- testy obsługi niepoprawnego JSON/schema mismatch

### Testy UI/admin

- test flow `brief -> generate -> save draft`
- test flow `rewrite section -> preview -> apply`
- test błędów providerów i timeoutów

### Testy jakościowe

- zestaw referencyjnych briefów
- porównanie jakości outputu między modelami
- przegląd wyników przez content/editor team

## Kryteria akceptacji MVP

MVP można uznać za gotowe, jeśli:

- istnieje stabilny agent `CreatePageDraft`
- wynik jest ustrukturyzowany i walidowany
- draft zapisuje się do istniejącego workflow CMS
- użytkownik widzi, że pracuje na draftcie
- istnieje audit log i podstawowa observability
- provider failure nie psuje stanu strony

## Ryzyka

Najważniejsze ryzyka:

- halucynacje i niespójne copy
- output niezgodny z kontraktem buildera
- zbyt szeroki zakres pierwszej iteracji
- mieszanie wielu use case'ów w jednym agencie
- słaby UX, jeśli użytkownik musi pisać zbyt złożone prompty
- wysokie koszty przy braku limitów i cachingu

## Rekomendowana kolejność delivery

1. Foundation Laravel AI SDK i kontrakt danych
2. `CreatePageDraft`
3. Admin UI dla draft generation
4. Audit/logging/rate limiting
5. `ImproveCopy`
6. `GenerateSeoMeta`
7. dopiero potem enrichment i embeddings

## Poza zakresem pierwszej iteracji

Poza zakresem MVP pozostają:

- chatbot dla klientów na storefrontcie
- agent autonomicznie zarządzający całym CMS
- auto-publish
- pełny RAG nad całym katalogiem i dokumentacją
- AI do workflow zamówień, zwrotów, płatności i supportu operacyjnego

## Decyzja końcowa

Najbardziej sensowny pierwszy krok to nie "dodać AI do aplikacji" ogólnie, tylko wdrożyć jeden precyzyjny workflow:

- **brief strony -> AI draft -> review -> save draft**

Jeśli ten flow okaże się stabilny, przewidywalny i użyteczny dla redaktorów, wtedy można rozszerzać zakres na copy, SEO i enrichment. Jeśli nie, szkoda od razu budować szeroki system agentowy wokół niezwalidowanych założeń UX i biznesowych.
