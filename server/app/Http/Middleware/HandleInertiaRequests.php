<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Locale;
use App\Models\Theme;
use Illuminate\Http\Request;
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
                'manageUsers' => Gate::allows('viewAny', \App\Models\User::class),
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
            'locales' => Locale::query()->active()->orderByDesc('is_default')->orderBy('name')->get(['code', 'name', 'native_name', 'flag_emoji', 'is_default']),
        ];
    }
}
