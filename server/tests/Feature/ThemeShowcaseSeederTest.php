<?php

declare(strict_types=1);

use App\Models\Page;
use Database\Seeders\ThemeShowcaseSeeder;

it('seeds the theme showcase with every design system group', function (): void {
    $this->seed(ThemeShowcaseSeeder::class);

    $page = Page::query()
        ->where('slug->en', 'theme-showcase')
        ->whereNull('locale')
        ->first();

    expect($page)->not->toBeNull()
        ->and($page?->page_type->value)->toBe('blocks')
        ->and($page?->is_published)->toBeTrue()
        ->and($page?->sitemap_exclude)->toBeTrue();

    $groups = $page->allSections()
        ->get()
        ->map(fn ($section) => $section->settings['showcase_group'] ?? null)
        ->filter()
        ->unique()
        ->sort()
        ->values()
        ->all();

    expect($groups)->toEqual([
        'buttons',
        'cards',
        'colors',
        'spacing',
        'surfaces',
        'typography',
    ])
        ->and($page->allSections()->count())->toBe(6)
        ->and($page->allBlocks()->count())->toBe(6)
        ->and($page->allBlocks()->where('type', 'custom_html')->count())->toBe(6);
});

it('is idempotent when run twice', function (): void {
    $this->seed(ThemeShowcaseSeeder::class);
    $this->seed(ThemeShowcaseSeeder::class);

    $page = Page::query()
        ->where('slug->en', 'theme-showcase')
        ->whereNull('locale')
        ->firstOrFail();

    expect($page->allSections()->count())->toBe(6)
        ->and($page->allBlocks()->count())->toBe(6);
});
