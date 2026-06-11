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

it('does not expose the admin pwa manifest to guests', function (): void {
    $this->get('/login')
        ->assertOk()
        ->assertDontSee('/manifest.json')
        ->assertDontSee('/sw.js');
});

it('exposes the admin pwa manifest to authenticated admins', function (): void {
    $user = User::factory()->withTwoFactor()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertSee('/manifest.json')
        ->assertSee('/sw.js');
});
