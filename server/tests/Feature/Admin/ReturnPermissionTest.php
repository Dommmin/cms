<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function createAdminReturnRequest(): ReturnRequest
{
    $customerUser = User::factory()->create();
    $customer = Customer::factory()->create([
        'user_id' => $customerUser->id,
        'email' => $customerUser->email,
    ]);

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

    $order = Order::query()->create([
        'reference_number' => 'ADMIN-RET-'.uniqid(),
        'customer_id' => $customer->id,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => 'delivered',
        'subtotal' => 10000,
        'discount_amount' => 0,
        'shipping_cost' => 0,
        'tax_amount' => 0,
        'total' => 10000,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);

    return ReturnRequest::query()->create([
        'order_id' => $order->id,
        'reference_number' => 'RET-ADMIN-'.uniqid(),
        'return_type' => 'return',
        'status' => 'received',
        'refund_amount' => 1000,
    ]);
}

beforeEach(function (): void {
    Event::fake();
    Notification::fake();

    foreach (['returns.view', 'returns.manage', 'returns.refund'] as $permission) {
        Permission::query()->firstOrCreate([
            'name' => $permission,
            'guard_name' => 'web',
        ]);
    }

    foreach (['support', 'viewer'] as $roleName) {
        Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
    }
});

it('allows admin panel returns index for users with returns.view permission', function (): void {
    $user = User::factory()->create();
    $role = Role::findByName('support');
    $role->syncPermissions(['returns.view']);

    $user->assignRole($role);

    $this->actingAs($user)
        ->get('/panel/ecommerce/returns')
        ->assertOk();
});

it('forbids admin panel returns index without returns.view permission', function (): void {
    $user = User::factory()->create();
    $user->assignRole('viewer');

    $this->actingAs($user)
        ->get('/panel/ecommerce/returns')
        ->assertForbidden();
});

it('forbids refund action without returns.refund permission', function (): void {
    $user = User::factory()->create();
    $role = Role::findByName('support');
    $role->syncPermissions(['returns.view', 'returns.manage']);

    $user->assignRole($role);

    $returnRequest = createAdminReturnRequest();

    $this->actingAs($user)
        ->post(
            sprintf('/panel/ecommerce/returns/%d/process-refund', $returnRequest->id),
            ['refund_amount' => 1000],
        )
        ->assertForbidden();
});
