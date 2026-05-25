<?php

declare(strict_types=1);

use App\Models\BlogPost;

it('exposes localized published article seo fields', function (): void {
    BlogPost::factory()->published()->create([
        'title' => ['pl' => 'Polski poradnik SEO', 'en' => 'English SEO Guide'],
        'slug' => ['pl' => 'polski-poradnik-seo', 'en' => 'english-seo-guide'],
        'excerpt' => ['pl' => 'Polski opis meta', 'en' => 'English meta description'],
        'content' => ['pl' => '<h2>Wstęp</h2>', 'en' => '<h2>Introduction</h2>'],
        'available_locales' => ['pl', 'en'],
        'seo_title' => 'English SEO Guide',
        'seo_description' => 'English meta description',
        'canonical_url' => 'https://example.com/en/blog/english-seo-guide',
        'og_image' => 'https://example.com/og.png',
    ]);

    $this->getJson('/api/v1/blog/posts/english-seo-guide?locale=en')
        ->assertOk()
        ->assertJsonPath('title', 'English SEO Guide')
        ->assertJsonPath('slug', 'english-seo-guide')
        ->assertJsonPath('canonical_slug', 'english-seo-guide')
        ->assertJsonPath('slug_translations.en', 'english-seo-guide')
        ->assertJsonPath('available_locales.0', 'pl')
        ->assertJsonPath('canonical_url', 'https://example.com/en/blog/english-seo-guide')
        ->assertJsonPath('published_at', fn (?string $value): bool => $value !== null)
        ->assertJsonPath('updated_at', fn (?string $value): bool => $value !== null);
});

it('does not expose draft articles to crawlers through the public api', function (): void {
    BlogPost::factory()->draft()->create([
        'title' => ['en' => 'Draft Article'],
        'slug' => ['en' => 'draft-article'],
        'available_locales' => ['en'],
    ]);

    $this->getJson('/api/v1/blog/posts/draft-article?locale=en')
        ->assertNotFound();
});

it('audits and fills missing generated seo fields without overwriting manual values', function (): void {
    $post = BlogPost::factory()->published()->create([
        'title' => ['pl' => 'Polski tytuł', 'en' => 'English Production Checklist'],
        'slug' => ['pl' => 'polski-tytul', 'en' => ''],
        'excerpt' => ['en' => 'A practical checklist for production deployments and troubleshooting.'],
        'content' => ['en' => str_repeat('word ', 420)],
        'available_locales' => ['pl', 'en'],
        'seo_title' => 'Manual SEO Title',
        'seo_description' => null,
        'reading_time' => null,
    ]);

    $this->artisan('blog:seo-audit --fix')
        ->assertSuccessful();

    $post->refresh();

    expect($post->seo_title)->toBe('Manual SEO Title')
        ->and($post->seo_description)->toBe('A practical checklist for production deployments and troubleshooting.')
        ->and($post->reading_time)->toBe(3)
        ->and($post->getTranslations('slug'))->toHaveKey('en', 'english-production-checklist')
        ->and($post->translation_group_id)->not->toBeNull();
});
