<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Enums\ShippingCarrierEnum;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Notifications\OrderConfirmedNotification;
use Illuminate\Support\Facades\Notification;

function createCheckoutCart(User $user): Cart
{
    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true],
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'test-cat'],
        ['name' => 'Test', 'is_active' => true],
    );

    $product = Product::query()->create([
        'name' => 'Test Shirt',
        'slug' => 'test-shirt-'.Illuminate\Support\Str::random(6),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'TSH-'.Illuminate\Support\Str::random(5),
        'name' => 'Default',
        'price' => 5000,
        'stock_quantity' => 10,
        'is_active' => true,
    ]);

    /** @var App\Models\Customer $customer */
    $customer = $user->customer ?? App\Models\Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => $user->name,
    ]);

    $cart = Cart::query()->create(['customer_id' => $customer->id]);
    $cart->items()->create(['variant_id' => $variant->id, 'quantity' => 2]);

    return $cart;
}

function pickupShippingMethod(): ShippingMethod
{
    return ShippingMethod::query()->firstOrCreate(
        ['name' => 'Odbiór osobisty'],
        [
            'carrier' => ShippingCarrierEnum::PICKUP,
            'is_active' => true,
            'base_price' => 0,
            'price_per_kg' => 0,
            'max_weight' => 999.0,
        ],
    );
}

function addressPayload(): array
{
    return [
        'first_name' => 'Jan',
        'last_name' => 'Kowalski',
        'street' => 'ul. Testowa 1',
        'city' => 'Warszawa',
        'postal_code' => '00-001',
        'country_code' => 'PL',
        'phone' => '500000000',
    ];
}

test('authenticated user can complete checkout with cash on delivery', function () {
    Notification::fake();

    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;
    createCheckoutCart($user);

    $shippingMethod = pickupShippingMethod();

    $response = $this->withToken($token)
        ->withHeaders(['Idempotency-Key' => 'test-key-checkout-1'])
        ->postJson('/api/v1/checkout', [
            'shipping_method_id' => $shippingMethod->id,
            'payment_provider' => 'cash_on_delivery',
            'billing_address' => addressPayload(),
            'shipping_address' => addressPayload(),
        ]);

    $response->assertStatus(201);
    $data = $response->json('order');

    expect($data['reference_number'])->toStartWith('ORD-')
        ->and($data['status'])->toBe(OrderStatusEnum::PENDING->value);
});

test('cash on delivery order starts as pending not awaiting_payment', function () {
    Notification::fake();

    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;
    createCheckoutCart($user);

    $shippingMethod = pickupShippingMethod();

    $this->withToken($token)
        ->withHeaders(['Idempotency-Key' => 'test-key-checkout-2'])
        ->postJson('/api/v1/checkout', [
            'shipping_method_id' => $shippingMethod->id,
            'payment_provider' => 'cash_on_delivery',
            'billing_address' => addressPayload(),
            'shipping_address' => addressPayload(),
        ])
        ->assertStatus(201)
        ->assertJsonPath('order.status', 'pending');
});

test('checkout sends order confirmation notification', function () {
    Notification::fake();

    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;
    createCheckoutCart($user);

    $shippingMethod = pickupShippingMethod();

    $this->withToken($token)
        ->withHeaders(['Idempotency-Key' => 'test-key-checkout-3'])
        ->postJson('/api/v1/checkout', [
            'shipping_method_id' => $shippingMethod->id,
            'payment_provider' => 'cash_on_delivery',
            'billing_address' => addressPayload(),
            'shipping_address' => addressPayload(),
        ])
        ->assertStatus(201);

    Notification::assertSentTo($user, OrderConfirmedNotification::class);
});

test('checkout fails when cart is empty', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $shippingMethod = pickupShippingMethod();

    $this->withToken($token)
        ->withHeaders(['Idempotency-Key' => 'test-key-checkout-4'])
        ->postJson('/api/v1/checkout', [
            'shipping_method_id' => $shippingMethod->id,
            'payment_provider' => 'cash_on_delivery',
            'billing_address' => addressPayload(),
            'shipping_address' => addressPayload(),
        ])
        ->assertStatus(422);
});

test('guest checkout requires guest_email', function () {
    $shippingMethod = pickupShippingMethod();

    $this->withHeaders(['Idempotency-Key' => 'test-key-guest-no-email'])
        ->postJson('/api/v1/checkout', [
            'shipping_method_id' => $shippingMethod->id,
            'payment_provider' => 'cash_on_delivery',
            'billing_address' => addressPayload(),
            'shipping_address' => addressPayload(),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['guest_email']);
});

test('guest can complete checkout with guest_email', function () {
    Notification::fake();

    $shippingMethod = pickupShippingMethod();

    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true],
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'test-cat'],
        ['name' => 'Test', 'is_active' => true],
    );

    $product = Product::query()->create([
        'name' => 'Guest Product',
        'slug' => 'guest-product-'.Illuminate\Support\Str::random(6),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'GP-'.Illuminate\Support\Str::random(5),
        'name' => 'Default',
        'price' => 3000,
        'stock_quantity' => 5,
        'is_active' => true,
    ]);

    $cart = Cart::query()->create(['session_token' => 'guest-cart-token-test']);
    $cart->items()->create(['variant_id' => $variant->id, 'quantity' => 1]);

    $response = $this->withHeaders([
        'Idempotency-Key' => 'test-key-guest-checkout-1',
        'X-Cart-Token' => 'guest-cart-token-test',
    ])
        ->postJson('/api/v1/checkout', [
            'guest_email' => 'guest@example.com',
            'shipping_method_id' => $shippingMethod->id,
            'payment_provider' => 'cash_on_delivery',
            'billing_address' => addressPayload(),
            'shipping_address' => addressPayload(),
        ]);

    $response->assertStatus(201);

    $order = $response->json('order');
    expect($order['reference_number'])->toStartWith('ORD-')
        ->and($order['status'])->toBe(OrderStatusEnum::PENDING->value);

    $this->assertDatabaseHas('orders', [
        'reference_number' => $order['reference_number'],
        'customer_id' => null,
        'guest_email' => 'guest@example.com',
    ]);
});

test('shipping methods endpoint returns active methods', function () {
    pickupShippingMethod();

    $response = $this->getJson('/api/v1/checkout/shipping-methods')
        ->assertOk();

    $data = $response->json('data');
    expect($data)->not->toBeEmpty();
    expect(collect($data)->pluck('name'))->toContain('Odbiór osobisty');
});
