<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Locale;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $flashSuccess = $request->session()->get('success');
        $flashError = $request->session()->get('error');
        $activeTheme = Theme::query()
            ->where('is_active', true)
            ->first(['id', 'slug', 'tokens']);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'can' => [
                'manageUsers' => Gate::allows('viewAny', User::class),
            ],
            'flash' => [
                'success' => $flashSuccess,
                'error' => $flashError,
                'nonce' => ($flashSuccess || $flashError) ? Str::uuid()->toString() : null,
            ],
            'activeTheme' => $activeTheme ? [
                'id' => $activeTheme->id,
                'slug' => $activeTheme->slug,
                'tokens' => $activeTheme->tokens,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'frontendUrl' => config('app.frontend_url', 'http://localhost:3000'),
            'locales' => Locale::getLocales(),
            'adminTranslations' => $this->loadAdminTranslations(),
        ];
    }

    private function loadAdminTranslations(): array
    {
        return Cache::remember('admin_translations_v2', 3600, function (): array {
            $result = [];

            foreach (glob(lang_path('*/admin.php')) ?: [] as $file) {
                $locale = basename(dirname($file));
                $translations = require $file;
                $result[$locale] = Arr::dot($translations);
            }

            return $result;
        });
    }
}
