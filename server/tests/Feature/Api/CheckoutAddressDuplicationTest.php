<?php

declare(strict_types=1);

use App\Enums\ShippingCarrierEnum;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

function addressDuplicationShipping(): ShippingMethod
{
    return ShippingMethod::query()->firstOrCreate(
        ['name' => 'Odbiór testowy'],
        [
            'carrier' => ShippingCarrierEnum::PICKUP,
            'is_active' => true,
            'base_price' => 1500,
            'price_per_kg' => 0,
            'max_weight' => 999.0,
        ],
    );
}

function addressDuplicationAddressPayload(): array
{
    return [
        'first_name' => 'Krzysztof',
        'last_name' => 'Adresowy',
        'street' => 'ul. Unikalna 123',
        'city' => 'Kraków',
        'postal_code' => '31-000',
        'country_code' => 'PL',
        'phone' => '123456789',
    ];
}

function addressDuplicationCartSetup(User $user): array
{
    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true],
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'dup-test-cat'],
        ['name' => 'Dup Test', 'is_active' => true],
    );

    $product = Product::query()->create([
        'name' => 'Dup Product '.Str::random(4),
        'slug' => 'dup-prod-'.Str::random(8),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'DUP-'.Str::random(6),
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 50,
        'is_active' => true,
    ]);

    $customer = Customer::query()->firstOrCreate(
        ['user_id' => $user->id],
        ['email' => $user->email, 'first_name' => $user->name]
    );

    $cart = $customer->cart ?: Cart::query()->create(['customer_id' => $customer->id]);
    $cart->items()->create(['variant_id' => $variant->id, 'quantity' => 1]);

    return [$cart, $variant];
}

beforeEach(function (): void {
    Notification::fake();
});

describe('Checkout Address Duplication', function (): void {
    it('reuses existing matching address instead of duplicating it in the customer address book', function (): void {
        $user = User::factory()->create();
        $shipping = addressDuplicationShipping();

        // 1. First checkout
        [$cart1] = addressDuplicationCartSetup($user);
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => addressDuplicationAddressPayload(),
                'shipping_address' => addressDuplicationAddressPayload(),
            ])
            ->assertStatus(201);

        // Verify we have 1 billing and 1 shipping address
        $customer = $user->fresh()->customer;
        expect($customer->addresses()->count())->toBe(2);

        // 2. Second checkout with the exact same address
        [$cart2] = addressDuplicationCartSetup($user);
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => addressDuplicationAddressPayload(),
                'shipping_address' => addressDuplicationAddressPayload(),
            ])
            ->assertStatus(201);

        // Verify address count did not grow! Still 2 (1 billing and 1 shipping)
        expect($customer->addresses()->count())->toBe(2);
    });
});
