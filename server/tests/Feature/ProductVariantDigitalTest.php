<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductDownload;
use App\Models\ProductDownloadLink;
use App\Models\ProductType;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

function makeDigitalVariant(array $attributes = []): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'digital'],
        ['name' => 'Digital', 'has_variants' => false, 'is_shippable' => false]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'digital-test-cat'],
        ['name' => 'Digital Test', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Digital Product '.Str::random(4),
        'slug' => 'digital-prod-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create(array_merge([
        'product_id' => $product->id,
        'sku' => 'DIG-'.Str::random(6),
        'name' => 'Digital Item',
        'price' => 2999,
        'stock_quantity' => 0,
        'is_active' => true,
        'is_digital' => true,
        'download_limit' => 3,
        'download_expiry_days' => 30,
    ], $attributes));
}

describe('Product Variant Digital Fields', function (): void {
    it('can create a digital product variant', function (): void {
        $variant = makeDigitalVariant();

        expect($variant->is_digital)->toBeTrue()
            ->and($variant->download_limit)->toBe(3)
            ->and($variant->download_expiry_days)->toBe(30)
            ->and($variant->isDigital())->toBeTrue();
    });

    it('can create a physical product variant', function (): void {
        $type = ProductType::query()->firstOrCreate(
            ['slug' => 'physical'],
            ['name' => 'Physical', 'has_variants' => false, 'is_shippable' => true]
        );

        $cat = Category::query()->firstOrCreate(
            ['slug' => 'physical-test-cat'],
            ['name' => 'Physical Test', 'is_active' => true]
        );

        $product = Product::query()->create([
            'name' => 'Physical Product',
            'slug' => 'physical-prod-'.Str::random(8),
            'product_type_id' => $type->id,
            'category_id' => $cat->id,
            'is_active' => true,
            'is_saleable' => true,
        ]);

        $variant = ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => 'PHY-'.Str::random(6),
            'name' => 'Physical Item',
            'price' => 1999,
            'stock_quantity' => 100,
            'is_active' => true,
            'is_digital' => false,
        ]);

        expect($variant->is_digital)->toBeFalse()
            ->and($variant->download_limit)->toBeNull()
            ->and($variant->download_expiry_days)->toBeNull()
            ->and($variant->isDigital())->toBeFalse();
    });

    it('digital variant can have downloads relationship', function (): void {
        $variant = makeDigitalVariant();

        $download = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'E-book PDF',
            'file_path' => 'downloads/ebook.pdf',
            'file_name' => 'ebook.pdf',
            'file_size' => 1024000,
            'mime_type' => 'application/pdf',
            'position' => 0,
        ]);

        expect($variant->downloads)->toHaveCount(1)
            ->and($variant->hasDownloads())->toBeTrue()
            ->and($download->name)->toBe('E-book PDF')
            ->and($download->getFormattedFileSize())->toBe('1000 KB');
    });

    it('download file size formatting works correctly', function (): void {
        $variant = makeDigitalVariant();

        $downloadKB = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'Small File',
            'file_path' => 'downloads/small.pdf',
            'file_name' => 'small.pdf',
            'file_size' => 512000,
            'mime_type' => 'application/pdf',
            'position' => 0,
        ]);

        $downloadMB = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'Large File',
            'file_path' => 'downloads/large.zip',
            'file_name' => 'large.zip',
            'file_size' => 52428800,
            'mime_type' => 'application/zip',
            'position' => 1,
        ]);

        expect($downloadKB->getFormattedFileSize())->toBe('500 KB')
            ->and($downloadMB->getFormattedFileSize())->toBe('50 MB');
    });

    it('can update digital variant settings', function (): void {
        $variant = makeDigitalVariant();

        $variant->update([
            'download_limit' => 10,
            'download_expiry_days' => 14,
        ]);

        expect($variant->fresh()->download_limit)->toBe(10)
            ->and($variant->fresh()->download_expiry_days)->toBe(14);
    });
});

describe('Product Downloads', function (): void {
    it('download has correct relationship to variant', function (): void {
        $variant = makeDigitalVariant();

        $download = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'Software',
            'file_path' => 'downloads/software.zip',
            'file_name' => 'software.zip',
            'file_size' => 52428800,
            'mime_type' => 'application/zip',
            'position' => 0,
        ]);

        expect($download->variant->id)->toBe($variant->id)
            ->and($download->variant->is_digital)->toBeTrue();
    });
});

describe('Product Download Links', function (): void {
    it('can create a download link with token', function (): void {
        $token = ProductDownloadLink::generateToken();

        expect($token)->toBeString()
            ->and(mb_strlen($token))->toBe(64);
    });

    it('download link can check expiration', function (): void {
        $variant = makeDigitalVariant();

        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'expires_at' => now()->addDays(30),
            'max_downloads' => 3,
            'download_count' => 0,
        ]);

        expect($link->canDownload())->toBeTrue()
            ->and($link->isExpired())->toBeFalse()
            ->and($link->isDownloadLimitReached())->toBeFalse();
    });

    it('download link expires correctly', function (): void {
        $variant = makeDigitalVariant();

        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'expires_at' => now()->subDay(),
            'max_downloads' => 3,
            'download_count' => 0,
        ]);

        expect($link->isExpired())->toBeTrue()
            ->and($link->canDownload())->toBeFalse();
    });

    it('download link respects download limit', function (): void {
        $variant = makeDigitalVariant();

        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'expires_at' => null,
            'max_downloads' => 3,
            'download_count' => 3,
        ]);

        expect($link->isDownloadLimitReached())->toBeTrue()
            ->and($link->canDownload())->toBeFalse();
    });

    it('can increment download count', function (): void {
        $variant = makeDigitalVariant();

        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'expires_at' => null,
            'max_downloads' => 10,
            'download_count' => 0,
        ]);

        $link->incrementDownloadCount();

        expect($link->fresh()->download_count)->toBe(1);
    });
});
