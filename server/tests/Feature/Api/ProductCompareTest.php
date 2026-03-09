<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ProductType;

it('returns comparison data for 2 to 4 products of same product type', function () {
    $type = ProductType::factory()->create();
    $products = Product::factory()->count(2)->create(['product_type_id' => $type->id]);

    $ids = $products->pluck('id')->all();

    $this->get(route('api.v1.products.compare', ['ids' => $ids]))
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'slug', 'price_min', 'price_max', 'variants'],
            ],
        ]);
});

it('returns 422 when fewer than 2 product ids provided', function () {
    $product = Product::factory()->create();

    $this->get(route('api.v1.products.compare', ['ids' => [$product->id]]))
        ->assertStatus(422)
        ->assertJsonPath('message', 'You must provide between 2 and 4 product IDs to compare.');
});

it('returns 422 when more than 4 product ids provided', function () {
    $type = ProductType::factory()->create();
    $ids = Product::factory()->count(5)->create(['product_type_id' => $type->id])->pluck('id')->all();

    $this->get(route('api.v1.products.compare', ['ids' => $ids]))
        ->assertStatus(422);
});

it('returns 422 when products have different product types', function () {
    $type1 = ProductType::factory()->create();
    $type2 = ProductType::factory()->create();

    $product1 = Product::factory()->create(['product_type_id' => $type1->id]);
    $product2 = Product::factory()->create(['product_type_id' => $type2->id]);

    $this->get(route('api.v1.products.compare', ['ids' => [$product1->id, $product2->id]]))
        ->assertStatus(422)
        ->assertJsonPath('message', 'All products must be of the same product type for comparison.');
});

it('returns 404 when no products found', function () {
    $this->get(route('api.v1.products.compare', ['ids' => [99999, 99998]]))
        ->assertStatus(404);
});

it('only returns active products in comparison', function () {
    $type = ProductType::factory()->create();
    $active = Product::factory()->create(['product_type_id' => $type->id, 'is_active' => true]);
    $inactive = Product::factory()->create(['product_type_id' => $type->id, 'is_active' => false]);

    $response = $this->get(route('api.v1.products.compare', ['ids' => [$active->id, $inactive->id]]));

    // Only one active product found → not enough for comparison
    $response->assertStatus(404);
});
