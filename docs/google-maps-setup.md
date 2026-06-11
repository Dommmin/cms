# Konfiguracja Google Maps Places API & Limity Darmowego Pakietu

Ta instrukcja opisuje, jak krok po kroku uzyskać klucz API dla Google Maps (w szczególności dla biblioteki `use-places-autocomplete`), jak go zabezpieczyć przed nieautoryzowanym użyciem oraz jak ustawić limity zapytań i budżetu, aby nie przekroczyć darmowego pakietu startowego od Google (miesięczny darmowy kredyt w wysokości $200).

---

## 1. Jak uzyskać klucz Google Maps API?

1. Przejdź do konsoli **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Zaloguj się na swoje konto Google i utwórz nowy projekt (lub wybierz istniejący) za pomocą selektora projektów na górnym pasku.
3. Jeśli jeszcze tego nie zrobiłeś, musisz powiązać **konto rozliczeniowe (Billing Account)** z projektem. Google wymaga karty płatniczej do aktywacji usług map, lecz dopóki nie przekroczysz darmowego limitu $200/miesiąc, nie zostaniesz obciążony kosztami.
4. Wyszukaj i włącz potrzebne API:
   - Wyszukaj **"Places API"** i kliknij **Włącz (Enable)**.
   - Wyszukaj **"Maps JavaScript API"** (wymagane do załadowania biblioteki na frontendzie) i kliknij **Włącz (Enable)**.
5. Przejdź do zakładki **APIs & Services** > **Credentials** (Interfejsy API i usługi > Dane uwierzytelniające).
6. Kliknij **+ Create Credentials** na górze strony i wybierz **API key**.
7. Twój nowy klucz zostanie wygenerowany i wyświetlony. Skopiuj go.

---

## 2. Zabezpieczenie i ograniczenie klucza (Rekomendowane)

Klucz używany na frontendzie (w przeglądarce użytkownika) jest widoczny w kodzie źródłowym strony. **Musisz** go ograniczyć, aby nikt go nie ukradł i nie nabił rachunku na Twoje konto.

1. W zakładce **Credentials**, obok nowo utworzonego klucza kliknij ikonę ołówka (**Edit API key**).
2. W sekcji **Set an application restriction** wybierz:
   - **Websites (HTTP referrers)** (Witryny sieci Web).
3. Pod spodem w sekcji **Website restrictions** kliknij **Add** i podaj adresy swoich domen, np.:
   - Lokalny development: `http://localhost:*/*` oraz `http://127.0.0.1:*/*`
   - Domena produkcyjna: `https://twojadomena.pl/*` oraz `https://*.twojadomena.pl/*`
4. W sekcji **API restrictions** (Ograniczenia API) zaznacz **Restrict key** i wybierz z listy rozwijanej tylko:
   - `Places API`
   - `Maps JavaScript API`
5. Kliknij **Save**.

---

## 3. Konfiguracja limitów i alertów (Staying Free)

Google oferuje **$200 kredytu co miesiąc** za darmo. Przekłada się to na określone limity zapytań (np. około 70 000 zapytań autouzupełniania adresów miesięcznie). Aby spać spokojnie, skonfiguruj limity zapytań oraz alerty budżetowe.

### A. Ustawienie twardego limitu zapytań (Quotas)
Możesz ograniczyć maksymalną liczbę żądań na dzień, aby aplikacja przestała pytać API po osiągnięciu bezpiecznego progu.

1. Wyszukaj w wyszukiwarce Google Cloud **"Places API"** i przejdź do szczegółów tego API.
2. Z menu po lewej wybierz **Quotas & System Limits** (Limity i limity systemowe).
3. Znajdź sekcję odpowiadającą za zapytania (np. **Requests per day** lub **Autocomplete requests per day**).
4. Kliknij ikonę edycji (ołówek) obok limitu dziennego.
5. Ustaw limit na bezpieczną wartość (np. **1 000** zapytań dziennie dla małego/średniego serwisu). Jeśli przekroczysz ten limit, Places API zwróci błąd dla kolejnych użytkowników w danym dniu, ale Twoja karta nie zostanie obciążona.

### B. Ustawienie alertów budżetowych (Billing Alerts)
Zapewnia powiadomienie e-mail, gdy prognozowane lub rzeczywiste wydatki zbliżą się do limitu kredytu.

1. Przejdź do sekcji **Billing** (Płatności) w menu głównym Google Cloud.
2. Wybierz zakładkę **Budgets & alerts** (Budżety i alerty).
3. Kliknij **Create budget** (Utwórz budżet).
4. Podaj nazwę budżetu i wybierz swój projekt.
5. W kroku **Amount** wybierz typ budżetu **Specified amount** (Określona kwota) i wpisz np. **50 USD** lub **100 USD** (znacznie poniżej darmowego limitu $200 USD).
6. W kroku **Actions / Thresholds** ustaw wyzwalacze powiadomień procentowych:
   - Np. 50% ($25), 80% ($40) oraz 100% ($50) rzeczywistego lub prognozowanego wydatku.
7. Zaznacz wysyłanie powiadomień e-mail do administratorów konta rozliczeniowego.
8. Kliknij **Finish**.

---

## 4. Integracja z aplikacją `client/`

W projekcie Next.js (w katalogu `client/`) klucz API należy podać w pliku `.env.local` jako zmienną środowiskową:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

Następnie załaduj bibliotekę Google Maps (wymaganą przez `use-places-autocomplete`) np. za pomocą oficjalnego pakietu `@react-google-maps/api` lub skryptu, zgodnie z dokumentacją biblioteki.
