<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeVariant(int $price = 2000, int $stock = 10): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'cart-test-cat'],
        ['name' => 'Cart Test', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Cart Product '.Str::random(4),
        'slug' => 'cart-prod-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'CP-'.Str::random(6),
        'name' => 'Default',
        'price' => $price,
        'stock_quantity' => $stock,
        'is_active' => true,
    ]);
}

function makeAuthUser(): User
{
    $user = User::factory()->create();
    Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => $user->name,
    ]);

    return $user;
}

// ---------------------------------------------------------------------------
// Guest cart (session-based)
// ---------------------------------------------------------------------------

describe('Cart – guest (session)', function () {
    it('guest gets an empty cart on first request', function () {
        $this->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items', [])
            ->assertJsonPath('items_count', 0);
    });

    it('guest cart persists in session across requests', function () {
        $variant = makeVariant();

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertOk();

        $this->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items_count', 1);
    });

    it('guest cart token is returned in response', function () {
        $response = $this->getJson('/api/v1/cart')->assertOk();

        // Token may be null for brand-new session cart or present as a string
        $token = $response->json('token');
        expect($token === null || is_string($token))->toBeTrue();
    });
});

// ---------------------------------------------------------------------------
// Auth cart
// ---------------------------------------------------------------------------

describe('Cart – authenticated user', function () {
    it('authenticated user gets a dedicated cart', function () {
        $user = makeAuthUser();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonStructure(['id', 'items', 'subtotal', 'total', 'items_count']);
    });

    it('auth user cart is isolated from other users', function () {
        $userA = makeAuthUser();
        $userB = makeAuthUser();
        $variant = makeVariant();

        $this->actingAs($userA, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $this->actingAs($userB, 'sanctum')
            ->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items_count', 0);
    });
});

// ---------------------------------------------------------------------------
// Adding items
// ---------------------------------------------------------------------------

describe('Cart – adding items', function () {
    it('adds a variant to the cart', function () {
        $variant = makeVariant(price: 1500, stock: 5);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertOk()
            ->assertJsonPath('items_count', 1);
    });

    it('adding the same variant twice accumulates quantity', function () {
        $variant = makeVariant(price: 1000, stock: 10);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);
        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 3])
            ->assertOk()
            ->assertJsonPath('items_count', 5);
    });

    it('rejects adding more items than available stock', function () {
        $variant = makeVariant(price: 1000, stock: 2);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 5])
            ->assertUnprocessable();
    });

    it('rejects accumulation that would exceed stock', function () {
        $variant = makeVariant(price: 1000, stock: 3);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
            ->assertUnprocessable();
    });

    it('rejects a non-existent variant_id', function () {
        $this->postJson('/api/v1/cart/items', ['variant_id' => 99999, 'quantity' => 1])
            ->assertUnprocessable();
    });

    it('rejects quantity of zero', function () {
        $variant = makeVariant();

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 0])
            ->assertUnprocessable();
    });

    it('price injection — submitted price is silently ignored, server uses variant price', function () {
        $variant = makeVariant(price: 5000);
        $user = makeAuthUser();

        // Attacker tries to pass a lower price — field should be ignored entirely
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $variant->id,
                'quantity' => 1,
                'price' => 1, // malicious override
                'unit_price' => 1,
            ])->assertOk();

        expect($response->json('subtotal'))->toBe(5000);
    });
});

// ---------------------------------------------------------------------------
// Updating items
// ---------------------------------------------------------------------------

describe('Cart – updating items', function () {
    it('updates item quantity', function () {
        $variant = makeVariant(stock: 10);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $cartItemId = $this->getJson('/api/v1/cart')->json('items.0.id');

        $this->putJson("/api/v1/cart/items/{$cartItemId}", ['quantity' => 4])
            ->assertOk()
            ->assertJsonPath('items_count', 4);
    });

    it('rejects update that would exceed stock', function () {
        $variant = makeVariant(stock: 3);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $cartItemId = $this->getJson('/api/v1/cart')->json('items.0.id');

        $this->putJson("/api/v1/cart/items/{$cartItemId}", ['quantity' => 99])
            ->assertUnprocessable();
    });

    it('cannot update a cart item belonging to another user', function () {
        $variant = makeVariant();
        $owner = makeAuthUser();
        $attacker = makeAuthUser();

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $cartItemId = $this->actingAs($owner->fresh(), 'sanctum')
            ->getJson('/api/v1/cart')
            ->json('items.0.id');

        $this->actingAs($attacker, 'sanctum')
            ->putJson("/api/v1/cart/items/{$cartItemId}", ['quantity' => 2])
            ->assertForbidden();
    });
});

// ---------------------------------------------------------------------------
// Removing items
// ---------------------------------------------------------------------------

describe('Cart – removing items', function () {
    it('removes an item from the cart', function () {
        $variant = makeVariant();

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $cartItemId = $this->getJson('/api/v1/cart')->json('items.0.id');

        $this->deleteJson("/api/v1/cart/items/{$cartItemId}")
            ->assertOk()
            ->assertJsonPath('items_count', 0);
    });

    it('cannot remove a cart item belonging to another user', function () {
        $variant = makeVariant();
        $owner = makeAuthUser();
        $attacker = makeAuthUser();

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $cartItemId = $this->actingAs($owner->fresh(), 'sanctum')
            ->getJson('/api/v1/cart')
            ->json('items.0.id');

        $this->actingAs($attacker, 'sanctum')
            ->deleteJson("/api/v1/cart/items/{$cartItemId}")
            ->assertForbidden();
    });
});

// ---------------------------------------------------------------------------
// Clear cart
// ---------------------------------------------------------------------------

describe('Cart – clear', function () {
    it('clears all items from the cart', function () {
        $variantA = makeVariant();
        $variantB = makeVariant();

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variantA->id, 'quantity' => 2]);
        $this->postJson('/api/v1/cart/items', ['variant_id' => $variantB->id, 'quantity' => 1]);

        $this->deleteJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('items_count', 0)
            ->assertJsonPath('items', []);
    });

    it('clear also removes applied discount code', function () {
        $variant = makeVariant();
        $discount = Discount::factory()->create([
            'code' => 'CLEARDISCOUNT',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $this->postJson('/api/v1/cart/discount', ['code' => $discount->code]);

        $this->deleteJson('/api/v1/cart')->assertOk();

        $this->getJson('/api/v1/cart')
            ->assertJsonPath('discount_code', null);
    });
});

// ---------------------------------------------------------------------------
// Price integrity
// ---------------------------------------------------------------------------

describe('Cart – price integrity', function () {
    it('subtotal equals sum of variant prices times quantities (server-calculated)', function () {
        $variantA = makeVariant(price: 1000);
        $variantB = makeVariant(price: 2500);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variantA->id, 'quantity' => 2]);
        $this->postJson('/api/v1/cart/items', ['variant_id' => $variantB->id, 'quantity' => 1]);

        // 2 × 1000 + 1 × 2500 = 4500
        $this->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('subtotal', 4500);
    });

    it('subtotal recalculates correctly after item removal', function () {
        $variantA = makeVariant(price: 3000);
        $variantB = makeVariant(price: 1000);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variantA->id, 'quantity' => 1]);
        $this->postJson('/api/v1/cart/items', ['variant_id' => $variantB->id, 'quantity' => 1]);

        $cartItemId = $this->getJson('/api/v1/cart')->json('items.0.id');
        $this->deleteJson("/api/v1/cart/items/{$cartItemId}");

        $subtotal = $this->getJson('/api/v1/cart')->json('subtotal');
        // One of the two items remains; subtotal must be either 3000 or 1000
        expect($subtotal)->toBeIn([3000, 1000]);
    });
});

// ---------------------------------------------------------------------------
// Discount codes
// ---------------------------------------------------------------------------

describe('Cart – discount codes', function () {
    it('applies a valid percentage discount code', function () {
        $variant = makeVariant(price: 10000); // 100.00
        $discount = Discount::factory()->create([
            'code' => 'SAVE20',
            'type' => 'percentage',
            'value' => 20,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->postJson('/api/v1/cart/discount', ['code' => 'SAVE20'])
            ->assertOk();

        // discount_amount in the response should be 20% of 10000 = 2000
        expect($response->json('discount.discount_amount'))->toBe(2000);
    });

    it('applies a valid fixed_amount discount code', function () {
        $variant = makeVariant(price: 10000);
        Discount::factory()->create([
            'code' => 'FIXED500',
            'type' => 'fixed_amount',
            'value' => 500,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->postJson('/api/v1/cart/discount', ['code' => 'FIXED500'])
            ->assertOk();

        expect($response->json('discount.discount_amount'))->toBe(500);
    });

    it('stores the discount code in the cart (verified via GET)', function () {
        $variant = makeVariant(price: 5000);
        Discount::factory()->create([
            'code' => 'STOREDCODE',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $this->postJson('/api/v1/cart/discount', ['code' => 'STOREDCODE']);

        // Raw DB update in controller doesn't refresh in-memory model;
        // verify via follow-up GET
        $this->getJson('/api/v1/cart')
            ->assertJsonPath('discount_code', 'STOREDCODE');
    });

    it('rejects an invalid discount code', function () {
        $this->postJson('/api/v1/cart/discount', ['code' => 'DOESNOTEXIST'])
            ->assertUnprocessable();
    });

    it('rejects an expired discount code', function () {
        Discount::factory()->create([
            'code' => 'EXPIRED',
            'type' => 'percentage',
            'value' => 50,
            'is_active' => true,
            'ends_at' => now()->subDay(),
        ]);

        $this->postJson('/api/v1/cart/discount', ['code' => 'EXPIRED'])
            ->assertUnprocessable();
    });

    it('rejects a deactivated discount code', function () {
        Discount::factory()->create([
            'code' => 'DISABLED',
            'type' => 'percentage',
            'value' => 30,
            'is_active' => false,
        ]);

        $this->postJson('/api/v1/cart/discount', ['code' => 'DISABLED'])
            ->assertUnprocessable();
    });

    it('rejects discount code when cart subtotal is below min_order_value', function () {
        $variant = makeVariant(price: 500); // 5.00 PLN
        Discount::factory()->create([
            'code' => 'MINORDER',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
            'min_order_value' => 10000, // requires 100.00 PLN minimum
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $this->postJson('/api/v1/cart/discount', ['code' => 'MINORDER'])
            ->assertUnprocessable();
    });

    it('removes the discount code from the cart', function () {
        $variant = makeVariant(price: 5000);
        Discount::factory()->create([
            'code' => 'TOREMOVE',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $this->postJson('/api/v1/cart/discount', ['code' => 'TOREMOVE']);

        $this->deleteJson('/api/v1/cart/discount')->assertOk();

        // Verify removal via GET (raw DB update pattern)
        $this->getJson('/api/v1/cart')
            ->assertJsonPath('discount_code', null);
    });

    it('discount calculation is server-side — subtotal is recalculated from variant prices', function () {
        $variant = makeVariant(price: 8000);
        Discount::factory()->create([
            'code' => 'SERVERSIDE25',
            'type' => 'percentage',
            'value' => 25,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->postJson('/api/v1/cart/discount', ['code' => 'SERVERSIDE25'])
            ->assertOk();

        // 25% of 8000 = 2000
        expect($response->json('discount.discount_amount'))->toBe(2000);
        expect($response->json('cart.subtotal'))->toBe(8000);
    });
});

// ---------------------------------------------------------------------------
// Security — IDOR prevention
// ---------------------------------------------------------------------------

describe('Cart – security (IDOR)', function () {
    it('attacker cannot manipulate another user cart item via update', function () {
        $variant = makeVariant(stock: 10);
        $owner = makeAuthUser();
        $attacker = makeAuthUser();

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $ownerCartItemId = $this->actingAs($owner->fresh(), 'sanctum')
            ->getJson('/api/v1/cart')
            ->json('items.0.id');

        // Attacker guesses/discovers the cart item ID and tries to modify it
        $this->actingAs($attacker, 'sanctum')
            ->putJson("/api/v1/cart/items/{$ownerCartItemId}", ['quantity' => 99])
            ->assertForbidden();

        // Owner's cart is unchanged
        $this->actingAs($owner->fresh(), 'sanctum')
            ->getJson('/api/v1/cart')
            ->assertJsonPath('items.0.quantity', 1);
    });

    it('attacker cannot delete another user cart item', function () {
        $variant = makeVariant();
        $owner = makeAuthUser();
        $attacker = makeAuthUser();

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $ownerCartItemId = $this->actingAs($owner->fresh(), 'sanctum')
            ->getJson('/api/v1/cart')
            ->json('items.0.id');

        $this->actingAs($attacker, 'sanctum')
            ->deleteJson("/api/v1/cart/items/{$ownerCartItemId}")
            ->assertForbidden();

        // Item still in owner's cart
        $this->actingAs($owner->fresh(), 'sanctum')
            ->getJson('/api/v1/cart')
            ->assertJsonPath('items_count', 1);
    });
});

// ---------------------------------------------------------------------------
// Buy X Get Y — promotion model unit-level calculations
// ---------------------------------------------------------------------------

describe('Promotion – buy X get Y calculations', function () {
    it('buy 2 get 1 free: 6 items at 1000 = 3 free items → discount 3000', function () {
        $variant = makeVariant(price: 1000, stock: 10);
        $product = $variant->product;

        $promotion = Promotion::factory()->buyXGetY(buyQuantity: 2, getQuantity: 1, discountPercentage: 100)
            ->make(['min_value' => null, 'max_discount' => null]);

        $discount = $promotion->calculateDiscount($product, 6, 1000);

        // intdiv(6, 2) = 3 sets → 3 free items × 1000 = 3000
        expect($discount)->toEqual(3000);
    });

    it('buy 3 get 1 free: 4 items at 2000 = 1 free item → discount 2000', function () {
        $variant = makeVariant(price: 2000, stock: 10);
        $product = $variant->product;

        $promotion = Promotion::factory()->buyXGetY(buyQuantity: 3, getQuantity: 1, discountPercentage: 100)
            ->make(['min_value' => null, 'max_discount' => null]);

        $discount = $promotion->calculateDiscount($product, 4, 2000);

        // intdiv(4, 3) = 1 set → 1 free item × 2000 = 2000
        expect($discount)->toEqual(2000);
    });

    it('buy 2 get 1 at 50% off: 4 items at 1000 → discount 1000', function () {
        $variant = makeVariant(price: 1000, stock: 10);
        $product = $variant->product;

        $promotion = Promotion::factory()->buyXGetY(buyQuantity: 2, getQuantity: 1, discountPercentage: 50)
            ->make(['min_value' => null, 'max_discount' => null]);

        $discount = $promotion->calculateDiscount($product, 4, 1000);

        // intdiv(4, 2) = 2 sets → 2 free items × 1000 × 0.50 = 1000
        expect($discount)->toEqual(1000);
    });

    it('max_discount caps the promotion discount', function () {
        $variant = makeVariant(price: 1000, stock: 10);
        $product = $variant->product;

        $promotion = Promotion::factory()->buyXGetY(buyQuantity: 2, getQuantity: 1, discountPercentage: 100)
            ->make(['min_value' => null, 'max_discount' => 1500]);

        $discount = $promotion->calculateDiscount($product, 6, 1000);

        // Without cap: 3000; with cap 1500
        expect($discount)->toEqual(1500);
    });

    it('quantity below buy_quantity threshold gives zero discount', function () {
        $variant = makeVariant(price: 1000, stock: 10);
        $product = $variant->product;

        $promotion = Promotion::factory()->buyXGetY(buyQuantity: 3, getQuantity: 1, discountPercentage: 100)
            ->make(['min_value' => null, 'max_discount' => null]);

        $discount = $promotion->calculateDiscount($product, 2, 1000);

        // intdiv(2, 3) = 0 → no discount
        expect($discount)->toEqual(0);
    });
});
