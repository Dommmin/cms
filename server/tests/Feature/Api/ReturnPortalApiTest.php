<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

function makeReturnPortalAddress(): Address
{
    return Address::query()->create([
        'first_name' => 'Jan',
        'last_name' => 'Kowalski',
        'street' => 'ul. Portalowa 1',
        'city' => 'Warszawa',
        'postal_code' => '00-001',
        'country_code' => 'PL',
        'phone' => '500000000',
        'address_type' => 'billing',
    ]);
}

function makeReturnPortalOrder(?Customer $customer = null, ?string $guestEmail = null): Order
{
    $address = makeReturnPortalAddress();

    return Order::query()->create([
        'reference_number' => Order::generateReferenceNumber(),
        'customer_id' => $customer?->id,
        'guest_email' => $guestEmail,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => 'delivered',
        'subtotal' => 5000,
        'discount_amount' => 0,
        'shipping_cost' => 0,
        'tax_amount' => 0,
        'total' => 5000,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);
}

function addReturnPortalOrderItem(Order $order): int
{
    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'return-portal-simple'],
        ['name' => 'Return Portal Simple', 'has_variants' => false, 'is_shippable' => true],
    );
    $category = Category::query()->firstOrCreate(
        ['slug' => 'return-portal-category'],
        ['name' => 'Return Portal Category', 'is_active' => true],
    );
    $product = Product::query()->create([
        'name' => 'Portal Product '.Str::random(4),
        'slug' => 'portal-product-'.Str::random(8),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'PORTAL-'.Str::random(6),
        'name' => 'Default',
        'price' => 5000,
        'stock_quantity' => 10,
    ]);

    return (int) $order->items()->create([
        'variant_id' => $variant->id,
        'product_name' => 'Portal Product',
        'variant_name' => 'Default',
        'sku' => $variant->sku,
        'unit_price' => 5000,
        'total_price' => 5000,
        'quantity' => 1,
    ])->id;
}

describe('Return portal API', function (): void {
    beforeEach(function (): void {
        Notification::fake();
    });

    it('lists authenticated customer returns', function (): void {
        $user = User::factory()->create();
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
            'is_active' => true,
        ]);
        $order = makeReturnPortalOrder($customer);
        ReturnRequest::query()->create([
            'order_id' => $order->id,
            'reference_number' => 'RET-'.uniqid(),
            'return_type' => 'complaint',
            'status' => 'pending',
            'reason' => 'Damaged',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/returns')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order_reference_number', $order->reference_number);
    });

    it('shows a single authenticated return belonging to the customer', function (): void {
        $user = User::factory()->create();
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
            'is_active' => true,
        ]);
        $order = makeReturnPortalOrder($customer);
        $return = ReturnRequest::query()->create([
            'order_id' => $order->id,
            'reference_number' => 'RET-'.uniqid(),
            'return_type' => 'return',
            'status' => 'pending',
            'reason' => 'Too small',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/returns/'.$return->reference_number)
            ->assertOk()
            ->assertJsonPath('reference_number', $return->reference_number)
            ->assertJsonPath('order_reference_number', $order->reference_number);
    });

    it('lets guests look up an order for returns by reference and email', function (): void {
        $order = makeReturnPortalOrder(null, 'guest@example.com');
        addReturnPortalOrderItem($order);

        $this->postJson('/api/v1/returns/lookup', [
            'reference_number' => $order->reference_number,
            'email' => 'guest@example.com',
        ])
            ->assertOk()
            ->assertJsonPath('reference_number', $order->reference_number)
            ->assertJsonCount(1, 'items')
            ->assertJsonPath('items.0.return_eligibility.eligible_quantity', 1)
            ->assertJsonPath('return_eligibility.eligible_types.0', 'return');
    });

    it('lets guests submit a return request after lookup', function (): void {
        $order = makeReturnPortalOrder(null, 'guest@example.com');
        $orderItemId = addReturnPortalOrderItem($order);

        $this->postJson('/api/v1/returns/guest-request', [
            'reference_number' => $order->reference_number,
            'email' => 'guest@example.com',
            'reason' => 'Changed my mind',
            'type' => 'return',
            'items' => [
                ['order_item_id' => $orderItemId, 'quantity' => 1],
            ],
        ])
            ->assertCreated()
            ->assertJsonStructure(['reference_number']);

        $this->assertDatabaseHas('returns', [
            'order_id' => $order->id,
            'reason' => 'Changed my mind',
            'return_type' => 'return',
        ]);
    });

    it('rejects return submission when order item does not belong to the order', function (): void {
        $user = User::factory()->create();
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
            'is_active' => true,
        ]);
        $order = makeReturnPortalOrder($customer);
        $otherOrder = makeReturnPortalOrder($customer);
        addReturnPortalOrderItem($order);
        $otherOrderItemId = addReturnPortalOrderItem($otherOrder);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders/'.$order->reference_number.'/return', [
                'reason' => 'Wrong item id',
                'type' => 'return',
                'items' => [
                    ['order_item_id' => $otherOrderItemId, 'quantity' => 1],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.order_item_id']);
    });

    it('rejects return submission when item quantity was already fully requested', function (): void {
        $order = makeReturnPortalOrder(null, 'guest@example.com');
        $orderItemId = addReturnPortalOrderItem($order);

        $return = ReturnRequest::query()->create([
            'order_id' => $order->id,
            'reference_number' => 'RET-'.uniqid(),
            'return_type' => 'return',
            'status' => 'pending',
            'reason' => 'Already requested',
        ]);

        $return->items()->create([
            'order_item_id' => $orderItemId,
            'quantity' => 1,
        ]);

        $this->postJson('/api/v1/returns/guest-request', [
            'reference_number' => $order->reference_number,
            'email' => 'guest@example.com',
            'reason' => 'Second request',
            'type' => 'return',
            'items' => [
                ['order_item_id' => $orderItemId, 'quantity' => 1],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    });
});
