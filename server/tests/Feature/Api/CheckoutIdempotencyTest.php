<?php

declare(strict_types=1);

use App\Enums\ShippingCarrierEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

if (! function_exists('makeVariantForIdempotency')) {
    function makeVariantForIdempotency(int $price = 1000, int $stock = 10): ProductVariant
    {
        $type = ProductType::query()->firstOrCreate(
            ['slug' => 'simple'],
            ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true],
        );

        $category = Category::query()->firstOrCreate(
            ['slug' => 'idempotency-cat'],
            ['name' => 'Idempotency', 'is_active' => true],
        );

        $product = Product::query()->create([
            'name' => 'Idempotency Product '.Str::random(4),
            'slug' => 'idempotency-prod-'.Str::random(8),
            'product_type_id' => $type->id,
            'category_id' => $category->id,
            'is_active' => true,
            'is_saleable' => true,
        ]);

        return ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => 'IDM-'.Str::random(6),
            'name' => 'Default',
            'price' => $price,
            'stock_quantity' => $stock,
            'is_active' => true,
        ]);
    }
}

if (! function_exists('makeUserForIdempotency')) {
    function makeUserForIdempotency(): User
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

if (! function_exists('idempotencyCheckoutPayload')) {
    /**
     * @return array<string, mixed>
     */
    function idempotencyCheckoutPayload(int $shippingMethodId): array
    {
        $address = [
            'first_name' => 'Jan', 'last_name' => 'Kowalski',
            'street' => 'Test 1', 'city' => 'WAW',
            'postal_code' => '00-001', 'country_code' => 'PL',
            'phone' => '123123123',
        ];

        return [
            'shipping_method_id' => $shippingMethodId,
            'payment_provider' => 'cash_on_delivery',
            'terms_accepted' => true,
            'billing_address' => $address,
            'shipping_address' => $address,
        ];
    }
}

describe('Checkout idempotency', function (): void {
    beforeEach(function (): void {
        Http::fake(['*' => Http::response(['status' => 'SUCCESS'], 200)]);

        $this->shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 1500, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999],
        );
    });

    it('creates exactly one order when the same checkout is retried with one Idempotency-Key', function (): void {
        $variant = makeVariantForIdempotency(stock: 10);
        $user = makeUserForIdempotency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
            ->assertStatus(200);

        $payload = idempotencyCheckoutPayload($this->shipping->id);
        $headers = ['Idempotency-Key' => 'checkout-attempt-1'];

        $first = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', $payload, $headers);
        $second = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', $payload, $headers);

        $first->assertStatus(201)->assertHeaderMissing('X-Idempotent-Replayed');
        $second->assertStatus(201)
            ->assertHeader('X-Idempotent-Replayed', 'true')
            ->assertExactJson($first->json()); // same order, replayed verbatim — not re-wrapped

        // The replayed order reference matches the original (no second order).
        expect($second->json('order.reference_number'))
            ->toBe($first->json('order.reference_number'));

        // The handler ran once: a single order/customer, stock deducted once.
        expect(Order::query()->count())->toBe(1);
        expect($variant->fresh()->stock_quantity)->toBe(8);
    });

    it('does not create a duplicate order on a triple submit (double-click storm)', function (): void {
        $variant = makeVariantForIdempotency(stock: 10);
        $user = makeUserForIdempotency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertStatus(200);

        $payload = idempotencyCheckoutPayload($this->shipping->id);
        $headers = ['Idempotency-Key' => 'checkout-storm'];

        foreach (range(1, 3) as $ignored) {
            $this->actingAs($user, 'sanctum')
                ->postJson('/api/v1/checkout', $payload, $headers)
                ->assertStatus(201);
        }

        expect(Order::query()->count())->toBe(1);
        expect($variant->fresh()->stock_quantity)->toBe(9);
    });

    it('rejects reusing a checkout Idempotency-Key with a different payload', function (): void {
        $variant = makeVariantForIdempotency(stock: 10);
        $user = makeUserForIdempotency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertStatus(200);

        $headers = ['Idempotency-Key' => 'checkout-mismatch'];

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', idempotencyCheckoutPayload($this->shipping->id), $headers)
            ->assertStatus(201);

        // Same key, tampered payload (different billing name) → conflict, no new order.
        $tampered = idempotencyCheckoutPayload($this->shipping->id);
        $tampered['billing_address']['first_name'] = 'Someone-Else';

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', $tampered, $headers)
            ->assertStatus(422)
            ->assertJsonStructure(['message']);

        expect(Order::query()->count())->toBe(1);
    });
});
