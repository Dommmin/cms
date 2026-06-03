<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->runningUnitTests()) {
            $active = ['en', 'pl'];
        } else {
            $active = ['en', 'pl'];
            try {
                $active = Cache::remember('active_locale_codes', 3600, fn (): array => Locale::query()->active()->pluck('code')->all());
            } catch (Throwable) {
                // Fallback if database is not migrated yet
            }
        }

        if ($request->is('admin*') || $request->is('admin/*')) {
            $requested = $request->cookie('admin_locale') ?? config('app.locale');
        } else {
            $requested = $request->query('locale') ?? $request->getPreferredLanguage($active) ?? config('app.locale');
        }

        $locale = in_array($requested, $active, true) ? $requested : config('app.locale');

        app()->setLocale($locale);

        return $next($request);
    }
}
