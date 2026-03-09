<?php

declare(strict_types=1);

use App\Jobs\SendLowStockAlerts;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Notifications\LowStockNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

it('sends low stock alert when variants are below threshold', function () {
    Setting::query()->create([
        'group' => 'inventory',
        'key' => 'low_stock_alert_email',
        'label' => 'Low Stock Alert Email',
        'value' => 'admin@example.com',
        'type' => App\Enums\SettingTypeEnum::String,
    ]);

    $product = Product::factory()->create();

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'LOW-STOCK-001',
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 2,
        'stock_threshold' => 5,
        'is_active' => true,
        'is_default' => true,
    ]);

    $job = new SendLowStockAlerts;
    $job->handle();

    Notification::assertSentOnDemand(
        LowStockNotification::class,
        fn (LowStockNotification $n, array $channels, object $notifiable) => $notifiable->routes['mail'] === 'admin@example.com'
            && $n->variants->count() === 1
    );
});

it('does not send alert when no variants are below threshold', function () {
    Setting::query()->create([
        'group' => 'inventory',
        'key' => 'low_stock_alert_email',
        'label' => 'Low Stock Alert Email',
        'value' => 'admin@example.com',
        'type' => App\Enums\SettingTypeEnum::String,
    ]);

    $product = Product::factory()->create();

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'PLENTY-001',
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 100,
        'stock_threshold' => 5,
        'is_active' => true,
        'is_default' => true,
    ]);

    $job = new SendLowStockAlerts;
    $job->handle();

    Notification::assertNothingSent();
});

it('does not send alert when low_stock_alert_email setting is not configured', function () {
    $product = Product::factory()->create();

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'LOW-002',
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 1,
        'stock_threshold' => 5,
        'is_active' => true,
        'is_default' => true,
    ]);

    $job = new SendLowStockAlerts;
    $job->handle();

    Notification::assertNothingSent();
});

it('does not include out-of-stock variants in the alert', function () {
    Setting::query()->create([
        'group' => 'inventory',
        'key' => 'low_stock_alert_email',
        'label' => 'Low Stock Alert Email',
        'value' => 'admin@example.com',
        'type' => App\Enums\SettingTypeEnum::String,
    ]);

    $product = Product::factory()->create();

    ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'OUT-001',
        'name' => 'Out of Stock',
        'price' => 1000,
        'stock_quantity' => 0,
        'stock_threshold' => 5,
        'is_active' => true,
        'is_default' => true,
    ]);

    $job = new SendLowStockAlerts;
    $job->handle();

    Notification::assertNothingSent();
});
