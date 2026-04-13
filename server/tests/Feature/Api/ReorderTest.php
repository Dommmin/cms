<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reorderMakeUser(): User
{
    return User::factory()->create();
}

function reorderMakeCustomer(User $user): Customer
{
    return Customer::query()->firstOrCreate(
        ['user_id' => $user->id],
        ['email' => $user->email, 'first_name' => $user->name],
    );
}

function reorderMakeVariant(bool $active = true, int $stock = 10): ProductVariant
{
    $pType = ProductType::query()->firstOrCreate(
        ['slug' => 'reorder-simple'],
        ['name' => 'Reorder Simple', 'has_variants' => false, 'is_shippable' => true],
    );
    $cat = Category::query()->firstOrCreate(
        ['slug' => 'reorder-cat'],
        ['name' => 'Reorder Cat', 'is_active' => true],
    );
    $product = Product::query()->create([
        'name' => 'Reorder Product '.Str::random(4),
        'slug' => 'reorder-prod-'.Str::random(8),
        'product_type_id' => $pType->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'RO-'.Str::random(6),
        'name' => 'Default',
        'price' => 3000,
        'stock_quantity' => $stock,
        'is_active' => $active,
    ]);
}

function reorderMakeOrder(Customer $customer, string $status = 'delivered'): Order
{
    $address = Address::query()->create([
        'first_name' => 'Jan',
        'last_name' => 'Kowalski',
        'street' => 'ul. Testowa 1',
        'city' => 'Warszawa',
        'postal_code' => '00-001',
        'country_code' => 'PL',
        'phone' => '500000000',
        'address_type' => 'billing',
    ]);

    return Order::query()->create([
        'reference_number' => Order::generateReferenceNumber(),
        'customer_id' => $customer->id,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => $status,
        'subtotal' => 3000,
        'discount_amount' => 0,
        'shipping_cost' => 0,
        'tax_amount' => 0,
        'total' => 3000,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);
}

function reorderAddItem(Order $order, ProductVariant $variant, int $qty = 1): void
{
    $order->items()->create([
        'variant_id' => $variant->id,
        'product_name' => 'Reorder Product',
        'variant_name' => 'Default',
        'sku' => $variant->sku,
        'unit_price' => $variant->price,
        'total_price' => $variant->price * $qty,
        'quantity' => $qty,
    ]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(function (): void {
    Notification::fake();
});

describe('Reorder', function (): void {
    it('adds available items to cart and returns cart token', function (): void {
        $user = reorderMakeUser();
        $customer = reorderMakeCustomer($user);
        $variant = reorderMakeVariant();
        $order = reorderMakeOrder($customer);
        reorderAddItem($order, $variant, 2);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/reorder', $order->reference_number))
            ->assertOk()
            ->assertJsonStructure(['added', 'skipped', 'message']);

        expect($response->json('added'))->toBe(1);
        expect($response->json('skipped'))->toBe(0);

        // Authenticated users get a customer-linked cart (session_token is null for customer carts)
        $this->assertDatabaseHas('carts', ['customer_id' => $customer->id]);
        $this->assertDatabaseHas('cart_items', ['quantity' => 2]);
    });

    it('skips inactive variants', function (): void {
        $user = reorderMakeUser();
        $customer = reorderMakeCustomer($user);
        $inactiveVariant = reorderMakeVariant(active: false, stock: 5);
        $order = reorderMakeOrder($customer);
        reorderAddItem($order, $inactiveVariant);

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/reorder', $order->reference_number))
            ->assertOk()
            ->assertJsonPath('added', 0)
            ->assertJsonPath('skipped', 1);
    });

    it('skips out-of-stock variants', function (): void {
        $user = reorderMakeUser();
        $customer = reorderMakeCustomer($user);
        $variant = reorderMakeVariant(active: true, stock: 0);
        $order = reorderMakeOrder($customer);
        reorderAddItem($order, $variant);

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/reorder', $order->reference_number))
            ->assertOk()
            ->assertJsonPath('added', 0)
            ->assertJsonPath('skipped', 1);
    });

    it('increments quantity when item already exists in cart', function (): void {
        $user = reorderMakeUser();
        $customer = reorderMakeCustomer($user);
        $variant = reorderMakeVariant();
        $order = reorderMakeOrder($customer);
        reorderAddItem($order, $variant, 2);

        // Create a customer cart with an existing item (authenticated flow uses customer cart)
        $cart = Cart::query()->create(['customer_id' => $customer->id]);
        CartItem::query()->create(['cart_id' => $cart->id, 'variant_id' => $variant->id, 'quantity' => 1]);

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/reorder', $order->reference_number))
            ->assertOk()
            ->assertJsonPath('added', 1);

        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $cart->id,
            'variant_id' => $variant->id,
            'quantity' => 3,
        ]);
    });

    it('returns 404 for a non-existent order reference', function (): void {
        $user = reorderMakeUser();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders/ORD-DOESNOTEXIST/reorder')
            ->assertNotFound();
    });

    it('returns 404 when trying to reorder another user order', function (): void {
        $owner = reorderMakeUser();
        $ownerCustomer = reorderMakeCustomer($owner);
        $order = reorderMakeOrder($ownerCustomer);

        $attacker = reorderMakeUser();

        $this->actingAs($attacker, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/reorder', $order->reference_number))
            ->assertNotFound();
    });

    it('requires authentication', function (): void {
        $this->postJson('/api/v1/orders/ORD-ANY/reorder')
            ->assertUnauthorized();
    });
});
