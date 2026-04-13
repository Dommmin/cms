<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\User;

function makeOrderWithReturn(Customer $customer): array
{
    $address = Address::query()->create([
        'first_name' => 'Jan', 'last_name' => 'Kowalski',
        'street' => 'ul. Testowa 1', 'city' => 'Warszawa',
        'postal_code' => '00-001', 'country_code' => 'PL',
        'phone' => '500000000', 'address_type' => 'billing',
    ]);

    $order = Order::query()->create([
        'reference_number' => 'TEST-'.uniqid(),
        'customer_id' => $customer->id,
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

    $returnRequest = ReturnRequest::query()->create([
        'order_id' => $order->id,
        'reference_number' => 'RET-'.uniqid(),
        'return_type' => 'return',
        'status' => 'pending',
        'reason' => 'Defective product',
        'customer_notes' => 'Please process ASAP',
        'admin_notes' => null,
        'refund_amount' => null,
        'return_tracking_number' => null,
    ]);

    return [$order, $returnRequest];
}

describe('Return status in order detail', function (): void {
    it('includes returns in the order show response', function (): void {
        $user = User::factory()->create();
        $customer = Customer::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['email' => $user->email, 'first_name' => $user->name],
        );

        [$order, $returnRequest] = makeOrderWithReturn($customer);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders/'.$order->reference_number)
            ->assertSuccessful();

        $response->assertJsonPath('returns.0.return_type', 'return');
        $response->assertJsonPath('returns.0.status', 'pending');
        $response->assertJsonPath('returns.0.reason', 'Defective product');
        $response->assertJsonPath('returns.0.customer_notes', 'Please process ASAP');
    });

    it('returns an empty returns array when no returns exist', function (): void {
        $user = User::factory()->create();
        $customer = Customer::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['email' => $user->email, 'first_name' => $user->name],
        );

        $address = Address::query()->create([
            'first_name' => 'Jane', 'last_name' => 'Doe',
            'street' => 'ul. Nowa 5', 'city' => 'Kraków',
            'postal_code' => '30-001', 'country_code' => 'PL',
            'phone' => '600000000', 'address_type' => 'billing',
        ]);

        $order = Order::query()->create([
            'reference_number' => 'NO-RET-'.uniqid(),
            'customer_id' => $customer->id,
            'billing_address_id' => $address->id,
            'shipping_address_id' => $address->id,
            'status' => 'delivered',
            'subtotal' => 3000,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'total' => 3000,
            'currency_code' => 'PLN',
            'exchange_rate' => 1.0,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders/'.$order->reference_number)
            ->assertSuccessful()
            ->assertJsonPath('returns', []);
    });

    it('ReturnResource contains the required fields', function (): void {
        $user = User::factory()->create();
        $customer = Customer::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['email' => $user->email, 'first_name' => $user->name],
        );

        [$order] = makeOrderWithReturn($customer);

        $returnData = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders/'.$order->reference_number)
            ->assertSuccessful()
            ->json('returns.0');

        expect($returnData)->toHaveKeys([
            'id',
            'reference_number',
            'return_type',
            'status',
            'reason',
            'customer_notes',
            'admin_notes',
            'refund_amount',
            'return_tracking_number',
            'created_at',
            'items',
        ]);
    });
});
