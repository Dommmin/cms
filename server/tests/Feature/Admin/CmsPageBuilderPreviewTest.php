<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'editor']);
});

test('guest cannot access page builder preview', function () {
    $page = Page::factory()->create();

    $this->get("/admin/cms/pages/{$page->id}/preview")->assertNotFound();
});

test('user without role cannot access page builder preview', function () {
    $user = User::factory()->create();
    $page = Page::factory()->create();

    $this->actingAs($user)
        ->get("/admin/cms/pages/{$page->id}/preview")
        ->assertNotFound();
});

test('admin can access page builder preview', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');
    $page = Page::factory()->create();

    $this->actingAs($user)
        ->get("/admin/cms/pages/{$page->id}/preview")
        ->assertOk()
        ->assertInertia(fn ($assert) => $assert
            ->component('admin/cms/pages/page-preview')
            ->has('page')
            ->has('sections')
        );
});

test('editor can access page builder preview', function () {
    $user = User::factory()->create();
    $user->assignRole('editor');
    $page = Page::factory()->create();

    $this->actingAs($user)
        ->get("/admin/cms/pages/{$page->id}/preview")
        ->assertOk()
        ->assertInertia(fn ($assert) => $assert
            ->component('admin/cms/pages/page-preview')
        );
});

test('page builder preview returns 404 for non-existent page', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/admin/cms/pages/99999/preview')
        ->assertNotFound();
});

test('page builder preview returns page data with active sections only', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');
    $page = Page::factory()->create();

    $this->actingAs($user)
        ->get("/admin/cms/pages/{$page->id}/preview")
        ->assertOk()
        ->assertInertia(fn ($assert) => $assert
            ->component('admin/cms/pages/page-preview')
            ->where('page.id', $page->id)
            ->where('page.title', $page->title)
            ->where('page.slug', $page->slug)
            ->where('sections', [])
        );
});
