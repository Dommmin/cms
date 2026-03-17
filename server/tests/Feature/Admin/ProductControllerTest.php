<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFlag;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('displays product edit page with default variant', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category A',
        'slug' => 'category-a',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'name' => 'Example Product',
        'slug' => 'example-product',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $defaultVariant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'EXAMPLE-1',
        'name' => 'Default',
        'price' => 1999,
        'cost_price' => 1200,
        'stock_quantity' => 10,
        'stock_threshold' => 2,
        'is_active' => true,
        'is_default' => true,
        'position' => 0,
    ]);

    $response = $this->get("/admin/ecommerce/products/{$product->id}/edit");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/ecommerce/products/edit')
            ->where('product.id', $product->id)
            ->where('product.variant.id', $defaultVariant->id)
        );
});

it('displays product edit page when product has related categories', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-related-categories',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $mainCategory = Category::query()->create([
        'name' => 'Main Category',
        'slug' => 'main-category',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $relatedCategory = Category::query()->create([
        'name' => 'Related Category',
        'slug' => 'related-category',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $mainCategory->id,
        'name' => 'Product With Categories',
        'slug' => 'product-with-categories',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $product->categories()->sync([$mainCategory->id, $relatedCategory->id]);

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'PWC-1',
        'name' => 'Default',
        'price' => 1999,
        'cost_price' => 1200,
        'stock_quantity' => 10,
        'stock_threshold' => 2,
        'is_active' => true,
        'is_default' => true,
        'position' => 0,
    ]);

    $this->get("/admin/ecommerce/products/{$product->id}/edit")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/ecommerce/products/edit')
            ->where('product.id', $product->id)
            ->has('product.categories', 2)
        );
});

it('does not allow product show route via get', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-two',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category B',
        'slug' => 'category-b',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'name' => 'Another Product',
        'slug' => 'another-product',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $this->get("/admin/ecommerce/products/{$product->id}")
        ->assertRedirect("/admin/ecommerce/products/{$product->id}/edit");
});

it('stores product with decimal prices and selected images', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-store',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category C',
        'slug' => 'category-c',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $media = Media::query()->create([
        'model_type' => Product::class,
        'model_id' => 0,
        'collection_name' => 'product-images',
        'name' => 'test-image',
        'file_name' => 'test-image.jpg',
        'mime_type' => 'image/jpeg',
        'disk' => 'public',
        'conversions_disk' => 'public',
        'size' => 1024,
        'manipulations' => [],
        'custom_properties' => [],
        'generated_conversions' => [],
        'responsive_images' => [],
    ]);

    $response = $this->post('/admin/ecommerce/products', [
        'name' => ['en' => 'Created Product'],
        'slug' => 'created-product',
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => '0',
        'is_saleable' => '0',
        'variant' => [
            'sku' => 'CREATED-1',
            'price' => '99.99',
            'cost_price' => '44.50',
            'stock_quantity' => 12,
            'stock_threshold' => 3,
            'is_active' => '0',
        ],
        'images' => [
            [
                'media_id' => $media->id,
                'is_thumbnail' => '1',
                'position' => 0,
            ],
        ],
    ]);

    $response->assertRedirect('/admin/ecommerce/products')
        ->assertSessionHas('success', 'Product created successfully.');

    $product = Product::query()->where('slug', 'created-product')->firstOrFail();
    $variant = ProductVariant::query()->where('product_id', $product->id)->firstOrFail();

    expect($product->is_active)->toBeFalse()
        ->and($product->is_saleable)->toBeFalse()
        ->and($variant->price)->toBe(9999)
        ->and($variant->cost_price)->toBe(4450)
        ->and($variant->is_active)->toBeFalse();

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'media_id' => $media->id,
        'is_thumbnail' => true,
    ]);
});

it('updates product booleans and converts decimal price values to cents', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-update',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category D',
        'slug' => 'category-d',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'name' => 'Update Product',
        'slug' => 'update-product',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'UPDATE-1',
        'name' => 'Default',
        'price' => 1000,
        'cost_price' => 500,
        'stock_quantity' => 10,
        'stock_threshold' => 2,
        'is_active' => true,
        'is_default' => true,
        'position' => 0,
    ]);

    $response = $this->put("/admin/ecommerce/products/{$product->id}", [
        'name' => ['en' => 'Update Product'],
        'slug' => 'update-product',
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => '0',
        'is_saleable' => '0',
        'variant' => [
            'id' => $variant->id,
            'sku' => 'UPDATE-1',
            'price' => '149.90',
            'cost_price' => '80.00',
            'stock_quantity' => 7,
            'stock_threshold' => 1,
            'is_active' => '0',
        ],
        'images' => [],
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Product updated successfully.');

    $product->refresh();
    $variant->refresh();

    expect($product->is_active)->toBeFalse()
        ->and($product->is_saleable)->toBeFalse()
        ->and($variant->price)->toBe(14990)
        ->and($variant->cost_price)->toBe(8000)
        ->and($variant->is_active)->toBeFalse();
});

it('shows default variant price on product index list', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-index',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category E',
        'slug' => 'category-e',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $product = Product::query()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'name' => 'Indexed Product',
        'slug' => 'indexed-product',
        'is_active' => true,
        'is_saleable' => true,
    ]);

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'INDEX-1',
        'name' => 'Default',
        'price' => 3456,
        'cost_price' => 2100,
        'stock_quantity' => 6,
        'stock_threshold' => 2,
        'is_active' => true,
        'is_default' => true,
        'position' => 0,
    ]);

    $this->get('/admin/ecommerce/products')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/ecommerce/products/index')
            ->where('products.data.0.price', 3456)
        );
});

it('creates product with auto-generated slug from name when slug is not provided', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-auto-slug',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category Auto',
        'slug' => 'category-auto',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $response = $this->post('/admin/ecommerce/products', [
        'name' => ['en' => 'Mój Produkt Testowy'],
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'variant' => [
            'sku' => 'AUTO-SLUG-1',
            'price' => '10.00',
            'stock_quantity' => 1,
            'stock_threshold' => 1,
            'is_active' => '1',
        ],
    ]);

    $response->assertRedirect('/admin/ecommerce/products');

    $this->assertDatabaseHas('products', [
        'name->en' => 'Mój Produkt Testowy',
        'slug' => 'moj-produkt-testowy',
    ]);
});

it('stores and updates product brand and flags assignments', function () {
    $productType = ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple-brand-flags',
        'has_variants' => false,
        'variant_selection_attributes' => [],
        'is_shippable' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Category Flags',
        'slug' => 'category-flags',
        'product_type_id' => $productType->id,
        'is_active' => true,
    ]);

    $brandA = Brand::query()->create([
        'name' => 'Brand A',
        'slug' => 'brand-a',
        'is_active' => true,
    ]);

    $brandB = Brand::query()->create([
        'name' => 'Brand B',
        'slug' => 'brand-b',
        'is_active' => true,
    ]);

    $flagA = ProductFlag::query()->create([
        'name' => 'New',
        'slug' => 'new',
        'color' => '#111111',
        'is_active' => true,
        'position' => 1,
    ]);

    $flagB = ProductFlag::query()->create([
        'name' => 'Hot',
        'slug' => 'hot',
        'color' => '#222222',
        'is_active' => true,
        'position' => 2,
    ]);

    $storeResponse = $this->post('/admin/ecommerce/products', [
        'name' => ['en' => 'Flagged Product'],
        'slug' => 'flagged-product',
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'brand_id' => $brandA->id,
        'flags' => [$flagA->id],
        'variant' => [
            'sku' => 'FLAGGED-1',
            'price' => '10.00',
            'stock_quantity' => 2,
            'stock_threshold' => 1,
            'is_active' => '1',
        ],
    ]);

    $storeResponse->assertRedirect('/admin/ecommerce/products');

    $product = Product::query()->where('slug', 'flagged-product')->firstOrFail();

    expect($product->brand_id)->toBe($brandA->id);
    $this->assertDatabaseHas('product_flag_product', [
        'product_id' => $product->id,
        'product_flag_id' => $flagA->id,
    ]);

    $updateResponse = $this->put("/admin/ecommerce/products/{$product->id}", [
        'name' => ['en' => 'Flagged Product'],
        'slug' => 'flagged-product',
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'brand_id' => $brandB->id,
        'flags' => [$flagB->id],
        'variant' => [
            'id' => $product->defaultVariant()->firstOrFail()->id,
            'sku' => 'FLAGGED-1',
            'price' => '12.00',
            'stock_quantity' => 4,
            'stock_threshold' => 1,
            'is_active' => '1',
        ],
        'images' => [],
    ]);

    $updateResponse->assertRedirect();
    $product->refresh();

    expect($product->brand_id)->toBe($brandB->id);
    $this->assertDatabaseHas('product_flag_product', [
        'product_id' => $product->id,
        'product_flag_id' => $flagB->id,
    ]);
    $this->assertDatabaseMissing('product_flag_product', [
        'product_id' => $product->id,
        'product_flag_id' => $flagA->id,
    ]);
});
