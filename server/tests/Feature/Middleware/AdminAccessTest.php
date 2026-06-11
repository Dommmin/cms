<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    config(['auth.test_require_two_factor' => true]);

    Route::middleware('admin')->get('/_test/admin-access', fn (): string => 'ok');

    foreach (['super-admin'] as $roleName) {
        Role::query()->firstOrCreate([
            'name' => $roleName,
            'guard_name' => 'web',
        ]);
    }
});

it('hides the admin panel from guests', function (): void {
    $this->get('/_test/admin-access')
        ->assertNotFound();
});

it('forbids authenticated users without an admin role', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/_test/admin-access')
        ->assertForbidden();
});

it('redirects admin users without two-factor authentication to the setup page', function (): void {
    $user = User::factory()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get('/_test/admin-access')
        ->assertRedirect(route('two-factor.show'));
});

it('allows authenticated users with an admin role', function (): void {
    $user = User::factory()->withTwoFactor()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get('/_test/admin-access')
        ->assertOk();
});
