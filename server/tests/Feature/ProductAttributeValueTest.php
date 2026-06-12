<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\CategoryAttributeSchema;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\VariantAttributeValue;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

function productPayload(ProductType $productType, Category $category, array $attributeValues = []): array
{
    return [
        'name' => ['en' => 'Release 3 Product'],
        'slug' => ['en' => 'release-3-product'],
        'description' => ['en' => 'Core attribute payload'],
        'short_description' => ['en' => 'Core attributes'],
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
        'variant' => [
            'sku' => 'REL3-001',
            'name' => 'Default',
            'price' => 199.99,
            'cost_price' => 99.99,
            'compare_at_price' => 249.99,
            'weight' => 1.2,
            'stock_quantity' => 5,
            'stock_threshold' => 1,
            'is_active' => true,
        ],
        'attribute_values' => $attributeValues,
    ];
}

it('stores product-level core attribute values in admin flow', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);

    $material = Attribute::factory()->create(['name' => 'Material', 'slug' => 'material', 'type' => 'text']);
    $weight = Attribute::factory()->create(['name' => 'Weight', 'slug' => 'weight', 'type' => 'numeric', 'unit' => 'kg']);
    $wireless = Attribute::factory()->create(['name' => 'Wireless', 'slug' => 'wireless', 'type' => 'boolean']);
    $releaseDate = Attribute::factory()->create(['name' => 'Release Date', 'slug' => 'release-date', 'type' => 'date']);
    $finish = Attribute::factory()->create(['name' => 'Finish', 'slug' => 'finish', 'type' => 'color']);
    $size = Attribute::factory()->create(['name' => 'Size', 'slug' => 'size', 'type' => 'select']);
    $features = Attribute::factory()->create(['name' => 'Features', 'slug' => 'features', 'type' => 'multiselect']);

    $sizeLarge = AttributeValue::factory()->for($size)->create(['value' => 'Large', 'slug' => 'large']);
    $bluetooth = AttributeValue::factory()->for($features)->create(['value' => 'Bluetooth', 'slug' => 'bluetooth']);
    $wifi = AttributeValue::factory()->for($features)->create(['value' => 'Wi-Fi', 'slug' => 'wifi']);

    collect([$material, $weight, $wireless, $releaseDate, $finish, $size, $features])
        ->each(fn (Attribute $attribute, int $position) => CategoryAttributeSchema::factory()->for($category)->create([
            'attribute_id' => $attribute->id,
            'is_required' => in_array($attribute->slug, ['material', 'size'], true),
            'position' => $position,
        ]));

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.products.store'), productPayload($productType, $category, [
            ['attribute_id' => $material->id, 'value' => 'Oak'],
            ['attribute_id' => $weight->id, 'value' => '12.5'],
            ['attribute_id' => $wireless->id, 'value' => '1'],
            ['attribute_id' => $releaseDate->id, 'value' => '2026-06-12'],
            ['attribute_id' => $finish->id, 'value' => '#112233'],
            ['attribute_id' => $size->id, 'option_id' => $sizeLarge->id],
            ['attribute_id' => $features->id, 'option_ids' => [$bluetooth->id, $wifi->id]],
        ]))
        ->assertRedirect(route('admin.ecommerce.products.index'))
        ->assertSessionHasNoErrors();

    $product = Product::query()->where('slug->en', 'release-3-product')->firstOrFail();

    expect($product->defaultVariant()->exists())->toBeTrue()
        ->and($product->attributeValues()->count())->toBe(7);

    $this->assertDatabaseHas('product_attribute_values', [
        'product_id' => $product->id,
        'attribute_id' => $material->id,
        'value_text' => 'Oak',
    ]);
    $this->assertDatabaseHas('product_attribute_values', [
        'product_id' => $product->id,
        'attribute_id' => $size->id,
        'attribute_value_id' => $sizeLarge->id,
    ]);

    $multiselectValue = ProductAttributeValue::query()
        ->where('product_id', $product->id)
        ->where('attribute_id', $features->id)
        ->firstOrFail();

    expect($multiselectValue->value_json)->toBe([$bluetooth->id, $wifi->id]);
});

it('rejects products without required category attributes', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $requiredAttribute = Attribute::factory()->create([
        'name' => 'Material',
        'slug' => 'material',
        'type' => 'text',
    ]);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $requiredAttribute->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.products.store'), productPayload($productType, $category))
        ->assertSessionHasErrors(['attribute_values']);
});

it('rejects core attribute values with the wrong type', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $numericAttribute = Attribute::factory()->create([
        'name' => 'Weight',
        'slug' => 'weight',
        'type' => 'numeric',
    ]);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $numericAttribute->id,
        'is_required' => false,
        'position' => 0,
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.products.store'), productPayload($productType, $category, [
            ['attribute_id' => $numericAttribute->id, 'value' => 'heavy'],
        ]))
        ->assertSessionHasErrors(['attribute_values.0.value']);
});

it('accepts only allowed option values for select and multiselect attributes', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);

    $size = Attribute::factory()->create(['name' => 'Size', 'slug' => 'size', 'type' => 'select']);
    $features = Attribute::factory()->create(['name' => 'Features', 'slug' => 'features', 'type' => 'multiselect']);
    $other = Attribute::factory()->create(['name' => 'Other', 'slug' => 'other', 'type' => 'select']);

    $invalidSelectOption = AttributeValue::factory()->for($other)->create();
    $invalidMultiselectOption = AttributeValue::factory()->for($other)->create();

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $size->id,
        'is_required' => true,
        'position' => 0,
    ]);
    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $features->id,
        'is_required' => false,
        'position' => 1,
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.products.store'), productPayload($productType, $category, [
            ['attribute_id' => $size->id, 'option_id' => $invalidSelectOption->id],
            ['attribute_id' => $features->id, 'option_ids' => [$invalidMultiselectOption->id]],
        ]))
        ->assertSessionHasErrors([
            'attribute_values.0.option_id',
            'attribute_values.1.option_ids',
        ]);
});

it('does not inherit product attribute values from category schema', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $material = Attribute::factory()->create([
        'name' => 'Material',
        'slug' => 'material',
        'type' => 'text',
    ]);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $material->id,
        'is_required' => false,
        'position' => 0,
    ]);

    $product = Product::factory()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'slug' => ['en' => 'schema-without-values'],
        'is_active' => true,
        'is_saleable' => true,
    ]);
    ProductVariant::factory()->for($product)->default()->active()->create([
        'stock_quantity' => 3,
    ]);

    $this->getJson('/api/v1/products/schema-without-values')
        ->assertOk()
        ->assertJsonPath('attribute_values', []);
});

it('does not clear existing core attribute values when an update payload omits attribute_values', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $material = Attribute::factory()->create([
        'name' => 'Material',
        'slug' => 'material',
        'type' => 'text',
    ]);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $material->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $product = Product::factory()->create([
        'name' => ['en' => 'Existing Product'],
        'slug' => ['en' => 'existing-product'],
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->default()->active()->create([
        'sku' => 'REL3-UPDATE-001',
        'stock_quantity' => 3,
    ]);
    ProductAttributeValue::query()->create([
        'product_id' => $product->id,
        'attribute_id' => $material->id,
        'value_text' => 'Oak',
    ]);

    $payload = productPayload($productType, $category);
    $payload['name'] = ['en' => 'Existing Product Updated'];
    $payload['slug'] = ['en' => 'existing-product'];
    $payload['variant']['id'] = $variant->id;
    unset($payload['attribute_values']);

    $this->actingAs($this->admin)
        ->put(route('admin.ecommerce.products.update', $product), $payload)
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('product_attribute_values', [
        'product_id' => $product->id,
        'attribute_id' => $material->id,
        'value_text' => 'Oak',
    ]);
});

it('returns product attribute_values in product detail api and keeps legacy variant attributes', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => true]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $material = Attribute::factory()->create(['name' => 'Material', 'slug' => 'material', 'type' => 'text']);
    $connectivity = Attribute::factory()->create(['name' => 'Connectivity', 'slug' => 'connectivity', 'type' => 'multiselect']);
    $wireless = Attribute::factory()->create(['name' => 'Wireless', 'slug' => 'wireless', 'type' => 'boolean']);
    $color = Attribute::factory()->create(['name' => 'Color', 'slug' => 'color', 'type' => 'color']);

    $wifi = AttributeValue::factory()->for($connectivity)->create(['value' => 'Wi-Fi', 'slug' => 'wifi']);
    $bluetooth = AttributeValue::factory()->for($connectivity)->create(['value' => 'Bluetooth', 'slug' => 'bluetooth']);
    $red = AttributeValue::factory()->for($color)->create(['value' => 'Red', 'slug' => 'red', 'color_hex' => '#ff0000']);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $material->id,
        'is_required' => true,
        'position' => 0,
    ]);
    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $connectivity->id,
        'is_required' => false,
        'position' => 1,
    ]);
    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $wireless->id,
        'is_required' => false,
        'position' => 2,
    ]);

    $product = Product::factory()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'slug' => ['en' => 'detail-core-attributes'],
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->default()->active()->create([
        'stock_quantity' => 3,
    ]);

    ProductAttributeValue::query()->create([
        'product_id' => $product->id,
        'attribute_id' => $material->id,
        'value_text' => 'Aluminium',
    ]);
    ProductAttributeValue::query()->create([
        'product_id' => $product->id,
        'attribute_id' => $connectivity->id,
        'value_json' => [$wifi->id, $bluetooth->id],
    ]);
    ProductAttributeValue::query()->create([
        'product_id' => $product->id,
        'attribute_id' => $wireless->id,
        'value_boolean' => false,
    ]);

    VariantAttributeValue::factory()
        ->for($variant, 'variant')
        ->for($color, 'attribute')
        ->for($red, 'attributeValue')
        ->create();

    $this->getJson('/api/v1/products/detail-core-attributes')
        ->assertOk()
        ->assertJsonPath('attributes', [])
        ->assertJsonPath('attribute_values.0.slug', 'material')
        ->assertJsonPath('attribute_values.0.display_value', 'Aluminium')
        ->assertJsonPath('attribute_values.1.slug', 'connectivity')
        ->assertJsonPath('attribute_values.1.value.0', 'wifi')
        ->assertJsonPath('attribute_values.2.slug', 'wireless')
        ->assertJsonPath('attribute_values.2.display_value', false)
        ->assertJsonPath('attribute_summary.wireless.value', 'false')
        ->assertJsonPath('variant_options.0.slug', 'color')
        ->assertJsonPath('variant_options.0.label', 'Color')
        ->assertJsonPath('variant_options.0.values.0', 'Red')
        ->assertJsonPath('variants.0.attributes.Color', 'Red');
});

it('keeps products with core attributes compatible with cart and default variant flow', function (): void {
    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $material = Attribute::factory()->create(['name' => 'Material', 'slug' => 'material', 'type' => 'text']);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $material->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $product = Product::factory()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'slug' => ['en' => 'cart-core-attributes'],
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->default()->active()->create([
        'stock_quantity' => 10,
    ]);
    ProductAttributeValue::query()->create([
        'product_id' => $product->id,
        'attribute_id' => $material->id,
        'value_text' => 'Steel',
    ]);

    expect($product->defaultVariant()->first()?->id)->toBe($variant->id);

    $this->postJson('/api/v1/cart/items', [
        'variant_id' => $variant->id,
        'quantity' => 1,
    ])->assertOk()
        ->assertJsonPath('items_count', 1);
});

it('keeps compare endpoint compatible when products do not have product-level attributes', function (): void {
    $color = Attribute::factory()->create([
        'name' => 'Color',
        'slug' => 'color',
    ]);
    $red = AttributeValue::factory()->for($color)->create([
        'value' => 'Red',
        'slug' => 'red',
    ]);
    $blue = AttributeValue::factory()->for($color)->create([
        'value' => 'Blue',
        'slug' => 'blue',
    ]);

    $firstProduct = Product::factory()->create([
        'slug' => ['en' => 'compare-first'],
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $firstVariant = ProductVariant::factory()->for($firstProduct)->default()->active()->create();
    VariantAttributeValue::factory()
        ->for($firstVariant, 'variant')
        ->for($color, 'attribute')
        ->for($red, 'attributeValue')
        ->create();

    $secondProduct = Product::factory()->create([
        'slug' => ['en' => 'compare-second'],
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $secondVariant = ProductVariant::factory()->for($secondProduct)->default()->active()->create();
    VariantAttributeValue::factory()
        ->for($secondVariant, 'variant')
        ->for($color, 'attribute')
        ->for($blue, 'attributeValue')
        ->create();

    $this->getJson(sprintf(
        '/api/v1/products/compare?ids[0]=%d&ids[1]=%d',
        $firstProduct->id,
        $secondProduct->id,
    ))
        ->assertOk()
        ->assertJsonPath('meta.attribute_keys.0', 'Color')
        ->assertJsonPath('data.0.attribute_map.Color.0', 'Red')
        ->assertJsonPath('data.1.attribute_map.Color.0', 'Blue');
});
