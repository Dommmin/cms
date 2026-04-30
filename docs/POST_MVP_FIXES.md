# Post-MVP — Fixes & Improvements

MVP działa na k3s. Ten plik śledzi bugi i usprawnienia do ogarnięcia.

---

## Krytyczne

### [x] SQL injection w `SegmentEvaluationService`
**Plik:** `server/app/Services/SegmentEvaluationService.php:130, 138`

`$operator` pochodzi z `$rule['operator']` (dane użytkownika) i jest interpolowany bezpośrednio do `havingRaw()` i `whereRaw()`:
```php
->havingRaw('DATEDIFF(NOW(), last_order) '.$operator.' ?', [$days]);
->whereRaw('DATEDIFF(NOW(), created_at) '.$operator.' ?', [$days]);
```
Pozostałe metody (`applyTotalSpentRule`, `applyOrderCountRule`, `applyAvgOrderValueRule`) używają `->having($col, $operator, $val)` — Eloquent whitelist-uje operatory, więc są bezpieczne.

**Fix:** Dodać whitelist operatorów przed użyciem w raw queries:
```php
$allowed = ['<', '>', '=', '<=', '>=', '!='];
if (!in_array($operator, $allowed, true)) {
    return $query;
}
```

---

## Wysokie

### [x] Moduły — klient uderza w wyłączone endpointy
**Pliki:** `client/hooks/use-promotions.ts`, `client/hooks/use-recently-viewed.ts`, `client/hooks/use-comparison.ts`, `client/components/layout/announcement-bar.tsx`, `client/components/promotional-banner.tsx`

Gdy `MODULE_ECOMMERCE=false` w `.env`, backend nie rejestruje tras `/api/v1/products` i `/api/v1/promotions`. Klient jednak uderza w te endpointy bezwarunkowo → spam 404 w konsoli.

`Header` jest już poprawnie ogateowany (`modules?.ecommerce` z serwera), ale hooki klienckie nie mają dostępu do tej informacji.

**Fix — trzy kroki:**

1. Nowy provider: `client/providers/modules-provider.tsx`
   - React context z `useModules()` hookiem
   - Domyślne wartości: wszystko `false` (bezpieczny fallback)

2. Wpięcie w `client/app/layout.tsx`
   - `<ModulesProvider modules={modules}>` wewnątrz `<QueryProvider>`
   - `modules` jest już dostępny (linia 108), zero dodatkowych fetchów

3. Dodanie `enabled` do zapytań:
   - `use-promotions.ts` → `enabled: useModules().ecommerce`
   - `use-recently-viewed.ts` → `enabled: ids.length > 0 && useModules().ecommerce`
   - `use-comparison.ts` → `enabled: ids.length >= 2 && useModules().ecommerce`
   - `announcement-bar.tsx` → `enabled: useModules().ecommerce` w useQuery
   - `promotional-banner.tsx` → early return gdy `!useModules().ecommerce`

---

### [x] TODO: job `resend` w `AppNotificationController` nigdy nie odpala
**Plik:** `server/app/Http/Controllers/Admin/AppNotificationController.php:57`

Metoda `resend()` zmienia status na `Pending`, ale komentarz `// TODO: Dispatch job` — powiadomienie nigdy nie jest faktycznie wysyłane ponownie.

**Fix:** Dispatch odpowiedniego joba lub wywołanie serwisu wysyłki.

---

### [x] N+1: `Customer::query()->get()` w `AppNotificationController`
**Plik:** `server/app/Http/Controllers/Admin/AppNotificationController.php:80-82`

Przy tworzeniu powiadomienia ładowani są wszyscy klienci (`get()`) bez paginacji ani eager load relacji.

**Fix:** Zastąpić lazy loadem / kursor / chunk, albo paginacją jeśli lista trafia do widoku.

---

## Średnie

### [x] Mismatch portów w axios baseURL
**Plik:** `client/lib/axios.ts`

Fallback `baseURL` to `http://localhost:80/api/v1` — port 80. `server-fetch.ts` używa portu 8000. W dev niezgodność powoduje że requesty klienckie lecą na zły port gdy `NEXT_PUBLIC_API_URL` nie jest ustawiony.

**Fix:** Ujednolicić fallback do `http://localhost:8000/api/v1` albo usunąć fallback i wymagać zmiennej env.

---

### [x] TODO: `MediaService` nie generuje wariantów obrazów lokalnie
**Plik:** `server/app/Services/MediaService.php:66`

`// TODO: Process image sizes locally with Intervention Image` — metoda zwraca zduplikowane URL-e dla różnych rozmiarów zamiast faktycznych miniatur.

**Fix:** Zaimplementować generowanie wariantów przez Intervention Image lub skonfigurować konwersje spatie/laravel-medialibrary.

---

### [x] TODO: `SegmentEvaluationService` — reguła tagów jest pusta
**Plik:** `server/app/Services/SegmentEvaluationService.php:144`

`applyTagRule()` to placeholder — tagi klientów nie są jeszcze zaimplementowane, segmenty oparte na tagach nie działają.

**Fix:** Usunięto `has_tag` z match + metodę `applyTagRule()` — tagi nie są planowane.

---

### [x] Brakujące error state w komponentach klienckich
**Pliki:** `client/components/layout/announcement-bar.tsx`, `client/components/layout/locale-switcher.tsx`

Gdy query zwróci błąd, komponenty renderują `null` bez żadnego komunikatu. Użytkownik nie wie dlaczego coś zniknęło.

- `AnnouncementBar` — po naprawie modułów problem zniknie (query nie odpali), ale warto dodać `isError` guard na wypadek innych błędów
- `LocaleSwitcher` — gdy `/api/v1/locales` jest niedostępne, switcher znika; powinien przynajmniej pokazać bieżący język bez możliwości zmiany

---

### [x] Brak logowania w health check catchach
**Plik:** `server/app/Http/Controllers/HealthCheckController.php:41, 52`

`catch (Throwable)` bez `Log::error()` — błędy połączenia z DB/Redis są ignorowane bez śladu w logach. Health check zwraca `false` ale nikt nie wie dlaczego.

**Fix:** Dodać `Log::error()` w catch blokach.

---

## Niskie

### [x] Fallback URL-e w client wskazują na localhost
**Pliki:** `client/lib/schema.ts`, `client/lib/seo.ts`, `client/app/robots.ts`, `client/app/sitemap.ts`

Fallback `SITE_URL` to `http://localhost:3000` — jeśli zmienna env nie jest ustawiona na prod, sitemap i robots.txt będą zawierać lokalne URL-e.

**Fix:** Dodać walidację przy starcie lub wymagać `NEXT_PUBLIC_SITE_URL` jako wymaganą zmienną.

---

### [x] Walidacja ustawień jest zbyt luźna
**Plik:** `server/app/Http/Requests/Admin/UpdateSettingsRequest.php`

`'settings' => ['required', 'array']` — zawartość tablicy nie jest walidowana, można wpisać dowolne klucze/wartości.

**Fix:** Dodać walidację znanych kluczy (`settings.general.*`, `settings.seo.*` itd.) z odpowiednimi typami.

---

### [x] Feature flag nie sprawdza licencji
**Plik:** `server/app/Services/FeatureFlagService.php:62`

`// TODO: Can add license verification via API` — wszystkie feature flags bazują tylko na polu `enabled`, bez weryfikacji licencji.

**Decyzja:** Zostawić jako-jest jeśli licencjonowanie nie jest w planach, lub usunąć komentarz TODO.

---

## Page Builder — prawdziwy preview zamiast fake'owego

### [x] Usunąć split view i zastąpić preview frontendem

**Kontekst:**
Aktualny „preview" to fikcja — `page-preview.tsx` re-implementuje wygląd bloków w panelu admina (osobne komponenty: `HeroBannerPreview`, `RichTextPreview` itd.), które nigdy nie są zsynchronizowane z prawdziwym frontendem. Split view (`isSplitView`) ładuje ten fake preview w iframe obok buildera.

**Co usunąć:**
- `isSplitView` state i cała logika split view w `resources/js/pages/admin/cms/pages/builder.tsx`
- Props `previewDevice`, `onChangeDevice` z `BuilderToolbar` + selektor urządzeń (desktop/tablet/mobile)
- Inertia page `resources/js/pages/admin/cms/pages/page-preview.tsx` i wszystkie `*Preview` komponenty
- Metoda `preview()` w `PageBuilderController` + route `GET pages/{page}/preview` w `routes/admin/cms.php`

**Co zbudować — preview przez prawdziwy frontend:**

Flow: admin klika „Preview" → backend generuje podpisany token → frontend waliduje token → ustawia cookie → renderuje stronę z draftu.

**1. Backend — endpoint tokenu**
`GET /admin/pages/{page}/preview-url` (nowa akcja w `PageBuilderController`)
- Generuje `URL::temporarySignedRoute('api.v1.pages.preview', now()->addMinutes(30), ['page' => $page->id])`
- Zwraca JSON `{ url: 'https://frontend.com/api/preview?token=xxx&slug=xxx' }`
- Tylko dla zalogowanych adminów

**2. Backend — endpoint draftu**
`GET /api/v1/pages/{slug}?preview_token=xxx`
- Waliduje podpisany token (Laravel `Request::hasValidSignature()`)
- Pomija filtr `status = published` — zwraca stronę niezależnie od statusu
- Istniejący endpoint `PageController::show()` — dodać obsługę `preview_token`

**3. Frontend — route obsługi tokenu**
`client/app/api/preview/route.ts` (Next.js Route Handler)
- Odbiera `?token=xxx&slug=xxx`
- Ustawia cookie `page_preview_token=xxx` (httpOnly, 30 min)
- Redirectuje na `/{locale}/{slug}`

**4. Frontend — strona stron (`[...slug]`)**
- Gdy cookie `page_preview_token` jest obecne, przekazuje token do `serverFetch('/pages/{slug}?preview_token=xxx')`
- Backend zwraca draft → frontend renderuje normalnie
- Cookie wygasa po 30 min lub po pierwszym użyciu

**Uwagi:**
- `admin_preview` cookie (AdminBar) już istnieje — można rozszerzyć ten mechanizm zamiast tworzyć nowy
- Draft preview dostępny tylko przez podpisany URL — niepubliczne strony nie są nigdy dostępne bez tokenu
- Po usunięciu split view toolbar upraszcza się znacznie (zostaje tylko Publish/Save/Preview button)

---

## Pokrycie testami (braki)

Brakuje testów dla:
- `UserController` — upsert, bulkDestroy, restore, forceDelete
- `AppNotificationController` — resend, bulkDelete
- `MediaController` — upload, delete
- `SegmentEvaluationService` — ewaluacja reguł (szczególnie po naprawie SQL injection)
- `SettingsController` — `testMail` endpoint

---

*Ostatnia aktualizacja: 2026-04-30*
