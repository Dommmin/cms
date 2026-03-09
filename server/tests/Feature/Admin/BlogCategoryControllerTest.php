<?php

declare(strict_types=1);

use App\Models\BlogCategory;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

it('displays blog categories index page', function () {
    BlogCategory::factory()->count(3)->create();

    $response = $this->get('/admin/blog/categories');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/blog/categories/index')
            ->has('categories.data', 3)
        );
});

it('displays blog category create page', function () {
    $response = $this->get('/admin/blog/categories/create');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/blog/categories/create')
            ->has('parentCategories')
        );
});

it('stores a new blog category', function () {
    $data = [
        'name' => 'Technology',
        'is_active' => true,
    ];

    $response = $this->post('/admin/blog/categories', $data);

    $response->assertRedirect('/admin/blog/categories')
        ->assertSessionHas('success', 'Blog category created successfully');

    $this->assertDatabaseHas('blog_categories', [
        'name' => 'Technology',
        'slug' => 'technology',
    ]);
});

it('auto-generates slug on store when not provided', function () {
    $data = ['name' => 'My Category Name'];

    $this->post('/admin/blog/categories', $data);

    $this->assertDatabaseHas('blog_categories', [
        'name' => 'My Category Name',
        'slug' => 'my-category-name',
    ]);
});

it('displays blog category edit page', function () {
    $category = BlogCategory::factory()->create();

    $response = $this->get("/admin/blog/categories/{$category->id}/edit");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/blog/categories/edit')
            ->where('category.id', $category->id)
            ->has('parentCategories')
        );
});

it('updates an existing blog category', function () {
    $category = BlogCategory::factory()->create(['name' => 'Old Name']);

    $data = [
        'name' => 'New Name',
        'is_active' => true,
    ];

    $response = $this->put("/admin/blog/categories/{$category->id}", $data);

    $response->assertRedirect()->assertSessionHas('success', 'Blog category updated successfully');

    $this->assertDatabaseHas('blog_categories', [
        'id' => $category->id,
        'name' => 'New Name',
    ]);
});

it('deletes a blog category', function () {
    $category = BlogCategory::factory()->create();

    $response = $this->delete("/admin/blog/categories/{$category->id}");

    $response->assertRedirect()->assertSessionHas('success', 'Blog category deleted successfully');

    $this->assertDatabaseMissing('blog_categories', ['id' => $category->id]);
});
