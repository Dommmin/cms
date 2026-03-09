<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('displays category edit page with parent selection list', function () {
    $parent = Category::query()->create([
        'name' => 'Parent Category',
        'slug' => 'parent-category',
        'is_active' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Child Category',
        'slug' => 'child-category',
        'parent_id' => $parent->id,
        'is_active' => true,
    ]);

    $this->get("/admin/ecommerce/categories/{$category->id}/edit")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/ecommerce/categories/edit')
            ->where('category.id', $category->id)
            ->has('categories', 1)
        );
});

it('does not allow category show route via get', function () {
    $category = Category::query()->create([
        'name' => 'Standalone Category',
        'slug' => 'standalone-category',
        'is_active' => true,
    ]);

    $this->get("/admin/ecommerce/categories/{$category->id}")
        ->assertMethodNotAllowed();
});

it('creates category with auto-generated slug from name when slug is not provided', function () {
    $response = $this->post('/admin/ecommerce/categories', [
        'name' => 'Kategoria Testowa',
        'is_active' => '1',
    ]);

    $response->assertRedirect('/admin/ecommerce/categories');

    $this->assertDatabaseHas('categories', [
        'name->en' => 'Kategoria Testowa',
        'slug' => 'kategoria-testowa',
    ]);
});
