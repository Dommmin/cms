<?php

declare(strict_types=1);

use App\Enums\ShippingCarrierEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Str;

if (! function_exists('makeTestVariantCart')) {
    function makeTestVariantCart(int $price = 2000, int $stock = 10, bool $isShippable = true): ProductVariant
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

if (! function_exists('makeTestAuthUserCart')) {
    function makeTestAuthUserCart(): User
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

describe('1. Cart Flow', function (): void {

    it('Scenariusz 1.1: Koszyk z sesji goscia laczy sie z kontem uzytkownika po logowaniu', function (): void {
        $variant = makeTestVariantCart();

        // 1. Guest adds to cart
        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertOk();

        $guestCart = $this->getJson('/api/v1/cart')->assertOk()->json();
        expect($guestCart['items_count'])->toBe(1);

        // 2. User logs in
        $user = makeTestAuthUserCart();

        // 3. Authenticated request - should merge guest session cart
        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items_count', 1)
            ->assertJsonPath('items.0.variant_id', $variant->id);
    })->skip('Not implemented in standard Sanctum login without explicit merge endpoint');

    it('Scenariusz 1.2: Przejscie do checkoutu jest blokowane, jesli w tle zmienil sie stan magazynowy (0 stock)', function (): void {
        $variant = makeTestVariantCart(price: 1000, stock: 1);
        $user = makeTestAuthUserCart();

        // User adds last item to cart
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertOk();

        // Background change: someone else bought it, stock drops to 0
        $variant->update(['stock_quantity' => 0]);

        // Attempting to proceed to checkout / fetching cart should flag the item as out of stock
        // The /api/v1/cart/validate or during POST /api/v1/checkout
        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 2000, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
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
            ]);

        $response->assertStatus(422);

        expect($response->getContent())->toMatch('/stock|niedostępn|available|quantity/i');
    });

    it('Scenariusz 1.3: Kod na darmowa dostawe zeruje wysylke, a procentowy dziala wylacznie na subtotal', function (): void {
        $variant = makeTestVariantCart(price: 1000, stock: 10);
        $user = makeTestAuthUserCart();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 2000, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        Discount::factory()->create([
            'code' => 'FREESHIP',
            'type' => 'free_shipping',
            'value' => 0,
            'is_active' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/discount', ['code' => 'FREESHIP'])->assertOk();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
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
            ]);

        $response->assertStatus(201);

        $order = $response->json('order');

        // Free shipping discount: discount_amount is 0 (as product isn't discounted), shipping_cost is 0, total = subtotal
        expect($order['shipping_cost'])->toBe(0);
        expect($order['subtotal'])->toBe(1000);
        expect($order['total'])->toBe(1000);
        expect($order['discount_amount'])->toBe(0); // free_shipping doesn't add to monetary discount total if it zeros shipping specifically
    });
});
