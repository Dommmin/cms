# Plan: Enterprise workflow dla zwrotów i reklamacji

Data: 2026-06-03
Zakres: domena RMA, statusy, workflow, notyfikacje, role, SLA, audyt, integracje
Status: plan architektoniczny po audycie

## 1. Cel

Należy zbudować porządny workflow zwrotów i reklamacji klasy enterprise e-commerce:

- wspólny obszar biznesowy `Zwroty i reklamacje`
- różne typy zgłoszeń w jednym systemie
- różne statusy i ścieżki procesu zależnie od typu zgłoszenia
- czytelny lifecycle jak przy zamówieniach
- pełna historia zdarzeń
- notyfikacje dla klienta i administratora
- możliwość dalszej automatyzacji i integracji

## 2. Stan obecny

### 2.1 Co już istnieje

- wspólny model zgłoszenia: `ReturnRequest`
- wspólny model pozycji zgłoszenia: `ReturnItem`
- historia statusów: `ReturnStatusHistory`
- typy zgłoszeń:
  - `return`
  - `complaint`
  - `exchange`
- podstawowy enum statusów:
  - `pending`
  - `approved`
  - `rejected`
  - `return_label_sent`
  - `awaiting_return`
  - `received`
  - `inspected`
  - `refunded`
  - `closed`
- częściowa integracja z refundem płatności
- preferencja notyfikacji `return_status`

### 2.2 Główne braki

- nazewnictwo admina nadal sugeruje tylko `Zwroty`
- brak wyraźnego rozdzielenia workflow dla:
  - zwrotu
  - reklamacji
  - wymiany
- brak state machine z dozwolonymi przejściami
- brak statusów operacyjnych i SLA
- brak jawnego event logu domenowego poza samą historią statusów
- brak dedykowanych powiadomień i triggerów biznesowych
- brak zadań operacyjnych dla zespołu obsługi

## 3. Rekomendacja modelu domenowego

### 3.1 Jeden model główny, nie osobne modele

Na obecnym etapie rekomendowany jest:

- jeden wspólny model zgłoszenia
- jeden wspólny obszar admina
- rozróżnienie po `type`
- rozróżnienie po statusie i workflow

To znaczy:

- `ReturnRequest` pozostaje głównym rekordem sprawy
- `return_type` steruje regułami procesu
- statusy, akcje i wymagane pola zależą od typu

### 3.2 Kiedy osobne modele miałyby sens

Osobne modele miałyby sens dopiero wtedy, gdy reklamacje i zwroty zaczną się istotnie rozjeżdżać, np.:

- osobne statusy nie mieszczą się w jednym grafie
- reklamacja wymaga ekspertyz, dokumentów serwisowych, decyzji gwarancyjnych
- wymiana ma osobną logistykę i rezerwację stanów
- zespoły operacyjne pracują na całkowicie innych ekranach

Na dziś lepszy jest kierunek:

- `jeden case model`
- `różne workflow per type`

## 4. Docelowy model procesu

### 4.1 Warstwy procesu

Każda sprawa powinna mieć:

- `type`
- `status`
- `substatus` albo `resolution_code`
- `priority`
- `channel`
- `resolution_type`
- `sla_due_at`
- `assigned_to`
- `requires_customer_action`
- `requires_admin_action`

### 4.2 Pola domenowe do dodania

Do `ReturnRequest` lub powiązanych tabel należy rozważyć dodanie:

- `case_number`
- `source_channel`
  - account
  - guest portal
  - admin
  - marketplace
- `priority`
  - low
  - normal
  - high
  - urgent
- `resolution_type`
  - refund
  - replacement
  - repair
  - store_credit
  - rejection
- `customer_action_required_at`
- `assigned_user_id`
- `decision_reason`
- `closed_reason`
- `approved_at`
- `received_at`
- `inspected_at`
- `resolved_at`
- `closed_at`

## 5. Docelowe workflow per typ

### 5.1 Zwrot

Proponowany lifecycle:

- `submitted`
- `under_review`
- `approved`
- `label_prepared`
- `awaiting_shipment`
- `in_transit_to_warehouse`
- `received_at_warehouse`
- `inspection_in_progress`
- `approved_for_refund`
- `refund_initiated`
- `refunded`
- `closed`
- alternatywnie:
  - `rejected`
  - `cancelled_by_customer`
  - `expired`

### 5.2 Reklamacja

Proponowany lifecycle:

- `submitted`
- `triage`
- `awaiting_customer_evidence`
- `under_review`
- `pickup_or_return_required`
- `item_received`
- `technical_inspection`
- `decision_pending`
- `accepted`
- `repair_in_progress`
- `replacement_prepared`
- `refund_approved`
- `resolved`
- `closed`
- alternatywnie:
  - `rejected`
  - `out_of_policy`
  - `cancelled_by_customer`

### 5.3 Wymiana

Proponowany lifecycle:

- `submitted`
- `under_review`
- `approved`
- `awaiting_return`
- `item_received`
- `replacement_reserved`
- `replacement_shipped`
- `completed`
- alternatywnie:
  - `rejected`
  - `fallback_to_refund`
  - `closed`

## 6. Statusy wspólne vs specjalizowane

### 6.1 Wspólne statusy bazowe

Można utrzymać wspólny rdzeń:

- `submitted`
- `under_review`
- `awaiting_customer_action`
- `approved`
- `rejected`
- `received`
- `resolved`
- `closed`

### 6.2 Statusy specjalizowane

Dla typu należy dopuścić dodatkowe statusy:

- zwrot:
  - `refund_initiated`
  - `refunded`
- reklamacja:
  - `technical_inspection`
  - `repair_in_progress`
  - `replacement_prepared`
- wymiana:
  - `replacement_reserved`
  - `replacement_shipped`

### 6.3 Rekomendacja implementacyjna

Najlepszy kierunek:

- nie trzymać osobnego enumu tylko dla prostego UI
- zdefiniować formalny workflow matrix:
  - typ zgłoszenia
  - status początkowy
  - dozwolone przejścia
  - wymagane pola przy przejściu
  - generowane zdarzenia

## 7. State machine

Należy wprowadzić centralny mechanizm przejść statusów:

- jedna klasa lub zestaw klas workflow
- jawne allowed transitions
- walidacja zmian statusu
- efekty uboczne uruchamiane przez eventy

Każda zmiana statusu powinna:

- być walidowana
- zapisywać actor
- zapisywać powód
- zapisywać timestamp
- emitować event domenowy
- opcjonalnie uruchamiać notyfikacje lub automaty

## 8. Event model

Poza historią statusów potrzebny jest pełniejszy event log.

Przykładowe zdarzenia:

- `case_submitted`
- `case_review_started`
- `customer_contact_requested`
- `customer_evidence_received`
- `label_generated`
- `shipment_received`
- `inspection_completed`
- `refund_requested`
- `refund_completed`
- `replacement_reserved`
- `replacement_shipped`
- `case_closed`

Zalecenie:

- osobna tabela `return_events` albo bardziej generyczna `case_events`
- payload JSON
- actor type: customer / admin / system / integration

## 9. Notyfikacje

### 9.1 Klient

System powinien wysyłać powiadomienia co najmniej przy:

- przyjęciu zgłoszenia
- zmianie statusu
- prośbie o dodatkowe informacje
- wygenerowaniu etykiety
- otrzymaniu przesyłki
- decyzji pozytywnej / negatywnej
- uruchomieniu refundu
- zakończeniu sprawy

Kanały:

- email
- in-app / centrum powiadomień
- opcjonalnie SMS dla krytycznych kroków

### 9.2 Admin / obsługa

System powinien tworzyć alerty przy:

- nowym zgłoszeniu
- przekroczeniu SLA
- braku odpowiedzi klienta
- błędzie refundu
- niespójnym statusie logistycznym
- zgłoszeniu wysokiego priorytetu

### 9.3 Preferencje

Obecne `return_status` jest za szerokie. Docelowo warto rozbić preferencje np. na:

- `case_created`
- `case_status_changed`
- `case_customer_action_required`
- `case_refund_completed`

## 10. Role i permissions

### 10.1 Obecny problem

Admin opiera się dziś o `orders.*`, co miesza obszary domenowe.

### 10.2 Docelowe permission namespace

Warto wprowadzić:

- `returns.view`
- `returns.update`
- `returns.assign`
- `returns.refund`
- `returns.close`
- `returns.manage_sla`

Jeśli reklamacje mają być traktowane szerzej, można rozważyć neutralny namespace:

- `cases.view`
- `cases.update`
- `cases.assign`
- `cases.resolve`

## 11. Admin UX

### 11.1 Nazewnictwo

Zmienić:

- `Zwroty`

na:

- `Zwroty i reklamacje`

### 11.2 Widok listy

Lista powinna pokazywać:

- numer sprawy
- typ zgłoszenia
- status
- substatus / decyzję
- zamówienie
- klienta
- datę utworzenia
- SLA
- przypisanego opiekuna
- kwotę refundu

Filtry:

- typ
- status
- priorytet
- SLA breached
- przypisany opiekun
- kanał źródłowy

### 11.3 Widok szczegółu

Szczegół sprawy powinien mieć sekcje:

- timeline
- pozycje zgłoszenia
- decyzje
- refundy
- notatki wewnętrzne
- komunikację z klientem
- załączniki
- logistykę

## 12. Customer experience

### 12.1 Konto klienta

Klient powinien widzieć:

- listę wszystkich spraw
- aktualny status
- wymagane akcje
- historię komunikacji
- decyzję końcową

### 12.2 Portal publiczny

Dla gościa należy umożliwić:

- lookup sprawy
- lookup zamówienia
- dosłanie informacji
- sprawdzenie statusu

## 13. SLA i automatyzacje

### 13.1 SLA

Dla każdego typu można ustawić:

- czas do pierwszej reakcji
- czas do decyzji
- czas do zamknięcia

### 13.2 Automaty

Przykładowe automaty:

- auto-przypisanie do kolejki
- auto-tagowanie po typie i kraju
- auto-zamknięcie po braku odpowiedzi klienta
- automatyczne przypomnienia o dosłaniu materiałów
- automatyczne notyfikacje po przekroczeniu SLA

## 14. Refundy i rozliczenia

Refund nie powinien być tylko pojedynczą akcją w UI.

Docelowo należy przewidzieć:

- pełny refund
- częściowy refund
- wielokrotne refundy do jednej sprawy
- refund przez gateway
- refund manualny
- store credit zamiast refundu

Warto rozważyć osobną tabelę:

- `return_refunds`

z polami:

- `return_request_id`
- `amount`
- `currency`
- `method`
- `provider`
- `provider_reference`
- `status`
- `processed_by`
- `processed_at`

## 15. Dane i audyt

W enterprise workflow każda istotna akcja musi być audytowalna.

Należy zapisywać:

- kto zmienił status
- z jakiego interfejsu
- jaki był powód
- jakie pola zmienił
- czy poszedł email
- czy operacja refundu się powiodła

## 16. Rekomendowana kolejność wdrożenia

### Etap 1. Uporządkowanie nazewnictwa i domeny

- zmiana nazwy sekcji na `Zwroty i reklamacje`
- potwierdzenie, że to jeden obszar domenowy
- formalne rozpisanie typów i ścieżek procesu

### Etap 2. Workflow engine

- centralny matrix przejść
- walidacja statusów
- eventy domenowe
- rozbudowa historii

### Etap 3. Admin i permissions

- osobne permissions
- lista, filtry, timeline
- akcje operacyjne zależne od typu

### Etap 4. Customer-facing

- `/account/returns`
- publiczny portal modułowy
- komunikacja i dokumenty

### Etap 5. Notyfikacje i SLA

- email + in-app
- taski operacyjne
- przypomnienia i eskalacje

### Etap 6. Refund ledger i integracje

- osobne rekordy refundów
- rozliczenia częściowe
- automaty integracyjne

## 17. Priorytety

### P1

- wspólny model + różne workflow per type
- zmiana nazwy na `Zwroty i reklamacje`
- state machine
- osobne permissions
- lista spraw klienta i admina

### P2

- event log
- SLA
- załączniki
- lepsze notyfikacje

### P3

- rozbudowane automaty
- eskalacje
- integracje magazynowe i serwisowe
- zaawansowane raportowanie

## 18. Rekomendacja końcowa

To nie powinien być prosty ekran `Zwroty`.

To powinien być pełny system case management dla posprzedażowej obsługi klienta:

- jeden wspólny model sprawy
- różne workflow dla zwrotu, reklamacji i wymiany
- osobne statusy i decyzje
- pełny audit trail
- notyfikacje i SLA
- panel klienta i panel operacyjny admina

Na obecnym etapie nie rekomenduję rozbijania tego na osobne modele. Rekomenduję:

- wspólny model
- wspólne API domenowe
- zróżnicowany workflow zależny od typu sprawy
