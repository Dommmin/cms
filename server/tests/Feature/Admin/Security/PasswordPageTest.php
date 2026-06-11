<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate([
        'name' => 'super-admin',
        'guard_name' => 'web',
    ]);
});

it('renders the admin password page for admin users with two-factor enabled', function (): void {
    $user = User::factory()->withTwoFactor()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('admin.security.password.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/security/password')
        );
});
