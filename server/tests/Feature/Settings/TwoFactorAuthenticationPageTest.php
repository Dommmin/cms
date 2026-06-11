<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    config(['fortify-options.two-factor-authentication.confirmPassword' => false]);

    foreach (['super-admin', 'viewer'] as $roleName) {
        Role::query()->firstOrCreate([
            'name' => $roleName,
            'guard_name' => 'web',
        ]);
    }
});

it('marks the two factor page as admin mode for admin panel users', function (): void {
    $user = User::factory()->withTwoFactor()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('two-factor.show'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/two-factor')
            ->where('adminMode', true)
            ->where('twoFactorEnabled', true)
        );
});

it('keeps the two factor page in standard mode for regular users', function (): void {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->get(route('two-factor.show'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/two-factor')
            ->where('adminMode', false)
            ->where('twoFactorEnabled', true)
        );
});
