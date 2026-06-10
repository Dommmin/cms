# Plan Publikacji: Czerwiec–Lipiec 2026

## Cel

Publikować **od 1 czerwca**, co **2–3 dni** — build in public jako ciągła informacja o tym, co budujesz i co właśnie zmieniasz w platformie.

Priorytety treści:

1. **Platforma headless** — CMS, e-commerce, API, panel admina, storefront Next.js, mobile MVP
2. **Konkretne zmiany i decyzje z kodu** — nie ogólne „5 tipów Laravel”
3. **AI jako warsztat developera** — teraz, uczciwie
4. **AI w produkcie** — tylko **drafty**; publikacja po wdrożeniu, jako usprawnienie (nie zamiennik ręcznej pracy)

---

## Rytm publikacji

| Parametr | Wartość |
|----------|---------|
| **Start** | **2026-06-01** |
| **Częstotliwość** | co **2–3 dni** (LinkedIn); blog co ~10 dni |
| **Kanał główny** | LinkedIn |
| **Blog** | 2 artykuły w czerwcu + dalsze w lipcu wg kalendarza |

**Uwaga o datach:** LinkedIn nie pozwala ustawić daty publikacji w przeszłości. Daty w planie to **kolejność tematów i docelowy rytm**. Jeśli startujesz później (np. 10 czerwca) — publikuj posty **w numeracji 1 → 2 → 3…**, ewentualnie **2 posty w jeden dzień**, żeby nadrobić zaległość względem harmonogramu, a potem wróć do co 2–3 dni.

### Nadrobienie (stan na ~2026-06-10)

| Priorytet | Co wrzucić | Kiedy (sugerowane) |
|-----------|------------|---------------------|
| 1 | Post 1 (platforma ≠ CMS) | od razu |
| 2 | Post 2 (revalidation) | +2 dni lub ten sam dzień wieczorem |
| 3 | Post 3 (AI dev workflow) | +1–2 dni |
| 4 | Post 4 (sklep vs CMS) | +2–3 dni → ok. **2026-06-12** |
| dalej | Post 5, 6… wg tabeli | co 2–3 dni |

---

## Pozycjonowanie

> Buduję headless platformę CMS + e-commerce w monorepo. Publikuję co kilka dni: co działa, co właśnie refaktoruję i jakie decyzje za tym stoją. AI przyspiesza development; AI w produkcie będzie **usprawnieniem** — operator zawsze może zrobić to sam ręcznie.

**Preferuj w postach o „zmianach”:**

- „W tym tygodniu…” / „Ostatni refaktor…” / „Dodałem…”
- jeden moduł, jedna decyzja, jeden trade-off
- link do bloga tylko gdy artykuł już jest live

---

## Kalendarz — Czerwiec 2026

| Data | Kanał | # | Temat |
|------|-------|---|-------|
| **2026-06-01** | LinkedIn | 1 | Platforma ≠ CMS; monorepo i moduły |
| **2026-06-03** | LinkedIn | 2 | Publish → signed revalidation w Next.js |
| **2026-06-06** | LinkedIn | 3 | AI jako narzędzie developera (workflow) |
| **2026-06-09** | LinkedIn | 4 | Sklep vs CMS: grosze, Omnibus, order snapshot |
| **2026-06-12** | LinkedIn | 5 | 5 problemów niewidocznych w „zbudowałem CMS” |
| **2026-06-15** | **Blog** | — | Artykuł 1 — granice modułów, API, Page Builder sync |
| **2026-06-17** | LinkedIn | 6 | Page Builder: snapshot sync, approval, schedule |
| **2026-06-19** | LinkedIn | 7 | Płatności: PayU/P24/Paynow, idempotency, webhooki |
| **2026-06-22** | LinkedIn | 8 | Build in public: 3 decyzje z czerwca |
| **2026-06-25** | **Blog** | — | Artykuł 2 — panel admina Inertia/React, workflow |
| **2026-06-27** | LinkedIn | 9 | Metafields + smart collections |
| **2026-06-30** | LinkedIn | 10 | Podsumowanie czerwca + zapowiedź lipca |

---

## Kalendarz — Lipiec 2026 (zmiany w toku)

Co 2–3 dni — posty o **bieżących pracach** i głębszych modułach:

| Data | Kanał | # | Temat |
|------|-------|---|-------|
| **2026-07-03** | LinkedIn | 11 | Refaktor admina: RWD, `ListFilters`, `DataTable`, PWA (plan) |
| **2026-07-06** | LinkedIn | 12 | Security headers + weryfikacja webhooków (MailerLite, BaseLinker) |
| **2026-07-09** | LinkedIn | 13 | Tax engine OSS / reverse charge — biznes + implementacja |
| **2026-07-12** | LinkedIn | 14 | Mobile MVP (Expo) w tym samym monorepo |
| **2026-07-15** | LinkedIn | 15 | Lexical RTE: sanitization, content health, crop variants |
| **2026-07-18** | LinkedIn | 16 | Newsletter, campaigns, segments — moduł operacyjny |
| **2026-07-21** | LinkedIn | 17 | GDPR w praktyce (export, restriction, anonymize) |
| **2026-07-24** | LinkedIn | 18 | DRAFT-B (opcjonalny): dlaczego AI w produkcie na końcu |
| **2026-07-27** | LinkedIn | 19 | Page Builder Health panel — błędy przed publish, nie po deployu |
| **2026-07-30** | LinkedIn | 20 | Podsumowanie lipca |

**Blog lipiec (opcjonalnie):** jeden artykuł głęboki co 3–4 tygodnie — np. revalidation end-to-end albo admin RWD — po zebraniu materiału z postów 11–12.

---

## AI w produkcie — DRAFT, bez daty

Publikuj **dopiero po wdrożeniu** pierwszej funkcji. Szkice:

- `LINKEDIN_POSTS_2026-06.md` → **DRAFT-A / DRAFT-B**
- `BLOG_POST_DRAFTS_CMS_2026-06.md` → **DRAFT: AI-assisted builder**

Zasada: operator robi wszystko ręcznie **dziś**; AI później skraca powtarzalne kroki (meta, propozycje sekcji) — bez auto-publish.

---

## Strategia ponownego użycia

- Blog **2026-06-15** → Post 6 (**2026-06-17**) jako rozwinięcie / link w komentarzu  
- Blog **2026-06-25** → Post 11 (**2026-07-03**) może nawiązać do Artykułu 2 (admin UX)

---

## Checklist prawdy (przed każdym postem)

- [ ] Min. 1 element weryfikowalny w repo
- [ ] Post o „zmianie” opisuje co **jest** w kodzie, nie co „będzie za tydzień” (wyjątek: jawne „planuję / w toku”)
- [ ] Brak wdrożonego AI w produkcie w czasie teraźniejszym
- [ ] Admin = Inertia/React; ceny = grosze

---

## Proporcje (czerwiec–lipiec)

| Obszar | Udział |
|--------|--------|
| Architektura + headless | 30% |
| E-commerce | 20% |
| Panel admin + Page Builder + **bieżące refaktory UI** | 30% |
| AI jako narzędzie dev | 10% |
| Build in public / podsumowania miesiąca | 10% |
| AI w produkcie | **0%** (tylko drafty) |

---

## Minimum sukcesu — czerwiec

- [ ] Posty LinkedIn 1–10 opublikowane (w kolejności, rytm 2–3 dni lub nadrobione)
- [ ] 2 artykuły blogowe live
- [ ] Zero fikcyjnych funkcji AI w produkcie
- [ ] Lipiec: kontynuacja co 2–3 dni (posty 11+)
