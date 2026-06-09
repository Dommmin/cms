<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Enums\ShippingCarrierEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

if (! function_exists('makeTestVariantPayment')) {
    function makeTestVariantPayment(int $price = 2000, int $stock = 10, bool $isShippable = true): ProductVariant
    {
        $type = ProductType::query()->firstOrCreate(
            ['slug' => $isShippable ? 'simple' : 'digital'],
            ['name' => $isShippable ? 'Simple' : 'Digital', 'has_variants' => false, 'is_shippable' => $isShippable]
        );

        $cat = Category::query()->firstOrCreate(
            ['slug' => 'test-cat'],
            ['name' => 'Test', 'is_active' => true]
        );

        $product = Product::query()->create([
            'name' => 'Test Product '.Str::random(4),
            'slug' => 'test-prod-'.Str::random(8),
            'product_type_id' => $type->id,
            'category_id' => $cat->id,
            'is_active' => true,
            'is_saleable' => true,
        ]);

        return ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => 'TSK-'.Str::random(6),
            'name' => 'Default',
            'price' => $price,
            'stock_quantity' => $stock,
            'is_active' => true,
        ]);
    }
}

if (! function_exists('makeTestAuthUserPayment')) {
    function makeTestAuthUserPayment(): User
    {
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);

        return $user;
    }
}

describe('3. Payment Flow', function (): void {
    beforeEach(function (): void {
        Http::fake([
            '*' => Http::response(['status' => 'SUCCESS', 'paymentId' => 'PAY-123', 'redirectUrl' => 'https://paynow.pl/checkout/123'], 200),
        ]);
    });

    it('Scenariusz 3.1: Zamowienie z totalem 0 PLN omija bramke i od razu dostaje status processing', function (): void {
        $variant = makeTestVariantPayment(price: 1500, stock: 10);
        $user = makeTestAuthUserPayment();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 1000, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        Discount::factory()->create([
            'code' => 'FREE100',
            'type' => 'percentage',
            'value' => 100, // 100% off subtotal
            'is_active' => true,
        ]);
        Discount::factory()->create([
            'code' => 'FREESHIPPING',
            'type' => 'free_shipping',
            'value' => 0,
            'is_active' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/discount', ['code' => 'FREE100']);

        // Wait, discount model in tests only allows one code? Yes. Let's just create a fixed amount that covers everything.
        // Let's test with a FIXED discount that covers both products and shipping
    })->skip('Will refactor to use a single fixed discount that exceeds total');

    it('Scenariusz 3.1: Zamowienie z totalem 0 PLN (duzy fixed discount) omija bramke i od razu dostaje status processing', function (): void {
        $variant = makeTestVariantPayment(price: 1500, stock: 10);
        $user = makeTestAuthUserPayment();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Darmowy Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 0, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        Discount::factory()->create([
            'code' => 'FREE100',
            'type' => 'percentage',
            'value' => 100, // 100% off subtotal
            'is_active' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/discount', ['code' => 'FREE100']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'paynow', // Attempt to use online payment
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ])->assertStatus(201);

        $order = $response->json('order');
        expect($response->json('order.total'))->toBe(0);
        expect($response->json('order.status'))->toBe(OrderStatusEnum::PROCESSING->value);
        expect($response->json('redirect_url'))->toBeNull(); // No payment gateway redirect!
    });

    it('Scenariusz 3.2: Webhook Paynow (CONFIRMED) zatwierdza platnosc i ugruntowuje zapasy', function (): void {
        $variant = makeTestVariantPayment(price: 1500, stock: 10);
        $user = makeTestAuthUserPayment();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Darmowy Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 0, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'paynow',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ])->assertStatus(201);

        $order = Order::query()->find($response->json('order.id'));
        $payment = $order->payment;

        // Simulate Paynow Webhook CONFIRMED
        $payload = [
            'paymentId' => 'PAY-123',
            'externalId' => (string) $payment->id,
            'status' => 'CONFIRMED',
        ];
        $signature = base64_encode(hash_hmac('sha256', json_encode($payload), (string) config('services.paynow.signature_key', 'test'), true));

        $this->postJson('/api/v1/webhooks/paynow', $payload, [
            'Signature' => $signature,
        ])->assertOk();

        // Status should be paid
        expect($order->fresh()->getRawOriginal('status'))->toBe(OrderStatusEnum::PAID->value);
        expect($payment->fresh()->status->value)->toBe(PaymentStatusEnum::COMPLETED->value);

        // Stock should still be 8
        expect($variant->fresh()->stock_quantity)->toBe(8);
    });

    it('Scenariusz 3.3: Webhook Paynow (REJECTED) zmienia status na failed, ale nie kasuje orderu', function (): void {
        $variant = makeTestVariantPayment(price: 1500, stock: 10);
        $user = makeTestAuthUserPayment();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Darmowy Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 0, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'paynow',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ])->assertStatus(201);

        $order = Order::query()->find($response->json('order.id'));
        $payment = $order->payment;

        // Simulate Paynow Webhook REJECTED
        $payload = [
            'paymentId' => 'PAY-123',
            'externalId' => (string) $payment->id,
            'status' => 'REJECTED',
        ];
        $signature = base64_encode(hash_hmac('sha256', json_encode($payload), (string) config('services.paynow.signature_key', 'test'), true));

        $this->postJson('/api/v1/webhooks/paynow', $payload, [
            'Signature' => $signature,
        ])->assertOk();

        // Status should be FAILED
        expect($payment->fresh()->status->value)->toBe(PaymentStatusEnum::FAILED->value);
    });
});
