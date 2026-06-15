<?php

declare(strict_types=1);

use App\Models\BlockRelation;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Models\Product;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('modules.ecommerce', true);
});

function createFeaturedProductsPage(array $blockConfiguration, array $relations = []): Page
{
    $page = Page::factory()->published()->create([
        'slug' => ['en' => 'featured-products-test'],
        'title' => ['en' => 'Featured Products Test'],
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
        'type' => 'featured_products',
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

it('resolves featured products server-side for filter_mode featured', function (): void {
    Product::factory()->create([
        'name' => 'Featured Star',
        'is_featured' => true,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    Product::factory()->create([
        'name' => 'Regular Item',
        'is_featured' => false,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    createFeaturedProductsPage([
        'filter_mode' => 'featured',
        'max_items' => 4,
        'title' => 'Top picks',
    ]);

    $response = $this->getJson('/api/v1/pages/featured-products-test');

    $response
        ->assertOk()
        ->assertJsonPath('sections.0.blocks.0.type', 'featured_products');

    $relations = $response->json('sections.0.blocks.0.relations');

    expect($relations)->toHaveCount(1)
        ->and($relations[0]['relation_key'])->toBe('products')
        ->and($relations[0]['data']['name'])->toBe('Featured Star');
});

it('resolves manually linked products server-side', function (): void {
    $manualProduct = Product::factory()->create([
        'name' => 'Manual Pick',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    createFeaturedProductsPage(
        [
            'filter_mode' => 'manual',
            'title' => 'Our picks',
        ],
        [
            [
                'relation_type' => 'product',
                'relation_id' => $manualProduct->id,
                'relation_key' => 'products',
                'position' => 0,
            ],
        ],
    );

    $response = $this->getJson('/api/v1/pages/featured-products-test');

    $relations = $response->json('sections.0.blocks.0.relations');

    expect($relations)->toHaveCount(1)
        ->and($relations[0]['data']['name'])->toBe('Manual Pick');
});
