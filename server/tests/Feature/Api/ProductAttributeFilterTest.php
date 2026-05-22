<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantAttributeValue;

it('allows filtering products by variant attributes', function (): void {
    $package = Attribute::factory()->create([
        'name' => 'Package',
        'slug' => 'package',
        'is_filterable' => true,
    ]);
    $basic = AttributeValue::factory()->for($package)->create([
        'value' => 'Basic',
        'slug' => 'basic',
    ]);
    $mounted = AttributeValue::factory()->for($package)->create([
        'value' => 'Mounted',
        'slug' => 'mounted',
    ]);

    $matchingProduct = Product::factory()->create(['name' => 'Matching TV']);
    $matchingVariant = ProductVariant::factory()->for($matchingProduct)->create([
        'stock_quantity' => 5,
        'is_active' => true,
    ]);
    VariantAttributeValue::factory()->for($matchingVariant, 'variant')->for($package, 'attribute')->for($basic, 'attributeValue')->create();

    $otherProduct = Product::factory()->create(['name' => 'Other TV']);
    $otherVariant = ProductVariant::factory()->for($otherProduct)->create([
        'stock_quantity' => 5,
        'is_active' => true,
    ]);
    VariantAttributeValue::factory()->for($otherVariant, 'variant')->for($package, 'attribute')->for($mounted, 'attributeValue')->create();

    $this->getJson('/api/v1/products?filter[attributes][package]=basic')
        ->assertOk()
        ->assertJsonFragment(['slug' => $matchingProduct->slug])
        ->assertJsonMissing(['slug' => $otherProduct->slug]);
});
