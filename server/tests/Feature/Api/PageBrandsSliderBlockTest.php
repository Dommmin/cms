<?php

declare(strict_types=1);

use App\Models\BlockRelation;
use App\Models\Brand;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('modules.ecommerce', true);
});

function createBrandsSliderPage(array $blockConfiguration, array $relations = []): Page
{
    $page = Page::factory()->published()->create([
        'slug' => ['en' => 'brands-slider-test'],
        'title' => ['en' => 'Brands Slider Test'],
    ]);

    $section = PageSection::query()->create([
        'page_id' => $page->id,
        'section_type' => 'standard',
        'layout' => 'contained',
        'variant' => 'light',
        'position' => 0,
        'is_active' => true,
    ]);

    $block = PageBlock::query()->create([
        'page_id' => $page->id,
        'section_id' => $section->id,
        'type' => 'brands_slider',
        'configuration' => $blockConfiguration,
        'position' => 0,
        'is_active' => true,
    ]);

    foreach ($relations as $relation) {
        BlockRelation::query()->create([
            'page_block_id' => $block->id,
            'relation_type' => $relation['relation_type'],
            'relation_id' => $relation['relation_id'],
            'relation_key' => $relation['relation_key'],
            'position' => $relation['position'],
            'metadata' => $relation['metadata'] ?? null,
        ]);
    }

    return $page;
}

it('resolves all active brands server-side for source all', function (): void {
    Brand::query()->create([
        'name' => 'Alpha Brand',
        'slug' => 'alpha-brand',
        'is_active' => true,
        'position' => 0,
    ]);

    Brand::query()->create([
        'name' => 'Beta Brand',
        'slug' => 'beta-brand',
        'is_active' => true,
        'position' => 1,
    ]);

    Brand::query()->create([
        'name' => 'Inactive Brand',
        'slug' => 'inactive-brand',
        'is_active' => false,
        'position' => 2,
    ]);

    createBrandsSliderPage([
        'source' => 'all',
        'title' => 'Our brands',
    ]);

    $response = $this->getJson('/api/v1/pages/brands-slider-test');

    $response
        ->assertOk()
        ->assertJsonPath('sections.0.blocks.0.type', 'brands_slider');

    $relations = $response->json('sections.0.blocks.0.relations');
    $names = collect($relations)->pluck('data.name')->all();

    expect($relations)->toHaveCount(2)
        ->and($names)->toContain('Alpha Brand', 'Beta Brand')
        ->and($names)->not->toContain('Inactive Brand')
        ->and($relations[0]['relation_key'])->toBe('brands');
});

it('uses manual relations when source is manual', function (): void {
    $manualBrand = Brand::query()->create([
        'name' => 'Manual Brand',
        'slug' => 'manual-brand',
        'is_active' => true,
        'position' => 0,
    ]);

    Brand::query()->create([
        'name' => 'Auto Brand',
        'slug' => 'auto-brand',
        'is_active' => true,
        'position' => 1,
    ]);

    createBrandsSliderPage(
        [
            'source' => 'manual',
            'title' => 'Selected brands',
        ],
        [
            [
                'relation_type' => 'brand',
                'relation_id' => $manualBrand->id,
                'relation_key' => 'brands',
                'position' => 0,
            ],
        ],
    );

    $response = $this->getJson('/api/v1/pages/brands-slider-test');

    $relations = $response->json('sections.0.blocks.0.relations');

    expect($relations)->toHaveCount(1)
        ->and($relations[0]['data']['name'])->toBe('Manual Brand');
});
