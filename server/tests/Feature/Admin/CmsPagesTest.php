<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'editor']);
});

test('guest cannot access cms pages index', function () {
    $this->get('/admin/cms/pages')->assertNotFound();
});

test('user without role cannot access cms pages index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/cms/pages')
        ->assertNotFound();
});

test('admin can access cms pages index', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/admin/cms/pages')
        ->assertOk();
});

test('editor can access cms pages index', function () {
    $user = User::factory()->create();
    $user->assignRole('editor');

    $this->actingAs($user)
        ->get('/admin/cms/pages')
        ->assertOk();
});
