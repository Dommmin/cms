<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLocaleRequest;
use App\Http\Requests\Admin\UpdateLocaleRequest;
use App\Models\Locale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class LocaleController extends Controller
{
    public function index(Request $request): Response
    {
        $locales = Locale::query()
            ->when($request->input('search'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"))
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/locales/index', [
            'locales' => $locales,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StoreLocaleRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['is_default']) && $data['is_default']) {
            Locale::query()->update(['is_default' => false]);
        }

        Locale::create($data);

        return redirect()->route('admin.locales.index')->with('success', 'Locale created');
    }

    public function update(UpdateLocaleRequest $request, Locale $locale): RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['is_default']) && $data['is_default']) {
            Locale::query()->where('id', '!=', $locale->id)->update(['is_default' => false]);
        }

        $locale->update($data);

        return redirect()->back()->with('success', 'Locale updated');
    }

    public function destroy(Locale $locale): RedirectResponse
    {
        if ($locale->is_default) {
            return redirect()->back()->with('error', 'Cannot delete the default locale');
        }

        $locale->delete();

        return redirect()->back()->with('success', 'Locale deleted');
    }

    public function setDefault(Locale $locale): RedirectResponse
    {
        Locale::query()->update(['is_default' => false]);
        $locale->update(['is_default' => true]);

        return redirect()->back()->with('success', 'Default locale updated');
    }
}
