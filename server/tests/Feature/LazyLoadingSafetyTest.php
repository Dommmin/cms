<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\Category;
use App\Models\CategoryAttributeSchema;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\TaxRate;

it('lists products with nested categories without lazy loading parent relations', function (): void {
    $attribute = Attribute::factory()->create([
        'name' => 'Material',
        'slug' => 'material',
    ]);

    $parent = Category::factory()->create([
        'is_active' => true,
        'name' => ['en' => 'Parent'],
        'slug' => ['en' => 'parent'],
    ]);
    $child = Category::factory()->create([
        'is_active' => true,
        'parent_id' => $parent->id,
        'name' => ['en' => 'Child'],
        'slug' => ['en' => 'child'],
    ]);

    CategoryAttributeSchema::factory()->for($parent)->create([
        'attribute_id' => $attribute->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $productType = ProductType::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $child->id,
        'product_type_id' => $productType->id,
        'name' => ['en' => 'Nested Category Product'],
        'slug' => ['en' => 'nested-category-product'],
        'is_active' => true,
        'is_saleable' => true,
    ]);

    ProductVariant::factory()->for($product)->create([
        'is_active' => true,
        'stock_quantity' => 4,
    ]);

    $this->getJson('/api/v1/products?page=1')
        ->assertOk()
        ->assertJsonFragment(['slug' => $product->slug]);
});

it('builds category breadcrumbs without preloading parent relations', function (): void {
    $parent = Category::factory()->create([
        'name' => ['en' => 'Parent'],
        'slug' => ['en' => 'parent'],
    ]);
    $child = Category::factory()->create([
        'parent_id' => $parent->id,
        'name' => ['en' => 'Child'],
        'slug' => ['en' => 'child'],
    ]);

    $breadcrumb = $child->fresh()->breadcrumb();

    expect(array_map(static fn (Category $category): int => $category->id, $breadcrumb))
        ->toBe([$parent->id, $child->id]);
});

it('builds localized page paths without preloading parent relations', function (): void {
    $parent = Page::factory()->published()->create([
        'title' => ['en' => 'Parent'],
        'slug' => ['en' => 'parent'],
        'locale' => null,
    ]);
    $child = Page::factory()->published()->create([
        'parent_id' => $parent->id,
        'title' => ['en' => 'Child'],
        'slug' => ['en' => 'child'],
        'locale' => null,
    ]);

    expect($child->fresh()->localizedPath('en'))->toBe('/parent/child');
});

it('resolves a variant tax rate without preloading the product category', function (): void {
    $taxRate = TaxRate::query()->create([
        'name' => 'Poland VAT',
        'rate' => 23,
        'country_code' => 'PL',
        'is_active' => true,
        'is_default' => false,
    ]);

    $productType = ProductType::factory()->create();
    $category = Category::factory()->create([
        'product_type_id' => $productType->id,
        'tax_rate_id' => $taxRate->id,
        'is_active' => true,
    ]);
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'product_type_id' => $productType->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->create([
        'tax_rate_id' => null,
    ]);

    expect($variant->fresh()->effectiveTaxRate()?->id)->toBe($taxRate->id);
});
