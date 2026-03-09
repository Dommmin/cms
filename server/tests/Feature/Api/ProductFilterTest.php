<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

function createAvailableProduct(string $name, int $priceInCents): Product
{
    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'test-cat'],
        ['name' => 'Test Cat', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => $name,
        'slug' => Str::slug($name).'-'.Str::random(4),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'SKU-'.Str::random(6),
        'name' => 'Default',
        'price' => $priceInCents,
        'stock_quantity' => 10,
    ]);

    return $product;
}

it('filters products by name', function () {
    createAvailableProduct('Blue Shirt', 2000);
    createAvailableProduct('Red Pants', 3500);

    $response = $this->getJson('/api/v1/products?filter[name]=shirt');

    $response->assertSuccessful();
    $data = $response->json('data');
    expect($data)->toHaveCount(1);
    expect($data[0]['name'])->toBe('Blue Shirt');
});

it('filters products by min_price', function () {
    createAvailableProduct('Cheap Item', 500);   // $5.00
    createAvailableProduct('Expensive Item', 5000); // $50.00

    $response = $this->getJson('/api/v1/products?filter[min_price]=20');

    $response->assertSuccessful();
    $data = $response->json('data');
    $names = array_column($data, 'name');
    expect($names)->toContain('Expensive Item');
    expect($names)->not->toContain('Cheap Item');
});

it('filters products by max_price', function () {
    createAvailableProduct('Budget Item', 1000);   // $10.00
    createAvailableProduct('Premium Item', 10000); // $100.00

    $response = $this->getJson('/api/v1/products?filter[max_price]=15');

    $response->assertSuccessful();
    $data = $response->json('data');
    $names = array_column($data, 'name');
    expect($names)->toContain('Budget Item');
    expect($names)->not->toContain('Premium Item');
});

it('sorts products by name ascending by default', function () {
    createAvailableProduct('Zebra Product', 1000);
    createAvailableProduct('Apple Product', 1000);

    $response = $this->getJson('/api/v1/products');

    $response->assertSuccessful();
    $data = $response->json('data');
    $names = array_column($data, 'name');

    $sortedNames = $names;
    sort($sortedNames);
    expect($names)->toBe($sortedNames);
});

it('sorts products by name descending', function () {
    createAvailableProduct('Zebra Item', 1000);
    createAvailableProduct('Apple Item', 1000);

    $response = $this->getJson('/api/v1/products?sort=-name');

    $response->assertSuccessful();
    $data = $response->json('data');
    $names = array_column($data, 'name');

    $sortedNames = $names;
    rsort($sortedNames);
    expect($names)->toBe($sortedNames);
});
