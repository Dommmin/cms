<?php

declare(strict_types=1);

use App\Enums\SettingTypeEnum;
use App\Jobs\SendAbandonedCartEmails;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\AbandonedCartNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

function createCartWithItem(Customer $customer, Carbon\CarbonInterface $updatedAt): Cart
{
    $product = Product::factory()->create();
    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'TEST-'.uniqid(),
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 10,
        'is_active' => true,
        'is_default' => true,
    ]);

    $cart = Cart::query()->create([
        'customer_id' => $customer->id,
        'updated_at' => $updatedAt,
    ]);

    CartItem::query()->create([
        'cart_id' => $cart->id,
        'variant_id' => $variant->id,
        'quantity' => 1,
    ]);

    return $cart;
}

it('sends abandoned cart notification to user with cart abandoned for configured hours', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    createCartWithItem($customer, now()->subHours(25));

    $job = new SendAbandonedCartEmails;
    $job->handle();

    Notification::assertSentTo($user, AbandonedCartNotification::class);
});

it('does not send notification for recently updated carts', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    createCartWithItem($customer, now()->subHours(1));

    $job = new SendAbandonedCartEmails;
    $job->handle();

    Notification::assertNothingSent();
});

it('does not send notification for guest carts', function () {
    Cart::query()->create([
        'customer_id' => null,
        'session_token' => 'guest-token',
        'updated_at' => now()->subHours(25),
    ]);

    $job = new SendAbandonedCartEmails;
    $job->handle();

    Notification::assertNothingSent();
});

it('does not send notification for empty carts', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    // Cart without items
    Cart::query()->create([
        'customer_id' => $customer->id,
        'updated_at' => now()->subHours(25),
    ]);

    $job = new SendAbandonedCartEmails;
    $job->handle();

    Notification::assertNothingSent();
});

it('includes discount code in notification when setting is configured', function () {
    Setting::query()->create([
        'group' => 'cart',
        'key' => 'abandoned_cart_discount_code',
        'label' => 'Abandoned Cart Discount',
        'value' => 'COMEBACK10',
        'type' => SettingTypeEnum::String,
    ]);

    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    createCartWithItem($customer, now()->subHours(25));

    $job = new SendAbandonedCartEmails;
    $job->handle();

    Notification::assertSentTo(
        $user,
        AbandonedCartNotification::class,
        fn (AbandonedCartNotification $n) => $n->discountCode === 'COMEBACK10'
    );
});
