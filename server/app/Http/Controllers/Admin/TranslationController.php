<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTranslationRequest;
use App\Http\Requests\Admin\UpdateTranslationRequest;
use App\Models\Locale;
use App\Models\Translation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Response;

class TranslationController extends Controller
{
    public function index(Request $request): Response
    {
        $locale = $request->input('locale', 'en');
        $group = $request->input('group');
        $search = $request->input('search');
        $missing = $request->boolean('missing');

        $translations = Translation::query()
            ->where('locale_code', $locale)
            ->when($group, fn ($q) => $q->where('group', $group))
            ->when($missing, fn ($q) => $q->where(fn ($q) => $q->whereNull('value')->orWhere('value', '')))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search): void {
                $q->where('key', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('value', 'like', sprintf('%%%s%%', $search));
            }))
            ->orderBy('group')
            ->orderBy('key')
            ->paginate(50)
            ->withQueryString();

        $locales = Locale::query()->active()->orderByDesc('is_default')->orderBy('name')->get(['code', 'name', 'flag_emoji']);
        $groups = Translation::query()->distinct()->orderBy('group')->pluck('group');

        return inertia('admin/translations/index', [
            'translations' => $translations,
            'locales' => $locales,
            'groups' => $groups,
            'filters' => $request->only(['locale', 'group', 'search', 'missing']),
        ]);
    }

    public function store(StoreTranslationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Translation::query()->firstOrCreate(['locale_code' => $data['locale_code'], 'group' => $data['group'], 'key' => $data['key']], ['value' => $data['value']]);

        Cache::forget('translations.'.$data['locale_code']);

        return back()->with('success', 'Translation created');
    }

    public function update(UpdateTranslationRequest $request, Translation $translation): RedirectResponse
    {
        $translation->update($request->validated());

        Cache::forget('translations.'.$translation->locale_code);

        return back()->with('success', 'Translation updated');
    }

    public function sync(): RedirectResponse
    {
        Artisan::call('translations:sync');

        return back()->with('success', 'Translations synced from frontend files');
    }

    public function destroy(Translation $translation): RedirectResponse
    {
        $localeCode = $translation->locale_code;
        $translation->delete();

        Cache::forget('translations.'.$localeCode);

        return back()->with('success', 'Translation deleted');
    }
}
