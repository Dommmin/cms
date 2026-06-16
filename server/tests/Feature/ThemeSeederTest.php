<?php

declare(strict_types=1);

use App\Models\Theme;
use Database\Seeders\ThemeSeeder;

it('seeds default storefront theme with blog-quality tokens', function (): void {
    Theme::query()->delete();

    $this->seed(ThemeSeeder::class);

    $default = Theme::query()->where('slug', 'default')->first();

    expect($default)->not->toBeNull()
        ->and($default->is_active)->toBeTrue()
        ->and($default->tokens['primary'])->toBe('#4f46e5')
        ->and($default->tokens['radius'])->toBe('0.375rem')
        ->and($default->typography['heading_font'])->toContain('Space Grotesk')
        ->and($default->dark_tokens['background'])->toBe('#0f172a');
});
