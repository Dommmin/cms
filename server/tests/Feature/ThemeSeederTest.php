<?php

declare(strict_types=1);

use App\Models\Theme;

it('seeds default theme presets with a single active theme', function () {
    $this->seed(Database\Seeders\ThemeSeeder::class);

    expect(Theme::query()->whereIn('slug', ['neutral-base', 'ocean-calm', 'sunset-warm'])->count())->toBe(3)
        ->and(Theme::query()->where('is_active', true)->count())->toBe(1)
        ->and(Theme::query()->where('slug', 'neutral-base')->value('is_active'))->toBeTrue();

    $oceanTokens = Theme::query()->where('slug', 'ocean-calm')->value('tokens');

    expect(is_array($oceanTokens))->toBeTrue()
        ->and($oceanTokens['primary'] ?? null)->toBe('#0f766e');
});
