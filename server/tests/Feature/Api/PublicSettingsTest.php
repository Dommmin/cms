<?php

declare(strict_types=1);

use App\Models\GlobalSlot;
use App\Models\Product;
use App\Models\ReusableBlock;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    // Enable ecommerce modules for resolving products
    Config::set('modules.ecommerce', true);

    // Create a product
    $this->product = Product::factory()->create([
        'name' => 'Premium Shirt',
        'slug' => 'premium-shirt',
        'is_active' => true,
    ]);

    // Create a ReusableBlock referencing this product in relations_config
    $this->block = ReusableBlock::query()->create([
        'name' => 'Featured Product Block',
        'type' => 'featured_products',
        'configuration' => [
            'title' => 'Top Picks',
        ],
        'relations_config' => [
            [
                'relation_type' => 'product',
                'relation_id' => $this->product->id,
                'relation_key' => 'products',
                'position' => 0,
                'metadata' => null,
            ],
        ],
        'is_active' => true,
    ]);
});

it('includes active global slots grouped by location in public settings api', function (): void {
    // Create some active and inactive slots
    $slot1 = GlobalSlot::query()->create([
        'location' => 'announcement_bar',
        'label' => 'Banner 1',
        'reusable_block_id' => null,
        'configuration' => ['html' => '<p>Promo</p>'],
        'is_active' => true,
        'position' => 0,
        'settings' => ['bg_color' => '#000000'],
    ]);

    $slot2 = GlobalSlot::query()->create([
        'location' => 'trust_bar',
        'label' => 'Trust badges',
        'reusable_block_id' => $this->block->id,
        'is_active' => true,
        'position' => 0,
        'settings' => ['padding' => 'md'],
    ]);

    $inactiveSlot = GlobalSlot::query()->create([
        'location' => 'trust_bar',
        'label' => 'Hidden Badges',
        'reusable_block_id' => null,
        'is_active' => false,
        'position' => 1,
    ]);

    $response = $this->getJson('/api/v1/settings/public')
        ->assertOk()
        ->assertJsonStructure([
            'settings',
            'modules',
            'legal',
            'theme',
            'slots' => [
                'announcement_bar',
                'trust_bar',
            ],
        ]);

    $slots = $response->json('slots');

    // Announcement bar slot assertions
    expect($slots['announcement_bar'])->toHaveCount(1)
        ->and($slots['announcement_bar'][0]['label'])->toBe('Banner 1')
        ->and($slots['announcement_bar'][0]['block_type'])->toBe('custom_html')
        ->and($slots['announcement_bar'][0]['configuration']['html'])->toBe('<p>Promo</p>')
        ->and($slots['announcement_bar'][0]['settings']['bg_color'])->toBe('#000000');

    // Trust bar slot assertions with resolved relations
    expect($slots['trust_bar'])->toHaveCount(1)
        ->and($slots['trust_bar'][0]['label'])->toBe('Trust badges')
        ->and($slots['trust_bar'][0]['block_type'])->toBe('featured_products')
        ->and($slots['trust_bar'][0]['configuration']['title'])->toBe('Top Picks');

    $relations = $slots['trust_bar'][0]['relations'];
    expect($relations)->toHaveCount(1)
        ->and($relations[0]['relation_type'])->toBe('product')
        ->and($relations[0]['relation_id'])->toBe($this->product->id)
        ->and($relations[0]['data']['name'])->toBe('Premium Shirt')
        ->and($relations[0]['data']['slug'])->toBe('premium-shirt');
});
