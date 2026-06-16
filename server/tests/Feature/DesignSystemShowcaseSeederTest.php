<?php

declare(strict_types=1);

use App\Models\Page;
use Database\Seeders\DesignSystemShowcaseSeeder;

it('seeds the design system showcase with every component group', function (): void {
    $this->seed(DesignSystemShowcaseSeeder::class);

    $page = Page::query()
        ->where('slug->en', 'design-system-showcase')
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
        'alerts',
        'badges',
        'buttons',
        'cards',
        'colors',
        'containers',
        'forms',
        'grid_layouts',
        'prose',
        'responsive',
        'sections',
        'spacing',
        'stack_layouts',
        'surfaces',
        'typography',
    ])
        ->and($page->allSections()->count())->toBe(15)
        ->and($page->allBlocks()->count())->toBe(0);
});

it('is idempotent when run twice', function (): void {
    $this->seed(DesignSystemShowcaseSeeder::class);
    $this->seed(DesignSystemShowcaseSeeder::class);

    $page = Page::query()
        ->where('slug->en', 'design-system-showcase')
        ->whereNull('locale')
        ->firstOrFail();

    expect($page->allSections()->count())->toBe(15)
        ->and($page->allBlocks()->count())->toBe(0);
});
