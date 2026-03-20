# Multi-Site Per Locale

## Koncepcja

Zamiast tłumaczeń per-pole (spatie/laravel-translatable na stronach), każda witryna językowa to **oddzielny zestaw stron** z tym samym `slug`, ale innym `locale`.

| locale | Znaczenie |
|--------|-----------|
| `null` | Witryna globalna (obecne strony — fallback dla wszystkich języków) |
| `'pl'` | Witryna PL |
| `'en'` | Witryna EN |

## Logika pobierania strony (API)

`GET /api/v1/pages/{slug}?locale=pl`:
1. Szuka strony z `slug = X` AND `locale = 'pl'`
2. Jeśli nie znajdzie → fallback do `slug = X` AND `locale = null`
3. Jeśli nadal nie ma → 404

Dzięki temu obecne strony (`locale = null`) działają bez zmian jako fallback.

## Pliki do stworzenia

### 1. Migracja
`server/database/migrations/YYYY_MM_DD_add_locale_to_pages_table.php`

```php
Schema::table('pages', function (Blueprint $table): void {
    $table->string('locale', 10)->nullable()->after('parent_id');
    $table->dropUnique('pages_parent_slug_unique');
    $table->unique(['parent_id', 'slug', 'locale'], 'pages_parent_slug_locale_unique');
    $table->index('locale');
});
```

**Uwaga:** MySQL traktuje `NULL != NULL` w unikalnych indeksach, więc `(null, 'contact', null)` i `(null, 'contact', 'pl')` mogą współistnieć ✓

### 2. `CloneSiteService`
`server/app/Services/CloneSiteService.php`

- `clone(string $sourceLocale, string $targetLocale): void`
- Kopiuje wszystkie strony źródłowego locale (lub globalne gdy `$sourceLocale = 'global'`)
- Dla każdej strony: kopiuje page → sections → blocks → block_relations
- Remapuje `parent_id` po skopiowaniu wszystkich stron
- Nowe strony mają `is_published = false`
- Jeśli target locale już ma strony → `RuntimeException` (user musi usunąć lub wybrać inny target)

### 3. `CloneSiteRequest`
`server/app/Http/Requests/Admin/Cms/CloneSiteRequest.php`

```php
'source_locale' => ['required', 'string'], // 'global' lub kod locale
'target_locale' => ['required', 'string', 'exists:locales,code', 'different:source_locale'],
```

## Pliki do modyfikacji

### Backend

#### `server/app/Models/Page.php`
- Dodać `'locale'` do `$fillable`
- Zmodyfikować `findByLocalizedPath()` → dwuetapowy fallback (locale-specific → null)
- Dodać `scopeForLocale($query, ?string $locale)`:
  - `'global'` → `whereNull('locale')`
  - string → `where('locale', $locale)`
  - `null` → brak filtra (wszystkie)

#### `server/app/Http/Controllers/Admin/Cms/PageController.php`
- `index()` → przekazuje `filters.locale` do widoku
- `store()` → już wystarczy (locale w `$fillable` + Form Request)
- Nowa metoda `cloneSite(CloneSiteRequest $request): RedirectResponse`

#### `server/app/Http/Requests/Admin/Cms/StorePageRequest.php`
- Dodać `'locale' => ['nullable', 'string', 'max:10', 'exists:locales,code']`
- Zaktualizować unique rule dla `slug` uwzględniając locale:
  ```php
  Rule::unique('pages', 'slug')
      ->where('parent_id', $this->input('parent_id'))
      ->where(fn($q) => $this->input('locale')
          ? $q->where('locale', $this->input('locale'))
          : $q->whereNull('locale'))
      ->ignore($page?->id)
  ```

#### `server/app/Http/Requests/Admin/Cms/UpdatePageRequest.php`
- Identyczne zmiany jak StorePageRequest

#### `server/app/Queries/Admin/PageIndexQuery.php`
- Dodać filtrowanie po `locale` z requesta:
  ```php
  ->when($this->request->locale !== null, fn($q) =>
      $this->request->locale === 'global'
          ? $q->whereNull('locale')
          : $q->where('locale', $this->request->locale)
  )
  ```

#### `server/routes/admin/cms.php`
- Dodać **przed** `Route::resource('pages', ...)`:
  ```php
  Route::post('pages/clone-site', [PageController::class, 'cloneSite'])->name('pages.clone-site');
  ```

### Admin SPA (Inertia + React)

#### `server/resources/js/components/columns/page-columns.tsx`
- Dodać `locale: string | null` do typu `PageRow`
- Dodać kolumnę `locale` z `<Badge>`:
  - `null` → `<Badge variant="secondary"><Globe/>Global</Badge>`
  - string → `<Badge variant="outline" className="font-mono uppercase">{locale}</Badge>`

#### `server/resources/js/pages/admin/cms/pages/index.tsx`
- Zakładki locale nad tabelą: `All | Global | EN | PL | ...`
  - Pobierają lokale z `usePage().props.locales`
  - Click → `router.get('/admin/cms/pages', { locale: value }, { preserveState: true })`
- Przycisk **"Clone Site"** w nagłówku → otwiera `<Dialog>`
- Dialog "Clone Site":
  - `<Select>` źródłowe locale (Global + wszystkie locales)
  - `<Select>` docelowe locale (wszystkie locales)
  - Ostrzeżenie: "This will copy all pages. Target locale must be empty."
  - `useForm({ source_locale: '', target_locale: '' })` + `post('/admin/cms/pages/clone-site')`

#### `server/resources/js/pages/admin/cms/pages/create.tsx`
- Dodać `<Select>` dla `locale` (po polu page_type):
  - Opcje: `— Global (all locales) —` + pętla po `locales`
  - Puste string = null = global

#### `server/resources/js/pages/admin/cms/pages/edit.tsx`
- Dodać `locale: string | null` do typu `PageData`
- Wyświetlić/edytować locale w formularzu (ten sam Select co w create)

## Frontend (client/) — brak zmian

`getPage(slug, locale)` → `serverFetch('/pages/{slug}?locale=xx')` — backend zwraca właściwą wersję automatycznie.

## Kolejność implementacji

1. Migracja + `Page.php` ($fillable + scopeForLocale)
2. `findByLocalizedPath()` — dwuetapowy fallback
3. Form Requests (locale rule)
4. `CloneSiteService` + `CloneSiteRequest`
5. `PageController::cloneSite()` + route
6. `PageIndexQuery` — filtr locale
7. Admin SPA — kolumna + zakładki + dialog + create/edit field
8. Test: `php artisan test --compact tests/Feature/Cms/`
