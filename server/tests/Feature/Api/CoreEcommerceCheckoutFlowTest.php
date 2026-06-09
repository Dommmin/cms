<?php

declare(strict_types=1);

use App\Enums\ShippingCarrierEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryReservation;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

if (! function_exists('makeTestVariantCheckout')) {
    function makeTestVariantCheckout(int $price = 2000, int $stock = 10, bool $isShippable = true): ProductVariant
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

if (! function_exists('makeTestAuthUserCheckout')) {
    function makeTestAuthUserCheckout(): User
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

describe('2. Checkout Flow', function (): void {
    beforeEach(function (): void {
        Http::fake([
            '*' => Http::response(['status' => 'SUCCESS', 'paymentId' => 'PAY-123', 'redirectUrl' => 'https://paynow.pl/checkout/123'], 200),
        ]);
    });

    it('Scenariusz 2.1: Wymuszenie Punktow Odbioru (422 bez punktu) jesli kurier tego wymaga', function (): void {
        $variant = makeTestVariantCheckout(price: 1000, stock: 10);
        $user = makeTestAuthUserCheckout();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Paczkomat'],
            ['carrier' => ShippingCarrierEnum::INPOST_LOCKER, 'base_price' => 1500, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

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
                // MISSING pickup_point_id
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pickup_point_id']);
    });

    it('Scenariusz 2.2: Cyfrowe produkty omijaja walidacje adresu dostawy i wyboru kuriera', function (): void {
        $variant = makeTestVariantCheckout(price: 1000, stock: 10, isShippable: false);
        $user = makeTestAuthUserCheckout();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                // No shipping_method_id
                // No shipping_address
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Test 1', 'city' => 'WAW',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response->assertStatus(201);
    });

    it('Scenariusz 2.3: Tymczasowa rezerwacja zapasow po checkoutcie', function (): void {
        $variant = makeTestVariantCheckout(price: 1000, stock: 10);
        $user = makeTestAuthUserCheckout();

        $shipping = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Kurier'],
            ['carrier' => ShippingCarrierEnum::PICKUP, 'base_price' => 1500, 'is_active' => true, 'price_per_kg' => 0, 'max_weight' => 999]
        );

        $resCart = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 3]);
        $resCart->assertStatus(200);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'paynow', // Awaiting payment!
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

        if ($response->status() !== 201) {
            $response->dump();
        }

        $response->assertStatus(201);

        // Stock should be immediately reduced by 3 (from 10 to 7)
        expect($variant->fresh()->stock_quantity)->toBe(7);

    });

    it('Scenariusz 2.4: Zwalnianie rezerwacji koszyka po 15 minutach przywraca zapasy', function (): void {
        $variant = makeTestVariantCheckout(price: 1000, stock: 10);
        $user = makeTestAuthUserCheckout();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
            ->assertStatus(200);

        // Reserve the cart
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout/reserve')
            ->assertStatus(200);

        // Stock should be reduced by 2
        expect($variant->fresh()->stock_quantity)->toBe(8);

        // Simulate time passing: manually set expires_at to past
        InventoryReservation::query()->update([
            'expires_at' => now()->subMinutes(16),
        ]);

        $inventoryService = resolve(InventoryService::class);
        $count = $inventoryService->releaseExpiredReservations();

        expect($count)->toBeGreaterThan(0);
        expect($variant->fresh()->stock_quantity)->toBe(10);
    });
});
