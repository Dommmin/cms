<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Models\Store;

function createMapBlockPage(array $blockConfiguration): Page
{
    $page = Page::factory()->published()->create([
        'slug' => ['en' => 'map-block-test'],
        'title' => ['en' => 'Map Block Test'],
    ]);

    $section = PageSection::query()->create([
        'page_id' => $page->id,
        'section_type' => 'standard',
        'layout' => 'contained',
        'variant' => 'light',
        'position' => 0,
        'is_active' => true,
    ]);

    PageBlock::query()->create([
        'page_id' => $page->id,
        'section_id' => $section->id,
        'type' => 'map',
        'configuration' => $blockConfiguration,
        'position' => 0,
        'is_active' => true,
    ]);

    return $page;
}

it('hydrates store in relations for map block with store_id', function (): void {
    $store = Store::factory()->create([
        'name' => 'Downtown Store',
        'is_active' => true,
    ]);

    createMapBlockPage([
        'store_id' => $store->id,
        'title' => 'Find us',
        'zoom' => 14,
        'height' => 400,
    ]);

    $response = $this->getJson('/api/v1/pages/map-block-test');

    $response
        ->assertOk()
        ->assertJsonPath('sections.0.blocks.0.type', 'map');

    $relations = $response->json('sections.0.blocks.0.relations');

    expect($relations)->toHaveCount(1)
        ->and($relations[0]['relation_key'])->toBe('location')
        ->and($relations[0]['relation_type'])->toBe('store')
        ->and($relations[0]['data']['name'])->toBe('Downtown Store')
        ->and($relations[0]['data']['lat'])->toBeFloat()
        ->and($relations[0]['data']['lng'])->toBeFloat();
});

it('returns empty relations for map block with coordinates only', function (): void {
    createMapBlockPage([
        'lat' => 52.2297,
        'lng' => 21.0122,
        'title' => 'Office',
    ]);

    $response = $this->getJson('/api/v1/pages/map-block-test');

    $response->assertOk();

    expect($response->json('sections.0.blocks.0.relations'))->toBe([]);
});

it('returns empty relations when configured store does not exist', function (): void {
    createMapBlockPage([
        'store_id' => 999_999,
        'title' => 'Missing store',
    ]);

    $response = $this->getJson('/api/v1/pages/map-block-test');

    $response->assertOk();

    expect($response->json('sections.0.blocks.0.relations'))->toBe([]);
});
