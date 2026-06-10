# Production Verification Checklist

> Cel: jeden, stały plik do weryfikacji produkcyjnej. To nie jest backlog funkcjonalny.  
> Jeśli coś nie przechodzi, odsyłaj do `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md` albo aktywnych auditów szczegółowych.

## Jak używać

- Odhaczaj tylko to, co zostało faktycznie sprawdzone na kodzie, w testach albo ręcznie na środowisku.
- Nie dopisuj tutaj nowych pomysłów produktowych.
- Jeśli pojawia się nowy gap, najpierw opisz go w dedykowanym audycie, a nie w tej checkliście.

## P0 - Przed produkcją

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] `.env.production` uzupełnione i zsynchronizowane z deploymentem
- [ ] backup bazy i plików działa
- [ ] restore drill został wykonany i zakończył się sukcesem
- [ ] monitoring i alerting są aktywne
- [x] health checks są dostępne i zabezpieczone
- [x] debug endpoints są zablokowane poza dozwolonymi środowiskami
- [ ] queue workers są stabilne
- [ ] scheduler działa cyklicznie
- [x] trusted proxy / edge config jest zgodny z aplikacją
- [x] security headers są aktywne na adminie i storefront

## P0 - Bezpieczeństwo i integracje

- [x] każdy inbound webhook ma jawne sprawdzenie sygnatury lub tokenu
- [x] publiczne endpointy write mają sensowne rate limits
- [ ] guest checkout / returns / support forms mają anti-abuse protections
- [ ] outbound integracje używają ustalonych timeoutów i retry policy
- [x] outbound requests nie idą do prywatnych / localhost targetów w production
- [x] logowanie błędów integracji działa i daje ślad diagnostyczny

## P1 - Core commerce

- [x] browse katalogu działa
- [x] product detail działa
- [x] add to cart działa
- [x] cart summary i zmiany ilości działają
- [x] checkout przechodzi do końca
- [x] wybrane metody płatności działają end-to-end
- [x] potwierdzenie zamówienia i e-mail są poprawne
- [x] invoice / dokumenty generują się poprawnie
- [x] fulfillment / shipment flow działa
- [x] returns flow działa
- [x] inventory reservations i release job działają

## P1 - CMS i admin

- [x] Page Builder zapisuje i publikuje treści
- [ ] Page Builder preview działa
- [x] Rich Text Editor nie przepuszcza XSS
- [x] snapshot / walidacja buildera działa po stronie serwera
- [x] autosave działa i nie gubi zmian
- [x] optimistic locking chroni przed nadpisaniem zmian
- [ ] tłumaczenia admina są kompletne w najważniejszych ekranach
- [ ] loading / empty / error states są spójne
- [ ] najważniejsze CRUD-y admina mają poprawne role i policy

## P1 - SEO i widoczność

- [x] metadata generują się poprawnie
- [x] sitemap i robots są poprawne
- [x] canonical / locale handling działa
- [x] schema.org / JSON-LD są poprawne
- [ ] panel SEO pokazuje stan i ostrzeżenia
- [ ] redirecti / indeksowalność / broken links są obsługiwane lub świadomie odłożone

## P1 - Analytics i raportowanie

- [x] conversion tracking zbiera właściwe eventy
- [x] admin analytics pokazuje spójne dane
- [x] funnel / abandonment / zero-result search są mierzalne
- [x] raporty nie zależą od ręcznego sprawdzania logów

## P1 - UX i onboarding

- [x] setup wizard prowadzi przez podstawową konfigurację sklepu
- [ ] starter kit / theme preset działa
- [ ] global sections / widget areas mają jasny model obsługi lub są świadomie odłożone
- [ ] checkout UX nie wymaga zbędnych kroków
- [ ] mobile layout działa na typowych breakpointach

## P2 - Platforma

- [ ] extensibility model jest zdefiniowany albo świadomie odłożony
- [ ] plugin / hook boundaries są opisane
- [ ] tax engine / B2B rules mają jasny zakres albo backlog
- [ ] gift cards / store credit mają status decyzji produktowej
- [ ] A/B testing / personalization są poza zakresem release i nazwane jako future work

## Po deployu

- [ ] smoke test kluczowych flow zakończony sukcesem
- [ ] brak świeżych błędów w logach
- [ ] queue depth wraca do normy
- [ ] cache i revalidation działają
- [ ] smoke test storefrontu na desktop i mobile
- [ ] smoke test admina na najważniejszych ekranach

## Referencje

- `docs/project-status.md`
- `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md`
- `docs/DOCUMENTATION_AUDIT_2026-06-09.md`
- `docs/BACKUP_STRATEGY.md`
- `docs/DISASTER_RECOVERY.md`
- `docs/UPTIME_MONITORING.md`
- `docs/APM_MONITORING.md`
- `docs/deployment.md`
