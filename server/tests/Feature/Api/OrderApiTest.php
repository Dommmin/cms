<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Models\Address;
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
// Helpers (file-scoped to avoid global function name collisions)
// ---------------------------------------------------------------------------

function makeOrderForCustomer(Customer $customer, string $status = 'pending'): Order
{
    $address = Address::query()->create([
        'first_name' => 'Jan', 'last_name' => 'Kowalski',
        'street' => 'ul. Testowa 1', 'city' => 'Warszawa',
        'postal_code' => '00-001', 'country_code' => 'PL',
        'phone' => '500000000', 'address_type' => 'billing',
    ]);

    return Order::query()->create([
        'reference_number' => Order::generateReferenceNumber(),
        'customer_id' => $customer->id,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => $status,
        'subtotal' => 5000,
        'discount_amount' => 0,
        'shipping_cost' => 0,
        'tax_amount' => 0,
        'total' => 5000,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);
}

function makeCustomerForUser(User $user): Customer
{
    return Customer::query()->firstOrCreate(
        ['user_id' => $user->id],
        ['email' => $user->email, 'first_name' => $user->name]
    );
}

beforeEach(function (): void {
    Notification::fake();
});

// ---------------------------------------------------------------------------
// Listing orders
// ---------------------------------------------------------------------------

describe('Order listing', function (): void {
    it('authenticated user can list their orders', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        makeOrderForCustomer($customer);
        makeOrderForCustomer($customer);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('returns empty list when the user has no orders', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders')
            ->assertOk()
            ->assertJsonPath('data', []);
    });

    it('guest cannot list orders — requires authentication', function (): void {
        $this->getJson('/api/v1/orders')->assertUnauthorized();
    });
});

// ---------------------------------------------------------------------------
// Viewing a single order
// ---------------------------------------------------------------------------

describe('Order detail', function (): void {
    it('user can view their own order', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders/'.$order->reference_number)
            ->assertOk()
            ->assertJsonPath('reference_number', $order->reference_number)
            ->assertJsonPath('status', 'pending');
    });

    it('user cannot view another user order — gets 404 not 403', function (): void {
        $owner = User::factory()->create();
        $ownerCustomer = makeCustomerForUser($owner);
        $order = makeOrderForCustomer($ownerCustomer);

        $attacker = User::factory()->create();

        $this->actingAs($attacker, 'sanctum')
            ->getJson('/api/v1/orders/'.$order->reference_number)
            ->assertNotFound();
    });

    it('returns 404 for a completely nonexistent reference number', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders/ORD-DOESNOTEXIST')
            ->assertNotFound();
    });

    it('guest cannot view any order — requires authentication', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer);

        $this->getJson('/api/v1/orders/'.$order->reference_number)
            ->assertUnauthorized();
    });
});

// ---------------------------------------------------------------------------
// Cancelling an order
// ---------------------------------------------------------------------------

describe('Order cancellation', function (): void {
    it('user can cancel their own pending order', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'pending');

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/cancel', $order->reference_number))
            ->assertOk()
            ->assertJsonPath('status', OrderStatusEnum::CANCELLED->value);

        expect($order->fresh()->getRawOriginal('status'))->toBe(OrderStatusEnum::CANCELLED->value);
    });

    it('user can cancel their own awaiting_payment order', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'awaiting_payment');

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/cancel', $order->reference_number))
            ->assertOk()
            ->assertJsonPath('status', OrderStatusEnum::CANCELLED->value);

        expect($order->fresh()->getRawOriginal('status'))->toBe(OrderStatusEnum::CANCELLED->value);
    });

    it('cannot cancel an order that is already shipped', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'shipped');

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/cancel', $order->reference_number))
            ->assertUnprocessable();

        expect($order->fresh()->getRawOriginal('status'))->toBe('shipped');
    });

    it('cannot cancel a delivered order', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'delivered');

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/cancel', $order->reference_number))
            ->assertUnprocessable();
    });

    it('cannot cancel a cancelled order again', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'cancelled');

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/cancel', $order->reference_number))
            ->assertUnprocessable();
    });

    it('user cannot cancel another user order — gets 404', function (): void {
        $owner = User::factory()->create();
        $ownerCustomer = makeCustomerForUser($owner);
        $order = makeOrderForCustomer($ownerCustomer, 'pending');

        $attacker = User::factory()->create();

        $this->actingAs($attacker, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/cancel', $order->reference_number))
            ->assertNotFound();

        expect($order->fresh()->getRawOriginal('status'))->toBe('pending');
    });
});

// ---------------------------------------------------------------------------
// Return requests
// ---------------------------------------------------------------------------

describe('Return request', function (): void {
    it('user can request return on a delivered order', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'delivered');

        // Build a minimal variant so order_items.variant_id NOT NULL constraint is satisfied
        $pType = ProductType::query()->firstOrCreate(
            ['slug' => 'simple'],
            ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
        );
        $cat = Category::query()->firstOrCreate(
            ['slug' => 'order-api-cat'],
            ['name' => 'Order API Cat', 'is_active' => true]
        );
        $product = Product::query()->create([
            'name' => 'Return Product'.Str::random(4),
            'slug' => 'return-prod-'.Str::random(8),
            'product_type_id' => $pType->id,
            'category_id' => $cat->id,
            'is_active' => true,
            'is_saleable' => true,
        ]);
        $variant = ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => 'RET-'.Str::random(6),
            'name' => 'Default',
            'price' => 5000,
            'stock_quantity' => 10,
        ]);

        $orderItem = $order->items()->create([
            'variant_id' => $variant->id,
            'product_name' => 'Test Product',
            'variant_name' => 'Default',
            'sku' => $variant->sku,
            'unit_price' => 5000,
            'total_price' => 5000,
            'quantity' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/return', $order->reference_number), [
                'reason' => 'Item arrived damaged',
                'type' => 'return',
                'items' => [
                    ['order_item_id' => $orderItem->id, 'quantity' => 1],
                ],
            ])
            ->assertStatus(201)
            ->assertJsonStructure(['reference_number']);

        $this->assertDatabaseHas('returns', [
            'order_id' => $order->id,
            'return_type' => 'return',
            'reason' => 'Item arrived damaged',
        ]);
    });

    it('cannot request return on a pending order', function (): void {
        $user = User::factory()->create();
        $customer = makeCustomerForUser($user);
        $order = makeOrderForCustomer($customer, 'pending');

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/return', $order->reference_number), [
                'reason' => 'Changed my mind',
                'type' => 'return',
                'items' => [['order_item_id' => 1, 'quantity' => 1]],
            ])
            ->assertUnprocessable();
    });

    it('cannot request return on another user order — gets 404', function (): void {
        $owner = User::factory()->create();
        $ownerCustomer = makeCustomerForUser($owner);
        $order = makeOrderForCustomer($ownerCustomer, 'delivered');

        $attacker = User::factory()->create();

        $this->actingAs($attacker, 'sanctum')
            ->postJson(sprintf('/api/v1/orders/%s/return', $order->reference_number), [
                'reason' => 'IDOR attempt',
                'type' => 'return',
                'items' => [['order_item_id' => 1, 'quantity' => 1]],
            ])
            ->assertNotFound();
    });
});
