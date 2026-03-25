<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Theme;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $activeTheme = Theme::query()
            ->where('is_active', true)
            ->first(['slug', 'tokens']);

        View::share('appearance', $request->cookie('appearance') ?? 'system');
        View::share('activeThemeCssVariables', $this->activeThemeCssVariables($activeTheme?->tokens));
        View::share('activeThemeSlug', $activeTheme?->slug);

        return $next($request);
    }

    private function activeThemeCssVariables(mixed $tokens): string
    {
        if (! is_array($tokens)) {
            return '';
        }

        $allowedKeys = [
            'background',
            'foreground',
            'card',
            'card-foreground',
            'popover',
            'popover-foreground',
            'primary',
            'primary-foreground',
            'secondary',
            'secondary-foreground',
            'muted',
            'muted-foreground',
            'accent',
            'accent-foreground',
            'destructive',
            'destructive-foreground',
            'border',
            'input',
            'ring',
            'radius',
            'chart-1',
            'chart-2',
            'chart-3',
            'chart-4',
            'chart-5',
            'sidebar',
            'sidebar-foreground',
            'sidebar-primary',
            'sidebar-primary-foreground',
            'sidebar-accent',
            'sidebar-accent-foreground',
            'sidebar-border',
            'sidebar-ring',
        ];

        $lines = collect($tokens)
            ->filter(fn (mixed $value, mixed $key): bool => is_string($key) && is_string($value))
            ->mapWithKeys(fn (string $value, string $key): array => [mb_ltrim(mb_trim($key), '-') => mb_trim($value)])
            ->filter(
                fn (string $value, string $key): bool => in_array($key, $allowedKeys, true)
                    && $value !== ''
                    && mb_strlen($value) <= 100
                    && preg_match('/^[#(),.%\\-\\sa-zA-Z0-9]+$/', $value) === 1
            )
            ->map(fn (string $value, string $key): string => sprintf('--%s: %s;', $key, $value))
            ->values()
            ->all();

        return implode(' ', $lines);
    }
}
