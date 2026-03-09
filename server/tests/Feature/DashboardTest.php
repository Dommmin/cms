<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'editor']);
});

test('guests cannot access the dashboard', function () {
    $response = $this->get(route('admin.dashboard'));
    $response->assertNotFound();
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('admin.dashboard'));
    $response->assertOk();
});
