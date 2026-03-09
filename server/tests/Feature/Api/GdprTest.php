<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Customer;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('exports user personal data', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/profile/export');

    $response->assertOk();
    $response->assertJsonStructure([
        'exported_at',
        'account' => ['name', 'email', 'created_at'],
        'orders',
        'reviews',
    ]);
    expect($response->json('account.email'))->toBe($user->email);
});

it('exports correct address field names', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    Address::factory()->create([
        'customer_id' => $customer->id,
        'street' => '123 Main St',
        'city' => 'Warsaw',
        'postal_code' => '00-001',
        'country_code' => 'PL',
    ]);
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/profile/export');

    $response->assertOk();
    $address = $response->json('profile.addresses.0');
    expect($address)->toHaveKey('street');
    expect($address)->toHaveKey('postal_code');
    expect($address)->toHaveKey('country_code');
    expect($address)->not->toHaveKey('line1');
    expect($address)->not->toHaveKey('state');
    expect($address)->not->toHaveKey('country');
});

it('soft-deletes user account and anonymizes PII on deletion', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    $id = $user->id;
    Sanctum::actingAs($user);

    $response = $this->deleteJson('/api/v1/profile', ['password' => 'password']);

    $response->assertOk();
    $response->assertJsonFragment(['message' => 'Account deleted successfully']);

    // User should be soft-deleted, not hard-deleted
    $this->assertSoftDeleted('users', ['id' => $id]);

    // PII should be anonymized
    $this->assertDatabaseHas('users', [
        'id' => $id,
        'email' => "deleted+{$id}@deleted.invalid",
    ]);
});

it('soft-deletes customer when account is deleted', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    Sanctum::actingAs($user);

    $this->deleteJson('/api/v1/profile', ['password' => 'password'])
        ->assertOk();

    $this->assertSoftDeleted('customers', ['id' => $customer->id]);
});

it('deletes addresses when account is deleted', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    $address = Address::factory()->create(['customer_id' => $customer->id]);
    Sanctum::actingAs($user);

    $this->deleteJson('/api/v1/profile', ['password' => 'password'])
        ->assertOk();

    $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
});

it('rejects account deletion with wrong password', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    Sanctum::actingAs($user);

    $response = $this->deleteJson('/api/v1/profile', ['password' => 'wrong-password']);

    $response->assertUnprocessable();
    $this->assertDatabaseHas('users', ['id' => $user->id, 'deleted_at' => null]);
});

it('requires authentication for data export', function () {
    $this->getJson('/api/v1/profile/export')->assertUnauthorized();
});

it('requires authentication for account deletion', function () {
    $this->deleteJson('/api/v1/profile', ['password' => 'anything'])->assertUnauthorized();
});
