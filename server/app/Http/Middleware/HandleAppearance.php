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
            ->first(['slug', 'tokens', 'typography', 'spacing', 'buttons', 'containers']);

        View::share('appearance', $request->cookie('appearance') ?? 'system');
        View::share('activeThemeCssVariables', $this->buildCssVariables($activeTheme));
        View::share('activeThemeSlug', $activeTheme?->slug);

        return $next($request);
    }

    private function buildCssVariables(?Theme $theme): string
    {
        if (! $theme instanceof Theme) {
            return '';
        }

        $variables = [];

        // Color tokens (existing)
        $colorVars = $this->sanitizeTokenVariables(
            (array) ($theme->tokens ?? []),
            $this->allowedColorKeys(),
        );
        foreach ($colorVars as $key => $value) {
            $variables[$key] = $value;
        }

        // Typography tokens
        $typography = (array) ($theme->typography ?? []);
        $typographyMap = [
            'heading_font' => 'font-heading',
            'body_font' => 'font-body',
            'base_size' => 'text-base-size',
            'scale' => 'text-scale',
            'h1_size' => 'h1-size',
            'h2_size' => 'h2-size',
            'h3_size' => 'h3-size',
            'h4_size' => 'h4-size',
        ];
        foreach ($typographyMap as $tokenKey => $cssVar) {
            if (isset($typography[$tokenKey]) && is_string($typography[$tokenKey]) && $typography[$tokenKey] !== '') {
                $variables[$cssVar] = $typography[$tokenKey];
            }
        }

        // Spacing tokens
        $spacing = (array) ($theme->spacing ?? []);
        $spacingMap = [
            'section_padding' => 'section-padding-y',
            'block_gap' => 'block-gap',
            'container_padding' => 'container-padding',
        ];
        foreach ($spacingMap as $tokenKey => $cssVar) {
            if (isset($spacing[$tokenKey]) && is_string($spacing[$tokenKey]) && $spacing[$tokenKey] !== '') {
                $variables[$cssVar] = $spacing[$tokenKey];
            }
        }

        // Button tokens
        $buttons = (array) ($theme->buttons ?? []);
        $buttonMap = [
            'primary_border_radius' => 'btn-radius',
            'primary_padding_x' => 'btn-padding-x',
            'primary_padding_y' => 'btn-padding-y',
            'secondary_border_radius' => 'btn-secondary-radius',
            'secondary_padding_x' => 'btn-secondary-padding-x',
            'secondary_padding_y' => 'btn-secondary-padding-y',
        ];
        foreach ($buttonMap as $tokenKey => $cssVar) {
            if (isset($buttons[$tokenKey]) && is_string($buttons[$tokenKey]) && $buttons[$tokenKey] !== '') {
                $variables[$cssVar] = $buttons[$tokenKey];
            }
        }

        // Container tokens
        $containers = (array) ($theme->containers ?? []);
        $containerMap = [
            'max_width' => 'container-max-width',
            'content_width' => 'container-content-width',
            'narrow_width' => 'container-narrow-width',
        ];
        foreach ($containerMap as $tokenKey => $cssVar) {
            if (isset($containers[$tokenKey]) && is_string($containers[$tokenKey]) && $containers[$tokenKey] !== '') {
                $variables[$cssVar] = $containers[$tokenKey];
            }
        }

        // Section variant tokens derived from color tokens
        $sectionDarkBg = $variables['foreground'] ?? '#0f172a';
        $sectionDarkText = $variables['background'] ?? '#ffffff';
        $variables['section-dark-bg'] = $sectionDarkBg;
        $variables['section-dark-text'] = $sectionDarkText;

        return collect($variables)
            ->map(fn (string $value, string $key): string => sprintf('--%s: %s;', $key, $value))
            ->values()
            ->implode(' ');
    }

    /**
     * @param  array<string, mixed>  $tokens
     * @param  list<string>  $allowedKeys
     * @return array<string, string>
     */
    private function sanitizeTokenVariables(array $tokens, array $allowedKeys): array
    {
        return collect($tokens)
            ->filter(fn (mixed $value): bool => is_string($value) || is_null($value))
            ->mapWithKeys(fn (mixed $value, string $key): array => [mb_ltrim(mb_trim($key), '-') => is_string($value) ? mb_trim($value) : ''])
            ->filter(
                fn (string $value, string $key): bool => in_array($key, $allowedKeys, true)
                    && $value !== ''
                    && mb_strlen($value) <= 100
                    && preg_match('/^[#(),.%\\-\\sa-zA-Z0-9]+$/', $value) === 1
            )
            ->all();
    }

    /**
     * @return list<string>
     */
    private function allowedColorKeys(): array
    {
        return [
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
    }
}
