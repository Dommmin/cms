<?php

declare(strict_types=1);

use App\Http\Middleware\HandleAppearance;
use App\Http\Requests\Admin\MediaCropRequest;
use App\Models\Theme;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->actingAs($this->user, 'sanctum');
});

describe('Theme Design System Tokens', function (): void {
    it('generates CSS variables from color tokens', function (): void {
        $theme = Theme::factory()->create([
            'tokens' => [
                'background' => '#f8fafc',
                'foreground' => '#0f172a',
                'primary' => '#4f46e5',
            ],
            'typography' => null,
            'spacing' => null,
            'buttons' => null,
            'containers' => null,
            'is_active' => true,
        ]);

        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, $theme);

        expect($cssVars)->toContain('--background: #f8fafc');
        expect($cssVars)->toContain('--foreground: #0f172a');
        expect($cssVars)->toContain('--primary: #4f46e5');
    });

    it('generates CSS variables from typography tokens', function (): void {
        $theme = Theme::factory()->create([
            'tokens' => ['background' => '#fff'],
            'typography' => [
                'heading_font' => 'Inter',
                'body_font' => 'Inter',
                'base_size' => '16px',
                'scale' => '1.25',
                'h1_size' => '2.5rem',
                'h2_size' => '2rem',
                'h3_size' => '1.5rem',
                'h4_size' => '1.25rem',
            ],
            'is_active' => true,
        ]);

        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, $theme);

        expect($cssVars)->toContain('--font-heading: Inter');
        expect($cssVars)->toContain('--font-body: Inter');
        expect($cssVars)->toContain('--text-base-size: 16px');
        expect($cssVars)->toContain('--text-scale: 1.25');
        expect($cssVars)->toContain('--h1-size: 2.5rem');
        expect($cssVars)->toContain('--h2-size: 2rem');
        expect($cssVars)->toContain('--h3-size: 1.5rem');
        expect($cssVars)->toContain('--h4-size: 1.25rem');
    });

    it('generates CSS variables from spacing tokens', function (): void {
        $theme = Theme::factory()->create([
            'tokens' => ['background' => '#fff'],
            'spacing' => [
                'section_padding' => '5rem',
                'block_gap' => '2rem',
                'container_padding' => '1.5rem',
            ],
            'is_active' => true,
        ]);

        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, $theme);

        expect($cssVars)->toContain('--section-padding-y: 5rem');
        expect($cssVars)->toContain('--block-gap: 2rem');
        expect($cssVars)->toContain('--container-padding: 1.5rem');
    });

    it('generates CSS variables from button tokens', function (): void {
        $theme = Theme::factory()->create([
            'tokens' => ['background' => '#fff'],
            'buttons' => [
                'primary_border_radius' => '0.5rem',
                'primary_padding_x' => '1.5rem',
                'primary_padding_y' => '0.75rem',
                'secondary_border_radius' => '0.375rem',
                'secondary_padding_x' => '1.5rem',
                'secondary_padding_y' => '0.75rem',
            ],
            'is_active' => true,
        ]);

        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, $theme);

        expect($cssVars)->toContain('--btn-radius: 0.5rem');
        expect($cssVars)->toContain('--btn-padding-x: 1.5rem');
        expect($cssVars)->toContain('--btn-padding-y: 0.75rem');
        expect($cssVars)->toContain('--btn-secondary-radius: 0.375rem');
    });

    it('generates CSS variables from container tokens', function (): void {
        $theme = Theme::factory()->create([
            'tokens' => ['background' => '#fff'],
            'containers' => [
                'max_width' => '1280px',
                'content_width' => '768px',
                'narrow_width' => '640px',
            ],
            'is_active' => true,
        ]);

        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, $theme);

        expect($cssVars)->toContain('--container-max-width: 1280px');
        expect($cssVars)->toContain('--container-content-width: 768px');
        expect($cssVars)->toContain('--container-narrow-width: 640px');
    });

    it('generates section dark variant tokens from foreground/background', function (): void {
        $theme = Theme::factory()->create([
            'tokens' => [
                'background' => '#ffffff',
                'foreground' => '#0f172a',
            ],
            'is_active' => true,
        ]);

        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, $theme);

        expect($cssVars)->toContain('--section-dark-bg: #0f172a');
        expect($cssVars)->toContain('--section-dark-text: #ffffff');
    });

    it('returns empty string for null theme', function (): void {
        $middleware = new HandleAppearance();
        $reflection = new ReflectionClass($middleware);
        $method = $reflection->getMethod('buildCssVariables');

        $cssVars = $method->invoke($middleware, null);

        expect($cssVars)->toBe('');
    });
});

describe('Theme Design System Field Persistence', function (): void {
    it('persists typography, spacing, buttons, containers via model', function (): void {
        $theme = Theme::factory()->create([
            'typography' => [
                'heading_font' => 'Inter',
                'body_font' => 'Inter',
            ],
            'spacing' => [
                'section_padding' => '5rem',
            ],
            'buttons' => [
                'primary_border_radius' => '0.5rem',
            ],
            'containers' => [
                'max_width' => '1280px',
            ],
        ]);

        $theme->refresh();

        expect($theme->typography['heading_font'])->toBe('Inter');
        expect($theme->spacing['section_padding'])->toBe('5rem');
        expect($theme->buttons['primary_border_radius'])->toBe('0.5rem');
        expect($theme->containers['max_width'])->toBe('1280px');
    });
});

describe('Media Crop Validation', function (): void {
    it('validates crop request rules', function (): void {
        $request = new MediaCropRequest();
        $rules = $request->rules();

        expect($rules)->toHaveKey('x');
        expect($rules)->toHaveKey('y');
        expect($rules)->toHaveKey('width');
        expect($rules)->toHaveKey('height');
        expect($rules['x'])->toContain('numeric');
        expect($rules['width'])->toContain('numeric');
    });
});

describe('Block Patterns Config', function (): void {
    it('loads block patterns configuration', function (): void {
        $patterns = config('cms.block_patterns');

        expect($patterns)->toBeArray();
        expect($patterns)->toHaveKey('hero-with-cta');
        expect($patterns)->toHaveKey('features-three-col');
        expect($patterns)->toHaveKey('pricing-with-faq');
        expect($patterns['hero-with-cta']['name'])->toBe('Hero + CTA');
        expect($patterns['hero-with-cta']['sections'])->toBeArray();
    });
});
