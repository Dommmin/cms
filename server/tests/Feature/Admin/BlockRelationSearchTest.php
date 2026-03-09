<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Faq;
use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
});

test('guest cannot access block relation search', function () {
    $this->getJson('/admin/block-relations/search?type=category')
        ->assertNotFound();
});

test('admin can search categories', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'is_active' => true]);
    Category::create(['name' => 'Clothing', 'slug' => 'clothing', 'is_active' => true]);

    $response = $this->actingAs($user)
        ->getJson('/admin/block-relations/search?type=category&q=Elec')
        ->assertOk();

    $data = $response->json();
    expect($data)->toHaveCount(1);
    expect($data[0]['name'])->toBe('Electronics');
});

test('admin can search with empty query returning all results', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    foreach (['Alpha', 'Beta', 'Gamma'] as $name) {
        Category::create(['name' => $name, 'slug' => mb_strtolower($name), 'is_active' => true]);
    }

    $response = $this->actingAs($user)
        ->getJson('/admin/block-relations/search?type=category')
        ->assertOk();

    expect($response->json())->toHaveCount(3);
});

test('admin can search faqs', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    Faq::factory()->create(['question' => 'What is the return policy?']);
    Faq::factory()->create(['question' => 'How do I track my order?']);

    $response = $this->actingAs($user)
        ->getJson('/admin/block-relations/search?type=faq&q=return')
        ->assertOk();

    $data = $response->json();
    expect($data)->toHaveCount(1);
    expect($data[0]['name'])->toContain('return');
});

test('admin can search pages', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    Page::factory()->create(['title' => 'About Us']);

    $response = $this->actingAs($user)
        ->getJson('/admin/block-relations/search?type=page&q=About')
        ->assertOk();

    expect($response->json()[0]['name'])->toBe('About Us');
});

test('unknown relation type returns empty array', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->getJson('/admin/block-relations/search?type=unknown_type')
        ->assertOk()
        ->assertExactJson([]);
});
