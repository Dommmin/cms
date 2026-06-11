<?php

declare(strict_types=1);

use App\Mail\ProductRestockedMail;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ProductVariantStockSubscription;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

function makeSubscriptionVariant(array $attributes = []): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple-sub'],
        ['name' => 'Simple Sub', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'sub-test-cat'],
        ['name' => 'Sub Test', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Product '.Str::random(4),
        'slug' => 'prod-sub-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create(array_merge([
        'product_id' => $product->id,
        'sku' => 'SKU-SUB-'.Str::random(6),
        'name' => 'Default',
        'price' => 2000,
        'stock_quantity' => 0,
        'is_active' => true,
        'backorder_allowed' => false,
    ], $attributes));
}

describe('Product Stock Alerts & Subscription API', function (): void {
    it('subscribes successfully with valid email', function (): void {
        $variant = makeSubscriptionVariant();

        $response = $this->postJson(sprintf('/api/v1/products/variants/%d/subscribe', $variant->id), [
            'email' => 'test@example.com',
        ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'subscribed');

        $this->assertDatabaseHas('product_variant_stock_subscriptions', [
            'product_variant_id' => $variant->id,
            'email' => 'test@example.com',
            'notified_at' => null,
        ]);
    });

    it('rejects subscription with invalid email', function (): void {
        $variant = makeSubscriptionVariant();

        $this->postJson(sprintf('/api/v1/products/variants/%d/subscribe', $variant->id), [
            'email' => 'not-an-email',
        ])->assertStatus(422);

        $this->postJson(sprintf('/api/v1/products/variants/%d/subscribe', $variant->id), [
            'email' => '',
        ])->assertStatus(422);
    });

    it('prevents duplicate subscriptions', function (): void {
        $variant = makeSubscriptionVariant();

        $this->postJson(sprintf('/api/v1/products/variants/%d/subscribe', $variant->id), [
            'email' => 'test@example.com',
        ])->assertCreated();

        $response = $this->postJson(sprintf('/api/v1/products/variants/%d/subscribe', $variant->id), [
            'email' => 'test@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'already_subscribed');
    });

    it('triggers email notification when product stock goes from 0 to positive', function (): void {
        Mail::fake();

        $variant = makeSubscriptionVariant(['stock_quantity' => 0]);

        ProductVariantStockSubscription::query()->create([
            'product_variant_id' => $variant->id,
            'email' => 'notify-me@example.com',
        ]);

        $variant->update(['stock_quantity' => 5]);

        Mail::assertSent(ProductRestockedMail::class, fn (ProductRestockedMail $mail): bool => $mail->hasTo('notify-me@example.com'));

        $this->assertDatabaseMissing('product_variant_stock_subscriptions', [
            'product_variant_id' => $variant->id,
            'email' => 'notify-me@example.com',
            'notified_at' => null,
        ]);
    });

    it('does not trigger notification if stock quantity does not change from 0 or below', function (): void {
        Mail::fake();

        $variant = makeSubscriptionVariant(['stock_quantity' => 0]);

        ProductVariantStockSubscription::query()->create([
            'product_variant_id' => $variant->id,
            'email' => 'notify-me2@example.com',
        ]);

        // Stock updated but still <= 0
        $variant->update(['stock_quantity' => 0]);
        Mail::assertNotSent(ProductRestockedMail::class);

        // Variant name updated, no stock change
        $variant->update(['name' => 'Updated Name']);
        Mail::assertNotSent(ProductRestockedMail::class);
    });

    it('does not trigger notification if stock was already positive', function (): void {
        Mail::fake();

        $variant = makeSubscriptionVariant(['stock_quantity' => 5]);

        ProductVariantStockSubscription::query()->create([
            'product_variant_id' => $variant->id,
            'email' => 'notify-me3@example.com',
        ]);

        // Stock goes from positive to more positive
        $variant->update(['stock_quantity' => 10]);
        Mail::assertNotSent(ProductRestockedMail::class);
    });
});

describe('Cart validations for stock backorders', function (): void {
    it('blocks cart addition of out of stock variants when backorder is disabled', function (): void {
        $variant = makeSubscriptionVariant([
            'stock_quantity' => 0,
            'backorder_allowed' => false,
        ]);

        $response = $this->postJson('/api/v1/cart/items', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    });

    it('allows cart addition of out of stock variants when backorder is allowed', function (): void {
        $variant = makeSubscriptionVariant([
            'stock_quantity' => 0,
            'backorder_allowed' => true,
        ]);

        $response = $this->postJson('/api/v1/cart/items', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response->assertOk();
    });
});
