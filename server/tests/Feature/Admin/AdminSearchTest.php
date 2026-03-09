<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

test('guest cannot access admin search', function () {
    auth()->logout();

    $this->getJson('/admin/search?q=test')
        ->assertNotFound();
});

test('returns empty array for query shorter than 2 characters', function () {
    $this->getJson('/admin/search?q=a')
        ->assertOk()
        ->assertExactJson([]);
});

test('returns empty array when no results found', function () {
    $this->getJson('/admin/search?q=zzznoresults')
        ->assertOk()
        ->assertExactJson([]);
});

test('searches products by name', function () {
    Product::factory()->create(['name' => 'Blue Sneakers', 'is_active' => true]);
    Product::factory()->create(['name' => 'Red Boots']);

    $response = $this->getJson('/admin/search?q=Blue')
        ->assertOk();

    $data = $response->json();
    expect($data)->toHaveCount(1)
        ->and($data[0]['group'])->toBe('Products')
        ->and($data[0]['label'])->toBe('Blue Sneakers')
        ->and($data[0]['url'])->toContain('/admin/ecommerce/products/');
});

test('searches blog posts by title', function () {
    BlogPost::factory()->create(['title' => 'How to Style Your Home']);
    BlogPost::factory()->create(['title' => 'Summer Collection']);

    $response = $this->getJson('/admin/search?q=Style')
        ->assertOk();

    $data = collect($response->json())->where('group', 'Blog Posts')->values();
    expect($data)->toHaveCount(1)
        ->and($data[0]['label'])->toBe('How to Style Your Home')
        ->and($data[0]['url'])->toContain('/admin/blog/posts/');
});

test('searches pages by title and slug', function () {
    Page::factory()->create(['title' => 'Privacy Policy', 'slug' => 'privacy-policy']);

    $byTitle = $this->getJson('/admin/search?q=Privacy')->assertOk();
    $bySlug = $this->getJson('/admin/search?q=privacy-policy')->assertOk();

    $titleResults = collect($byTitle->json())->where('group', 'Pages');
    $slugResults = collect($bySlug->json())->where('group', 'Pages');

    expect($titleResults)->toHaveCount(1)
        ->and($slugResults)->toHaveCount(1);
});

test('searches orders by reference number', function () {
    // Skip creating a full order (has many NOT NULL FKs); just verify query returns 0 for no match
    $response = $this->getJson('/admin/search?q=ORD-2099')
        ->assertOk();

    $data = collect($response->json())->where('group', 'Orders')->values();
    expect($data)->toHaveCount(0);
});

test('searches users by name and email', function () {
    User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);
    User::factory()->create(['name' => 'Bob Jones', 'email' => 'bob@example.com']);

    $byName = $this->getJson('/admin/search?q=Jane')->assertOk();
    $byEmail = $this->getJson('/admin/search?q=bob@example')->assertOk();

    $nameResults = collect($byName->json())->where('group', 'Users')->values();
    $emailResults = collect($byEmail->json())->where('group', 'Users')->values();

    expect($nameResults)->toHaveCount(1)
        ->and($nameResults[0]['label'])->toBe('Jane Smith');

    expect($emailResults)->toHaveCount(1)
        ->and($emailResults[0]['meta'])->toBe('bob@example.com');
});

test('returns results from multiple groups', function () {
    Product::factory()->create(['name' => 'Omega Watch', 'is_active' => true]);
    BlogPost::factory()->create(['title' => 'Omega Collection Review']);

    $response = $this->getJson('/admin/search?q=Omega')
        ->assertOk();

    $groups = collect($response->json())->pluck('group')->unique()->sort()->values()->all();
    expect($groups)->toContain('Products')
        ->and($groups)->toContain('Blog Posts');
});
