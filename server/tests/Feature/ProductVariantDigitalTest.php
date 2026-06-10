<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Models\Address;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductDownload;
use App\Models\ProductDownloadLink;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\DigitalDownloadsReadyNotification;
use App\Rules\VatId;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
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

describe('VIES VAT Validation', function (): void {
    beforeEach(function (): void {
        Http::preventStrayRequests();
    });

    it('validates active EU VAT ID successfully via VIES API', function (): void {
        Http::fake([
            'ec.europa.eu/*' => Http::response(['isValid' => true], 200),
        ]);

        $rule = new VatId();
        $failCalled = false;
        $fail = function (string $msg) use (&$failCalled): void {
            $failCalled = true;
        };

        $rule->validate('vat_id', 'DE123456789', $fail);

        expect($failCalled)->toBeFalse();
    });

    it('fails when VIES API returns isValid false', function (): void {
        Http::fake([
            'ec.europa.eu/*' => Http::response(['isValid' => false], 200),
        ]);

        $rule = new VatId();
        $failMsg = null;
        $fail = function (string $msg) use (&$failMsg): void {
            $failMsg = $msg;
        };

        $rule->validate('vat_id', 'DE123456789', $fail);

        expect($failMsg)->toBe('Podany numer VAT UE jest nieaktywny lub niepoprawny w bazie VIES.');
    });

    it('falls back to local format check if VIES API times out or fails', function (): void {
        Http::fake(function (): void {
            throw new ConnectionException('Connection timed out');
        });

        $rule = new VatId();
        $failCalled = false;
        $fail = function (string $msg) use (&$failCalled): void {
            $failCalled = true;
        };

        // DE123456789 matches the EU format regex, so fallback to local validation should succeed
        $rule->validate('vat_id', 'DE123456789', $fail);

        expect($failCalled)->toBeFalse();
    });

    it('skips VIES API and checks checksum for Polish NIP', function (): void {
        // No HTTP faking because VIES should never be hit
        $rule = new VatId();
        $failCalled = false;
        $fail = function (string $msg) use (&$failCalled): void {
            $failCalled = true;
        };

        // PL 7740001454 is a valid Polish NIP checksum
        $rule->validate('vat_id', 'PL7740001454', $fail);

        expect($failCalled)->toBeFalse();
    });
});

describe('Digital Downloads Fulfillment', function (): void {
    beforeEach(function (): void {
        Notification::fake();
    });

    it('automatically generates download links and sends notification on OrderPaid', function (): void {
        $variant = makeDigitalVariant();

        // Create a product download file for the variant
        $downloadFile = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'Instruction PDF',
            'file_path' => 'downloads/instr.pdf',
            'file_name' => 'instr.pdf',
            'file_size' => 2048,
            'mime_type' => 'application/pdf',
        ]);

        // Create user & customer
        $user = User::factory()->create();
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        $address = Address::query()->create([
            'first_name' => 'Jan', 'last_name' => 'Kowalski',
            'street' => 'ul. Testowa 1', 'city' => 'Warszawa',
            'postal_code' => '00-001', 'country_code' => 'PL',
            'phone' => '500000000', 'address_type' => 'billing',
        ]);

        // Create order
        $order = Order::query()->create([
            'reference_number' => Order::generateReferenceNumber(),
            'customer_id' => $customer->id,
            'billing_address_id' => $address->id,
            'shipping_address_id' => $address->id,
            'status' => 'awaiting_payment',
            'subtotal' => 2999,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'total' => 2999,
            'currency_code' => 'PLN',
            'exchange_rate' => 1.0,
        ]);

        $orderItem = $order->items()->create([
            'variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_name' => $variant->name,
            'sku' => $variant->sku,
            'unit_price' => 2999,
            'total_price' => 2999,
            'quantity' => 1,
        ]);

        // Transition order to PAID to trigger OrderPaid event
        $order->changeStatus(OrderStatusEnum::PAID, 'system', 'Payment received');

        // Check download link is created
        $link = ProductDownloadLink::query()->where('order_item_id', $orderItem->id)->first();
        expect($link)->not->toBeNull()
            ->and($link->product_variant_id)->toBe($variant->id)
            ->and($link->download_count)->toBe(0)
            ->and($link->max_downloads)->toBe(3);

        // Check notification was sent
        Notification::assertSentTo(
            $user,
            DigitalDownloadsReadyNotification::class,
            fn ($notification): bool => $notification->order->id === $order->id &&
                $notification->links->contains('id', $link->id)
        );
    });
});

describe('Digital Downloads API Endpoints', function (): void {
    beforeEach(function (): void {
        Storage::fake('local');
    });

    it('lists available files for a valid token', function (): void {
        $variant = makeDigitalVariant();
        $downloadFile = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'Resource Zip',
            'file_path' => 'downloads/resource.zip',
            'file_name' => 'resource.zip',
            'file_size' => 10240,
            'mime_type' => 'application/zip',
        ]);

        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'max_downloads' => 5,
            'download_count' => 0,
        ]);

        $response = $this->getJson('/api/v1/downloads/'.$link->token);

        $response->assertOk()
            ->assertJsonPath('token', $link->token)
            ->assertJsonCount(1, 'files')
            ->assertJsonPath('files.0.name', 'Resource Zip')
            ->assertJsonPath('files.0.file_name', 'resource.zip')
            ->assertJsonStructure([
                'token', 'expires_at', 'max_downloads', 'download_count', 'variant', 'files',
            ]);
    });

    it('returns 404 for invalid token', function (): void {
        $this->getJson('/api/v1/downloads/invalid-token-1234')
            ->assertNotFound();
    });

    it('returns 403 when download limit is reached', function (): void {
        $variant = makeDigitalVariant();
        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'max_downloads' => 3,
            'download_count' => 3,
        ]);

        $this->getJson('/api/v1/downloads/'.$link->token)
            ->assertForbidden();
    });

    it('streams file and increments download count and logs event', function (): void {
        $variant = makeDigitalVariant();
        $filePath = 'downloads/file.pdf';
        $fileName = 'file.pdf';

        Storage::put($filePath, 'pdf content dummy');

        $downloadFile = ProductDownload::query()->create([
            'product_variant_id' => $variant->id,
            'name' => 'E-Book',
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => 17,
            'mime_type' => 'application/pdf',
        ]);

        $link = ProductDownloadLink::query()->create([
            'order_item_id' => null,
            'product_variant_id' => $variant->id,
            'token' => ProductDownloadLink::generateToken(),
            'max_downloads' => 5,
            'download_count' => 0,
        ]);

        $response = $this->get(sprintf('/api/v1/downloads/%s/files/%d', $link->token, $downloadFile->id));

        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment; filename=file.pdf');
        $response->assertHeader('Content-Type', 'application/pdf');

        expect($link->fresh()->download_count)->toBe(1);

        $this->assertDatabaseHas('product_download_events', [
            'product_download_link_id' => $link->id,
        ]);
    });
});
