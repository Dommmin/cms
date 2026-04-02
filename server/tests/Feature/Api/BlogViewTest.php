<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\BlogPostView;

describe('Blog Views', function (): void {
    it('records a view and increments views_count', function (): void {
        $post = BlogPost::factory()->published()->create(['views_count' => 0]);

        $this->postJson("/api/v1/blog/posts/{$post->slug}/view")
            ->assertOk()
            ->assertJsonPath('views_count', 1);

        expect($post->fresh()->views_count)->toBe(1);
    });

    it('does not record duplicate view within 24 hours', function (): void {
        $post = BlogPost::factory()->published()->create(['views_count' => 0]);

        // First view
        $this->postJson("/api/v1/blog/posts/{$post->slug}/view")->assertOk();

        // Second view from same IP within 24h
        $this->postJson("/api/v1/blog/posts/{$post->slug}/view")->assertOk();

        expect($post->fresh()->views_count)->toBe(1);
    });

    it('returns views_count in post show response', function (): void {
        $post = BlogPost::factory()->published()->create(['views_count' => 42]);

        $this->getJson("/api/v1/blog/posts/{$post->slug}")
            ->assertOk()
            ->assertJsonPath('views_count', 42);
    });

    it('blog list supports sort=popular', function (): void {
        $popular = BlogPost::factory()->published()->create(['views_count' => 100]);
        $unpopular = BlogPost::factory()->published()->create(['views_count' => 1]);

        $this->getJson('/api/v1/blog/posts?sort=popular')
            ->assertOk()
            ->assertJsonPath('data.0.id', $popular->id);
    });
});
