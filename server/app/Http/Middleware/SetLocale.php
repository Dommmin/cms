<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $requested = $request->query('locale') ?? $request->getPreferredLanguage() ?? config('app.locale');

        $active = Cache::remember('active_locale_codes', 3600, fn (): array => Locale::query()->active()->pluck('code')->all());

        $locale = in_array($requested, $active, true) ? $requested : config('app.locale');

        app()->setLocale($locale);

        return $next($request);
    }
}
