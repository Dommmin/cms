<?php

declare(strict_types=1);

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

it('returns rss xml feed', function () {
    $this->get(route('blog.feed'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
});

it('includes published blog posts in feed', function () {
    $user = User::factory()->create(['name' => 'Author One']);

    BlogPost::factory()->create([
        'title' => ['en' => 'Hello World'],
        'slug' => 'hello-world',
        'excerpt' => ['en' => 'A great post'],
        'status' => BlogPostStatusEnum::Published,
        'published_at' => now()->subDay(),
        'user_id' => $user->id,
        'available_locales' => null,
    ]);

    $response = $this->get(route('blog.feed'));

    $response->assertOk()
        ->assertSee('Hello World', false)
        ->assertSee('hello-world', false);
});

it('does not include draft posts in feed', function () {
    BlogPost::factory()->create([
        'title' => ['en' => 'Secret Draft'],
        'slug' => 'secret-draft',
        'status' => BlogPostStatusEnum::Draft,
        'available_locales' => null,
    ]);

    $response = $this->get(route('blog.feed'));

    $response->assertOk()
        ->assertDontSee('Secret Draft', false);
});

it('filters posts by locale', function () {
    BlogPost::factory()->create([
        'title' => ['en' => 'English Only'],
        'slug' => 'english-only',
        'status' => BlogPostStatusEnum::Published,
        'published_at' => now()->subDay(),
        'available_locales' => ['en'],
    ]);

    BlogPost::factory()->create([
        'title' => ['en' => 'All Locales'],
        'slug' => 'all-locales',
        'status' => BlogPostStatusEnum::Published,
        'published_at' => now()->subDay(),
        'available_locales' => null,
    ]);

    $response = $this->get(route('blog.feed', ['locale' => 'pl']));

    $response->assertOk()
        ->assertSee('All Locales', false)
        ->assertDontSee('English Only', false);
});

it('caches the feed for 1 hour', function () {
    $cacheKey = 'blog_rss_feed_en';

    expect(Cache::has($cacheKey))->toBeFalse();

    $this->get(route('blog.feed'));

    expect(Cache::has($cacheKey))->toBeTrue();
});
