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
