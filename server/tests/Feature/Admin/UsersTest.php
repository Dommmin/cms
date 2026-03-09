<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'editor']);
});

test('guest cannot access users index', function () {
    $this->get('/admin/users')->assertNotFound();
});

test('user without role cannot access users index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertNotFound();
});

test('editor cannot manage users', function () {
    $user = User::factory()->create();
    $user->assignRole('editor');

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertForbidden();
});

test('admin can access users index', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertOk();
});

test('admin can create a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/admin/users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});

test('admin can update a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
    ]);

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", [
        'name' => 'New Name',
        'email' => 'new@example.com',
        'password' => '',
        'password_confirmation' => '',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'New Name',
        'email' => 'new@example.com',
    ]);
});
