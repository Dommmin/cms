<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});

test('admin can view trashed users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $deleted = User::factory()->create(['name' => 'Gone User']);
    $deleted->delete();

    $this->actingAs($admin)
        ->get('/admin/users/trashed')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/trashed'));
});

test('trashed page lists soft-deleted users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $deleted = User::factory()->create(['name' => 'Gone User']);
    $deleted->delete();

    $response = $this->actingAs($admin)
        ->get('/admin/users/trashed')
        ->assertOk();

    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/users/trashed')
            ->has('users.data', 1)
    );
});

test('admin can restore a soft-deleted user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $user->delete();

    $this->assertSoftDeleted('users', ['id' => $user->id]);

    $this->actingAs($admin)
        ->post("/admin/users/{$user->id}/restore")
        ->assertRedirect();

    $this->assertNotSoftDeleted('users', ['id' => $user->id]);
});

test('restore also restores soft-deleted customer', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);

    $user->delete();
    $customer->delete();

    $this->actingAs($admin)
        ->post("/admin/users/{$user->id}/restore")
        ->assertRedirect();

    $this->assertNotSoftDeleted('users', ['id' => $user->id]);
    $this->assertNotSoftDeleted('customers', ['id' => $customer->id]);
});

test('admin can force-delete a soft-deleted user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $user->delete();

    $this->actingAs($admin)
        ->delete("/admin/users/{$user->id}/force-delete")
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('non-admin cannot access trashed users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/users/trashed')
        ->assertNotFound();
});
