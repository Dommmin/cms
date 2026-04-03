<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

function makeVariantWithBarcode(array $attributes = []): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'barcode-test-cat'],
        ['name' => 'Barcode Test', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Product '.Str::random(4),
        'slug' => 'prod-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create(array_merge([
        'product_id' => $product->id,
        'sku' => 'SKU-'.Str::random(6),
        'name' => 'Default',
        'price' => 2000,
        'stock_quantity' => 10,
        'is_active' => true,
    ], $attributes));
}

describe('Product Variant Barcode/EAN/UPC', function (): void {
    it('can create a variant with barcode', function (): void {
        $variant = makeVariantWithBarcode([
            'barcode' => '1234567890128',
            'ean' => '5901234123457',
            'upc' => '012345678905',
        ]);

        expect($variant->barcode)->toBe('1234567890128')
            ->and($variant->ean)->toBe('5901234123457')
            ->and($variant->upc)->toBe('012345678905');
    });

    it('allows null barcode fields', function (): void {
        $variant = makeVariantWithBarcode([
            'barcode' => null,
            'ean' => null,
            'upc' => null,
        ]);

        expect($variant->barcode)->toBeNull()
            ->and($variant->ean)->toBeNull()
            ->and($variant->upc)->toBeNull();
    });

    it('barcode fields are stored in database', function (): void {
        makeVariantWithBarcode(['barcode' => 'BARCODE-UNIQUE-123']);
        makeVariantWithBarcode(['ean' => 'EAN-UNIQUE-456']);
        makeVariantWithBarcode(['upc' => 'UPC-UNIQUE-789']);

        $this->assertDatabaseHas('product_variants', ['barcode' => 'BARCODE-UNIQUE-123']);
        $this->assertDatabaseHas('product_variants', ['ean' => 'EAN-UNIQUE-456']);
        $this->assertDatabaseHas('product_variants', ['upc' => 'UPC-UNIQUE-789']);
    });

    it('can update variant barcode fields', function (): void {
        $variant = makeVariantWithBarcode();

        $variant->update([
            'barcode' => 'NEW-BARCODE-999',
            'ean' => '9999999999999',
            'upc' => '123456789012',
        ]);

        expect($variant->fresh()->barcode)->toBe('NEW-BARCODE-999')
            ->and($variant->fresh()->ean)->toBe('9999999999999')
            ->and($variant->fresh()->upc)->toBe('123456789012');
    });
});
