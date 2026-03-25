<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreThemeRequest;
use App\Http\Requests\Admin\UpdateThemeRequest;
use App\Models\Theme;
use App\Queries\Admin\ThemeIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class ThemeController extends Controller
{
    public function index(Request $request): Response
    {
        $themeQuery = new ThemeIndexQuery($request);
        $themes = $themeQuery->execute();

        return inertia('admin/themes/index', [
            'themes' => $themes,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/themes/create');
    }

    public function store(StoreThemeRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] ??= true;
        $shouldActivate = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);

        DB::transaction(function () use ($data, $shouldActivate): void {
            if ($shouldActivate) {
                Theme::query()->where('is_active', true)->update(['is_active' => false]);
            }

            Theme::query()->create($data);
        });

        return to_route('admin.themes.index')->with('success', 'Motyw został utworzony');
    }

    public function show(Theme $theme): Response
    {
        $theme->loadCount('pages');

        return inertia('admin/themes/show', [
            'theme' => $theme,
        ]);
    }

    public function edit(Theme $theme): Response
    {
        $theme->loadCount('pages');

        return inertia('admin/themes/edit', [
            'theme' => $theme,
        ]);
    }

    public function update(UpdateThemeRequest $request, Theme $theme): RedirectResponse
    {
        $data = $request->validated();
        $shouldActivate = filter_var($data['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN);

        DB::transaction(function () use ($theme, $data, $shouldActivate): void {
            if ($shouldActivate) {
                Theme::query()
                    ->where('id', '!=', $theme->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $theme->update($data);
        });

        return back()->with('success', 'Motyw został zaktualizowany');
    }

    public function destroy(Theme $theme): RedirectResponse
    {
        if ($theme->pages()->exists()) {
            return back()->with('error', 'Nie można usunąć motywu używanego przez strony');
        }

        $theme->delete();

        return back()->with('success', 'Motyw został usunięty');
    }

    public function activate(Theme $theme): RedirectResponse
    {
        DB::transaction(function () use ($theme): void {
            Theme::query()->where('is_active', true)->update(['is_active' => false]);
            $theme->update(['is_active' => true]);
        });

        return back()->with('success', 'Motyw został aktywowany');
    }

    public function disable(): RedirectResponse
    {
        Theme::query()->where('is_active', true)->update(['is_active' => false]);

        return back()->with('success', 'Niestandardowy motyw został wyłączony');
    }

    public function duplicate(Theme $theme): RedirectResponse
    {
        $newTheme = $theme->replicate();
        $newTheme->name = $theme->name.' (Kopia)';
        $newTheme->slug = $theme->slug.'-copy-'.time();
        $newTheme->is_active = false;
        $newTheme->save();

        return to_route('admin.themes.edit', $newTheme)->with('success', 'Motyw został skopiowany');
    }
}
