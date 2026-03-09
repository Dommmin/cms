<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'editor']);
});

test('guest cannot access cms pages', function () {
    $this->get('/admin/cms/pages')->assertNotFound();
});

test('editor can access cms pages index', function () {
    $user = User::factory()->create();
    $user->assignRole('editor');

    $this->actingAs($user)->get('/admin/cms/pages')->assertOk();
});

test('admin can create page', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->post('/admin/cms/pages', [
        'title' => 'Test Page',
        'slug' => 'test-page',
        'layout' => 'default',
        'page_type' => 'blocks',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('pages', [
        'slug' => 'test-page',
        'title->en' => 'Test Page',
    ]);
});

test('admin can publish and unpublish page', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $page = Page::query()->create([
        'title' => 'Publish Me',
        'slug' => 'publish-me',
        'layout' => 'default',
        'page_type' => 'blocks',
        'is_published' => false,
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->post("/admin/cms/pages/{$page->id}/publish")
        ->assertRedirect();

    expect($page->fresh()->is_published)->toBeTrue();

    $this->actingAs($user)
        ->post("/admin/cms/pages/{$page->id}/unpublish")
        ->assertRedirect();

    expect($page->fresh()->is_published)->toBeFalse();
});
