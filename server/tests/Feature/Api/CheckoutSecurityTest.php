<?php

declare(strict_types=1);

use App\Enums\ShippingCarrierEnum;
use App\Models\AffiliateCode;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\Referral;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// Helpers (file-scoped names)
// ---------------------------------------------------------------------------

function secureShipping(): ShippingMethod
{
    return ShippingMethod::query()->firstOrCreate(
        ['name' => 'Odbiór testowy'],
        [
            'carrier' => ShippingCarrierEnum::PICKUP,
            'is_active' => true,
            'base_price' => 1500, // 15.00 PLN
            'price_per_kg' => 0,
            'max_weight' => 999.0,
        ],
    );
}

function secureCheckoutAddress(): array
{
    return [
        'first_name' => 'Jan', 'last_name' => 'Kowalski',
        'street' => 'ul. Testowa 1', 'city' => 'Warszawa',
        'postal_code' => '00-001', 'country_code' => 'PL',
        'phone' => '500000000',
    ];
}

/**
 * Build an authenticated customer cart with one variant.
 * Returns [$user, $cart, $variant].
 *
 * @return array{0: User, 1: Cart, 2: ProductVariant}
 */
function secureCheckoutCart(int $price = 5000, int $qty = 2): array
{
    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true],
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'secure-test-cat'],
        ['name' => 'Secure Test', 'is_active' => true],
    );

    $product = Product::query()->create([
        'name' => 'Secure Product '.Str::random(4),
        'slug' => 'secure-prod-'.Str::random(8),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'SEC-'.Str::random(6),
        'name' => 'Default',
        'price' => $price,
        'stock_quantity' => 50,
        'is_active' => true,
    ]);

    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => $user->name,
    ]);

    $cart = Cart::query()->create(['customer_id' => $customer->id]);
    $cart->items()->create(['variant_id' => $variant->id, 'quantity' => $qty]);

    return [$user, $cart, $variant];
}

beforeEach(function () {
    Notification::fake();
});

// ---------------------------------------------------------------------------
// Price integrity – total is always calculated server-side
// ---------------------------------------------------------------------------

describe('Checkout – price integrity', function () {
    it('order.subtotal equals sum of variant prices × quantities (server-calculated)', function () {
        [$user, , $variant] = secureCheckoutCart(price: 3000, qty: 3); // 3 × 3000 = 9000
        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'price-integrity-1'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ]);

        $response->assertStatus(201);
        $order = $response->json('order');

        expect($order['subtotal'])->toBe(9000)
            ->and($order['discount_amount'])->toBe(0);
    });

    it('order.total = subtotal + shipping_cost when no discount', function () {
        [$user] = secureCheckoutCart(price: 2000, qty: 1);
        $shipping = secureShipping(); // base_price = 1500

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'price-integrity-2'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ]);

        $response->assertStatus(201);
        $order = $response->json('order');

        expect($order['total'])->toBe($order['subtotal'] + $order['shipping_cost']);
    });

    it('total can never go negative even with oversized discount stored in cart', function () {
        // Manually craft a cart with a discount that exceeds subtotal
        [$user, $cart] = secureCheckoutCart(price: 100, qty: 1); // subtotal = 100

        // Manually store a fixed_amount code worth 99999
        $discount = Discount::factory()->create([
            'code' => 'HUGEDISCOUNT',
            'type' => 'fixed_amount',
            'value' => 99999,
            'is_active' => true,
        ]);
        $cart->update(['discount_code' => $discount->code]);

        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'price-integrity-3'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ]);

        $response->assertStatus(201);
        expect($response->json('order.total'))->toBeGreaterThanOrEqual(0);
    });

    it('stock quantity is NOT decremented after checkout (documenting current behavior)', function () {
        [$user, , $variant] = secureCheckoutCart(price: 1000, qty: 2);
        $stockBefore = $variant->stock_quantity;
        $shipping = secureShipping();

        $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'stock-doc-1'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ])->assertStatus(201);

        // Current design: stock is NOT decremented at checkout time.
        // This is a known limitation — concurrent orders can oversell.
        expect($variant->fresh()->stock_quantity)->toBe($stockBefore);
    });
});

// ---------------------------------------------------------------------------
// Discount revalidation at checkout
// ---------------------------------------------------------------------------

describe('Checkout – discount revalidation', function () {
    it('applies discount code stored in cart and sets order.discount_amount correctly', function () {
        [$user, $cart] = secureCheckoutCart(price: 10000, qty: 1); // subtotal = 10000

        $discount = Discount::factory()->create([
            'code' => 'VALID20',
            'type' => 'percentage',
            'value' => 20,
            'is_active' => true,
        ]);
        $cart->update(['discount_code' => $discount->code]);
        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'disc-revalidate-1'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ])->assertStatus(201);

        $order = $response->json('order');
        expect($order['discount_amount'])->toBe(2000); // 20% of 10000
        expect($order['total'])->toBeLessThan(10000 + $order['shipping_cost']);
    });

    it('ignores discount code that expired between cart apply and checkout', function () {
        [$user, $cart] = secureCheckoutCart(price: 10000, qty: 1);

        // Code is expired NOW (ends_at in the past)
        Discount::factory()->create([
            'code' => 'EXPIREDCODE',
            'type' => 'percentage',
            'value' => 50,
            'is_active' => true,
            'ends_at' => now()->subDay(),
        ]);

        $cart->update(['discount_code' => 'EXPIREDCODE']);
        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'disc-revalidate-2'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ])->assertStatus(201); // checkout still succeeds

        // Discount is silently ignored — no discount applied
        expect($response->json('order.discount_amount'))->toBe(0);
    });

    it('ignores discount code that was deactivated before checkout', function () {
        [$user, $cart] = secureCheckoutCart(price: 5000, qty: 1);

        Discount::factory()->create([
            'code' => 'DEACTIVATED',
            'type' => 'percentage',
            'value' => 30,
            'is_active' => false, // deactivated
        ]);

        $cart->update(['discount_code' => 'DEACTIVATED']);
        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'disc-revalidate-3'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ])->assertStatus(201);

        expect($response->json('order.discount_amount'))->toBe(0);
    });

    it('free_shipping discount sets order.shipping_cost to zero', function () {
        [$user, $cart] = secureCheckoutCart(price: 5000, qty: 1);

        Discount::factory()->create([
            'code' => 'FREESHIP',
            'type' => 'free_shipping',
            'value' => 0,
            'is_active' => true,
        ]);
        $cart->update(['discount_code' => 'FREESHIP']);

        $shipping = secureShipping(); // base_price = 1500

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'disc-freeship-1'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ])->assertStatus(201);

        expect($response->json('order.shipping_cost'))->toBe(0);
    });

    it('cart is cleared after successful checkout', function () {
        [$user, $cart] = secureCheckoutCart(price: 1000, qty: 1);
        $shipping = secureShipping();

        $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'disc-clear-1'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
            ])->assertStatus(201);

        expect($cart->fresh()->items()->count())->toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Affiliate / referral codes
// ---------------------------------------------------------------------------

describe('Checkout – affiliate codes', function () {
    it('valid affiliate code discounts the order and creates a Referral record', function () {
        [$user, $cart] = secureCheckoutCart(price: 10000, qty: 1); // subtotal = 10000

        $code = AffiliateCode::query()->create([
            'code' => 'PARTNER10',
            'user_id' => User::factory()->create()->id,
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'commission_rate' => 5,
            'is_active' => true,
            'max_uses' => null,
            'uses_count' => 0,
        ]);
        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'affiliate-1'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
                'referral_code' => 'PARTNER10',
            ])->assertStatus(201);

        $order = $response->json('order');
        expect($order['discount_amount'])->toBe(1000); // 10% of 10000

        $this->assertDatabaseHas('referrals', [
            'affiliate_code_id' => $code->id,
            'status' => 'pending',
        ]);

        expect($code->fresh()->uses_count)->toBe(1);
    });

    it('invalid or expired affiliate code is silently ignored and checkout proceeds', function () {
        [$user] = secureCheckoutCart(price: 5000, qty: 1);
        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'affiliate-2'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
                'referral_code' => 'NONEXISTENTCODE',
            ])->assertStatus(201);

        expect($response->json('order.discount_amount'))->toBe(0);
        expect(Referral::query()->count())->toBe(0);
    });

    it('deactivated affiliate code is ignored at checkout', function () {
        [$user] = secureCheckoutCart(price: 5000, qty: 1);

        AffiliateCode::query()->create([
            'code' => 'INACTIVE_AFF',
            'user_id' => User::factory()->create()->id,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'commission_rate' => 5,
            'is_active' => false, // deactivated
            'uses_count' => 0,
        ]);

        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'affiliate-3'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
                'referral_code' => 'INACTIVE_AFF',
            ])->assertStatus(201);

        expect($response->json('order.discount_amount'))->toBe(0);
    });

    it('fixed affiliate discount is capped at cart subtotal', function () {
        [$user] = secureCheckoutCart(price: 200, qty: 1); // subtotal = 200

        AffiliateCode::query()->create([
            'code' => 'FIXED999',
            'user_id' => User::factory()->create()->id,
            'discount_type' => 'fixed',
            'discount_value' => 99999, // way more than subtotal
            'commission_rate' => 0,
            'is_active' => true,
            'uses_count' => 0,
        ]);

        $shipping = secureShipping();

        $response = $this->actingAs($user, 'sanctum')
            ->withHeaders(['Idempotency-Key' => 'affiliate-4'])
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $shipping->id,
                'payment_provider' => 'cash_on_delivery',
                'terms_accepted' => true,
                'billing_address' => secureCheckoutAddress(),
                'shipping_address' => secureCheckoutAddress(),
                'referral_code' => 'FIXED999',
            ])->assertStatus(201);

        expect($response->json('order.total'))->toBeGreaterThanOrEqual(0);
        // discount is capped at subtotal (200), never negative total from discount alone
        expect($response->json('order.discount_amount'))->toBeLessThanOrEqual(200);
    });
});
