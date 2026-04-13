<?php

declare(strict_types=1);

use App\Models\Currency;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use App\States\Order\CancelledState;
use App\States\Order\DeliveredState;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Currency::factory()->create(['code' => 'PLN', 'is_base' => true]);
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('customers table has notes and is_active columns', function (): void {
    $customer = Customer::factory()->create([
        'notes' => 'Test note',
        'is_active' => false,
    ]);

    expect($customer->notes)->toBe('Test note')
        ->and($customer->is_active)->toBeFalse();
});

it('customer show page returns ltv and notes data', function (): void {
    $customer = Customer::factory()->create([
        'notes' => 'Internal note',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.ecommerce.customers.show', $customer));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/customers/show')
        ->where('customer.notes', 'Internal note')
        ->where('customer.is_active', true)
        ->has('customer.total_orders')
        ->has('customer.total_spent')
        ->has('customer.ltv_30_days')
        ->has('customer.ltv_90_days')
        ->has('customer.avg_order_value')
        ->has('customer.last_order_at')
    );
});

it('customer show page computes ltv correctly', function (): void {
    $customer = Customer::factory()->create();

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => DeliveredState::class,
        'total' => 10000,
    ]);

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => DeliveredState::class,
        'total' => 5000,
    ]);

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => CancelledState::class,
        'total' => 9999,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.ecommerce.customers.show', $customer));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('customer.total_orders', 3)
        ->where('customer.total_spent', 15000)
        ->where('customer.avg_order_value', 7500)
    );
});

it('customer update saves notes and is_active', function (): void {
    $customer = Customer::factory()->create([
        'is_active' => true,
        'notes' => null,
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.ecommerce.customers.update', $customer), [
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'notes' => 'New admin note',
            'is_active' => false,
        ])
        ->assertRedirect();

    $customer->refresh();

    expect($customer->notes)->toBe('New admin note')
        ->and($customer->is_active)->toBeFalse();
});

it('customer edit page loads correctly', function (): void {
    $customer = Customer::factory()->create([
        'notes' => 'Edit me',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.ecommerce.customers.edit', $customer));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/customers/edit')
        ->where('customer.notes', 'Edit me')
        ->where('customer.is_active', true)
    );
});
