<?php

declare(strict_types=1);

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

use function Pest\Laravel\get;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->category = BlogCategory::factory()->create();
});

it('returns valid RSS XML', function (): void {
    BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = get(route('blog.feed'));

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
    expect($response->getContent())
        ->toStartWith('<?xml version="1.0" encoding="UTF-8"?>')
        ->toContain('<rss version="2.0"')
        ->toContain('<channel>');
});

it('includes only published posts', function (): void {
    $published = BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
        'title' => ['en' => 'Published Post'],
    ]);

    BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'draft',
        'title' => ['en' => 'Draft Post'],
    ]);

    $response = get(route('blog.feed'));

    expect($response->getContent())
        ->toContain('Published Post')
        ->not->toContain('Draft Post');
});

it('respects locale parameter', function (): void {
    BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
        'title' => ['en' => 'English Title', 'pl' => 'Polski Tytuł'],
        'available_locales' => ['en', 'pl'],
    ]);

    $responseEn = get(route('blog.feed', ['locale' => 'en']));
    expect($responseEn->getContent())->toContain('English Title');

    $responsePl = get(route('blog.feed', ['locale' => 'pl']));
    expect($responsePl->getContent())->toContain('Polski Tytuł');
});

it('hides posts not available in locale', function (): void {
    BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
        'title' => ['en' => 'English Only'],
        'available_locales' => ['en'],
    ]);

    BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
        'title' => ['en' => 'Polish Only', 'pl' => 'Polski Tytuł'],
        'available_locales' => ['pl'],
    ]);

    $response = get(route('blog.feed', ['locale' => 'pl']));

    expect($response->getContent())
        ->toContain('Polski Tytuł')
        ->not->toContain('English Only');
});

it('includes author name when available', function (): void {
    $author = User::factory()->create(['name' => 'John Doe']);

    BlogPost::factory()->create([
        'user_id' => $author->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = get(route('blog.feed'));

    expect($response->getContent())->toContain('<author>John Doe</author>');
});

it('caches feed output', function (): void {
    BlogPost::factory()->create([
        'user_id' => $this->user->id,
        'blog_category_id' => $this->category->id,
        'status' => 'published',
        'published_at' => now(),
    ]);

    get(route('blog.feed'));
    get(route('blog.feed'));

    expect(Cache::get('blog_rss_feed_en'))->not->toBeNull();
});
