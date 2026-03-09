<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Models\User;
use App\States\Order\PendingState;
use Illuminate\Support\Facades\Notification;
use Spatie\ModelStates\Exceptions\CouldNotPerformTransition;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Notification::fake();

    Role::firstOrCreate(['name' => 'admin']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);
});

function createTestOrder(string $status = 'pending'): App\Models\Order
{
    $user = User::factory()->create();

    $customer = App\Models\Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'Customer',
    ]);

    $address = App\Models\Address::query()->create([
        'first_name' => 'Test', 'last_name' => 'Customer',
        'street' => '123 Main St', 'city' => 'City',
        'country_code' => 'PL', 'postal_code' => '00-001',
        'phone' => '500000000',
        'address_type' => 'billing',
    ]);

    return App\Models\Order::query()->create([
        'reference_number' => App\Models\Order::generateReferenceNumber(),
        'customer_id' => $customer->id,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => $status,
        'subtotal' => 1000,
        'discount_amount' => 0,
        'shipping_cost' => 0,
        'tax_amount' => 0,
        'total' => 1000,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);
}

it('starts in pending state', function () {
    $order = createTestOrder('pending');

    expect($order->status)->toBeInstanceOf(PendingState::class);
});

it('transitions from pending to processing', function () {
    $order = createTestOrder('pending');

    $order->changeStatus(OrderStatusEnum::PROCESSING);

    expect((string) $order->fresh()->status)->toBe('processing');
});

it('transitions from pending to cancelled', function () {
    $order = createTestOrder('pending');

    $order->changeStatus(OrderStatusEnum::CANCELLED);

    expect((string) $order->fresh()->status)->toBe('cancelled');
});

it('transitions from awaiting_payment to paid', function () {
    $order = createTestOrder('awaiting_payment');

    $order->changeStatus(OrderStatusEnum::PAID);

    expect((string) $order->fresh()->status)->toBe('paid');
});

it('transitions from shipped to delivered', function () {
    $order = createTestOrder('shipped');

    $order->changeStatus(OrderStatusEnum::DELIVERED);

    expect((string) $order->fresh()->status)->toBe('delivered');
});

it('rejects invalid transition from pending to delivered', function () {
    $order = createTestOrder('pending');

    expect(fn () => $order->changeStatus(OrderStatusEnum::DELIVERED))
        ->toThrow(CouldNotPerformTransition::class);
});

it('rejects invalid transition from shipped to cancelled', function () {
    $order = createTestOrder('shipped');

    expect(fn () => $order->changeStatus(OrderStatusEnum::CANCELLED))
        ->toThrow(CouldNotPerformTransition::class);
});

it('rejects invalid transition from cancelled to paid', function () {
    $order = createTestOrder('cancelled');

    expect(fn () => $order->changeStatus(OrderStatusEnum::PAID))
        ->toThrow(CouldNotPerformTransition::class);
});

it('admin update status endpoint rejects invalid transition with error flash', function () {
    $order = createTestOrder('shipped');

    $this->patch(route('admin.ecommerce.ecommerce.orders.update-status', $order), [
        'status' => OrderStatusEnum::CANCELLED->value,
    ])->assertRedirect()->assertSessionHas('error');
});
