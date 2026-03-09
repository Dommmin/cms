<?php

declare(strict_types=1);

use App\Enums\AttributeTypeEnum;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductTypeAttribute;
use App\Models\ProductVariant;
use App\Models\TaxRate;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('stores a variant with decimal price values and attribute value selections', function () {
    $productType = ProductType::query()->create([
        'name' => 'Shirt',
        'slug' => 'shirt',
        'has_variants' => true,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $sizeAttribute = Attribute::query()->create([
        'name' => 'Size',
        'slug' => 'size',
        'type' => AttributeTypeEnum::SELECT,
        'is_variant_selection' => true,
    ]);

    ProductTypeAttribute::query()->create([
        'product_type_id' => $productType->id,
        'attribute_id' => $sizeAttribute->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $sizeM = AttributeValue::query()->create([
        'attribute_id' => $sizeAttribute->id,
        'value' => 'M',
        'slug' => 'm',
        'position' => 0,
    ]);

    $sizeL = AttributeValue::query()->create([
        'attribute_id' => $sizeAttribute->id,
        'value' => 'L',
        'slug' => 'l',
        'position' => 1,
    ]);

    $taxRate = TaxRate::query()->create([
        'name' => 'VAT 23%',
        'rate' => 23,
        'country_code' => 'PL',
        'is_active' => true,
        'is_default' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'T-shirts',
        'slug' => 't-shirts',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'name' => 'Product with variants',
        'slug' => 'product-with-variants',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $response = $this->post("/admin/ecommerce/products/{$product->id}/variants", [
        'sku' => 'TSHIRT-M',
        'name' => 'T-shirt M',
        'price' => '129.99',
        'cost_price' => '80.10',
        'compare_at_price' => '159.00',
        'stock_quantity' => 8,
        'stock_threshold' => 2,
        'tax_rate_id' => $taxRate->id,
        'is_active' => '1',
        'is_default' => '1',
        'attribute_values' => ['', (string) $sizeM->id, (string) $sizeL->id],
    ]);

    $response->assertRedirect("/admin/ecommerce/products/{$product->id}/variants")
        ->assertSessionHas('success', 'Wariant produktu został utworzony');

    $variant = ProductVariant::query()->where('sku', 'TSHIRT-M')->firstOrFail();

    expect($variant->price)->toBe(12999)
        ->and($variant->cost_price)->toBe(8010)
        ->and($variant->compare_at_price)->toBe(15900)
        ->and($variant->tax_rate_id)->toBe($taxRate->id)
        ->and($variant->is_default)->toBeTrue();

    $this->assertDatabaseHas('variant_attribute_values', [
        'variant_id' => $variant->id,
        'attribute_id' => $sizeAttribute->id,
        'attribute_value_id' => $sizeM->id,
    ]);

    $this->assertDatabaseMissing('variant_attribute_values', [
        'variant_id' => $variant->id,
        'attribute_id' => $sizeAttribute->id,
        'attribute_value_id' => $sizeL->id,
    ]);
});

it('updates variant prices and re-syncs attribute values', function () {
    $productType = ProductType::query()->create([
        'name' => 'Shoes',
        'slug' => 'shoes',
        'has_variants' => true,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $sizeAttribute = Attribute::query()->create([
        'name' => 'Size',
        'slug' => 'shoe-size',
        'type' => AttributeTypeEnum::SELECT,
        'is_variant_selection' => true,
    ]);

    ProductTypeAttribute::query()->create([
        'product_type_id' => $productType->id,
        'attribute_id' => $sizeAttribute->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $size42 = AttributeValue::query()->create([
        'attribute_id' => $sizeAttribute->id,
        'value' => '42',
        'slug' => '42',
        'position' => 0,
    ]);

    $size43 = AttributeValue::query()->create([
        'attribute_id' => $sizeAttribute->id,
        'value' => '43',
        'slug' => '43',
        'position' => 1,
    ]);

    $category = Category::query()->create([
        'name' => 'Shoes category',
        'slug' => 'shoes-category',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'name' => 'Runner',
        'slug' => 'runner',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'RUN-42',
        'name' => 'Runner 42',
        'price' => 20000,
        'cost_price' => 12000,
        'stock_quantity' => 10,
        'stock_threshold' => 2,
        'is_active' => true,
        'is_default' => false,
        'position' => 0,
    ]);

    $this->assertDatabaseCount('variant_attribute_values', 0);

    $this->put("/admin/ecommerce/products/{$product->id}/variants/{$variant->id}", [
        'sku' => 'RUN-43',
        'name' => 'Runner 43',
        'price' => '219.50',
        'cost_price' => '130.25',
        'compare_at_price' => '249.00',
        'stock_quantity' => 7,
        'stock_threshold' => 1,
        'is_active' => '1',
        'is_default' => '1',
        'attribute_values' => ['', (string) $size43->id],
    ])->assertRedirect()
        ->assertSessionHas('success', 'Wariant produktu został zaktualizowany');

    $variant->refresh();

    expect($variant->sku)->toBe('RUN-43')
        ->and($variant->name)->toBe('Runner 43')
        ->and($variant->price)->toBe(21950)
        ->and($variant->cost_price)->toBe(13025)
        ->and($variant->compare_at_price)->toBe(24900)
        ->and($variant->is_default)->toBeTrue();

    $this->assertDatabaseHas('variant_attribute_values', [
        'variant_id' => $variant->id,
        'attribute_id' => $sizeAttribute->id,
        'attribute_value_id' => $size43->id,
    ]);

    $this->assertDatabaseMissing('variant_attribute_values', [
        'variant_id' => $variant->id,
        'attribute_id' => $sizeAttribute->id,
        'attribute_value_id' => $size42->id,
    ]);
});
