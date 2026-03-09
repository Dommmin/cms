<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\Customer;
use App\Models\User;

it('deletes authenticated carts older than 30 days', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    $oldCart = Cart::query()->create([
        'customer_id' => $customer->id,
        'updated_at' => now()->subDays(31),
    ]);

    $recentCart = Cart::query()->create([
        'customer_id' => $customer->id,
        'updated_at' => now()->subDays(10),
    ]);

    $this->artisan('cart:clean')->assertSuccessful();

    expect(Cart::query()->find($oldCart->id))->toBeNull();
    expect(Cart::query()->find($recentCart->id))->not->toBeNull();
});

it('deletes guest carts older than 7 days', function () {
    $oldGuestCart = Cart::query()->create([
        'customer_id' => null,
        'session_token' => 'old-token',
        'updated_at' => now()->subDays(8),
    ]);

    $recentGuestCart = Cart::query()->create([
        'customer_id' => null,
        'session_token' => 'recent-token',
        'updated_at' => now()->subDays(3),
    ]);

    $this->artisan('cart:clean')->assertSuccessful();

    expect(Cart::query()->find($oldGuestCart->id))->toBeNull();
    expect(Cart::query()->find($recentGuestCart->id))->not->toBeNull();
});

it('does not delete carts within retention period', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    $authCart = Cart::query()->create([
        'customer_id' => $customer->id,
        'updated_at' => now()->subDays(29),
    ]);

    $guestCart = Cart::query()->create([
        'customer_id' => null,
        'session_token' => 'token-fresh',
        'updated_at' => now()->subDays(6),
    ]);

    $this->artisan('cart:clean')->assertSuccessful();

    expect(Cart::query()->find($authCart->id))->not->toBeNull();
    expect(Cart::query()->find($guestCart->id))->not->toBeNull();
});

it('accepts custom day thresholds via options', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Test',
        'last_name' => 'User',
    ]);

    $cart = Cart::query()->create([
        'customer_id' => $customer->id,
        'updated_at' => now()->subDays(5),
    ]);

    $this->artisan('cart:clean', ['--auth-days' => 3])->assertSuccessful();

    expect(Cart::query()->find($cart->id))->toBeNull();
});
