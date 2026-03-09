<?php

declare(strict_types=1);

use App\Events\OrderDelivered;
use App\Listeners\SendReviewRequestEmail;
use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use App\Notifications\ReviewRequestNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

function createDeliveredOrder(): array
{
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    $address = Address::query()->create([
        'first_name' => 'Test', 'last_name' => 'User',
        'street' => 'Main St 1', 'city' => 'Warsaw',
        'postal_code' => '00-001', 'country_code' => 'PL',
        'phone' => '500000000', 'address_type' => 'billing',
    ]);

    $order = Order::query()->create([
        'reference_number' => Order::generateReferenceNumber(),
        'customer_id' => $customer->id,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => 'delivered',
        'subtotal' => 5000,
        'discount_amount' => 0,
        'shipping_cost' => 500,
        'tax_amount' => 0,
        'total' => 5500,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);

    return [$user, $order];
}

it('sends review request notification when order is delivered', function () {
    [$user, $order] = createDeliveredOrder();

    $listener = new SendReviewRequestEmail;
    $listener->handle(new OrderDelivered($order));

    Notification::assertSentTo($user, ReviewRequestNotification::class);
});

it('does not send review request when order has no customer', function () {
    $address = Address::query()->create([
        'first_name' => 'Test', 'last_name' => 'User',
        'street' => 'Main St 1', 'city' => 'Warsaw',
        'postal_code' => '00-001', 'country_code' => 'PL',
        'phone' => '500000000', 'address_type' => 'billing',
    ]);

    $order = Order::query()->create([
        'reference_number' => Order::generateReferenceNumber(),
        'customer_id' => null,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => 'delivered',
        'subtotal' => 5000,
        'discount_amount' => 0,
        'shipping_cost' => 500,
        'tax_amount' => 0,
        'total' => 5500,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);

    $listener = new SendReviewRequestEmail;
    $listener->handle(new OrderDelivered($order));

    Notification::assertNothingSent();
});

it('review request mail includes order reference', function () {
    [$user, $order] = createDeliveredOrder();

    $notification = new ReviewRequestNotification($order);
    $mailMessage = $notification->toMail($user);

    expect($mailMessage->subject)->toContain('order');
    expect(collect($mailMessage->introLines)->implode(' '))->toContain($order->reference_number);
});

it('OrderDelivered event triggers SendReviewRequestEmail listener', function () {
    [$user, $order] = createDeliveredOrder();

    event(new OrderDelivered($order));

    Notification::assertSentTo($user, ReviewRequestNotification::class);
});
