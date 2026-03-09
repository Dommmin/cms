<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Role;

test('login page returns a successful response', function () {
    $response = $this->get(route('login'));
    $response->assertOk();
});

test('admin dashboard is accessible to admin users', function () {
    Role::firstOrCreate(['name' => 'admin']);

    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('admin.dashboard'));
    $response->assertOk();
});
