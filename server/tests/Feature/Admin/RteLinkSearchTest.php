<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([RolePermissionSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('returns locale-aware internal link targets for RTE', function (): void {
    Page::factory()->published()->create([
        'title' => ['en' => 'About Studio', 'pl' => 'O pracowni'],
        'slug' => 'about-studio',
    ]);
    Product::factory()->create([
        'name' => ['en' => 'Studio Chair', 'pl' => 'Krzeslo Studio'],
        'slug' => 'studio-chair',
        'is_active' => true,
    ]);
    Category::factory()->create([
        'name' => ['en' => 'Studio Furniture', 'pl' => 'Meble Studio'],
        'slug' => 'studio-furniture',
        'is_active' => true,
    ]);
    BlogPost::factory()->published()->create([
        'title' => ['en' => 'Studio News', 'pl' => 'Wiadomosci Studio'],
        'slug' => 'studio-news',
    ]);

    actingAs($this->admin)
        ->getJson(route('admin.rte.links.search', ['q' => 'Studio', 'locale' => 'pl']))
        ->assertOk()
        ->assertJsonFragment([
            'type' => 'page',
            'label' => 'O pracowni',
            'url' => '/pl/about-studio',
        ])
        ->assertJsonFragment([
            'type' => 'product',
            'label' => 'Krzeslo Studio',
            'url' => '/pl/products/studio-chair',
        ])
        ->assertJsonFragment([
            'type' => 'category',
            'label' => 'Meble Studio',
            'url' => '/pl/categories/studio-furniture',
        ])
        ->assertJsonFragment([
            'type' => 'blog_post',
            'label' => 'Wiadomosci Studio',
            'url' => '/pl/blog/studio-news',
        ]);
});

it('requires at least two characters before searching', function (): void {
    actingAs($this->admin)
        ->getJson(route('admin.rte.links.search', ['q' => 'a']))
        ->assertOk()
        ->assertExactJson([]);
});

it('validates internal RTE links against published content', function (): void {
    Product::factory()->create([
        'name' => ['en' => 'Active Chair'],
        'slug' => 'active-chair',
        'is_active' => true,
    ]);
    Product::factory()->create([
        'name' => ['en' => 'Inactive Chair'],
        'slug' => 'inactive-chair',
        'is_active' => false,
    ]);
    Page::factory()->published()->create([
        'title' => ['en' => 'About'],
        'slug' => 'about',
    ]);
    BlogPost::factory()->published()->create([
        'title' => ['en' => 'News'],
        'slug' => 'news',
        'slug_translations' => ['pl' => 'wiadomosci'],
    ]);

    actingAs($this->admin)
        ->postJson(route('admin.rte.links.validate'), [
            'urls' => [
                '/en/products/active-chair',
                '/en/products/inactive-chair',
                '/en/products/missing',
                '/en/about',
                '/pl/blog/wiadomosci',
                'https://example.com/external',
            ],
        ])
        ->assertOk()
        ->assertJsonFragment(['url' => '/en/products/active-chair', 'valid' => true])
        ->assertJsonFragment(['url' => '/en/products/inactive-chair', 'valid' => false])
        ->assertJsonFragment(['url' => '/en/products/missing', 'valid' => false])
        ->assertJsonFragment(['url' => '/en/about', 'valid' => true])
        ->assertJsonFragment(['url' => '/pl/blog/wiadomosci', 'valid' => true])
        ->assertJsonFragment(['url' => 'https://example.com/external', 'valid' => true]);
});
