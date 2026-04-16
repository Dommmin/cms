<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

function makeVariantForBackorder(array $attributes = []): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple-bo'],
        ['name' => 'Simple BO', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'backorder-test-cat'],
        ['name' => 'Backorder Test', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Product '.Str::random(4),
        'slug' => 'prod-bo-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create(array_merge([
        'product_id' => $product->id,
        'sku' => 'SKU-BO-'.Str::random(6),
        'name' => 'Default',
        'price' => 2000,
        'stock_quantity' => 0,
        'is_active' => true,
    ], $attributes));
}

describe('ProductVariant backorder & pre-order', function (): void {
    it('defaults to in_stock status and backorder_allowed false', function (): void {
        $variant = makeVariantForBackorder(['stock_quantity' => 10]);

        $fresh = $variant->fresh();

        expect($fresh->stock_status)->toBe('in_stock')
            ->and($fresh->backorder_allowed)->toBeFalse()
            ->and($fresh->available_at)->toBeNull();
    });

    it('isInStock returns true when stock_quantity > 0', function (): void {
        $variant = makeVariantForBackorder(['stock_quantity' => 5]);

        expect($variant->isInStock())->toBeTrue();
    });

    it('isInStock returns false when out of stock and backorder disabled', function (): void {
        $variant = makeVariantForBackorder([
            'stock_quantity' => 0,
            'backorder_allowed' => false,
        ]);

        expect($variant->isInStock())->toBeFalse();
    });

    it('isInStock returns true when backorder_allowed even with zero stock', function (): void {
        $variant = makeVariantForBackorder([
            'stock_quantity' => 0,
            'backorder_allowed' => true,
        ]);

        expect($variant->isInStock())->toBeTrue();
    });

    it('getStockStatusLabel returns in_stock when quantity > 0', function (): void {
        $variant = makeVariantForBackorder(['stock_quantity' => 3]);

        expect($variant->getStockStatusLabel())->toBe('in_stock');
    });

    it('getStockStatusLabel returns out_of_stock when qty 0 and no backorder or pre_order', function (): void {
        $variant = makeVariantForBackorder([
            'stock_quantity' => 0,
            'stock_status' => 'out_of_stock',
            'backorder_allowed' => false,
        ]);

        expect($variant->getStockStatusLabel())->toBe('out_of_stock');
    });

    it('getStockStatusLabel returns backorder when qty 0 and backorder_allowed', function (): void {
        $variant = makeVariantForBackorder([
            'stock_quantity' => 0,
            'backorder_allowed' => true,
        ]);

        expect($variant->getStockStatusLabel())->toBe('backorder');
    });

    it('getStockStatusLabel returns pre_order when stock_status is pre_order and qty 0', function (): void {
        $variant = makeVariantForBackorder([
            'stock_quantity' => 0,
            'stock_status' => 'pre_order',
            'backorder_allowed' => false,
        ]);

        expect($variant->getStockStatusLabel())->toBe('pre_order');
    });

    it('can store available_at for pre-order variants', function (): void {
        $availableAt = now()->addDays(30);

        $variant = makeVariantForBackorder([
            'stock_status' => 'pre_order',
            'available_at' => $availableAt,
        ]);

        expect($variant->available_at)->not->toBeNull()
            ->and($variant->available_at->format('Y-m-d'))->toBe($availableAt->format('Y-m-d'));
    });

    it('persists backorder and pre_order fields to database', function (): void {
        $variant = makeVariantForBackorder([
            'stock_status' => 'backorder',
            'backorder_allowed' => true,
        ]);

        $this->assertDatabaseHas('product_variants', [
            'id' => $variant->id,
            'stock_status' => 'backorder',
            'backorder_allowed' => true,
        ]);
    });
});
